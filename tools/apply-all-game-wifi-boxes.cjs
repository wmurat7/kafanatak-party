const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add #btn-header-scan-connect to party-top-controls-dock
if (!html.includes('id="btn-header-scan-connect"')) {
  const dockTarget = '<button type="button" id="btn-quick-wheel-start"';
  const newBtn = `
        <button type="button" id="btn-header-scan-connect" class="btn-top-dock-action btn-dock-connect" title="Ana Cihaza Bağlan / QR Okut (İkinci Telefon Modu)">
          <span class="dock-action-icon">📷</span>
          <span class="dock-action-label">Odaya Bağlan</span>
        </button>
  `;
  html = html.replace(dockTarget, newBtn + '\n        ' + dockTarget);
  console.log('Added btn-header-scan-connect to screen-home dock!');
}

// 2. Add #btn-party-scan-connect to screen-party-games header
if (!html.includes('id="btn-party-scan-connect"')) {
  const partyHeaderTarget = '<span style="font-size:0.75rem; font-weight:800; background:rgba(255,46,147,0.2); color:#FF2E93; border:1px solid rgba(255,46,147,0.4); padding:4px 12px; border-radius:999px;">\n        🎉 10 Efsane Oyun\n      </span>';
  const partyBtn = `
      <div style="display:flex; align-items:center; gap:8px;">
        <button type="button" id="btn-party-scan-connect" style="background:linear-gradient(135deg, rgba(0,245,212,0.18), rgba(0,180,216,0.25)); border:1.5px solid var(--primary); color:#00F5D4; padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:900; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 0 15px rgba(0,245,212,0.3);">
          <span>📷</span>
          <span>Odaya Bağlan</span>
        </button>
        <span style="font-size:0.75rem; font-weight:800; background:rgba(255,46,147,0.2); color:#FF2E93; border:1px solid rgba(255,46,147,0.4); padding:4px 12px; border-radius:999px;">
          🎉 10 Efsane Oyun
        </span>
      </div>`;
  html = html.replace(partyHeaderTarget, partyBtn);
  console.log('Added btn-party-scan-connect to screen-party-games!');
}

