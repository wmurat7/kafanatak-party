// js/carkifelek-game.js
// Kafana Tak! - Klasik Çarkıfelek (Puan Çarkı & Gizli Kelime Panosu) Motoru
// TV formatında, ses efektli, takım ve oyuncu savaşlı parti oyunu
// ÇOKLU OYUNCU BULUT / ODA SİSTEMİ (Firebase Realtime DB + QR Kod)

import { sounds } from './audio.js';
import { firebaseNetwork } from './firebase-network.js';

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
  { category: '🎬 Popüler Türk Filmi', phrase: 'HABABAM SINIFI' },
  { category: '🎬 Popüler Türk Filmi', phrase: 'GORA BİR UZAY FİLMİ' },
  { category: '🎬 Popüler Türk Filmi', phrase: 'KİBAR FEYZO' },
  { category: '📜 Atasözü & Deyim', phrase: 'DAM ÜSTÜNDE SAKSAĞAN' },
  { category: '📜 Atasözü & Deyim', phrase: 'TATLI DİL YILANI DELİĞİNDEN ÇIKARIR' },
  { category: '📜 Atasözü & Deyim', phrase: 'BİR ELİN NESİ VAR İKİ ELİN SESİ VAR' },
  { category: '📜 Atasözü & Deyim', phrase: 'GÜLME KOMŞUNA GELİR BAŞINA' },
  { category: '📜 Atasözü & Deyim', phrase: 'SAKLA SAMANI GELİR ZAMANI' },
  { category: '📜 Atasözü & Deyim', phrase: 'AYAĞINI YORGANINA GÖRE UZAT' },
  { category: '📜 Atasözü & Deyim', phrase: 'ÜZÜM ÜZÜME BAKA BAKA KARARIR' },
  { category: '🎵 Efsane Şarkı', phrase: 'ARKADAŞIM EŞEK' },
  { category: '🎵 Efsane Şarkı', phrase: 'ŞIKIDIM ŞIKIDIM' },
  { category: '🎵 Efsane Şarkı', phrase: 'GÜLBEYAZ GÜLÜM' },
  { category: '🎵 Efsane Şarkı', phrase: 'ELE GÜNE KARŞI YAPAYALNIZ' },
  { category: '🎵 Efsane Şarkı', phrase: 'BİR DERDİM VAR ARTIK' },
  { category: '📺 Dizi & Karakter', phrase: 'AVRUPA YAKASI BURHAN ALTINTOP' },
  { category: '📺 Dizi & Karakter', phrase: 'LEYLA İLE MECNUN' },
  { category: '📺 Dizi & Karakter', phrase: 'YALAN DÜNYA VASIYET' },
  { category: '📺 Dizi & Karakter', phrase: 'EZEL VE RAMİZ DAYI' }
];

export const TURKISH_CONSONANTS = ['B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'];
export const TURKISH_VOWELS = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];

