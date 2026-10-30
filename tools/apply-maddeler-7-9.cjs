// tools/apply-maddeler-7-9.cjs
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const bombJsPath = path.join(rootDir, 'js', 'bomb-game.js');
const bottleJsPath = path.join(rootDir, 'js', 'bottle-game.js');
const indexPath = path.join(rootDir, 'index.html');

console.log('🚀 Madde 7 ve Madde 9 Geliştirmeleri Başlatılıyor...');

// ==========================================
// 1. MADDE 7: SAATLİ BOMBA "SÖYLEDİM! PASLA!" BUTONU
// ==========================================
let bombCode = fs.readFileSync(bombJsPath, 'utf8');
const isCRLFBomb = bombCode.includes('\r\n');
bombCode = bombCode.replace(/\r\n/g, '\n');

// startRound içindeki buton alanını devasa ve ergonomik yap
const oldBtnRegex = /<button type="button" id="btn-bomb-pass"[\s\S]*?<\/button>\s*<p style="font-size:0\.78rem;/;
const newBtnHtml = `<!-- DEVA SAATLİ BOMBA PASLA BUTONU (Madde 7) -->
        <button type="button" id="btn-bomb-pass" class="btn-main" style="width:100%; min-height:125px; background:linear-gradient(135deg, #FF0844, #FF4E50); color:#FFFFFF; font-size:1.85rem; font-weight:900; padding:20px 16px; box-shadow:0 0 35px rgba(255,8,68,0.7), inset 0 2px 10px rgba(255,255,255,0.5); border:3.5px solid #FFFFFF; border-radius:26px; letter-spacing:1px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; touch-action:manipulation; user-select:none; -webkit-user-select:none; -webkit-tap-highlight-color:transparent; transition:transform 0.1s, box-shadow 0.1s; margin-bottom:12px;">
          <span style="font-size:2.2rem; line-height:1; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4));">💥 SÖYLEDİM!</span>
          <span style="font-size:1.3rem; color:#FFE4E6; font-weight:900; letter-spacing:2px;">👉 SIRADAKİNE PASLA! ➔</span>
        </button>

        <p style="font-size:0.78rem;`;

if (oldBtnRegex.test(bombCode)) {
  bombCode = bombCode.replace(oldBtnRegex, newBtnHtml);
  console.log('✓ js/bomb-game.js: Söyledim! Pasla! butonu devasa ve ergonomik yapıldı.');
} else {
  console.warn('⚠️ js/bomb-game.js: btn-bomb-pass regex eşleşmedi!');
}

// Buton dinleyicisini hem pointerdown hem click ile anında tepki verecek şekilde bağla
const oldListenerRegex = /document\.getElementById\('btn-bomb-pass'\)\.addEventListener\('click'[\s\S]*?\}\);/;
const newListener = `const btnPass = document.getElementById('btn-bomb-pass');
    if (btnPass) {
      let isPassing = false;
      const doPass = (e) => {
        if (e && e.cancelable && e.type === 'pointerdown') e.preventDefault();
        if (isPassing) return;
        isPassing = true;
        try { navigator.vibrate?.([60, 40, 60]); } catch (err) {}
        btnPass.style.transform = 'scale(0.93)';
        setTimeout(() => { btnPass.style.transform = 'scale(1)'; isPassing = false; }, 140);
        this.passTurn();
      };
      btnPass.addEventListener('pointerdown', doPass);
      btnPass.addEventListener('click', doPass);
    }`;

if (oldListenerRegex.test(bombCode)) {
  bombCode = bombCode.replace(oldListenerRegex, newListener);
  console.log('✓ js/bomb-game.js: Buton dokunmatik gecikmesiz bağlandı.');
}

if (isCRLFBomb) bombCode = bombCode.replace(/\n/g, '\r\n');
fs.writeFileSync(bombJsPath, bombCode, 'utf8');

// ==========================================
// 2. MADDE 9: ŞİŞE ÇEVİRME YERİNE İSİMLİ DOĞRULUK / CESARET ÇARKI
// ==========================================
// Soruları koruyarak BottleGameEngine sınıfını isimli çark motoru olarak baştan yazıyoruz
let bottleCode = fs.readFileSync(bottleJsPath, 'utf8');
const isCRLFBottle = bottleCode.includes('\r\n');
bottleCode = bottleCode.replace(/\r\n/g, '\n');

