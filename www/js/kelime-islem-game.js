// js/kelime-islem-game.js
// Kafana Tak! - Bir Kelime Bir İşlem Efsane Yarışma Motoru

import { sounds } from './audio.js';
import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';
import { HostModerationPanel } from './host-moderation-panel.js';
import {
  TURKISH_VOWELS,
  TURKISH_CONSONANTS,
  WEIGHTED_VOWELS,
  WEIGHTED_CONSONANTS,
  LARGE_NUMBERS,
  SMALL_NUMBERS,
  KELIME_DICTIONARY,
  findBestWordsFromLetters,
  solveCountdownNumbers
} from './kelime-data.js';

export class KelimeIslemEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'full'; // 'full' (1 Kelime + 1 İşlem), 'kelime', 'islem'
    this.playerMode = 'duel'; // 'duel' (Kırmızı vs Mavi), 'solo' (Tek Başına)
    this.stage = 'setup'; // 'setup', 'kelime_draw', 'kelime_play', 'kelime_result', 'islem_play', 'islem_result', 'game_over'
    
    this.scores = {
      red: 0,
      blue: 0,
      solo: 0
    };
    this.currentTurn = 'red'; // 'red' or 'blue'
    this.currentTeam = 'red'; // 'red' or 'blue' - aktif takım
    this.round = 1;

    // Zamanlayıcı
    this.timerSeconds = 45;
    this.maxTimerSeconds = 45; // Maksimum süre (ayarlar için)
    this.currentSeconds = 45;
    this.timerInterval = null;

    // Kelime Etabı Verileri
    this.letters = []; // Max 9: 8 harf + 1 joker ('★')
    this.selectedLetterIndices = []; // Seçilen harf indisleri
    this.currentWord = '';
    this.computerBestWord = null;
    this.playerWordPoints = 0;
    this.jokerLetter = 'A'; // Jokerin temsil ettiği harf

    // İşlem Etabı Verileri
    this.targetNumber = 0;
    this.initialNumbers = [];
    this.availableNumbers = []; // [{ id, value, used: false }]
    this.selectedNum1 = null;
    this.selectedOp = null;
    this.calcHistory = []; // [{ num1, op, num2, res, newId }]
    this.bestPlayerValue = null;
    this.playerNumberPoints = 0;
    this.computerSolution = null;

    // Çoklu Cihaz (Firebase RTDB)
    this.roomId = null;
    this.isMultiDevice = false;
    this.connectedPlayers = [];
    this.playerSubmissions = [];
    this.unsubscribeRoom = null;

    window.__kelimeIslem = this;
  }

  init() {
    this.stage = 'setup';
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.ensureBackButton();
    this.renderScreen();
  }

  ensureBackButton() {
    const btnBack = document.getElementById('btn-back-from-kelime-islem');
    if (btnBack) {
      btnBack.onclick = (e) => {
        if (e) e.preventDefault();
        sounds.playClick();
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.unsubscribeRoom) {
          try { this.unsubscribeRoom(); } catch (err) {}
        }
        if (this.stage !== 'setup') {
          this.init();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        this.game.showScreen('partyGames');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.renderScreen();
  }

  setPlayerMode(pMode) {
    this.playerMode = pMode;
    this.renderScreen();
  }

  startNewGame() {
    sounds.playClick();
    this.scores = { red: 0, blue: 0, solo: 0 };
    this.round = 1;
    this.currentTurn = 'red';
    
    if (this.mode === 'islem') {
      this.startIslemStage();
    } else {
      this.startKelimeStage();
    }
  }

  // ========================================================
  // 1. KELİME ETABI MANTIĞI
  // ========================================================
  startKelimeStage() {
    this.stage = 'kelime_draw';
    this.letters = [];
    this.selectedLetterIndices = [];
    this.currentWord = '';
    this.computerBestWord = null;
    this.playerWordPoints = 0;
    this.jokerLetter = 'A';
    this.renderScreen();
  }

  drawVowel() {
    if (this.letters.length >= 8) return;
    sounds.playTick();
    const vowel = WEIGHTED_VOWELS[Math.floor(Math.random() * WEIGHTED_VOWELS.length)];
    this.letters.push(vowel);
    this.checkAutoFinalizeLetters();
  }

  drawConsonant() {
    if (this.letters.length >= 8) return;
    sounds.playTick();
    const cons = WEIGHTED_CONSONANTS[Math.floor(Math.random() * WEIGHTED_CONSONANTS.length)];
    this.letters.push(cons);
    this.checkAutoFinalizeLetters();
  }

  drawAutoLetters() {
    sounds.playClick();
    this.letters = [];
    // 3 sesli
    for (let i = 0; i < 3; i++) {
      this.letters.push(WEIGHTED_VOWELS[Math.floor(Math.random() * WEIGHTED_VOWELS.length)]);
    }
    // 5 sessiz
    for (let i = 0; i < 5; i++) {
      this.letters.push(WEIGHTED_CONSONANTS[Math.floor(Math.random() * WEIGHTED_CONSONANTS.length)]);
    }
    // Karıştır
    this.letters.sort(() => Math.random() - 0.5);
    // 9. harf joker
    this.letters.push('★');
    this.startKelimeCountdown();
  }

  checkAutoFinalizeLetters() {
    if (this.letters.length === 8) {
      // 9. harf olarak altın Jokeri ekle
      this.letters.push('★');
      setTimeout(() => {
        this.startKelimeCountdown();
      }, 500);
    } else {
      this.renderScreen();
    }
  }

  startKelimeCountdown() {
    this.stage = 'kelime_play';
    this.currentSeconds = this.timerSeconds;
    this.selectedLetterIndices = [];
    this.currentWord = '';
    
    // Bilgisayarın en iyi çözümünü arka planda önceden hesapla
    const bestWords = findBestWordsFromLetters(this.letters, 5);
    this.computerBestWord = bestWords[0] || { word: 'YOK', length: 0, points: 0 };

    this.renderScreen();
    this.syncRoomState();
    sounds.playCountdown();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentSeconds--;
      if (this.currentSeconds <= 5 && this.currentSeconds > 0) {
        sounds.playTick();
      }
      this.updateTimerDisplay();

      if (this.currentSeconds <= 0) {
        clearInterval(this.timerInterval);
        sounds.playBell();
        this.finishKelimeStage();
      }
    }, 1000);
  }

  toggleLetterInWord(index) {
    if (this.stage !== 'kelime_play') return;
    sounds.playClick();

    const existingPos = this.selectedLetterIndices.indexOf(index);
    if (existingPos >= 0) {
      // Çıkar
      this.selectedLetterIndices.splice(existingPos, 1);
    } else {
      // Ekle
      this.selectedLetterIndices.push(index);
    }

    this.buildCurrentWord();
    this.renderScreen();
  }

  buildCurrentWord() {
    let word = '';
    for (const idx of this.selectedLetterIndices) {
      const char = this.letters[idx];
      if (char === '★') {
        word += this.jokerLetter;
      } else {
        word += char;
      }
    }
    this.currentWord = word;
  }

  setJokerLetter(ch) {
    this.jokerLetter = ch.toLocaleUpperCase('tr-TR');
    this.buildCurrentWord();
    this.renderScreen();
  }

  clearWord() {
    sounds.playClick();
    this.selectedLetterIndices = [];
    this.currentWord = '';
    this.renderScreen();
  }

  finishKelimeStage() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.stage = 'kelime_result';

    const word = this.currentWord.trim().toLocaleUpperCase('tr-TR');
    const isValid = KELIME_DICTIONARY.has(word) && word.length >= 3;
    
    if (isValid) {
      this.playerWordPoints = word.length * 10 + (word.length === 8 ? 20 : 0) + (word.length === 9 ? 50 : 0);
      sounds.playCorrect();
    } else {
      this.playerWordPoints = 0;
      sounds.playWrong();
    }

    // Puanı ekle
    if (this.playerMode === 'duel') {
      this.scores[this.currentTurn] += this.playerWordPoints;
    } else {
      this.scores.solo += this.playerWordPoints;
    }

    this.renderScreen();
  }

  acceptWordByJury() {
    // Jüri / Masadakilerin onayı ile puanı kabul et
    sounds.playCorrect();
    const word = this.currentWord.trim().toLocaleUpperCase('tr-TR');
    const len = Math.max(3, word.length);
    const addedPoints = len * 10 + (len >= 8 ? 20 : 0);
    this.playerWordPoints = addedPoints;

    if (this.playerMode === 'duel') {
      this.scores[this.currentTurn] += addedPoints;
    } else {
      this.scores.solo += addedPoints;
    }
    this.renderScreen();
  }

  // ========================================================
  // 2. İŞLEM ETABI MANTIĞI
  // ========================================================
  startIslemStage() {
    this.stage = 'islem_play';
    this.currentSeconds = this.timerSeconds;
    this.selectedNum1 = null;
    this.selectedOp = null;
    this.calcHistory = [];
    this.playerNumberPoints = 0;

    // Hedef Sayı: 100 - 999
    this.targetNumber = 100 + Math.floor(Math.random() * 900);

    // 5 Küçük Sayı (1-9) + 1 Büyük Sayı (10, 25, 50, 75, 100)
    const smalls = [];
    for (let i = 0; i < 5; i++) {
      smalls.push(SMALL_NUMBERS[Math.floor(Math.random() * SMALL_NUMBERS.length)]);
    }
    const large = LARGE_NUMBERS[Math.floor(Math.random() * LARGE_NUMBERS.length)];
    this.initialNumbers = [...smalls, large].sort(() => Math.random() - 0.5);

    this.availableNumbers = this.initialNumbers.map((val, idx) => ({
      id: `num_${idx}_${Date.now()}`,
      value: val,
      used: false
    }));

    this.bestPlayerValue = this.initialNumbers[0];

    // Bilgisayar Çözümünü Önceden Hesapla
    this.computerSolution = solveCountdownNumbers(this.initialNumbers, this.targetNumber);

    this.renderScreen();
    this.syncRoomState();
    sounds.playCountdown();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentSeconds--;
      if (this.currentSeconds <= 5 && this.currentSeconds > 0) {
        sounds.playTick();
      }
      this.updateTimerDisplay();

      if (this.currentSeconds <= 0) {
        clearInterval(this.timerInterval);
        sounds.playBell();
        this.finishIslemStage();
      }
    }, 1000);
  }

  selectNumberCard(cardId) {
    if (this.stage !== 'islem_play') return;
    const card = this.availableNumbers.find(c => c.id === cardId && !c.used);
    if (!card) return;

    sounds.playClick();

    if (!this.selectedNum1) {
      // 1. sayı seçildi
      this.selectedNum1 = card;
      this.selectedOp = null;
    } else if (this.selectedNum1 && !this.selectedOp) {
      // 1. sayıyı değiştir
      if (this.selectedNum1.id === card.id) {
        this.selectedNum1 = null; // Seçimi kaldır
      } else {
        this.selectedNum1 = card;
      }
    } else if (this.selectedNum1 && this.selectedOp) {
      // 2. sayı seçildi -> İşlemi tamamla!
      if (this.selectedNum1.id === card.id) {
        return; // Aynı sayı kendisiyle işleme giremez
      }
      this.executeCalculation(this.selectedNum1, this.selectedOp, card);
    }
    this.renderScreen();
  }

  selectOperator(op) {
    if (this.stage !== 'islem_play') return;
    if (!this.selectedNum1) return;
    sounds.playClick();
    this.selectedOp = op;
    this.renderScreen();
  }

  executeCalculation(num1Card, op, num2Card) {
    const a = num1Card.value;
    const b = num2Card.value;
    let res = null;

    if (op === '+') {
      res = a + b;
    } else if (op === '-') {
      if (a <= b) {
        alert('Çıkarma işleminde sonuç 0 veya eksi olamaz!');
        return;
      }
      res = a - b;
    } else if (op === '×') {
      res = a * b;
    } else if (op === '÷') {
      if (b === 0 || a % b !== 0) {
        alert('Bölme işlemi tam bölünmeli (kalanlı olamaz)!');
        return;
      }
      res = a / b;
    }

    if (res === null) return;

    sounds.playSlide();

    // Kullanılan iki kartı devreden çıkar
    num1Card.used = true;
    num2Card.used = true;

    // Yeni üretilen kartı ekle
    const newId = `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCard = {
      id: newId,
      value: res,
      used: false,
      isResult: true
    };
    this.availableNumbers.push(newCard);

    // Tarihçeye ekle
    this.calcHistory.push({
      num1Id: num1Card.id,
      num2Id: num2Card.id,
      num1Val: a,
      op: op,
      num2Val: b,
      resVal: res,
      newId: newId
    });

    // En yakın değeri güncelle
    this.updateBestPlayerValue();

    // Seçimleri sıfırla
    this.selectedNum1 = null;
    this.selectedOp = null;

    // Eğer tam isabet bulunduysa hemen kutla
    if (res === this.targetNumber) {
      sounds.playApplause();
      clearInterval(this.timerInterval);
      setTimeout(() => this.finishIslemStage(), 600);
      return;
    }

    this.renderScreen();
  }

    // Geri Al Motoru: Bekleyen seçimi veya son işlemi geri al (Madde 12)
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
  }

  updateBestPlayerValue() {
    let closestVal = null;
    let closestDiff = Infinity;

    for (const card of this.availableNumbers) {
      if (card.used) continue;
      const diff = Math.abs(card.value - this.targetNumber);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestVal = card.value;
      }
    }
    this.bestPlayerValue = closestVal !== null ? closestVal : (this.initialNumbers ? this.initialNumbers[0] : 0);
  }

  finishIslemStage() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.stage = 'islem_result';

    this.updateBestPlayerValue();
    const diff = Math.abs(this.bestPlayerValue - this.targetNumber);

    if (diff === 0) {
      this.playerNumberPoints = 100;
      sounds.playCorrect();
    } else if (diff === 1) {
      this.playerNumberPoints = 90;
      sounds.playCorrect();
    } else if (diff <= 5) {
      this.playerNumberPoints = 75;
      sounds.playCorrect();
    } else if (diff <= 10) {
      this.playerNumberPoints = 50;
      sounds.playSlide();
    } else if (diff <= 20) {
      this.playerNumberPoints = 25;
      sounds.playSlide();
    } else {
      this.playerNumberPoints = 0;
      sounds.playWrong();
    }

    if (this.playerMode === 'duel') {
      this.scores[this.currentTurn] += this.playerNumberPoints;
    } else {
      this.scores.solo += this.playerNumberPoints;
    }

    this.renderScreen();
  }

  nextRoundOrGameOver() {
    sounds.playClick();
    if (this.mode === 'full') {
      if (this.playerMode === 'duel' && this.currentTurn === 'red') {
        // Sıra Mavi Takıma geçer
        this.currentTurn = 'blue';
        this.startKelimeStage();
        return;
      }
    }
    // Oyun bitti
    this.stage = 'game_over';
    sounds.playApplause();
    this.renderScreen();
  }

  updateTimerDisplay() {
    const el = document.getElementById('ki-timer-seconds');
    if (el) {
      el.textContent = this.currentSeconds;
      if (this.currentSeconds <= 5) {
        el.style.color = '#EF4444';
        el.style.transform = 'scale(1.2)';
      } else {
        el.style.color = 'var(--gold)';
        el.style.transform = 'scale(1)';
      }
    }
  }

  // ========================================================
  // 3. EKRAN RENDER VE ARAYÜZ
  // ========================================================
  renderScreen() {
    const container = document.getElementById('screen-kelime-islem-content');
    if (!container) return;

    if (this.stage === 'setup') {
      container.innerHTML = this.renderSetupView();
      this.bindSetupEvents();
    } else if (this.stage === 'kelime_draw') {
      container.innerHTML = this.renderKelimeDrawView();
      this.bindKelimeDrawEvents();
    } else if (this.stage === 'kelime_play') {
      container.innerHTML = this.renderKelimePlayView();
      this.bindKelimePlayEvents();
    } else if (this.stage === 'kelime_result') {
      container.innerHTML = this.renderKelimeResultView();
      this.bindKelimeResultEvents();
    } else if (this.stage === 'islem_play') {
      container.innerHTML = this.renderIslemPlayView();
      this.bindIslemPlayEvents();
    } else if (this.stage === 'islem_result') {
      container.innerHTML = this.renderIslemResultView();
      this.bindIslemResultEvents();
    } else if (this.stage === 'game_over') {
      container.innerHTML = this.renderGameOverView();
      this.bindGameOverEvents();
    }
  }

    renderScoreHeader() {
    let teamBanner = '';
    if (this.playerMode === 'duel') {
      const isRed = this.currentTurn === 'red';
      teamBanner = `
        <div style="background:${isRed ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, #3B82F6, #1E40AF)'}; color:#FFF; font-size:1.15rem; font-weight:900; padding:10px 16px; border-radius:14px; box-shadow:0 0 20px ${isRed ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}; margin-bottom:12px; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>${isRed ? '🔴' : '🔵'}</span>
          <span>SIRA: ${isRed ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM'}</span>
          <span>${isRed ? '🔴' : '🔵'}</span>
        </div>
      `;

      return `
        ${teamBanner}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div style="background:rgba(239,68,68,0.18); border:2px solid ${this.currentTurn === 'red' ? '#EF4444' : 'rgba(239,68,68,0.3)'}; border-radius:14px; padding:10px 12px; text-align:left; box-shadow:${this.currentTurn === 'red' ? '0 0 18px rgba(239,68,68,0.4)' : 'none'};">
            <div style="font-size:0.75rem; font-weight:800; color:#EF4444;">🔴 Kırmızı Takım ${this.currentTurn === 'red' ? '★ YARIŞIYOR' : ''}</div>
            <div style="font-size:1.4rem; font-weight:900; color:#FFF;">${this.scores.red} P</div>
          </div>
          <div style="background:rgba(59,130,246,0.18); border:2px solid ${this.currentTurn === 'blue' ? '#3B82F6' : 'rgba(59,130,246,0.3)'}; border-radius:14px; padding:10px 12px; text-align:left; box-shadow:${this.currentTurn === 'blue' ? '0 0 18px rgba(59,130,246,0.4)' : 'none'};">
            <div style="font-size:0.75rem; font-weight:800; color:#3B82F6;">🔵 Mavi Takım ${this.currentTurn === 'blue' ? '★ YARIŞIYOR' : ''}</div>
            <div style="font-size:1.4rem; font-weight:900; color:#FFF;">${this.scores.blue} P</div>
          </div>
        </div>
      `;
    }

    return `
      <div style="background:rgba(251,191,36,0.14); border:1.5px solid var(--gold); border-radius:14px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.9rem; font-weight:900; color:var(--gold);">👤 BİREYSEL PRATİK</span>
        <span style="font-size:1.35rem; font-weight:900; color:#FFF;">${this.scores.solo} PUAN</span>
      </div>
    `;
  }

  // --- 3.1. SETUP VIEW ---
  renderSetupView() {
    return `
      <div class="card" style="text-align:center; padding:22px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border:2px solid rgba(0,245,212,0.4); border-radius:20px;">
        <div style="font-size:3rem; margin-bottom:8px;">🧠</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:#FFF; margin-bottom:6px;">BİR KELİME BİR İŞLEM</h2>
        <p style="font-size:0.85rem; color:#CBD5E1; line-height:1.45; margin-bottom:18px;">
          Efsane televizyon yarışması arenada! 8 harf + 1 joker ile en uzun kelimeyi bul, 6 sayı ile 4 işlemi konuşturup hedef sayıyı tam 12'den vur!
        </p>

        <!-- Oyun Türü Çipleri -->
        <div style="font-size:0.78rem; font-weight:800; color:var(--gold); text-align:left; margin-bottom:6px;">OYUN MODU:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:16px;">
          <button type="button" id="btn-mode-full" class="rule-chip ${this.mode === 'full' ? 'active' : ''}" style="padding:10px 4px; font-size:0.78rem; font-weight:900; justify-content:center; border-radius:12px; cursor:pointer;">
            🏆 1K + 1İ (Tam)
          </button>
          <button type="button" id="btn-mode-kelime" class="rule-chip ${this.mode === 'kelime' ? 'active' : ''}" style="padding:10px 4px; font-size:0.78rem; font-weight:900; justify-content:center; border-radius:12px; cursor:pointer;">
            🔤 Kelime Avı
          </button>
          <button type="button" id="btn-mode-islem" class="rule-chip ${this.mode === 'islem' ? 'active' : ''}" style="padding:10px 4px; font-size:0.78rem; font-weight:900; justify-content:center; border-radius:12px; cursor:pointer;">
            🧮 Sayı Ustası
          </button>
        </div>

        <!-- Oyuncu Modu -->
        <div style="font-size:0.78rem; font-weight:800; color:var(--primary); text-align:left; margin-bottom:6px;">YARIŞMA TÜRÜ:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
          <button type="button" id="btn-pmode-duel" class="btn-main ${this.playerMode === 'duel' ? 'active' : ''}" style="padding:10px; border-radius:14px; font-size:0.85rem; font-weight:900; background:${this.playerMode === 'duel' ? 'rgba(0,245,212,0.2)' : 'rgba(255,255,255,0.06)'}; border:1.5px solid ${this.playerMode === 'duel' ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}; color:#FFF; cursor:pointer;">
            ⚔️ Takım Düellosu (Kırmızı vs Mavi)
          </button>
          <button type="button" id="btn-pmode-solo" class="btn-main ${this.playerMode === 'solo' ? 'active' : ''}" style="padding:10px; border-radius:14px; font-size:0.85rem; font-weight:900; background:${this.playerMode === 'solo' ? 'rgba(0,245,212,0.2)' : 'rgba(255,255,255,0.06)'}; border:1.5px solid ${this.playerMode === 'solo' ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}; color:#FFF; cursor:pointer;">
            👤 Bireysel Rekor Pratiği
          </button>
        </div>

        <!-- Takım Seçimi (sadece duel modunda) -->
        <div id="ki-team-selection" style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px; margin-bottom:10px; display:none;">
          <span style="font-size:0.75rem; color:var(--text-muted); margin-right:8px;">Takım:</span>
          <span style="font-size:0.75rem; color:#EF4444; font-weight:900; margin-right:12px;" id="ki-team-red">Kırmızı</span>
          <span style="font-size:0.75rem; color:#3B82F6; font-weight:900;" id="ki-team-mavi">Mavi</span>
          <div style="margin-top:6px; display:flex; gap:8px;">
            <button type="button" id="ki-btn-team-red" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#EF4444; font-size:0.7rem; font-weight:900; padding:4px 8px; border-radius:12px; cursor:pointer;">Kırmızı</button>
            <button type="button" id="ki-btn-team-mavi" style="background:rgba(59,130,244,0.2); border:1px solid #3B82F4; color:#3B82F4; font-size:0.7rem; font-weight:900; padding:4px 8px; border-radius:12px; cursor:pointer;">Mavi</button>
          </div>
        </div>

        <!-- Süre Ayarları (Hızlı Seçim Çipleri & Hassas Ayar) -->
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.12); border-radius:16px; padding:12px; margin-bottom:14px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.8rem; font-weight:800; color:var(--gold);">⏱️ YARIŞMA SÜRESİ:</span>
            <span style="font-size:1.1rem; font-weight:900; color:#00F5D4;" id="ki-timer-value">${this.timerSeconds} saniye</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr) auto auto; gap:6px;">
            <button type="button" class="btn-ki-preset-time" data-sec="30" style="background:${this.timerSeconds === 30 ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; color:${this.timerSeconds === 30 ? '#0B0E14' : '#FFF'}; border:1px solid rgba(255,255,255,0.2); border-radius:10px; font-weight:800; padding:8px 0; font-size:0.8rem; cursor:pointer;">30s</button>
            <button type="button" class="btn-ki-preset-time" data-sec="45" style="background:${this.timerSeconds === 45 ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; color:${this.timerSeconds === 45 ? '#0B0E14' : '#FFF'}; border:1px solid rgba(255,255,255,0.2); border-radius:10px; font-weight:800; padding:8px 0; font-size:0.8rem; cursor:pointer;">45s</button>
            <button type="button" class="btn-ki-preset-time" data-sec="60" style="background:${this.timerSeconds === 60 ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; color:${this.timerSeconds === 60 ? '#0B0E14' : '#FFF'}; border:1px solid rgba(255,255,255,0.2); border-radius:10px; font-weight:800; padding:8px 0; font-size:0.8rem; cursor:pointer;">60s</button>
            <button type="button" class="btn-ki-preset-time" data-sec="90" style="background:${this.timerSeconds === 90 ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; color:${this.timerSeconds === 90 ? '#0B0E14' : '#FFF'}; border:1px solid rgba(255,255,255,0.2); border-radius:10px; font-weight:800; padding:8px 0; font-size:0.8rem; cursor:pointer;">90s</button>
            <button type="button" id="ki-btn-minus" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#EF4444; font-size:0.9rem; font-weight:900; padding:0 12px; border-radius:10px; cursor:pointer;">-</button>
            <button type="button" id="ki-btn-plus" style="background:rgba(34,197,94,0.2); border:1px solid #22C55E; color:#22C55E; font-size:0.9rem; font-weight:900; padding:0 12px; border-radius:10px; cursor:pointer;">+</button>
          </div>
        </div>

        <!-- Çoklu Telefon (QR Kod) Entegrasyonu -->
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid ${this.isMultiDevice ? 'var(--primary)' : 'rgba(255,255,255,0.12)'}; border-radius:16px; padding:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="text-align:left;">
              <span style="font-size:0.85rem; font-weight:900; color:#FFF; display:block;">📱 Çoklu Telefon Modu</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">Oyuncular kendi telefonundan harfleri seçsin</span>
            </div>
            <button type="button" id="btn-toggle-ki-multi" style="background:${this.isMultiDevice ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; color:${this.isMultiDevice ? '#0B0E14' : '#FFF'}; border:none; padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:900; cursor:pointer;">
              ${this.isMultiDevice ? 'AÇIK ✓' : 'AÇ +'}
            </button>
          </div>

          ${this.isMultiDevice ? `
            <div id="ki-multi-details" style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
              <div style="display:inline-block; background:rgba(0,245,212,0.15); border:1.5px solid var(--primary); padding:4px 16px; border-radius:999px; color:var(--primary); font-size:1rem; font-weight:900; letter-spacing:2px; margin-bottom:10px;">
                ODA: ${this.roomId || '----'}
              </div>
              <div id="ki-qr-canvas-box" style="margin:0 auto 10px; display:inline-block; background:#FFF; padding:6px; border-radius:12px;"></div>
              <div style="display:flex; justify-content:center; gap:8px;">
                <button type="button" id="btn-ki-copy-link" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-size:0.78rem; font-weight:800; padding:6px 12px; border-radius:10px; cursor:pointer;">
                  📋 Bağlantıyı Kopyala
                </button>
              </div>
              <div id="ki-connected-players-box" style="margin-top:10px; text-align:left;"></div>
            </div>
          ` : ''}
        </div>

        <button type="button" id="btn-start-kelime-islem" class="btn-main primary" style="font-size:1.15rem; font-weight:900; padding:15px; border-radius:999px; width:100%; box-shadow:0 6px 25px rgba(0,245,212,0.4); cursor:pointer;">
          🚀 YARIŞMAYI BAŞLAT!
        </button>
      </div>
    `;
  }

  bindSetupEvents() {
    document.getElementById('btn-mode-full')?.addEventListener('click', () => this.setMode('full'));
    document.getElementById('btn-mode-kelime')?.addEventListener('click', () => this.setMode('kelime'));
    document.getElementById('btn-mode-islem')?.addEventListener('click', () => this.setMode('islem'));

    document.getElementById('btn-pmode-duel')?.addEventListener('click', () => this.setPlayerMode('duel'));
    document.getElementById('btn-pmode-solo')?.addEventListener('click', () => this.setPlayerMode('solo'));

    document.getElementById('btn-start-kelime-islem')?.addEventListener('click', () => this.startNewGame());

    // Süre ayarları butonları
    document.querySelectorAll('.btn-ki-preset-time').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        this.timerSeconds = parseInt(btn.dataset.sec, 10);
        this.renderScreen();
      });
    });

    document.getElementById('ki-btn-plus')?.addEventListener('click', () => {
      this.timerSeconds = Math.min(this.timerSeconds + 5, 120);
      const el = document.getElementById('ki-timer-value');
      if (el) el.textContent = `${this.timerSeconds} saniye`;
    });
    document.getElementById('ki-btn-minus')?.addEventListener('click', () => {
      this.timerSeconds = Math.max(this.timerSeconds - 5, 15);
      const el = document.getElementById('ki-timer-value');
      if (el) el.textContent = `${this.timerSeconds} saniye`;
    });

    // Takım seçimi
    document.getElementById('ki-btn-team-red')?.addEventListener('click', () => {
      this.currentTeam = 'red';
      document.getElementById('ki-team-red').style.color = '#F87171';
      document.getElementById('ki-team-mavi').style.color = '#60A5FA';
    });
    document.getElementById('ki-btn-team-mavi')?.addEventListener('click', () => {
      this.currentTeam = 'blue';
      document.getElementById('ki-team-mavi').style.color = '#BFDBFE';
      document.getElementById('ki-team-red').style.color = '#F87171';
    });

    document.getElementById('btn-toggle-ki-multi')?.addEventListener('click', () => this.toggleMultiDevice());
    document.getElementById('btn-ki-copy-link')?.addEventListener('click', () => {
      if (!this.roomId) return;
      const url = firebaseNetwork.getKelimeIslemUrl(this.roomId);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        this.game.showToast('📋 Çoklu telefon bağlantısı kopyalandı!');
      } else {
        prompt('Bağlantı:', url);
      }
    });

    if (this.isMultiDevice) {
      this.renderQrCode();
      this.renderConnectedPlayersUI();
    }
  }

  renderQrCode() {
    const qrContainer = document.getElementById('ki-qr-canvas-box');
    if (!qrContainer || !this.roomId) return;
    qrContainer.innerHTML = '';

    const joinUrl = firebaseNetwork.getKelimeIslemUrl(this.roomId);
    try {
      const cvs = document.createElement('canvas');
      qrContainer.appendChild(cvs);
      QRCode.toCanvas(cvs, joinUrl, {
        width: 150,
        margin: 1,
        color: { dark: '#00F5D4', light: '#FFFFFF' }
      }, (err) => {
        if (err) {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}" width="150" height="150" style="display:block; border-radius:8px;" />`;
        }
      });
    } catch (err) {
      qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}" width="150" height="150" style="display:block; border-radius:8px;" />`;
    }
  }

  renderConnectedPlayersUI() {
    const pContainer = document.getElementById('ki-connected-players-box');
    if (!pContainer) return;

    if (!this.connectedPlayers || this.connectedPlayers.length === 0) {
      pContainer.innerHTML = '<div style="font-size:0.78rem; color:var(--text-muted); text-align:center;">👥 Henüz bağlı yarışmacı yok. QR kod okutulduğunda burada listelenir.</div>';
      return;
    }

    pContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:0.78rem; color:#00F5D4; font-weight:800;">👥 Bağlı Yarışmacılar (${this.connectedPlayers.length}):</span>
        <button type="button" class="btn-host-moderation-badge" id="btn-ki-mod-open" style="padding:2px 8px; font-size:0.72rem; vertical-align:middle;">
          <span class="pulse-dot"></span> 🛡️ Yönetim Paneli
        </button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${this.connectedPlayers.map(p => {
          const isRed = p.team === 'red';
          return `
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1.5px solid ${isRed ? '#EF4444' : '#3B82F6'}; border-radius:999px; padding:4px 10px; font-size:0.8rem; font-weight:800;">
              <span>${isRed ? '🔴' : '🔵'}</span>
              <span style="color:#FFF;">${p.name || 'Yarışmacı'}</span>
              <button type="button" class="btn-ki-warn" data-id="${p.id}" data-name="${p.name}" style="background:rgba(251,191,36,0.2); border:1px solid #FBBF24; color:#FDE047; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="İkaz Gönder">⚠️ İkaz</button>
              <button type="button" class="btn-ki-kick" data-id="${p.id}" data-name="${p.name}" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#FCA5A5; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="Oyundan At">🚫 At</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-ki-mod-open')?.addEventListener('click', (e) => {
      e.stopPropagation();
      HostModerationPanel.open({
        namespace: 'kelime_islem',
        roomId: this.roomId,
        title: 'Bir Kelime Bir İşlem Hakem Masası'
      });
    });

    pContainer.querySelectorAll('.btn-ki-warn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pId = btn.dataset.id;
        const pName = btn.dataset.name;
        const reason = prompt(`⚠️ ${pName} adlı yarışmacıya gönderilecek ikaz mesajı:`, 'Lütfen kurallara uyun ve ekrandan ayrılmayın!');
        if (reason && reason.trim()) {
          firebaseNetwork.warnPlayer('kelime_islem', this.roomId, pId, reason.trim());
          if (this.game && this.game.showToast) this.game.showToast(`⚠️ ${pName} ikaz edildi.`);
        }
      };
    });

    pContainer.querySelectorAll('.btn-ki-kick').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pId = btn.dataset.id;
        const pName = btn.dataset.name;
        if (confirm(`🚫 ${pName} adlı yarışmacıyı oyundan atmak istediğinize emin misiniz?`)) {
          firebaseNetwork.kickPlayer('kelime_islem', this.roomId, pId, 'Hakem masası tarafından oyundan çıkarıldınız.');
          this.connectedPlayers = this.connectedPlayers.filter(x => x.id !== pId);
          this.renderConnectedPlayersUI();
          if (this.game && this.game.showToast) this.game.showToast(`🚫 ${pName} odadan atıldı.`);
        }
      };
    });
  }

  async toggleMultiDevice() {
    sounds.playClick();
    this.isMultiDevice = !this.isMultiDevice;
    if (this.isMultiDevice) {
      if (!this.roomId) {
        this.roomId = firebaseNetwork.generateRoomCode();
      }
      await this.initMultiRoom();
    } else {
      if (this.unsubscribeRoom) {
        try { this.unsubscribeRoom(); } catch (e) {}
      }
    }
    this.renderScreen();
  }

  async initMultiRoom() {
    const initialData = {
      roomId: this.roomId,
      namespace: 'kelime_islem',
      stage: this.stage,
      mode: this.mode,
      letters: this.letters,
      targetNumber: this.targetNumber,
      numbers: this.initialNumbers ? this.initialNumbers.map(n => n.value !== undefined ? n.value : n) : [],
      currentSeconds: this.currentSeconds,
      scores: this.scores
    };
    await firebaseNetwork.createRoom('kelime_islem', initialData);

    if (this.unsubscribeRoom) {
      try { this.unsubscribeRoom(); } catch (e) {}
    }

    this.unsubscribeRoom = firebaseNetwork.listenRoom('kelime_islem', this.roomId, (room) => {
      if (!room) return;
      if (room.players) {
        this.connectedPlayers = Object.values(room.players);
        this.renderConnectedPlayersUI();
      } else {
        this.connectedPlayers = [];
        this.renderConnectedPlayersUI();
      }
      if (room.actions) {
        const actionList = Object.values(room.actions);
        if (!this.processedActionIds) this.processedActionIds = new Set();
        const now = Date.now();
        actionList.forEach(act => {
          if (!act) return;
          const actId = act.id || (act.timestamp + '_' + act.type);
          if (!this.processedActionIds.has(actId) && (!act.timestamp || (now - act.timestamp) < 8000)) {
            this.processedActionIds.add(actId);
            this.handleIncomingAction(act);
          }
        });
      }
    });
  }

  handleIncomingAction(action) {
    if (!action) return;
    if (action.type === 'submit_word') {
      sounds.playDing();
      const teamBadge = action.team === 'red' ? '🔴' : '🔵';
      this.game.showToast(`📱 [${action.playerName} (${teamBadge})]: "${action.word}" (${action.length} harf)`);
      this.playerSubmissions.push(action);
    } else if (action.type === 'submit_islem') {
      sounds.playDing();
      const teamBadge = action.team === 'red' ? '🔴' : '🔵';
      this.game.showToast(`📱 [${action.playerName} (${teamBadge})]: ${action.value} buldu! (Fark: ${action.diff})`);
      this.playerSubmissions.push(action);
    } else if (action.type === 'reaction') {
      const text = (action.text || '').toLowerCase();
      if (text.includes('alkış') || text.includes('👏')) {
        sounds.playApplause();
      } else if (text.includes('zil') || text.includes('🔔')) {
        sounds.playBell();
      } else if (text.includes('dıııt') || text.includes('yanlış') || text.includes('❌')) {
        sounds.playWrong();
      } else if (text.includes('şampiyon') || text.includes('puan') || text.includes('🔥') || text.includes('oha') || text.includes('😱')) {
        sounds.playCheer();
      } else {
        sounds.playPop();
      }
      this.game.showToast(`💬 ${action.playerName}: ${action.text}`);
    }
  }

  renderQrCode() {
    const box = document.getElementById('ki-qr-canvas-box');
    if (!box || !this.roomId) return;
    box.innerHTML = '';

    const joinUrl = firebaseNetwork.getKelimeIslemUrl(this.roomId);
    const cvs = document.createElement('canvas');
    cvs.style.display = 'block';
    cvs.style.borderRadius = '8px';
    box.appendChild(cvs);

    const fallbackImg = () => {
      box.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(joinUrl)}" width="170" height="170" style="display:block; border-radius:8px;" />`;
    };

    try {
      const qrEngine = (typeof QRCode !== 'undefined' && QRCode) || (typeof window !== 'undefined' && window.QRCode);
      if (qrEngine && qrEngine.toCanvas) {
        const res = qrEngine.toCanvas(cvs, joinUrl, {
          width: 170,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        }, (err) => {
          if (err) fallbackImg();
        });
        if (res && typeof res.catch === 'function') {
          res.catch(fallbackImg);
        }
      } else {
        fallbackImg();
      }
    } catch (err) {
      fallbackImg();
    }
  }

  async syncRoomState() {
    if (!this.isMultiDevice || !this.roomId) return;
    try {
      await firebaseNetwork.updateRoom('kelime_islem', this.roomId, {
        stage: this.stage,
        mode: this.mode,
        letters: this.letters,
        targetNumber: this.targetNumber,
        numbers: this.initialNumbers ? this.initialNumbers.map(n => n.value !== undefined ? n.value : n) : [],
        currentSeconds: this.currentSeconds,
        scores: this.scores,
        currentTurn: this.currentTurn
      });
    } catch (e) {}
  }

  // --- 3.2. KELİME HARF ÇEKİLİŞ VIEW ---
  renderKelimeDrawView() {
    const slots = [];
    for (let i = 0; i < 9; i++) {
      const letter = this.letters[i] || '';
      const isJoker = i === 8;
      slots.push(`
        <div style="width:48px; height:52px; border-radius:12px; background:${letter ? (isJoker ? 'linear-gradient(135deg, #FBBF24, #D97706)' : 'rgba(0,245,212,0.18)') : 'rgba(0,0,0,0.4)'}; border:2px solid ${letter ? (isJoker ? 'var(--gold)' : 'var(--primary)') : 'rgba(255,255,255,0.2)'}; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:900; color:${isJoker ? '#0B0E14' : '#FFF'}; box-shadow:${letter ? '0 4px 15px rgba(0,245,212,0.25)' : 'none'}; animation:${letter ? 'popIn 0.3s ease' : 'none'};">
          ${letter || (isJoker ? '⭐' : '?')}
        </div>
      `);
    }

    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <div style="background:rgba(0,245,212,0.1); border:1px solid var(--primary); border-radius:12px; padding:8px 12px; margin-bottom:14px; font-size:0.85rem; font-weight:800; color:var(--primary);">
          🔤 1. ETAP: HARF ÇEKİLİŞİ (${this.letters.length}/8 Harf + ⭐ Joker)
        </div>

        <div style="display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
          ${slots.join('')}
        </div>

        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px;">
          Orijinal yarışmadaki gibi sesli ve sessiz harfleri seçerek torbadan çek:
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <button type="button" id="btn-draw-vowel" class="btn-main" style="background:linear-gradient(135deg, #EF4444, #B91C1C); color:#FFF; font-size:0.95rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;" ${this.letters.length >= 8 ? 'disabled' : ''}>
            🔴 Sesli Harf Çek (+)
          </button>
          <button type="button" id="btn-draw-consonant" class="btn-main" style="background:linear-gradient(135deg, #3B82F6, #1D4ED8); color:#FFF; font-size:0.95rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;" ${this.letters.length >= 8 ? 'disabled' : ''}>
            🔵 Sessiz Harf Çek (+)
          </button>
        </div>

        <button type="button" id="btn-draw-auto" class="btn-secondary" style="font-size:0.88rem; font-weight:800; padding:11px; border-radius:12px; width:100%; cursor:pointer;">
          ⚡ Otomatik 9 Harf Dağıt ve Başla
        </button>
      </div>
    `;
  }

  bindKelimeDrawEvents() {
    document.getElementById('btn-draw-vowel')?.addEventListener('click', () => this.drawVowel());
    document.getElementById('btn-draw-consonant')?.addEventListener('click', () => this.drawConsonant());
    document.getElementById('btn-draw-auto')?.addEventListener('click', () => this.drawAutoLetters());
  }

  // --- 3.3. KELİME YAZMA / OYNAMA VIEW ---
  renderKelimePlayView() {
    const letterButtons = this.letters.map((letter, idx) => {
      const isSelected = this.selectedLetterIndices.includes(idx);
      const isJoker = letter === '★';
      return `
        <button type="button" class="btn-letter-choice" data-idx="${idx}" style="width:46px; height:50px; border-radius:12px; background:${isSelected ? 'rgba(255,255,255,0.1)' : (isJoker ? 'linear-gradient(135deg, #FBBF24, #D97706)' : 'linear-gradient(135deg, #00F5D4, #00ba9f)')}; border:2px solid ${isJoker ? 'var(--gold)' : (isSelected ? 'rgba(255,255,255,0.2)' : 'var(--primary)')}; color:${isJoker ? '#0B0E14' : (isSelected ? 'rgba(255,255,255,0.3)' : '#0B0E14')}; font-size:1.45rem; font-weight:900; cursor:pointer; opacity:${isSelected ? '0.4' : '1'}; transform:${isSelected ? 'scale(0.92)' : 'scale(1)'}; transition:all 0.15s ease;">
          ${letter}
        </button>
      `;
    });

    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <!-- Süre Sayacı ve Etap Başlığı -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span style="font-size:0.8rem; font-weight:800; background:rgba(0,245,212,0.15); color:var(--primary); padding:4px 12px; border-radius:999px;">
            🔤 KELİME TÜRETME
          </span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">SÜRE:</span>
            <span id="ki-timer-seconds" style="font-size:1.6rem; font-weight:900; color:var(--gold); transition:transform 0.15s ease;">
              ${this.currentSeconds}
            </span>
          </div>
        </div>

        <!-- Yazılan Kelime Panosu -->
        <div style="background:rgba(0,0,0,0.6); border:2px solid var(--primary); border-radius:16px; padding:14px; min-height:64px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; box-shadow:0 0 20px rgba(0,245,212,0.25);">
          <div style="font-size:1.8rem; font-weight:900; color:#FFF; letter-spacing:4px;">
            ${this.currentWord || '<span style="color:rgba(255,255,255,0.25); font-size:1.1rem; letter-spacing:1px;">Harflere Dokunarak Yaz</span>'}
          </div>
        </div>

        <!-- Joker Harf Seçici (Eğer joker kullanıldıysa) -->
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; background:rgba(251,191,36,0.1); border:1px dashed var(--gold); border-radius:12px; padding:6px 10px;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--gold);">⭐ JOKERİN HARFİ:</span>
          <select id="select-joker-letter" style="background:#0F172A; border:1px solid var(--gold); color:#FFF; font-weight:900; font-size:0.9rem; padding:4px 8px; border-radius:8px;">
            ${TURKISH_VOWELS.concat(TURKISH_CONSONANTS).map(c => `<option value="${c}" ${this.jokerLetter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <!-- Kullanılabilir Harfler -->
        <div style="display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-bottom:16px;">
          ${letterButtons.join('')}
        </div>

        <!-- Aksiyonlar -->
        <!-- Süre Kontrolleri (+15s & Duraklat) -->
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-bottom:10px;">
          <button type="button" id="btn-ki-add-time" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; cursor:pointer;">
            +15s Ekle
          </button>
          <button type="button" id="btn-ki-pause-timer" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; cursor:pointer;">
            ${this.isTimerPaused ? '▶️ Devam Et' : '⏸️ Duraklat'}
          </button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1.6fr; gap:8px;">
          <button type="button" id="btn-undo-word" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px 6px; border-radius:12px; cursor:pointer; background:rgba(251,191,36,0.15); border:1.5px solid var(--gold); color:var(--gold);" ${this.selectedLetterIndices.length === 0 ? 'disabled' : ''}>
            ⌫ Geri Al
          </button>
          <button type="button" id="btn-clear-word" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px 6px; border-radius:12px; cursor:pointer;">
            🗑️ Temizle
          </button>
          <button type="button" id="btn-submit-word" class="btn-main primary" style="font-size:0.95rem; font-weight:900; padding:12px 6px; border-radius:12px; cursor:pointer;">
            ✅ Onayla (${this.currentWord.length})
          </button>
        </div>
      </div>
    `;
  }

  bindKelimePlayEvents() {
    document.querySelectorAll('.btn-letter-choice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.toggleLetterInWord(idx);
      });
    });

    document.getElementById('select-joker-letter')?.addEventListener('change', (e) => {
      this.setJokerLetter(e.target.value);
    });

    document.getElementById('btn-undo-word')?.addEventListener('click', () => this.undoLastLetter());
    document.getElementById('btn-ki-add-time')?.addEventListener('click', () => this.addExtraSeconds(15));
    document.getElementById('btn-ki-pause-timer')?.addEventListener('click', () => this.togglePauseTimer());
    document.getElementById('btn-clear-word')?.addEventListener('click', () => this.clearWord());
    document.getElementById('btn-submit-word')?.addEventListener('click', () => this.finishKelimeStage());
  }

  // --- 3.4. KELİME SONUÇ VIEW ---
  renderKelimeResultView() {
    const word = this.currentWord.trim().toLocaleUpperCase('tr-TR');
    const isSuccess = this.playerWordPoints > 0;
    const compWord = this.computerBestWord || { word: 'BULUNAMADI', length: 0, points: 0 };

    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <div style="font-size:2.4rem; margin-bottom:4px;">
          ${isSuccess ? '🎉' : '❌'}
        </div>
        <h3 style="font-size:1.35rem; font-weight:900; color:#FFF; margin-bottom:12px;">
          ${isSuccess ? 'TEBRİKLER! GEÇERLİ KELİME' : 'GEÇERSİZ VEYA BULUNAMADI'}
        </h3>

        <!-- Oyuncunun Kelimesi -->
        <div style="background:rgba(0,0,0,0.4); border:1.5px solid ${isSuccess ? '#10B981' : '#EF4444'}; border-radius:16px; padding:14px; margin-bottom:12px;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); margin-bottom:4px;">SENİN KELİMEN:</div>
          <div style="font-size:1.6rem; font-weight:900; color:${isSuccess ? '#10B981' : '#EF4444'}; letter-spacing:2px;">
            ${word || '(BOŞ)'}
          </div>
          <div style="font-size:1.1rem; font-weight:900; color:var(--gold); margin-top:4px;">
            +${this.playerWordPoints} PUAN
          </div>
          ${!isSuccess && word.length >= 3 ? `
            <button type="button" id="btn-jury-accept" style="margin-top:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:#FFF; font-size:0.78rem; font-weight:800; padding:6px 14px; border-radius:8px; cursor:pointer;">
              ⚖️ Jüri / Masadakiler Onaylasın (Geçerli Say)
            </button>
          ` : ''}
        </div>

        <!-- Bilgisayarın En Uzun Kelimesi -->
        <div style="background:linear-gradient(135deg, rgba(251,191,36,0.15), rgba(0,0,0,0.5)); border:1.5px solid var(--gold); border-radius:16px; padding:14px; margin-bottom:16px;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--gold); margin-bottom:4px;">🤖 BİLGİSAYARIN EN UZUN KELİMESİ:</div>
          <div style="font-size:1.4rem; font-weight:900; color:#FFF; letter-spacing:2px;">
            "${compWord.word}" (${compWord.length} Harf)
          </div>
          <div style="font-size:0.85rem; font-weight:800; color:var(--gold); margin-top:2px;">
            Maksimum Puan: ${compWord.points} P
          </div>
        </div>

        <!-- Sonraki Adım Butonu -->
        ${this.mode === 'full' ? `
          <button type="button" id="btn-goto-islem" class="btn-main primary" style="font-size:1.05rem; font-weight:900; padding:14px; border-radius:999px; width:100%; box-shadow:0 6px 20px rgba(0,245,212,0.4); cursor:pointer;">
            ➡️ 2. Etap: Bir İşlem Etabına Geç
          </button>
        ` : `
          <button type="button" id="btn-next-round" class="btn-main primary" style="font-size:1.05rem; font-weight:900; padding:14px; border-radius:999px; width:100%; cursor:pointer;">
            🔄 Yeni Tur Başlat
          </button>
        `}
      </div>
    `;
  }

  bindKelimeResultEvents() {
    document.getElementById('btn-jury-accept')?.addEventListener('click', () => this.acceptWordByJury());
    document.getElementById('btn-goto-islem')?.addEventListener('click', () => this.startIslemStage());
    document.getElementById('btn-next-round')?.addEventListener('click', () => this.nextRoundOrGameOver());
  }

  // --- 3.5. İŞLEM OYNAMA VIEW ---
  renderIslemPlayView() {
    const numCards = this.availableNumbers.map(c => {
      if (c.used) return '';
      const isSelected = this.selectedNum1 && this.selectedNum1.id === c.id;
      return `
        <button type="button" class="btn-islem-num" data-id="${c.id}" style="min-width:54px; height:54px; padding:0 12px; border-radius:14px; background:${isSelected ? 'linear-gradient(135deg, #00F5D4, #00ba9f)' : (c.isResult ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.08)')}; border:2px solid ${isSelected ? '#FFF' : (c.isResult ? '#A78BFA' : 'rgba(255,255,255,0.25)')}; color:${isSelected ? '#0B0E14' : '#FFF'}; font-size:1.35rem; font-weight:900; cursor:pointer; box-shadow:${isSelected ? '0 0 20px rgba(0,245,212,0.6)' : 'none'}; transform:${isSelected ? 'scale(1.08)' : 'scale(1)'}; transition:all 0.15s ease;">
          ${c.value}
        </button>
      `;
    }).filter(Boolean);

    const ops = ['+', '-', '×', '÷'].map(op => {
      const isSelected = this.selectedOp === op;
      return `
        <button type="button" class="btn-islem-op" data-op="${op}" style="flex:1; height:48px; border-radius:12px; background:${isSelected ? 'linear-gradient(135deg, #FBBF24, #D97706)' : 'rgba(0,0,0,0.5)'}; border:2px solid ${isSelected ? '#FFF' : 'rgba(251,191,36,0.35)'}; color:${isSelected ? '#0B0E14' : 'var(--gold)'}; font-size:1.6rem; font-weight:900; cursor:pointer; transition:all 0.15s ease;">
          ${op}
        </button>
      `;
    });

    const diff = Math.abs((this.bestPlayerValue || 0) - this.targetNumber);

    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <!-- Hedef Sayı ve Kalan Süre -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="font-size:0.8rem; font-weight:800; background:rgba(251,191,36,0.15); color:var(--gold); padding:4px 12px; border-radius:999px;">
            🧮 2. ETAP: BİR İŞLEM
          </span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">SÜRE:</span>
            <span id="ki-timer-seconds" style="font-size:1.6rem; font-weight:900; color:var(--gold);">
              ${this.currentSeconds}
            </span>
          </div>
        </div>

        <!-- HEDEF SAYI DEV PANELİ -->
        <div style="background:linear-gradient(135deg, rgba(0,0,0,0.7), rgba(15,23,42,0.9)); border:2.5px solid var(--gold); border-radius:18px; padding:14px; margin-bottom:14px; box-shadow:0 0 25px rgba(251,191,36,0.25);">
          <div style="font-size:0.75rem; font-weight:800; color:var(--gold); letter-spacing:1px; margin-bottom:2px;">HEDEF SAYI</div>
          <div style="font-size:2.8rem; font-weight:900; color:#FFF; font-family:monospace; letter-spacing:3px; line-height:1;">
            ${this.targetNumber}
          </div>
          <div style="font-size:0.8rem; font-weight:800; color:#CBD5E1; margin-top:6px;">
            Şu anki En Yakın Değerin: <span style="color:#00F5D4; font-weight:900;">${this.bestPlayerValue || 0}</span> (Fark: ${diff})
          </div>
        </div>

        <!-- Seçim Durumu Bilgi Çubuğu -->
        <div style="background:rgba(0,0,0,0.35); border-radius:10px; padding:6px 12px; margin-bottom:12px; font-size:0.82rem; font-weight:800; color:var(--primary); min-height:30px; display:flex; align-items:center; justify-content:center;">
          ${!this.selectedNum1 ? '👉 Birinci sayıyı seçin' : (!this.selectedOp ? `👉 Seçildi: [ ${this.selectedNum1.value} ] Şimdi bir işlem (+, -, ×, ÷) seçin` : `👉 Seçildi: [ ${this.selectedNum1.value} ] ${this.selectedOp} Şimdi ikinci sayıyı seçin`)}
        </div>

        <!-- Sayı Kartları -->
        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
          ${numCards.join('')}
        </div>

        <!-- İşlem Butonları -->
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          ${ops.join('')}
        </div>

        <!-- Yapılan Adımlar Listesi -->
        <div style="background:rgba(0,0,0,0.4); border-radius:12px; padding:10px; margin-bottom:14px; min-height:50px; text-align:left; font-size:0.82rem; font-weight:800; color:#FFF; max-height:100px; overflow-y:auto;">
          ${this.calcHistory.length === 0 ? '<span style="color:var(--text-muted); font-size:0.75rem;">Henüz bir işlem yapılmadı...</span>' : this.calcHistory.map((h, i) => `<div>${i + 1}) ${h.num1Val} ${h.op} ${h.num2Val} = <strong>${h.resVal}</strong></div>`).join('')}
        </div>

        <!-- Alt Aksiyonlar -->
        <div style="display:grid; grid-template-columns:1fr 2fr; gap:8px;">
          <!-- Süre Kontrolleri (+15s & Duraklat) -->
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-bottom:10px;">
          <button type="button" id="btn-ki-islem-add-time" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; background:rgba(0,245,212,0.15); border:1px solid var(--primary); color:#00F5D4; cursor:pointer;">
            +15s Ekle
          </button>
          <button type="button" id="btn-ki-islem-pause-timer" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:8px; cursor:pointer;">
            ${this.isTimerPaused ? '▶️ Devam Et' : '⏸️ Duraklat'}
          </button>
        </div>

        <button type="button" id="btn-undo-islem" class="btn-secondary" style="font-size:0.85rem; font-weight:800; padding:12px; border-radius:12px; cursor:pointer; background:rgba(251,191,36,0.15); border:1.5px solid var(--gold); color:var(--gold);" ${(this.calcHistory.length === 0 && !this.selectedNum1 && !this.selectedOp) ? 'disabled' : ''}>
            ↩️ Geri Al / İptal
          </button>
          <button type="button" id="btn-submit-islem" class="btn-main primary" style="font-size:1rem; font-weight:900; padding:12px; border-radius:12px; cursor:pointer;">
            ✅ Tamamla (${this.bestPlayerValue || 0})
          </button>
        </div>
      </div>
    `;
  }

  bindIslemPlayEvents() {
    document.querySelectorAll('.btn-islem-num').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.selectNumberCard(id);
      });
    });

    document.querySelectorAll('.btn-islem-op').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const op = e.currentTarget.getAttribute('data-op');
        this.selectOperator(op);
      });
    });

    document.getElementById('btn-ki-islem-add-time')?.addEventListener('click', () => this.addExtraSeconds(15));
    document.getElementById('btn-ki-islem-pause-timer')?.addEventListener('click', () => this.togglePauseTimer());
    document.getElementById('btn-undo-islem')?.addEventListener('click', () => this.undoLastCalculation());
    document.getElementById('btn-submit-islem')?.addEventListener('click', () => this.finishIslemStage());
  }

  // --- 3.6. İŞLEM SONUÇ VIEW ---
  renderIslemResultView() {
    const diff = Math.abs(this.bestPlayerValue - this.targetNumber);
    const comp = this.computerSolution || { bestVal: 0, bestDiff: 999, bestSteps: [] };

    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <div style="font-size:2.4rem; margin-bottom:4px;">
          ${diff === 0 ? '🎯' : (diff <= 5 ? '👏' : '🤔')}
        </div>
        <h3 style="font-size:1.35rem; font-weight:900; color:#FFF; margin-bottom:12px;">
          ${diff === 0 ? 'TAM İSABET! (12\'DEN VURDUN)' : `HEDEFE ${diff} KALDI!`}
        </h3>

        <!-- Oyuncu Değeri -->
        <div style="background:rgba(0,0,0,0.4); border:1.5px solid ${diff === 0 ? '#10B981' : '#FBBF24'}; border-radius:16px; padding:14px; margin-bottom:12px;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted);">HEDEF: ${this.targetNumber} | SENİN DEĞERİN:</div>
          <div style="font-size:2rem; font-weight:900; color:${diff === 0 ? '#10B981' : 'var(--gold)'}; font-family:monospace;">
            ${this.bestPlayerValue}
          </div>
          <div style="font-size:1.1rem; font-weight:900; color:#FFF; margin-top:2px;">
            +${this.playerNumberPoints} PUAN
          </div>
        </div>

        <!-- Bilgisayarın Çözümü -->
        <div style="background:linear-gradient(135deg, rgba(0,245,212,0.1), rgba(0,0,0,0.5)); border:1.5px solid var(--primary); border-radius:16px; padding:14px; margin-bottom:16px; text-align:left;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--primary); margin-bottom:6px; text-align:center;">
            🤖 BİLGİSAYARIN ADIM ADIM ÇÖZÜMÜ:
          </div>
          <div style="font-size:0.85rem; font-weight:900; color:#FFF; line-height:1.6; font-family:monospace; background:rgba(0,0,0,0.4); padding:8px 12px; border-radius:10px;">
            ${comp.bestSteps && comp.bestSteps.length > 0 ? comp.bestSteps.map((s, i) => `<div>${i + 1}) ${s}</div>`).join('') : 'Çözüm bulunamadı'}
          </div>
          <div style="font-size:0.75rem; color:#A78BFA; font-weight:800; text-align:center; margin-top:6px;">
            Bilgisayar Değeri: ${comp.bestVal} (Fark: ${comp.bestDiff})
          </div>
        </div>

        <button type="button" id="btn-next-action" class="btn-main primary" style="font-size:1.05rem; font-weight:900; padding:14px; border-radius:999px; width:100%; box-shadow:0 6px 20px rgba(0,245,212,0.4); cursor:pointer;">
          ${this.mode === 'full' && this.playerMode === 'duel' && this.currentTurn === 'red' ? '🔵 Mavi Takımın Sırasına Geç ➔' : '🏆 Sonuç Tablosu / Yeni Tur ➔'}
        </button>
      </div>
    `;
  }

  bindIslemResultEvents() {
    document.getElementById('btn-next-action')?.addEventListener('click', () => this.nextRoundOrGameOver());
  }

  // --- 3.7. GAME OVER VIEW ---
  renderGameOverView() {
    let winnerText = '';
    if (this.playerMode === 'duel') {
      if (this.scores.red > this.scores.blue) {
        winnerText = '🏆 KIRMIZI TAKIM KAZANDI!';
      } else if (this.scores.blue > this.scores.red) {
        winnerText = '🏆 MAVİ TAKIM KAZANDI!';
      } else {
        winnerText = '🤝 DOSTLUK KAZANDI! BERABERE!';
      }
    } else {
      winnerText = `🏆 TEBRİKLER! TOPLAM SKORUN: ${this.scores.solo} PUAN`;
    }

    return `
      <div class="card" style="text-align:center; padding:24px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.95), rgba(15,23,42,0.98)); border:2px solid var(--gold); border-radius:24px; box-shadow:0 0 35px rgba(251,191,36,0.3);">
        <div style="font-size:3.5rem; margin-bottom:8px;">🏆</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:var(--gold); margin-bottom:14px;">
          ${winnerText}
        </h2>

        ${this.playerMode === 'duel' ? `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
            <div style="background:rgba(239,68,68,0.2); border:2px solid #EF4444; border-radius:16px; padding:14px;">
              <div style="font-size:0.85rem; font-weight:800; color:#EF4444;">🔴 KIRMIZI TAKIM</div>
              <div style="font-size:2rem; font-weight:900; color:#FFF;">${this.scores.red} P</div>
            </div>
            <div style="background:rgba(59,130,246,0.2); border:2px solid #3B82F6; border-radius:16px; padding:14px;">
              <div style="font-size:0.85rem; font-weight:800; color:#3B82F6;">🔵 MAVİ TAKIM</div>
              <div style="font-size:2rem; font-weight:900; color:#FFF;">${this.scores.blue} P</div>
            </div>
          </div>
        ` : `
          <div style="background:rgba(251,191,36,0.15); border:2px solid var(--gold); border-radius:16px; padding:16px; margin-bottom:20px;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--gold);">TOPLAM KELİME & İŞLEM PUANI</div>
            <div style="font-size:2.6rem; font-weight:900; color:#FFF;">${this.scores.solo}</div>
          </div>
        `}

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button type="button" id="btn-play-again" class="btn-main primary" style="font-size:1rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🔄 Tekrar Oyna
          </button>
          <button type="button" id="btn-back-to-arena" class="btn-secondary" style="font-size:1rem; font-weight:800; padding:14px; border-radius:14px; cursor:pointer;">
            ← Parti Arenası
          </button>
        </div>
      </div>
    `;
  }

  bindGameOverEvents() {
    document.getElementById('btn-play-again')?.addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-back-to-arena')?.addEventListener('click', () => {
      this.game.showScreen('partyGames');
    });
  }
}
