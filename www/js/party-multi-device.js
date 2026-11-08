// js/party-multi-device.js
// Kafana Tak! - Standart Passaparola Tipi Çoklu Cihaz & QR Yönetim Modülü
// Tüm parti oyunlarında (Passaparola, Çarkıfelek, İsim Şehir, Kelime İşlem, Aileler Yarışıyor,
// Vampir Köylü, Saatli Bomba, Şişe Çevirmece, Kelime Bombası, Ters Ses) tek tip, kusursuz deneyim sağlar.

import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';
import { HostModerationPanel } from './host-moderation-panel.js';
import { sounds } from './audio.js';

export class PartyMultiDeviceHelper {
  /**
   * @param {Object} config
   * @param {string} config.namespace - Firebase namespace (örn: 'passaparola', 'bomb', 'bottle')
   * @param {string} config.title - Oyun başlığı (örn: 'Saatli Bomba Masası')
   * @param {string} config.subtitle - QR altında beliren gizlilik ve rol açıklaması
   * @param {string} config.prefix - DOM ID ön eki (örn: 'bomb', 'bottle', 'ters')
   * @param {Function} [config.getJoinUrl] - İsteğe bağlı özel URL üretici
   * @param {Function} [config.onPlayerCountChange] - Bağlı oyuncu sayısı değiştiğinde tetiklenir
   */
  constructor(config) {
    this.namespace = config.namespace;
    this.title = config.title || 'Parti Oyunu';
    this.subtitle = config.subtitle || '☁️ Bağlananlar oyunu canlı takip eder, telefonlarından katılır!';
    this.prefix = config.prefix || config.namespace.replace(/[^a-z0-9]/gi, '');
    this.getJoinUrl = config.getJoinUrl || ((code) => firebaseNetwork.getGameUrl(this.namespace, code));
    this.onPlayerCountChange = config.onPlayerCountChange || null;

    this.mode = 'local'; // 'local' | 'wifi'
    this.roomId = null;
    this.connectedPlayers = [];
    this.unsub = null;
  }

  /**
   * Oyun ayar ekranına Passaparola standardında [ Tek Cihaz | Çoklu Cihaz ] seçici ve Wi-Fi kutusu HTML'i üretir
   */
  renderSetupHTML() {
    return `
      <!-- Mod Seçimi (Passaparola Standardı) -->
      <div style="display:flex; gap:10px; margin-bottom:12px;" class="pmd-mode-switcher" data-prefix="${this.prefix}">
        <button type="button" id="btn-${this.prefix}-mode-local" class="btn-main active" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(0,245,212,0.18); border:1.5px solid var(--primary); color:#FFF; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
          <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">🎲 Tek Cihaz</div>
          <div style="font-size:0.72rem; font-weight:700; color:var(--gold); opacity:0.95;">Masada Oyna</div>
        </button>
        <button type="button" id="btn-${this.prefix}-mode-wifi" class="btn-main" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); color:var(--text-dim); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
          <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">☁️ Çoklu Cihaz</div>
          <div style="font-size:0.72rem; font-weight:700; color:var(--primary); opacity:0.85;">Bulut / QR Bağlantı</div>
        </button>
      </div>

      <!-- Wi-Fi / Bulut Bağlantı Kutusu -->
      <div id="${this.prefix}-wifi-box" style="display:none; background:rgba(0,0,0,0.4); border:1.5px solid rgba(0,245,212,0.3); border-radius:18px; padding:14px; margin-bottom:14px; text-align:center;">
        <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">ARKADAŞLARIN BU QR'I OKUTARAK CANLI EKRANA BAĞLANSIN:</div>
        <div style="font-size:0.76rem; color:#00F5D4; font-weight:800; margin-bottom:8px;">${this.subtitle}</div>
        
        <div id="${this.prefix}-qr-canvas" style="display:inline-block; margin:6px auto 8px; border:2.5px solid var(--primary); border-radius:14px; padding:8px; background:#FFFFFF; box-shadow:0 0 25px rgba(0,245,212,0.4);"></div>
        
        <div style="font-size:1.15rem; font-weight:900; color:var(--gold); margin-top:4px;">
          ODA KODU: <span id="lbl-${this.prefix}-room-code" style="letter-spacing:3px;">----</span>
        </div>

        <div style="display:flex; justify-content:center; gap:8px; margin-top:8px; flex-wrap:wrap;">
          <button type="button" id="btn-copy-${this.prefix}-link" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:6px 14px; border-radius:999px; cursor:pointer;">
            📋 Bağlantıyı Kopyala
          </button>
          <button type="button" id="btn-${this.prefix}-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 14px; border-radius:999px; cursor:pointer;">
            🛡️ Hakem / Oda Yönetimi
          </button>
        </div>

        <div id="${this.prefix}-player-count-badge" style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-top:8px;">0 Oyuncu Bağlı</div>
        <div id="${this.prefix}-connected-players" style="margin-top:6px; display:flex; flex-wrap:wrap; justify-content:center; gap:4px;"></div>
      </div>
    `;
  }

