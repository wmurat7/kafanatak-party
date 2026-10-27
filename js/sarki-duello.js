// js/sarki-duello.js
// Kafana Tak! - Şarkıyı Devam Ettir (Melodi Düellosu) Parti Oyunu

import { sounds } from './audio.js';
import { firebaseNetwork } from './firebase-network.js';
import { HostModerationPanel } from './host-moderation-panel.js';

export const TURKISH_SONGS = [
  {
    title: 'Dönence',
    artist: 'Barış Manço',
    genre: '🎸 Anadolu Rock',
    lyricsBefore: 'Simsiyah gecenin koynundayım yapayalnız,\nUzaklarda bir yerlerde türküler söyleniyor,\nBu gece yağmur gibi dökülürüm gözlerinden...',
    missingLine: 'Gözlerimde yağmur gibi ağlarım sessizce!',
    options: ['Gözlerimde yağmur gibi ağlarım sessizce!', 'Yüreğimde bir yangın başlar delice', 'Sabahı beklerim gözlerimde bir umutla']
  },
  {
    title: 'Arkadaşım Eşek',
    artist: 'Barış Manço',
    genre: '🌟 Efsane Nostalji',
    lyricsBefore: 'Kaç yıl oldu saymadım köyden göçeli,\nMevsimler geldi geçti görüşmeyeli,\nBizim köyün yolları taştan çakıldan...',
    missingLine: 'Gözlerim yollarda kaldı arkadaşım eşek!',
    options: ['Gözlerim yollarda kaldı arkadaşım eşek!', 'Neredesin sen canım dostum benim', 'Köye geri dönmeye söz verdim ben']
  },
  {
    title: 'Şıkıdım (Hepsi Senin mi?)',
    artist: 'Tarkan',
    genre: '🔥 90\'lar Pop',
    lyricsBefore: 'Oynama şıkıdım şıkıdım,\nAh yanar döner a acayipsin,\nKıvırma şıkıdım şıkıdım...',
    missingLine: 'Başın döner a acayipsin!',
    options: ['Başın döner a acayipsin!', 'Herkes bakar a acayipsin', 'Gözün doysun a acayipsin']
  },
  {
    title: 'Kuzu Kuzu',
    artist: 'Tarkan',
    genre: '🔥 Türkçe Pop',
    lyricsBefore: 'İşte kuzu kuzu geldim,\nDilediğince kır dök,\nAcılarım derin, yaralarım açık...',
    missingLine: 'İster vur, ister sev, ben sana teslim!',
    options: ['İster vur, ister sev, ben sana teslim!', 'Kapına geldim affet beni sevgilim', 'Bu can sana feda olsun bir ömür']
  },
  {
    title: 'Senden Daha Güzel',
    artist: 'Duman',
    genre: '🎸 Rock',
    lyricsBefore: 'Kimseyi görmedim ben senden daha güzel,\nKimseyi tanımadım ben senden daha özel,\nBütün dünya bir yana sen bir yana...',
    missingLine: 'Bana sen lazımsın sen anla!',
    options: ['Bana sen lazımsın sen anla!', 'Kimse dolduramaz yerini asla', 'Her şey boş gelir bana sen yoksan']
  },
  {
    title: 'Her Şeyi Yak',
    artist: 'Duman / Sezen Aksu',
    genre: '🎸 Rock / Pop',
    lyricsBefore: 'Beni yak, her şeyi yak,\nBir kıvılcım yeter ben hazırım bak,\nİster öp beni, ister öldür...',
    missingLine: 'Aşk için ölmeli, aşk o zaman aşk!',
    options: ['Aşk için ölmeli, aşk o zaman aşk!', 'Beni benden al da git uzaklara', 'Küllerim savrulsun dağlara taşlara']
  },
  {
    title: 'Ele Güne Karşı',
    artist: 'MFÖ',
    genre: '🌟 Klasik',
    lyricsBefore: 'Ele güne karşı yapayalnız,\nBöyle de olmaz ki,\nNasıl da gitmiştim başımı alıp...',
    missingLine: 'Aramızda dağlar yollar var gibi!',
    options: ['Aramızda dağlar yollar var gibi!', 'Geriye dönüşüm artık imkansız gibi', 'Herkes kendi yoluna gitmiş gibi']
  },
  {
    title: 'Bir Derdim Var',
    artist: 'Mor ve Ötesi',
    genre: '🎸 Rock',
    lyricsBefore: 'Bir derdim var artık tutamam içimde,\nGitsem nereye kadar, kalsam neye yarar,\nHiç anlatamadım, hiç anlamadılar...',
    missingLine: 'Herkes ne sıradan, herkes ne yalnız!',
    options: ['Herkes ne sıradan, herkes ne yalnız!', 'Kelimeler tükendi bitti sesim çıkmaz', 'Dünya döner durur ben olduğum yerdeyim']
  },
  {
    title: 'Cambaz',
    artist: 'Mor ve Ötesi',
    genre: '🎸 Rock',
    lyricsBefore: 'Var mısın yok musun bir bilene sor,\nDünya bir sahne, hayat bir oyun,\nOynayan oynayana bu ne biçim iş...',
    missingLine: 'Korkma bu kadar ölümden cambaz!',
    options: ['Korkma bu kadar ölümden cambaz!', 'İp incecik düşersin dikkat et cambaz', 'Seyirciler ayakta alkışlar cambaz']
  },
  {
    title: 'Sen Ağlama',
    artist: 'Sezen Aksu',
    genre: '🎶 Efsane Pop',
    lyricsBefore: 'Gözlerimde yaşlar diner sanma sakın,\nGönlümde bu fırtına diner sanma sakın,\nSen ağlama, bir damla gözyaşın yeter...',
    missingLine: 'Sen ağlama, gamzende güller bitsin!',
    options: ['Sen ağlama, gamzende güller bitsin!', 'Sen ağlama, gözlerin hep gülsün', 'Sen ağlama, kıyamam bir tek damlana']
  },
  {
    title: 'Rakkas',
    artist: 'Sezen Aksu',
    genre: '🎉 Parti & Dans',
    lyricsBefore: 'Rakkas geldi meydana,\nAteş bastı bu cana,\nHaydi çalkala yavrum çalkala...',
    missingLine: 'Oyna be rakkas oyna!',
    options: ['Oyna be rakkas oyna!', 'Yansın geceler bu gece sabaha', 'Kıvır kıvır oyna dök kurtlarını']
  },
  {
    title: 'Bir Kadın Çizeceksin',
    artist: 'Manga',
    genre: '🎸 Nu-Metal / Rock',
    lyricsBefore: 'Bir kadın çizeceksin, onun gibi bırakıp gitmeyecek,\nBir kadın çizeceksin, seni her halinle sevecek,\nVe bir gün oturup düşüneceksin...',
    missingLine: 'Yaptığın hiçbir şeyden pişman olmayacaksın!',
    options: ['Yaptığın hiçbir şeyden pişman olmayacaksın!', 'Bütün yalanları bir kalemde sileceksin', 'Kendi ellerinle yarattığın dünyada']
  },
  {
    title: 'Dursun Zaman',
    artist: 'Manga',
    genre: '🎸 Rock',
    lyricsBefore: 'Her geçen gün bir parça daha benden alıp gidiyor,\nYıllar bir nehir gibi önümden akıp gidiyor,\nDursun zaman, dursun diyorsun...',
    missingLine: 'Ama nafile, zaman durmuyor akıyor!',
    options: ['Ama nafile, zaman durmuyor akıyor!', 'Bir an olsun durup dinlenmiyor', 'Sen istesen de geri dönmüyor']
  },
  {
    title: 'Dert Bende Derman Sende',
    artist: 'Müslüm Gürses',
    genre: '🥀 Arabesk',
    lyricsBefore: 'Dert bende derman sende,\nAşk bende ferman sende,\nÖldürürsen sen öldür...',
    missingLine: 'Yaşatırsan can sende!',
    options: ['Yaşatırsan can sende!', 'Bu garip kulun yolunda', 'Yüreğim yanar kül olur']
  },
  {
    title: 'Affet',
    artist: 'Müslüm Gürses',
    genre: '🥀 Efsane Arabesk / Rock',
    lyricsBefore: 'Affet, bu gece ölmek istedim,\nSeni bir sonbahar güneşi gibi terk etmek istedim,\nAç pencereni, gör ne haldeyim...',
    missingLine: 'Beni böyle yarım bırakma nolur!',
    options: ['Beni böyle yarım bırakma nolur!', 'Yağmur gibi yağ üzerime bu gece', 'Sensiz geçen günlerin hesabını kim verir']
  }
];

