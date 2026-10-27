// js/bottle-game.js
// Kafana Tak! - Şişe Çevirmece: Doğruluk mu Cesaret mi? Parti Oyunu Motoru

import { sounds } from './audio.js';

export const TRUTH_QUESTIONS_PARTY = [
  "Masadakilerden birinin en garip bulduğun huyu nedir?",
  "Hayatında yaptığın ve hatırladıkça yüzünü kızartan en utanç verici an neydi?",
  "Buradaki insanlardan hangisiyle ıssız bir adada mahsur kalmak isterdin?",
  "Ailenin asla bilmesini istemediğin en büyük sırrın nedir?",
  "Son 1 ay içinde söylediğin en büyük yalan neydi?",
  "Hiç birine aşıkmış veya çok seviyormuş gibi davranıp numara yaptın mı?",
  "Telefonundaki arama geçmişinin son 3 maddesi nedir? (Dürüstçe oku)",
  "İlk görüşte aşka inanır mısın, bunu masadaki biri için hiç hissettin mi?",
  "Bu masada giyim tarzını en çok ve en az beğendiğin kişi kim?",
  "Hiç bir arkadaşının telefonunu, günlüğünü veya mesajlarını gizlice karıştırdın mı?",
  "Tamamen görünmez olsaydın ilk 1 saat içinde yapacağın yaramazlık ne olurdu?",
  "Çocukken inandığın en saçma ya da komik batıl inanç neydi?",
  "En son ne zaman, nerede ve neden hüngür hüngür ağladın?",
  "Masadakilerden biriyle 1 günlüğüne hayatını değiştirecek olsan kimin hayatını seçerdin?",
  "Hiç yakın bir arkadaşının sevgilisinden veya flörtünden gizlice hoşlandın mı?",
  "Bu grupta en güvendiğin kişi kim, en az sır vereceğin kim?",
  "Sosyal medyada sahte (fake) hesap açıp kimi gizlice stalkladın?",
  "Kendinde değiştirmek istediğin en büyük fiziksel veya kişisel özellik nedir?",
  "Hiç restoranda veya kafede hesabı ödememek için bahane uydurdun mu?",
  "Hayatında aldığın en kötü hediye neydi ve onu ne yaptın?",
  "Tinder veya arkadaşlık uygulaması kullandın mı? Yaşadığın en tuhaf buluşma neydi?",
  "Sence masadaki en zeki kişi kim ve en saf/temiz kalpli kim?",
  "Hiç banyoda şarkı söylerken veya dans ederken birine yakalandın mı?",
  "Bugüne kadar yaptığın en büyük para israfı neydi?",
  "Burada bulunanlardan hangisinin gardırobunu komple çöpe atmak isterdin?",
  "En uzun süre kaç gün duş almadan veya dişlerini fırçalamadan durdun?",
  "Eski sevgilini son 3 ay içinde stalkladın mı?",
  "Hiç yere düşen bir yiyeceği 5 saniye kuralı deyip gizlice yedin mi?",
  "Hayatında dinlemekten utandığın ama gizli gizli bayıldığın o şarkı hangisi?",
  "Seni bu masada en çok ne sinirlendirir veya güldürür?",
  "Hiç bir buluşmadan kaçmak için acil durum yalanı uydurdun mu?",
  "Küçükken hayali bir arkadaşın veya çok garip bir takıntın var mıydı?",
  "Bugüne kadar başına gelen en büyük polis, zabıta veya güvenlik maceran nedir?",
  "Masada bulunan biriyle ortak bir iş kursan kimi ortak alırdın, kimi asla almazdın?",
  "Eğer yarın sabah dünyaca ünlü biri olarak uyansaydın kim olmak isterdin?",
  "Grupta en çok kimin dedikodusunu yaptın veya hakkında konuştun?",
  "Hiç birinin arkasından konuşurken o kişinin tam arkanda durduğunu fark ettin mi?",
  "Aynaya baktığında kendine en çok hangi iltifatı edersin?",
  "Hayatındaki en büyük 'keşke yapmasaydım' dediğin pişmanlık nedir?",
  "Telefonundaki galeride en son çektiğin ekran görüntüsü neyle ilgili?",
  "Hiç kopya çekerken veya yasak bir şey yaparken yakalandın mı?",
  "Karanlıktan, böcekten veya doğaüstü şeylerden hala korkuyor musun?",
  "Masadaki kişilerden birine 10 üzerinden puan versen kime kaç puan verirdin?",
  "Sosyal medyada beğeni almak için hiç yapmacık bir poz veya hikaye attın mı?",
  "Hiç tanımadığın birinin düğününe veya partisine kaynadın mı?",
  "Bugüne kadar yediğin en iğrenç şey neydi?",
  "Telefonunu 5 dakika masadaki birine teslim et desen kime güvenle verirdin?",
  "Kendini üç kelimeyle tanımla ama sadece olumsuz huylarını söyle!",
  "Grupta kimin tarzını en havalı buluyorsun?",
  "Çocukken anne-babana yakalandığın en büyük kabahat neydi?",
  "Piyangodan 50 milyon TL çıksa bu masadan kime tek kuruş koklatmazdın?",
  "Hiç birinin kıyafetine bilerek çay, kahve veya sos döktün mü?",
  "Hangi ünlüyle bir akşam yemeği yemek için ruhunu satardın?",
  "İçinde kimsenin bilmediği gizli bir yeteneğin var mı?",
  "Sence bu masada ilk kim evlenir veya kim müzmin bekar kalır?"
];

