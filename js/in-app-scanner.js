// js/in-app-scanner.js
// Kafana Tak! - Uygulama İçi Ana Cihaza Bağlanma (QR Okut & Kod Gir) Modülü
// İkinci telefonların ana telefona kamerayla QR okutarak veya oda kodu girerek anında bağlanmasını sağlar.

import jsQR from './jsqr.esm.js';
import { firebaseNetwork } from './firebase-network.js';
import { sounds } from './audio.js';

class InAppScannerController {
  constructor() {
    this.modal = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.scanInterval = null;
    this.isScanning = false;
    this.activeTab = 'camera'; // 'camera' | 'code'
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.modal = document.getElementById('modal-scan-and-connect');
    this.video = document.getElementById('inapp-scanner-video');
    this.canvas = document.getElementById('inapp-scanner-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    this.bindEvents();
    this.initialized = true;
  }

  bindEvents() {
    // Tetikleyici Butonlar (Ana Menü ve Parti Arenası)
    const btnHeaderConnect = document.getElementById('btn-header-scan-connect');
    const btnPartyConnect = document.getElementById('btn-party-scan-connect');

    if (btnHeaderConnect) {
      btnHeaderConnect.addEventListener('click', () => this.open());
    }
    if (btnPartyConnect) {
      btnPartyConnect.addEventListener('click', () => this.open());
    }

    // Modal Kapatma
    document.getElementById('btn-close-scan-connect')?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Sekme Değiştirici
    const tabCamera = document.getElementById('tab-connect-camera');
    const tabCode = document.getElementById('tab-connect-code');
    const paneCamera = document.getElementById('pane-connect-camera');
    const paneCode = document.getElementById('pane-connect-code');

    tabCamera?.addEventListener('click', () => {
      sounds.playClick();
      this.activeTab = 'camera';
      tabCamera.classList.add('active');
      tabCode?.classList.remove('active');
      if (paneCamera) paneCamera.style.display = 'block';
      if (paneCode) paneCode.style.display = 'none';
      this.startCamera();
    });

    tabCode?.addEventListener('click', () => {
      sounds.playClick();
      this.activeTab = 'code';
      tabCode.classList.add('active');
      tabCamera?.classList.remove('active');
      if (paneCamera) paneCamera.style.display = 'none';
      if (paneCode) paneCode.style.display = 'block';
      this.stopCamera();
      document.getElementById('inapp-input-room-code')?.focus();
    });

    // Kod ile Bağlan Butonu
    document.getElementById('btn-inapp-submit-code')?.addEventListener('click', () => {
      this.handleManualCodeSubmit();
    });

    // Enter tuşu desteği
    document.getElementById('inapp-input-room-code')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleManualCodeSubmit();
      }
    });

    // Galeriden QR Görseli Seç
    const filePicker = document.getElementById('file-inapp-qr-image');
    document.getElementById('btn-inapp-pick-image')?.addEventListener('click', () => {
      filePicker?.click();
    });

    filePicker?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.decodeImageFile(file);
    });
  }

  open() {
    sounds.playClick();
    if (!this.modal) this.init();
    if (!this.modal) return;

    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (this.activeTab === 'camera') {
      this.startCamera();
    }
  }

  close() {
    sounds.playClick();
    this.stopCamera();
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  async startCamera() {
    if (this.isScanning) return;
    const placeholder = document.getElementById('inapp-scanner-placeholder');
    const statusText = document.getElementById('inapp-scanner-status');

    try {
      if (placeholder) placeholder.style.display = 'none';
      if (statusText) statusText.textContent = 'Kamera başlatılıyor...';

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      this.isScanning = true;
      if (statusText) statusText.textContent = 'QR kodu yeşil karenin içine hizalayın';
      this.startScanLoop();
    } catch (err) {
      console.warn('[InAppScanner] Kamera açılamadı:', err);
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
      if (statusText) {
        statusText.textContent = 'Kamera açılamadı. Kod sekmesini kullanabilirsiniz.';
      }
    }
  }

  stopCamera() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.stream) {
      try {
        this.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  startScanLoop() {
    if (this.scanInterval) clearInterval(this.scanInterval);

    this.scanInterval = setInterval(() => {
      if (!this.isScanning || !this.video || !this.canvas || !this.ctx) return;
      if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) return;

      const w = this.video.videoWidth || 320;
      const h = this.video.videoHeight || 240;
      this.canvas.width = w;
      this.canvas.height = h;

      try {
        this.ctx.drawImage(this.video, 0, 0, w, h);
        const imgData = this.ctx.getImageData(0, 0, w, h);
        const code = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });

        if (code && code.data) {
          const raw = code.data.trim();
          if (raw) {
            this.handleDetectedPayload(raw);
          }
        }
      } catch (e) {}
    }, 120);
  }

  decodeImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!this.canvas || !this.ctx) return;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        const imgData = this.ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, img.width, img.height);
        if (code && code.data) {
          this.handleDetectedPayload(code.data.trim());
        } else {
          alert('Görselde geçerli bir Kafana Tak QR kodu bulunamadı.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * QR'dan okunan URL veya oda payload'ını işler ve ilgili oyuna yönlendirir
   */
  handleDetectedPayload(payload) {
    this.stopCamera();
    try {
      sounds.playCorrect();
      if (navigator.vibrate) navigator.vibrate([40, 60, 100]);
    } catch (e) {}

    const statusText = document.getElementById('inapp-scanner-status');
    if (statusText) statusText.textContent = '✅ QR Okundu! Odaya bağlanılıyor...';

    // 1. Durum: URL mi? (Örn: https://.../passaparola.html?room=8XFE&cloud=1)
    if (payload.includes('.html') && payload.includes('room=')) {
      try {
        const url = new URL(payload, window.location.href);
        const pathname = url.pathname.split('/').pop() || '';
        const search = url.search || '';
        if (pathname) {
          window.location.href = `${pathname}${search}`;
          return;
        }
      } catch (e) {}
    }

    // 2. Durum: URL query içeren metin
    const roomMatch = payload.match(/[?&]room=([A-Z0-9]+)/i);
    const htmlMatch = payload.match(/([a-z0-9\-]+)\.html/i);
    if (roomMatch && htmlMatch) {
      window.location.href = `${htmlMatch[1]}.html?room=${roomMatch[1].toUpperCase()}&cloud=1`;
      return;
    }

    // 3. Durum: Sadece 4-6 Haneli Kod Okunmuşsa
    const cleanCode = payload.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleanCode.length >= 3 && cleanCode.length <= 8) {
      this.routeByRoomCode(cleanCode);
      return;
    }

    alert(`Okunan QR Kodu: ${payload}\nBu geçerli bir Kafana Tak oyun odası bağlantısı değil.`);
    this.startCamera();
  }

  /**
   * Manuel kod girildiğinde odayı bulup bağlar
   */
  async handleManualCodeSubmit() {
    const input = document.getElementById('inapp-input-room-code');
    const code = (input?.value || '').trim().toUpperCase();
    if (!code || code.length < 3) {
      alert('Lütfen en az 3-4 haneli oda kodunu girin!');
      return;
    }

    const btn = document.getElementById('btn-inapp-submit-code');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Aranıyor...';
    }

    await this.routeByRoomCode(code);

    if (btn) {
      btn.disabled = false;
      btn.textContent = '🚀 Odaya Katıl';
    }
  }

  /**
   * Oda kodunu Firebase'de tarayıp hangi oyuna ait olduğunu tespit eder ve yönlendirir
   */
  async routeByRoomCode(roomId) {
    const statusText = document.getElementById('inapp-code-status');
    if (statusText) {
      statusText.style.display = 'block';
      statusText.textContent = `🔍 "${roomId}" kodlu oda aranıyor...`;
    }

    // 1. Firebase RTDB üzerinden hangi oyuna ait olduğunu bul
    const found = await firebaseNetwork.findRoomGame(roomId);
    if (found && found.namespace) {
      try {
        sounds.playCorrect();
        if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
      } catch (e) {}

      const targetUrl = firebaseNetwork.getGameUrl(found.namespace, roomId);
      const fileName = targetUrl.split('/').pop() || '';
      if (fileName) {
        window.location.href = fileName;
        return;
      }
    }

    // 2. Bulunamadıysa kullanıcıya hızlı oyun seçtirici göster
    if (statusText) {
      statusText.innerHTML = `
        <div style="color:#EF4444; font-weight:800; margin-bottom:8px;">⚠️ Oda otomatik bulunamadı. Lütfen hangi oyuna katılacağınızı seçin:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; max-width:320px; margin:0 auto;">
          <button type="button" class="btn-fast-join" data-file="passaparola.html" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">🎯 Passaparola</button>
          <button type="button" class="btn-fast-join" data-file="carkifelek.html" style="background:rgba(251,191,36,0.15); border:1px solid var(--gold); color:var(--gold); padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">🎡 Çarkıfelek</button>
          <button type="button" class="btn-fast-join" data-file="isim-sehir.html" style="background:rgba(255,46,147,0.15); border:1px solid #FF2E93; color:#FF2E93; padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">🏙️ İsim Şehir</button>
          <button type="button" class="btn-fast-join" data-file="aileler-yarisiyor.html" style="background:rgba(59,130,246,0.15); border:1px solid #3B82F6; color:#3B82F6; padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">🔔 Aileler Yarışıyor</button>
          <button type="button" class="btn-fast-join" data-file="koy.html" style="background:rgba(168,85,247,0.15); border:1px solid #A855F7; color:#A855F7; padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">🧛 Vampir Köylü</button>
          <button type="button" class="btn-fast-join" data-file="spectator.html" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#FFF; padding:8px; border-radius:10px; font-weight:900; font-size:0.75rem; cursor:pointer;">📱 Seyirci Ekranı</button>
        </div>
      `;

      statusText.querySelectorAll('.btn-fast-join').forEach(b => {
        b.onclick = () => {
          const file = b.dataset.file;
          window.location.href = `${file}?room=${roomId}&cloud=1`;
        };
      });
    }
  }
}

export const inAppScanner = new InAppScannerController();
if (typeof window !== 'undefined') {
  window.inAppScanner = inAppScanner;
}