// 3. Add modal-scan-and-connect before orientation-warning
if (!html.includes('id="modal-scan-and-connect"')) {
  const modalHTML = `
  <!-- =========================================
       ANA CİHAZA BAĞLAN (QR OKUT & KOD GİR) MODALI
       ========================================= -->
  <div id="modal-scan-and-connect" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(8,11,18,0.88); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); z-index:999999; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;">
    <div class="modal-card" style="max-width:440px; width:100%; padding:20px; text-align:center; background:linear-gradient(145deg, #161B2E, #0F1322); border:2px solid var(--primary); border-radius:24px; box-shadow:0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,245,212,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="font-size:1.25rem; font-weight:900; color:#FFF; margin:0; display:flex; align-items:center; gap:8px;">
          <span>📷</span> Ana Cihaza Bağlan
        </h3>
        <button type="button" id="btn-close-scan-connect" class="modal-close" style="position:static; font-size:1.3rem; background:none; border:none; color:#94A3B8; cursor:pointer;">&times;</button>
      </div>

      <p style="font-size:0.82rem; color:var(--text-dim); margin-bottom:14px; line-height:1.4;">
        Ana telefonun ekranındaki QR kodu kameranızla okutun veya 4 haneli oda kodunu girerek odaya katılın!
      </p>

      <!-- Sekme Seçici -->
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button type="button" id="tab-connect-camera" class="rule-chip active" style="flex:1; padding:10px 8px; justify-content:center; font-size:0.85rem; font-weight:900; border-radius:12px; cursor:pointer; background:rgba(0,245,212,0.2); border:1.5px solid var(--primary); color:#00F5D4;">
          📷 Kamera ile QR Tara
        </button>
        <button type="button" id="tab-connect-code" class="rule-chip" style="flex:1; padding:10px 8px; justify-content:center; font-size:0.85rem; font-weight:900; border-radius:12px; cursor:pointer; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); color:var(--text-dim);">
          ⌨️ Kod ile Bağlan
        </button>
      </div>

      <!-- 1. KAMERA İLE TARA PANELİ -->
      <div id="pane-connect-camera" style="display:block;">
        <div class="scanner-viewfinder" style="position:relative; width:100%; max-width:280px; height:240px; margin:0 auto 12px; border-radius:20px; overflow:hidden; background:#000; border:2px solid var(--primary); box-shadow:0 0 25px rgba(0,245,212,0.35);">
          <video id="inapp-scanner-video" playsinline muted autoplay style="width:100%; height:100%; object-fit:cover;"></video>
          <canvas id="inapp-scanner-canvas" style="display:none;"></canvas>
          
          <!-- Lazer Tarama Çizgisi -->
          <div class="scanner-laser" style="position:absolute; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent, #00F5D4, transparent); box-shadow:0 0 15px #00F5D4; animation:scanLaserSweep 2s infinite ease-in-out;"></div>
          
          <!-- Köşe Çerçeveleri -->
          <div style="position:absolute; inset:12px; pointer-events:none; border:2px dashed rgba(255,255,255,0.4); border-radius:14px;"></div>
          
          <!-- Kamera Açılamadı Fallback -->
          <div id="inapp-scanner-placeholder" style="display:none; position:absolute; inset:0; background:rgba(15,23,42,0.95); flex-direction:column; align-items:center; justify-content:center; padding:16px; gap:8px;">
            <div style="font-size:2rem;">📷❌</div>
            <div style="font-size:0.8rem; color:#EF4444; font-weight:800;">Kamera Başlatılamadı</div>
            <p style="font-size:0.75rem; color:#94A3B8;">Kamera izni verilmemiş olabilir veya başka bir uygulama tarafından kullanılıyor.</p>
          </div>
        </div>

        <div id="inapp-scanner-status" style="font-size:0.82rem; font-weight:800; color:var(--primary); margin-bottom:12px;">
          QR kodu yeşil karenin içine hizalayın
        </div>

        <button type="button" id="btn-inapp-pick-image" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-size:0.8rem; font-weight:800; padding:8px 16px; border-radius:12px; cursor:pointer;">
          🖼️ Galeriden QR Seç
        </button>
        <input type="file" id="file-inapp-qr-image" accept="image/*" style="display:none;" />
      </div>

      <!-- 2. KOD İLE BAĞLAN PANELİ -->
      <div id="pane-connect-code" style="display:none;">
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:18px; margin-bottom:14px;">
          <label style="font-size:0.8rem; font-weight:800; color:var(--gold); display:block; margin-bottom:6px;">4 VEYA 6 HANELİ ODA KODU:</label>
          <input type="text" id="inapp-input-room-code" placeholder="Örn: 8XFE" maxlength="8" style="width:100%; max-width:240px; background:rgba(0,0,0,0.6); border:2px solid var(--primary); border-radius:14px; padding:12px; color:#FFF; font-size:1.4rem; font-weight:900; text-align:center; letter-spacing:4px; text-transform:uppercase; outline:none; margin:0 auto 14px; display:block;" />
          
          <button type="button" id="btn-inapp-submit-code" class="btn-main" style="max-width:240px; margin:0 auto; padding:12px 24px; font-size:1rem;">
            🚀 Odaya Katıl
          </button>
        </div>

        <div id="inapp-code-status" style="display:none; margin-top:8px;"></div>
      </div>
    </div>
  </div>
  `;
  html = html.replace('<div id="orientation-warning"', modalHTML + '\n  <div id="orientation-warning"');
  console.log('Added modal-scan-and-connect before orientation-warning!');
}

// 4. Update Passaparola passa-wifi-box to include btn-passa-mod-open
if (!html.includes('id="btn-passa-mod-open"')) {
  const passaCopyBtn = '<button type="button" id="btn-copy-passa-link"';
  const passaModBtn = `<button type="button" id="btn-passa-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
            🛡️ Hakem / Oda Yönetimi
          </button>\n          ` + passaCopyBtn;
  html = html.replace(passaCopyBtn, passaModBtn);
  console.log('Added btn-passa-mod-open to passa-wifi-box!');
}

// 5. Update Carkifelek cark-wifi-box to include btn-copy-cark-link and btn-cark-mod-open
if (!html.includes('id="btn-copy-cark-link"')) {
  const carkTarget = '<div id="cark-player-count-badge"';
  const carkBtns = `
      <div style="display:flex; justify-content:center; gap:8px; margin-top:8px;">
        <button type="button" id="btn-copy-cark-link" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          📋 Bağlantıyı Kopyala
        </button>
        <button type="button" id="btn-cark-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          🛡️ Hakem / Oda Yönetimi
        </button>
      </div>\n      ` + carkTarget;
  html = html.replace(carkTarget, carkBtns);
  console.log('Added copy & mod buttons to cark-wifi-box!');
}

