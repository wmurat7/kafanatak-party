// js/gulmeme-meydani.js
// Kafana Tak! - Gülmeme Meydan Okuması (Face-to-Face Kamera Düellosu & Su Püskürtme Meydanı)

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
  'Tencere kapağı gibi tıslayarak hava kaçırma sesi çıkar.',
  'Ağzını hiç açmadan dişlerinin arasından "Ben bir patatesim" de.',
  'Ağır çekimde esne ve arkadaşına en komik bakışını at.',
  'Arkadaşının saçına bakıp "Orada bir uzaylı mı var?" diye dehşetle fısılda.',
  'Arkadaşının gözlerinin içine bakarak sadece derin derin nefes al.',
  'Ağzını büzüp balık gibi "blup blup" yaparak gözlerini devir.',
  'İtalyan mafyası gibi elini sallayarak "Mamma mia, sen ne diyorsun!" de.',
  'Kafanı hafifçe yana eğip en masum yavru kedi bakışını at.',
  'En derin ses tonunla arkadaşına "Pizzayı sen mi yedin?" diye sor.',
  'Burnunu çekip "Buralar biraz şampiyon koktu" de.',
  'Ağzını açmadan sadece burnundan komik bir melodi mırıldan.',
  'Gözlerini sonuna kadar açıp arkadaşının kaşlarına kilitlen!',
  'En dramatize pembe dizi repliğini söyle: "Bunu bana nasıl yaparsın!"'
];

export const DAD_JOKES = [
  'Geçen gün bir espri yaptım, hava o kadar soğuktu ki dondu kaldı.',
  'Adamın biri gülmüş, bahçeye dikmişler!',
  'Yangın dolabını açmışlar, içinden ne çıkmış? Yangın!',
  'Röntgen filmi çektirdik, yakında sinemalarda!',
  'Fransız ihtilali neye karşı yapılmıştır? Tabii ki sabaha karşı!',
  'Geçen gün fırına gittim, ekmek kalmamış. Ben de pide aldım.',
  'Gözün aydın, kulakların manisa!',
  'İlahi Azrail, sen adamı öldürürsün!',
  'Geçen gün taksi çevirdim, hala dönüyor!',
  'Yıkanan tona ne denir? Washington!',
  'Adamın biri kitap okurken ölmüş, neden? Satır başına gelmiş!',
  'Seven ne yapmaz? Dubleks yapar, site yapar!',
  'Geçen gün bir şaka yaptım, duvardaki tablo bile eğildi!',
  'Sinemada on dakika ara verdiler, aradım ama meşguldü!',
  'Adamın kafasına radyo düşmüş, bir şey olmamış; çünkü hafif müzik çalıyormuş!',
  'Hangi bağda üzüm yetişmez? Tabii ki ayakkabı bağında!',
  'Masada hangi örtü yenir? Tabii ki börek altı!',
  'En acı meyve hangisidir? Tabii ki biber!',
  'Tavuklar en çok hangi sporu sever? Tabii ki gıdık basketbolu!'
];

export class GulmemeMeydaniEngine {
  constructor(game) {
    this.game = game;
    this.stream = null;
    this.timerInterval = null;
    this.promptInterval = null;
    this.tensionInterval = null;
    this.remainingSeconds = 60;
    this.scores = { player1: 0, player2: 0 };
    this.currentPrompt = '';
    this.isWaterMode = false;
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
        clearInterval(this.tensionInterval);
        this.game.showScreen('party-games');
      };
    }

    // Troll Sesi Butonu
    const btnTroll = document.getElementById('btn-trigger-troll-sound');
    if (btnTroll) {
      btnTroll.onclick = () => this.playTrollSound();
    }

    // Su Modu Butonu
    const btnWater = document.getElementById('btn-toggle-water-mode');
    if (btnWater) {
      btnWater.onclick = () => {
        this.isWaterMode = !this.isWaterMode;
        sounds.playClick();
        btnWater.textContent = this.isWaterMode ? '💧 Ağza Su Al: AÇIK!' : '💧 Ağza Su Al: Kapalı';
        btnWater.style.background = this.isWaterMode ? 'rgba(0,245,212,0.35)' : 'rgba(0,245,212,0.15)';
        const banner = document.getElementById('water-mode-banner');
        if (banner) banner.style.display = this.isWaterMode ? 'block' : 'none';
      };
    }
  }

  playTrollSound() {
    try {
      const audioCtx = sounds.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) return;

      const types = ['fart', 'boing', 'siren', 'whistle'];
      const chosen = types[Math.floor(Math.random() * types.length)];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (chosen === 'fart') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.35);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (chosen === 'boing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }

      // Barometreyi zıplat
      const bar = document.getElementById('gulmeme-tension-bar');
      if (bar) bar.style.width = '90%';
    } catch(e) {
      sounds.playWheelTick();
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
    clearInterval(this.tensionInterval);
    this.remainingSeconds = 60;

    document.getElementById('gulmeme-timer').textContent = '60s';
    document.getElementById('gulmeme-active-duel').style.display = 'block';
    document.getElementById('gulmeme-duel-over').style.display = 'none';

    this.nextPrompt();
    this.promptInterval = setInterval(() => this.nextPrompt(), 6500);

    // Canlı Gerginlik Barı Simülasyonu
    this.tensionInterval = setInterval(() => {
      const bar = document.getElementById('gulmeme-tension-bar');
      if (bar) {
        const randWidth = Math.floor(20 + Math.random() * 65);
        bar.style.width = `${randWidth}%`;
      }
    }, 1200);

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      document.getElementById('gulmeme-timer').textContent = `${this.remainingSeconds}s`;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        clearInterval(this.promptInterval);
        clearInterval(this.tensionInterval);
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
      this.scores.player2++;
      this.finishDuel(this.isWaterMode ? '💧 1. OYUNCU SUYU PÜSKÜRTTÜ! Puan 2. Oyuncuya!' : '😂 1. OYUNCU GÜLDÜ! Puan 2. Oyuncuya!');
    } else {
      this.scores.player1++;
      this.finishDuel(this.isWaterMode ? '💧 2. OYUNCU SUYU PÜSKÜRTTÜ! Puan 1. Oyuncuya!' : '😂 2. OYUNCU GÜLDÜ! Puan 1. Oyuncuya!');
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
    clearInterval(this.tensionInterval);

    document.getElementById('gulmeme-active-duel').style.display = 'none';
    document.getElementById('gulmeme-duel-over').style.display = 'block';
    document.getElementById('gulmeme-result-text').textContent = resultText;
  }
}
