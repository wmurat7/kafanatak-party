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
  }

  init() {
    this.bindEvents();
    this.newRound();
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

    document.getElementById('kelime-cat-title').textContent = this.category;
    document.getElementById('kelime-letter-badge').textContent = `HARF: ${this.letter}`;
    document.getElementById('kelime-pass-count').textContent = `0 Pas (15s Süre)`;

    document.getElementById('kelime-active-stage').style.display = 'block';
    document.getElementById('kelime-exploded-stage').style.display = 'none';

    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.currentSeconds = this.baseSeconds;
    this.updateTimerDisplay();

    const startTime = performance.now();
    const durationMs = this.baseSeconds * 1000;

    this.timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const rem = Math.max(0, (durationMs - elapsed) / 1000);
      this.currentSeconds = rem;
      this.updateTimerDisplay();

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

  handlePass() {
    if (this.isExploded) return;
    this.passCount++;
    sounds.playCorrect();

    // 15 saniye kuralı: Her pas yeni oyuncuya 15 saniye tanır
    this.baseSeconds = 15.0;
    document.getElementById('kelime-pass-count').textContent = `${this.passCount} Pas (15s Süre)`;
    this.startTimer();
  }

  explode() {
    this.isExploded = true;
    sounds.playExplosion();

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 400]);
    }

    document.getElementById('kelime-active-stage').style.display = 'none';
    document.getElementById('kelime-exploded-stage').style.display = 'block';
    document.getElementById('kelime-exploded-desc').textContent = `${this.passCount} pas sonrasında süre doldu ve bomba elinde patladı!`;
  }
}
