import { PartyMultiDeviceHelper } from './party-multi-device.js';
// js/kelime-bombasi.js
// Kafana Tak! - Son Sözü Kim Söyler? (Kelime Bombası / Hızlı Eliminasyon)

import { sounds } from './audio.js';

export const KELIME_CATEGORIES = [
  '🛒 Süpermarkette Satılan Şeyler',
  '🏙️ Türkiye\'nin İlleri ve İlçeleri',
  '🟢 Yeşil Renkli Nesneler ve Canlılar',
  '⚽ Futbolcular ve Spor Kulüpleri',
  '🍕 Lezzetli Yemekler ve Tatlılar',
  '🦁 Vahşi veya Evcil Hayvanlar',
  '🎬 Popüler Dizi ve Film Adları',
  '🚗 Arabada veya Trafikte Olan Şeyler',
  '🎒 Okul Çantasında Bulunan Eşyalar',
  '🏖️ Plajda veya Denizde Görülen Şeyler',
  '💼 Meslekler ve İş Kolları',
  '📱 Akıllı Telefon Uygulamaları ve Markalar',
  '❄️ Kış Mevsimiyle İlgili Kelimeler',
  '🎸 Müzik Aletleri ve Terimleri',
  '🏥 Hastanede veya Eczanede Olan Şeyler'
];

export const KELIME_LETTERS = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Ş', 'T', 'U', 'V', 'Y', 'Z'];

export class KelimeBombasiEngine {
  constructor(game) {
    this.game = game;
    this.category = '';
    this.letter = '';
    this.baseSeconds = 15.0;
    this.currentSeconds = 15.0;
    this.passCount = 0;
    this.timerInterval = null;
    this.isExploded = false;
    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'kelimebombasi',
      title: 'Kelime Bombası Masası',
      subtitle: '☁️ Harf ve kategori canlı akar, kelimeyi bilen zili çalar!',
      prefix: 'kelime',
      onAction: (act, room) => this.handlePlayerAction(act, room),
      onRoomRefresh: (newRoomId) => {
        this.syncWithCloud();
      }
    });
  }

  init() {
    this.bindEvents();
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[KelimeBombasi] Mod değişti:', mode);
        if (mode === 'wifi') {
          this.syncWithCloud();
        }
      });
    }
    this.newRound();
  }

  handlePlayerAction(act, room) {
    if (!act || this.isExploded) return;
    if (act.type === 'buzz_word' || act.type === 'buzzer') {
      const pName = act.playerName || (act.playerId && room && room.players && room.players[act.playerId] ? room.players[act.playerId].name : 'Bir oyuncu');
      this.handlePass(pName);
    }
  }

  bindEvents() {
    const btnPass = document.getElementById('btn-kelime-pass');
    if (btnPass) {
      btnPass.onclick = () => this.handlePass();
    }

    const btnNewRound = document.getElementById('btn-kelime-restart');
    if (btnNewRound) {
      btnNewRound.onclick = () => this.newRound();
    }

    const btnBack = document.getElementById('btn-back-from-kelime-bombasi');
    if (btnBack) {
      btnBack.onclick = () => {
        clearInterval(this.timerInterval);
        try { sounds.stopPartyBeat(); } catch (e) {}
        if (this.multiHelper) {
          this.multiHelper.stopRoom();
        }
        this.game.showScreen('partyGames');
      };
    }
  }

  newRound() {
    clearInterval(this.timerInterval);
    this.isExploded = false;
    this.passCount = 0;
    this.baseSeconds = 15.0;
    this.currentSeconds = 15.0;

    // Rastgele kategori ve harf
    this.category = KELIME_CATEGORIES[Math.floor(Math.random() * KELIME_CATEGORIES.length)];
    this.letter = KELIME_LETTERS[Math.floor(Math.random() * KELIME_LETTERS.length)];

    const catEl = document.getElementById('kelime-cat-title');
    if (catEl) catEl.textContent = this.category;
    const letterEl = document.getElementById('kelime-letter-badge');
    if (letterEl) letterEl.textContent = `HARF: ${this.letter}`;
    const passEl = document.getElementById('kelime-pass-count');
    if (passEl) passEl.textContent = `0 Pas (15s Süre)`;

    const actStage = document.getElementById('kelime-active-stage');
    if (actStage) actStage.style.display = 'block';
    const expStage = document.getElementById('kelime-exploded-stage');
    if (expStage) expStage.style.display = 'none';

    this.startTimer();
    this.syncWithCloud();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.currentSeconds = this.baseSeconds;
    this.updateTimerDisplay();
    try { sounds.startBombTicking(); } catch (e) {}

    const startTime = performance.now();
    const durationMs = this.baseSeconds * 1000;
    let lastSec = Math.ceil(this.baseSeconds);

    this.timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const rem = Math.max(0, (durationMs - elapsed) / 1000);
      this.currentSeconds = rem;
      this.updateTimerDisplay();

      const curSec = Math.ceil(rem);
      if (curSec !== lastSec) {
        lastSec = curSec;
        try { sounds.playBombTick(rem, this.baseSeconds); } catch (e) {}
        if (rem <= 5.0) {
          try { sounds.setMusicUrgent(true); } catch (e) {}
        }
      }

      if (rem <= 0) {
        clearInterval(this.timerInterval);
        this.explode();
      }
    }, 50);
  }

  updateTimerDisplay() {
    const timerText = document.getElementById('kelime-timer-val');
    const timerBar = document.getElementById('kelime-timer-bar');

    if (timerText) {
      timerText.textContent = `${this.currentSeconds.toFixed(1)}s`;
    }

    if (timerBar) {
      const pct = Math.max(0, (this.currentSeconds / this.baseSeconds) * 100);
      timerBar.style.width = `${pct}%`;
      if (this.currentSeconds <= 3.0) {
        timerBar.style.background = '#EF4444';
      } else {
        timerBar.style.background = 'linear-gradient(90deg, #00F5D4, #FBBF24)';
      }
    }
  }

  handlePass(passedByName = null) {
    if (this.isExploded) return;
    this.passCount++;
    sounds.playCorrect();

    // 15 saniye kuralı: Her pas yeni oyuncuya 15 saniye tanır
    this.baseSeconds = 15.0;
    const passText = passedByName ? `${this.passCount} Pas (${passedByName})` : `${this.passCount} Pas (15s Süre)`;
    const countEl = document.getElementById('kelime-pass-count');
    if (countEl) countEl.textContent = passText;
    this.startTimer();
    this.syncWithCloud();
  }

  explode() {
    this.isExploded = true;
    try { sounds.setMusicUrgent(false); } catch (e) {}
    try { sounds.stopBombTicking(); } catch (e) {}
    sounds.playBombExplosion();

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 400]);
    }

    const actStage = document.getElementById('kelime-active-stage');
    if (actStage) actStage.style.display = 'none';
    const expStage = document.getElementById('kelime-exploded-stage');
    if (expStage) expStage.style.display = 'block';
    const expDesc = document.getElementById('kelime-exploded-desc');
    if (expDesc) expDesc.textContent = `${this.passCount} pas sonrasında süre doldu ve bomba elinde patladı!`;

    this.syncWithCloud();
  }

  syncWithCloud() {
    if (!this.multiHelper || this.multiHelper.mode !== 'wifi') return;
    this.multiHelper.updateRoomState({
      category: this.category,
      letter: this.letter,
      phase: this.isExploded ? 'exploded' : 'playing',
      isExploded: this.isExploded,
      passCount: this.passCount,
      lastActive: Date.now()
    }).catch(err => console.warn('[KelimeBombasi] sync error:', err));
  }
}