export const DARE_CHALLENGES_PARTY = [
  "Masadaki herkesin önünde en sevdiğin şarkıyı hızlı rap tarzında söyle!",
  "Telefonundan rehberindeki rastgele birine 'Bana acil 100 TL borç verir misin?' mesajı at ve gelen cevabı bekle!",
  "1 dakika boyunca sesini robot gibi yaparak konuş!",
  "Masadakilerden birine gözlerinin içine bakarak 30 saniye boyunca hiç durmadan iltifat et!",
  "Ayağa kalk ve en çılgın dans figürünü 20 saniye sergile!",
  "Masadaki birinin ayakkabısını parfümmüş gibi koklayıp gurme yorumu yap!",
  "Sonraki 2 tur boyunca konuşurken her cümlenin sonuna 'Efendim hazretleri' ekle!",
  "15 saniye boyunca hiç gözünü kırpmadan karşındaki kişiye dik dik bak!",
  "Bebek gibi emekleyerek masanın etrafında tam bir tur at!",
  "WhatsApp veya Instagram durumuna komik bir selfie koy ve 5 dakika silme!",
  "Masadakilerden biriyle bilek güreşi yap!",
  "Sanki bir haber spikeriymişsin gibi son dakika deprem veya hava durumu bülteni sun!",
  "En sevdiğin hayvanın sesini ve hareketlerini 15 saniye boyunca canlandır!",
  "Ağzına bir yudum su al ve masadakiler seni güldürmeye çalışırken 20 saniye tut!",
  "Masadaki herkesin saçını veya omzunu tek tek nazikçe okşa!",
  "Telefonunu aç ve galerindeki 7. fotoğrafı masadaki herkese göster!",
  "Gözlerini kapa ve masadaki birinin elini tutarak kim olduğunu dokunarak tahmin et!",
  "Ayağa kalkıp podyumda yürüyen bir top model gibi havalı bir manken yürüyüşü yap!",
  "Masadaki en sessiz kişiye sarıl ve kulağına 'Sen benim kahramanamsın' de!",
  "1 dakika boyunca ellerini hiç kullanmadan bir şey anlatmaya çalış!",
  "Gözlerini devirerek ve aşırı şımarık bir zengin gibi davranarak sipariş ver!",
  "Cebindeki veya çantandaki en tuhaf eşyayı çıkar ve onu masadakilere pazarlamaya çalış!",
  "Masadaki birinin taklidini yap, kim olduğunu diğerleri tahmin etsin!",
  "Aynanın karşısına geç ve 30 saniye boyunca kendine hayran hayran iltifatlar yağdır!",
  "Tek ayak üzerinde durarak İstiklal Marşı'nın ilk iki kıtasını veya bildiğin bir şiiri oku!",
  "WhatsApp'taki son konuştuğun kişiye sadece bir '🤔' emojisi at ve cevap gelene kadar bir şey yazma!",
  "Masadaki kişilerden birinin ayakkabı bağcıklarını bağla veya çorabını düzelt!",
  "Sanki bir opera sanatçısıymışsın gibi masadaki birine opera tarzında 'Bana su verir misin?' diye şarkı söyle!",
  "Masadaki birinin burnuna burnunla hafifçe dokun (Eskimo selamı)!",
  "Telefonun sesli asistanını (Siri veya Google) aç ve ona 'Ben dünyanın en güzel insanı mıyım?' diye sor!",
  "10 saniye boyunca kahkahalarla çılgın bir kötü adam gibi gül!",
  "Yere yatıp 5 şınav veya 10 mekik çek!",
  "Masadaki kişilerden birine kraliyet ailesi mensubu gibi eğilerek reverans yap!",
  "Sol elini kullanarak (solaksan sağ) masadaki birinin portresini 30 saniyede çiz!",
  "Masadaki birinin telefon kilidini açıp sadece son dinlediği şarkıya bakmasına izin ver!",
  "Gözlerini bağla veya kapat, masadakilerin uzattığı bir nesneyi koklayarak bil!",
  "30 saniye boyunca tavuk gibi gıdaklayarak kanat çırp!",
  "Masadaki birine sanki 40 yıldır görmediğin asker arkadaşınmış gibi sarıl!",
  "Telefonundan en son aradığın kişiyi hoparlöre al ve 'Seni çok seviyorum bay bay' deyip kapat!",
  "Masadakilerden birinin ceketini veya şapkasını ters giy ve sonraki tura kadar çıkarma!",
  "Masadaki herkesin el falına bakıyormuş gibi uydurma kehanetlerde bulun!",
  "Kendi etrafında 7 tur dön ve sonra düz bir çizgide yürümeye çalış!",
  "Masadakilerden birine sanki ona evlenme teklifi ediyormuş gibi diz çök ve romantik konuş!",
  "1 dakika boyunca sadece fısıltıyla konuş!",
  "Bir dilim limon ye veya biraz tuz yala ve yüzünü hiç ekşitmemeye çalış!",
  "Masadaki herkesin favori bir özelliğini tek tek sırala!",
  "En sevmediğin yiyeceğin ne kadar lezzetli olduğunu anlatan 30 saniyelik bir reklam yap!",
  "Dilsiz taklidi yaparak masadakilere 'Karnım çok aç' cümlesini sessiz sinema gibi anlat!",
  "Masadaki en uzun boylu kişiyle en kısa boylu kişiyi sırt sırta verdir!",
  "Çılgın bir profesör gibi davranarak zamanda yolculuğu bulduğunu iddia et!"
];