// 6. Update Saatli Bomba (screen-bomb) to include Passaparola-style mode switcher & wifi box
if (!html.includes('id="bomb-wifi-box"')) {
  const bombContentTarget = '<div id="bomb-game-content">';
  const bombWifiSection = `
    <!-- Mod Seçimi (Passaparola Standardı) -->
    <div style="display:flex; gap:10px; margin-bottom:12px;">
      <button type="button" id="btn-bomb-mode-local" class="btn-main active" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(0,245,212,0.18); border:1.5px solid var(--primary); color:#FFF; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">🎲 Tek Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--gold); opacity:0.95;">Masada Oyna</div>
      </button>
      <button type="button" id="btn-bomb-mode-wifi" class="btn-main" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); color:var(--text-dim); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">☁️ Çoklu Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--primary); opacity:0.85;">Bulut / QR Bağlantı</div>
      </button>
    </div>

    <!-- Wi-Fi / Bulut Bağlantı Kutusu -->
    <div id="bomb-wifi-box" style="display:none; background:rgba(0,0,0,0.35); border-radius:16px; padding:14px; margin-bottom:14px; text-align:center;">
      <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); margin-bottom:4px;">ARKADAŞLARIN BU QR'I OKUTARAK CANLI EKRANA BAĞLANSIN:</div>
      <div style="font-size:0.75rem; color:#00F5D4; font-weight:800; margin-bottom:6px;">☁️ Bomba telefonlar arasında canlı elden ele geçer, patlayan elenir!</div>
      <div id="bomb-qr-canvas" style="display:inline-block; margin:8px auto; border:2.5px solid var(--primary); border-radius:14px; padding:8px; background:#FFFFFF; box-shadow:0 0 25px rgba(0,245,212,0.4);"></div>
      <div style="font-size:1.15rem; font-weight:900; color:var(--gold); margin-top:4px;">
        ODA KODU: <span id="lbl-bomb-room-code" style="letter-spacing:3px;">----</span>
      </div>
      <div style="display:flex; justify-content:center; gap:8px; margin-top:8px;">
        <button type="button" id="btn-copy-bomb-link" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          📋 Bağlantıyı Kopyala
        </button>
        <button type="button" id="btn-bomb-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          🛡️ Hakem / Oda Yönetimi
        </button>
      </div>
      <div id="bomb-player-count-badge" style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-top:6px;">0 Oyuncu Bağlı</div>
      <div id="bomb-connected-players" style="margin-top:8px;"></div>
    </div>
  ` + bombContentTarget;
  html = html.replace(bombContentTarget, bombWifiSection);
  console.log('Added Passaparola-style wifi box to screen-bomb!');
}

// 7. Update Şişe Çevirmece (screen-bottle) to include Passaparola-style mode switcher & wifi box
if (!html.includes('id="bottle-wifi-box"')) {
  const bottleContentTarget = '<div id="bottle-game-content">';
  const bottleWifiSection = `
    <!-- Mod Seçimi (Passaparola Standardı) -->
    <div style="display:flex; gap:10px; margin-bottom:12px;">
      <button type="button" id="btn-bottle-mode-local" class="btn-main active" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(0,245,212,0.18); border:1.5px solid var(--primary); color:#FFF; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">🎲 Tek Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--gold); opacity:0.95;">Masada Oyna</div>
      </button>
      <button type="button" id="btn-bottle-mode-wifi" class="btn-main" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); color:var(--text-dim); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">☁️ Çoklu Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--primary); opacity:0.85;">Bulut / QR Bağlantı</div>
      </button>
    </div>

    <!-- Wi-Fi / Bulut Bağlantı Kutusu -->
    <div id="bottle-wifi-box" style="display:none; background:rgba(0,0,0,0.35); border-radius:16px; padding:14px; margin-bottom:14px; text-align:center;">
      <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); margin-bottom:4px;">ARKADAŞLARIN BU QR'I OKUTARAK CANLI EKRANA BAĞLANSIN:</div>
      <div style="font-size:0.75rem; color:#00F5D4; font-weight:800; margin-bottom:6px;">☁️ Şişe ve görevler herkesin telefonuna anında düşer, cesaret oylanır!</div>
      <div id="bottle-qr-canvas" style="display:inline-block; margin:8px auto; border:2.5px solid var(--primary); border-radius:14px; padding:8px; background:#FFFFFF; box-shadow:0 0 25px rgba(0,245,212,0.4);"></div>
      <div style="font-size:1.15rem; font-weight:900; color:var(--gold); margin-top:4px;">
        ODA KODU: <span id="lbl-bottle-room-code" style="letter-spacing:3px;">----</span>
      </div>
      <div style="display:flex; justify-content:center; gap:8px; margin-top:8px;">
        <button type="button" id="btn-copy-bottle-link" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          📋 Bağlantıyı Kopyala
        </button>
        <button type="button" id="btn-bottle-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          🛡️ Hakem / Oda Yönetimi
        </button>
      </div>
      <div id="bottle-player-count-badge" style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-top:6px;">0 Oyuncu Bağlı</div>
      <div id="bottle-connected-players" style="margin-top:8px;"></div>
    </div>
  ` + bottleContentTarget;
  html = html.replace(bottleContentTarget, bottleWifiSection);
  console.log('Added Passaparola-style wifi box to screen-bottle!');
}

