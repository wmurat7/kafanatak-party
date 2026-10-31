// tools/apply-madde-10-full.cjs
const fs = require('fs');
const path = require('path');

const passaPath = path.join(__dirname, '..', 'js', 'passaparola-game.js');
const indexPath = path.join(__dirname, '..', 'index.html');

console.log('🚀 Madde 10: Passaparola Tam Güncellemesi Başlatılıyor...');

let passaContent = fs.readFileSync(passaPath, 'utf8');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 1. Genişletilmiş Soru Havuzu
const EXTRA_QUESTIONS = [
  // A Harfi
  { letter: "A", question: "Maddenin bölünemez kabul edilen en küçük temel yapı taşı", answer: "ATOM" },
  { letter: "A", question: "Çamgillerden, dört mevsim yeşil kalan ve iğne yapraklı orman ağacı", answer: "ARDIÇ" },
  { letter: "A", question: "Tiyatro veya sinemada bir rolü canlandıran kadın ya da erkek oyuncu", answer: "AKTÖR" },
  { letter: "A", question: "Trafik kazası veya ani rahatsızlıklarda hastaları hastaneye taşıyan acil araç", answer: "AMBULANS" },
  { letter: "A", question: "Sekiz kollu, tehlike anında mürekkep püskürten akıllı deniz canlısı", answer: "AHTAPOT" },

  // B Harfi
  { letter: "B", question: "Pota adı verilen çemberden top geçirilerek 5'er kişiyle oynanan salon sporu", answer: "BASKETBOL" },
  { letter: "B", question: "Gözün hemen üzerinde yer alan ve terin göze girmesini engelleyen kıl kümesi", answer: "BAŞ" },
  { letter: "B", question: "Arıların çiçeklerden nektar toplayarak kovanlarında ürettiği tatlı şifa kaynağı", answer: "BAL" },
  { letter: "B", question: "Fırtınalı havalarda gemilere kılavuzluk eden ışıklı kıyı kulesi", answer: "BALIKÇI FENERİ" },

  // C Harfi
  { letter: "C", question: "Ressamların boyalarını sürdüğü tahta veya gerilmiş bez yüzey", answer: "CUMBA" },
  { letter: "C", question: "Vücudun dışını tamamen kaplayan en büyük duyu organımız", answer: "CİLT" },
  { letter: "C", question: "Suda ve karada yaşayabilen, sevimli yürüyüşlü minik sürüngen", answer: "CÜCE KAPLUMBAĞA" },

  // Ç Harfi
  { letter: "Ç", question: "Toprağı kazmaya, bellemeye yarayan metal uçlu tarım aleti", answer: "ÇAPA" },
  { letter: "Ç", question: "Gözün etrafını veya tabloları çevreleyen koruyucu süslü kenarlık", answer: "ÇERÇEVE" },
  { letter: "Ç", question: "Kışın dağlardan yuvarlandıkça büyüyen tehlikeli kar kütlesi", answer: "ÇIĞ" },

  // D Harfi
  { letter: "D", question: "Gemilerin akıntıya kapılmadan sabit kalması için denize atılan ağır demir çapa", answer: "DEMİR" },
  { letter: "D", question: "Sıvıların ve havanın sıcaklığını ölçmeye yarayan dereceli alet", answer: "DERECE" },
  { letter: "D", question: "Ağız içinde tat almaya ve konuşmaya yarayan kaslı organımız", answer: "DİL" },

  // E Harfi
  { letter: "E", question: "Bir ülkenin başka bir devletteki en üst düzey diplomatik temsilcisi", answer: "ELÇİ" },
  { letter: "E", question: "Gözleri güneşin zararlı ışınlarından korumak için takılan koyu renkli cam", answer: "EKRAN" },
  { letter: "E", question: "Eski zamanlardan kalma tarihi eserlerin sergilendiği yer", answer: "ENSTİTÜ" },

  // F Harfi
  { letter: "F", question: "Geceleyin karanlık yolları aydınlatan otomobil ön ışığı", answer: "FAR" },
  { letter: "F", question: "Hamur işi, kek ve ekmeklerin yüksek ısıda pişirildiği mutfak cihazı", answer: "FIRIN" },
  { letter: "F", question: "Akdeniz ve Ege kıyılarında yetişen, mor kabuklu tatlı meyve", answer: "FRENK İNCİRİ" },

  // G Harfi
  { letter: "G", question: "Geceleri gökyüzünde parlayan parlak göktaşı izi veya kuyruklu yıldız", answer: "GÖKTAŞI" },
  { letter: "G", question: "Boyna takılan, düğüm atılarak bağlanan klasik erkek giyim aksesuarı", answer: "GRAVAT" },
  { letter: "G", question: "Dikenli yaprakları olan, kırmızı veya beyaz açan güzel kokulu çiçek", answer: "GÜL" },
  { letter: "G", question: "Yerin altında derin çatlaklardan fışkıran sıcak su kaynağı", answer: "GAYZER" },

  // H Harfi
  { letter: "H", question: "Uçak ve helikopterlerin iniş kalkış yaptığı geniş pistli tesis", answer: "HAVALİMANI" },
  { letter: "H", question: "Duvara veya yere serilen, yün ya da ipekten dokunmuş desenli yaygı", answer: "HALI" },
  { letter: "H", question: "Haftanın son iş günü olan, tatilden önceki gün", answer: "CUMA" },

  // I Harfi
  { letter: "I", question: "Deniz veya nehir kenarlarındaki kumluk ya da çakıllık kıyı şeridi", answer: "ILICA" },
  { letter: "I", question: "Ağaç gövdesini veya kalın dalları kesmekte kullanılan iki saplı büyük bıçkı", answer: "IZGARA" },

  // İ Harfi
  { letter: "İ", question: "Gemilerin güvenle yanaşıp bağlandığı ahşap ya da beton kıyı uzantısı", answer: "İSKELE" },
  { letter: "İ", question: "Deniz diplerinde istiridyelerin içinde oluşan değerli parlak sedef tanesi", answer: "İNCİ" },
  { letter: "İ", question: "İpek böceğinin kozasından elde edilen parlak ve yumuşak kıymetli kumaş", answer: "İPEK" },

  // K Harfi
  { letter: "K", question: "Göz kapaklarının kenarında dizili duran koruyucu ince kıllar", answer: "KİRPİK" },
  { letter: "K", question: "Çorba içmeye ve yemek servisi yapmaya yarayan uzun saplı derin metal kaşık", answer: "KEPÇE" },
  { letter: "K", question: "İki yakayı birbirine bağlayan nehir veya deniz üstündeki geçit yapısı", answer: "KÖPRÜ" },
  { letter: "K", question: "Kırmızı renkte, ortasında sert çekirdeği olan nefis yaz meyvesi", answer: "KİRAZ" },

  // L Harfi
  { letter: "L", question: "İlkbaharda laleler açtığında parkları süsleyen geleneksel soğanlı çiçek", answer: "LALE" },
  { letter: "L", question: "Tıbbi tahlillerin ve bilimsel deneylerin yapıldığı donanımlı araştırma odası", answer: "LABORATUVAR" },

  // M Harfi
  { letter: "M", question: "Meyve bahçelerinde yetişen, turuncu renkli tatlı kış narenciyesi", answer: "MANDALİNA" },
  { letter: "M", question: "Yüksek binalarda katlar arasında inip çıkmaya yarayan basamaklar", answer: "MERDİVEN" },

  // N Harfi
  { letter: "N", question: "Doktorların bileğe dokunarak kalp atışını kontrol ettiği ritmik atım", answer: "NABIZ" },
  { letter: "N", question: "Çorbalara ve cacığa serpiştirilen ferahlatıcı kokulu yeşil baharat yaprağı", answer: "NANE" },

  // O Harfi
  { letter: "O", question: "Gözün hemen ortasındaki ışığa göre büyüyüp küçülen siyah açıklık", answer: "ODAK" },
  { letter: "O", question: "Yılın onuncu ayı olan, sonbahar ayı", answer: "EKİM" },

  // Ö Harfi
  { letter: "Ö", question: "Suda vak vak diyerek yüzen perdeli ayaklı sevimli su kuşu", answer: "ÖRDEK" },
  { letter: "Ö", question: "Geleceğe dair tahmin yapma, önceden görme yeteneği", answer: "ÖNGÖRÜ" },
  { letter: "Ö", question: "Bir kimsenin veya topluluğun sahip olduğu tam bağımsızlık durumu", answer: "ÖZGÜRLÜK" },

  // P Harfi
  { letter: "P", question: "Gemi veya uçakların rotasını belirleyen kaptan ve uçuş yöneticisi", answer: "PİLOT" },
  { letter: "P", question: "Denizlerde ve okyanuslarda yaşayan zeki memeli yüzücü", answer: "YUNUS" },

  // R Harfi
  { letter: "R", question: "Gemilerin yönünü belirlemeye yarayan arka dümen palası", answer: "ROTA" },
  { letter: "R", question: "Radyo dalgalarıyla çalışan, havadaki uçakları ve fırtınaları tespit eden sistem", answer: "RADAR" },
  { letter: "R", question: "Havadaki basınç farkından kaynaklanan hava akımı, esinti", answer: "RÜZGAR" },

  // S Harfi
  { letter: "S", question: "Güneş ışığını enerjiye dönüştüren çatılardaki elektrik paneli", answer: "SOLAR" },
  { letter: "S", question: "Bir metreyi yüze bölen temel uzunluk ölçü birimi", answer: "SANTİMETRE" },

  // Ş Harfi
  { letter: "Ş", question: "Yüksekten köpürerek dökülen büyüleyici doğal su çağlayanı", answer: "ŞELALE" },
  { letter: "Ş", question: "Gözleri güneşten korumak için başa takılan siperlikli başlık", answer: "ŞAPKA" },
  { letter: "Ş", question: "Duyguları ve güzellikleri ahenkli mısralarla anlatan edebi tür", answer: "ŞİİR" },

  // T Harfi
  { letter: "T", question: "Tarlayı sürmeye ve çiftlik işlerinde römork çekmeye yarayan güçlü motorlu araç", answer: "TRAKTÖR" },
  { letter: "T", question: "Uzaktaki gök cisimlerini ve yıldızları incelemeye yarayan astronomik cihaz", answer: "TELESKOP" },

  // U Harfi
  { letter: "U", question: "Dünya atmosferi dışında kalan, gezegen ve yıldızların bulunduğu sonsuz boşluk", answer: "UZAY" },
  { letter: "U", question: "Uzayda araştırmalar yapan, uzay giysisi giyen cesur astronot", answer: "UZAY ADAMI" },

  // V Harfi
  { letter: "V", question: "Altışar kişilik iki takımın file üzerinden topla oynadığı spor", answer: "VOLEYBOL" },
  { letter: "V", question: "İki dağ arasındaki uzun ve derin doğal çöküntü, akarsu yatağı", answer: "VADİ" },
  { letter: "V", question: "Vücuttaki organların uyumlu çalışması için besinlerden alınan organik bileşik", answer: "VİTAMİN" },

  // Y Harfi
  { letter: "Y", question: "Bulutlardan yeryüzüne su damlacıkları halinde düşen bereketli yağış", answer: "YAĞMUR" },
  { letter: "Y", question: "Rüzgar gücüyle denizde hızla yol alan üçgen veya dörtgen yelkenli tekne", answer: "YAT" },

  // Z Harfi
  { letter: "Z", question: "Akdeniz bölgesinde yetişen, kahvaltıda yenen veya yağı çıkarılan kutsal meyve", answer: "ZEYTİN" },
  { letter: "Z", question: "Dağların en yüksek noktası, doruk tepesi", answer: "ZİRVE" }
];

