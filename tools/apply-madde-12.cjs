// tools/apply-madde-12.cjs
// Madde 12: Bir Kelime Bir İşlem - Takımların Belirgin Ayrışması, Manuel Süre Ayarı & Geri Al Butonunun Tamiri

const fs = require('fs');
const path = require('path');

const kelimeJsPath = path.join(__dirname, '..', 'js', 'kelime-islem-game.js');
let content = fs.readFileSync(kelimeJsPath, 'utf8');

console.log('🚀 Madde 12: Bir Kelime Bir İşlem Güncellemesi Başlatılıyor...');

// 1. undoLastCalculation ve undoLastLetter Metotlarını Güçlendir
const newUndoMethods = `  // Geri Al Motoru: Bekleyen seçimi veya son işlemi geri al (Madde 12)
  undoLastCalculation() {
    sounds.playClick();

    // 1. Eğer bekleyen bir işlem veya ilk sayı seçimi varsa önce onu iptal et
    if (this.selectedOp || this.selectedNum1) {
      this.selectedNum1 = null;
      this.selectedOp = null;
      this.renderScreen();
      return;
    }

    // 2. Eğer bekleyen seçim yoksa son tamamlanan hesaplamayı geri al
    if (this.calcHistory.length === 0) return;
    const last = this.calcHistory.pop();
    
    // Yeni oluşturulan sonuç kartını kaldır
    this.availableNumbers = this.availableNumbers.filter(c => c.id !== last.newId);

    // Eski iki kartı yeniden aktif yap
    const c1 = this.availableNumbers.find(c => c.id === last.num1Id);
    if (c1) c1.used = false;
    const c2 = this.availableNumbers.find(c => c.id === last.num2Id);
    if (c2) c2.used = false;

    this.selectedNum1 = null;
    this.selectedOp = null;
    this.updateBestPlayerValue();
    this.renderScreen();
  }

  // Kelime etabında son eklenen harfi geri alma (Madde 12)
  undoLastLetter() {
    if (this.selectedLetterIndices.length === 0) return;
    sounds.playClick();
    this.selectedLetterIndices.pop();
    this.buildCurrentWord();
    this.renderScreen();
  }

  // Oyun İçi Süre Kontrolleri (Duraklat / +15s Ek Süre)
  togglePauseTimer() {
    sounds.playClick();
    if (this.isTimerPaused) {
      this.isTimerPaused = false;
      this.startTimer(this.currentSeconds);
    } else {
      this.isTimerPaused = true;
      if (this.timerInterval) clearInterval(this.timerInterval);
    }
    this.renderScreen();
  }

  addExtraSeconds(sec = 15) {
    sounds.playClick();
    this.currentSeconds = Math.min(this.currentSeconds + sec, 180);
    const el = document.getElementById('ki-timer-seconds');
    if (el) el.textContent = this.currentSeconds;
  }`;

// Replace undoLastCalculation in js/kelime-islem-game.js
content = content.replace(/undoLastCalculation\(\)\s*\{[\s\S]*?this\.renderScreen\(\);\s*\}/, newUndoMethods);

// 2. renderScoreHeader içine DEVA AKTİF TAKIM BANNER'ı ekle (Takımların Ayrışması)
const newScoreHeader = `  renderScoreHeader() {
    let teamBanner = '';
    if (this.playerMode === 'duel') {
      const isRed = this.currentTurn === 'red';
      teamBanner = \`
        <div style="background:\${isRed ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, #3B82F6, #1E40AF)'}; color:#FFF; font-size:1.15rem; font-weight:900; padding:10px 16px; border-radius:14px; box-shadow:0 0 20px \${isRed ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}; margin-bottom:12px; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>\${isRed ? '🔴' : '🔵'}</span>
          <span>SIRA: \${isRed ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM'}</span>
          <span>\${isRed ? '🔴' : '🔵'}</span>
        </div>
      \`;

      return \`
        \${teamBanner}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div style="background:rgba(239,68,68,0.18); border:2px solid \${this.currentTurn === 'red' ? '#EF4444' : 'rgba(239,68,68,0.3)'}; border-radius:14px; padding:10px 12px; text-align:left; box-shadow:\${this.currentTurn === 'red' ? '0 0 18px rgba(239,68,68,0.4)' : 'none'};">
            <div style="font-size:0.75rem; font-weight:800; color:#EF4444;">🔴 Kırmızı Takım \${this.currentTurn === 'red' ? '★ YARIŞIYOR' : ''}</div>
            <div style="font-size:1.4rem; font-weight:900; color:#FFF;">\${this.scores.red} P</div>
          </div>
          <div style="background:rgba(59,130,246,0.18); border:2px solid \${this.currentTurn === 'blue' ? '#3B82F6' : 'rgba(59,130,246,0.3)'}; border-radius:14px; padding:10px 12px; text-align:left; box-shadow:\${this.currentTurn === 'blue' ? '0 0 18px rgba(59,130,246,0.4)' : 'none'};">
            <div style="font-size:0.75rem; font-weight:800; color:#3B82F6;">🔵 Mavi Takım \${this.currentTurn === 'blue' ? '★ YARIŞIYOR' : ''}</div>
            <div style="font-size:1.4rem; font-weight:900; color:#FFF;">\${this.scores.blue} P</div>
          </div>
        </div>
      \`;
    }

    return \`
      <div style="background:rgba(251,191,36,0.14); border:1.5px solid var(--gold); border-radius:14px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.9rem; font-weight:900; color:var(--gold);">👤 BİREYSEL PRATİK</span>
        <span style="font-size:1.35rem; font-weight:900; color:#FFF;">\${this.scores.solo} PUAN</span>
      </div>
    \`;
  }`;

