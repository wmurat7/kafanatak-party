// js/carkifelek-game.js
// Kafana Tak! - Klasik Çarkıfelek (Puan Çarkı & Gizli Kelime Panosu) Motoru
// TV formatında, ses efektli, takım ve oyuncu savaşlı parti oyunu

import { sounds } from './audio.js';

export const CARKIFELEK_SLICES = [
  { text: '500', value: 500, color: '#00F5D4', type: 'points' },
  { text: '250', value: 250, color: '#FBBF24', type: 'points' },
  { text: 'İFLAS', value: 0, color: '#EF4444', type: 'bankrupt' },
  { text: '1000', value: 1000, color: '#3B82F6', type: 'points' },
  { text: '750', value: 750, color: '#A855F7', type: 'points' },
  { text: 'PAS', value: 0, color: '#64748B', type: 'pass' },
  { text: '300', value: 300, color: '#10B981', type: 'points' },
  { text: '1500', value: 1500, color: '#EC4899', type: 'points' },
  { text: 'TEKRAR', value: 0, color: '#06B6D4', type: 'spin_again' },
  { text: '400', value: 400, color: '#F59E0B', type: 'points' },
  { text: 'İFLAS', value: 0, color: '#B91C1C', type: 'bankrupt' },
  { text: '2000', value: 2000, color: '#8B5CF6', type: 'points' },
  { text: '600', value: 600, color: '#14B8A6', type: 'points' },
  { text: 'ÖDÜL', value: 1000, color: '#FF2E93', type: 'reward' },
  { text: '350', value: 350, color: '#EAB308', type: 'points' },
  { text: '3000', value: 3000, color: '#F43F5E', type: 'points' }
];

export const CARKIFELEK_PUZZLES = [
  { category: '🎬 Popüler Türk Filmi', phrase: 'NEŞELİ GÜNLER' },
  { category: '🎬 Popüler Türk Filmi', phrase: 'TOSUN PAŞA' },
  { category: '🎬 Popüler Türk Filmi', phrase: 'HER ŞEY ÇOK GÜZEL OLACAK' },
  { category: '🎬 Popüler Türk Filmi', phrase: 'SÜT KARDEŞLER' },
  { category: '📜 Atasözü & Deyim', phrase: 'DAM ÜSTÜNDE SAKSAĞAN' },
  { category: '📜 Atasözü & Deyim', phrase: 'TATLI DİL YILANI DELİĞİNDEN ÇIKARIR' },
  { category: '📜 Atasözü & Deyim', phrase: 'BİR ELİN NESİ VAR İKİ ELİN SESİ VAR' },
  { category: '📜 Atasözü & Deyim', phrase: 'GÜLME KOMŞUNA GELİR BAŞINA' },
  { category: '📜 Atasözü & Deyim', phrase: 'SAKLA SAMANI GELİR ZAMANI' },
  { category: '🎵 Efsane Şarkı', phrase: 'ARKADAŞIM EŞEK' },
  { category: '🎵 Efsane Şarkı', phrase: 'ŞIKIDIM ŞIKIDIM' },
  { category: '🎵 Efsane Şarkı', phrase: 'GÜLBEYAZ GÜLÜM' },
  { category: '📺 Dizi & Karakter', phrase: 'AVRUPA YAKASI BURHAN ALTINTOP' },
  { category: '📺 Dizi & Karakter', phrase: 'LEYLA İLE MECNUN' },
  { category: '📺 Dizi & Karakter', phrase: 'YALAN DÜNYA VASIYET' }
];

export const TURKISH_CONSONANTS = ['B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'];
export const TURKISH_VOWELS = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];

export class CarkifelekEngine {
  constructor(game) {
    this.game = game;
    this.teams = [
      { name: 'Kırmızı Takım', score: 0, color: '#EF4444' },
      { name: 'Mavi Takım', score: 0, color: '#3B82F6' }
    ];
    this.currentTeamIndex = 0;
    this.currentPuzzle = null;
    this.guessedLetters = new Set();
    this.currentSlice = null;
    this.isSpinning = false;
    this.canPickLetter = false;

    this.wheelRotation = 0;
    this.canvas = null;
    this.ctx = null;
    this.isSpinning = false;
    this.spinAnimId = null;

    window.__carkifelek = this;
  }

