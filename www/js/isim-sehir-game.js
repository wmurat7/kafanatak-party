// js/isim-sehir-game.js
// Kafana Tak! - İsim Şehir Partisi (Çarklı, Tek Cihaz Masada Oyna & Çoklu Telefon Wi-Fi Destekli) Motoru

import { sounds } from './audio.js';
import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';

export const LETTERS_WHEEL = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 
  'H', 'I', 'İ', 'K', 'L', 'M', 'N', 'O', 
  'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 
  'V', 'Y', 'Z'
];

export const LOCAL_AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];

export function getApiBaseUrl() {
  const savedIp = localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159';
  const port = 3000;
  
  if (
    typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && window.location.port !== '3000') ||
      (window.location.hostname === '127.0.0.1' && window.location.port !== '3000')
    )
  ) {
    return `http://${savedIp}:${port}`;
  }

  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return window.location.origin;
  }

  return `http://${savedIp}:${port}`;
}

export class IsimSehirGameEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'local'; // Varsayılan olarak stabil tek cihaz masa modu
    this.roomId = 'MASA';
    this.hostId = 'host';
    this.phase = 'setup'; // setup, playing, countdown_1min, review, scoreboard
    this.currentLetter = '';
    this.round = 1;
    this.startedAt = null;
    this.endsAt = null;
    this.firstFinisherId = null;
    this.firstFinisherName = null;
    this.firstFinisherPenalty = false;
    this.firstFinisherPenaltyReason = '';
    this.pollInterval = null;
    this.timerInterval = null;
    this.failedPollCount = 0;

    this.defaultCategories = [
      { id: 'isim', name: '👤 İsim' },
      { id: 'sehir', name: '🏙️ Şehir / Ülke' },
      { id: 'hayvan', name: '🦁 Hayvan' },
      { id: 'bitki', name: '🌿 Bitki / Meyve' },
      { id: 'esya', name: '📦 Eşya' },
      { id: 'unlu', name: '⭐ Ünlü' }
    ];
    this.suggestedCategories = [
      { id: 'yemek', name: '🍲 Yemek' },
      { id: 'dizi_film', name: '🎬 Film / Dizi' },
      { id: 'araba', name: '🚗 Araba Markası' },
      { id: 'sporcu', name: '⚽ Sporcu / Futbolcu' },
      { id: 'ulke', name: '🌍 Ülke' },
      { id: 'meslek', name: '💼 Meslek' },
      { id: 'renk', name: '🎨 Renk' },
      { id: 'marka', name: '📱 Marka / Şirket' },
      { id: 'sarki', name: '🎵 Şarkı' }
    ];
    this.categories = this.loadSavedCategories();
    this.reviewCatIndex = 0;

    // Kategori Bazlı Puan Matrisi: { [catId]: { [pId]: puan } }
    this.catScores = {};
    // Toplam Tur Puanı: { [pId]: toplam }
    this.playerScores = {};

    // Tek Cihaz Yerel Oyuncuları
    this.localPlayers = [
      { id: 'p1', name: 'Oyuncu 1', avatar: '🦁', totalScore: 0, roundScore: 0, answers: {} },
      { id: 'p2', name: 'Oyuncu 2', avatar: '🦊', totalScore: 0, roundScore: 0, answers: {} }
    ];
    this.players = this.localPlayers;

    // Canvas Çarkı
    this.canvas = null;
    this.ctx = null;
    this.wheelRotation = 0;
    this.isSpinning = false;
    this.spinAnimId = null;

    window.__isimSehirEngine = this;
    window.overrideScore = (pId, pts) => {
      this.setCategoryScore(pId, pts);
    };
    window.toggleHostPenalty = () => {
      this.togglePenalty();
    };
    window.setFirstFinisherLocal = (pId) => {
      this.setFirstFinisher(pId);
    };
  }

  loadSavedCategories() {
    try {
      const raw = localStorage.getItem('kafanatak_isim_custom_cats');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      }
    } catch(e) {}
    return [...this.defaultCategories];
  }

  init() {
    if (this.spinAnimId) {
      cancelAnimationFrame(this.spinAnimId);
      this.spinAnimId = null;
    }
    this.isSpinning = false;

    this.canvas = document.getElementById('isim-sehir-wheel-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.style.cursor = 'pointer';
      this.canvas.onclick = () => {
        if (!this.isSpinning && this.phase === 'setup') {
          this.spinWheel();
        }
      };
      this.drawWheel();
    }

    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) {
      btnSpin.disabled = false;
      btnSpin.innerHTML = '🎡 ÇARKI ÇEVİR VE BAŞLAT!';
    }
    const winBadge = document.getElementById('isim-winning-letter-badge');
    if (winBadge) winBadge.style.display = 'none';

    this.bindEvents();
    this.initCategoryModalEvents();
    this.renderCategoriesPreview();
    this.showSetup();
  }

  bindEvents() {
    // Mod Butonları
    const btnModeWifi = document.getElementById('btn-isim-mode-wifi');
    const btnModeLocal = document.getElementById('btn-isim-mode-local');
    if (btnModeWifi) {
      btnModeWifi.onclick = () => {
        sounds.playClick();
        this.mode = 'wifi';
        btnModeWifi.classList.add('active');
        btnModeWifi.style.background = 'rgba(0,245,212,0.2)';
        btnModeWifi.style.borderColor = 'var(--primary)';
        btnModeWifi.style.color = '#FFF';

        if (btnModeLocal) {
          btnModeLocal.classList.remove('active');
          btnModeLocal.style.background = 'rgba(255,255,255,0.06)';
          btnModeLocal.style.borderColor = 'rgba(255,255,255,0.15)';
          btnModeLocal.style.color = 'var(--text-dim)';
        }
        this.createWifiRoom();
      };
    }
    if (btnModeLocal) {
      btnModeLocal.onclick = () => {
        sounds.playClick();
        this.mode = 'local';
        btnModeLocal.classList.add('active');
        btnModeLocal.style.background = 'rgba(0,245,212,0.2)';
        btnModeLocal.style.borderColor = 'var(--primary)';
        btnModeLocal.style.color = '#FFF';

        if (btnModeWifi) {
          btnModeWifi.classList.remove('active');
          btnModeWifi.style.background = 'rgba(255,255,255,0.06)';
          btnModeWifi.style.borderColor = 'rgba(255,255,255,0.15)';
          btnModeWifi.style.color = 'var(--text-dim)';
        }
        this.setupLocalMode();
      };
    }

    // Yerel Oyuncu Ekle Butonu
    const btnAddLocal = document.getElementById('btn-isim-add-local-player');
    if (btnAddLocal) {
      btnAddLocal.onclick = () => this.addLocalPlayer();
    }

    // Çarkı Çevir Butonu
    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) {
      btnSpin.onclick = () => this.spinWheel();
    }

    // Host 1 Dk Başlat Butonu
    const btnStopHost = document.getElementById('btn-isim-host-stop');
    if (btnStopHost) {
      btnStopHost.onclick = () => this.triggerStop();
    }

    // Sonraki Kategori
    const btnNextCat = document.getElementById('btn-isim-next-cat');
    if (btnNextCat) {
      btnNextCat.onclick = () => this.nextReviewCategory();
    }

    // Puanları Onayla & Tabloya Geç
    const btnFinishReview = document.getElementById('btn-isim-finish-review');
    if (btnFinishReview) {
      btnFinishReview.onclick = () => this.finishReviewAndShowScores();
    }

    // Yeni Tura Başla
    const btnNextRound = document.getElementById('btn-isim-next-round');
    if (btnNextRound) {
      btnNextRound.onclick = () => this.nextRound();
    }

    // Geri / Menüye Dön
    const btnBack = document.getElementById('btn-back-from-isim-sehir');
    if (btnBack) {
      btnBack.onclick = () => {
        if (this.game && this.game.showGameLeaveConfirmModal) {
          this.game.showGameLeaveConfirmModal('partyGames', () => {
            if (this.spinAnimId) {
              cancelAnimationFrame(this.spinAnimId);
              this.spinAnimId = null;
            }
            this.isSpinning = false;
            clearInterval(this.pollInterval);
            clearInterval(this.timerInterval);
            try { sounds.stopAll(); } catch (e) {}
          });
        } else {
          this.game.showScreen('partyGames');
        }
      };
    }
  }

  showSetup() {
    this.phase = 'setup';
    if (this.spinAnimId) {
      cancelAnimationFrame(this.spinAnimId);
      this.spinAnimId = null;
    }
    this.isSpinning = false;

    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) {
      btnSpin.disabled = false;
      btnSpin.innerHTML = '🎡 ÇARKI ÇEVİR VE BAŞLAT!';
    }
    const winBadge = document.getElementById('isim-winning-letter-badge');
    if (winBadge) winBadge.style.display = 'none';

    document.getElementById('isim-stage-setup').style.display = 'block';
    document.getElementById('isim-stage-wheel').style.display = 'none';
    document.getElementById('isim-stage-review').style.display = 'none';
    document.getElementById('isim-stage-scoreboard').style.display = 'none';

    this.drawWheel();

    if (this.mode === 'wifi') {
      this.createWifiRoom();
    } else {
      this.setupLocalMode();
    }
  }

  setupLocalMode() {
    this.mode = 'local';
    this.roomId = 'MASA';
    this.players = this.localPlayers;
    clearInterval(this.pollInterval);

    const btnModeWifi = document.getElementById('btn-isim-mode-wifi');
    const btnModeLocal = document.getElementById('btn-isim-mode-local');
    if (btnModeLocal) {
      btnModeLocal.classList.add('active');
      btnModeLocal.style.background = 'rgba(0,245,212,0.2)';
      btnModeLocal.style.borderColor = 'var(--primary)';
      btnModeLocal.style.color = '#FFF';
    }
    if (btnModeWifi) {
      btnModeWifi.classList.remove('active');
      btnModeWifi.style.background = 'rgba(255,255,255,0.06)';
      btnModeWifi.style.borderColor = 'rgba(255,255,255,0.15)';
      btnModeWifi.style.color = 'var(--text-dim)';
    }

    const wifiBox = document.getElementById('isim-wifi-box');
    const localBox = document.getElementById('isim-local-box');
    if (wifiBox) wifiBox.style.display = 'none';
    if (localBox) localBox.style.display = 'block';

    this.renderLocalPlayersUI();
  }

  addLocalPlayer() {
    if (this.localPlayers.length >= 8) {
      alert('En fazla 8 oyuncu ekleyebilirsiniz.');
      return;
    }
    const idx = this.localPlayers.length + 1;
    const avatar = LOCAL_AVATARS[(idx - 1) % LOCAL_AVATARS.length];
    this.localPlayers.push({
      id: `p${Date.now()}_${idx}`,
      name: `Oyuncu ${idx}`,
      avatar,
      totalScore: 0,
      roundScore: 0,
      answers: {}
    });
    sounds.playClick();
    this.renderLocalPlayersUI();
  }

  removeLocalPlayer(pId) {
    if (this.localPlayers.length <= 2) {
      alert('En az 2 oyuncu olmalıdır.');
      return;
    }
    this.localPlayers = this.localPlayers.filter(p => p.id !== pId);
    this.players = this.localPlayers;
    sounds.playClick();
    this.renderLocalPlayersUI();
  }

  renderLocalPlayersUI() {
    const container = document.getElementById('isim-local-players-list');
    if (!container) return;

    container.innerHTML = this.localPlayers.map((p, idx) => `
      <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.15); padding:6px 12px; border-radius:999px; margin:4px; font-weight:800; font-size:0.85rem;">
        <span style="font-size:1.1rem;">${p.avatar}</span>
        <input type="text" value="${p.name}" data-pid="${p.id}" class="inp-local-pname" style="background:transparent; border:none; color:#FFF; font-weight:800; font-size:0.85rem; width:85px; outline:none;" />
        ${this.localPlayers.length > 2 ? `<button type="button" onclick="window.__isimSehirEngine.removeLocalPlayer('${p.id}')" style="background:none; border:none; color:#EF4444; font-weight:900; cursor:pointer; font-size:0.9rem; padding:0 2px;">✕</button>` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.inp-local-pname').forEach(inp => {
      inp.onchange = (e) => {
        const pId = e.target.dataset.pid;
        const target = this.localPlayers.find(p => p.id === pId);
        if (target && e.target.value.trim()) {
          target.name = e.target.value.trim();
        }
      };
    });
  }

  async createWifiRoom() {
    this.roomId = firebaseNetwork.generateRoomCode();
    this.hostId = 'host_' + Date.now();

    const initialRoom = {
      roomId: this.roomId,
      hostId: this.hostId,
      hostName: 'Masa Ekranı (Host)',
      hostAvatar: '👑',
      categories: this.categories,
      phase: 'setup',
      currentLetter: '',
      players: [
        { id: this.hostId, name: 'Masa Ekranı', avatar: '👑', isHost: true, totalScore: 0, roundScore: 0, answers: {} }
      ],
      updatedAt: Date.now()
    };

    // 1. Firebase Bulut Odası oluştur (İnternet üzerinden tüm cihazlar anında bağlanır)
    await firebaseNetwork.createRoom('isim-sehir', initialRoom);

    // 2. Yerel Express sunucusu açıksa oraya da oluşturmayı dene (Yedek olarak)
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/isim-sehir/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          hostName: 'Masa Ekranı (Host)',
          hostAvatar: '👑',
          categories: this.categories
        })
      }).catch(() => {});
    } catch (e) {}

    this.players = initialRoom.players;
    this.renderQrCode();
    this.renderCategoriesPreview();
    this.startPolling();
  }

  fallbackToLocal(msg) {
    this.mode = 'local';
    const btnModeLocal = document.getElementById('btn-isim-mode-local');
    const btnModeWifi = document.getElementById('btn-isim-mode-wifi');
    if (btnModeLocal) btnModeLocal.classList.add('active');
    if (btnModeWifi) btnModeWifi.classList.remove('active');
    this.setupLocalMode();
    console.info(msg);
  }

  renderQrCode() {
    const wifiBox = document.getElementById('isim-wifi-box');
    const localBox = document.getElementById('isim-local-box');
    if (wifiBox) wifiBox.style.display = 'block';
    if (localBox) localBox.style.display = 'none';

    const lblRoom = document.getElementById('lbl-isim-room-code');
    if (lblRoom) lblRoom.textContent = this.roomId;

    const qrContainer = document.getElementById('isim-qr-canvas');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    // Firebase Bulut URL'si (Hotspot gerektirmez, doğrudan internet üzerinden çalışır)
    const joinUrl = firebaseNetwork.getIsimSehirUrl(this.roomId);

    try {
      const cvs = document.createElement('canvas');
      QRCode.toCanvas(cvs, joinUrl, {
        width: 170,
        margin: 1,
        color: { dark: '#00F5D4', light: '#0B0E14' }
      }, (err) => {
        if (!err && cvs) {
          qrContainer.appendChild(cvs);
        }
      });
    } catch (err) {}
  }

  startPolling() {
    clearInterval(this.pollInterval);
    if (this.fbUnsub) {
      try { this.fbUnsub(); } catch (e) {}
    }

    // 1. Firebase Realtime Dinleyici (SSE / Push)
    this.fbUnsub = firebaseNetwork.listenRoom('isim-sehir', this.roomId, (room) => {
      this.handleCloudRoomUpdate(room);
    });

    // 2. Periyodik Kontrol (1.5s)
    this.pollInterval = setInterval(async () => {
      if (!this.roomId || this.mode !== 'wifi') return;
      const room = await firebaseNetwork.getRoom('isim-sehir', this.roomId);
      if (room) {
        this.handleCloudRoomUpdate(room);
      }
    }, 1500);
  }

  handleCloudRoomUpdate(room) {
    if (!room) return;
    
    // Oyuncuları güncelle
    if (room.players) {
      const pList = Array.isArray(room.players) ? room.players : Object.values(room.players);
      this.players = pList;
      this.renderPlayersList();
      const countEl = document.getElementById('isim-player-count-badge');
      if (countEl) countEl.textContent = `${this.players.length} Oyuncu Bağlı`;
    }

    // Gelen Aksiyonları Kontrol Et (Örn: Biri BİTTİ dedi mi?)
    if (room.actions) {
      const actList = Array.isArray(room.actions) ? room.actions : Object.values(room.actions);
      const finisherAction = actList.find(a => a.type === 'first_finisher');
      if (finisherAction && this.phase === 'playing') {
        this.enterCountdownPhase({
          firstFinisherId: finisherAction.playerId,
          firstFinisherName: finisherAction.playerName || 'Bir Oyuncu',
          firstFinisherPenalty: false
        });
      }
    }

    if (room.phase === 'countdown_1min' && this.phase === 'playing') {
      this.enterCountdownPhase(room);
    }
  }

  renderPlayersList() {
    const list = document.getElementById('isim-connected-players');
    if (!list) return;
    list.innerHTML = this.players.map(p => {
      const hasCheat = (p.cheatWarnings > 0) || p.hasLeftScreen;
      return `
        <div class="player-pill ${p.submitted ? 'done' : ''}" style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); padding:6px 12px; border-radius:999px; margin:3px; font-weight:800; font-size:0.82rem; border:1.5px solid ${hasCheat ? '#EF4444' : (p.submitted ? '#00F5D4' : 'rgba(255,255,255,0.1)')};">
          <span>${p.avatar}</span>
          <span>${p.name}</span>
          ${p.isHost ? '<span style="color:var(--gold);">👑</span>' : ''}
          ${p.submitted ? '<span style="color:#00F5D4;">✓</span>' : ''}
          ${hasCheat ? `<span style="background:#EF4444; color:#FFF; font-size:0.68rem; padding:2px 6px; border-radius:999px; font-weight:900;" title="Ekrandan ayrıldı / Kopya şüphesi">⚠️ ${p.cheatWarnings || 1} Terk</span>` : ''}
        </div>
      `;
    }).join('');

    const countBadge = document.getElementById('isim-player-count-badge');
    if (countBadge) countBadge.textContent = `${this.players.length} Oyuncu Bağlı`;
  }

  drawWheel() {
    if (!this.canvas) {
      this.canvas = document.getElementById('isim-sehir-wheel-canvas');
      if (this.canvas) this.ctx = this.canvas.getContext('2d');
    }
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 8;
    const numSlices = LETTERS_WHEEL.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.wheelRotation);

    const colors = [
      '#FF2E93', '#7928CA', '#00F5D4', '#FBBF24', 
      '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'
    ];

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(11, 14, 20, 0.8)';
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px -apple-system, Roboto, sans-serif';
      ctx.fillText(LETTERS_WHEEL[i], r - 12, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0B0E14';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FBBF24';
    ctx.stroke();

    ctx.restore();

    // Üstte neon ibre (12 yönü)
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
    if (this.isSpinning) return;
    this.isSpinning = true;

    if (!this.canvas) {
      this.canvas = document.getElementById('isim-sehir-wheel-canvas');
      if (this.canvas) this.ctx = this.canvas.getContext('2d');
    }

    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) {
      btnSpin.disabled = true;
      btnSpin.innerHTML = '🎡 DÖNÜYOR...';
    }

    try { sounds.playSpin(); } catch (e) {}

    const numSlices = LETTERS_WHEEL.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetIndex = Math.floor(Math.random() * numSlices);
    const chosenLetter = LETTERS_WHEEL[targetIndex];
    this.currentLetter = chosenLetter;

    // İbre tepede (1.5 * Math.PI). Dilim başlangıcı 0 radyan.
    // Hedef dilim merkezinin tepedeki ibreyle örtüşmesi için:
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
      // Pürüzsüz yavaşlama eğrisi (Quintic ease-out)
      const ease = 1 - Math.pow(1 - progress, 4);
      this.wheelRotation = startRot + totalDelta * ease;
      this.drawWheel();

      // Dilim geçtikçe hafif mekanik tıkırtı sesi
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
        try { sounds.playChime(); } catch (e) {}
        this.onLetterChosen(chosenLetter);
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }

  onLetterChosen(letter) {
    const winBadge = document.getElementById('isim-winning-letter-badge');
    const winLetter = document.getElementById('isim-winning-letter');
    if (winLetter) winLetter.textContent = letter;
    if (winBadge) winBadge.style.display = 'block';

    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) btnSpin.innerHTML = `✨ SEÇİLEN HARF: ${letter}`;

    // Ağ çağrıları arka planda bağımsız çalışır, asla ekranı dondurmaz!
    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        phase: 'playing',
        currentLetter: letter,
        startedAt: Date.now()
      }).catch(() => {});

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/api/isim-sehir/start-spin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: this.roomId,
            hostId: this.hostId,
            letter
          })
        }).catch(() => {});
      } catch (e) {}
    }

    setTimeout(() => {
      this.startPlayingPhase(letter);
    }, 650);
  }

  startPlayingPhase(letter) {
    this.phase = 'playing';
    this.currentLetter = letter;
    document.getElementById('isim-stage-setup').style.display = 'none';
    document.getElementById('isim-stage-wheel').style.display = 'block';
    document.getElementById('isim-stage-review').style.display = 'none';
    document.getElementById('isim-stage-scoreboard').style.display = 'none';

    document.getElementById('isim-play-letter-hero').textContent = letter;

    this.startedAt = Date.now();
    this.endsAt = null;

    const timerTitle = document.getElementById('isim-play-timer-title');
    if (timerTitle) timerTitle.textContent = 'GEÇEN SÜRE';

    const alertBanner = document.getElementById('isim-host-countdown-banner');
    if (alertBanner) alertBanner.style.display = 'none';

    const btnStop = document.getElementById('btn-isim-host-stop');
    if (btnStop) {
      btnStop.textContent = '🛑 BİTTİ! (1 Dk Süre Başlat)';
      btnStop.style.display = 'block';
      btnStop.disabled = false;
      btnStop.onclick = () => this.triggerStop();
    }

    // Her oyuncunun cevap havuzunu hazırla
    this.players.forEach(p => {
      if (!p.answers) p.answers = {};
    });
    this.activePlayerId = this.players[0] ? this.players[0].id : 'p1';

    // Cevap Formu ve Sekmeleri Render Et
    this.renderPlayingInputs();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      const lbl = document.getElementById('isim-play-timer');
      if (lbl) {
        lbl.textContent = `${m}:${s}`;
        lbl.style.color = '#00F5D4';
      }
    }, 1000);
  }

  renderPlayingInputs() {
    const tabsContainer = document.getElementById('isim-play-player-tabs');
    const inputsContainer = document.getElementById('isim-play-inputs-container');
    const filledBadge = document.getElementById('isim-play-filled-badge');
    if (!inputsContainer) return;

    // TEK CİHAZ (MASADA OYNA) MODU:
    // Oyuncular masanın etrafında kağıt ve kalemle oynar.
    // Ekrana tek tek kelime girmeye gerek yoktur; telefon kategorileri ve süreyi gösteren masa hakemidir.
    if (this.mode === 'local') {
      if (tabsContainer) tabsContainer.style.display = 'none';
      if (filledBadge) filledBadge.style.display = 'none';

      const formHeader = document.getElementById('isim-play-form-header');
      if (formHeader) {
        formHeader.innerHTML = `
          <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.85rem; font-weight:800; color:var(--gold);">📋 AKTİF KATEGORİLER</span>
            <span style="font-size:0.75rem; font-weight:800; color:var(--primary); background:rgba(0,245,212,0.12); padding:3px 10px; border-radius:999px;">✍️ Kağıtlara Yazın</span>
          </div>
        `;
      }

      inputsContainer.innerHTML = `
        <div style="background:rgba(251,191,36,0.12); border:1.5px solid rgba(251,191,36,0.35); border-radius:14px; padding:12px 14px; margin-bottom:8px; text-align:center;">
          <div style="font-size:0.92rem; font-weight:900; color:var(--gold); margin-bottom:2px;">
            ✍️ HERKES KAĞIDINA YAZIYOR!
          </div>
          <div style="font-size:0.78rem; color:#CBD5E1; line-height:1.35;">
            <strong>'${this.currentLetter}'</strong> harfi ile başlayan kelimeleri kağıtlarınıza yazın. İlk bitiren alttaki <strong>BİTTİ</strong> butonuna basar!
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${this.categories.map(c => `
            <div style="background:linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border:1.5px solid rgba(0,245,212,0.25); border-radius:14px; padding:14px 10px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.25);">
              <div style="font-size:1.05rem; font-weight:900; color:#FFF; margin-bottom:4px;">${c.name}</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--primary); background:rgba(0,245,212,0.15); padding:3px 10px; border-radius:999px; display:inline-block;">
                ${this.currentLetter} ile başlar
              </div>
            </div>
          `).join('')}
        </div>
      `;
      return;
    }

    const activePlayer = this.players.find(p => p.id === this.activePlayerId) || this.players[0];
    if (!activePlayer) return;
    if (!activePlayer.answers) activePlayer.answers = {};

    // 1. Çoklu Oyuncu Sekmeleri (Wi-Fi Modunda)
    if (tabsContainer) {
      if (this.players.length > 1) {
        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = this.players.map(p => {
          const isActive = p.id === activePlayer.id;
          const pAnswers = p.answers || {};
          const filledCount = this.categories.filter(c => (pAnswers[c.id] || '').trim().length > 0).length;
          return `
            <button type="button" class="btn-isim-tab" data-pid="${p.id}" style="display:inline-flex; align-items:center; gap:6px; background:${isActive ? 'rgba(251,191,36,0.22)' : 'rgba(255,255,255,0.06)'}; border:1.5px solid ${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.12)'}; color:${isActive ? '#FFF' : 'var(--text-dim)'}; border-radius:999px; padding:6px 12px; font-weight:800; font-size:0.8rem; cursor:pointer; flex-shrink:0; transition:all 0.2s;">
              <span>${p.avatar} ${p.name}</span>
              <span style="font-size:0.7rem; background:${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; color:${isActive ? '#0B0E14' : '#FFF'}; padding:1px 6px; border-radius:999px; font-weight:900;">${filledCount}/${this.categories.length}</span>
            </button>
          `;
        }).join('');

        tabsContainer.querySelectorAll('.btn-isim-tab').forEach(btn => {
          btn.onclick = () => {
            const pId = btn.getAttribute('data-pid');
            if (pId) {
              sounds.playClick();
              this.activePlayerId = pId;
              this.renderPlayingInputs();
            }
          };
        });
      } else {
        tabsContainer.style.display = 'none';
      }
    }

    // 2. Kategori Cevap Giriş Alanları (Gerçek zamanlı harf kontrolü ile)
    const curLetter = (this.currentLetter || '').toLocaleUpperCase('tr-TR');
    let filledCount = 0;

    inputsContainer.innerHTML = this.categories.map(c => {
      const val = activePlayer.answers[c.id] || '';
      const trimmed = val.trim();
      const firstChar = trimmed.slice(0, 1).toLocaleUpperCase('tr-TR');
      const isMatch = firstChar && firstChar === curLetter;
      const hasVal = trimmed.length > 0;
      if (hasVal) filledCount++;

      let borderColor = 'rgba(255,255,255,0.12)';
      let statusHtml = `<span style="font-size:0.75rem; color:var(--text-dim); font-weight:700;">Harf: ${this.currentLetter}</span>`;

      if (hasVal) {
        if (isMatch) {
          borderColor = '#00F5D4';
          statusHtml = `<span style="font-size:0.75rem; color:#00F5D4; font-weight:800;">✓ Harf Uygun</span>`;
        } else {
          borderColor = '#F59E0B';
          statusHtml = `<span style="font-size:0.75rem; color:#F59E0B; font-weight:800;">⚠️ '${this.currentLetter}' olmalı</span>`;
        }
      }

      return `
        <div class="isim-cat-card" id="card-${c.id}" style="background:rgba(255,255,255,0.04); border:1.5px solid ${borderColor}; border-radius:12px; padding:8px 12px; transition:border-color 0.2s, background 0.2s;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:0.85rem; font-weight:800; color:#FFF;">${c.name}</span>
            <div id="stat-${c.id}">${statusHtml}</div>
          </div>
          <input type="text" 
                 class="inp-isim-word" 
                 data-cat="${c.id}" 
                 value="${val.replace(/"/g, '&quot;')}" 
                 placeholder="${this.currentLetter} ile başlayan..." 
                 autocomplete="off" 
                 autocorrect="off" 
                 spellcheck="false"
                 style="width:100%; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px 12px; color:#FFF; font-weight:800; font-size:0.95rem; outline:none;" />
        </div>
      `;
    }).join('');

    if (filledBadge) {
      filledBadge.textContent = `${filledCount} / ${this.categories.length} Dolu`;
      filledBadge.style.color = filledCount === this.categories.length ? '#10B981' : '#00F5D4';
    }

    // Input dinleyicileri
    inputsContainer.querySelectorAll('.inp-isim-word').forEach(inp => {
      inp.oninput = (e) => {
        const catId = inp.getAttribute('data-cat');
        const textVal = e.target.value;
        activePlayer.answers[catId] = textVal;

        const card = document.getElementById(`card-${catId}`);
        const stat = document.getElementById(`stat-${catId}`);
        const trimmed = textVal.trim();
        const firstChar = trimmed.slice(0, 1).toLocaleUpperCase('tr-TR');
        const isMatch = firstChar && firstChar === curLetter;
        const hasVal = trimmed.length > 0;

        if (card && stat) {
          if (hasVal) {
            if (isMatch) {
              card.style.borderColor = '#00F5D4';
              stat.innerHTML = `<span style="font-size:0.75rem; color:#00F5D4; font-weight:800;">✓ Harf Uygun</span>`;
            } else {
              card.style.borderColor = '#F59E0B';
              stat.innerHTML = `<span style="font-size:0.75rem; color:#F59E0B; font-weight:800;">⚠️ '${this.currentLetter}' olmalı</span>`;
            }
          } else {
            card.style.borderColor = 'rgba(255,255,255,0.12)';
            stat.innerHTML = `<span style="font-size:0.75rem; color:var(--text-dim); font-weight:700;">Harf: ${this.currentLetter}</span>`;
          }
        }

        const newFilled = this.categories.filter(c => (activePlayer.answers[c.id] || '').trim().length > 0).length;
        if (filledBadge) {
          filledBadge.textContent = `${newFilled} / ${this.categories.length} Dolu`;
          filledBadge.style.color = newFilled === this.categories.length ? '#10B981' : '#00F5D4';
        }

        if (tabsContainer) {
          const tabBtn = tabsContainer.querySelector(`.btn-isim-tab[data-pid="${activePlayer.id}"]`);
          if (tabBtn) {
            const badge = tabBtn.querySelector('span:last-child');
            if (badge) badge.textContent = `${newFilled}/${this.categories.length}`;
          }
        }

        if (this.mode === 'wifi' && this.roomId) {
          firebaseNetwork.setPlayer('isim-sehir', this.roomId, activePlayer.id, activePlayer);
        }
      };
    });
  }

  enterCountdownPhase(room) {
    this.phase = 'countdown_1min';
    try { sounds.playChime(); } catch (e) {}

    this.firstFinisherId = room.firstFinisherId || (this.players[0] ? this.players[0].id : null);
    this.firstFinisherName = room.firstFinisherName || (this.players[0] ? this.players[0].name : 'Masadaki Oyuncu');
    this.firstFinisherPenalty = !!room.firstFinisherPenalty;
    this.firstFinisherPenaltyReason = room.firstFinisherPenaltyReason || '';

    const alertBanner = document.getElementById('isim-host-countdown-banner');
    if (alertBanner) {
      alertBanner.style.display = 'block';
      alertBanner.innerHTML = `
        <div style="font-weight:900; font-size:1.05rem; color:#EF4444;">🚨 İLK BİTİREN: ${this.firstFinisherName}</div>
        <div style="font-size:0.8rem; color:#FFF; margin-top:2px;">Kalanlar için son 60 saniye başladı! Süre dolunca puanlamaya geçilecektir.</div>
      `;
    }

    const timerTitle = document.getElementById('isim-play-timer-title');
    if (timerTitle) timerTitle.textContent = 'KALAN SÜRE (SON 60 SANİYE)';

    const btnStop = document.getElementById('btn-isim-host-stop');
    if (btnStop) {
      btnStop.textContent = '⏩ HEMEN PUANLAMAYA GEÇ';
      btnStop.onclick = () => this.enterReviewPhase();
    }

    clearInterval(this.timerInterval);
    let remaining = 60;
    this.timerInterval = setInterval(() => {
      remaining--;
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      const lbl = document.getElementById('isim-play-timer');
      if (lbl) {
        lbl.textContent = `${m}:${s}`;
        lbl.style.color = '#EF4444';
      }

      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        try { sounds.playChime(); } catch (e) {}
        this.enterReviewPhase();
      }
    }, 1000);
  }

  triggerStop() {
    try { sounds.playChime(); } catch (e) {}
    clearInterval(this.timerInterval);

    // Eğer zaten 60 saniye geri sayımdaysa doğrudan bitir
    if (this.phase === 'countdown_1min') {
      this.enterReviewPhase();
      return;
    }

    // İlk kez basıldı -> Basan oyuncuyu ilk bitiren yap
    const activeP = this.players.find(p => p.id === this.activePlayerId) || this.players[0];
    this.firstFinisherId = activeP ? activeP.id : this.hostId;
    this.firstFinisherName = activeP ? activeP.name : 'Masadaki Oyuncu';

    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        phase: 'countdown_1min',
        endsAt: Date.now() + 60000,
        firstFinisherId: this.firstFinisherId,
        firstFinisherName: this.firstFinisherName
      }).catch(() => {});

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/api/isim-sehir/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, playerId: this.firstFinisherId })
        }).catch(() => {});
      } catch (e) {}
    }

    this.enterCountdownPhase({
      firstFinisherId: this.firstFinisherId,
      firstFinisherName: this.firstFinisherName,
      firstFinisherPenalty: false
    });
  }

  setFirstFinisher(pId) {
    const target = this.players.find(p => p.id === pId);
    if (!target) return;
    this.firstFinisherId = target.id;
    this.firstFinisherName = target.name;
    this.renderReviewHeader();
  }

  togglePenalty() {
    this.firstFinisherPenalty = !this.firstFinisherPenalty;
    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        firstFinisherPenalty: this.firstFinisherPenalty
      }).catch(() => {});

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/api/isim-sehir/toggle-penalty`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, penalty: this.firstFinisherPenalty })
        }).catch(() => {});
      } catch (e) {}
    }
    this.renderReviewHeader();
  }

  enterReviewPhase(roomState) {
    this.phase = 'review';
    clearInterval(this.timerInterval);
    document.getElementById('isim-stage-wheel').style.display = 'none';
    document.getElementById('isim-stage-review').style.display = 'block';

    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        phase: 'review',
        players: this.players,
        firstFinisherPenalty: this.firstFinisherPenalty
      });
    }

    if (roomState) {
      if (roomState.players) this.players = roomState.players;
      this.firstFinisherId = roomState.firstFinisherId || this.firstFinisherId;
      this.firstFinisherName = roomState.firstFinisherName || this.firstFinisherName;
      this.firstFinisherPenalty = !!roomState.firstFinisherPenalty;
      this.firstFinisherPenaltyReason = roomState.firstFinisherPenaltyReason || '';
    }

    // Puan matrisini başlat
    this.initCategoryScores();
    this.reviewCatIndex = 0;
    this.renderReviewHeader();
    this.renderReviewCategory();
  }

  initCategoryScores() {
    this.catScores = {};
    this.categories.forEach(c => {
      const catKey = c.id;
      this.catScores[catKey] = {};

      if (this.mode === 'local') {
        // Tek cihaz masa modunda kağıt oyunu: Varsayılan olarak her oyuncu doğru/özgün (+10) başlar.
        // İncelemede aynı kelime yazanlar +5'e, boş veya hatalı olanlar 0'a tek dokunuşla ayarlanır.
        this.players.forEach(p => {
          this.catScores[catKey][p.id] = 10;
        });
        return;
      }

      // Otomatik puanlama: Harf uyumlu ve özgünse 10, aynıysa 5, boş/hatalıysa 0 (Wi-Fi modu için)
      const textMap = {};
      const curLetter = (this.currentLetter || '').toLocaleUpperCase('tr-TR');

      this.players.forEach(p => {
        const raw = ((p.answers && p.answers[catKey]) || '').trim();
        const val = raw.toLocaleLowerCase('tr-TR');
        const firstChar = raw.slice(0, 1).toLocaleUpperCase('tr-TR');
        const isMatch = firstChar && firstChar === curLetter;

        if (val && isMatch) {
          if (!textMap[val]) textMap[val] = [];
          textMap[val].push(p.id);
        } else if (val && !isMatch) {
          this.catScores[catKey][p.id] = 0; // Yanlış harfle başlarsa 0
        } else {
          this.catScores[catKey][p.id] = 0; // Boşsa 0
        }
      });

      for (const [txt, pIds] of Object.entries(textMap)) {
        if (pIds.length > 1) {
          pIds.forEach(id => { this.catScores[catKey][id] = 5; });
        } else {
          this.catScores[catKey][pIds[0]] = 10;
        }
      }
    });
  }

  setCategoryScore(pId, pts) {
    const curCat = this.categories[this.reviewCatIndex];
    if (!curCat) return;
    const catKey = curCat.id;

    if (!this.catScores[catKey]) this.catScores[catKey] = {};
    this.catScores[catKey][pId] = pts;

    sounds.playClick();
    this.renderReviewCategory();
  }

  renderReviewHeader() {
    const headerBox = document.getElementById('isim-review-host-finisher-box');
    if (!headerBox) return;

    headerBox.style.display = 'block';
    headerBox.innerHTML = `
      <div style="background:rgba(251,191,36,0.12); border:1.5px solid var(--gold); border-radius:14px; padding:12px; margin-bottom:12px; text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <span style="font-size:0.85rem; font-weight:900; color:var(--gold);">🥇 İLK BİTİREN:</span>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${this.players.map(p => `
              <button type="button" onclick="window.setFirstFinisherLocal('${p.id}')" style="background:${p.id === this.firstFinisherId ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}; color:${p.id === this.firstFinisherId ? '#0B0E14' : '#FFF'}; font-weight:900; font-size:0.8rem; padding:4px 10px; border-radius:999px; border:none; cursor:pointer;">
                ${p.avatar} ${p.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:8px;">
          <span style="font-size:0.8rem; font-weight:800; color:${this.firstFinisherPenalty ? '#EF4444' : '#10B981'};">
            ${this.firstFinisherPenalty ? '⚠️ Hatalı İlk Bitirme Cezası: -20 Puan' : '✨ Hatasız İlk Bitirme (Ceza Yok)'}
          </span>
          <button type="button" onclick="window.toggleHostPenalty()" style="background:${this.firstFinisherPenalty ? '#10B981' : '#EF4444'}; color:#FFF; border:none; border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:900; cursor:pointer;">
            ${this.firstFinisherPenalty ? 'Cezayı Kaldır' : 'Ceza Uygula (-20)'}
          </button>
        </div>
      </div>
    `;
  }

  renderReviewCategory() {
    const currentCatObj = this.categories[this.reviewCatIndex];
    if (!currentCatObj) return;
    const catKey = currentCatObj.id;
    const catLabel = currentCatObj.name;

    document.getElementById('isim-review-cat-name').textContent = catLabel;
    document.getElementById('isim-review-cat-step').textContent = `${this.reviewCatIndex + 1} / ${this.categories.length}`;

    const container = document.getElementById('isim-review-answers-grid');
    if (!container) return;

    container.innerHTML = this.players.map(p => {
      const ans = (p.answers && p.answers[catKey]) || '';
      const isFirst = p.id === this.firstFinisherId;
      const currentPts = (this.catScores[catKey] && this.catScores[catKey][p.id] !== undefined)
        ? this.catScores[catKey][p.id]
        : 10;

      return `
        <div style="background:rgba(255,255,255,0.06); border:1.5px solid ${isFirst ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; border-radius:14px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:${this.mode === 'local' ? '10px' : '8px'};">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.3rem;">${p.avatar}</span>
              <span style="font-weight:900; font-size:0.95rem; color:#FFF;">${p.name}</span>
              ${isFirst ? '<span style="color:var(--gold); font-size:0.75rem; font-weight:900;">👑 İlk Bitiren</span>' : ''}
            </div>
            <span style="font-size:1.1rem; font-weight:900; color:${currentPts === 10 ? '#10B981' : (currentPts === 5 ? '#FBBF24' : '#EF4444')};">
              +${currentPts} P
            </span>
          </div>

          ${this.mode === 'local' ? '' : `
          <!-- Söylenen / Yazılan Kelime Inputu (Wi-Fi modunda) -->
          <div style="margin-bottom:8px;">
            <input type="text" placeholder="Kelime girilmedi..." value="${ans.replace(/"/g, '&quot;')}" class="inp-review-word" data-pid="${p.id}" data-cat="${catKey}" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:8px 12px; color:#00F5D4; font-weight:800; font-size:0.95rem; outline:none;" />
          </div>
          `}

          <!-- Puan Seçici Butonları -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
            <button type="button" class="btn-score-tag pts-10 ${currentPts === 10 ? 'active' : ''}" onclick="window.overrideScore('${p.id}', 10)">
              🟢 +10 Tek
            </button>
            <button type="button" class="btn-score-tag pts-5 ${currentPts === 5 ? 'active' : ''}" onclick="window.overrideScore('${p.id}', 5)">
              🟡 +5 Aynı
            </button>
            <button type="button" class="btn-score-tag pts-0 ${currentPts === 0 ? 'active' : ''}" onclick="window.overrideScore('${p.id}', 0)">
              🔴 0 Boş
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.inp-review-word').forEach(inp => {
      inp.oninput = (e) => {
        const pId = e.target.dataset.pid;
        const cat = e.target.dataset.cat;
        const target = this.players.find(p => p.id === pId);
        if (target) {
          if (!target.answers) target.answers = {};
          target.answers[cat] = e.target.value.trim();
        }
      };
    });
  }

  nextReviewCategory() {
    sounds.playClick();
    this.reviewCatIndex++;
    if (this.reviewCatIndex < this.categories.length) {
      this.renderReviewCategory();
    } else {
      this.finishReviewAndShowScores();
    }
  }

  async finishReviewAndShowScores() {
    this.phase = 'scoreboard';
    document.getElementById('isim-stage-review').style.display = 'none';
    document.getElementById('isim-stage-scoreboard').style.display = 'block';

    // Toplam puanları kategori matrisinden topla
    this.playerScores = {};
    this.players.forEach(p => {
      let sum = 0;
      this.categories.forEach(c => {
        const catKey = c.id;
        const pts = (this.catScores[catKey] && this.catScores[catKey][p.id] !== undefined)
          ? this.catScores[catKey][p.id]
          : 0;
        sum += pts;
      });

      // İlk bitiren cezası varsa uygula
      if (this.firstFinisherPenalty && p.id === this.firstFinisherId) {
        sum -= 20;
      }

      this.playerScores[p.id] = sum;
      p.roundScore = sum;
      p.totalScore = (p.totalScore || 0) + sum;
    });

    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        phase: 'round_over',
        players: this.players,
        playerScores: this.playerScores
      }).catch(() => {});

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/api/isim-sehir/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: this.roomId,
            playerScores: this.playerScores
          })
        }).catch(() => {});
      } catch (e) {}
    }

    try { sounds.playFanfare(); } catch (e) {}

    // Liderlik Tablosu
    const sorted = [...this.players].sort((a,b) => (b.totalScore || 0) - (a.totalScore || 0));
    const list = document.getElementById('isim-final-scoreboard-list');
    list.innerHTML = sorted.map((p, idx) => {
      const hasPenalty = p.id === this.firstFinisherId && this.firstFinisherPenalty;
      const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx+1}`));
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:14px 18px; border-radius:14px; border:1.5px solid ${idx===0 ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">${medal}</span>
            <span style="font-size:1.6rem;">${p.avatar}</span>
            <div>
              <div style="font-size:1.05rem; font-weight:900; color:#FFF;">${p.name}</div>
              ${hasPenalty ? '<div style="font-size:0.75rem; font-weight:800; color:#EF4444;">⚠️ -20 Hatalı İlk Bitirme Cezası</div>' : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.3rem; font-weight:900; color:var(--primary);">${p.totalScore || 0} Puan</div>
            <div style="font-size:0.8rem; font-weight:800; color:#10B981;">+${p.roundScore || 0} Bu Tur</div>
          </div>
        </div>
      `;
    }).join('');
  }

  nextRound() {
    this.round++;
    sounds.playClick();
    if (this.spinAnimId) {
      cancelAnimationFrame(this.spinAnimId);
      this.spinAnimId = null;
    }
    this.isSpinning = false;
    document.getElementById('isim-winning-letter-badge').style.display = 'none';
    const btnSpin = document.getElementById('btn-spin-isim-wheel');
    if (btnSpin) {
      btnSpin.disabled = false;
      btnSpin.innerHTML = '🎡 ÇARKI ÇEVİR VE BAŞLAT!';
    }

    // Oyuncu tur cevaplarını sıfırla
    this.players.forEach(p => { p.answers = {}; });

    if (this.mode === 'wifi' && this.roomId) {
      firebaseNetwork.updateRoom('isim-sehir', this.roomId, {
        phase: 'setup',
        currentLetter: '',
        players: this.players.map(p => ({ ...p, answers: {}, submitted: false }))
      }).catch(() => {});

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/api/isim-sehir/next-round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId })
        }).catch(() => {});
      } catch (e) {}
    }

    this.showSetup();
  }

  initCategoryModalEvents() {
    const btnOpen = document.getElementById('btn-open-isim-cat-modal');
    const btnClose = document.getElementById('btn-close-isim-cat-modal');
    const modal = document.getElementById('modal-isim-categories');
    const btnAdd = document.getElementById('btn-add-custom-cat');
    const inpCustom = document.getElementById('inp-custom-cat-name');
    const btnReset = document.getElementById('btn-reset-default-cats');
    const btnSave = document.getElementById('btn-save-isim-cats');

    if (btnOpen && modal) {
      btnOpen.onclick = () => {
        sounds.playClick();
        this.openCategoryModal();
      };
    }
    if (btnClose && modal) {
      btnClose.onclick = () => {
        modal.style.display = 'none';
        modal.classList.remove('active');
      };
    }
    if (btnAdd && inpCustom) {
      btnAdd.onclick = () => {
        const val = inpCustom.value.trim();
        if (val) {
          this.addCustomCategory(val);
          inpCustom.value = '';
          inpCustom.focus();
        }
      };
      inpCustom.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const val = inpCustom.value.trim();
          if (val) {
            this.addCustomCategory(val);
            inpCustom.value = '';
          }
        }
      };
    }
    if (btnReset) {
      btnReset.onclick = () => {
        sounds.playClick();
        this.categories = [...this.defaultCategories];
        this.renderCategoryModalList();
        this.renderSuggestedPills();
      };
    }
    if (btnSave && modal) {
      btnSave.onclick = () => {
        sounds.playClick();
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.saveCategories();
      };
    }
  }

  openCategoryModal() {
    const modal = document.getElementById('modal-isim-categories');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('active');
    this.renderCategoryModalList();
    this.renderSuggestedPills();
  }

  renderCategoryModalList() {
    const container = document.getElementById('isim-cat-modal-active-list');
    const countEl = document.getElementById('lbl-modal-cat-count');
    if (countEl) countEl.textContent = this.categories.length;
    if (!container) return;

    container.innerHTML = this.categories.map((c, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:8px 12px; border-radius:10px; margin-bottom:6px;">
        <span style="font-weight:800; font-size:0.9rem; color:#FFF;">${c.name}</span>
        ${this.categories.length > 2 ? `<button type="button" onclick="window.__isimSehirEngine.removeCategory(${i})" style="background:none; border:none; color:#EF4444; font-weight:900; cursor:pointer; font-size:1.1rem; padding:0 4px;">✕</button>` : ''}
      </div>
    `).join('');
  }

  renderSuggestedPills() {
    const container = document.getElementById('isim-cat-suggested-pills');
    if (!container) return;
    const activeIds = new Set(this.categories.map(c => c.id));
    const available = this.suggestedCategories.filter(s => !activeIds.has(s.id));

    if (available.length === 0) {
      container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-dim);">Tüm öneriler eklendi.</span>';
      return;
    }

    container.innerHTML = available.map(s => `
      <button type="button" onclick="window.__isimSehirEngine.addCategoryFromSuggested('${s.id}')" style="background:rgba(0,245,212,0.1); border:1px solid rgba(0,245,212,0.3); color:#00F5D4; font-size:0.75rem; font-weight:800; border-radius:999px; padding:4px 10px; cursor:pointer; margin:2px;">
        + ${s.name}
      </button>
    `).join('');
  }

  addCategoryFromSuggested(id) {
    const sug = this.suggestedCategories.find(s => s.id === id);
    if (sug && !this.categories.some(c => c.id === id)) {
      this.categories.push({ ...sug });
      sounds.playClick();
      this.renderCategoryModalList();
      this.renderSuggestedPills();
    }
  }

  addCustomCategory(name) {
    const id = 'custom_' + Date.now();
    this.categories.push({ id, name: `✨ ${name}` });
    sounds.playClick();
    this.renderCategoryModalList();
    this.renderSuggestedPills();
  }

  removeCategory(idx) {
    if (this.categories.length <= 2) return;
    this.categories.splice(idx, 1);
    sounds.playClick();
    this.renderCategoryModalList();
    this.renderSuggestedPills();
  }

  renderCategoriesPreview() {
    const container = document.getElementById('isim-active-categories-preview');
    const countBadge = document.getElementById('lbl-isim-cat-count');
    if (countBadge) countBadge.textContent = this.categories.length;
    if (!container) return;

    container.innerHTML = this.categories.map(c => `
      <span style="display:inline-block; font-size:0.75rem; font-weight:800; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:999px; padding:3px 10px; color:#FFF;">
        ${c.name}
      </span>
    `).join('');
  }

  saveCategories() {
    try {
      localStorage.setItem('kafanatak_isim_custom_cats', JSON.stringify(this.categories));
    } catch(e) {}
    this.renderCategoriesPreview();

    const baseUrl = getApiBaseUrl();
    if (this.mode === 'wifi' && this.roomId) {
      try {
        fetch(`${baseUrl}/api/isim-sehir/update-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: this.roomId,
            hostId: this.hostId,
            categories: this.categories
          })
        });
      } catch(e) {}
    }
  }
}