import { firebaseNetwork } from './firebase-network.js';
import QRCode from './qrcode.esm.js';

export class SarkiDuelloEngine {
  constructor(game) {
    this.game = game;
    this.songs = [...TURKISH_SONGS];
    this.currentIndex = 0;
    this.currentSong = null;
    this.remainingSeconds = 15;
    this.timerInterval = null;
    this.revealed = false;
    this.scores = { teamA: 0, teamB: 0 };
    this.turn = 'teamA'; // 'teamA' veya 'teamB'

    // ÇOKLU OYUNCU (BULUT / QR) ALTYAPISI
    this.mode = 'local'; // 'local' | 'wifi'
    this.roomId = '';
    this.players = []; // [{ id, name, avatar, score }]
    this.buzzerLocked = false;
    this.activeBuzzerPlayer = null;
    this.unsubscribeRoom = null;
  }

  init() {
    this.shuffleSongs();
    this.currentIndex = 0;
    this.scores = { teamA: 0, teamB: 0 };
    this.turn = 'teamA';
    this.mode = 'local';
    this.players = [];
    this.buzzerLocked = false;
    this.activeBuzzerPlayer = null;
    this.bindEvents();
    this.setMode('local');
    this.loadSong();
  }

  shuffleSongs() {
    for (let i = this.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
    }
  }

