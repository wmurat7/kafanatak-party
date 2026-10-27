// js/passaparola-game.js
// Kafana Tak! - Efsane A'dan Z'ye Passaparola Alfabe Arenası
// 1 Sunucu (Cevapları görür, Doğru/Yanlış/Pas basar) & Sırayla Yarışan Oyuncular Modu

import { sounds } from './audio.js';
import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';

export const PASSAPAROLA_LETTERS = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 
  'H', 'I', 'İ', 'K', 'L', 'M', 'N', 'O', 
  'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'V', 
  'Y', 'Z'
];

export const PASSAPAROLA_QUESTIONS_DB = [
  { letter: 'A', question: 'Gök cisimlerinin hareketlerini ve evreni inceleyen bilim dalı', answer: 'ASTRONOMİ' },
  { letter: 'A', question: 'Türkiye\'nin güneyinde yer alan, kıyısında Antalya ve Mersin bulunan deniz', answer: 'AKDENİZ' },
  { letter: 'B', question: 'Suda solungaçlarıyla nefes alan yüzgeçli omurgalı canlı', answer: 'BALIK' },
  { letter: 'B', question: 'İki tekerlekli, insan gücüyle pedalları çevrilerek sürülen binek araç', answer: 'BİSİKLET' },
  { letter: 'C', question: 'Para, kimlik ve banka kartlarını taşımaya yarayan küçük deri cep cüzdanı', answer: 'CÜZDAN' },
  { letter: 'C', question: 'Sert kabuğu kırıldığında beyni andıran faydalı bir kuruyemiş türü', answer: 'CEVİZ' },
  { letter: 'Ç', question: 'Kakao çekirdeklerinden üretilen, sütlüsü ve bitteri olan tatlı yiyecek', answer: 'ÇİKOLATA' },
  { letter: 'Ç', question: 'İnce belli bardakta içilen, Karadeniz\'de yetişen milli sıcak içeceğimiz', answer: 'ÇAY' },
  { letter: 'D', question: 'Tıp eğitimi almış, hastalıkları teşhis ve tedavi eden meslek insanı', answer: 'DOKTOR' },
  { letter: 'D', question: 'Okyanusla bağlantısı olan, tuzlu büyük su kütlesi', answer: 'DENİZ' },
  { letter: 'E', question: 'Fırınlarda un, su ve mayayla pişirilen temel sofralık gıda', answer: 'EKMEK' },
  { letter: 'E', question: 'Amasya ile özdeşleşen, kırmızı veya yeşil sulu meyve', answer: 'ELMA' },
  { letter: 'F', question: 'On birer kişilik iki takım arasında topla oynanan en popüler spor dalı', answer: 'FUTBOL' },
  { letter: 'F', question: 'Karadeniz bölgesinde fındık ocaklarında yetişen kabuklu meşhur kuruyemiş', answer: 'FINDIK' },
  { letter: 'G', question: 'Gündüz dünyamızı aydınlatan ve ısıtan en yakın yıldız', answer: 'GÜNEŞ' },
  { letter: 'G', question: 'Daha iyi görmek veya güneşten korunmak için gözün önüne takılan çerçeveli cam', answer: 'GÖZLÜK' },
  { letter: 'H', question: 'Hasta ve yaralıların tedavi edildiği yataklı büyük sağlık kuruluşu', answer: 'HASTANE' },
  { letter: 'H', question: 'Tavşanların çok sevdiği, turuncu renkli kök sebze', answer: 'HAVUÇ' },
  { letter: 'I', question: 'Karanlığı aydınlatan ve nesneleri görmemizi sağlayan fiziksel enerji', answer: 'IŞIK' },
  { letter: 'I', question: 'Temel Reis\'in güçlenmek için yediği demir zengini yeşil yapraklı sebze', answer: 'ISPANAK' },
  { letter: 'İ', question: 'Türkiye\'nin en kalabalık ve Boğaziçi ile iki kıtayı bağlayan megakenti', answer: 'İSTANBUL' },
  { letter: 'İ', question: 'Dikiş dikerken ipliğin geçirildiği delikli ince metal araç', answer: 'İĞNE' },
  { letter: 'K', question: 'Kış mevsiminde yağan beyaz renkli hafif buz kristalleri', answer: 'KAR' },
  { letter: 'K', question: 'Fincanda köpüklü pişirilen, 40 yıl hatırı olan geleneksel içeceğimiz', answer: 'KAHVE' },
  { letter: 'L', question: 'Salata ve çorbalara sıkılan sarı renkli, C vitamini zengini ekşi narenciye', answer: 'LİMON' },
  { letter: 'L', question: 'Karanlıkta elektrikle aydınlatma sağlayan araç', answer: 'LAMBA' },
  { letter: 'M', question: 'Üzerinde yemek yenilen veya çalışılan dört ayaklı yaygın mobilya', answer: 'MASA' },
  { letter: 'M', question: 'Nota ve seslerin ahenkli birleşimiyle kulağa hoş gelen sanat dalı', answer: 'MÜZİK' },
  { letter: 'N', question: 'Yılın dördüncü ayı, ilkbaharın ortası', answer: 'NİSAN' },
  { letter: 'N', question: 'Kabuğu soyulduğunda içinden yüzlerce kırmızı tanecik çıkan bereket meyvesi', answer: 'NAR' },
  { letter: 'O', question: 'Öğrencilerin eğitim gördüğü ve öğretmenlerin ders anlattığı bina', answer: 'OKUL' },
  { letter: 'O', question: 'Çok sayıda ağacın bir arada bulunduğu geniş yeşil doğal alan', answer: 'ORMAN' },
  { letter: 'Ö', question: 'Okullarda öğrencilere bilgi öğreten ve yol gösteren saygıdeğer eğitimci', answer: 'ÖĞRETMEN' },
  { letter: 'Ö', question: 'Suda yüzebilen, yassı gagalı ve "vak vak" diye ses çıkaran evcil kuş', answer: 'ÖRDEK' },
  { letter: 'P', question: 'Kızartması, püresi ve fırınlaması yapılan toprak altı yumru sebze', answer: 'PATATES' },
  { letter: 'P', question: 'Alışveriş yaparken veya borç öderken kullanılan resmi madeni ya da kağıt araç', answer: 'PARA' },
  { letter: 'R', question: 'Kırmızı, mavi, sarı gibi gözün ışık dalgalarıyla algıladığı tonlar', answer: 'RENK' },
  { letter: 'R', question: 'Havanın yüksek basınçtan alçak basınca doğru esmesiyle oluşan hava akımı', answer: 'RÜZGAR' },
  { letter: 'S', question: 'Canlıların yaşaması için şart olan şeffaf, kokusuz temel sıvı', answer: 'SU' },
  { letter: 'S', question: 'Günün saat, dakika ve saniyesini gösteren mekanik ya da dijital alet', answer: 'SAAT' },
  { letter: 'Ş', question: 'Çay ve kahveleri tatlandırmak için kullanılan beyaz kristal madde', answer: 'ŞEKER' },
  { letter: 'Ş', question: 'Yağmurlu günlerde ıslanmamak için açılıp baş üstünde tutulan siperlik', answer: 'ŞEMSİYE' },
  { letter: 'T', question: 'Görüntü ve ses yayınlarını ekrana taşıyan en yaygın ev cihazı', answer: 'TELEVİZYON' },
  { letter: 'T', question: 'Raylar üzerinde vagonları çekerek ilerleyen uzun demiryolu taşıtı', answer: 'TREN' },
  { letter: 'U', question: 'Kanatları ve jet motorlarıyla gökyüzünde hızla yolcu taşıyan hava aracı', answer: 'UÇAK' },
  { letter: 'U', question: 'Dünya atmosferinin ötesindeki gezegenler ve yıldızlarla dolu sonsuz boşluk', answer: 'UZAY' },
  { letter: 'V', question: 'Şehir hatlarında iskeleler arasında deniz yoluyla yolcu taşıyan gemi', answer: 'VAPUR' },
  { letter: 'V', question: 'İçine su konulup taze çiçeklerin yerleştirildiği süs eşyası', answer: 'VAZO' },
  { letter: 'Y', question: 'Bulutlardan su damlacıkları halinde yeryüzüne inen bereketli yağış', answer: 'YAĞMUR' },
  { letter: 'Y', question: 'Uyurken başın altına konulan yumuşak dolgulu minder', answer: 'YASTIK' },
  { letter: 'Z', question: 'Kahvaltı sofralarının vazgeçilmezi olan siyah veya yeşil taneli Akdeniz meyvesi', answer: 'ZEYTİN' },
  { letter: 'Z', question: 'Okulda teneffüsü, kapıda misafiri haber veren çınlamalı ses aleti', answer: 'ZİL' }
];