export const TRUTH_QUESTIONS_ADULT = [
  "En son ne zaman ve nerede cüretkar veya heyecan dolu bir kaçamak yaşadın?",
  "Aklından hiç çıkaramadığın en çılgın fantezin nedir?",
  "Bu masadaki birinden hiç gizlice etkilendin mi ya da rüyanda gördün mü?",
  "Tek gecelik bir ilişki yaşadın mı, sonrasında ne hissettin?",
  "Telefonunda sadece senin veya partnerinin görebileceği kilitli/gizli fotoğraflar var mı?",
  "Vücudunda kendine en çok güvendiğin ve karşı cinsin en beğendiği yer neresi?",
  "Hiç uygunsuz veya riskli bir yerde öpüştün mü (asansör, sinema salonu, araba)?",
  "İlk öpücüğün nasıldı, kimeydi ve puanın 10 üzerinden kaçtı?",
  "Cüretkar ve ateşli bir mesaj (sexting) attığın en son kişi kimdi?",
  "Bir ilişkide asla affetmeyeceğin kırmızı çizgin nedir?",
  "Masadakilerden biriyle baş başa romantik bir akşam yemeğine çıkmak zorunda kalsan kimi seçerdin?",
  "Aşk mı yoksa tensel çekim mi senin için daha ön plandadır?",
  "Hiç sevgilini aldattın mı veya aldatılma şüphesiyle telefon karıştırdın mı?",
  "Karşı cinste ilk dikkat ettiğin fiziksel detay nedir?",
  "Bir randevuda yaşadığın en utanç verici veya komik cinsel/romantik aksilik neydi?",
  "Eski sevgililerinden biriyle tek bir gece geçirme şansın olsa hangisini seçerdin?",
  "Hiç arkadaşının eski sevgilisiyle flört ettin mi?",
  "Romantizmde ipleri elinde tutmayı mı yoksa teslim olmayı mı seversin?",
  "Bugüne kadar aldığın en ateşli iltifat neydi?",
  "Masadakilerden hangisinin flört enerjisi ve aurası sence en yüksek?",
  "Hiç yaşça senden çok büyük veya çok küçük biriyle flört ettin mi?",
  "Aşk hayatında yaptığın en çılgınca veya en cesur hareket neydi?",
  "Hiç bir partide tanımadığın biriyle aniden öpüştün mü?",
  "Partnerinde seni anında soğutan en büyük turn-off nedir?",
  "Sence mükemmel bir öpücüğün sırrı nedir?",
  "Hiç sarhoşken eski sevgiline veya flörtüne itiraf mesajı attın mı?",
  "Sence bu masada en romantik olan kim ve en çapkın olan kim?",
  "Göz temasından etkilendiğin ve kalbini çarptıran biri oldu mu?",
  "Hiç 'arkadaş kalalım' deyip sonradan flörte dönen bir ilişkin oldu mu?",
  "Romantik bir buluşmada karşı tarafın yaptığı en berbat hareket neydi?",
  "Hiç birden fazla kişiyle aynı dönemde flört ettin mi?",
  "Ten uyumuna inanır mısın, bunu hiç ilk dokunuşta hissettin mi?",
  "Gizli bir platonik aşkın var mı, şu an bu ortamda mı?",
  "Hiç mesajlaşırken yanlışlıkla anne-babanın grubuna romantik bir mesaj gönderdin mi?",
  "Karşı cinste seni en çok cezbeden koku veya parfüm türü nedir?",
  "Hiç reddedilme korkusu yüzünden birine açılamadığın oldu mu?",
  "İlişkide kıskanç mısındır, en kıskançça yaptığın hareket neydi?",
  "Hiç birine sadece inat olsun diye flört ettin mi?",
  "Ateşli bir gecenin olmazsa olmaz müziği veya ortamı sence nasıl olmalı?",
  "Bu masadaki birinin dudaklarını veya gözlerini övmek zorunda kalsan kimi seçerdin?"
];