  bindEvents() {
    const btnModeLocal = document.getElementById('btn-sarki-mode-local');
    const btnModeWifi = document.getElementById('btn-sarki-mode-wifi');
    if (btnModeLocal) btnModeLocal.onclick = () => this.setMode('local');
    if (btnModeWifi) btnModeWifi.onclick = () => this.setMode('wifi');

    const btnStartMulti = document.getElementById('btn-sarki-start-multi');
    if (btnStartMulti) {
      btnStartMulti.onclick = () => {
        const wifiBox = document.getElementById('sarki-wifi-box');
        if (wifiBox) wifiBox.style.display = 'none';
        this.loadSong();
      };
    }

    const btnReveal = document.getElementById('btn-sarki-reveal');
    if (btnReveal) {
      btnReveal.onclick = () => this.revealAnswer();
    }

    const btnCorrect = document.getElementById('btn-sarki-correct');
    if (btnCorrect) {
      btnCorrect.onclick = () => this.handleScore(true);
    }

    const btnWrong = document.getElementById('btn-sarki-wrong');
    if (btnWrong) {
      btnWrong.onclick = () => this.handleScore(false);
    }

    const btnNext = document.getElementById('btn-sarki-next');
    if (btnNext) {
      btnNext.onclick = () => this.nextSong();
    }

    const btnBack = document.getElementById('btn-back-from-sarki-duello');
    if (btnBack) {
      btnBack.onclick = () => {
        clearInterval(this.timerInterval);
        if (this.unsubscribeRoom) {
          this.unsubscribeRoom();
          this.unsubscribeRoom = null;
        }
        this.game.showScreen('party-games');
      };
    }
  }

  setMode(mode) {
    this.mode = mode;
    const btnModeLocal = document.getElementById('btn-sarki-mode-local');
    const btnModeWifi = document.getElementById('btn-sarki-mode-wifi');
    const wifiBox = document.getElementById('sarki-wifi-box');
    const playStage = document.getElementById('sarki-play-stage');

    if (mode === 'local') {
      if (btnModeLocal) {
        btnModeLocal.classList.add('active');
        btnModeLocal.style.background = 'rgba(0,245,212,0.18)';
        btnModeLocal.style.borderColor = 'var(--primary)';
        btnModeLocal.style.color = '#FFF';
      }
      if (btnModeWifi) {
        btnModeWifi.classList.remove('active');
        btnModeWifi.style.background = 'rgba(255,255,255,0.06)';
        btnModeWifi.style.borderColor = 'rgba(255,255,255,0.15)';
        btnModeWifi.style.color = 'var(--text-dim)';
      }
      if (wifiBox) wifiBox.style.display = 'none';
      if (playStage) playStage.style.display = 'block';
      this.updateScoresUI();
    } else {
      if (btnModeWifi) {
        btnModeWifi.classList.add('active');
        btnModeWifi.style.background = 'rgba(0,245,212,0.18)';
        btnModeWifi.style.borderColor = 'var(--primary)';
        btnModeWifi.style.color = '#FFF';
      }
      if (btnModeLocal) {
        btnModeLocal.classList.remove('active');
        btnModeLocal.style.background = 'rgba(255,255,255,0.06)';
        btnModeLocal.style.borderColor = 'rgba(255,255,255,0.15)';
        btnModeLocal.style.color = 'var(--text-dim)';
      }
      this.setupMultiplayerRoom();
    }
  }

