// js/gulmeme-meydani.js
// Kafana Tak! - Gülmeme Meydan Okuması (Face-to-Face Kamera Düellosu)

import { sounds } from './audio.js';

export const FUNNY_CHALLENGES = [
  'Gözlerini hiç kırpmadan 10 saniye boyunca arkadaşının burnuna odaklan!',
  'Ciddi bir ifadeyle tavuk sesi çıkar ve arkadaşına bak.',
  'En havalı model bakışını at ve 5 saniye öyle kal.',
  'Ağzında sıcak patates varmış gibi "Bugün hava çok güzel" de.',
  'Kaşlarını yukarı kaldırıp arkadaşına fısıltıyla "Seni izliyorum" de.',
  'Bıyıklarını sıvazlıyormuş gibi yapıp "Ben bu oyunu bozarım" de.',
  'Gözlerini şaşı yapıp en ciddi haber spikeri ses tonunla haber sun.',
  'Arkadaşının sol omzunda görünmez bir papağan varmış gibi onunla konuş.',
  'Robot gibi hareket ederek "Gülmek benim sistemime aykırıdır" de.',
  'Tencere kapağı gibi tıslayarak hava kaçırma sesi çıkar.'
];

export const DAD_JOKES = [
  'Geçen gün bir espri yaptım, hava o kadar soğuktu ki dondu kaldı.',
  'Adamın biri gülmüş, bahçeye dikmişler!',
  'Yangın dolabını açmışlar, içinden ne çıkmış? Yangın!',
  'Röntgen filmi çektirdik, yakında sinemalarda!',
  'Fransız ihtilali neye karşı yapılmıştır? Tabii ki sabaha karşı!',
  'Geçen gün fırına gittim, ekmek kalmamış. Ben de pide aldım.',
  'Gözün aydın, kulakların manisa!'
];

export class GulmemeMeydaniEngine {
  constructor(game) {
    this.game = game;
    this.stream = null;
    this.timerInterval = null;
    this.promptInterval = null;
    this.remainingSeconds = 60;
    this.scores = { player1: 0, player2: 0 };
    this.currentPrompt = '';
  }

  init() {
    this.bindEvents();
    this.startCamera();
    this.newDuel();
  }

  bindEvents() {
    const btnP1 = document.getElementById('btn-guldu-p1');
    const btnP2 = document.getElementById('btn-guldu-p2');

    if (btnP1) {
      btnP1.onclick = () => this.handleLaughed('player1');
    }
    if (btnP2) {
      btnP2.onclick = () => this.handleLaughed('player2');
    }

    const btnRestart = document.getElementById('btn-gulmeme-restart');
    if (btnRestart) {
      btnRestart.onclick = () => this.newDuel();
    }

    const btnBack = document.getElementById('btn-back-from-gulmeme');
    if (btnBack) {
      btnBack.onclick = () => {
        this.stopCamera();
        clearInterval(this.timerInterval);
        clearInterval(this.promptInterval);
        this.game.showScreen('party-games');
      };
    }
  }

  async startCamera() {
    const video = document.getElementById('gulmeme-video');
    if (!video) return;

    try {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      video.srcObject = this.stream;
      video.play();
    } catch (e) {
      console.warn('Kamera açılamadı, simülasyon modu:', e);
      const fallback = document.getElementById('gulmeme-cam-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  newDuel() {
    clearInterval(this.timerInterval);
    clearInterval(this.promptInterval);
    this.remainingSeconds = 60;

    document.getElementById('gulmeme-timer').textContent = '60s';
    document.getElementById('gulmeme-active-duel').style.display = 'block';
    document.getElementById('gulmeme-duel-over').style.display = 'none';

    this.nextPrompt();
    this.promptInterval = setInterval(() => this.nextPrompt(), 7000);

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      document.getElementById('gulmeme-timer').textContent = `${this.remainingSeconds}s`;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        clearInterval(this.promptInterval);
        this.finishDuel('Berabere! İki taraf da taş gibi durdu!');
      }
    }, 1000);
  }

  nextPrompt() {
    const isJoke = Math.random() > 0.5;
    const pool = isJoke ? DAD_JOKES : FUNNY_CHALLENGES;
    this.currentPrompt = pool[Math.floor(Math.random() * pool.length)];

    const promptEl = document.getElementById('gulmeme-prompt-text');
    if (promptEl) {
      promptEl.style.opacity = '0';
      setTimeout(() => {
        promptEl.textContent = this.currentPrompt;
        promptEl.style.opacity = '1';
        sounds.playTick();
      }, 200);
    }
  }

  handleLaughed(who) {
    sounds.playCheer();
    if (who === 'player1') {
      // 1. Oyuncu güldü -> 2. Oyuncu puan alır
      this.scores.player2++;
      this.finishDuel('😂 1. OYUNCU GÜLDÜ! Puan 2. Oyuncuya!');
    } else {
      // 2. Oyuncu güldü -> 1. Oyuncu puan alır
      this.scores.player1++;
      this.finishDuel('😂 2. OYUNCU GÜLDÜ! Puan 1. Oyuncuya!');
    }
    this.updateScoresUI();
  }

  updateScoresUI() {
    document.getElementById('gulmeme-score-p1').textContent = `1. Oyuncu: ${this.scores.player1} P`;
    document.getElementById('gulmeme-score-p2').textContent = `2. Oyuncu: ${this.scores.player2} P`;
  }

  finishDuel(resultText) {
    clearInterval(this.timerInterval);
    clearInterval(this.promptInterval);

    document.getElementById('gulmeme-active-duel').style.display = 'none';
    document.getElementById('gulmeme-duel-over').style.display = 'block';
    document.getElementById('gulmeme-result-text').textContent = resultText;
  }
}