// PASSAPAROLA_QUESTIONS_DB sonuna EXTRA_QUESTIONS'ı enjekte et
const dbEndRegex = /export const PASSAPAROLA_QUESTIONS_DB = \[([\s\S]*?)\];/;
const dbMatch = dbEndRegex.exec(passaContent);
if (dbMatch) {
  const currentDbItems = dbMatch[1].trim();
  const extraFormatted = EXTRA_QUESTIONS.map(q => 
    `  { letter: '${q.letter}', question: "${q.question}", answer: '${q.answer}' }`
  ).join(',\n');
  
  const updatedDb = `export const PASSAPAROLA_QUESTIONS_DB = [\n${currentDbItems},\n\n  // EKSTRA GELİŞMİŞ HAVUZ (Madde 10)\n${extraFormatted}\n];`;
  passaContent = passaContent.replace(dbEndRegex, updatedDb);
  console.log('✓ Soru havuzu genişletildi.');
}

// 2. QuestionGenerator Sınıfını Yenile
const newQuestionEngine = `class QuestionGenerator {
  constructor(adultDB, kidsDB) {
    this.adultDB = adultDB;
    this.kidsDB = kidsDB;
    this.usedGlobalQuestions = new Set();
  }

  // Takım için benzersiz 24 harflik soru destesi üret (Takımlar ASLA aynı soruyu görmez)
  generateDeckForTeam(teamId, categoryMode = 'adult') {
    const deck = {};
    const db = categoryMode === 'kids' ? this.kidsDB : this.adultDB;

    PASSAPAROLA_LETTERS.forEach(letter => {
      const candidates = db.filter(q => q.letter === letter);
      const available = candidates.filter(q => !this.usedGlobalQuestions.has(q.question));

      let chosen;
      if (available.length > 0) {
        chosen = available[Math.floor(Math.random() * available.length)];
      } else if (candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        chosen = {
          letter,
          question: letter + ' harfi ile başlayan kavramı söyleyiniz.',
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
    
    // 1. Önce Local Ollama Yapay Zeka Servisini Dene (2.2s zaman aşımı)
    try {
      const aiResult = await this.fetchFromLocalOllama(letter, categoryMode);
      if (aiResult && aiResult.question && aiResult.answer) {
        this.usedGlobalQuestions.add(aiResult.question);
        return aiResult;
      }
    } catch (e) {}

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
      question: letter + ' harfi ile başlayan sözcük',
      answer: letter
    };
  }

  async fetchFromLocalOllama(letter, categoryMode = 'adult') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    const prompt = 'Sen popüler Türk televizyon yarışması Passaparola\\'nın soru yazarısın. Lütfen ' + letter + ' harfi ile başlayan ve doğru cevabı tam olarak ' + letter + ' harfiyle başlayan 1 adet ' + (categoryMode === 'kids' ? 'çocuklara uygun' : 'genel kültür') + ' sorusu üret. Yalnızca JSON formatında yanıt ver: {"letter": "' + letter + '", "question": "...", "answer": "..."}';

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
}`;

