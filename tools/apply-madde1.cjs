// tools/apply-madde1.cjs - Madde 1 Geliştirmeleri (QR SVG, Avatar Dokunma Koruması, Merkezi Oda Kontrolü & Sıfırlama)
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const isimGamePath = path.join(rootDir, 'js', 'isim-sehir-game.js');
const isimClientPath = path.join(rootDir, 'isim-sehir.html');

console.log('🚀 MADDE 1 Geliştirmeleri Uygulanıyor...');

// ==========================================
// 1. INDEX.HTML: İSİM ŞEHİR HOST KONTROL BARI
// ==========================================
let html = fs.readFileSync(indexPath, 'utf8');
const isCRLFHtml = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const oldWifiBoxRegex = /<div id="isim-wifi-box"[\s\S]*?<\/div>\s*<!-- Local Masa Modu Kutusu -->/;
const newWifiBox = `<div id="isim-wifi-box" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(0,245,212,0.3); border-radius:18px; padding:16px 14px; margin-bottom:14px; text-align:center;">
        <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); margin-bottom:4px;">ARKADAŞLARIN BU QR'I OKUTARAK KATILSIN:</div>
        <div style="font-size:0.75rem; color:#00F5D4; font-weight:800; margin-bottom:8px;">☁️ Firebase Bulut Odası: Hotspot veya harici Wi-Fi ile anında bağlanın!</div>
        
        <!-- SVG Tabanlı Asla Takılmayan QR Konteyner -->
        <div id="isim-qr-canvas" style="display:inline-block; margin:4px 0 8px; border:2px solid var(--primary); border-radius:14px; padding:8px; background:#0B0E14; min-width:170px; min-height:170px; box-shadow:0 0 20px rgba(0,245,212,0.25);"></div>
        
        <!-- Büyük Oda Kodu & Kopyalama -->
        <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin:4px 0 10px;">
          <div style="font-size:1.15rem; font-weight:900; color:var(--gold);">
            ODA KODU: <span id="lbl-isim-room-code" style="letter-spacing:3px; background:rgba(251,191,36,0.18); padding:4px 12px; border-radius:10px; border:1px solid rgba(251,191,36,0.45); font-family:monospace;">----</span>
          </div>
          <button type="button" id="btn-isim-copy-code" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-size:0.75rem; font-weight:800; border-radius:8px; padding:6px 10px; cursor:pointer;" title="Kodu Kopyala">📋 Kopyala</button>
        </div>

        <!-- MERKEZİ ODA YÖNETİM BUTONLARI (Tek Merkezden Kontrol & Sıfırlama) -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
          <button type="button" id="btn-isim-reset-room" style="background:linear-gradient(135deg, rgba(239,68,68,0.25), rgba(185,28,28,0.35)); border:1.5px solid #EF4444; color:#FCA5A5; font-size:0.82rem; font-weight:900; border-radius:10px; padding:10px 6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; box-shadow:0 0 12px rgba(239,68,68,0.2);">
            <span>🔄 Odayı Sıfırla</span>
          </button>
          <button type="button" id="btn-isim-toggle-lock" style="background:rgba(0,245,212,0.15); border:1.5px solid var(--primary); color:#00F5D4; font-size:0.82rem; font-weight:900; border-radius:10px; padding:10px 6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span>🔓 Katılıma Açık</span>
          </button>
        </div>

        <div id="isim-player-count-badge" style="font-size:0.82rem; font-weight:800; color:var(--primary); margin:6px 0 4px;">1 Oyuncu Bağlı</div>
        <div id="isim-connected-players" style="margin-top:6px; min-height:36px;"></div>
      </div>
      <!-- Local Masa Modu Kutusu -->`;

if (oldWifiBoxRegex.test(html)) {
  html = html.replace(oldWifiBoxRegex, newWifiBox);
  console.log('✓ index.html: isim-wifi-box merkezi kontrol butonlarıyla yenilendi.');
} else {
  console.warn('⚠️ index.html: isim-wifi-box regex eşleşmedi!');
}

if (isCRLFHtml) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(indexPath, html, 'utf8');

// ==========================================
// 2. JS/ISIM-SEHIR-GAME.JS: SVG QR & SIFIRLAMA
// ==========================================
let gameCode = fs.readFileSync(isimGamePath, 'utf8');
const isCRLFGame = gameCode.includes('\r\n');
gameCode = gameCode.replace(/\r\n/g, '\n');

