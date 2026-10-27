// js/passaparola-game.js
// Kafana Tak! - Efsane A'dan Z'ye Passaparola Alfabe Arenası
// Tamamen yerel, eğlenceli ve parti moduna uygun yarışma motoru

import { sounds } from './audio.js';

export const PASSAPAROLA_LETTERS = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 
  'H', 'I', 'İ', 'K', 'L', 'M', 'N', 'O', 
  'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'V', 
  'Y', 'Z'
];

export const PASSAPAROLA_QUESTIONS_DB = [
  { letter: 'A', question: 'Gök cisimlerinin hareketlerini inceleyen bilim dalı', answer: 'ASTRONOMİ' },
  { letter: 'B', question: 'Yemek yemeden önce sofraya serilen veya boyna bağlanan kumaş', answer: 'ÖNLÜK / BEZ / BALIK' },
  { letter: 'B', question: 'Denizlerde ve göllerde yaşayan, yüzgeçli omurgalı canlı', answer: 'BALIK' },
  { letter: 'C', question: 'Para veya kart taşımak için kullanılan küçük deri kap', answer: 'CÜZDAN' },
  { letter: 'Ç', question: 'Yağmurdan veya güneşten korunmak için baş üstünde tutulan açılır kapanır alet', answer: 'ŞEMSİYE' },
  { letter: 'Ç', question: 'Kakao çekirdeklerinden yapılan tatlı yiyecek', answer: 'ÇİKOLATA' },
  { letter: 'D', question: 'Hastalara şifa dağıtan tıp mensubu meslek insanı', answer: 'DOKTOR' },
  { letter: 'E', question: 'Fırınlarda pişirilen ve sofralarımızın temel besini olan hamur işi', answer: 'EKMEK' },
  { letter: 'F', question: 'On birer kişilik iki takım arasında topla oynanan en popüler spor', answer: 'FUTBOL' },
  { letter: 'G', question: 'Gündüz dünyamızı aydınlatan ve ısıtan en yakın yıldız', answer: 'GÜNEŞ' },
  { letter: 'H', question: 'Hastalıkların tedavi edildiği büyük sağlık kuruluşu', answer: 'HASTANE' },
  { letter: 'I', question: 'Karanlığı aydınlatan ve görmemizi sağlayan fiziksel enerji', answer: 'IŞIK' },
  { letter: 'İ', question: 'Türkiye\'nin nüfus bakımından en büyük ve iki kıtaya yayılan şehri', answer: 'İSTANBUL' },
  { letter: 'K', question: 'Kışın yağan beyaz ve soğuk su kristallerinden oluşan yağış', answer: 'KAR' },
  { letter: 'L', question: 'Salatalara sıkılan ekşi ve sarı narenciye meyvesi', answer: 'LİMON' },
  { letter: 'M', question: 'Üzerinde yemek yenilen veya çalışılan dört ayaklı mobilya', answer: 'MASA' },
  { letter: 'N', question: 'Yılın dördüncü ayı ve baharın müjdecisi', answer: 'NİSAN' },
  { letter: 'O', question: 'Öğrencilerin eğitim gördüğü ve öğretmenlerin ders verdiği bina', answer: 'OKUL' },
  { letter: 'Ö', question: 'Bilgi aktaran, yol gösteren ve saygı duyulan eğitimci', answer: 'ÖĞRETMEN' },
  { letter: 'P', question: 'Kızartması, püresi ve cipsi yapılan toprak altı yumru sebze', answer: 'PATATES' },
  { letter: 'R', question: 'Kırmızı, mavi, sarı gibi gözün algıladığı ışık tonları', answer: 'RENK' },
  { letter: 'S', question: 'Yaşamın temel kaynağı olan renksiz ve kokusuz sıvı', answer: 'SU' },
  { letter: 'Ş', question: 'Çay ve tatlıları tatlandırmak için kullanılan beyaz kristal madde', answer: 'ŞEKER' },
  { letter: 'T', question: 'Ses ve görüntüyü ekrana yansıtan ev eğlence kutusu', answer: 'TELEVİZYON' },
  { letter: 'U', question: 'Gökyüzünde süzülen, motorlu ve kanatlı büyük hava taşıtı', answer: 'UÇAK' },
  { letter: 'V', question: 'Denizlerde yolcu ve yük taşıyan büyük motorlu gemi', answer: 'VAPUR' },
  { letter: 'Y', question: 'Bulutlardan yeryüzüne su damlaları halinde düşen bereketli yağış', answer: 'YAĞMUR' },
  { letter: 'Z', question: 'Zamanı saat, dakika ve saniye olarak gösteren mekanik veya dijital alet', answer: 'SAAT' },
  { letter: 'Z', question: 'Kahvaltıların vazgeçilmezi olan siyah veya yeşil taneli ege meyvesi', answer: 'ZEYTİN' }
];

export class PassaparolaEngine {
  constructor(game) {
    this.game = game;
    this.currentIndex = 0;
    this.totalDuration = 120; // 120 saniye
    this.remainingSeconds = 120;
    this.timerInterval = null;
    this.isPlaying = false;
    this.isFinished = false;

    // Harf Durumları: 'pending' (beklemede), 'active' (sıradaki), 'correct' (yeşil), 'wrong' (kırmızı), 'passed' (sarı)
    this.letterStates = {};
    this.currentQuestions = {};

    this.correctCount = 0;
    this.wrongCount = 0;
    this.passCount = 0;
    this.score = 0;

    window.__passaparola = this;
  }

  init() {
    this.bindEvents();
    this.resetGame();
    this.renderWheel();
  }