  init() {
    if (this.spinAnimId) {
      cancelAnimationFrame(this.spinAnimId);
      this.spinAnimId = null;
    }
    this.isSpinning = false;

    this.canvas = document.getElementById('carkifelek-wheel-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.style.cursor = 'pointer';
      this.canvas.onclick = () => {
        if (!this.isSpinning && !this.canPickLetter) {
          this.spinWheel();
        }
      };
      this.drawWheel();
    }
    this.bindEvents();
    this.newGame();
  }

  bindEvents() {
    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) {
      btnSpin.onclick = () => this.spinWheel();
    }

    const btnSolve = document.getElementById('btn-cark-solve');
    if (btnSolve) {
      btnSolve.onclick = () => this.promptSolve();
    }

    const btnBuyVowel = document.getElementById('btn-cark-buy-vowel');
    if (btnBuyVowel) {
      btnBuyVowel.onclick = () => this.openVowelModal();
    }

    const btnNewPuzzle = document.getElementById('btn-cark-new-puzzle');
    if (btnNewPuzzle) {
      btnNewPuzzle.onclick = () => this.newRound();
    }

    const btnBack = document.getElementById('btn-back-from-carkifelek');
    if (btnBack) {
      btnBack.onclick = () => {
        if (this.game && this.game.showGameLeaveConfirmModal) {
          this.game.showGameLeaveConfirmModal('partyGames', () => {
            if (this.spinAnimId) {
              cancelAnimationFrame(this.spinAnimId);
              this.spinAnimId = null;
            }
            this.isSpinning = false;
            try { sounds.stopAll(); } catch (e) {}
          });
        } else {
          this.game.showScreen('partyGames');
        }
      };
    }
  }

  newGame() {
    this.teams.forEach(t => { t.score = 0; });
    this.currentTeamIndex = 0;
    this.newRound();
  }

  newRound() {
    // Rastgele yeni bulmaca seç
    this.currentPuzzle = CARKIFELEK_PUZZLES[Math.floor(Math.random() * CARKIFELEK_PUZZLES.length)];
    this.guessedLetters = new Set();
    this.currentSlice = null;
    this.isSpinning = false;
    this.canPickLetter = false;

    this.renderBoard();
    this.renderKeyboards();
    this.updateTurnUI();
    this.updateStatusBanner('🎡 Çarkı çevirerek başlayın!');

    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) btnSpin.disabled = false;
  }

  drawWheel() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 8;
    const numSlices = CARKIFELEK_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.wheelRotation);

    for (let i = 0; i < numSlices; i++) {
      const slice = CARKIFELEK_SLICES[i];
      const angle = i * sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0B0E14';
      ctx.stroke();

      // Dilim Yazısı
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = slice.type === 'bankrupt' ? '#FFFFFF' : '#0B0E14';
      ctx.font = '900 13px -apple-system, Roboto, sans-serif';
      ctx.fillText(slice.text, r - 12, 0);
      ctx.restore();
    }

    // Merkez göbek
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0B0E14';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FBBF24';
    ctx.stroke();

    ctx.restore();

    // Üstte neon ibre
    ctx.beginPath();
    ctx.moveTo(cx - 10, 2);
    ctx.lineTo(cx + 10, 2);
    ctx.lineTo(cx, 22);
    ctx.closePath();
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  spinWheel() {
    if (this.isSpinning || this.canPickLetter) return;
    this.isSpinning = true;

    if (!this.canvas) {
      this.canvas = document.getElementById('carkifelek-wheel-canvas');
      if (this.canvas) this.ctx = this.canvas.getContext('2d');
    }

    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) {
      btnSpin.disabled = true;
      btnSpin.innerHTML = '🎡 DÖNÜYOR...';
    }

    try { sounds.playSpin(); } catch (e) {}

    const numSlices = CARKIFELEK_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetIndex = Math.floor(Math.random() * numSlices);
    const chosenSlice = CARKIFELEK_SLICES[targetIndex];
    this.currentSlice = chosenSlice;

    const fullSpins = 3 + Math.floor(Math.random() * 2);
    const targetAngle = 1.5 * Math.PI - (targetIndex + 0.5) * sliceAngle;
    const currentRot = this.wheelRotation % (2 * Math.PI);
    let delta = (targetAngle - currentRot) % (2 * Math.PI);
    if (delta < 0) delta += 2 * Math.PI;
    const totalDelta = delta + (fullSpins * 2 * Math.PI);

    const startRot = this.wheelRotation;
    const startTime = performance.now();
    const duration = 2000;
    let lastTickSlice = -1;

    if (this.spinAnimId) cancelAnimationFrame(this.spinAnimId);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4);
      this.wheelRotation = startRot + totalDelta * ease;
      this.drawWheel();

      const currentNeedleAngle = (1.5 * Math.PI - (this.wheelRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(currentNeedleAngle / sliceAngle);
      if (currentSlice !== lastTickSlice && progress < 0.98) {
        lastTickSlice = currentSlice;
        try { sounds.playWheelTick(); } catch (e) {}
      }

      if (progress < 1) {
        this.spinAnimId = requestAnimationFrame(animate);
      } else {
        this.spinAnimId = null;
        this.isSpinning = false;
        if (btnSpin) btnSpin.innerHTML = '🎡 ÇARKI ÇEVİR';
        this.handleSliceOutcome(chosenSlice);
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }

  handleSliceOutcome(slice) {
    if (slice.type === 'bankrupt') {
      try { sounds.playBuzzer(); } catch (e) {}
      const activeTeam = this.teams[this.currentTeamIndex];
      activeTeam.score = 0;
      this.updateStatusBanner(`💥 İFLAS! ${activeTeam.name} tüm puanlarını kaybetti! Sıra rakibe geçti.`);
      this.nextTurn();
      return;
    }

    if (slice.type === 'pass') {
      try { sounds.playBuzzer(); } catch (e) {}
      const activeTeam = this.teams[this.currentTeamIndex];
      this.updateStatusBanner(`⏸️ PAS! ${activeTeam.name} sırasını kaybetti.`);
      this.nextTurn();
      return;
    }

    if (slice.type === 'spin_again') {
      try { sounds.playChime(); } catch (e) {}
      this.updateStatusBanner(`🔄 TEKRAR ÇEVİR! Şanslısınız, çarkı tekrar çevirin.`);
      const btnSpin = document.getElementById('btn-cark-spin');
      if (btnSpin) btnSpin.disabled = false;
      return;
    }

    if (slice.type === 'reward') {
      try { sounds.playFanfare(); } catch (e) {}
      const activeTeam = this.teams[this.currentTeamIndex];
      activeTeam.score += 1000;
      this.updateStatusBanner(`🎁 SÜRPRİZ ÖDÜL! +1000 Puan kazandınız! Şimdi bir sessiz harf seçin.`);
    } else {
      try { sounds.playChime(); } catch (e) {}
      this.updateStatusBanner(`🎯 ${slice.value} PUAN! Bir sessiz harf seçin.`);
    }

    this.canPickLetter = true;
    this.highlightConsonants(true);
  }

  highlightConsonants(active) {
    const keys = document.querySelectorAll('.cark-consonant-btn');
    keys.forEach(k => {
      if (active && !k.classList.contains('used')) {
        k.classList.add('pulse-ready');
      } else {
        k.classList.remove('pulse-ready');
      }
    });
  }

  pickLetter(char) {
    if (!this.canPickLetter || this.guessedLetters.has(char)) return;
    this.canPickLetter = false;
    this.highlightConsonants(false);

    this.guessedLetters.add(char);
    const keyBtn = document.querySelector(`.cark-char-btn[data-char="${char}"]`);
    if (keyBtn) keyBtn.classList.add('used');

    const phraseUpper = this.currentPuzzle.phrase.toUpperCase();
    const count = (phraseUpper.split(char).length - 1);

    if (count > 0) {
      try { sounds.playCorrect(); } catch (e) {}
      const pts = (this.currentSlice ? this.currentSlice.value : 250) * count;
      const activeTeam = this.teams[this.currentTeamIndex];
      activeTeam.score += pts;

      this.updateStatusBanner(`✅ DOĞRU! ${count} adet "${char}" harfi açıldı! (+${pts} P) Tekrar çevirebilirsiniz.`);
      this.renderBoard();
      this.updateTurnUI();

      if (this.checkIfSolved()) {
        this.handlePuzzleComplete('🎉 TEBRİKLER! Tüm harfler açıldı!');
        return;
      }

      // Doğru bildiği için sıra yine kendisinde
      const btnSpin = document.getElementById('btn-cark-spin');
      if (btnSpin) btnSpin.disabled = false;
    } else {
      try { sounds.playBuzzer(); } catch (e) {}
      this.updateStatusBanner(`❌ MAALESEF! Cümlede "${char}" harfi yok. Sıra rakibe geçti.`);
      this.nextTurn();
    }
  }

  openVowelModal() {
    const activeTeam = this.teams[this.currentTeamIndex];
    if (activeTeam.score < 250) {
      this.updateStatusBanner('⚠️ Sesli harf satın almak için en az 250 puanınız olmalı!');
      return;
    }

    const modal = document.getElementById('modal-cark-vowels');
    if (!modal) return;
    modal.style.display = 'flex';

    const container = document.getElementById('cark-vowels-list');
    if (!container) return;
    container.innerHTML = TURKISH_VOWELS.map(v => {
      const isUsed = this.guessedLetters.has(v);
      return `
        <button type="button" class="btn-main ${isUsed ? 'used' : 'primary'}" data-vowel="${v}" ${isUsed ? 'disabled' : ''} style="font-size:1.4rem; font-weight:900; padding:12px; border-radius:12px;">
          ${v}
        </button>
      `;
    }).join('');

    container.querySelectorAll('button[data-vowel]').forEach(btn => {
      btn.onclick = () => {
        const v = btn.dataset.vowel;
        modal.style.display = 'none';
        this.buyVowel(v);
      };
    });
  }

  buyVowel(vowel) {
    const activeTeam = this.teams[this.currentTeamIndex];
    activeTeam.score = Math.max(0, activeTeam.score - 250);
    this.guessedLetters.add(vowel);

    const count = (this.currentPuzzle.phrase.toUpperCase().split(vowel).length - 1);
    if (count > 0) {
      try { sounds.playCorrect(); } catch (e) {}
      this.updateStatusBanner(`🅰️ ${count} adet "${vowel}" sesli harfi açıldı! (-250 P)`);
      this.renderBoard();
      this.updateTurnUI();

      if (this.checkIfSolved()) {
        this.handlePuzzleComplete('🎉 TEBRİKLER! Tüm harfler açıldı!');
      }
    } else {
      try { sounds.playBuzzer(); } catch (e) {}
      this.updateStatusBanner(`❌ Cümlede "${vowel}" harfi yok. (-250 P)`);
      this.updateTurnUI();
    }
  }

  promptSolve() {
    const answer = prompt('CÜMLEYİ TAHMİN EDİN:\n(Büyük veya küçük harf yazabilirsiniz)');
    if (!answer) return;

    const cleanInput = answer.trim().toUpperCase().replace(/İ/g, 'İ').replace(/I/g, 'I');
    const cleanActual = this.currentPuzzle.phrase.trim().toUpperCase();

    if (cleanInput === cleanActual) {
      try { sounds.playFanfare(); } catch (e) {}
      // Kalan kapalı harfleri de sayıp bonus ver
      let unrevealedCount = 0;
      for (const char of cleanActual) {
        if (char !== ' ' && !this.guessedLetters.has(char)) unrevealedCount++;
      }
      const bonus = (unrevealedCount * 500) + 1500;
      const activeTeam = this.teams[this.currentTeamIndex];
      activeTeam.score += bonus;

      // Tüm harfleri aç
      for (const char of cleanActual) {
        if (char !== ' ') this.guessedLetters.add(char);
      }
      this.renderBoard();
      this.updateTurnUI();

      this.handlePuzzleComplete(`🏆 BİLDİNİZ! "${cleanActual}" (+${bonus} Bonus Puan)`);
    } else {
      try { sounds.playBuzzer(); } catch (e) {}
      this.updateStatusBanner(`❌ YANLIŞ TAHMİN! "${answer}" doğru değil. Sıra rakibe geçti.`);
      this.nextTurn();
    }
  }

  checkIfSolved() {
    const phraseUpper = this.currentPuzzle.phrase.toUpperCase();
    for (const char of phraseUpper) {
      if (char !== ' ' && !this.guessedLetters.has(char)) {
        return false;
      }
    }
    return true;
  }

  handlePuzzleComplete(msg) {
    this.updateStatusBanner(msg);
    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) btnSpin.disabled = true;

    const modal = document.getElementById('modal-cark-round-won');
    if (modal) {
      modal.style.display = 'flex';
      const winnerTeam = this.teams[0].score >= this.teams[1].score ? this.teams[0] : this.teams[1];
      const winEl = document.getElementById('cark-round-winner-text');
      if (winEl) winEl.textContent = `Kazanan: ${winnerTeam.name} (${winnerTeam.score} P)`;
    }
  }

  nextTurn() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
    this.canPickLetter = false;
    this.highlightConsonants(false);
    this.updateTurnUI();

    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) btnSpin.disabled = false;
  }

  updateTurnUI() {
    const activeTeam = this.teams[this.currentTeamIndex];
    const turnBadge = document.getElementById('cark-turn-badge');
    if (turnBadge) {
      turnBadge.textContent = `🎯 SIRA: ${activeTeam.name.toUpperCase()}`;
      turnBadge.style.background = activeTeam.color;
    }

    const t1Name = document.getElementById('cark-team-1-name');
    const t1Score = document.getElementById('cark-team-1-score');
    const t2Name = document.getElementById('cark-team-2-name');
    const t2Score = document.getElementById('cark-team-2-score');

    if (t1Name) t1Name.textContent = this.teams[0].name;
    if (t1Score) t1Score.textContent = `${this.teams[0].score} P`;
    if (t2Name) t2Name.textContent = this.teams[1].name;
    if (t2Score) t2Score.textContent = `${this.teams[1].score} P`;
  }

  updateStatusBanner(msg) {
    const banner = document.getElementById('cark-status-banner');
    if (banner) banner.textContent = msg;
  }

  renderBoard() {
    const catEl = document.getElementById('cark-puzzle-category');
    if (catEl) catEl.textContent = this.currentPuzzle.category;

    const boardEl = document.getElementById('cark-puzzle-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const words = this.currentPuzzle.phrase.toUpperCase().split(' ');
    words.forEach(word => {
      const wordWrap = document.createElement('div');
      wordWrap.className = 'cark-word-wrap';
      for (const char of word) {
        const cell = document.createElement('div');
        cell.className = 'cark-letter-cell';
        if (this.guessedLetters.has(char)) {
          cell.textContent = char;
          cell.classList.add('revealed');
        } else {
          cell.textContent = '';
        }
        wordWrap.appendChild(cell);
      }
      boardEl.appendChild(wordWrap);
    });
  }

  renderKeyboards() {
    const container = document.getElementById('cark-consonants-keyboard');
    if (!container) return;
    container.innerHTML = TURKISH_CONSONANTS.map(c => `
      <button type="button" class="cark-char-btn cark-consonant-btn ${this.guessedLetters.has(c) ? 'used' : ''}" data-char="${c}">
        ${c}
      </button>
    `).join('');

    container.querySelectorAll('.cark-consonant-btn').forEach(btn => {
      btn.onclick = () => {
        this.pickLetter(btn.dataset.char);
      };
    });
  }
}
