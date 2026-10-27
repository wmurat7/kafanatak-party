// js/aileler-yarisiyor-data.js
// Kafana Tak! - Aileler Yarışıyor (100 Kişiye Sorduk!) Kapsamlı Soru ve Anket Veritabanı

export const AILELER_YARISIYOR_QUESTIONS = [
  {
    id: "ay_1",
    question: "100 kişiye sorduk: Sabah uyanır uyanmaz ilk yapılan şey nedir?",
    category: "Günlük Yaşam",
    answers: [
      { text: "Telefona bakmak / Alarma basmak", points: 42, keywords: ["telefon", "alarm", "saat", "ekran", "mesaj", "instagram", "whatsapp"] },
      { text: "Tuvalete / Banyoya gitmek", points: 26, keywords: ["tuvalet", "banyo", "lavabo", "wc", "işemek"] },
      { text: "Yüzünü yıkamak", points: 14, keywords: ["yüz", "yıkamak", "el yüz", "su vurmak"] },
      { text: "Su veya Çay / Kahve içmek", points: 11, keywords: ["su", "çay", "kahve", "içmek"] },
      { text: "Geri uyumak / Ertelemek", points: 7, keywords: ["uyumak", "ertelemek", "yatak", "dönmek"] }
    ]
  },
  {
    id: "ay_2",
    question: "100 kişiye sorduk: Bir Türk ailesinin evinde mutlaka bulunan bir eşya nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Dantel (Televizyon veya sehpa üstünde)", points: 38, keywords: ["dantel", "örtü", "örgü"] },
      { text: "Çaydanlık / Çay bardağı takımı", points: 28, keywords: ["çaydanlık", "çay", "bardak", "semaver"] },
      { text: "Misafir terliği", points: 16, keywords: ["terlik", "misafir", "pantufla"] },
      { text: "Kolonya (Limon kolonyası)", points: 11, keywords: ["kolonya", "limon", "dökülen"] },
      { text: "Gırgır / Halı süpürgesi", points: 7, keywords: ["gırgır", "süpürge", "halı"] }
    ]
  },
  {
    id: "ay_3",
    question: "100 kişiye sorduk: Pazardan en çok ne alınır?",
    category: "Alışveriş",
    answers: [
      { text: "Domates", points: 36, keywords: ["domates", "domat"] },
      { text: "Biber / Salatalık", points: 24, keywords: ["biber", "salatalık", "hıyar"] },
      { text: "Patates / Soğan", points: 20, keywords: ["patates", "soğan"] },
      { text: "Meyve (Elma, Portakal, Muz vb.)", points: 12, keywords: ["meyve", "elma", "portakal", "muz", "çilek"] },
      { text: "Yeşillik (Maydanoz, Nane, Marul)", points: 8, keywords: ["yeşillik", "maydanoz", "nane", "marul", "roka"] }
    ]
  },
  {
    id: "ay_4",
    question: "100 kişiye sorduk: Türk dizilerinde mutlaka olan bir klişe nedir?",
    category: "Televizyon",
    answers: [
      { text: "Zengin oğlan - fakir kız aşkı", points: 42, keywords: ["zengin", "fakir", "aşk", "oğlan", "kız"] },
      { text: "Holdingde entrika / Şirket toplantısı basma", points: 23, keywords: ["holding", "şirket", "toplantı", "entrika", "patron"] },
      { text: "Kötü kaynana / İstenmeyen gelin", points: 17, keywords: ["kaynana", "gelin", "anne", "kayınvalide"] },
      { text: "Hastanede kapıda bayılma / Ağlama", points: 11, keywords: ["hastane", "doktor", "bayılma", "ağlama", "koridor"] },
      { text: "Hafıza kaybı", points: 7, keywords: ["hafıza", "unutma", "trafik kazası", "kaza"] }
    ]
  },
  {
    id: "ay_5",
    question: "100 kişiye sorduk: Trafikte kırmızı ışıkta beklerken ne yapılır?",
    category: "Trafik & Şehir",
    answers: [
      { text: "Telefona bakmak (Mesaj/Sosyal Medya)", points: 46, keywords: ["telefon", "mesaj", "instagram", "whatsapp", "ekran"] },
      { text: "Radyo / Şarkı değiştirmek", points: 22, keywords: ["radyo", "şarkı", "müzik", "kanal"] },
      { text: "Aynadan saça veya makyaja bakmak", points: 15, keywords: ["ayna", "saç", "makyaj", "kendine bakmak"] },
      { text: "Yan arabadaki sürücüye dik dik bakmak", points: 11, keywords: ["yan araba", "bakmak", "dikizlemek", "süzmek"] },
      { text: "Burnunu karıştırmak", points: 6, keywords: ["burun", "karıştırmak"] }
    ]
  },
  {
    id: "ay_6",
    question: "100 kişiye sorduk: Evde kaybolduğunda en çok deli eden şey nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Televizyon kumandası", points: 44, keywords: ["kumanda", "tv kumandası"] },
      { text: "Ev veya Araba anahtarı", points: 26, keywords: ["anahtar", "ev anahtarı", "araba anahtarı"] },
      { text: "Cep telefonu", points: 16, keywords: ["telefon", "cep"] },
      { text: "Çorabın teki", points: 9, keywords: ["çorap", "çorap teki"] },
      { text: "Cüzdan / Kimlik", points: 5, keywords: ["cüzdan", "kart", "kimlik"] }
    ]
  },
  {
    id: "ay_7",
    question: "100 kişiye sorduk: Bir restoranda garsona en çok sorulan soru nedir?",
    category: "Yemek & Kafe",
    answers: [
      { text: "Wi-Fi şifresi ne?", points: 40, keywords: ["wifi", "şifre", "internet", "kablosuz"] },
      { text: "Hesabı alabilir miyiz?", points: 27, keywords: ["hesap", "adisyon", "ödeme"] },
      { text: "Ne tavsiye edersiniz / Ne meşhur?", points: 17, keywords: ["tavsiye", "öneri", "ne meşhur", "en iyi ne"] },
      { text: "Tuvalet ne tarafta?", points: 11, keywords: ["tuvalet", "lavabo", "wc"] },
      { text: "Çayınız taze mi?", points: 5, keywords: ["çay", "taze", "demli"] }
    ]
  },
  {
    id: "ay_8",
    question: "100 kişiye sorduk: Randevuya geç kalan birinin söylediği en popüler bahane nedir?",
    category: "İlişkiler",
    answers: [
      { text: "Trafik çok kilitliydi / Kaza vardı", points: 52, keywords: ["trafik", "kaza", "yol", "yoğunluk", "sıkışık"] },
      { text: "Alarm çalmadı / Uyuya kalmışım", points: 21, keywords: ["alarm", "uyku", "uyuya kaldım", "uyanadım"] },
      { text: "İşten geç çıktım / Toplantı uzadı", points: 13, keywords: ["iş", "toplantı", "patron", "mesai"] },
      { text: "Metro / Otobüs gelmedi ya da kaçtı", points: 9, keywords: ["otobüs", "metro", "dolmuş", "akbil"] },
      { text: "Evden çıkarken son anda acil bir şey çıktı", points: 5, keywords: ["acil", "evden çıkarken", "telefon çaldı"] }
    ]
  },
  {
    id: "ay_9",
    question: "100 kişiye sorduk: Bir düğünde mutlaka rastlanan bir tip kimdir?",
    category: "Kültür & Mizah",
    answers: [
      { text: "Halay başı / Pisti asla terk etmeyen amca", points: 41, keywords: ["halay", "halay başı", "amca", "dansçı", "oynayan"] },
      { text: "Takı takarken dikkatle altını süzen akraba", points: 25, keywords: ["takı", "altın", "çeyrek", "süzme", "dedikodu"] },
      { text: "Gelinliği veya organizasyonu eleştiren teyze", points: 18, keywords: ["teyze", "eleştiri", "gelinlik", "beğenmeyen"] },
      { text: "Fotoğrafçıya poz veren çocuklar", points: 10, keywords: ["çocuk", "fotoğrafçı", "çocuklar"] },
      { text: "Pasta kesimini sabırsızlıkla bekleyenler", points: 6, keywords: ["pasta", "kuru pasta", "meyve suyu"] }
    ]
  },
  {
    id: "ay_10",
    question: "100 kişiye sorduk: Kahvaltı sofrasının olmazsa olmazı nedir?",
    category: "Yemek",
    answers: [
      { text: "Demli Çay", points: 43, keywords: ["çay", "demli", "tavşankanı"] },
      { text: "Peynir (Beyaz peynir, kaşar vb.)", points: 24, keywords: ["peynir", "beyaz peynir", "kaşar"] },
      { text: "Zeytin (Siyah / Yeşil)", points: 16, keywords: ["zeytin", "siyah zeytin", "yeşil zeytin"] },
      { text: "Yumurta (Haşlama / Menemen)", points: 11, keywords: ["yumurta", "menemen", "omlet"] },
      { text: "Sıcak Ekmek / Simit", points: 6, keywords: ["ekmek", "simit", "fırın"] }
    ]
  },
  {
    id: "ay_11",
    question: "100 kişiye sorduk: Bir insanın yalan söylediğini ele veren ilk vücut hareketi nedir?",
    category: "İnsan Psikolojisi",
    answers: [
      { text: "Gözlerini kaçırmak / Göz teması kuramamak", points: 47, keywords: ["göz", "göz kaçırma", "bakış", "göz teması"] },
      { text: "Kekelemek / Kelimeleri toparlayamamak", points: 22, keywords: ["kekelemek", "takılmak", "kem küm", "hızlı konuşmak"] },
      { text: "Burnuna veya yüzüne dokunmak", points: 14, keywords: ["burun", "yüz", "kaşımak", "dokunmak"] },
      { text: "Terlemek veya yüzünün kızarması", points: 11, keywords: ["terlemek", "kızarmak", "ter", "kızarma"] },
      { text: "Gereksiz aşırı detay anlatmak", points: 6, keywords: ["detay", "uzatmak", "çok anlatmak"] }
    ]
  },
  {
    id: "ay_12",
    question: "100 kişiye sorduk: Sinemada yan koltuğundaki insanın yapmasından en çok nefret edilen şey nedir?",
    category: "Görgü Kuralları",
    answers: [
      { text: "Yüksek sesle konuşmak veya telefona bakmak", points: 45, keywords: ["konuşmak", "telefon", "ekran ışığı", "mesajlaşmak"] },
      { text: "Hışır hışır mısır / cips paketi açmak", points: 24, keywords: ["mısır", "cips", "hışırtı", "paket", "ses"] },
      { text: "Koltuk arkasını tekmelemek", points: 16, keywords: ["tekme", "koltuğa vurmak", "ayak"] },
      { text: "Filmi önceden tahmin edip sesli söylemek (Spoiler)", points: 10, keywords: ["spoiler", "anlatmak", "tahmin"] },
      { text: "Film boyunca horlamak / uyumak", points: 5, keywords: ["horlamak", "uyumak", "horultu"] }
    ]
  },
  {
    id: "ay_13",
    question: "100 kişiye sorduk: Türk erkeğinin pazar günü klasiği nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Koltukta televizyon karşısında uyuyakalmak", points: 41, keywords: ["uyumak", "koltuk", "televizyon", "kestirmek"] },
      { text: "Arabayı yıkamak veya yıkamaya götürmek", points: 25, keywords: ["araba", "yıkamak", "oto yıkama", "sanayi"] },
      { text: "Maç izlemek / Futbol programı takip etmek", points: 17, keywords: ["maç", "futbol", "derbi"] },
      { text: "Mangal yakmak", points: 11, keywords: ["mangal", "piknik", "ızgara", "et"] },
      { text: "Pijamayla gün boyu gazete / telefon kurcalamak", points: 6, keywords: ["pijama", "gazete", "telefon", "tembellik"] }
    ]
  },
  {
    id: "ay_14",
    question: "100 kişiye sorduk: İlk buluşmada (first date) asla söylenmemesi gereken konu nedir?",
    category: "İlişkiler",
    answers: [
      { text: "Eski sevgililerden ve aşklardan bahsetmek", points: 54, keywords: ["eski sevgili", "eski", "ex", "ayrılık"] },
      { text: "Evlilik ve kaç çocuk istediğini sormak", points: 20, keywords: ["evlilik", "çocuk", "nikah", "yuva"] },
      { text: "Maaşını ve ne kadar kazandığını sormak", points: 14, keywords: ["maaş", "para", "kazanç", "gelir"] },
      { text: "Siyaset ve sert politika tartışması", points: 8, keywords: ["siyaset", "politika", "parti"] },
      { text: "Annesine aşırı düşkün olduğunu vurgulamak", points: 4, keywords: ["anne", "ana kuzusu", "annem"] }
    ]
  },
  {
    id: "ay_15",
    question: "100 kişiye sorduk: Diyete başlayan birinin canının ilk çektiği şey nedir?",
    category: "Yemek & Yaşam",
    answers: [
      { text: "Çikolata ve Tatlı (Baklava vb.)", points: 39, keywords: ["tatlı", "çikolata", "baklava", "pasta"] },
      { text: "Hamur işi (Börek, Poğaça, Ekmek)", points: 26, keywords: ["hamur", "börek", "poğaça", "ekmek"] },
      { text: "Fast Food (Hamburger, Pizza)", points: 18, keywords: ["hamburger", "pizza", "fast food", "döner"] },
      { text: "Patates kızartması", points: 11, keywords: ["patates", "kızartma", "cips"] },
      { text: "Gazlı içecek / Kola", points: 6, keywords: ["kola", "gazlı", "içecek"] }
    ]
  },
  {
    id: "ay_16",
    question: "100 kişiye sorduk: Bir otelde kalınca valize gizlice atılan en yaygın eşya nedir?",
    category: "Seyahat & Tatil",
    answers: [
      { text: "Küçük Şampuan ve Duş Jeli", points: 48, keywords: ["şampuan", "duş jeli", "sabun", "banyo"] },
      { text: "Otel Terliği", points: 27, keywords: ["terlik", "otel terliği", "pantufla"] },
      { text: "Dikiş seti veya duş bonesi", points: 13, keywords: ["dikiş", "bone", "pamuk", "tarak"] },
      { text: "Küçük Havlu", points: 8, keywords: ["havlu", "el havlusu"] },
      { text: "Oda poşet çayı veya kahvesi", points: 4, keywords: ["çay", "kahve", "nescafe"] }
    ]
  },
  {
    id: "ay_17",
    question: "100 kişiye sorduk: Okulda sınav sırasında hocadan gizli en çok ne yapılır?",
    category: "Okul & Gençlik",
    answers: [
      { text: "Kopya çekmek / Yanındakine fısıldamak", points: 53, keywords: ["kopya", "fısıldamak", "fısıltı", "kağıda bakmak"] },
      { text: "Telefonla oynamak / Masanın altına saklamak", points: 24, keywords: ["telefon", "mesaj", "google"] },
      { text: "Silgi veya kağıt fırlatmak", points: 12, keywords: ["silgi", "kağıt", "not", "fırlatmak"] },
      { text: "Gizlice bir şeyler atıştırmak / Sakız çiğnemek", points: 7, keywords: ["yemek", "atıştırmak", "sakız"] },
      { text: "Uyumak / Sıraya baş koymak", points: 4, keywords: ["uyumak", "baş koymak", "kestirmek"] }
    ]
  },
  {
    id: "ay_18",
    question: "100 kişiye sorduk: Bir eve misafirliğe gidildiğinde ilk ne ikram edilir?",
    category: "Misafirlik",
    answers: [
      { text: "Limon Kolonyası", points: 38, keywords: ["kolonya", "limon"] },
      { text: "Çikolata / Şeker", points: 28, keywords: ["çikolata", "şeker", "ikramlık"] },
      { text: "Su", points: 16, keywords: ["su", "bir bardak su"] },
      { text: "Türk Kahvesi", points: 12, keywords: ["kahve", "türk kahvesi"] },
      { text: "Çay", points: 6, keywords: ["çay", "demli çay"] }
    ]
  },
  {
    id: "ay_19",
    question: "100 kişiye sorduk: Şarjı %1 kalan birinin ilk hissettiği duygu nedir?",
    category: "Teknoloji",
    answers: [
      { text: "Panik ve Stres", points: 51, keywords: ["panik", "stres", "korku", "telaş"] },
      { text: "Çaresizlik / Dünyadan kopma hissi", points: 22, keywords: ["çaresizlik", "kapanacak", "yalnızlık"] },
      { text: "Deli gibi priz veya şarj aleti aramak", points: 15, keywords: ["priz", "şarj", "kablo", "powerbank"] },
      { text: "Ekran parlaklığını sıfıra indirmek", points: 8, keywords: ["parlaklık", "tasarruf modu", "kısmak"] },
      { text: "Kaderine razı olmak / Huzur", points: 4, keywords: ["huzur", "rahatlık", "kapanırsa kapansın"] }
    ]
  },
  {
    id: "ay_20",
    question: "100 kişiye sorduk: Türkiye'de yaz tatili denince akla gelen ilk tatil beldesi neresidir?",
    category: "Tatil & Coğrafya",
    answers: [
      { text: "Antalya (Alanya / Kemer)", points: 37, keywords: ["antalya", "alanya", "kemer", "kaş"] },
      { text: "Bodrum", points: 29, keywords: ["bodrum", "muğla"] },
      { text: "Çeşme / Alaçatı", points: 18, keywords: ["çeşme", "alaçatı", "izmir"] },
      { text: "Marmaris / Fethiye", points: 11, keywords: ["marmaris", "fethiye", "ölüdeniz"] },
      { text: "Köy / Memleket ziyareti", points: 5, keywords: ["köy", "memleket", "sıla"] }
    ]
  }
];

