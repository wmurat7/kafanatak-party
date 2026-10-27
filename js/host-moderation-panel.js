// js/host-moderation-panel.js - Kafana Tak! Merkezi Oda & Oyuncu Yönetim Paneli
// Tüm oyunlarda (Seyirci, İsim-Şehir, Aileler Yarışıyor, Kelime-İşlem, Köylü-Vampir, Şarkı-Düello, vb.)
// ana telefonun (host) odayı, oyuncuları, ikazları ve güvenliği tek merkezden yönetmesini sağlar.

import { firebaseNetwork } from './firebase-network.js';

class HostModerationPanelController {
  constructor() {
    this.currentNamespace = '';
    this.currentRoomId = '';
    this.currentTitle = '';
    this.roomUnsubscribe = null;
    this.currentRoomData = null;
    this.activeTab = 'players'; // 'players' | 'actions' | 'logs'
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.injectStyles();
    this.createModalDOM();
    this.initialized = true;
  }

  injectStyles() {
    if (document.getElementById('host-moderation-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'host-moderation-panel-styles';
    style.textContent = `
      .host-mod-overlay {
        position: fixed;
        inset: 0;
        background: rgba(8, 11, 18, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: max(20px, calc(env(safe-area-inset-top, 24px) + 16px));
        padding-bottom: max(32px, calc(env(safe-area-inset-bottom, 20px) + 32px));
        padding-left: max(14px, calc(env(safe-area-inset-left, 0px) + 14px));
        padding-right: max(14px, calc(env(safe-area-inset-right, 0px) + 14px));
        box-sizing: border-box;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .host-mod-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .host-mod-card {
        background: linear-gradient(145deg, #161B2E, #0F1322);
        border: 2px solid rgba(0, 245, 212, 0.4);
        border-radius: 24px;
        width: 100%;
        max-width: 520px;
        height: auto;
        max-height: calc(100dvh - max(36px, calc(env(safe-area-inset-top, 24px) + 24px)) - max(48px, calc(env(safe-area-inset-bottom, 20px) + 40px)));
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 245, 212, 0.15);
        color: #F8FAFC;
        overflow: hidden;
        animation: hostModPop 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      }
      @keyframes hostModPop {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .host-mod-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
      }
      .host-mod-title-box h3 {
        font-size: 1.15rem;
        font-weight: 900;
        color: #FFF;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }
      .host-mod-room-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        font-weight: 900;
        background: rgba(0, 245, 212, 0.15);
        border: 1px solid #00F5D4;
        color: #00F5D4;
        padding: 2px 10px;
        border-radius: 999px;
        margin-top: 4px;
        cursor: pointer;
      }
      .host-mod-close-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94A3B8;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1.1rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .host-mod-close-btn:hover, .host-mod-close-btn:active {
        background: rgba(239, 68, 68, 0.25);
        border-color: #EF4444;
        color: #FFF;
      }

      /* Sekmeler */
      .host-mod-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.25);
      }
      .host-mod-tab-btn {
        flex: 1;
        padding: 12px 6px;
        font-size: 0.82rem;
        font-weight: 800;
        color: #94A3B8;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      .host-mod-tab-btn.active {
        color: #00F5D4;
        border-bottom-color: #00F5D4;
        background: rgba(0, 245, 212, 0.08);
      }

      /* Gövde / İçerik */
      .host-mod-body {
        padding: 16px 20px calc(env(safe-area-inset-bottom, 0px) + 20px) 20px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-height: 0;
      }
      .host-mod-panel-view {
        display: none;
      }
      .host-mod-panel-view.active {
        display: block;
      }

      /* Oyuncu Kartı */
      .host-mod-player-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 10px 14px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        transition: transform 0.15s, border-color 0.15s;
      }
      .host-mod-player-card:hover {
        border-color: rgba(0, 245, 212, 0.4);
      }
      .host-mod-pinfo {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .host-mod-pavatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        flex-shrink: 0;
      }
      .host-mod-pnames {
        min-width: 0;
      }
      .host-mod-pname {
        font-size: 0.92rem;
        font-weight: 800;
        color: #FFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .host-mod-pmeta {
        font-size: 0.72rem;
        color: #94A3B8;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .host-mod-pactions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }
      .btn-mod-warn {
        background: rgba(251, 191, 36, 0.18);
        border: 1px solid #FBBF24;
        color: #FDE047;
        font-size: 0.74rem;
        font-weight: 900;
        border-radius: 8px;
        padding: 5px 9px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .btn-mod-kick {
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid #EF4444;
        color: #FCA5A5;
        font-size: 0.74rem;
        font-weight: 900;
        border-radius: 8px;
        padding: 5px 9px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      /* Hızlı Aksiyonlar */
      .host-mod-action-box {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 14px;
        margin-bottom: 12px;
      }
      .host-mod-action-title {
        font-size: 0.82rem;
        font-weight: 800;
        color: #00F5D4;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Trigger Rozeti Butonu */
      .btn-host-moderation-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.18), rgba(168, 85, 247, 0.18));
        border: 1.5px solid #00F5D4;
        color: #FFF;
        font-size: 0.78rem;
        font-weight: 900;
        padding: 6px 14px;
        border-radius: 999px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 245, 212, 0.25);
        transition: all 0.2s ease;
      }
      .btn-host-moderation-badge:active {
        transform: scale(0.95);
      }
      .btn-host-moderation-badge .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10B981;
        box-shadow: 0 0 10px #10B981;
        animation: pulseModDot 1.5s infinite;
      }
      @keyframes pulseModDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  createModalDOM() {
    if (document.getElementById('host-moderation-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'host-moderation-overlay';
    overlay.className = 'host-mod-overlay';
    overlay.innerHTML = `
      <div class="host-mod-card">
        <!-- Header -->
        <div class="host-mod-header">
          <div class="host-mod-title-box">
            <h3 id="host-mod-title">🛡️ Oda & Oyuncu Yönetimi</h3>
            <div style="display:flex; align-items:center; gap:8px;">
              <span id="host-mod-room-code" class="host-mod-room-pill" title="Kopyalamak için tıklayın">ODA: ----</span>
              <span id="host-mod-lock-status" style="font-size:0.74rem; font-weight:800; color:#10B981;">🔓 Açık</span>
            </div>
          </div>
          <button type="button" id="btn-close-host-mod" class="host-mod-close-btn" title="Kapat">✕</button>
        </div>

        <!-- Tabs -->
        <div class="host-mod-tabs">
          <button type="button" class="host-mod-tab-btn active" data-tab="players" id="tab-btn-players">
            👥 Oyuncular (<span id="mod-players-count">0</span>)
          </button>
          <button type="button" class="host-mod-tab-btn" data-tab="actions" id="tab-btn-actions">
            ⚡ Duyuru & Kontrol
          </button>
          <button type="button" class="host-mod-tab-btn" data-tab="logs" id="tab-btn-logs">
            📜 Güvenlik Günlüğü
          </button>
        </div>

        <!-- Body -->
        <div class="host-mod-body">
          <!-- 1. Oyuncular Sekmesi -->
          <div id="view-tab-players" class="host-mod-panel-view active">
            <div id="host-mod-players-list" style="min-height:120px;">
              <div style="font-size:0.82rem; color:#94A3B8; text-align:center; padding:30px 10px;">
                👥 Bağlı oyuncu bekleniyor... Katılımcılar QR kod okutunca burada listelenir.
              </div>
            </div>
          </div>

          <!-- 2. Hızlı Aksiyonlar Sekmesi -->
          <div id="view-tab-actions" class="host-mod-panel-view">
            <!-- Genel Duyuru -->
            <div class="host-mod-action-box">
              <div class="host-mod-action-title">📢 Tüm Bağlı Ekranlara Duyuru / Toplu İkaz:</div>
              <input type="text" id="inp-broadcast-msg" placeholder="Örn: Oyun başlıyor, herkes ekran başına!" style="width:100%; background:rgba(0,0,0,0.4); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:10px 12px; color:#FFF; font-size:0.86rem; font-weight:700; outline:none; margin-bottom:8px;">
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                <button type="button" class="btn-preset-broadcast" data-text="📣 Lütfen sessizlik! Oyun başlıyor." style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#E2E8F0; font-size:0.72rem; padding:4px 8px; border-radius:8px; cursor:pointer;">"Oyun Başlıyor"</button>
                <button type="button" class="btn-preset-broadcast" data-text="⚠️ Lütfen kurallara uyun ve ekrandan ayrılmayın!" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#E2E8F0; font-size:0.72rem; padding:4px 8px; border-radius:8px; cursor:pointer;">"Kurallara Uyun"</button>
                <button type="button" class="btn-preset-broadcast" data-text="☕ 2 dakika mola! Hemen döneceğiz." style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#E2E8F0; font-size:0.72rem; padding:4px 8px; border-radius:8px; cursor:pointer;">"Kısa Mola"</button>
              </div>
              <button type="button" id="btn-send-broadcast" style="width:100%; background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#0B0E14; border:none; border-radius:12px; padding:10px; font-size:0.86rem; font-weight:900; cursor:pointer;">
                🚀 Herkesin Ekranına Gönder
              </button>
            </div>

            <!-- Oda Güvenlik Kontrolleri -->
            <div class="host-mod-action-box">
              <div class="host-mod-action-title">🔒 Oda Güvenliği & Giriş Çıkışlar:</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <button type="button" id="btn-toggle-room-lock" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); color:#FFF; font-size:0.8rem; font-weight:900; padding:10px; border-radius:12px; cursor:pointer;">
                  🔒 Odayı Kilitle
                </button>
                <button type="button" id="btn-close-room-disband" style="background:rgba(239,68,68,0.2); border:1.5px solid #EF4444; color:#FCA5A5; font-size:0.8rem; font-weight:900; padding:10px; border-radius:12px; cursor:pointer;">
                  🛑 Odayı Kapat
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Güvenlik Günlüğü Sekmesi -->
          <div id="view-tab-logs" class="host-mod-panel-view">
            <div id="host-mod-logs-list" style="font-size:0.78rem; line-height:1.5; color:#CBD5E1; display:flex; flex-direction:column; gap:6px;">
              <span style="color:#94A3B8;">Oda güvenlik kayıtları burada kronolojik olarak listelenir.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.bindEvents(overlay);
  }

  bindEvents(overlay) {
    // Sekmeler
    overlay.querySelectorAll('.host-mod-tab-btn').forEach(btn => {
      btn.onclick = () => {
        overlay.querySelectorAll('.host-mod-tab-btn').forEach(b => b.classList.remove('active'));
        overlay.querySelectorAll('.host-mod-panel-view').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        const targetView = document.getElementById(`view-tab-${tab}`);
        if (targetView) targetView.classList.add('active');
      };
    });

    // Kapat
    document.getElementById('btn-close-host-mod').onclick = () => this.close();
    overlay.onclick = (e) => {
      if (e.target === overlay) this.close();
    };

    // Oda Kodunu Kopyala
    document.getElementById('host-mod-room-code').onclick = () => {
      if (!this.currentRoomId) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.currentRoomId);
        alert(`📋 Oda Kodu (${this.currentRoomId}) kopyalandı!`);
      } else {
        prompt('Oda Kodu:', this.currentRoomId);
      }
    };

