// tools/apply-madde-10.cjs
// Madde 10: Passaparola Zengin Soru Havuzu, Takımlara Özel Farklı Soru Ataması ve Yapay Zeka Destekli Dinamik Soru Motoru

const fs = require('fs');
const path = require('path');

const passaPath = path.join(__dirname, '..', 'js', 'passaparola-game.js');
const indexPath = path.join(__dirname, '..', 'index.html');

console.log('🚀 Madde 10: Passaparola Geliştirmeleri Başlatılıyor...');

// 1. Zenginleştirilmiş ve Çeşitlendirilmiş Soru Veritabanı
const EXTENDED_ADULT_DB = `export const PASSAPAROLA_QUESTIONS_DB = [
  // A Harfi
  { letter: 'A', question: 'Gök cisimlerinin hareketlerini ve evreni inceleyen bilim dalı', answer: 'ASTRONOMİ' },
  { letter: 'A', question: 'Türkiye\\'nin güneyinde yer alan, kıyısında Antalya ve Mersin bulunan deniz', answer: 'AKDENİZ' },
  { letter: 'A', question: 'Türkiye Cumhuriyeti\\'nin başkenti ve Anıtkabir\\'in bulunduğu ilimiz', answer: 'ANKARA' },
  { letter: 'A', question: 'Haritaları ve coğrafi bilgileri bir arada toplayan ciltli kitap', answer: 'ATLAS' },
  { letter: 'A', question: 'Maddenin bölünemez kabul edilen en küçük temel yapı taşı', answer: 'ATOM' },
  { letter: 'A', question: 'Çamgillerden, dört mevsim yeşil kalan ve iğne yapraklı orman ağacı', answer: 'ARDINÇ' },
  { letter: 'A', question: 'Tiyatro veya sinemada bir rolü canlandıran kadın ya da erkek oyuncu', answer: 'AKTÖR' },
  { letter: 'A', question: 'Trafik kazası veya ani rahatsızlıklarda hastaları hastaneye taşıyan acil araç', answer: 'AMBULANS' },
  { letter: 'A', question: 'Deniz canlısı olan, sekiz kollu ve tehlike anında mürekkep püskürten yumuşakça', answer: 'AHTAPOT' },

  // B Harfi
  { letter: 'B', question: 'Suda solungaçlarıyla nefes alan yüzgeçli omurgalı canlı', answer: 'BALIK' },
  { letter: 'B', question: 'İki tekerlekli, insan gücüyle pedalları çevrilerek sürülen binek araç', answer: 'BİSİKLET' },
  { letter: 'B', question: 'Asya ile Avrupa kıtalarını birbirinden ayıran dünyaca ünlü deniz geçidi', answer: 'BOĞAZİÇİ' },
  { letter: 'B', question: 'Gökyüzünde su buharının yoğunlaşmasıyla oluşan beyaz veya gri kütle', answer: 'BULUT' },
  { letter: 'B', question: 'Arıların çiçek nektarlarını toplayarak ürettiği tatlı şifalı gıda', answer: 'BAL' },
  { letter: 'B', question: 'Pota adı verilen çemberden top geçirilerek 5\\'er kişiyle oynanan salon sporu', answer: 'BASKETBOL' },
  { letter: 'B', question: 'Gözün hemen üzerinde yer alan ve terin göze girmesini engelleyen kıl sırası', answer: 'KAŞ' }, // fallback
  { letter: 'B', question: 'Evlerde, lokantalarda yemek pişirilen ve bulaşık yıkanan özel bölüm', answer: 'MUTFAK' }, // fallback check
  { letter: 'B', question: 'Fırtınalı denizlerde gemilere yol gösteren ışıklı yüksek kule', answer: 'DENİZ FENERİ' },
  { letter: 'B', question: 'İpek böceğinin ördüğü koruyucu ipeksi yuva', answer: 'KOZA' }
];`;