  async setupMultiplayerRoom() {
    this.roomId = firebaseNetwork.generateRoomCode();
    const wifiBox = document.getElementById('sarki-wifi-box');
    if (wifiBox) wifiBox.style.display = 'block';

    const lblRoom = document.getElementById('lbl-sarki-room-code');
    if (lblRoom) lblRoom.textContent = this.roomId;

    this.renderQrCode();

    const initialRoom = {
      roomId: this.roomId,
      gameType: 'sarki-duello',
      phase: 'lobby',
      currentSong: null,
      buzzerLocked: false,
      activeBuzzerPlayer: null,
      players: {},
      scores: {},
      createdAt: Date.now()
    };

    try {
      await firebaseNetwork.createRoom('sarki', initialRoom);
    } catch (e) {
      console.warn('Firebase createRoom sarki fallback:', e);
    }

    if (this.unsubscribeRoom) this.unsubscribeRoom();
    this.unsubscribeRoom = firebaseNetwork.listenRoom('sarki', this.roomId, (remoteRoom) => {
      if (!remoteRoom) return;
      this.handleRemoteRoomUpdate(remoteRoom);
    });
  }

  renderQrCode() {
    const qrContainer = document.getElementById('sarki-qr-canvas');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    const joinUrl = firebaseNetwork.getSarkiDuelloUrl(this.roomId);
    try {
      const cvs = document.createElement('canvas');
      qrContainer.appendChild(cvs);
      if (QRCode && QRCode.toCanvas) {
        QRCode.toCanvas(cvs, joinUrl, {
          width: 190,
          margin: 1,
          color: { dark: '#00F5D4', light: '#0B0E14' }
        }).catch(() => {
          this.renderQrImgFallback(qrContainer, joinUrl);
        });
      } else {
        this.renderQrImgFallback(qrContainer, joinUrl);
      }
    } catch (e) {
      this.renderQrImgFallback(qrContainer, joinUrl);
    }
  }