// 8. Update Kelime Bombası (screen-kelime-bombasi) to include Passaparola-style mode switcher & wifi box
if (!html.includes('id="kelime-wifi-box"')) {
  const kelimeContentTarget = '<div id="kelime-active-stage"';
  const kelimeWifiSection = `
    <!-- Mod Seçimi (Passaparola Standardı) -->
    <div style="display:flex; gap:10px; margin-bottom:12px;">
      <button type="button" id="btn-kelime-mode-local" class="btn-main active" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(0,245,212,0.18); border:1.5px solid var(--primary); color:#FFF; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">🎲 Tek Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--gold); opacity:0.95;">Masada Oyna</div>
      </button>
      <button type="button" id="btn-kelime-mode-wifi" class="btn-main" style="flex:1; padding:10px 8px; border-radius:14px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); color:var(--text-dim); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer;">
        <div style="font-size:0.92rem; font-weight:900; letter-spacing:0.3px;">☁️ Çoklu Cihaz</div>
        <div style="font-size:0.72rem; font-weight:700; color:var(--primary); opacity:0.85;">Bulut / QR Bağlantı</div>
      </button>
    </div>

    <!-- Wi-Fi / Bulut Bağlantı Kutusu -->
    <div id="kelime-wifi-box" style="display:none; background:rgba(0,0,0,0.35); border-radius:16px; padding:14px; margin-bottom:14px; text-align:center;">
      <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); margin-bottom:4px;">ARKADAŞLARIN BU QR'I OKUTARAK CANLI EKRANA BAĞLANSIN:</div>
      <div style="font-size:0.75rem; color:#00F5D4; font-weight:800; margin-bottom:6px;">☁️ Harf ve kategori canlı akar, kelimeyi bilen zili çalar!</div>
      <div id="kelime-qr-canvas" style="display:inline-block; margin:8px auto; border:2.5px solid var(--primary); border-radius:14px; padding:8px; background:#FFFFFF; box-shadow:0 0 25px rgba(0,245,212,0.4);"></div>
      <div style="font-size:1.15rem; font-weight:900; color:var(--gold); margin-top:4px;">
        ODA KODU: <span id="lbl-kelime-room-code" style="letter-spacing:3px;">----</span>
      </div>
      <div style="display:flex; justify-content:center; gap:8px; margin-top:8px;">
        <button type="button" id="btn-copy-kelime-link" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          📋 Bağlantıyı Kopyala
        </button>
        <button type="button" id="btn-kelime-mod-open" style="background:rgba(251,191,36,0.15); border:1px solid #FBBF24; color:#FBBF24; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:999px; cursor:pointer;">
          🛡️ Hakem / Oda Yönetimi
        </button>
      </div>
      <div id="kelime-player-count-badge" style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-top:6px;">0 Oyuncu Bağlı</div>
      <div id="kelime-connected-players" style="margin-top:8px;"></div>
    </div>
  ` + kelimeContentTarget;
  html = html.replace(kelimeContentTarget, kelimeWifiSection);
  console.log('Added Passaparola-style wifi box to screen-kelime-bombasi!');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully with all wifi boxes and connect modal!');