export const DARE_CHALLENGES_ADULT = [
  "Masadaki karşı cinsten birinin kulağına en baştan çıkarıcı fısıltını yap!",
  "Karşındaki kişinin omzuna veya boynuna 15 saniye hafif ve rahatlatıcı bir masaj yap!",
  "En çekici bakışını atarak masadakilerden birine göz kırp ve gülümse!",
  "Masadaki birinin elini tut ve gözlerinin içine bakarak 30 saniye boyunca hiç bırakma!",
  "Telefonundaki en son romantik veya flörtöz mesajı isim vermeden sesli oku!",
  "Gözlerini kapat, masadan biri elini veya yanağını öpsün ve kim olduğunu tahmin et!",
  "15 saniye boyunca baştan çıkarıcı ve ritmik bir dans figürü sergile!",
  "Masadaki birinin saçlarını parmaklarınla düzelt ve ona çok yakıştığını fısılda!",
  "Masadakilerden birine baştan aşağı büyüleyici bir iltifat cümlesi kur!",
  "Karşındaki kişiyle 20 saniye boyunca hiç konuşmadan derin derin göz teması kur!",
  "Masadaki birinin bileğine veya elinin üstüne kibar bir öpücük kondur!",
  "En romantik şarkıyı mırıldanarak masadaki birini 10 saniye yavaş dansa kaldır!",
  "Telefonunu aç ve masadakilere en çekici bulduğun kendi fotoğrafını göster!",
  "Masadaki karşı cinsten birine 'Bugün gerçekten gözlerimi senden alamıyorum' de!",
  "Bir parça çikolata veya meyveyi ellerini kullanmadan masadaki birine yedir!",
  "Masadaki birinin parfümünü boynundan veya bileğinden koklayıp not ver!",
  "Partnerine veya hoşlandığın kişiye telefondan 'Şu an aklımdasın ve seni düşünüyorum...' mesajı at!",
  "Gözlerini kapa ve masadaki birinin sana fısıldadığı kelimeyi sadece dudak kıpırtısından anla!",
  "Masadaki birinin ceketini veya hırkasını ona centilmence giydir ya da çıkar!",
  "Masadakilerden birinin dizine elini koy ve 20 saniye boyunca öyle otur!",
  "En etkileyici ses tonunla masadakilerden birine aşk şiiri oku!",
  "Karşındaki kişinin çenesini hafifçe kaldırıp gözlerinin içine gülümse!",
  "Masadaki birinin avucunun içine parmağınla gizli bir harf çiz, tahmin etsin!",
  "Sonraki tura kadar masadaki birine 'tatlım' veya 'canım' diye hitap et!",
  "Masadakilerden birinin tarzını Fransız bir modacı gibi baştan çıkarıcı yorumla!",
  "Karşındaki kişinin kulağına çok gizli bir sırrını fısılda (masadakiler duymasın)!",
  "Masadaki birinin dudak parlatıcısını veya parfümünü dene!",
  "Romantik bir film sahnesindeki repliği masadaki birine karşı canlandır!",
  "Masadakilerden biriyle tango veya vals adımı atar gibi 15 saniye dön!",
  "Telefonundaki rehberden hoşlandığın birinin adını göster (aramak yok)!"
];