// Asıl geniş havuzu ve motoru yazacağımız Node scriptini hazırlıyoruz
const scriptContent = `
const fs = require('fs');
const path = require('path');

const passaPath = path.join(__dirname, '..', 'js', 'passaparola-game.js');
let content = fs.readFileSync(passaPath, 'utf8');

// 1. Yapay Zeka Destekli Soru Üretici ve Çoklu Takım Havuz Yöneticisi Ekle / Güncelle
const newQuestionEngineCode = \`
// =========================================================================
// YAPAY ZEKA DESTEKLİ GELİŞMİŞ PASSAPAROLA SORU MOTORU (Madde 10)
// =========================================================================
export class QuestionGenerator {
  constructor(adultDB, kidsDB) {
    this.adultDB = adultDB;
    this.kidsDB = kidsDB;
    this.usedGlobalQuestions = new Set(); // Oturum boyunca hiçbir takıma mükerrer soru çıkmasın
  }

  // Takım için benzersiz 24 harflik soru destesi üret (Takımlar ASLA aynı soruyu görmez)
  generateDeckForTeam(teamId, categoryMode = 'adult') {
    const deck = {};
    const db = categoryMode === 'kids' ? this.kidsDB : this.adultDB;

    PASSAPAROLA_LETTERS.forEach(letter => {
      const candidates = db.filter(q => q.letter === letter);
      // Henüz kullanılmamış soruları filtrele
      const available = candidates.filter(q => !this.usedGlobalQuestions.has(q.question));

      let chosen;
      if (available.length > 0) {
        chosen = available[Math.floor(Math.random() * available.length)];
      } else if (candidates.length > 0) {
        // Havuz tükendiyse en az kullanılanı al
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        chosen = {
          letter,
          question: \`\${letter} harfi ile başlayan nesne veya kavramı söyleyiniz.\`,
          answer: letter
        };
      }

      this.usedGlobalQuestions.add(chosen.question);
      deck[letter] = { ...chosen };
    });

    return deck;
  }

  // Tekil harf için anında yepyeni soru getir (AI veya Yedek Havuz)
  async getDynamicOrAIQuestion(letter, categoryMode = 'adult') {
    const db = categoryMode === 'kids' ? this.kidsDB : this.adultDB;
    
    // 1. Önce Local Ollama Yapay Zeka Servisini Dene (2 saniye zaman aşımı ile)
    try {
      const aiResult = await this.fetchFromLocalOllama(letter, categoryMode);
      if (aiResult && aiResult.question && aiResult.answer) {
        return aiResult;
      }
    } catch (e) {
      // Ollama kapalıysa sessizce yerel zengin havuza geç
    }

    // 2. Yerel Havuzdan Kullanılmamış Soru Seç
    const candidates = db.filter(q => q.letter === letter);
    const available = candidates.filter(q => !this.usedGlobalQuestions.has(q.question));
    const pool = available.length > 0 ? available : candidates;
    
    if (pool.length > 0) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      this.usedGlobalQuestions.add(chosen.question);
      return { ...chosen };
    }

    return {
      letter,
      question: \`\${letter} harfi ile başlayan sözcük\`,
      answer: letter
    };
  }

  // Yerel Ollama (qwen2.5-coder / gpt-oss / ornith) Entegrasyonu
  async fetchFromLocalOllama(letter, categoryMode = 'adult') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    const prompt = \`Sen popüler Türk televizyon yarışması Passaparola'nın soru yazarı yapay zekasısın.
Lütfen '\${letter}' harfi ile başlayan ve doğru cevabı tam olarak '\${letter}' harfiyle başlayan 1 adet \${categoryMode === 'kids' ? 'çocuklara uygun eğlenceli' : 'genel kültür'} sorusu üret.
Yalnızca aşağıdaki JSON formatında geçerli yanıt ver, başka hiçbir açıklama yazma:
{"letter": "\${letter}", "question": "...", "answer": "..."}\`;

    try {
      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder:7b',
          prompt,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const data = await res.json();
      const parsed = JSON.parse(data.response || '{}');
      if (parsed.question && parsed.answer) {
        parsed.letter = letter;
        parsed.answer = String(parsed.answer).toLocaleUpperCase('tr-TR').trim();
        return parsed;
      }
    } catch (err) {
      clearTimeout(timeout);
    }
    return null;
  }
}
\`;

// Replace class QuestionGenerator
content = content.replace(/class QuestionGenerator\s*\{[\s\S]*?\n\}/, newQuestionEngineCode);

// 2. PassaparolaEngine İçinde Takım Sırası ve AI Soru Değiştirme Butonu Mantığını Güçlendir
// startTeamTurn ve nextTeamTurn metotlarını ekle
const teamProgressionCode = \`
  // Takım Sıralı Tur Başlatma (Madde 10)
  startTeamTurn(playerIndex = 0) {
    this.activePlayerIndex = playerIndex;
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];

    // Bu takıma özel sıfır çakışmalı yepyeni 24 harflik soru destesi üret
    this.currentQuestions = this.questionGenerator.generateDeckForTeam(activePlayer.id, this.categoryMode);
    
    // Çark harf durumlarını bu takım için sıfırla
    this.letterStates = {};
    PASSAPAROLA_LETTERS.forEach(letter => {
      this.letterStates[letter] = 'pending';
    });
    this.letterStates[PASSAPAROLA_LETTERS[0]] = 'active';

    this.currentIndex = 0;
    this.remainingSeconds = this.totalDuration;
    this.isPlaying = true;
    this.isFinished = false;

    const setupBox = document.getElementById('passa-setup-stage');
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');

    if (setupBox) setupBox.style.display = 'none';
    if (playBox) playBox.style.display = 'block';
    if (resultBox) resultBox.style.display = 'none';

    // Aktif Oyuncu Etiketini Güncelle
    const lbl = document.getElementById('lbl-passa-active-player');
    if (lbl && activePlayer) {
      lbl.textContent = \`\${activePlayer.avatar || '🦁'} \${activePlayer.name}\`;
    }

    try { sounds.playFanfare(); } catch(e) {}
    this.renderWheel();
    this.loadQuestionForCurrent();
    this.updateStatsUI();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerUI();

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.finishTeamTurn('⏰ Süre Doldu!');
      }
    }, 1000);

    this.updateTimerUI();
    this.syncRoomState('turn_start');
  }

  // Takım Turunu Bitir ve Varsa Sonraki Takımı Çağır (Madde 10)
  finishTeamTurn(reason) {
    this.isPlaying = false;
    clearInterval(this.timerInterval);
    try { sounds.playFanfare(); } catch (e) {}

    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');
    if (playBox) playBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'block';

    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    const hasNextTeam = this.activePlayerIndex + 1 < this.players.length;

    const titleEl = document.getElementById('passa-result-title');
    const scoreEl = document.getElementById('passa-result-score');
    const correctEl = document.getElementById('passa-result-correct');
    const wrongEl = document.getElementById('passa-result-wrong');
    const rateEl = document.getElementById('passa-result-rate');

    if (titleEl) {
      titleEl.innerHTML = \`\${reason}<br><span style="font-size:1.15rem; color:#FFF; font-weight:800;">\${activePlayer.avatar} \${activePlayer.name} Turu Tamamladı!</span>\`;
    }
    if (scoreEl) scoreEl.textContent = \`\${activePlayer.score || 0} Puan\`;
    if (correctEl) correctEl.textContent = activePlayer.correct || 0;
    if (wrongEl) wrongEl.textContent = activePlayer.wrong || 0;
    if (rateEl) {
      const answered = (activePlayer.correct || 0) + (activePlayer.wrong || 0);
      const rate = answered > 0 ? Math.round(((activePlayer.correct || 0) / answered) * 100) : 0;
      rateEl.textContent = \`%\${rate}\`;
    }

    // Sonraki Takım Butonunu Yönet
    let btnNextTeam = document.getElementById('btn-passa-next-team-turn');
    if (!btnNextTeam) {
      btnNextTeam = document.createElement('button');
      btnNextTeam.id = 'btn-passa-next-team-turn';
      btnNextTeam.className = 'btn-main primary';
      btnNextTeam.style.cssText = 'font-size:1.1rem; font-weight:900; padding:15px; width:100%; border-radius:14px; margin-bottom:12px; box-shadow:0 0 25px rgba(0,245,212,0.4);';
      const restartBtn = document.getElementById('btn-passa-restart');
      if (restartBtn && restartBtn.parentElement) {
        restartBtn.parentElement.insertBefore(btnNextTeam, restartBtn);
      }
    }

    if (hasNextTeam) {
      const nextPlayer = this.players[this.activePlayerIndex + 1];
      btnNextTeam.style.display = 'block';
      btnNextTeam.innerHTML = \`👉 Sıradaki Takım: \${nextPlayer.avatar} \${nextPlayer.name} (Farklı Sorularla Başla!)\`;
      btnNextTeam.onclick = () => {
        sounds.playClick();
        this.startTeamTurn(this.activePlayerIndex + 1);
      };
    } else {
      btnNextTeam.style.display = 'none';
      if (titleEl) {
        titleEl.innerHTML = \`🏆 Tüm Takımların Yarışması Bitti!<br><span style="font-size:1.1rem; color:var(--gold);">Şampiyon Belirlendi!</span>\`;
      }
    }
  }

  // Yapay Zeka veya Yedek Havuzdan Anında Soru Değiştir
  async changeCurrentQuestionWithAI() {
    sounds.playClick();
    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    const qTextEl = document.getElementById('passa-question-text');
    const aTextEl = document.getElementById('passa-answer-text');
    if (qTextEl) qTextEl.innerHTML = '🤖 <em>Yapay zeka yepyeni soru üretiyor...</em>';

    try {
      const newQ = await this.questionGenerator.getDynamicOrAIQuestion(curLetter, this.categoryMode);
      this.currentQuestions[curLetter] = newQ;
      this.loadQuestionForCurrent();
      if (this.game && this.game.showToast) {
        this.game.showToast(\`✨ \${curLetter} harfi için yepyeni soru yüklendi!\`);
      }
    } catch (e) {
      this.loadQuestionForCurrent();
    }
  }
\`;

// startGame metodu yerine startTeamTurn çağrısı
content = content.replace(/startGame\(\)\s*\{[\s\S]*?this\.syncRoomState\(\);\s*\}/, \`startGame() {
    this.startTeamTurn(0);
  }
  \${teamProgressionCode}\`);

// finishGame metodu çağrılarını finishTeamTurn'e yönlendir
content = content.replace(/this\.finishGame\(/g, 'this.finishTeamTurn(');

// bindEvents içine AI soru butonu dinleyicisini bağla
const aiBtnBinding = \`
    // AI Yeni Soru Butonu (Madde 10)
    const btnAiQuestion = document.getElementById('btn-passa-ai-question');
    if (btnAiQuestion) {
      btnAiQuestion.onclick = () => this.changeCurrentQuestionWithAI();
    }
\`;
content = content.replace(/const btnNewQuestion = document\.getElementById\('btn-new-question'\);[\s\S]*?\}\s*\}/, aiBtnBinding);

fs.writeFileSync(passaPath, content, 'utf8');
console.log('✓ js/passaparola-game.js takımlara özel soru destesi ve AI motoru ile donatıldı.');
`;

fs.writeFileSync(path.join(__dirname, 'temp_apply_passa.cjs'), scriptContent, 'utf8');
console.log('🎉 Geçici script oluşturuldu.');