// BottleGameEngine sınıfının başlangıcını bul
const classStartIdx = bottleCode.indexOf('export class BottleGameEngine');
if (classStartIdx !== -1) {
  const questionsPart = bottleCode.substring(0, classStartIdx);
  
  const newEngineCode = `export class BottleGameEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'party'; // 'party' | 'adult'
    this.isSpinning = false;
    this.currentCardType = null; // 'truth' | 'dare'
    this.selectedPlayer = null;

    // Oyuncu Listesi (Local Storage'da Saklanır)
    const saved = localStorage.getItem('kafanatak_dc_wheel_players');
    this.players = saved ? JSON.parse(saved) : ['Murat', 'Zeynep', 'Efe', 'Selin'];

    // Çark Görsel Durumu
    this.rotation = 0;
    this.spinAnimId = null;

    // Her kategori için tekrarsız deste yöneticisi
    this.decks = {
      partyTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_PARTY),
      partyDare: new NonRepeatingDeck(DARE_CHALLENGES_PARTY),
      adultTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_ADULT),
      adultDare: new NonRepeatingDeck(DARE_CHALLENGES_ADULT)
    };
  }

  savePlayers() {
    try {
      localStorage.setItem('kafanatak_dc_wheel_players', JSON.stringify(this.players));
    } catch (e) {}
  }

  addPlayer(name) {
    const clean = (name || '').trim();
    if (!clean) return;
    if (this.players.length >= 12) {
      alert('En fazla 12 oyuncu ekleyebilirsiniz.');
      return;
    }
    this.players.push(clean);
    this.savePlayers();
    sounds.playClick();
    this.renderScreen();
  }

  removePlayer(idx) {
    if (this.players.length <= 2) {
      alert('En az 2 oyuncu olmalıdır.');
      return;
    }
    this.players.splice(idx, 1);
    this.savePlayers();
    sounds.playClick();
    this.renderScreen();
  }

  setMode(mode) {
    sounds.playClick();
    this.mode = mode;
    this.renderScreen();
  }

  init() {
    this.renderScreen();
  }

  renderScreen() {
    const container = document.getElementById('bottle-game-content');
    if (!container) return;

    container.innerHTML = \`
      <div class="card" style="text-align:center; max-width:480px; margin:0 auto; padding:18px 14px;">
        <!-- Mod Seçici -->
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
          <button type="button" id="btn-bottle-mode-party" class="filter-chip \${this.mode === 'party' ? 'active' : ''}" style="font-size:0.82rem; padding:8px 18px; border-radius:999px; cursor:pointer;">
            🎉 Parti Modu
          </button>
          <button type="button" id="btn-bottle-mode-adult" class="filter-chip \${this.mode === 'adult' ? 'active' : ''}" style="font-size:0.82rem; padding:8px 18px; border-radius:999px; cursor:pointer;">
            🔞 Yetişkinler (+18)
          </button>
        </div>

        <!-- Oyuncu Ekleme & Yönetim Barı -->
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.1); border-radius:16px; padding:12px; margin-bottom:14px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.82rem; font-weight:800; color:var(--gold);">👥 ÇARKTAKİ OYUNCULAR (\${this.players.length})</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">Min 2 - Max 12</span>
          </div>

          <!-- Oyuncu İsim Hapları -->
          <div id="dc-player-pills-list" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            \${this.players.map((p, idx) => \`
              <span class="player-pill" style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); padding:5px 10px; border-radius:999px; font-size:0.82rem; font-weight:800; color:#FFF;">
                <span>👤 \${p}</span>
                \${this.players.length > 2 ? \`<button type="button" class="btn-remove-dc-player" data-idx="\${idx}" style="background:none; border:none; color:#EF4444; font-weight:900; cursor:pointer; font-size:0.85rem; padding:0 2px;">✕</button>\` : ''}
              </span>
            \`).join('')}
          </div>

          <!-- Hızlı Oyuncu Ekle Formu -->
          <div style="display:flex; gap:8px;">
            <input type="text" id="inp-add-dc-player" placeholder="Yeni oyuncu adı yazın..." maxlength="15" style="flex:1; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:10px; padding:8px 12px; color:#FFF; font-size:0.85rem; font-weight:700; outline:none;" />
            <button type="button" id="btn-add-dc-player" style="background:linear-gradient(135deg, #00F5D4, #0072FF); color:#0B0E14; border:none; border-radius:10px; padding:8px 14px; font-size:0.85rem; font-weight:900; cursor:pointer; white-space:nowrap;">
              + Ekle
            </button>
          </div>
        </div>

        <!-- 3D İSİMLİ DOĞRULUK / CESARET ÇARKI (Madde 9) -->
        <div style="position:relative; width:280px; height:280px; margin:0 auto 14px;">
          <!-- Çark İbresi -->
          <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); font-size:1.8rem; color:#FFD166; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8)); z-index:10; pointer-events:none;">
            🔻
          </div>
          
          <canvas id="dc-wheel-canvas" width="280" height="280" style="width:280px; height:280px; border-radius:50%; box-shadow:0 0 35px rgba(255,46,147,0.3);"></canvas>
          
          <!-- Çark Merkez Rozeti -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, #FF2E93, #7928CA); border:3px solid #FFF; box-shadow:0 0 20px rgba(255,46,147,0.7); display:flex; align-items:center; justify-content:center; color:#FFF; font-size:1.5rem; pointer-events:none; z-index:5;">
            🎡
          </div>
        </div>

        <!-- Aksiyon & Karar Alanı -->
        <div id="bottle-action-area">
          <button type="button" id="btn-spin-dc-wheel" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); font-size:1.15rem; font-weight:900; padding:16px 20px; box-shadow:0 0 25px rgba(255,46,147,0.45); border-radius:999px; width:100%; border:none; color:#FFF; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
            <span>🎡 ÇARKI ÇEVİR!</span>
          </button>
        </div>
      </div>
    \`;

    // Buton Dinleyicilerini Bağla
    document.getElementById('btn-bottle-mode-party').onclick = () => this.setMode('party');
    document.getElementById('btn-bottle-mode-adult').onclick = () => this.setMode('adult');
    document.getElementById('btn-spin-dc-wheel').onclick = () => this.spinWheel();

    // Oyuncu Silme Butonları
    container.querySelectorAll('.btn-remove-dc-player').forEach(b => {
      b.onclick = () => this.removePlayer(parseInt(b.dataset.idx, 10));
    });

    // Oyuncu Ekle
    const inpAdd = document.getElementById('inp-add-dc-player');
    const btnAdd = document.getElementById('btn-add-dc-player');
    if (btnAdd && inpAdd) {
      btnAdd.onclick = () => {
        this.addPlayer(inpAdd.value);
        inpAdd.value = '';
      };
      inpAdd.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addPlayer(inpAdd.value);
          inpAdd.value = '';
        }
      };
    }

    // Çarkı Çiz
    this.drawWheel();
  }

  drawWheel() {
    const canvas = document.getElementById('dc-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 6;

    const numSlices = this.players.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const colors = [
      '#FF2E93', '#00F5D4', '#FBBF24', '#7928CA',
      '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6',
      '#14B8A6', '#F59E0B', '#A855F7', '#EC4899'
    ];

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();

      // Dilim rengi
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Kenar çizgisi
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0B0E14';
      ctx.stroke();

      // Oyuncu Adını Yaz
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 4;
      
      const pName = this.players[i];
      const maxTextWidth = r - 48;
      let displayName = pName;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        displayName = displayName.substring(0, 8) + '..';
      }
      ctx.fillText(displayName, r - 16, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  spinWheel() {
    if (this.isSpinning || this.players.length < 2) return;
    this.isSpinning = true;

    const btnSpin = document.getElementById('btn-spin-dc-wheel');
    if (btnSpin) {
      btnSpin.disabled = true;
      btnSpin.style.opacity = '0.6';
    }

    // Rastgele seçilecek oyuncu indeksi
    const targetIdx = Math.floor(Math.random() * this.players.length);
    const numSlices = this.players.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Hedef oyuncunun açısı ibrenin (üst = 1.5 * PI) altına gelsin
    const targetMidAngle = targetIdx * sliceAngle + sliceAngle / 2;
    const desiredFinalRotation = (1.5 * Math.PI) - targetMidAngle;

    const minRotations = 6;
    const extraTurns = minRotations * (2 * Math.PI);
    const startRot = this.rotation % (2 * Math.PI);
    let targetRot = startRot + extraTurns + (desiredFinalRotation - startRot);
    while (targetRot < startRot + extraTurns) {
      targetRot += (2 * Math.PI);
    }

    const duration = 3800; // 3.8 saniye dönüş
    const startTime = performance.now();
    let lastTickSlice = -1;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3.5);
      this.rotation = startRot + (targetRot - startRot) * ease;
      this.drawWheel();

      // Dilim geçişlerinde mekanik ses
      const currentNeedle = (1.5 * Math.PI - (this.rotation % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(currentNeedle / sliceAngle);
      if (currentSlice !== lastTickSlice && progress < 0.96) {
        lastTickSlice = currentSlice;
        try { sounds.playWheelTick(); } catch (e) {}
      }

      if (progress < 1) {
        this.spinAnimId = requestAnimationFrame(animate);
      } else {
        this.spinAnimId = null;
        this.isSpinning = false;
        try { sounds.playBell(); } catch (e) {}
        this.selectedPlayer = this.players[targetIdx];
        this.promptTruthOrDare(this.selectedPlayer);
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }

  promptTruthOrDare(playerName) {
    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    actionArea.innerHTML = \`
      <div style="background:rgba(0,0,0,0.65); border:2px solid var(--gold); border-radius:20px; padding:20px; animation:popIn 0.3s ease; box-shadow:0 0 30px rgba(251,191,36,0.35);">
        <div style="font-size:1.6rem; margin-bottom:4px;">🎯</div>
        <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); text-transform:uppercase;">ÇARK DURDU!</div>
        <div style="font-size:1.45rem; font-weight:900; color:var(--gold); margin:4px 0 10px;">
          👑 \${playerName} Seçiyor!
        </div>
        <p style="font-size:0.85rem; color:#CBD5E1; margin-bottom:16px;">
          Cesaretin var mı, yoksa dürüstçe itiraf mı edeceksin?
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <button type="button" id="btn-choose-truth" class="btn-main" style="background:linear-gradient(135deg, #00F5D4, #00ba9f); color:#0B0E14; font-size:1.05rem; font-weight:900; padding:15px; border-radius:14px; cursor:pointer; border:none; box-shadow:0 0 15px rgba(0,245,212,0.35);">
            🤔 DOĞRULUK
          </button>
          <button type="button" id="btn-choose-dare" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); color:#FFF; font-size:1.05rem; font-weight:900; padding:15px; border-radius:14px; cursor:pointer; border:none; box-shadow:0 0 15px rgba(255,46,147,0.35);">
            🔥 CESARET
          </button>
        </div>
      </div>
    \`;

    document.getElementById('btn-choose-truth').addEventListener('click', () => this.showCard('truth'));
    document.getElementById('btn-choose-dare').addEventListener('click', () => this.showCard('dare'));
  }

  getNextItem(type) {
    const deckKey = \`\${this.mode}\${type === 'truth' ? 'Truth' : 'Dare'}\`;
    const deck = this.decks[deckKey];
    return deck ? deck.draw() : "Sorular tükenmedi, devam!";
  }

  showCard(type) {
    sounds.playClick();
    this.currentCardType = type;
    const text = this.getNextItem(type);

    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    const isTruth = type === 'truth';
    actionArea.innerHTML = \`
      <div style="background:linear-gradient(135deg, \${isTruth ? '#064e3b, #0f172a' : '#450a0a, #0f172a'}); border:2px solid \${isTruth ? '#00F5D4' : '#FF2E93'}; border-radius:20px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); animation:popIn 0.3s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="background:\${isTruth ? 'rgba(0,245,212,0.2)' : 'rgba(255,46,147,0.2)'}; color:\${isTruth ? '#00F5D4' : '#FF2E93'}; font-size:0.78rem; font-weight:900; padding:4px 12px; border-radius:999px;">
            \${isTruth ? '🤔 DOĞRULUK İTİRAFI' : '🔥 CESARET GÖREVİ'}
          </span>
          <span style="font-size:0.8rem; font-weight:800; color:var(--gold);">
            👤 \${this.selectedPlayer || 'Sıradaki Oyuncu'}
          </span>
        </div>

        <div id="bottle-card-text" style="font-size:1.25rem; font-weight:900; color:#FFF; line-height:1.45; margin:16px 0 20px; min-height:64px; display:flex; align-items:center; justify-content:center; text-align:center;">
          "\${text}"
        </div>

        <!-- Aksiyon Butonları -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" id="btn-spin-again" class="btn-main primary" style="font-size:1.05rem; padding:14px 24px; border-radius:999px; cursor:pointer; width:100%; box-shadow:0 6px 20px rgba(255,46,147,0.4); border:none; font-weight:900;">
            🎡 Sıradaki Oyuncuya Çevir
          </button>
          <button type="button" id="btn-change-question" class="btn-secondary" style="font-size:0.85rem; padding:9px 18px; border-radius:999px; cursor:pointer; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-weight:800;">
            🔀 Başka \${isTruth ? 'Soru' : 'Görev'} Getir (Farklı Seçenek)
          </button>
        </div>
      </div>
    \`;

    document.getElementById('btn-spin-again').addEventListener('click', () => {
      this.renderScreen();
      this.spinWheel();
    });

    document.getElementById('btn-change-question').addEventListener('click', () => {
      sounds.playClick();
      const newText = this.getNextItem(this.currentCardType);
      const textEl = document.getElementById('bottle-card-text');
      if (textEl) {
        textEl.style.animation = 'none';
        void textEl.offsetWidth; // reflow
        textEl.style.animation = 'popIn 0.25s ease';
        textEl.textContent = \`"\${newText}"\`;
      }
    });
  }
}
`;

  bottleCode = questionsPart + newEngineCode;
  console.log('✓ js/bottle-game.js: Doğruluk / Cesaret İsimli Çark Motoru başarıyla entegre edildi.');
} else {
  console.warn('⚠️ js/bottle-game.js: BottleGameEngine class bulunamadı!');
}