export const AILELER_YARISIYOR_KIDS_QUESTIONS = [
  {
    id: "ay_kid_1",
    question: "100 çocuğa sorduk: Okul çantasında en çok bulunan eğlenceli eşya nedir?",
    category: "Çocuk Dünyası",
    answers: [
      { text: "Renkli Kalemler / Boyalar", points: 44, keywords: ["boya", "renkli kalem", "fosforlu"] },
      { text: "Oyun Hamuru veya Slime", points: 24, keywords: ["hamur", "oyun hamuru", "slime"] },
      { text: "Çizgi Roman / Hikaye Kitabı", points: 16, keywords: ["kitap", "çizgi roman", "hikaye"] },
      { text: "Küçük Oyuncak Figür", points: 11, keywords: ["oyuncak", "figür", "araba", "bebek"] },
      { text: "Atıştırmalık / Çikolata", points: 5, keywords: ["çikolata", "kek", "bisküvi"] }
    ]
  },
  {
    id: "ay_kid_2",
    question: "100 çocuğa sorduk: Süper kahraman olsaydın sahip olmak isteyeceğin ilk güç ne olurdu?",
    category: "Hayal Gücü",
    answers: [
      { text: "Uçabilmek", points: 46, keywords: ["uçmak", "uçabilmek", "kanat"] },
      { text: "Görünmez Olmak", points: 26, keywords: ["görünmez", "kaybolmak"] },
      { text: "Süper Hızlı Koşmak", points: 15, keywords: ["hız", "flash", "hızlı koşmak"] },
      { text: "Zamanı Durdurmak", points: 9, keywords: ["zaman", "durdurmak", "zamanı durdurma"] },
      { text: "Akıl Okuyabilmek", points: 4, keywords: ["akıl", "düşünce", "zihin okuma"] }
    ]
  },
  {
    id: "ay_kid_3",
    question: "100 çocuğa sorduk: En sevilen dondurma çeşidi hangisidir?",
    category: "Tatlılar",
    answers: [
      { text: "Çikolatalı", points: 43, keywords: ["çikolata", "çikolatalı", "kakaolu"] },
      { text: "Çilekli", points: 27, keywords: ["çilek", "çilekli", "pembe"] },
      { text: "Vanilyalı", points: 16, keywords: ["vanilya", "vanilyalı", "sade"] },
      { text: "Muzlu", points: 9, keywords: ["muz", "muzlu", "sarı"] },
      { text: "Karamelli", points: 5, keywords: ["karamel", "karamelli"] }
    ]
  },
  {
    id: "ay_kid_4",
    question: "100 çocuğa sorduk: Evcil hayvan olarak en çok hangisi istenir?",
    category: "Sevimli Dostlar",
    answers: [
      { text: "Köpek (Yavru köpek)", points: 48, keywords: ["köpek", "yavru köpek", "puppy"] },
      { text: "Kedi", points: 31, keywords: ["kedi", "yavru kedi", "tekir"] },
      { text: "Muhabbet Kuşu / Papağan", points: 11, keywords: ["kuş", "muhabbet kuşu", "papağan"] },
      { text: "Tavşan / Hamster", points: 7, keywords: ["tavşan", "hamster"] },
      { text: "Akvaryum Balığı", points: 3, keywords: ["balık", "japon balığı"] }
    ]
  }
];

/**
 * Kullanıcı girdisini akıllı anahtar kelime eşleştirmesi ile panodaki cevapla eşler.
 * @param {string} input - Kullanıcının yazdığı veya söylediği cevap
 * @param {Array} answers - Panodaki cevap listesi
 * @returns {number} Eşleşen cevabın indeksi (-1 bulunamazsa)
 */
export function matchAnswerIndex(input, answers) {
  if (!input) return -1;
  const cleanInput = input.trim().toLocaleLowerCase('tr-TR');

  for (let i = 0; i < answers.length; i++) {
    const ans = answers[i];
    const cleanText = ans.text.toLocaleLowerCase('tr-TR');

    // 1. Doğrudan veya tam kapsama
    if (cleanText.includes(cleanInput) || cleanInput.includes(cleanText)) {
      return i;
    }

    // 2. Anahtar kelimelerden biri geçiyor mu?
    if (ans.keywords && Array.isArray(ans.keywords)) {
      for (const kw of ans.keywords) {
        const cleanKw = kw.toLocaleLowerCase('tr-TR');
        if (cleanInput.includes(cleanKw) || cleanKw.includes(cleanInput)) {
          return i;
        }
      }
    }
  }

  return -1;
}