content = content.replace(/renderScoreHeader\(\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}/, newScoreHeader);

// 3. renderKelimePlayView İçine "Son Harfi Geri Al" Butonu ve Manuel Süre Butonları Ekle
const oldKelimePlayActions = `<div style="display:grid; grid-template-columns:1fr 2fr; gap:8px;">
          <button type="button" id="btn-clear-word" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px; border-radius:12px; cursor:pointer;">
            🗑️ Temizle
          </button>
          <button type="button" id="btn-submit-word" class="btn-main primary" style="font-size:1rem; font-weight:900; padding:12px; border-radius:12px; cursor:pointer;">
            ✅ Kelimeyi Onayla (\${this.currentWord.length} Harf)
          </button>
        </div>`;

const newKelimePlayActions = `<!-- Süre Kontrolleri (+15s & Duraklat) -->
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-bottom:10px;">
          <button type="button" id="btn-ki-add-time" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; cursor:pointer;">
            +15s Ekle
          </button>
          <button type="button" id="btn-ki-pause-timer" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; cursor:pointer;">
            \${this.isTimerPaused ? '▶️ Devam Et' : '⏸️ Duraklat'}
          </button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1.6fr; gap:8px;">
          <button type="button" id="btn-undo-word" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px 6px; border-radius:12px; cursor:pointer; background:rgba(251,191,36,0.15); border:1.5px solid var(--gold); color:var(--gold);" \${this.selectedLetterIndices.length === 0 ? 'disabled' : ''}>
            ⌫ Geri Al
          </button>
          <button type="button" id="btn-clear-word" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px 6px; border-radius:12px; cursor:pointer;">
            🗑️ Temizle
          </button>
          <button type="button" id="btn-submit-word" class="btn-main primary" style="font-size:0.95rem; font-weight:900; padding:12px 6px; border-radius:12px; cursor:pointer;">
            ✅ Onayla (\${this.currentWord.length})
          </button>
        </div>`;

content = content.replace(oldKelimePlayActions, newKelimePlayActions);

// 4. bindKelimePlayEvents İçine btn-undo-word ve süre butonlarını bağla
const oldBindKelime = `document.getElementById('btn-clear-word')?.addEventListener('click', () => this.clearWord());`;
const newBindKelime = `document.getElementById('btn-undo-word')?.addEventListener('click', () => this.undoLastLetter());
    document.getElementById('btn-ki-add-time')?.addEventListener('click', () => this.addExtraSeconds(15));
    document.getElementById('btn-ki-pause-timer')?.addEventListener('click', () => this.togglePauseTimer());
    document.getElementById('btn-clear-word')?.addEventListener('click', () => this.clearWord());`;
content = content.replace(oldBindKelime, newBindKelime);

// 5. renderIslemPlayView İçinde Geri Al Butonunu Her Zaman Aktif Yap (Bekleyen Seçimleri de Geri Alsın)
const oldIslemUndoBtn = `<button type="button" id="btn-undo-islem" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px; border-radius:12px; cursor:pointer;" \${this.calcHistory.length === 0 ? 'disabled' : ''}>
            ↩️ Geri Al
          </button>`;

const newIslemUndoBtn = `<!-- Süre Kontrolleri (+15s & Duraklat) -->
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-bottom:10px;">
          <button type="button" id="btn-ki-islem-add-time" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; cursor:pointer;">
            +15s Ekle
          </button>
          <button type="button" id="btn-ki-islem-pause-timer" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; cursor:pointer;">
            \${this.isTimerPaused ? '▶️ Devam Et' : '⏸️ Duraklat'}
          </button>
        </div>

        <button type="button" id="btn-undo-islem" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px; border-radius:12px; cursor:pointer; background:rgba(251,191,36,0.15); border:1.5px solid var(--gold); color:var(--gold);" \${(this.calcHistory.length === 0 && !this.selectedNum1 && !this.selectedOp) ? 'disabled' : ''}>
            ↩️ Geri Al / İptal
          </button>`;

content = content.replace(oldIslemUndoBtn, newIslemUndoBtn);

// 6. bindIslemPlayEvents İçine Süre Butonlarını Bağla
const oldBindIslem = `document.getElementById('btn-undo-islem')?.addEventListener('click', () => this.undoLastCalculation());`;
const newBindIslem = `document.getElementById('btn-ki-islem-add-time')?.addEventListener('click', () => this.addExtraSeconds(15));
    document.getElementById('btn-ki-islem-pause-timer')?.addEventListener('click', () => this.togglePauseTimer());
    document.getElementById('btn-undo-islem')?.addEventListener('click', () => this.undoLastCalculation());`;
content = content.replace(oldBindIslem, newBindIslem);

fs.writeFileSync(kelimeJsPath, content, 'utf8');
console.log('🎉 Madde 12 başarıyla uygulandı!');