if (isCRLFBottle) bottleCode = bottleCode.replace(/\n/g, '\r\n');
fs.writeFileSync(bottleJsPath, bottleCode, 'utf8');

// ==========================================
// 3. INDEX.HTML KART VE BAŞLIK GÜNCELLEMESİ
// ==========================================
let html = fs.readFileSync(indexPath, 'utf8');
const isCRLFHtml = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 3.1. Parti Oyunları listesindeki kart başlığını güncelle
html = html.replace(
  '<span class="party-tag party-tag-pink">🍾 3D Dönen Şişe</span>',
  '<span class="party-tag party-tag-pink">🎡 İsimli Çark</span>'
);
html = html.replace(
  '<h3 style="font-size:1.35rem; font-weight:900; color:#FFF; margin-bottom:4px;">Şişe Çevirmece (D & C)</h3>',
  '<h3 style="font-size:1.35rem; font-weight:900; color:#FFF; margin-bottom:4px;">Doğruluk mu Cesaret mi? (Şans Çarkı)</h3>'
);
html = html.replace(
  'Şişeyi masanın ortasında çevir! Kime denk gelirse Doğruluk veya Cesaret seçer.',
  'Masadaki oyuncuların adlarını girin, çarkı çevirin! Kime gelirse Doğruluk veya Cesaret seçsin.'
);
html = html.replace('<span>🍾 Şişeyi Çevir</span>', '<span>🎡 Çarkı Çevir</span>');

// 3.2. Ekran başlığını güncelle
html = html.replace(
  '<div style="font-size:1.1rem; font-weight:900; color:#FFF;">🍾 ŞİŞE ÇEVİRMECE</div>',
  '<div style="font-size:1.1rem; font-weight:900; color:#FFF;">🎡 DOĞRULUK MU CESARET Mİ?</div>'
);

if (isCRLFHtml) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✓ index.html: Kart başlıkları ve açıklamaları güncellendi.');

console.log('🎉 Madde 7 ve Madde 9 başarıyla tamamlandı!');