  renderQrImgFallback(container, url) {
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(url)}" width="190" height="190" style="display:block; border-radius:10px;" />`;
  }

  handleRemoteRoomUpdate(remoteRoom) {
    if (remoteRoom.players) {
      const pArr = Object.values(remoteRoom.players);
      this.players = pArr;
      const countBadge = document.getElementById('sarki-player-count-badge');
      if (countBadge) {
        countBadge.innerHTML = `
          <span style="margin-right:6px;">${pArr.length} Oyuncu Bağlı</span>
          <button type="button" class="btn-host-moderation-badge" id="btn-sarki-mod-open" style="padding:2px 8px; font-size:0.72rem; vertical-align:middle;">
            <span class="pulse-dot"></span> 🛡️ Sahne Masası
          </button>
        `;
        document.getElementById('btn-sarki-mod-open')?.addEventListener('click', (e) => {
          e.stopPropagation();
          HostModerationPanel.open({
            namespace: 'sarki',
            roomId: this.roomId,
            title: 'Şarkı Düello Sahne Masası'
          });
        });
      }

      const listEl = document.getElementById('sarki-connected-players');
      if (listEl) {
        listEl.innerHTML = pArr.map(p => `
          <div style="background:rgba(0,245,212,0.15); border:1.5px solid var(--primary); color:#FFF; font-size:0.8rem; font-weight:800; padding:4px 10px; border-radius:999px; display:inline-flex; align-items:center; gap:6px;">
            <span>${p.avatar || '🎤'} ${p.name} (${p.score || 0} P)</span>
            <button type="button" class="btn-sarki-warn" data-id="${p.id}" data-name="${p.name}" style="background:rgba(251,191,36,0.2); border:1px solid #FBBF24; color:#FDE047; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="İkaz Gönder">⚠️ İkaz</button>
            <button type="button" class="btn-sarki-kick" data-id="${p.id}" data-name="${p.name}" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#FCA5A5; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="Oyundan At">🚫 At</button>
          </div>
        `).join('');

        listEl.querySelectorAll('.btn-sarki-warn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const pId = btn.dataset.id;
            const pName = btn.dataset.name;
            const reason = prompt(`⚠️ ${pName} adlı yarışmacıya gönderilecek ikaz mesajı:`, 'Lütfen kurallara uyun ve oyundan ayrılmayın!');
            if (reason && reason.trim()) {
              firebaseNetwork.warnPlayer('sarki', this.roomId, pId, reason.trim());
              alert(`⚠️ ${pName} ikaz edildi.`);
            }
          };
        });

        listEl.querySelectorAll('.btn-sarki-kick').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const pId = btn.dataset.id;
            const pName = btn.dataset.name;
            if (confirm(`🚫 ${pName} adlı yarışmacıyı oyundan atmak istediğinize emin misiniz?`)) {
              firebaseNetwork.kickPlayer('sarki', this.roomId, pId, 'Sunucu (Host) tarafından oyundan çıkarıldınız.');
              this.players = this.players.filter(x => x.id !== pId);
              this.handleRemoteRoomUpdate({ ...remoteRoom, players: this.players.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}) });
            }
          };
        });
      }

      this.updateMultiScoresUI();
    }

    // Buzzer Dinleme
    if (remoteRoom.activeBuzzerPlayer && !this.buzzerLocked) {
      this.handlePlayerBuzzer(remoteRoom.activeBuzzerPlayer);
    }
  }

  handlePlayerBuzzer(player) {
    this.buzzerLocked = true;
    this.activeBuzzerPlayer = player;
    clearInterval(this.timerInterval);

    sounds.playChime();
    sounds.vibrate([100, 50, 100]);

    const alertBox = document.getElementById('sarki-buzzer-alert');
    const nameEl = document.getElementById('sarki-buzzer-player-name');
    if (alertBox) alertBox.style.display = 'block';
    if (nameEl) nameEl.textContent = `${player.avatar || '🎤'} ${player.name}`;
  }

  loadSong() {
    clearInterval(this.timerInterval);
    this.revealed = false;
    this.remainingSeconds = 15;
    this.buzzerLocked = false;
    this.activeBuzzerPlayer = null;

    const alertBox = document.getElementById('sarki-buzzer-alert');
    if (alertBox) alertBox.style.display = 'none';

    this.currentSong = this.songs[this.currentIndex % this.songs.length];

    document.getElementById('sarki-title').textContent = this.currentSong.title;
    document.getElementById('sarki-artist').textContent = `🎤 ${this.currentSong.artist}`;
    document.getElementById('sarki-genre').textContent = this.currentSong.genre;
    document.getElementById('sarki-lyrics-before').textContent = this.currentSong.lyricsBefore;

    const answerBox = document.getElementById('sarki-answer-box');
    answerBox.style.display = 'none';
    answerBox.textContent = this.currentSong.missingLine;

    document.getElementById('btn-sarki-reveal').style.display = 'block';
    document.getElementById('sarki-judge-btns').style.display = 'none';

    // Sıradaki Takım Rozeti
    const turnBadge = document.getElementById('sarki-turn-badge');
    if (this.mode === 'local' && this.game.gameMode === 'teams') {
      turnBadge.style.display = 'inline-block';
      turnBadge.textContent = this.turn === 'teamA' ? '🔴 SIRA: 1. TAKIMDA' : '🔵 SIRA: 2. TAKIMDA';
      turnBadge.style.background = this.turn === 'teamA' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
      turnBadge.style.color = this.turn === 'teamA' ? '#EF4444' : '#3B82F6';
    } else if (this.mode === 'wifi') {
      turnBadge.style.display = 'inline-block';
      turnBadge.textContent = '☁️ İLK BUZZER\'A BASAN SÖYLER';
      turnBadge.style.background = 'rgba(0,245,212,0.18)';
      turnBadge.style.color = 'var(--primary)';
    } else {
      turnBadge.style.display = 'none';
    }

    this.updateScoresUI();
    this.syncSongToCloud();
    this.startTimer();
  }

  async syncSongToCloud() {
    if (this.mode !== 'wifi' || !this.roomId) return;
    try {
      await firebaseNetwork.updateRoom('sarki', this.roomId, {
        phase: 'play',
        currentSong: {
          title: this.currentSong.title,
          artist: this.currentSong.artist,
          genre: this.currentSong.genre,
          lyricsBefore: this.currentSong.lyricsBefore
        },
        revealed: false,
        buzzerLocked: false,
        activeBuzzerPlayer: null
      });
    } catch (e) {}
  }

  startTimer() {
    const timerEl = document.getElementById('sarki-timer');
    timerEl.textContent = `${this.remainingSeconds}s`;
    timerEl.style.color = '#00F5D4';

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      timerEl.textContent = `${this.remainingSeconds}s`;

      if (this.remainingSeconds <= 3) {
        timerEl.style.color = '#EF4444';
        sounds.playTick();
      }

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        sounds.playBuzzer();
        this.revealAnswer();
      }
    }, 1000);
  }

  revealAnswer() {
    if (this.revealed) return;
    this.revealed = true;
    clearInterval(this.timerInterval);
    sounds.playFanfare();

    const answerBox = document.getElementById('sarki-answer-box');
    answerBox.style.display = 'block';

    document.getElementById('btn-sarki-reveal').style.display = 'none';
    document.getElementById('sarki-judge-btns').style.display = 'flex';

    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('sarki', this.roomId, {
        revealed: true,
        missingLine: this.currentSong.missingLine
      }).catch(() => {});
    }
  }

  handleScore(isCorrect) {
    if (isCorrect) {
      sounds.playCorrect();
      if (this.mode === 'wifi' && this.activeBuzzerPlayer) {
        // Çoklu modda basan oyuncuya puan ver
        const p = this.players.find(x => x.id === this.activeBuzzerPlayer.id);
        if (p) {
          p.score = (p.score || 0) + 10;
          firebaseNetwork.setPlayer('sarki', this.roomId, p).catch(() => {});
        }
      } else {
        if (this.turn === 'teamA') this.scores.teamA += 10;
        else this.scores.teamB += 10;
      }
    } else {
      sounds.playPass();
      if (this.mode === 'wifi' && this.activeBuzzerPlayer) {
        const p = this.players.find(x => x.id === this.activeBuzzerPlayer.id);
        if (p) {
          p.score = Math.max(0, (p.score || 0) - 5);
          firebaseNetwork.setPlayer('sarki', this.roomId, p).catch(() => {});
        }
      }
    }

    if (this.mode === 'local') {
      this.turn = (this.turn === 'teamA') ? 'teamB' : 'teamA';
    }

    this.updateScoresUI();
    this.nextSong();
  }

  updateScoresUI() {
    const scoreBox = document.getElementById('sarki-score-box');
    const multiBar = document.getElementById('sarki-multi-scores-bar');

    if (this.mode === 'local' && this.game.gameMode === 'teams') {
      if (scoreBox) scoreBox.style.display = 'flex';
      if (multiBar) multiBar.style.display = 'none';
      document.getElementById('sarki-score-a').textContent = `🔴 1. Takım: ${this.scores.teamA} P`;
      document.getElementById('sarki-score-b').textContent = `🔵 2. Takım: ${this.scores.teamB} P`;
    } else if (this.mode === 'wifi') {
      if (scoreBox) scoreBox.style.display = 'none';
      if (multiBar) multiBar.style.display = 'flex';
      this.updateMultiScoresUI();
    } else {
      if (scoreBox) scoreBox.style.display = 'none';
      if (multiBar) multiBar.style.display = 'none';
    }
  }

  updateMultiScoresUI() {
    const multiBar = document.getElementById('sarki-multi-scores-bar');
    if (!multiBar) return;
    if (this.players.length === 0) {
      multiBar.innerHTML = `<span style="font-size:0.75rem; color:var(--text-dim);">Oyuncular bekleniyor...</span>`;
      return;
    }
    multiBar.innerHTML = this.players.map(p => `
      <span style="font-size:0.78rem; font-weight:800; background:rgba(251,191,36,0.18); border:1px solid rgba(251,191,36,0.4); color:var(--gold); padding:3px 10px; border-radius:999px;">
        ${p.avatar || '🎤'} ${p.name}: ${p.score || 0}P
      </span>
    `).join('');
  }

  nextSong() {
    this.currentIndex++;
    this.loadSong();
  }
}