passaContent = passaContent.replace(/class QuestionGenerator\s*\{[\s\S]*?\n\}/, newQuestionEngine);

// 3. PassaparolaEngine İçinde Takım Sırası ve AI Butonunu Bağla
const engineEnhancements = `
  // =========================================================================
  // TAKIM SIRALI YARIŞMA VE DİNAMİK AI SORU YÖNETİMİ (Madde 10)
  // =========================================================================
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
      lbl.textContent = activePlayer.avatar + ' ' + activePlayer.name;
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
      titleEl.innerHTML = reason + '<br><span style="font-size:1.15rem; color:#FFF; font-weight:800;">' + (activePlayer.avatar || '🦁') + ' ' + activePlayer.name + ' Turu Tamamladı!</span>';
    }
    if (scoreEl) scoreEl.textContent = (activePlayer.score || 0) + ' Puan';
    if (correctEl) correctEl.textContent = activePlayer.correct || 0;
    if (wrongEl) wrongEl.textContent = activePlayer.wrong || 0;
    if (rateEl) {
      const answered = (activePlayer.correct || 0) + (activePlayer.wrong || 0);
      const rate = answered > 0 ? Math.round(((activePlayer.correct || 0) / answered) * 100) : 0;
      rateEl.textContent = '%' + rate;
    }

    let btnNextTeam = document.getElementById('btn-passa-next-team-turn');
    if (!btnNextTeam) {
      btnNextTeam = document.createElement('button');
      btnNextTeam.id = 'btn-passa-next-team-turn';
      btnNextTeam.className = 'btn-main primary';
      btnNextTeam.style.cssText = 'font-size:1.05rem; font-weight:900; padding:14px; width:100%; border-radius:14px; margin-bottom:10px; box-shadow:0 0 25px rgba(0,245,212,0.4); border:none; cursor:pointer;';
      const restartBtn = document.getElementById('btn-passa-restart');
      if (restartBtn && restartBtn.parentElement) {
        restartBtn.parentElement.insertBefore(btnNextTeam, restartBtn);
      }
    }

    if (hasNextTeam) {
      const nextPlayer = this.players[this.activePlayerIndex + 1];
      btnNextTeam.style.display = 'block';
      btnNextTeam.innerHTML = '👉 Sıradaki Takım: ' + (nextPlayer.avatar || '🦊') + ' ' + nextPlayer.name + ' (Farklı Sorularla Başla!)';
      btnNextTeam.onclick = () => {
        sounds.playClick();
        this.startTeamTurn(this.activePlayerIndex + 1);
      };
    } else {
      btnNextTeam.style.display = 'none';
      if (titleEl) {
        const sorted = [...this.players].sort((a,b) => (b.score || 0) - (a.score || 0));
        const champion = sorted[0];
        titleEl.innerHTML = '🏆 Tüm Takımların Yarışması Bitti!<br><span style="font-size:1.15rem; color:var(--gold);">👑 Şampiyon: ' + champion.avatar + ' ' + champion.name + ' (' + champion.score + ' Puan)</span>';
      }
    }
  }

  async changeCurrentQuestionWithAI() {
    sounds.playClick();
    const curLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    const qTextEl = document.getElementById('passa-question-text');
    if (qTextEl) qTextEl.innerHTML = '🤖 <em style="color:#00F5D4;">Yapay zeka yepyeni soru getiriyor...</em>';

    try {
      const newQ = await this.questionGenerator.getDynamicOrAIQuestion(curLetter, this.categoryMode);
      this.currentQuestions[curLetter] = newQ;
      this.loadQuestionForCurrent();
      if (this.game && this.game.showToast) {
        this.game.showToast('✨ ' + curLetter + ' harfi için yepyeni soru yüklendi!');
      }
    } catch (e) {
      this.loadQuestionForCurrent();
    }
  }
`;