  bindEvents() {
    const btnStart = document.getElementById('btn-passa-start');
    if (btnStart) {
      btnStart.onclick = () => this.startGame();
    }

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

    const btnReveal = document.getElementById('btn-passa-reveal-answer');
    if (btnReveal) {
      btnReveal.onclick = () => this.toggleAnswerReveal();
    }

    const btnRestart = document.getElementById('btn-passa-restart');
    if (btnRestart) {
      btnRestart.onclick = () => {
        this.resetGame();
        this.startGame();
      };
    }

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

  resetGame() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
    this.isFinished = false;
    this.currentIndex = 0;
    this.remainingSeconds = this.totalDuration;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.passCount = 0;
    this.score = 0;

    this.letterStates = {};
    this.currentQuestions = {};

    PASSAPAROLA_LETTERS.forEach(letter => {
      this.letterStates[letter] = 'pending';
      // Veritabanından o harfe uygun soru seç
      const pool = PASSAPAROLA_QUESTIONS_DB.filter(q => q.letter === letter);
      if (pool.length > 0) {
        this.currentQuestions[letter] = pool[Math.floor(Math.random() * pool.length)];
      } else {
        this.currentQuestions[letter] = {
          letter,
          question: `${letter} harfi ile başlayan parti ve genel kültür kelimesi`,
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

    const setupBox = document.getElementById('passa-setup-stage');
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');

    if (setupBox) setupBox.style.display = 'none';
    if (playBox) playBox.style.display = 'block';
    if (resultBox) resultBox.style.display = 'none';

    try { sounds.playFanfare(); } catch(e) {}
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

    const radius = 130; // 300x300 çark içinde
    const cx = 150;
    const cy = 150;
    const total = PASSAPAROLA_LETTERS.length;
    const angleStep = (2 * Math.PI) / total;

    PASSAPAROLA_LETTERS.forEach((letter, i) => {
      // Saat yönünde tepe noktasından (-PI/2) başla
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

    // Önceki aktifleri güncelle
    PASSAPAROLA_LETTERS.forEach(l => {
      if (this.letterStates[l] === 'active') {
        this.letterStates[l] = 'pending';
        this.updateWheelNode(l);
      }
    });

    this.letterStates[currentLetter] = 'active';
    this.updateWheelNode(currentLetter);

    // Soru Metnini ve Harfi Güncelle
    const letterHero = document.getElementById('passa-center-letter');
    if (letterHero) letterHero.textContent = currentLetter;

    const qText = document.getElementById('passa-question-text');
    if (qText) qText.textContent = qData.question;

    const ansBox = document.getElementById('passa-answer-reveal-box');
    if (ansBox) {
      ansBox.style.display = 'none';
      ansBox.textContent = `Doğru Cevap: ${qData.answer}`;
    }

    const btnReveal = document.getElementById('btn-passa-reveal-answer');
    if (btnReveal) btnReveal.textContent = '👀 Cevabı Göster';
  }

  handleCorrect() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playCorrect(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'correct';
    this.correctCount++;
    this.score += 10;
    this.updateWheelNode(curLetter);
    this.updateStatsUI();

    this.advanceToNext();
  }

  handleWrong() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playBuzzer(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'wrong';
    this.wrongCount++;
    this.updateWheelNode(curLetter);
    this.updateStatsUI();

    this.advanceToNext();
  }

  handlePass() {
    if (!this.isPlaying || this.isFinished) return;
    try { sounds.playClick(); } catch (e) {}

    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    this.letterStates[curLetter] = 'passed';
    this.passCount++;
    this.updateWheelNode(curLetter);
    this.updateStatsUI();

    this.advanceToNext();
  }

  advanceToNext() {
    // Kalan cevaplanmamış veya 'passed' olan harfleri bul
    const remainingLetters = PASSAPAROLA_LETTERS.filter(
      l => this.letterStates[l] === 'pending' || this.letterStates[l] === 'passed'
    );

    if (remainingLetters.length === 0) {
      this.finishGame('🎉 Tüm Harfler Tamamlandı!');
      return;
    }

    // Sıradaki uygun harfe geç
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
  }

  toggleAnswerReveal() {
    const ansBox = document.getElementById('passa-answer-reveal-box');
    const btnReveal = document.getElementById('btn-passa-reveal-answer');
    if (!ansBox) return;

    if (ansBox.style.display === 'none' || !ansBox.style.display) {
      ansBox.style.display = 'block';
      if (btnReveal) btnReveal.textContent = '🙈 Cevabı Gizle';
    } else {
      ansBox.style.display = 'none';
      if (btnReveal) btnReveal.textContent = '👀 Cevabı Göster';
    }
  }

  updateStatsUI() {
    const elCorrect = document.getElementById('passa-stat-correct');
    const elWrong = document.getElementById('passa-stat-wrong');
    const elScore = document.getElementById('passa-stat-score');

    if (elCorrect) elCorrect.textContent = `${this.correctCount} Doğru`;
    if (elWrong) elWrong.textContent = `${this.wrongCount} Yanlış`;
    if (elScore) elScore.textContent = `${this.score} P`;
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

    const resScore = document.getElementById('passa-result-score');
    if (resScore) resScore.textContent = `${this.score} Puan`;

    const resCorrect = document.getElementById('passa-result-correct');
    if (resCorrect) resCorrect.textContent = this.correctCount;

    const resWrong = document.getElementById('passa-result-wrong');
    if (resWrong) resWrong.textContent = this.wrongCount;

    const totalAnswered = this.correctCount + this.wrongCount;
    const successRate = totalAnswered > 0 ? Math.round((this.correctCount / totalAnswered) * 100) : 0;
    const resRate = document.getElementById('passa-result-rate');
    if (resRate) resRate.textContent = `%${successRate}`;
  }
}