// 2.1. renderQrCode fonksiyonunu SVG tabanlı yap (asla takılmaz)
const oldRenderQrRegex = /renderQrCode\(\)\s*\{[\s\S]*?startPolling\(\)\s*\{/;
const newRenderQrCode = `async renderQrCode() {
    const wifiBox = document.getElementById('isim-wifi-box');
    const localBox = document.getElementById('isim-local-box');
    if (wifiBox) wifiBox.style.display = 'block';
    if (localBox) localBox.style.display = 'none';

    const lblRoom = document.getElementById('lbl-isim-room-code');
    if (lblRoom) lblRoom.textContent = this.roomId;

    const qrContainer = document.getElementById('isim-qr-canvas');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    // Firebase Bulut URL'si
    const joinUrl = firebaseNetwork.getIsimSehirUrl(this.roomId);

    try {
      const svg = await QRCode.toString(joinUrl, {
        type: 'svg',
        margin: 1,
        color: { dark: '#00F5D4', light: '#0B0E14' }
      });
      qrContainer.innerHTML = svg;
      const svgEl = qrContainer.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '170px';
        svgEl.style.height = '170px';
        svgEl.style.display = 'block';
        svgEl.style.margin = '0 auto';
        svgEl.style.borderRadius = '10px';
      }
    } catch (err) {
      console.warn('QR SVG üretilemedi:', err);
    }
  }

  startPolling() {`;

if (oldRenderQrRegex.test(gameCode)) {
  gameCode = gameCode.replace(oldRenderQrRegex, newRenderQrCode);
  console.log('✓ js/isim-sehir-game.js: renderQrCode SVG tabanlı yapıldı.');
} else {
  console.warn('⚠️ js/isim-sehir-game.js: renderQrCode regex eşleşmedi!');
}

// 2.2. resetRoom ve toggleRoomLock fonksiyonları ekle
const resetMethods = `
  async resetRoom() {
    if (!confirm('Oda ve tüm bağlantılar sıfırlanıp yeni bir oda başlatılsın mı?')) return;
    sounds.playClick();
    
    // 1. Eski odaya reset sinyali gönder
    if (this.roomId && this.mode === 'wifi') {
      try {
        await firebaseNetwork.sendAction('isim-sehir', this.roomId, 'room_reset', {
          reason: 'Yönetici odayı ve sistemi sıfırladı.',
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // 2. Durum sıfırla
    this.remotePlayers = {};
    this.phase = 'setup';
    this.currentLetter = '';
    this.startedAt = null;
    this.endsAt = null;
    this.firstFinisherId = null;
    this.firstFinisherName = null;
    this.firstFinisherPenalty = false;
    this.firstFinisherPenaltyReason = '';

    // 3. Yeni oda oluştur
    await this.createWifiRoom();

    if (window.game && window.game.showToast) {
      window.game.showToast(\`✅ Sistem sıfırlandı! Yeni Oda: \${this.roomId}\`);
    }
  }

  async toggleRoomLock() {
    this.isLocked = !this.isLocked;
    sounds.playClick();
    if (this.roomId && this.mode === 'wifi') {
      try {
        await firebaseNetwork.setRoomLock('isim-sehir', this.roomId, this.isLocked);
      } catch (e) {}
    }
    const btnLock = document.getElementById('btn-isim-toggle-lock');
    if (btnLock) {
      btnLock.innerHTML = this.isLocked ? '<span>🔒 Katılım Kilitli</span>' : '<span>🔓 Katılıma Açık</span>';
      btnLock.style.background = this.isLocked ? 'rgba(239,68,68,0.25)' : 'rgba(0,245,212,0.15)';
      btnLock.style.borderColor = this.isLocked ? '#EF4444' : 'var(--primary)';
      btnLock.style.color = this.isLocked ? '#FCA5A5' : '#00F5D4';
    }
    if (window.game && window.game.showToast) {
      window.game.showToast(this.isLocked ? '🔒 Oda yeni katılımlara kilitlendi.' : '🔓 Oda yeni katılımlara açıldı.');
    }
  }
`;

// bindEvents içine buton dinleyicilerini ekle
const bindEventsAdditions = `
    // Kodu Kopyala
    const btnCopy = document.getElementById('btn-isim-copy-code');
    if (btnCopy) {
      btnCopy.onclick = () => {
        sounds.playClick();
        if (this.roomId) {
          navigator.clipboard?.writeText(this.roomId);
          if (window.game && window.game.showToast) window.game.showToast(\`📋 Oda kodu kopyalandı: \${this.roomId}\`);
        }
      };
    }

    // Odayı ve Sistemi Sıfırla
    const btnReset = document.getElementById('btn-isim-reset-room');
    if (btnReset) {
      btnReset.onclick = () => this.resetRoom();
    }

    // Katılıma Kilitle / Aç
    const btnLock = document.getElementById('btn-isim-toggle-lock');
    if (btnLock) {
      btnLock.onclick = () => this.toggleRoomLock();
    }
`;

gameCode = gameCode.replace('// Mod Butonları', bindEventsAdditions + '\n    // Mod Butonları');
gameCode = gameCode.replace('drawWheel() {', resetMethods + '\n  drawWheel() {');
console.log('✓ js/isim-sehir-game.js: resetRoom & toggleRoomLock eklendi.');

if (isCRLFGame) gameCode = gameCode.replace(/\n/g, '\r\n');
fs.writeFileSync(isimGamePath, gameCode, 'utf8');

// ==========================================
// 3. ISIM-SEHIR.HTML: AVATAR & RETRY & RESET
// ==========================================
let clientHtml = fs.readFileSync(isimClientPath, 'utf8');
const isCRLFClient = clientHtml.includes('\r\n');
clientHtml = clientHtml.replace(/\r\n/g, '\n');

// 3.1. Avatar CSS iyileştirmesi
const oldAvatarCssRegex = /\.avatar-grid\s*\{[\s\S]*?\.btn-main\s*\{/;
const newAvatarCss = `.avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 16px; }
    .avatar-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      font-size: 1.8rem;
      padding: 10px 4px;
      cursor: pointer;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .avatar-btn:active {
      transform: scale(0.92);
    }
    .avatar-btn.selected {
      border-color: var(--gold) !important;
      background: rgba(251, 191, 36, 0.25) !important;
      transform: scale(1.14);
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.6) !important;
    }

    /* Buttons */
    .btn-main {`;

if (oldAvatarCssRegex.test(clientHtml)) {
  clientHtml = clientHtml.replace(oldAvatarCssRegex, newAvatarCss);
  console.log('✓ isim-sehir.html: Avatar CSS dokunmatik dostu yapıldı.');
}

// 3.2. Avatar seçimi Event Listener'ları (pointerdown + click)
const oldAvatarJsRegex = /\/\/ Avatar seçimi[\s\S]*?document\.querySelectorAll\('\.avatar-btn'\)\.forEach\(btn => \{[\s\S]*?\}\);\s*\}\);/;
const newAvatarJs = `// Avatar seçimi (Dokunmatik ekran dostu & anında tepki)
    function selectAvatar(btn) {
      if (!btn) return;
      document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.playerAvatar = btn.getAttribute('data-av') || '🦁';
      try { playBeep(520, 'sine', 0.04, 0.1); } catch (e) {}
    }

    document.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        selectAvatar(btn);
      });
      btn.addEventListener('click', (e) => {
        selectAvatar(btn);
      });
    });`;

if (oldAvatarJsRegex.test(clientHtml)) {
  clientHtml = clientHtml.replace(oldAvatarJsRegex, newAvatarJs);
  console.log('✓ isim-sehir.html: Avatar JS dokunmatik olayları bağlandı.');
}

// 3.3. Katılma retry döngüsü & cache-busting
const oldJoinTryRegex = /\/\/ 1\. Firebase Bulut Odayı Kontrol Et[\s\S]*?const fbRes = await fetch\(`\$\{FIREBASE_DB_URL\}\/kafanatak\/isim-sehir\/\$\{room\}\.json`\);[\s\S]*?if \(fbRes\.ok\) \{[\s\S]*?const roomData = await fbRes\.json\(\);[\s\S]*?if \(!roomData \|\| !roomData\.roomId\) \{[\s\S]*?return;\s*\}/;
const newJoinTry = `// 1. Firebase Bulut Odayı Kontrol Et (Akıllı 3x Retry & Cache-Busting)
      try {
        let roomData = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          btnJoin.textContent = attempt > 1 ? \`Oda Aranıyor (\${attempt}/3)...\` : 'Bağlanılıyor...';
          try {
            const fbRes = await fetch(\`\${FIREBASE_DB_URL}/kafanatak/isim-sehir/\${room}.json?t=\${Date.now()}\`);
            if (fbRes.ok) {
              const data = await fbRes.json();
              if (data && data.roomId) {
                roomData = data;
                break;
              }
            }
          } catch (netErr) {}
          if (attempt < 3) await new Promise(r => setTimeout(r, 700));
        }

        if (roomData && roomData.roomId) {`;

if (oldJoinTryRegex.test(clientHtml)) {
  clientHtml = clientHtml.replace(oldJoinTryRegex, newJoinTry);
  console.log('✓ isim-sehir.html: 3x akıllı retry ve cache-busting eklendi.');
}

// 3.4. room_reset aksiyon işleyicisi ekleme
if (!clientHtml.includes("a.type === 'room_reset'")) {
  clientHtml = clientHtml.replace(
    "} else if (a.type === 'room_closed') {",
    "} else if (a.type === 'room_reset') {\n              handleRoomResetByHost(a.reason || 'Yönetici odayı ve sistemi sıfırladı.');\n            } else if (a.type === 'room_closed') {"
  );
  
  const resetHandlerFunc = `
    function handleRoomResetByHost(reason) {
      try { playWarningSound(); } catch (e) {}
      state.hasSubmitted = false;
      state.isFirstFinisher = false;
      state.startedAt = null;
      state.endsAt = null;
      state.currentLetter = '';
      state.lastPhase = 'setup';
      clearDraftAnswers();
      showView('view-lobby');
      alert(\`🔄 \${reason}\\n\\nLobi temizlendi, yeni harf bekleniyor!\`);
    }
  `;
  clientHtml = clientHtml.replace('function handleRoomClosedByHost', resetHandlerFunc + '\n    function handleRoomClosedByHost');
  console.log('✓ isim-sehir.html: handleRoomResetByHost eklendi.');
}

if (isCRLFClient) clientHtml = clientHtml.replace(/\n/g, '\r\n');
fs.writeFileSync(isimClientPath, clientHtml, 'utf8');

console.log('🎉 MADDE 1 geliştirmeleri başarıyla uygulandı!');