passaContent = passaContent.replace(/startGame\(\)\s*\{[\s\S]*?this\.syncRoomState\(\);\s*\}/, `startGame() {
    this.startTeamTurn(0);
  }
${engineEnhancements}`);

passaContent = passaContent.replace(/this\.finishGame\(/g, 'this.finishTeamTurn(');

const aiBindStr = `
    // AI Yeni Soru Değiştirme Butonu (Madde 10)
    const btnAi = document.getElementById('btn-passa-ai-question');
    if (btnAi) {
      btnAi.onclick = () => this.changeCurrentQuestionWithAI();
    }
`;
passaContent = passaContent.replace(/const btnNewQuestion = document\.getElementById\('btn-new-question'\);[\s\S]*?\}\s*\}/, aiBindStr);

fs.writeFileSync(passaPath, passaContent, 'utf8');
console.log('✓ js/passaparola-game.js güncellendi.');

// 4. index.html İçine "Başka Soru Getir (AI / Yeni Soru)" Butonunu Ekle
const targetDiv = `<p id="passa-question-text" style="font-size:0.98rem; font-weight:800; color:#FFF; line-height:1.45; margin:0;">Soru yükleniyor...</p>
      </div>`;

const aiButtonHtml = `<p id="passa-question-text" style="font-size:0.98rem; font-weight:800; color:#FFF; line-height:1.45; margin:0;">Soru yükleniyor...</p>
      </div>

      <!-- YAPAY ZEKA DESTEKLİ ANLIK YENİ SORU GETİR BUTONU (Madde 10) -->
      <div style="display:flex; justify-content:flex-end; margin-bottom:8px;">
        <button type="button" id="btn-passa-ai-question" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:5px 12px; border-radius:999px; background:rgba(0,245,212,0.12); border:1px solid var(--primary); color:#00F5D4; display:flex; align-items:center; gap:5px; cursor:pointer;">
          <span>🤖</span> <span>Başka Soru Getir (Yapay Zeka / Yeni Soru)</span>
        </button>
      </div>`;

if (indexContent.includes(targetDiv) && !indexContent.includes('btn-passa-ai-question')) {
  indexContent = indexContent.replace(targetDiv, aiButtonHtml);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✓ index.html dosyasına AI Soru Butonu eklendi.');
} else {
  console.log('! index.html zaten güncel veya hedef blok bulunamadı.');
}

console.log('🎉 Madde 10 başarıyla tamamlandı!');
