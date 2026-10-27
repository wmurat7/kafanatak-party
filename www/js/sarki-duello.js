// js/sarki-duello.js
// Kafana Tak! - Şarkıyı Devam Ettir (Melodi Düellosu) Parti Oyunu

import { sounds } from './audio.js';

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

export class SarkiDuelloEngine {
  constructor(game) {
    this.game = game;
    this.songs = [...TURKISH_SONGS];
    this.currentIndex = 0;
    this.currentSong = null;
    this.remainingSeconds = 10;
    this.timerInterval = null;
    this.revealed = false;
    this.scores = { teamA: 0, teamB: 0 };
    this.turn = 'teamA'; // 'teamA' veya 'teamB'
  }

  init() {
    this.shuffleSongs();
    this.currentIndex = 0;
    this.scores = { teamA: 0, teamB: 0 };
    this.turn = 'teamA';
    this.bindEvents();
    this.loadSong();
  }

  shuffleSongs() {
    for (let i = this.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
    }
  }

  bindEvents() {
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
        this.game.showScreen('party-games');
      };
    }
  }

  loadSong() {
    clearInterval(this.timerInterval);
    this.revealed = false;
    this.remainingSeconds = 10;

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
    if (this.game.gameMode === 'teams') {
      turnBadge.style.display = 'inline-block';
      turnBadge.textContent = this.turn === 'teamA' ? '🔴 SIRA: 1. TAKIMDA' : '🔵 SIRA: 2. TAKIMDA';
      turnBadge.style.background = this.turn === 'teamA' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
      turnBadge.style.color = this.turn === 'teamA' ? '#EF4444' : '#3B82F6';
    } else {
      turnBadge.style.display = 'none';
    }

    this.updateScoresUI();
    this.startTimer();
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
  }

  handleScore(isCorrect) {
    if (isCorrect) {
      sounds.playCorrect();
      if (this.turn === 'teamA') this.scores.teamA += 10;
      else this.scores.teamB += 10;
    } else {
      sounds.playPass();
    }

    // Sırayı diğer takıma geçir
    this.turn = (this.turn === 'teamA') ? 'teamB' : 'teamA';
    this.updateScoresUI();
    this.nextSong();
  }

  updateScoresUI() {
    const scoreBox = document.getElementById('sarki-score-box');
    if (this.game.gameMode === 'teams') {
      scoreBox.style.display = 'flex';
      document.getElementById('sarki-score-a').textContent = `🔴 ${this.scores.teamA} P`;
      document.getElementById('sarki-score-b').textContent = `🔵 ${this.scores.teamB} P`;
    } else {
      scoreBox.style.display = 'none';
    }
  }

  nextSong() {
    this.currentIndex++;
    this.loadSong();
  }
}
