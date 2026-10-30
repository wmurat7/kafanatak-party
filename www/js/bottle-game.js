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
    this.mode = 'party'; // 'party' | 'adult'
    this.isSpinning = false;
    this.currentCardType = null; // 'truth' | 'dare'
    this.selectedPlayer = null;

    // Oyuncu Listesi (Local Storage'da Saklanır)
    const saved = localStorage.getItem('kafanatak_dc_wheel_players');
    this.players = saved ? JSON.parse(saved) : ['Murat', 'Zeynep', 'Efe', 'Selin'];

    // Çark Görsel Durumu
    this.rotation = 0;
    this.spinAnimId = null;

    // Her kategori için tekrarsız deste yöneticisi
    this.decks = {
      partyTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_PARTY),
      partyDare: new NonRepeatingDeck(DARE_CHALLENGES_PARTY),
      adultTruth: new NonRepeatingDeck(TRUTH_QUESTIONS_ADULT),
      adultDare: new NonRepeatingDeck(DARE_CHALLENGES_ADULT)
    };
  }

  savePlayers() {
    try {
      localStorage.setItem('kafanatak_dc_wheel_players', JSON.stringify(this.players));
    } catch (e) {}
  }

  addPlayer(name) {
    const clean = (name || '').trim();
    if (!clean) return;
    if (this.players.length >= 12) {
      alert('En fazla 12 oyuncu ekleyebilirsiniz.');
      return;
    }
    this.players.push(clean);
    this.savePlayers();
    sounds.playClick();
    this.renderScreen();
  }

  removePlayer(idx) {
    if (this.players.length <= 2) {
      alert('En az 2 oyuncu olmalıdır.');
      return;
    }
    this.players.splice(idx, 1);
    this.savePlayers();
    sounds.playClick();
    this.renderScreen();
  }

  setMode(mode) {
    sounds.playClick();
    this.mode = mode;
    this.renderScreen();
  }

  init() {
    this.renderScreen();
  }

  renderScreen() {
    const container = document.getElementById('bottle-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:480px; margin:0 auto; padding:18px 14px;">
        <!-- Mod Seçici -->
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
          <button type="button" id="btn-bottle-mode-party" class="filter-chip ${this.mode === 'party' ? 'active' : ''}" style="font-size:0.82rem; padding:8px 18px; border-radius:999px; cursor:pointer;">
            🎉 Parti Modu
          </button>
          <button type="button" id="btn-bottle-mode-adult" class="filter-chip ${this.mode === 'adult' ? 'active' : ''}" style="font-size:0.82rem; padding:8px 18px; border-radius:999px; cursor:pointer;">
            🔞 Yetişkinler (+18)
          </button>
        </div>

        <!-- Oyuncu Ekleme & Yönetim Barı -->
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.1); border-radius:16px; padding:12px; margin-bottom:14px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.82rem; font-weight:800; color:var(--gold);">👥 ÇARKTAKİ OYUNCULAR (${this.players.length})</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">Min 2 - Max 12</span>
          </div>

          <!-- Oyuncu İsim Hapları -->
          <div id="dc-player-pills-list" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            ${this.players.map((p, idx) => `
              <span class="player-pill" style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); padding:5px 10px; border-radius:999px; font-size:0.82rem; font-weight:800; color:#FFF;">
                <span>👤 ${p}</span>
                ${this.players.length > 2 ? `<button type="button" class="btn-remove-dc-player" data-idx="${idx}" style="background:none; border:none; color:#EF4444; font-weight:900; cursor:pointer; font-size:0.85rem; padding:0 2px;">✕</button>` : ''}
              </span>
            `).join('')}
          </div>

          <!-- Hızlı Oyuncu Ekle Formu -->
          <div style="display:flex; gap:8px;">
            <input type="text" id="inp-add-dc-player" placeholder="Yeni oyuncu adı yazın..." maxlength="15" style="flex:1; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:10px; padding:8px 12px; color:#FFF; font-size:0.85rem; font-weight:700; outline:none;" />
            <button type="button" id="btn-add-dc-player" style="background:linear-gradient(135deg, #00F5D4, #0072FF); color:#0B0E14; border:none; border-radius:10px; padding:8px 14px; font-size:0.85rem; font-weight:900; cursor:pointer; white-space:nowrap;">
              + Ekle
            </button>
          </div>
        </div>

        <!-- 3D İSİMLİ DOĞRULUK / CESARET ÇARKI (Madde 9) -->
        <div style="position:relative; width:280px; height:280px; margin:0 auto 14px;">
          <!-- Çark İbresi -->
          <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); font-size:1.8rem; color:#FFD166; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8)); z-index:10; pointer-events:none;">
            🔻
          </div>
          
          <canvas id="dc-wheel-canvas" width="280" height="280" style="width:280px; height:280px; border-radius:50%; box-shadow:0 0 35px rgba(255,46,147,0.3);"></canvas>
          
          <!-- Çark Merkez Rozeti -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, #FF2E93, #7928CA); border:3px solid #FFF; box-shadow:0 0 20px rgba(255,46,147,0.7); display:flex; align-items:center; justify-content:center; color:#FFF; font-size:1.5rem; pointer-events:none; z-index:5;">
            🎡
          </div>
        </div>

        <!-- Aksiyon & Karar Alanı -->
        <div id="bottle-action-area">
          <button type="button" id="btn-spin-dc-wheel" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); font-size:1.15rem; font-weight:900; padding:16px 20px; box-shadow:0 0 25px rgba(255,46,147,0.45); border-radius:999px; width:100%; border:none; color:#FFF; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
            <span>🎡 ÇARKI ÇEVİR!</span>
          </button>
        </div>
      </div>
    `;

    // Buton Dinleyicilerini Bağla
    document.getElementById('btn-bottle-mode-party').onclick = () => this.setMode('party');
    document.getElementById('btn-bottle-mode-adult').onclick = () => this.setMode('adult');
    document.getElementById('btn-spin-dc-wheel').onclick = () => this.spinWheel();

    // Oyuncu Silme Butonları
    container.querySelectorAll('.btn-remove-dc-player').forEach(b => {
      b.onclick = () => this.removePlayer(parseInt(b.dataset.idx, 10));
    });

    // Oyuncu Ekle
    const inpAdd = document.getElementById('inp-add-dc-player');
    const btnAdd = document.getElementById('btn-add-dc-player');
    if (btnAdd && inpAdd) {
      btnAdd.onclick = () => {
        this.addPlayer(inpAdd.value);
        inpAdd.value = '';
      };
      inpAdd.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addPlayer(inpAdd.value);
          inpAdd.value = '';
        }
      };
    }

    // Çarkı Çiz
    this.drawWheel();
  }

  drawWheel() {
    const canvas = document.getElementById('dc-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 6;

    const numSlices = this.players.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const colors = [
      '#FF2E93', '#00F5D4', '#FBBF24', '#7928CA',
      '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6',
      '#14B8A6', '#F59E0B', '#A855F7', '#EC4899'
    ];

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();

      // Dilim rengi
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Kenar çizgisi
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0B0E14';
      ctx.stroke();

      // Oyuncu Adını Yaz
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 4;
      
      const pName = this.players[i];
      const maxTextWidth = r - 48;
      let displayName = pName;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        displayName = displayName.substring(0, 8) + '..';
      }
      ctx.fillText(displayName, r - 16, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  spinWheel() {
    if (this.isSpinning || this.players.length < 2) return;
    this.isSpinning = true;

    const btnSpin = document.getElementById('btn-spin-dc-wheel');
    if (btnSpin) {
      btnSpin.disabled = true;
      btnSpin.style.opacity = '0.6';
    }

    // Rastgele seçilecek oyuncu indeksi
    const targetIdx = Math.floor(Math.random() * this.players.length);
    const numSlices = this.players.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Hedef oyuncunun açısı ibrenin (üst = 1.5 * PI) altına gelsin
    const targetMidAngle = targetIdx * sliceAngle + sliceAngle / 2;
    const desiredFinalRotation = (1.5 * Math.PI) - targetMidAngle;

    const minRotations = 6;
    const extraTurns = minRotations * (2 * Math.PI);
    const startRot = this.rotation % (2 * Math.PI);
    let targetRot = startRot + extraTurns + (desiredFinalRotation - startRot);
    while (targetRot < startRot + extraTurns) {
      targetRot += (2 * Math.PI);
    }

    const duration = 3800; // 3.8 saniye dönüş
    const startTime = performance.now();
    let lastTickSlice = -1;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3.5);
      this.rotation = startRot + (targetRot - startRot) * ease;
      this.drawWheel();

      // Dilim geçişlerinde mekanik ses
      const currentNeedle = (1.5 * Math.PI - (this.rotation % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(currentNeedle / sliceAngle);
      if (currentSlice !== lastTickSlice && progress < 0.96) {
        lastTickSlice = currentSlice;
        try { sounds.playWheelTick(); } catch (e) {}
      }

      if (progress < 1) {
        this.spinAnimId = requestAnimationFrame(animate);
      } else {
        this.spinAnimId = null;
        this.isSpinning = false;
        try { sounds.playBell(); } catch (e) {}
        this.selectedPlayer = this.players[targetIdx];
        this.promptTruthOrDare(this.selectedPlayer);
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }

  promptTruthOrDare(playerName) {
    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    actionArea.innerHTML = `
      <div style="background:rgba(0,0,0,0.65); border:2px solid var(--gold); border-radius:20px; padding:20px; animation:popIn 0.3s ease; box-shadow:0 0 30px rgba(251,191,36,0.35);">
        <div style="font-size:1.6rem; margin-bottom:4px;">🎯</div>
        <div style="font-size:0.8rem; font-weight:800; color:var(--text-dim); text-transform:uppercase;">ÇARK DURDU!</div>
        <div style="font-size:1.45rem; font-weight:900; color:var(--gold); margin:4px 0 10px;">
          👑 ${playerName} Seçiyor!
        </div>
        <p style="font-size:0.85rem; color:#CBD5E1; margin-bottom:16px;">
          Cesaretin var mı, yoksa dürüstçe itiraf mı edeceksin?
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <button type="button" id="btn-choose-truth" class="btn-main" style="background:linear-gradient(135deg, #00F5D4, #00ba9f); color:#0B0E14; font-size:1.05rem; font-weight:900; padding:15px; border-radius:14px; cursor:pointer; border:none; box-shadow:0 0 15px rgba(0,245,212,0.35);">
            🤔 DOĞRULUK
          </button>
          <button type="button" id="btn-choose-dare" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); color:#FFF; font-size:1.05rem; font-weight:900; padding:15px; border-radius:14px; cursor:pointer; border:none; box-shadow:0 0 15px rgba(255,46,147,0.35);">
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
      <div style="background:linear-gradient(135deg, ${isTruth ? '#064e3b, #0f172a' : '#450a0a, #0f172a'}); border:2px solid ${isTruth ? '#00F5D4' : '#FF2E93'}; border-radius:20px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); animation:popIn 0.3s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="background:${isTruth ? 'rgba(0,245,212,0.2)' : 'rgba(255,46,147,0.2)'}; color:${isTruth ? '#00F5D4' : '#FF2E93'}; font-size:0.78rem; font-weight:900; padding:4px 12px; border-radius:999px;">
            ${isTruth ? '🤔 DOĞRULUK İTİRAFI' : '🔥 CESARET GÖREVİ'}
          </span>
          <span style="font-size:0.8rem; font-weight:800; color:var(--gold);">
            👤 ${this.selectedPlayer || 'Sıradaki Oyuncu'}
          </span>
        </div>

        <div id="bottle-card-text" style="font-size:1.25rem; font-weight:900; color:#FFF; line-height:1.45; margin:16px 0 20px; min-height:64px; display:flex; align-items:center; justify-content:center; text-align:center;">
          "${text}"
        </div>

        <!-- Aksiyon Butonları -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" id="btn-spin-again" class="btn-main primary" style="font-size:1.05rem; padding:14px 24px; border-radius:999px; cursor:pointer; width:100%; box-shadow:0 6px 20px rgba(255,46,147,0.4); border:none; font-weight:900;">
            🎡 Sıradaki Oyuncuya Çevir
          </button>
          <button type="button" id="btn-change-question" class="btn-secondary" style="font-size:0.85rem; padding:9px 18px; border-radius:999px; cursor:pointer; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-weight:800;">
            🔀 Başka ${isTruth ? 'Soru' : 'Görev'} Getir (Farklı Seçenek)
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-spin-again').addEventListener('click', () => {
      this.renderScreen();
      this.spinWheel();
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
}