  /**
   * DOM elemanlarına tıklama ve mod değişim dinleyicilerini bağlar
   */
  bindEvents(onModeChange = null) {
    const btnLocal = document.getElementById(`btn-${this.prefix}-mode-local`);
    const btnWifi = document.getElementById(`btn-${this.prefix}-mode-wifi`);
    const wifiBox = document.getElementById(`${this.prefix}-wifi-box`);
    const btnCopy = document.getElementById(`btn-copy-${this.prefix}-link`);
    const btnMod = document.getElementById(`btn-${this.prefix}-mod-open`);

    if (btnLocal) {
      btnLocal.onclick = () => {
        sounds.playClick();
        this.mode = 'local';
        btnLocal.classList.add('active');
        btnLocal.style.background = 'rgba(0,245,212,0.18)';
        btnLocal.style.borderColor = 'var(--primary)';
        btnLocal.style.color = '#FFF';

        if (btnWifi) {
          btnWifi.classList.remove('active');
          btnWifi.style.background = 'rgba(255,255,255,0.06)';
          btnWifi.style.borderColor = 'rgba(255,255,255,0.15)';
          btnWifi.style.color = 'var(--text-dim)';
        }

        if (wifiBox) wifiBox.style.display = 'none';
        this.stopRoom();
        if (onModeChange) onModeChange('local');
      };
    }

    if (btnWifi) {
      btnWifi.onclick = async () => {
        sounds.playClick();
        this.mode = 'wifi';
        btnWifi.classList.add('active');
        btnWifi.style.background = 'rgba(0,245,212,0.18)';
        btnWifi.style.borderColor = 'var(--primary)';
        btnWifi.style.color = '#FFF';

        if (btnLocal) {
          btnLocal.classList.remove('active');
          btnLocal.style.background = 'rgba(255,255,255,0.06)';
          btnLocal.style.borderColor = 'rgba(255,255,255,0.15)';
          btnLocal.style.color = 'var(--text-dim)';
        }

        if (wifiBox) wifiBox.style.display = 'block';
        await this.createWifiRoom();
        if (onModeChange) onModeChange('wifi');
      };
    }

    if (btnCopy) {
      btnCopy.onclick = async () => {
        sounds.playClick();
        const url = this.getJoinUrl(this.roomId || 'PARTI');
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
          } else {
            prompt('Oyun Bağlantısı:', url);
          }
          btnCopy.textContent = '✅ Kopyalandı!';
          setTimeout(() => {
            if (btnCopy) btnCopy.textContent = '📋 Bağlantıyı Kopyala';
          }, 2000);
        } catch (e) {
          prompt('Oyun Bağlantısı:', url);
        }
      };
    }

    if (btnMod) {
      btnMod.onclick = (e) => {
        e.stopPropagation();
        sounds.playClick();
        HostModerationPanel.open({
          namespace: this.namespace,
          roomId: this.roomId || 'PARTI',
          title: this.title
        });
      };
    }
  }

  /**
   * Firebase üzerinde oda kurar, QR kodunu çizer ve gerçek zamanlı dinlemeyi başlatır
   */
  async createWifiRoom(initialData = {}) {
    this.mode = 'wifi';
    this.roomId = firebaseNetwork.generateRoomCode();

    const lblCode = document.getElementById(`lbl-${this.prefix}-room-code`);
    if (lblCode) lblCode.textContent = this.roomId;

    const joinUrl = this.getJoinUrl(this.roomId);
    const cvsContainer = document.getElementById(`${this.prefix}-qr-canvas`);
    if (cvsContainer) {
      cvsContainer.innerHTML = '';
      const cvs = document.createElement('canvas');
      cvs.width = 180;
      cvs.height = 180;
      cvs.style.display = 'block';
      cvsContainer.appendChild(cvs);

      const qrEngine = (typeof QRCode !== 'undefined' && QRCode) || (typeof window !== 'undefined' && window.QRCode);
      if (qrEngine && qrEngine.toCanvas) {
        qrEngine.toCanvas(cvs, joinUrl, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        }).catch(err => {
          cvsContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}" width="180" height="180" style="display:block; border-radius:8px; background:#FFF;" />`;
        });
      } else {
        cvsContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}" width="180" height="180" style="display:block; border-radius:8px; background:#FFF;" />`;
      }
    }

    const payload = {
      roomId: this.roomId,
      namespace: this.namespace,
      title: this.title,
      phase: 'lobby',
      createdAt: Date.now(),
      lastActive: Date.now(),
      players: {},
      ...initialData
    };

    await firebaseNetwork.createRoom(this.namespace, payload);

    // Odayı dinle ve bağlanan oyuncuları güncelle
    this.stopListening();
    this.unsub = firebaseNetwork.listenRoom(this.namespace, this.roomId, (room) => {
      if (!room) return;
      const pList = room.players ? Object.values(room.players) : [];
      this.connectedPlayers = pList;

      const badge = document.getElementById(`${this.prefix}-player-count-badge`);
      if (badge) {
        badge.textContent = `${pList.length} Oyuncu Bağlı`;
      }

      const chipsBox = document.getElementById(`${this.prefix}-connected-players`);
      if (chipsBox) {
        chipsBox.innerHTML = pList.map(p => `
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; font-weight:800; background:rgba(0,245,212,0.12); border:1px solid rgba(0,245,212,0.3); color:#00F5D4; padding:3px 8px; border-radius:999px; margin:2px;">
            <span>${p.avatar || '👤'}</span>
            <span>${p.name || 'Oyuncu'}</span>
          </span>
        `).join('');
      }

      if (this.onPlayerCountChange) {
        this.onPlayerCountChange(pList.length, pList);
      }
    });

    return this.roomId;
  }

  async updateRoomState(patch) {
    if (!this.roomId || this.mode !== 'wifi') return false;
    return await firebaseNetwork.updateRoom(this.namespace, this.roomId, patch);
  }

  stopListening() {
    if (this.unsub) {
      try { this.unsub(); } catch (e) {}
      this.unsub = null;
    }
  }

  stopRoom() {
    this.stopListening();
    if (this.roomId && this.mode === 'wifi') {
      firebaseNetwork.closeRoom(this.namespace, this.roomId).catch(() => {});
    }
    this.roomId = null;
    this.connectedPlayers = [];
  }
}