export class CarkifelekEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'local'; // 'local' (tek cihaz) | 'wifi' (bulut oda / QR)
    this.roomId = 'CARK';
    this.hostId = 'host_' + Math.random().toString(36).substring(2, 7);

    // Yerel Takımlar
    this.localTeams = [
      { id: 'team_red', name: 'Kırmızı Takım', score: 0, color: '#EF4444' },
      { id: 'team_blue', name: 'Mavi Takım', score: 0, color: '#3B82F6' }
    ];
    this.teams = this.localTeams;

    // Wi-Fi / Bulut Odadaki Oyuncular
    this.wifiPlayers = [];
    this.currentTeamIndex = 0;

    this.currentPuzzle = null;
    this.guessedLetters = new Set();
    this.currentSlice = null;
    this.isSpinning = false;
    this.canPickLetter = false;
    this.statusMessage = '🎡 Çarkı çevirerek başlayın!';

    this.wheelRotation = 0;
    this.canvas = null;
    this.ctx = null;
    this.spinAnimId = null;

    this.processedActionIds = new Set();
    this.unsubscribeRoom = null;

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
    this.setupLocalMode();
    this.newGame();
  }

  bindEvents() {
    // Mod Butonları
    const btnLocal = document.getElementById('btn-cark-mode-local');
    const btnWifi = document.getElementById('btn-cark-mode-wifi');

    if (btnLocal) {
      btnLocal.onclick = () => {
        sounds.playClick();
        this.setupLocalMode();
      };
    }

    if (btnWifi) {
      btnWifi.onclick = () => {
        sounds.playClick();
        this.createWifiRoom();
      };
    }

    // Çark ve Tahmin Butonları
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
            if (this.unsubscribeRoom) {
              try { this.unsubscribeRoom(); } catch (e) {}
            }
            try { sounds.stopAll(); } catch (e) {}
          });
        } else {
          this.game.showScreen('partyGames');
        }
      };
    }
  }

  setupLocalMode() {
    this.mode = 'local';
    this.teams = this.localTeams;

    const btnLocal = document.getElementById('btn-cark-mode-local');
    const btnWifi = document.getElementById('btn-cark-mode-wifi');
    if (btnLocal) {
      btnLocal.classList.add('active');
      btnLocal.style.background = 'rgba(0,245,212,0.2)';
      btnLocal.style.borderColor = 'var(--primary)';
      btnLocal.style.color = '#FFF';
    }
    if (btnWifi) {
      btnWifi.classList.remove('active');
      btnWifi.style.background = 'rgba(255,255,255,0.06)';
      btnWifi.style.borderColor = 'rgba(255,255,255,0.15)';
      btnWifi.style.color = 'var(--text-dim)';
    }

    const wifiBox = document.getElementById('cark-wifi-box');
    if (wifiBox) wifiBox.style.display = 'none';

    this.updateTurnUI();
  }

  async createWifiRoom() {
    this.mode = 'wifi';
    this.roomId = firebaseNetwork.generateRoomCode();

    const btnLocal = document.getElementById('btn-cark-mode-local');
    const btnWifi = document.getElementById('btn-cark-mode-wifi');
    if (btnWifi) {
      btnWifi.classList.add('active');
      btnWifi.style.background = 'rgba(0,245,212,0.2)';
      btnWifi.style.borderColor = 'var(--primary)';
      btnWifi.style.color = '#FFF';
    }
    if (btnLocal) {
      btnLocal.classList.remove('active');
      btnLocal.style.background = 'rgba(255,255,255,0.06)';
      btnLocal.style.borderColor = 'rgba(255,255,255,0.15)';
      btnLocal.style.color = 'var(--text-dim)';
    }

    const wifiBox = document.getElementById('cark-wifi-box');
    if (wifiBox) wifiBox.style.display = 'block';

    const lblCode = document.getElementById('lbl-cark-room-code');
    if (lblCode) lblCode.textContent = this.roomId;

    const joinUrl = firebaseNetwork.getCarkifelekUrl(this.roomId);
    const cvsContainer = document.getElementById('cark-qr-canvas');
    if (cvsContainer && window.QRCode) {
      cvsContainer.innerHTML = '';
      const cvs = document.createElement('canvas');
      cvsContainer.appendChild(cvs);
      window.QRCode.toCanvas(cvs, joinUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#00F5D4', light: '#0B0E14' }
      }, (err) => {
        if (err) console.error('Çarkıfelek QR error:', err);
      });
    }

    // Host olarak kendini ilk oyuncu yap veya bağlı oyuncuları bekle
    this.wifiPlayers = [
      { id: this.hostId, name: 'Sunucu (Ana Ekran)', score: 0, color: '#EF4444' }
    ];
    this.teams = this.wifiPlayers;

    const initialRoom = {
      roomId: this.roomId,
      namespace: 'carkifelek',
      phase: 'playing',
      createdAt: Date.now(),
      activePlayerIndex: 0,
      activePlayerName: this.getActivePlayer().name,
      activePlayerId: this.getActivePlayer().id,
      category: this.currentPuzzle ? this.currentPuzzle.category : 'Popüler Türk Filmi',
      puzzleWords: this.currentPuzzle ? this.currentPuzzle.phrase.split(' ').map(w => w.length) : [],
      revealedLetters: Array.from(this.guessedLetters),
      isSpinning: false,
      canPickLetter: false,
      currentSlice: null,
      statusMsg: 'Odaya bağlanan oyuncular sırayla yarışır!',
      players: this.wifiPlayers
    };

    await firebaseNetwork.createRoom('carkifelek', initialRoom);

    // Odayı dinle
    if (this.unsubscribeRoom) {
      try { this.unsubscribeRoom(); } catch (e) {}
    }

    this.unsubscribeRoom = firebaseNetwork.listenRoom('carkifelek', this.roomId, (room) => {
      if (!room) return;
      this.handleRemoteRoomUpdate(room);
    });

    this.updateConnectedPlayersUI();
    this.syncToFirebase();
  }

  handleRemoteRoomUpdate(room) {
    // 1. Oyuncu Listesini Senkronize Et
    if (room.players && Array.isArray(room.players)) {
      if (room.players.length !== this.wifiPlayers.length) {
        // Yeni oyuncu bağlandı
        const oldLength = this.wifiPlayers.length;
        this.wifiPlayers = room.players;
        this.teams = this.wifiPlayers;
        if (this.wifiPlayers.length > oldLength) {
          sounds.playChime();
        }
        this.updateConnectedPlayersUI();
        this.updateTurnUI();
      }
    }

    // 2. Uzaktan Gelen Aksiyonları Dinle (Sırası gelen yarışmacı telefonundan bastı)
    if (room.actions) {
      const actionKeys = Object.keys(room.actions);
      for (const actId of actionKeys) {
        if (this.processedActionIds.has(actId)) continue;
        this.processedActionIds.add(actId);

        const action = room.actions[actId];
        const activePlayer = this.getActivePlayer();

        // Aksiyonu sadece sırası olan oyuncu yapabilir (veya sunucu)
        if (action.playerId === activePlayer.id || action.playerId === this.hostId) {
          if (action.type === 'spin' && !this.isSpinning && !this.canPickLetter) {
            this.spinWheel();
          } else if (action.type === 'pick_letter' && this.canPickLetter) {
            this.pickLetter(action.char);
          } else if (action.type === 'buy_vowel') {
            this.buyVowel(action.char);
          } else if (action.type === 'solve') {
            this.checkRemoteSolve(action.guess, action.playerId);
          }
        }
      }
    }
  }

  updateConnectedPlayersUI() {
    const badge = document.getElementById('cark-player-count-badge');
    const list = document.getElementById('cark-connected-players');
    if (badge) {
      badge.textContent = `${this.wifiPlayers.length} Oyuncu Bağlı`;
    }
    if (list) {
      list.innerHTML = this.wifiPlayers.map((p, idx) => `
        <span style="display:inline-block; background:${p.color || '#3B82F6'}; color:#FFF; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:999px; margin:2px;">
          ${idx === this.currentTeamIndex ? '🎯 ' : ''}${p.name} (${p.score || 0} P)
        </span>
      `).join('');
    }
  }

  getActivePlayer() {
    if (!this.teams || this.teams.length === 0) {
      return { id: 'p1', name: 'Yarışmacı', score: 0, color: '#EF4444' };
    }
    return this.teams[this.currentTeamIndex % this.teams.length];
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

    this.syncToFirebase();
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

    this.syncToFirebase({ isSpinning: true, statusMsg: '🎡 Çark dönüyor...' });

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4);
      this.wheelRotation = startRot + totalDelta * ease;
      this.drawWheel();

      const currentNeedleAngle = (1.5 * Math.PI - (this.wheelRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const curSlice = Math.floor(currentNeedleAngle / sliceAngle);
      if (curSlice !== lastTickSlice && progress < 0.98) {
        lastTickSlice = curSlice;
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
    const activePlayer = this.getActivePlayer();

    if (slice.type === 'bankrupt') {
      try { sounds.playBuzzer(); } catch (e) {}
      activePlayer.score = 0;
      this.updateStatusBanner(`💥 İFLAS! ${activePlayer.name} tüm puanlarını kaybetti! Sıra rakibe geçti.`);
      this.nextTurn();
      return;
    }

    if (slice.type === 'pass') {
      try { sounds.playBuzzer(); } catch (e) {}
      this.updateStatusBanner(`⏸️ PAS! ${activePlayer.name} sırasını kaybetti.`);
      this.nextTurn();
      return;
    }

    if (slice.type === 'spin_again') {
      try { sounds.playChime(); } catch (e) {}
      this.updateStatusBanner(`🔄 TEKRAR ÇEVİR! Şanslısınız, çarkı tekrar çevirin.`);
      const btnSpin = document.getElementById('btn-cark-spin');
      if (btnSpin) btnSpin.disabled = false;
      this.syncToFirebase();
      return;
    }

    if (slice.type === 'reward') {
      try { sounds.playFanfare(); } catch (e) {}
      activePlayer.score += 1000;
      this.updateStatusBanner(`🎁 SÜRPRİZ ÖDÜL! +1000 Puan kazandınız! Şimdi bir sessiz harf seçin.`);
    } else {
      try { sounds.playChime(); } catch (e) {}
      this.updateStatusBanner(`🎯 ${slice.value} PUAN! Bir sessiz harf seçin.`);
    }

    this.canPickLetter = true;
    this.highlightConsonants(true);
    this.syncToFirebase();
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
    const activePlayer = this.getActivePlayer();

    if (count > 0) {
      try { sounds.playCorrect(); } catch (e) {}
      const pts = (this.currentSlice ? this.currentSlice.value : 250) * count;
      activePlayer.score += pts;

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
      return;
    }

    this.syncToFirebase();
  }

  openVowelModal() {
    const activePlayer = this.getActivePlayer();
    if (activePlayer.score < 250) {
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
    const activePlayer = this.getActivePlayer();
    activePlayer.score = Math.max(0, activePlayer.score - 250);
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
    this.syncToFirebase();
  }

  promptSolve() {
    const answer = prompt('CÜMLEYİ TAHMİN EDİN:\n(Büyük veya küçük harf yazabilirsiniz)');
    if (!answer) return;
    this.checkRemoteSolve(answer, this.getActivePlayer().id);
  }

  checkRemoteSolve(answer, playerId) {
    if (!answer) return;
    const cleanInput = answer.trim().toUpperCase().replace(/İ/g, 'İ').replace(/I/g, 'I');
    const cleanActual = this.currentPuzzle.phrase.trim().toUpperCase();
    const activePlayer = this.teams.find(p => p.id === playerId) || this.getActivePlayer();

    if (cleanInput === cleanActual) {
      try { sounds.playFanfare(); } catch (e) {}
      let unrevealedCount = 0;
      for (const char of cleanActual) {
        if (char !== ' ' && !this.guessedLetters.has(char)) unrevealedCount++;
      }
      const bonus = (unrevealedCount * 500) + 1500;
      activePlayer.score += bonus;

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
      const sorted = [...this.teams].sort((a, b) => (b.score || 0) - (a.score || 0));
      const winner = sorted[0];
      const winEl = document.getElementById('cark-round-winner-text');
      if (winEl) winEl.textContent = `Kazanan: ${winner.name} (${winner.score} P)`;
    }

    this.syncToFirebase({ phase: 'round_won', statusMsg: msg });
  }

  nextTurn() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
    this.canPickLetter = false;
    this.highlightConsonants(false);
    this.updateTurnUI();

    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) btnSpin.disabled = false;

    this.syncToFirebase();
  }

  updateTurnUI() {
    const activePlayer = this.getActivePlayer();
    const turnBadge = document.getElementById('cark-turn-badge');
    if (turnBadge) {
      turnBadge.textContent = `🎯 SIRA: ${activePlayer.name.toUpperCase()}`;
      turnBadge.style.background = activePlayer.color || '#EF4444';
    }

    const t1Name = document.getElementById('cark-team-1-name');
    const t1Score = document.getElementById('cark-team-1-score');
    const t2Name = document.getElementById('cark-team-2-name');
    const t2Score = document.getElementById('cark-team-2-score');

    if (this.teams[0]) {
      if (t1Name) t1Name.textContent = this.teams[0].name;
      if (t1Score) t1Score.textContent = `${this.teams[0].score} P`;
    }
    if (this.teams[1]) {
      if (t2Name) t2Name.textContent = this.teams[1].name;
      if (t2Score) t2Score.textContent = `${this.teams[1].score} P`;
    }

    this.updateConnectedPlayersUI();
  }

  updateStatusBanner(msg) {
    this.statusMessage = msg;
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

  /**
   * Firebase Odasını Güncelle (Anti-Cheat: phrase sunucuda kalır, istemcilere gitmez)
   */
  async syncToFirebase(override = {}) {
    if (this.mode !== 'wifi') return;
    const activePlayer = this.getActivePlayer();

    // Panonun harf harf durumunu maskelenmiş şekilde gönder
    const wordsStructure = this.currentPuzzle ? this.currentPuzzle.phrase.toUpperCase().split(' ').map(w => {
      return w.split('').map(ch => this.guessedLetters.has(ch) ? ch : '').join('');
    }) : [];

    const payload = {
      phase: 'playing',
      activePlayerIndex: this.currentTeamIndex,
      activePlayerName: activePlayer.name,
      activePlayerId: activePlayer.id,
      category: this.currentPuzzle ? this.currentPuzzle.category : '',
      wordsRevealed: wordsStructure,
      revealedLetters: Array.from(this.guessedLetters),
      isSpinning: this.isSpinning,
      canPickLetter: this.canPickLetter,
      currentSlice: this.currentSlice,
      statusMsg: this.statusMessage,
      players: this.wifiPlayers,
      lastUpdate: Date.now(),
      ...override
    };

    await firebaseNetwork.updateRoom('carkifelek', this.roomId, payload);
  }
}