/**
 * Tekrarsız, Fisher-Yates karıştırmalı soru ve görev destesi yöneticisi.
 * Havuz bitene kadar hiçbir soru veya görev tekrarlanmaz.
 */
class NonRepeatingDeck {
  constructor(items) {
    this.originalItems = [...items];
    this.deck = [];
    this.lastDrawn = null;
    this.reshuffle();
  }

  reshuffle() {
    this.deck = [...this.originalItems];
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    // Son çekilen ile yeni destenin ilk elemanının aynı olmasını engelle
    if (this.deck.length > 1 && this.deck[this.deck.length - 1] === this.lastDrawn) {
      const swapIdx = Math.floor(Math.random() * (this.deck.length - 1));
      [this.deck[this.deck.length - 1], this.deck[swapIdx]] = [this.deck[swapIdx], this.deck[this.deck.length - 1]];
    }
  }

  draw() {
    if (this.deck.length === 0) {
      this.reshuffle();
    }
    const item = this.deck.pop();
    this.lastDrawn = item;
    return item;
  }
}

export class BottleGameEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'party'; // party or adult
    this.rotation = 0;
    this.isSpinning = false;
    this.currentCardType = null; // 'truth' or 'dare'

    // Her kategori için bağımsız tekrarsız deste oluşturulur
    this.decks = {
      partyTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_PARTY),
      partyDare: new NonRepeatingDeck(DARE_CHALLENGES_PARTY),
      adultTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_ADULT),
      adultDare: new NonRepeatingDeck(DARE_CHALLENGES_ADULT)
    };
  }

  setMode(mode) {
    this.mode = mode;
    this.renderScreen();
  }

  spinBottle() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    sounds.playWheelTick();

    const minRotations = 5;
    const maxRotations = 9;
    const randomExtra = Math.floor(Math.random() * 360);
    const totalSpin = (minRotations + Math.floor(Math.random() * (maxRotations - minRotations))) * 360 + randomExtra;

    this.rotation += totalSpin;

    const bottle = document.getElementById('spinning-bottle-img');
    if (bottle) {
      bottle.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.9, 0.3, 1)';
      bottle.style.transform = `rotate(${this.rotation}deg)`;
    }

    setTimeout(() => {
      this.isSpinning = false;
      sounds.playBell();
      this.promptTruthOrDare();
    }, 3600);
  }

  promptTruthOrDare() {
    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    actionArea.innerHTML = `
      <div style="background:rgba(0,0,0,0.65); border:1.5px solid rgba(255,46,147,0.5); border-radius:18px; padding:18px; animation:popIn 0.3s ease;">
        <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:6px;">ŞİŞE DURDU! 👉 KİME GELDİYSE SEÇSİN:</div>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px;">Cesaretin var mı, yoksa itiraf mı edeceksin?</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button type="button" id="btn-choose-truth" class="btn-main" style="flex:1; background:linear-gradient(135deg, #00F5D4, #00ba9f); color:#0B0E14; font-size:1.05rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🤔 DOĞRULUK
          </button>
          <button type="button" id="btn-choose-dare" class="btn-main" style="flex:1; background:linear-gradient(135deg, #FF2E93, #7928CA); color:#FFF; font-size:1.05rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🔥 CESARET
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-choose-truth').addEventListener('click', () => this.showCard('truth'));
    document.getElementById('btn-choose-dare').addEventListener('click', () => this.showCard('dare'));
  }

  getNextItem(type) {
    const deckKey = `${this.mode}${type === 'truth' ? 'Truth' : 'Dare'}`;
    const deck = this.decks[deckKey];
    return deck ? deck.draw() : "Sorular tükenmedi, devam!";
  }

  showCard(type) {
    sounds.playClick();
    this.currentCardType = type;
    const text = this.getNextItem(type);

    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    const isTruth = type === 'truth';
    actionArea.innerHTML = `
      <div style="background:linear-gradient(135deg, ${isTruth ? '#064e3b, #0f172a' : '#450a0a, #0f172a'}); border:2px solid ${isTruth ? '#00F5D4' : '#FF2E93'}; border-radius:18px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); animation:popIn 0.3s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="background:${isTruth ? 'rgba(0,245,212,0.2)' : 'rgba(255,46,147,0.2)'}; color:${isTruth ? '#00F5D4' : '#FF2E93'}; font-size:0.78rem; font-weight:900; padding:4px 12px; border-radius:999px;">
            ${isTruth ? '🤔 DOĞRULUK İTİRAFI' : '🔥 CESARET GÖREVİ'}
          </span>
          <span style="font-size:0.75rem; color:rgba(255,255,255,0.6);">
            ${this.mode === 'adult' ? '🔞 +18 Modu' : '🎉 Parti Modu'}
          </span>
        </div>

        <div id="bottle-card-text" style="font-size:1.22rem; font-weight:900; color:#FFF; line-height:1.45; margin:16px 0 20px; min-height:64px; display:flex; align-items:center; justify-content:center;">
          "${text}"
        </div>

        <!-- Aksiyon Butonları -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" id="btn-spin-again" class="btn-main primary" style="font-size:1.05rem; padding:13px 24px; border-radius:999px; cursor:pointer; width:100%; box-shadow:0 6px 20px rgba(255,46,147,0.4);">
            🔄 Şişeyi Tekrar Çevir
          </button>
          <button type="button" id="btn-change-question" class="btn-secondary" style="font-size:0.85rem; padding:9px 18px; border-radius:999px; cursor:pointer; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF;">
            🔀 Başka ${isTruth ? 'Soru' : 'Görev'} Getir (Farklı Seçenek)
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-spin-again').addEventListener('click', () => {
      this.renderScreen();
      this.spinBottle();
    });

    document.getElementById('btn-change-question').addEventListener('click', () => {
      sounds.playClick();
      const newText = this.getNextItem(this.currentCardType);
      const textEl = document.getElementById('bottle-card-text');
      if (textEl) {
        textEl.style.animation = 'none';
        void textEl.offsetWidth; // reflow
        textEl.style.animation = 'popIn 0.25s ease';
        textEl.textContent = `"${newText}"`;
      }
    });
  }

  renderScreen() {
    const container = document.getElementById('bottle-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:460px; margin:0 auto; padding:20px;">
        <!-- Mod Seçici -->
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:14px;">
          <button type="button" id="btn-bottle-mode-party" class="filter-chip ${this.mode === 'party' ? 'active' : ''}" style="font-size:0.82rem; padding:7px 16px; border-radius:999px; cursor:pointer;">
            🎉 Parti Modu
          </button>
          <button type="button" id="btn-bottle-mode-adult" class="filter-chip ${this.mode === 'adult' ? 'active' : ''}" style="font-size:0.82rem; padding:7px 16px; border-radius:999px; cursor:pointer;">
            🔞 Yetişkinler (+18)
          </button>
        </div>

        <!-- 3D Dönen Şişe Sahnesi (Kusursuz Merkez Geometrisi) -->
        <div style="position:relative; width:260px; height:260px; margin:14px auto 20px; display:flex; align-items:center; justify-content:center;">
          <!-- Dış Halka -->
          <div style="position:absolute; width:260px; height:260px; border-radius:50%; border:2px dashed rgba(255,46,147,0.35); animation:spinSlow 25s linear infinite; pointer-events:none;"></div>
          <!-- İç Hedef Çemberi & Zemin Işıltısı -->
          <div style="position:absolute; width:200px; height:200px; border-radius:50%; border:1px solid rgba(0,245,212,0.25); background:radial-gradient(circle, rgba(255,46,147,0.12) 0%, rgba(0,0,0,0.6) 70%); pointer-events:none;"></div>
          <!-- Merkez Pivot Noktası -->
          <div style="position:absolute; width:10px; height:10px; border-radius:50%; background:var(--gold); box-shadow:0 0 12px var(--gold); z-index:2; pointer-events:none;"></div>

          <!-- Gerçekçi Dönen Şarap Şişesi -->
          <div id="spinning-bottle-img" style="position:absolute; width:65px; height:230px; transform-origin:50% 50%; cursor:pointer; z-index:5; transform:rotate(${this.rotation}deg); display:flex; align-items:center; justify-content:center;">
            <img src="assets/wine_bottle.webp" alt="Şişe" style="width:100%; height:100%; object-fit:contain; pointer-events:none; filter:drop-shadow(0 14px 25px rgba(0,0,0,0.85));" />
          </div>
        </div>

        <div id="bottle-action-area">
          <button type="button" id="btn-start-spin-bottle" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); font-size:1.15rem; font-weight:900; padding:15px; box-shadow:0 6px 25px rgba(255,46,147,0.4); border-radius:999px; width:100%; cursor:pointer;">
            🍾 ŞİŞEYİ ÇEVİR!
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-bottle-mode-party').addEventListener('click', () => this.setMode('party'));
    document.getElementById('btn-bottle-mode-adult').addEventListener('click', () => this.setMode('adult'));
    document.getElementById('btn-start-spin-bottle').addEventListener('click', () => this.spinBottle());
    document.getElementById('spinning-bottle-img').addEventListener('click', () => this.spinBottle());
  }
}