    // Hazır anons butonları
    overlay.querySelectorAll('.btn-preset-broadcast').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('inp-broadcast-msg').value = btn.dataset.text;
      };
    });

    // Herkese Duyuru Gönder
    document.getElementById('btn-send-broadcast').onclick = async () => {
      const inp = document.getElementById('inp-broadcast-msg');
      const msg = inp.value.trim();
      if (!msg) {
        alert('Lütfen bir duyuru mesajı yazın!');
        return;
      }
      await firebaseNetwork.broadcastAnnouncement(this.currentNamespace, this.currentRoomId, msg);
      inp.value = '';
      alert('📢 Duyuru tüm bağlı cihazlara iletildi!');
    };

    // Odayı Kilitle / Aç
    document.getElementById('btn-toggle-room-lock').onclick = async () => {
      if (!this.currentRoomData) return;
      const isLocked = !Boolean(this.currentRoomData.isLocked);
      await firebaseNetwork.toggleRoomLock(this.currentNamespace, this.currentRoomId, isLocked);
      this.currentRoomData.isLocked = isLocked;
      this.updateLockUI(isLocked);
    };

    // Odayı Kapat / Dağıt
    document.getElementById('btn-close-room-disband').onclick = async () => {
      if (confirm('🛑 Odayı kapatmak ve bağlı olan herkesin bağlantısını sonlandırmak istediğinize emin misiniz?')) {
        await firebaseNetwork.closeRoom(this.currentNamespace, this.currentRoomId);
        alert('Oda kapatıldı ve tüm katılımcılara bildirim gönderildi.');
        this.close();
      }
    };
  }

  updateLockUI(isLocked) {
    const lblStatus = document.getElementById('host-mod-lock-status');
    const btnLock = document.getElementById('btn-toggle-room-lock');
    if (lblStatus) {
      lblStatus.textContent = isLocked ? '🔒 Kilitli' : '🔓 Açık';
      lblStatus.style.color = isLocked ? '#EF4444' : '#10B981';
    }
    if (btnLock) {
      btnLock.textContent = isLocked ? '🔓 Kilidi Aç' : '🔒 Odayı Kilitle';
    }
  }

  open({ namespace, roomId, title = 'Oda & Oyuncu Yönetimi', initialPlayers = [] }) {
    this.init();
    this.currentNamespace = namespace;
    this.currentRoomId = roomId;
    this.currentTitle = title;

    document.getElementById('host-mod-title').innerHTML = `🛡️ ${title}`;
    document.getElementById('host-mod-room-code').textContent = `ODA: ${roomId}`;

    const overlay = document.getElementById('host-moderation-overlay');
    overlay.classList.add('active');

    // Odayı dinle
    if (this.roomUnsubscribe) {
      try { this.roomUnsubscribe(); } catch(e) {}
      this.roomUnsubscribe = null;
    }

    this.roomUnsubscribe = firebaseNetwork.listenRoom(namespace, roomId, (room) => {
      if (!room) return;
      this.currentRoomData = room;
      this.renderRoomState(room);
    });
  }

  close() {
    const overlay = document.getElementById('host-moderation-overlay');
    if (overlay) overlay.classList.remove('active');
    if (this.roomUnsubscribe) {
      try { this.roomUnsubscribe(); } catch(e) {}
      this.roomUnsubscribe = null;
    }
  }

  renderRoomState(room) {
    // 1. Kilit durumu
    this.updateLockUI(Boolean(room.isLocked));

    // 2. Oyuncular
    let pList = [];
    if (room.players) {
      if (Array.isArray(room.players)) {
        pList = room.players.filter(Boolean);
      } else if (typeof room.players === 'object') {
        pList = Object.values(room.players);
      }
    }

    document.getElementById('mod-players-count').textContent = pList.length;

    const listEl = document.getElementById('host-mod-players-list');
    if (pList.length === 0) {
      listEl.innerHTML = `
        <div style="font-size:0.82rem; color:#94A3B8; text-align:center; padding:30px 10px;">
          👥 Henüz bağlı oyuncu yok. Katılımcılar QR kodu okuttuğunda burada listelenir.
        </div>
      `;
    } else {
      listEl.innerHTML = pList.map(p => {
        const teamTag = p.team ? (p.team === 'red' ? '🔴 Kırmızı' : (p.team === 'blue' ? '🔵 Mavi' : p.team)) : '';
        const roleTag = p.role ? `• ${p.role.toUpperCase()}` : '';
        const scoreTag = p.score !== undefined ? `• ${p.score} P` : '';
        return `
          <div class="host-mod-player-card" data-id="${p.id}">
            <div class="host-mod-pinfo">
              <div class="host-mod-pavatar">${p.avatar || '👤'}</div>
              <div class="host-mod-pnames">
                <div class="host-mod-pname">${p.name || 'Oyuncu'}</div>
                <div class="host-mod-pmeta">
                  <span>🟢 Çevrimiçi</span>
                  ${teamTag ? `<span>${teamTag}</span>` : ''}
                  ${roleTag ? `<span>${roleTag}</span>` : ''}
                  ${scoreTag ? `<span>${scoreTag}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="host-mod-pactions">
              <button type="button" class="btn-mod-warn" data-id="${p.id}" data-name="${p.name || 'Oyuncu'}">
                ⚠️ İkaz
              </button>
              <button type="button" class="btn-mod-kick" data-id="${p.id}" data-name="${p.name || 'Oyuncu'}">
                🚫 At
              </button>
            </div>
          </div>
        `;
      }).join('');

      // İkaz & Atma Dinleyicileri
      listEl.querySelectorAll('.btn-mod-warn').forEach(btn => {
        btn.onclick = () => {
          const pId = btn.dataset.id;
          const pName = btn.dataset.name;
          const reason = prompt(`⚠️ ${pName} adlı kullanıcıya iletilecek ikaz mesajı:`, 'Lütfen kurallara uyun ve oyundan ayrılmayın!');
          if (reason && reason.trim()) {
            firebaseNetwork.warnPlayer(this.currentNamespace, this.currentRoomId, pId, reason.trim());
            alert(`⚠️ ${pName} ikaz edildi.`);
          }
        };
      });

      listEl.querySelectorAll('.btn-mod-kick').forEach(btn => {
        btn.onclick = () => {
          const pId = btn.dataset.id;
          const pName = btn.dataset.name;
          if (confirm(`🚫 ${pName} adlı kullanıcıyı odadan atmak istediğinize emin misiniz?`)) {
            firebaseNetwork.kickPlayer(this.currentNamespace, this.currentRoomId, pId, 'Oda yöneticisi tarafından odadan çıkarıldınız.');
            alert(`🚫 ${pName} odadan çıkarıldı ve karantinaya alındı.`);
          }
        };
      });
    }

    // 3. Güvenlik Günlüğü
    const logsEl = document.getElementById('host-mod-logs-list');
    if (room.auditLog) {
      const logs = Object.values(room.auditLog);
      logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      logsEl.innerHTML = logs.slice(0, 30).map(l => `
        <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:6px 10px; border-left:3px solid ${l.type === 'kick' ? '#EF4444' : (l.type === 'warning' ? '#FBBF24' : '#00F5D4')};">
          <span style="color:#94A3B8; font-size:0.7rem; font-family:monospace;">[${l.timeStr || ''}]</span>
          <span>${l.text || ''}</span>
        </div>
      `).join('');
    }
  }

  /**
   * Herhangi bir oyun ekranına yerleştirilecek şık tek satır rozet butonu üretir
   */
  createBadgeHTML({ namespace, roomId, title = 'Oda Yönetimi', count = 0 }) {
    return `
      <button type="button" class="btn-host-moderation-badge" onclick="window.HostModerationPanel.open({ namespace: '${namespace}', roomId: '${roomId}', title: '${title}' })">
        <span class="pulse-dot"></span>
        <span>🛡️ Yönetim Paneli</span>
        <span style="background:rgba(0,0,0,0.35); padding:1px 6px; border-radius:999px; font-size:0.72rem;">${count}</span>
      </button>
    `;
  }
}

export const HostModerationPanel = new HostModerationPanelController();
if (typeof window !== 'undefined') {
  window.HostModerationPanel = HostModerationPanel;
}