export const LOCAL_AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];

export class PassaparolaEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'local'; // 'local' (sunucu masada) | 'wifi' (bulut / QR)
    this.roomId = 'PASS';
    this.hostId = 'host';
    this.currentIndex = 0;
    this.totalDuration = 100; // 100 saniye
    this.remainingSeconds = 100;
    this.timerInterval = null;
    this.isPlaying = false;
    this.isFinished = false;

    // Oyuncu Listesi (Sunucu Modu)
    this.localPlayers = [
      { id: 'p1', name: 'Yarışmacı 1', avatar: '🦁', score: 0, correct: 0, wrong: 0, pass: 0 },
      { id: 'p2', name: 'Yarışmacı 2', avatar: '🦊', score: 0, correct: 0, wrong: 0, pass: 0 }
    ];
    this.players = this.localPlayers;
    this.activePlayerIndex = 0;

    // Harf Durumları: 'pending', 'active', 'correct', 'wrong', 'passed'
    this.letterStates = {};
    this.currentQuestions = {};

    window.__passaparola = this;
  }

  init() {
    this.bindEvents();
    this.setupLocalMode();
    this.renderWheel();
  }

  bindEvents() {
    // Mod Seçimi
    const btnModeLocal = document.getElementById('btn-passa-mode-local');
    const btnModeWifi = document.getElementById('btn-passa-mode-wifi');

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

    // Yerel Oyuncu Ekleme
    const btnAddLocal = document.getElementById('btn-passa-add-local-player');
    if (btnAddLocal) {
      btnAddLocal.onclick = () => this.addLocalPlayer();
    }

    // Oyun Başlat
    const btnStart = document.getElementById('btn-passa-start');
    if (btnStart) {
      btnStart.onclick = () => this.startGame();
    }

    // Sunucu Butonları: Pas, Doğru, Yanlış
    const btnPass = document.getElementById('btn-passa-pass');
    if (btnPass) {
      btnPass.onclick = () => this.handlePass();
    }

    const btnCorrect = document.getElementById('btn-passa-correct');
    if (btnCorrect) {
      btnCorrect.onclick = () => this.handleCorrect();
    }

    const btnWrong = document.getElementById('btn-passa-wrong');
    if (btnWrong) {
      btnWrong.onclick = () => this.handleWrong();
    }

    // Sıradaki Yarışmacı
    const btnNextPlayer = document.getElementById('btn-passa-next-player');
    if (btnNextPlayer) {
      btnNextPlayer.onclick = () => this.nextPlayer();
    }

    // Turu Şimdi Bitir
    const btnFinishNow = document.getElementById('btn-passa-finish-now');
    if (btnFinishNow) {
      btnFinishNow.onclick = () => this.finishGame('Yarışma Sunucu Tarafından Bitirildi');
    }

    const btnRestart = document.getElementById('btn-passa-restart');
    if (btnRestart) {
      btnRestart.onclick = () => {
        this.resetGame();
        this.startGame();
      };
    }

    // Geri Dön
    const btnBack = document.getElementById('btn-back-from-passaparola');
    if (btnBack) {
      btnBack.onclick = () => {
        if (this.game && this.game.showGameLeaveConfirmModal) {
          this.game.showGameLeaveConfirmModal('partyGames', () => {
            clearInterval(this.timerInterval);
            this.isPlaying = false;
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
    this.roomId = 'PASS';
    this.players = this.localPlayers;

    const wifiBox = document.getElementById('passa-wifi-box');
    const localBox = document.getElementById('passa-local-box');
    if (wifiBox) wifiBox.style.display = 'none';
    if (localBox) localBox.style.display = 'block';

    this.renderLocalPlayersUI();
  }

  addLocalPlayer() {
    if (this.localPlayers.length >= 8) {
      alert('En fazla 8 yarışmacı eklenebilir.');
      return;
    }
    const idx = this.localPlayers.length + 1;
    const avatar = LOCAL_AVATARS[(idx - 1) % LOCAL_AVATARS.length];
    this.localPlayers.push({
      id: `p${Date.now()}_${idx}`,
      name: `Yarışmacı ${idx}`,
      avatar,
      score: 0,
      correct: 0,
      wrong: 0,
      pass: 0
    });
    sounds.playClick();
    this.renderLocalPlayersUI();
  }

  removeLocalPlayer(pId) {
    if (this.localPlayers.length <= 1) {
      alert('En az 1 yarışmacı olmalıdır.');
      return;
    }
    this.localPlayers = this.localPlayers.filter(p => p.id !== pId);
    this.players = this.localPlayers;
    sounds.playClick();
    this.renderLocalPlayersUI();
  }

  renderLocalPlayersUI() {
    const container = document.getElementById('passa-local-players-list');
    if (!container) return;

    container.innerHTML = this.localPlayers.map((p, idx) => `
      <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.15); padding:6px 12px; border-radius:999px; margin:4px; font-weight:800; font-size:0.85rem;">
        <span style="font-size:1.1rem;">${p.avatar}</span>
        <input type="text" value="${p.name}" data-pid="${p.id}" class="inp-passa-pname" style="background:transparent; border:none; color:#FFF; font-weight:800; font-size:0.85rem; width:85px; outline:none;" />
        ${this.localPlayers.length > 1 ? `<button type="button" onclick="window.__passaparola.removeLocalPlayer('${p.id}')" style="background:none; border:none; color:#EF4444; font-weight:900; cursor:pointer; font-size:0.9rem; padding:0 2px;">✕</button>` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.inp-passa-pname').forEach(inp => {
      inp.oninput = (e) => {
        const pId = inp.getAttribute('data-pid');
        const target = this.localPlayers.find(p => p.id === pId);
        if (target) target.name = e.target.value.trim() || target.name;
      };
    });
  }

  async createWifiRoom() {
    this.mode = 'wifi';
    this.roomId = firebaseNetwork.generateRoomCode();

    const wifiBox = document.getElementById('passa-wifi-box');
    const localBox = document.getElementById('passa-local-box');
    if (wifiBox) wifiBox.style.display = 'block';
    if (localBox) localBox.style.display = 'none';

    const lblCode = document.getElementById('lbl-passa-room-code');
    if (lblCode) lblCode.textContent = this.roomId;

    const joinUrl = firebaseNetwork.getPassaparolaUrl(this.roomId);
    const cvsContainer = document.getElementById('passa-qr-canvas');
    if (cvsContainer && window.QRCode) {
      cvsContainer.innerHTML = '';
      const cvs = document.createElement('canvas');
      cvsContainer.appendChild(cvs);
      window.QRCode.toCanvas(cvs, joinUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#00F5D4', light: '#0B0E14' }
      }, (err) => {
        if (err) console.error('QR error:', err);
      });
    }

    const initialRoom = {
      roomId: this.roomId,
      namespace: 'passaparola',
      phase: 'lobby',
      createdAt: Date.now(),
      activePlayerName: this.players[0] ? this.players[0].name : 'Yarışmacı 1',
      activePlayerIndex: 0,
      remainingSeconds: this.totalDuration,
      currentLetter: 'A',
      currentQuestion: '',
      letterStates: {},
      players: this.players
    };

    await firebaseNetwork.createRoom('passaparola', initialRoom);

    firebaseNetwork.listenRoom('passaparola', this.roomId, (room) => {
      if (!room) return;
      if (room.players) {
        const pList = Object.values(room.players);
        if (pList.length > 0) {
          this.players = pList;
          const badge = document.getElementById('passa-player-count-badge');
          if (badge) badge.textContent = `${pList.length} Yarışmacı Bağlı`;
          const connEl = document.getElementById('passa-connected-players');
          if (connEl) {
            connEl.innerHTML = pList.map(p => `
              <span style="display:inline-block; font-size:0.75rem; font-weight:800; background:rgba(0,245,212,0.12); color:#00F5D4; padding:3px 8px; border-radius:999px; margin:2px;">
                ${p.avatar || '🦁'} ${p.name}
              </span>
            `).join('');
          }
        }
      }
    });
  }

  resetGame() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
    this.isFinished = false;
    this.currentIndex = 0;
    this.remainingSeconds = this.totalDuration;

    this.players.forEach(p => {
      p.score = 0;
      p.correct = 0;
      p.wrong = 0;
      p.pass = 0;
    });

    this.letterStates = {};
    this.currentQuestions = {};

    PASSAPAROLA_LETTERS.forEach(letter => {
      this.letterStates[letter] = 'pending';
      const pool = PASSAPAROLA_QUESTIONS_DB.filter(q => q.letter === letter);
      if (pool.length > 0) {
        this.currentQuestions[letter] = pool[Math.floor(Math.random() * pool.length)];
      } else {
        this.currentQuestions[letter] = {
          letter,
          question: `${letter} harfi ile başlayan kelime`,
          answer: letter
        };
      }
    });

    this.letterStates[PASSAPAROLA_LETTERS[0]] = 'active';

    const setupBox = document.getElementById('passa-setup-stage');
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');

    if (setupBox) setupBox.style.display = 'block';
    if (playBox) playBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'none';

    this.updateStatsUI();
  }

  startGame() {
    this.isPlaying = true;
    this.isFinished = false;
    this.currentIndex = 0;
    this.remainingSeconds = this.totalDuration;

    // Harf durumlarını sıfırla
    PASSAPAROLA_LETTERS.forEach(letter => {
      this.letterStates[letter] = 'pending';
      const pool = PASSAPAROLA_QUESTIONS_DB.filter(q => q.letter === letter);
      if (pool.length > 0) {
        this.currentQuestions[letter] = pool[Math.floor(Math.random() * pool.length)];
      } else {
        this.currentQuestions[letter] = {
          letter,
          question: `${letter} harfi ile başlayan kelime`,
          answer: letter
        };
      }
    });
    this.letterStates[PASSAPAROLA_LETTERS[0]] = 'active';

    const setupBox = document.getElementById('passa-setup-stage');
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');

    if (setupBox) setupBox.style.display = 'none';
    if (playBox) playBox.style.display = 'block';
    if (resultBox) resultBox.style.display = 'none';

    try { sounds.playFanfare(); } catch(e) {}
    this.renderWheel();
    this.loadQuestionForCurrent();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerUI();

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.finishGame('⏰ Süre Doldu!');
      }
    }, 1000);

    this.updateTimerUI();
    this.syncRoomState();
  }

  updateTimerUI() {
    const timerEl = document.getElementById('passa-timer-display');
    if (timerEl) {
      const m = Math.floor(this.remainingSeconds / 60);
      const s = String(this.remainingSeconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
      if (this.remainingSeconds <= 15) {
        timerEl.style.color = '#EF4444';
      } else {
        timerEl.style.color = '#00F5D4';
      }
    }
  }

  renderWheel() {
    const wheelContainer = document.getElementById('passa-wheel-nodes');
    if (!wheelContainer) return;
    wheelContainer.innerHTML = '';

    const radius = 130;
    const cx = 150;
    const cy = 150;
    const total = PASSAPAROLA_LETTERS.length;
    const angleStep = (2 * Math.PI) / total;

    PASSAPAROLA_LETTERS.forEach((letter, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      const node = document.createElement('div');
      node.className = `passa-node node-${this.letterStates[letter] || 'pending'}`;
      node.id = `passa-node-${letter}`;
      node.textContent = letter;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      wheelContainer.appendChild(node);
    });
  }

  updateWheelNode(letter) {
    const node = document.getElementById(`passa-node-${letter}`);
    if (node) {
      node.className = `passa-node node-${this.letterStates[letter] || 'pending'}`;
    }
  }

  loadQuestionForCurrent() {
    const currentLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    const qData = this.currentQuestions[currentLetter];

    PASSAPAROLA_LETTERS.forEach(l => {
      if (this.letterStates[l] === 'active') {
        this.letterStates[l] = 'pending';
        this.updateWheelNode(l);
      }
    });

    this.letterStates[currentLetter] = 'active';
    this.updateWheelNode(currentLetter);

    // Aktif Yarışmacı
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    const lblPlayer = document.getElementById('lbl-passa-active-player');
    if (lblPlayer && activePlayer) {
      lblPlayer.textContent = `${activePlayer.avatar || '🦁'} ${activePlayer.name}`;
    }

    // Soru ve Harf
    const letterHero = document.getElementById('passa-center-letter');
    if (letterHero) letterHero.textContent = currentLetter;

    const qText = document.getElementById('passa-question-text');
    if (qText && qData) qText.textContent = qData.question;

    // SUNUCU DOĞRU CEVAP KUTUSU (Sunucuya her zaman görünür)
    const hostAns = document.getElementById('passa-answer-text');
    if (hostAns && qData) hostAns.textContent = qData.answer;

    this.updateStatsUI();
  }

  handleCorrect() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playCorrect(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'correct';

    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    if (activePlayer) {
      activePlayer.correct = (activePlayer.correct || 0) + 1;
      activePlayer.score = (activePlayer.score || 0) + 10;
    }

    this.updateWheelNode(curLetter);
    this.updateStatsUI();
    this.syncRoomState('correct');
    this.advanceToNext();
  }

  handleWrong() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playBuzzer(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'wrong';

    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    if (activePlayer) {
      activePlayer.wrong = (activePlayer.wrong || 0) + 1;
    }

    this.updateWheelNode(curLetter);
    this.updateStatsUI();
    this.syncRoomState('wrong');
    this.advanceToNext();
  }

  handlePass() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playClick(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'passed';

    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    if (activePlayer) {
      activePlayer.pass = (activePlayer.pass || 0) + 1;
    }

    this.updateWheelNode(curLetter);
    this.updateStatsUI();
    this.syncRoomState('pass');
    this.advanceToNext();
  }

  advanceToNext() {
    const remainingLetters = PASSAPAROLA_LETTERS.filter(
      l => this.letterStates[l] === 'pending' || this.letterStates[l] === 'passed'
    );

    if (remainingLetters.length === 0) {
      this.finishGame('🎉 Tüm Harfler Tamamlandı!');
      return;
    }

    let nextIdx = (this.currentIndex + 1) % PASSAPAROLA_LETTERS.length;
    let loopGuard = 0;
    while (
      (this.letterStates[PASSAPAROLA_LETTERS[nextIdx]] === 'correct' ||
       this.letterStates[PASSAPAROLA_LETTERS[nextIdx]] === 'wrong') &&
      loopGuard < PASSAPAROLA_LETTERS.length * 2
    ) {
      nextIdx = (nextIdx + 1) % PASSAPAROLA_LETTERS.length;
      loopGuard++;
    }

    this.currentIndex = nextIdx;
    this.loadQuestionForCurrent();
    this.syncRoomState();
  }

  nextPlayer() {
    sounds.playClick();
    if (this.players.length > 1) {
      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }
    const activePlayer = this.players[this.activePlayerIndex];
    const lbl = document.getElementById('lbl-passa-active-player');
    if (lbl && activePlayer) {
      lbl.textContent = `${activePlayer.avatar || '🦁'} ${activePlayer.name}`;
    }
    this.syncRoomState();
  }

  updateStatsUI() {
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0] || {};
    const elCorrect = document.getElementById('passa-stat-correct');
    const elWrong = document.getElementById('passa-stat-wrong');
    const elScore = document.getElementById('passa-stat-score');

    if (elCorrect) elCorrect.textContent = `${activePlayer.correct || 0} Doğru`;
    if (elWrong) elWrong.textContent = `${activePlayer.wrong || 0} Yanlış`;
    if (elScore) elScore.textContent = `${activePlayer.score || 0} P`;
  }

  syncRoomState(actionName = '') {
    if (this.mode !== 'wifi' || !this.roomId) return;

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    const qData = this.currentQuestions[curLetter] || {};
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0] || {};

    // NOT: Doğru cevap Firebase payload'una EKLENMEZ!
    // Böylece bağlı yarışmacı veya seyirci telefonlarında cevap asla görünmez ve hile yapılamaz!
    firebaseNetwork.updateRoom('passaparola', this.roomId, {
      phase: this.isFinished ? 'result' : (this.isPlaying ? 'playing' : 'lobby'),
      currentLetter: curLetter,
      currentQuestion: qData.question || '',
      remainingSeconds: this.remainingSeconds,
      letterStates: this.letterStates,
      activePlayerName: activePlayer.name || 'Yarışmacı',
      activePlayerAvatar: activePlayer.avatar || '🦁',
      players: this.players,
      lastAction: actionName
    }).catch(() => {});
  }

  finishGame(reason) {
    this.isPlaying = false;
    this.isFinished = true;
    clearInterval(this.timerInterval);

    try { sounds.playFanfare(); } catch (e) {}

    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');
    if (playBox) playBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'block';

    const reasonEl = document.getElementById('passa-result-title');
    if (reasonEl) reasonEl.textContent = reason;

    // En yüksek puanlı yarışmacıyı öne çıkar
    const sorted = [...this.players].sort((a,b) => (b.score || 0) - (a.score || 0));
    const winner = sorted[0] || { name: 'Yarışmacı', score: 0, correct: 0, wrong: 0 };

    const resScore = document.getElementById('passa-result-score');
    if (resScore) resScore.textContent = `${winner.name}: ${winner.score} Puan`;

    const resCorrect = document.getElementById('passa-result-correct');
    if (resCorrect) resCorrect.textContent = winner.correct || 0;

    const resWrong = document.getElementById('passa-result-wrong');
    if (resWrong) resWrong.textContent = winner.wrong || 0;

    const totalAnswered = (winner.correct || 0) + (winner.wrong || 0);
    const successRate = totalAnswered > 0 ? Math.round(((winner.correct || 0) / totalAnswered) * 100) : 0;
    const resRate = document.getElementById('passa-result-rate');
    if (resRate) resRate.textContent = `%${successRate}`;

    this.syncRoomState('finished');
  }
}
