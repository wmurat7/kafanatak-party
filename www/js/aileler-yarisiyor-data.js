// js/aileler-yarisiyor-data.js
// Kafana Tak! - Aileler Yarışıyor (100 Kişiye Sorduk!) Kapsamlı Soru ve Anket Veritabanı

export const AILELER_YARISIYOR_QUESTIONS = [
  {
    id: "ay_1",
    question: "100 kişiye sorduk: Sabah uyanır uyanmaz ilk yapılan şey nedir?",
    category: "Günlük Yaşam",
    answers: [
      { text: "Telefona bakmak / Alarma basmak", points: 42, keywords: ["telefon","alarm","saat","ekran","mesaj","instagram","whatsapp"] },
      { text: "Tuvalete / Banyoya gitmek", points: 26, keywords: ["tuvalet","banyo","lavabo","wc","işemek"] },
      { text: "Yüzünü yıkamak", points: 14, keywords: ["yüz","yıkamak","el yüz","su vurmak"] },
      { text: "Su veya Çay / Kahve içmek", points: 11, keywords: ["su","çay","kahve","içmek"] },
      { text: "Geri uyumak / Ertelemek", points: 7, keywords: ["uyumak","ertelemek","yatak","dönmek"] }
    ]
  },
  {
    id: "ay_2",
    question: "100 kişiye sorduk: Bir Türk ailesinin evinde mutlaka bulunan bir eşya nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Dantel (Televizyon veya sehpa üstünde)", points: 38, keywords: ["dantel","örtü","örgü"] },
      { text: "Çaydanlık / Çay bardağı takımı", points: 28, keywords: ["çaydanlık","çay","bardak","semaver"] },
      { text: "Misafir terliği", points: 16, keywords: ["terlik","misafir","pantufla"] },
      { text: "Kolonya (Limon kolonyası)", points: 11, keywords: ["kolonya","limon","dökülen"] },
      { text: "Gırgır / Halı süpürgesi", points: 7, keywords: ["gırgır","süpürge","halı"] }
    ]
  },
  {
    id: "ay_3",
    question: "100 kişiye sorduk: Pazardan en çok ne alınır?",
    category: "Alışveriş",
    answers: [
      { text: "Domates", points: 36, keywords: ["domates","domat"] },
      { text: "Biber / Salatalık", points: 24, keywords: ["biber","salatalık","hıyar"] },
      { text: "Patates / Soğan", points: 20, keywords: ["patates","soğan"] },
      { text: "Meyve (Elma, Portakal, Muz vb.)", points: 12, keywords: ["meyve","elma","portakal","muz","çilek"] },
      { text: "Yeşillik (Maydanoz, Nane, Marul)", points: 8, keywords: ["yeşillik","maydanoz","nane","marul","roka"] }
    ]
  },
  {
    id: "ay_4",
    question: "100 kişiye sorduk: Türk dizilerinde mutlaka olan bir klişe nedir?",
    category: "Televizyon",
    answers: [
      { text: "Zengin oğlan - fakir kız aşkı", points: 42, keywords: ["zengin","fakir","aşk","oğlan","kız"] },
      { text: "Holdingde entrika / Şirket toplantısı basma", points: 23, keywords: ["holding","şirket","toplantı","entrika","patron"] },
      { text: "Kötü kaynana / İstenmeyen gelin", points: 17, keywords: ["kaynana","gelin","anne","kayınvalide"] },
      { text: "Hastanede kapıda bayılma / Ağlama", points: 11, keywords: ["hastane","doktor","bayılma","ağlama","koridor"] },
      { text: "Hafıza kaybı", points: 7, keywords: ["hafıza","unutma","trafik kazası","kaza"] }
    ]
  },
  {
    id: "ay_5",
    question: "100 kişiye sorduk: Trafikte kırmızı ışıkta beklerken ne yapılır?",
    category: "Trafik & Şehir",
    answers: [
      { text: "Telefona bakmak (Mesaj/Sosyal Medya)", points: 46, keywords: ["telefon","mesaj","instagram","whatsapp","ekran"] },
      { text: "Radyo / Şarkı değiştirmek", points: 22, keywords: ["radyo","şarkı","müzik","kanal"] },
      { text: "Aynadan saça veya makyaja bakmak", points: 15, keywords: ["ayna","saç","makyaj","kendine bakmak"] },
      { text: "Yan arabadaki sürücüye dik dik bakmak", points: 11, keywords: ["yan araba","bakmak","dikizlemek","süzmek"] },
      { text: "Burnunu karıştırmak", points: 6, keywords: ["burun","karıştırmak"] }
    ]
  },
  {
    id: "ay_6",
    question: "100 kişiye sorduk: Evde kaybolduğunda en çok deli eden şey nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Televizyon kumandası", points: 44, keywords: ["kumanda","tv kumandası"] },
      { text: "Ev veya Araba anahtarı", points: 26, keywords: ["anahtar","ev anahtarı","araba anahtarı"] },
      { text: "Cep telefonu", points: 16, keywords: ["telefon","cep"] },
      { text: "Çorabın teki", points: 9, keywords: ["çorap","çorap teki"] },
      { text: "Cüzdan / Kimlik", points: 5, keywords: ["cüzdan","kart","kimlik"] }
    ]
  },
  {
    id: "ay_7",
    question: "100 kişiye sorduk: Bir restoranda garsona en çok sorulan soru nedir?",
    category: "Yemek & Kafe",
    answers: [
      { text: "Wi-Fi şifresi ne?", points: 40, keywords: ["wifi","şifre","internet","kablosuz"] },
      { text: "Hesabı alabilir miyiz?", points: 27, keywords: ["hesap","adisyon","ödeme"] },
      { text: "Ne tavsiye edersiniz / Ne meşhur?", points: 17, keywords: ["tavsiye","öneri","ne meşhur","en iyi ne"] },
      { text: "Tuvalet ne tarafta?", points: 11, keywords: ["tuvalet","lavabo","wc"] },
      { text: "Çayınız taze mi?", points: 5, keywords: ["çay","taze","demli"] }
    ]
  },
  {
    id: "ay_8",
    question: "100 kişiye sorduk: Randevuya geç kalan birinin söylediği en popüler bahane nedir?",
    category: "İlişkiler",
    answers: [
      { text: "Trafik çok kilitliydi / Kaza vardı", points: 52, keywords: ["trafik","kaza","yol","yoğunluk","sıkışık"] },
      { text: "Alarm çalmadı / Uyuya kalmışım", points: 21, keywords: ["alarm","uyku","uyuya kaldım","uyanadım"] },
      { text: "İşten geç çıktım / Toplantı uzadı", points: 13, keywords: ["iş","toplantı","patron","mesai"] },
      { text: "Metro / Otobüs gelmedi ya da kaçtı", points: 9, keywords: ["otobüs","metro","dolmuş","akbil"] },
      { text: "Evden çıkarken son anda acil bir şey çıktı", points: 5, keywords: ["acil","evden çıkarken","telefon çaldı"] }
    ]
  },
  {
    id: "ay_9",
    question: "100 kişiye sorduk: Bir düğünde mutlaka rastlanan bir tip kimdir?",
    category: "Kültür & Mizah",
    answers: [
      { text: "Halay başı / Pisti asla terk etmeyen amca", points: 41, keywords: ["halay","halay başı","amca","dansçı","oynayan"] },
      { text: "Takı takarken dikkatle altını süzen akraba", points: 25, keywords: ["takı","altın","çeyrek","süzme","dedikodu"] },
      { text: "Gelinliği veya organizasyonu eleştiren teyze", points: 18, keywords: ["teyze","eleştiri","gelinlik","beğenmeyen"] },
      { text: "Fotoğrafçıya poz veren çocuklar", points: 10, keywords: ["çocuk","fotoğrafçı","çocuklar"] },
      { text: "Pasta kesimini sabırsızlıkla bekleyenler", points: 6, keywords: ["pasta","kuru pasta","meyve suyu"] }
    ]
  },
  {
    id: "ay_10",
    question: "100 kişiye sorduk: Kahvaltı sofrasının olmazsa olmazı nedir?",
    category: "Yemek",
    answers: [
      { text: "Demli Çay", points: 43, keywords: ["çay","demli","tavşankanı"] },
      { text: "Peynir (Beyaz peynir, kaşar vb.)", points: 24, keywords: ["peynir","beyaz peynir","kaşar"] },
      { text: "Zeytin (Siyah / Yeşil)", points: 16, keywords: ["zeytin","siyah zeytin","yeşil zeytin"] },
      { text: "Yumurta (Haşlama / Menemen)", points: 11, keywords: ["yumurta","menemen","omlet"] },
      { text: "Sıcak Ekmek / Simit", points: 6, keywords: ["ekmek","simit","fırın"] }
    ]
  },
  {
    id: "ay_11",
    question: "100 kişiye sorduk: Bir insanın yalan söylediğini ele veren ilk vücut hareketi nedir?",
    category: "İnsan Psikolojisi",
    answers: [
      { text: "Gözlerini kaçırmak / Göz teması kuramamak", points: 47, keywords: ["göz","göz kaçırma","bakış","göz teması"] },
      { text: "Kekelemek / Kelimeleri toparlayamamak", points: 22, keywords: ["kekelemek","takılmak","kem küm","hızlı konuşmak"] },
      { text: "Burnuna veya yüzüne dokunmak", points: 14, keywords: ["burun","yüz","kaşımak","dokunmak"] },
      { text: "Terlemek veya yüzünün kızarması", points: 11, keywords: ["terlemek","kızarmak","ter","kızarma"] },
      { text: "Gereksiz aşırı detay anlatmak", points: 6, keywords: ["detay","uzatmak","çok anlatmak"] }
    ]
  },
  {
    id: "ay_12",
    question: "100 kişiye sorduk: Sinemada yan koltuğundaki insanın yapmasından en çok nefret edilen şey nedir?",
    category: "Görgü Kuralları",
    answers: [
      { text: "Yüksek sesle konuşmak veya telefona bakmak", points: 45, keywords: ["konuşmak","telefon","ekran ışığı","mesajlaşmak"] },
      { text: "Hışır hışır mısır / cips paketi açmak", points: 24, keywords: ["mısır","cips","hışırtı","paket","ses"] },
      { text: "Koltuk arkasını tekmelemek", points: 16, keywords: ["tekme","koltuğa vurmak","ayak"] },
      { text: "Filmi önceden tahmin edip sesli söylemek (Spoiler)", points: 10, keywords: ["spoiler","anlatmak","tahmin"] },
      { text: "Film boyunca horlamak / uyumak", points: 5, keywords: ["horlamak","uyumak","horultu"] }
    ]
  },
  {
    id: "ay_13",
    question: "100 kişiye sorduk: Türk erkeğinin pazar günü klasiği nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Koltukta televizyon karşısında uyuyakalmak", points: 41, keywords: ["uyumak","koltuk","televizyon","kestirmek"] },
      { text: "Arabayı yıkamak veya yıkamaya götürmek", points: 25, keywords: ["araba","yıkamak","oto yıkama","sanayi"] },
      { text: "Maç izlemek / Futbol programı takip etmek", points: 17, keywords: ["maç","futbol","derbi"] },
      { text: "Mangal yakmak", points: 11, keywords: ["mangal","piknik","ızgara","et"] },
      { text: "Pijamayla gün boyu gazete / telefon kurcalamak", points: 6, keywords: ["pijama","gazete","telefon","tembellik"] }
    ]
  },
  {
    id: "ay_14",
    question: "100 kişiye sorduk: İlk buluşmada (first date) asla söylenmemesi gereken konu nedir?",
    category: "İlişkiler",
    answers: [
      { text: "Eski sevgililerden ve aşklardan bahsetmek", points: 54, keywords: ["eski sevgili","eski","ex","ayrılık"] },
      { text: "Evlilik ve kaç çocuk istediğini sormak", points: 20, keywords: ["evlilik","çocuk","nikah","yuva"] },
      { text: "Maaşını ve ne kadar kazandığını sormak", points: 14, keywords: ["maaş","para","kazanç","gelir"] },
      { text: "Siyaset ve sert politika tartışması", points: 8, keywords: ["siyaset","politika","parti"] },
      { text: "Annesine aşırı düşkün olduğunu vurgulamak", points: 4, keywords: ["anne","ana kuzusu","annem"] }
    ]
  },
  {
    id: "ay_15",
    question: "100 kişiye sorduk: Diyete başlayan birinin canının ilk çektiği şey nedir?",
    category: "Yemek & Yaşam",
    answers: [
      { text: "Çikolata ve Tatlı (Baklava vb.)", points: 39, keywords: ["tatlı","çikolata","baklava","pasta"] },
      { text: "Hamur işi (Börek, Poğaça, Ekmek)", points: 26, keywords: ["hamur","börek","poğaça","ekmek"] },
      { text: "Fast Food (Hamburger, Pizza)", points: 18, keywords: ["hamburger","pizza","fast food","döner"] },
      { text: "Patates kızartması", points: 11, keywords: ["patates","kızartma","cips"] },
      { text: "Gazlı içecek / Kola", points: 6, keywords: ["kola","gazlı","içecek"] }
    ]
  },
  {
    id: "ay_16",
    question: "100 kişiye sorduk: Bir otelde kalınca valize gizlice atılan en yaygın eşya nedir?",
    category: "Seyahat & Tatil",
    answers: [
      { text: "Küçük Şampuan ve Duş Jeli", points: 48, keywords: ["şampuan","duş jeli","sabun","banyo"] },
      { text: "Otel Terliği", points: 27, keywords: ["terlik","otel terliği","pantufla"] },
      { text: "Dikiş seti veya duş bonesi", points: 13, keywords: ["dikiş","bone","pamuk","tarak"] },
      { text: "Küçük Havlu", points: 8, keywords: ["havlu","el havlusu"] },
      { text: "Oda poşet çayı veya kahvesi", points: 4, keywords: ["çay","kahve","nescafe"] }
    ]
  },
  {
    id: "ay_17",
    question: "100 kişiye sorduk: Okulda sınav sırasında hocadan gizli en çok ne yapılır?",
    category: "Okul & Gençlik",
    answers: [
      { text: "Kopya çekmek / Yanındakine fısıldamak", points: 53, keywords: ["kopya","fısıldamak","fısıltı","kağıda bakmak"] },
      { text: "Telefonla oynamak / Masanın altına saklamak", points: 24, keywords: ["telefon","mesaj","google"] },
      { text: "Silgi veya kağıt fırlatmak", points: 12, keywords: ["silgi","kağıt","not","fırlatmak"] },
      { text: "Gizlice bir şeyler atıştırmak / Sakız çiğnemek", points: 7, keywords: ["yemek","atıştırmak","sakız"] },
      { text: "Uyumak / Sıraya baş koymak", points: 4, keywords: ["uyumak","baş koymak","kestirmek"] }
    ]
  },
  {
    id: "ay_18",
    question: "100 kişiye sorduk: Bir eve misafirliğe gidildiğinde ilk ne ikram edilir?",
    category: "Misafirlik",
    answers: [
      { text: "Limon Kolonyası", points: 38, keywords: ["kolonya","limon"] },
      { text: "Çikolata / Şeker", points: 28, keywords: ["çikolata","şeker","ikramlık"] },
      { text: "Su", points: 16, keywords: ["su","bir bardak su"] },
      { text: "Türk Kahvesi", points: 12, keywords: ["kahve","türk kahvesi"] },
      { text: "Çay", points: 6, keywords: ["çay","demli çay"] }
    ]
  },
  {
    id: "ay_19",
    question: "100 kişiye sorduk: Şarjı %1 kalan birinin ilk hissettiği duygu nedir?",
    category: "Teknoloji",
    answers: [
      { text: "Panik ve Stres", points: 51, keywords: ["panik","stres","korku","telaş"] },
      { text: "Çaresizlik / Dünyadan kopma hissi", points: 22, keywords: ["çaresizlik","kapanacak","yalnızlık"] },
      { text: "Deli gibi priz veya şarj aleti aramak", points: 15, keywords: ["priz","şarj","kablo","powerbank"] },
      { text: "Ekran parlaklığını sıfıra indirmek", points: 8, keywords: ["parlaklık","tasarruf modu","kısmak"] },
      { text: "Kaderine razı olmak / Huzur", points: 4, keywords: ["huzur","rahatlık","kapanırsa kapansın"] }
    ]
  },
  {
    id: "ay_20",
    question: "100 kişiye sorduk: Türkiye'de yaz tatili denince akla gelen ilk tatil beldesi neresidir?",
    category: "Tatil & Coğrafya",
    answers: [
      { text: "Antalya (Alanya / Kemer)", points: 37, keywords: ["antalya","alanya","kemer","kaş"] },
      { text: "Bodrum", points: 29, keywords: ["bodrum","muğla"] },
      { text: "Çeşme / Alaçatı", points: 18, keywords: ["çeşme","alaçatı","izmir"] },
      { text: "Marmaris / Fethiye", points: 11, keywords: ["marmaris","fethiye","ölüdeniz"] },
      { text: "Köy / Memleket ziyareti", points: 5, keywords: ["köy","memleket","sıla"] }
    ]
  },
  {
    id: "ay_25",
    question: "100 kişiye sorduk: Misafirlikteyken kibarlıktan söylenen en yaygın yalan nedir?",
    category: "Sosyal İlişkiler",
    answers: [
      { text: "Valla çok tokum / Yeni yedim", points: 44, keywords: ["tokum","aç değilim","yeni yedim","yedim geldim","tok"] },
      { text: "Kalkalım artık / Geç oldu", points: 24, keywords: ["kalkalım","geç oldu","gitmemiz lazım","müsaade"] },
      { text: "Çok güzel olmuş eline sağlık (Beğenmese bile)", points: 15, keywords: ["eline sağlık","harika","güzel olmuş","nefis"] },
      { text: "Hiç zahmet etmeyin / Bir şey yapmayın", points: 11, keywords: ["zahmet","uğraşmayın","gerek yok","hiç gerek yok"] },
      { text: "Yarın erken kalkacağım", points: 6, keywords: ["erken","iş var","uyuyacağım","kalkacağım"] }
    ]
  },
  {
    id: "ay_26",
    question: "100 kişiye sorduk: Bir Türk düğününde mutlaka yaşanan bir olay nedir?",
    category: "Düğün & Eğlence",
    answers: [
      { text: "Halay çekmek / Mendil sallamak", points: 41, keywords: ["halay","mendil","halay başı","dans"] },
      { text: "Altın / Takı takma merasimi ve kuyruk", points: 28, keywords: ["takı","altın","para","kuyruk","iğnelemek"] },
      { text: "Düğün pastasının köpük/sahte çıkması", points: 13, keywords: ["pasta","maket pasta","köpük pasta","sahte pasta"] },
      { text: "Gelin ayakkabısının altına isim yazmak", points: 11, keywords: ["ayakkabı","gelin ayakkabısı","isim yazmak"] },
      { text: "Gelin arabasının önünü çocukların kesmesi", points: 7, keywords: ["araba","ön kesmek","zarf","bahşiş"] }
    ]
  },
  {
    id: "ay_27",
    question: "100 kişiye sorduk: Dolmuşta veya minibüste en çok duyulan cümle nedir?",
    category: "Şehir & Ulaşım",
    answers: [
      { text: "Müsait bir yerde / Kaptan müsait bir yer", points: 48, keywords: ["müsait","inecek var","kaptan","sağda"] },
      { text: "Bir kişi uzatır mısınız? / Bir öğrenci", points: 27, keywords: ["uzatır mısınız","para uzatmak","öğrenci","tam"] },
      { text: "Arkayı dörtleyelim / Biraz ilerleyelim", points: 12, keywords: ["dörtleyelim","ilerleyin","sıkışın","arkaya doğru"] },
      { text: "Üstü kalsın / Paranın üstü geldi mi?", points: 8, keywords: ["para üstü","kalsın","bozuk"] },
      { text: "Kapıyı kapatır mısınız?", points: 5, keywords: ["kapı","kapat","rüzgar"] }
    ]
  },
  {
    id: "ay_28",
    question: "100 kişiye sorduk: Bir öğrencinin sınav sabahı yaşadığı en büyük panik nedir?",
    category: "Okul & Öğrencilik",
    answers: [
      { text: "Uyanamamak / Alarma uyanamamak", points: 45, keywords: ["uyanamamak","geç kalmak","alarm","uyuyakalmak"] },
      { text: "Hiç çalışmadığı yerden soru gelmesi korkusu", points: 25, keywords: ["çalışmadığı yer","soru","çıkmaz dediği","unuttum"] },
      { text: "Kalem, silgi veya kimliği unutmak", points: 14, keywords: ["kalem","silgi","kimlik","uç","uçlu kalem"] },
      { text: "Sınav yerini veya dersliği bulamamak", points: 9, keywords: ["sınıf","derslik","yer","bina"] },
      { text: "Karnının veya midesinin ağrıması", points: 7, keywords: ["karın ağrısı","mide","heyecan","stres"] }
    ]
  },
  {
    id: "ay_29",
    question: "100 kişiye sorduk: Yaz tatili valizine mutlaka ilk konulan şey nedir?",
    category: "Tatil & Gezi",
    answers: [
      { text: "Mayo / Şort / Bikini", points: 43, keywords: ["mayo","şort","bikini","haşema"] },
      { text: "Güneş kremi / Yağı", points: 26, keywords: ["güneş kremi","krem","koruyucu","bronzlaştırıcı"] },
      { text: "Güneş gözlüğü", points: 14, keywords: ["gözlük","güneş gözlüğü"] },
      { text: "Parmak arası terlik", points: 10, keywords: ["terlik","parmak arası","plaj terliği"] },
      { text: "Plaj havlusu", points: 7, keywords: ["havlu","plaj havlusu"] }
    ]
  },
  {
    id: "ay_30",
    question: "100 kişiye sorduk: Pazar günleri evde yapılan en popüler aktivite nedir?",
    category: "Hafta Sonu",
    answers: [
      { text: "Uzun ve geç pazar kahvaltısı yapmak", points: 52, keywords: ["kahvaltı","pazar kahvaltısı","geç kahvaltı","sucuklu yumurta","pişi"] },
      { text: "Televizyon / Dizi / Film izlemek", points: 20, keywords: ["film","dizi","tv","televizyon","netflix"] },
      { text: "Öğle uykusu / Tembellik yapmak", points: 14, keywords: ["uyku","öğle uykusu","şekerleme","yatmak","tembellik"] },
      { text: "Ev temizliği / Çamaşır yıkamak", points: 9, keywords: ["temizlik","çamaşır","süpürme","ütü"] },
      { text: "Yürüyüşe / AVM'ye gitmek", points: 5, keywords: ["yürüyüş","avm","dışarı","park"] }
    ]
  },
  {
    id: "ay_31",
    question: "100 kişiye sorduk: Sinemada film izlerken en çok sinir bozan durum nedir?",
    category: "Eğlence",
    answers: [
      { text: "Yüksek sesle konuşanlar / Fısıldaşanlar", points: 42, keywords: ["konuşmak","ses","fısıltı","sohbet"] },
      { text: "Telefonun çalması veya parlak ekran ışığı", points: 28, keywords: ["telefon","ekran ışığı","parlaklık","mesaj"] },
      { text: "Koltuk arkasına tekme atılması", points: 15, keywords: ["tekme","koltuk","arkadan vurmak","ayak"] },
      { text: "Hışırtılı mısır/cips yemek / Ağız şapırdatmak", points: 10, keywords: ["mısır","cips","hışırtı","şapırdatmak","sesli yemek"] },
      { text: "Filmin sonunu söyleyenler (Spoiler)", points: 5, keywords: ["spoiler","sonunu söylemek","anlatan"] }
    ]
  },
  {
    id: "ay_32",
    question: "100 kişiye sorduk: Bir restoranda hesabı öderken yaşanan en klasik sahne nedir?",
    category: "Yeme & İçme",
    answers: [
      { text: "Hesabı ben ödeyeceğim kavgası / Yarışı", points: 56, keywords: ["kavga","ben öderim","sen ödeme","ısrar","çekişme"] },
      { text: "Cüzdanı unutmuş gibi yapmak / Ağır davranmak", points: 18, keywords: ["cüzdan","ağır davranmak","unutmuş gibi","tuvalete kaçmak"] },
      { text: "Alman usulü (Herkes kendi yediğini ödesin) demek", points: 13, keywords: ["alman usulü","bölüşmek","ayrı ayrı","paylaşmak"] },
      { text: "Kart geçiyor mu diye sormak", points: 8, keywords: ["kart","kredi kartı","pos","nakit"] },
      { text: "Kuver ve servis ücretine şaşırmak", points: 5, keywords: ["kuver","bahşiş","servis ücreti","pahalı"] }
    ]
  },
  {
    id: "ay_33",
    question: "100 kişiye sorduk: Annelerin çocuklarına en çok söylediği tembih nedir?",
    category: "Anne Sözleri",
    answers: [
      { text: "Üstüne bir şey al, üşütürsün / Ceketini giy", points: 48, keywords: ["üşütürsün","ceket","hırka","üstüne bir şey al","mont"] },
      { text: "Terli terli soğuk su içme", points: 24, keywords: ["terli su","soğuk su","su içme","ter"] },
      { text: "Eve geç kalma / Hava kararmadan gel", points: 14, keywords: ["geç kalma","erken gel","saat","gece"] },
      { text: "Yabancılarla konuşma / Tanımadığından bir şey alma", points: 8, keywords: ["yabancı","tanımadığın","konuşma"] },
      { text: "Odanı topla / Dağıtma", points: 6, keywords: ["oda","topla","dağınık","yatak"] }
    ]
  },
  {
    id: "ay_34",
    question: "100 kişiye sorduk: Ramazan ayında iftar sofrasında mutlaka olan bir şey nedir?",
    category: "Gelenekler",
    answers: [
      { text: "Ramazan pidesi (Sıcak pide)", points: 42, keywords: ["pide","ramazan pidesi","sıcak pide","ekmek"] },
      { text: "Hurma", points: 28, keywords: ["hurma","medine hurması"] },
      { text: "Çorba (Mercimek veya Ezogelin)", points: 16, keywords: ["çorba","mercimek","ezogelin","tarhana"] },
      { text: "Güllaç tatlısı", points: 9, keywords: ["güllaç","tatlı"] },
      { text: "Zeytin / İftariyelik tabağı", points: 5, keywords: ["zeytin","iftariyelik","peynir","pastırma"] }
    ]
  },
  {
    id: "ay_35",
    question: "100 kişiye sorduk: Bir bayram sabahında yapılan ilk şey nedir?",
    category: "Bayramlar",
    answers: [
      { text: "Bayram namazına gitmek", points: 38, keywords: ["namaz","bayram namazı","cami"] },
      { text: "Yeni/temiz bayramlık kıyafetleri giymek", points: 26, keywords: ["bayramlık","kıyafet","giyinmek","elbise"] },
      { text: "Büyüklerin elini öpmek ve bayramlaşmak", points: 22, keywords: ["el öpmek","bayramlaşmak","anne baba","büyükler"] },
      { text: "Zengin aile bayram kahvaltısı", points: 9, keywords: ["kahvaltı","aile kahvaltısı","sofra"] },
      { text: "Bayram mesajı atmak / Aramak", points: 5, keywords: ["mesaj","aramak","telefon","tebrik"] }
    ]
  },
  {
    id: "ay_36",
    question: "100 kişiye sorduk: Çay bahçesinde veya kafede çayın yanına en çok ne sipariş edilir?",
    category: "Yeme & İçme",
    answers: [
      { text: "Simit", points: 40, keywords: ["simit","gevrek"] },
      { text: "Bisküvi / Kurabiye / Kek", points: 25, keywords: ["kurabiye","bisküvi","kek","pötibör"] },
      { text: "Tost (Kaşarlı / Karışık)", points: 18, keywords: ["tost","kaşarlı tost","karışık tost"] },
      { text: "Su", points: 11, keywords: ["su","şişe su"] },
      { text: "Tatlı (Baklava, Pasta vb.)", points: 6, keywords: ["tatlı","pasta","baklava","cheesecake"] }
    ]
  },
  {
    id: "ay_37",
    question: "100 kişiye sorduk: Kız isteme merasiminde mutlaka yaşanan bir gelenek nedir?",
    category: "Gelenekler",
    answers: [
      { text: "Damat kahvesine tuz atmak (Tuzlu kahve)", points: 54, keywords: ["tuzlu kahve","tuz","kahve","damat kahvesi"] },
      { text: "Çikolata ve çiçek götürmek", points: 22, keywords: ["çikolata","çiçek","gondol","buket"] },
      { text: "Allahın emri peygamberin kavliyle sözü", points: 13, keywords: ["allahın emri","peygamber","istemek","söz"] },
      { text: "Yüzük takma ve kurdele kesme", points: 7, keywords: ["yüzük","kurdele","makas","kesmek"] },
      { text: "Damat tarafının aşırı gergin oturması", points: 4, keywords: ["gerginlik","sessizlik","heyecan","utanmak"] }
    ]
  },
  {
    id: "ay_38",
    question: "100 kişiye sorduk: Sokakta seyyar arabada satılan en lezzetli sokak yiyeceği nedir?",
    category: "Sokak Lezzetleri",
    answers: [
      { text: "Simit / Açma", points: 34, keywords: ["simit","açma","gevrek"] },
      { text: "Kestane kebabı (Közde kestane)", points: 26, keywords: ["kestane","kebap","köz"] },
      { text: "Midye dolma", points: 20, keywords: ["midye","midye dolma","limonlu midye"] },
      { text: "Haşlanmış veya Közde Mısır", points: 14, keywords: ["mısır","köz mısır","haşlama mısır"] },
      { text: "Nohutlu Pilav / Tavuklu Pilav", points: 6, keywords: ["pilav","nohutlu pilav","tavuk pilav"] }
    ]
  },
  {
    id: "ay_39",
    question: "100 kişiye sorduk: Pazartesi sabahı işe ya da okula giderken hissedilen duygu nedir?",
    category: "Duygular & Ruh Halleri",
    answers: [
      { text: "Uykusuzluk / Yorgunluk", points: 46, keywords: ["uykusuzluk","yorgunluk","uyku","bitkinlik"] },
      { text: "Pazartesi sendromu / İsteksizlik", points: 28, keywords: ["sendrom","isteksizlik","gitmek istememek","bıkkınlık"] },
      { text: "Hafta sonunu şimdiden özlemek", points: 14, keywords: ["hafta sonu","özlem","cuma gelse"] },
      { text: "Trafik stresi / Öfke", points: 7, keywords: ["stres","trafik","öfke","gerginlik"] },
      { text: "Yeni haftaya umutla başlamak", points: 5, keywords: ["umut","motivasyon","enerji","iyi"] }
    ]
  },
  {
    id: "ay_40",
    question: "100 kişiye sorduk: Ev temizliği yaparken arkada mutlaka çalan veya açık olan şey nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Hareketli Türkçe Pop veya Oyun Havası şarkıları", points: 50, keywords: ["müzik","oyun havası","türkçe pop","şarkı","ankara havası"] },
      { text: "Gündüz kuşağı kadın programları (Müge Anlı vb.)", points: 26, keywords: ["müge anlı","gündüz kuşağı","kadın programı","tv"] },
      { text: "Eski bir Türk dizisi tekrarı", points: 12, keywords: ["dizi","tekrar","yaprak dökümü","aşkı memnu"] },
      { text: "Süpürgenin kendi motor sesi", points: 7, keywords: ["süpürge sesi","gürültü","motor"] },
      { text: "YouTube temizlik/vlog videoları", points: 5, keywords: ["youtube","video","podcast","vlog"] }
    ]
  },
  {
    id: "ay_41",
    question: "100 kişiye sorduk: Bir insanın grip veya nezle olduğunu gösteren en belirgin işaret nedir?",
    category: "Sağlık",
    answers: [
      { text: "Burnunun akması veya sürekli silmesi", points: 47, keywords: ["burun akıntısı","burun","mendil","silmek"] },
      { text: "Sık sık hapşırmak", points: 25, keywords: ["hapşırmak","aksırmak","hapşırık"] },
      { text: "Sesinin kısılması / Genizden konuşması", points: 14, keywords: ["ses kısıklığı","geniz","boğuk ses","ses"] },
      { text: "Gözlerinin kızarması ve sulanması", points: 8, keywords: ["göz sulanması","kızarıklık","gözler"] },
      { text: "Halsizlik ve battaniye altına girmek", points: 6, keywords: ["halsizlik","battaniye","titreme","ateş"] }
    ]
  },
  {
    id: "ay_42",
    question: "100 kişiye sorduk: Futbol maçı izlerken televizyon karşısında en çok ne yenir/içilir?",
    category: "Spor & Eğlence",
    answers: [
      { text: "Çekirdek (Ayçekirdeği)", points: 46, keywords: ["çekirdek","ayçekirdeği","çitlemek"] },
      { text: "Çay", points: 22, keywords: ["çay","demli çay"] },
      { text: "Cips / Çerez", points: 17, keywords: ["cips","çerez","kuruyemiş","fıstık"] },
      { text: "Gazlı içecek / Kola / Gazoz", points: 10, keywords: ["kola","gazoz","içecek","soğuk"] },
      { text: "Pizza veya Lahmacun", points: 5, keywords: ["pizza","lahmacun","dürüm"] }
    ]
  },
  {
    id: "ay_43",
    question: "100 kişiye sorduk: Çocukken mahallede oynanan en unutulmaz sokak oyunu nedir?",
    category: "Çocukluk & Nostalji",
    answers: [
      { text: "Saklambaç", points: 42, keywords: ["saklambaç","sobe","saklanmak"] },
      { text: "Yakan top (Ortada sıçan)", points: 24, keywords: ["yakan top","yakantop","ortada sıçan"] },
      { text: "Körebe", points: 15, keywords: ["körebe","göz bağlama"] },
      { text: "Misket / Bilye", points: 11, keywords: ["misket","bilye","cıncık"] },
      { text: "Seksek", points: 8, keywords: ["seksek","çizgi","tebeşir"] }
    ]
  },
  {
    id: "ay_44",
    question: "100 kişiye sorduk: Uzun otobüs yolculuğunda muavinin ikram ettiği şey nedir?",
    category: "Yolculuk",
    answers: [
      { text: "Kek / Topkek", points: 44, keywords: ["kek","topkek","kakaolu kek"] },
      { text: "Çay / Kahve", points: 26, keywords: ["çay","kahve","nescafe"] },
      { text: "Meyve suyu / Kola", points: 15, keywords: ["meyve suyu","kola","meşrubat"] },
      { text: "Su", points: 10, keywords: ["su","küçük su"] },
      { text: "Kolonya", points: 5, keywords: ["kolonya","limon kolonyası"] }
    ]
  },
  {
    id: "ay_45",
    question: "100 kişiye sorduk: Biri telefonla konuşurken yanındakilerin en çok duyduğu kelime nedir?",
    category: "İletişim",
    answers: [
      { text: "Efendim / Alo", points: 42, keywords: ["efendim","alo","he","buyur"] },
      { text: "Tamam / Oldu / Görüşürüz", points: 26, keywords: ["tamam","oldu","görüşürüz","hadi","baybay"] },
      { text: "Neredesin? / Ne yapıyorsun?", points: 16, keywords: ["neredesin","ne yapıyorsun","nerdesin","ne örüyon"] },
      { text: "Sesin gelmiyor / Kesiliyor", points: 10, keywords: ["sesin gelmiyor","kesiliyor","çekmiyor","alo alo"] },
      { text: "Ben seni sonra arayayım", points: 6, keywords: ["sonra arayayım","müsait değilim","kapatıyorum"] }
    ]
  },
  {
    id: "ay_46",
    question: "100 kişiye sorduk: Bir berbere veya kuaföre gidildiğinde en çok konuşulan konu nedir?",
    category: "Gündelik Hayat",
    answers: [
      { text: "Futbol ve tutulan takım", points: 38, keywords: ["futbol","maç","takım","derbi","galatasaray","fenerbahçe","beşiktaş"] },
      { text: "Siyaset ve memleket meseleleri", points: 27, keywords: ["siyaset","politika","haberler","seçim","hükümet"] },
      { text: "Piyasa, ekonomi ve pahalılık", points: 18, keywords: ["ekonomi","enflasyon","fiyatlar","pahalılık","para"] },
      { text: "Hava durumu", points: 10, keywords: ["hava","sıcaklık","yağmur","soğuk"] },
      { text: "Mahalle dedikoduları", points: 7, keywords: ["dedikodu","komşular","kim evlenmiş","kim ayrılmış"] }
    ]
  },
  {
    id: "ay_47",
    question: "100 kişiye sorduk: Pikniğe gidildiğinde mangalın üstüne konulan ilk et türü nedir?",
    category: "Yeme & İçme",
    answers: [
      { text: "Köfte", points: 42, keywords: ["köfte","kasap köfte","ızgara köfte"] },
      { text: "Tavuk kanat veya pirzola", points: 30, keywords: ["tavuk","kanat","tavuk kanat","pirzola","but"] },
      { text: "Sucuk", points: 16, keywords: ["sucuk","mangal sucuğu"] },
      { text: "Kuzu şiş / Kuşbaşı", points: 8, keywords: ["şiş","kuzu","kuşbaşı","et"] },
      { text: "Biber ve Domates (Garnitür)", points: 4, keywords: ["biber","domates","soğan","patlıcan"] }
    ]
  },
  {
    id: "ay_48",
    question: "100 kişiye sorduk: Bir evin buzdolabı kapağında mutlaka asılı olan şey nedir?",
    category: "Ev Eşyaları",
    answers: [
      { text: "Magnet / Şehir magnetleri", points: 52, keywords: ["magnet","buzdolabı magneti","süs"] },
      { text: "Su siparişi / Restoran sipariş magneti", points: 22, keywords: ["su magneti","sipariş","pideci","kebapçı","broşür"] },
      { text: "Alışveriş veya yapılacaklar listesi notu", points: 13, keywords: ["liste","not","alışveriş listesi","kağıt"] },
      { text: "Çocukların yaptığı resim", points: 8, keywords: ["resim","çocuk resmi","çizim"] },
      { text: "Nazar boncuğu", points: 5, keywords: ["nazar boncuğu","nazar","mavi boncuk"] }
    ]
  },
  {
    id: "ay_49",
    question: "100 kişiye sorduk: Anneannelerin veya babaannelerin torunlarına mutlaka ikram ettiği şey nedir?",
    category: "Aile & Sevgi",
    answers: [
      { text: "Harçlık / Gizlice cepheye para sıkıştırmak", points: 44, keywords: ["harçlık","para","para vermek","cep harçlığı"] },
      { text: "Börek / Sarmalar (Zeytinyağlı yaprak sarması)", points: 26, keywords: ["sarma","börek","yaprak sarması","dolma"] },
      { text: "Şeker / Akide şekeri / Çikolata", points: 15, keywords: ["şeker","akide şekeri","çikolata","bonbon"] },
      { text: "Meyve / Soyulmuş elma tabağı", points: 9, keywords: ["meyve","elma","soyulmuş elma","portakal"] },
      { text: "Köfte patates", points: 6, keywords: ["köfte","patates","köfte patates"] }
    ]
  },
  {
    id: "ay_50",
    question: "100 kişiye sorduk: Bir insanın çok mutlu olduğunu nasıl anlarsınız?",
    category: "Duygular",
    answers: [
      { text: "Gözlerinin içi gülmesi / Sürekli tebessüm etmesi", points: 48, keywords: ["gülmek","tebessüm","gözlerinin içi gülmek","sırıtmak"] },
      { text: "Yerinde duramaması / Zıplaması / Dans etmesi", points: 24, keywords: ["dans","zıplamak","oynamak","kıpır kıpır"] },
      { text: "Herkesle konuşup neşeli sohbet etmesi", points: 14, keywords: ["konuşkan","sohbet","anlatmak","enerji"] },
      { text: "Şarkı veya ıslık mırıldanması", points: 8, keywords: ["şarkı","ıslık","mırıldanmak"] },
      { text: "Yemek veya tatlı ısmarlamak istemesi", points: 6, keywords: ["ısmarlamak","tatlı","yemek yedirmek"] }
    ]
  },
  {
    id: "ay_51",
    question: "100 kişiye sorduk: Evde elektrikler kesilince yapılan ilk şey nedir?",
    category: "Ev Halleri",
    answers: [
      { text: "Telefonun flaşını / fenerini açmak", points: 48, keywords: ["telefon flaşı","flaş","fener","telefon","ışık"] },
      { text: "Mum veya çakmak aramak", points: 26, keywords: ["mum","çakmak","kibrit","ışıldak"] },
      { text: "Camdan dışarı/karşı apartmana bakmak (Sadece bizde mi diye)", points: 14, keywords: ["camdan bakmak","karşı apartman","sokak","komşu"] },
      { text: "Şalteri / Sigortayı kontrol etmek", points: 8, keywords: ["şalter","sigorta","attı mı","panoyu kontrol"] },
      { text: "Modem kapandı diye internete üzülmek", points: 4, keywords: ["modem","wifi","internet","bağlantı"] }
    ]
  },
  {
    id: "ay_52",
    question: "100 kişiye sorduk: Bir Türk ailesinde annenin kızınca attığı efsane eşya nedir?",
    category: "Mizah & Aile",
    answers: [
      { text: "Terlik (Güdümlü anne terliği)", points: 68, keywords: ["terlik","güdümlü terlik","naylon terlik","ıslak terlik"] },
      { text: "Yastık / Kırlent", points: 14, keywords: ["yastık","kırlent"] },
      { text: "Merdane", points: 8, keywords: ["merdane","hamur merdanesi"] },
      { text: "Kumanda", points: 6, keywords: ["kumanda","tv kumandası"] },
      { text: "Mandal / Bez parçası", points: 4, keywords: ["mandal","bez","el bezi"] }
    ]
  },
  {
    id: "ay_53",
    question: "100 kişiye sorduk: Yazın deniz kenarında şezlongda yatarken en çok ne yapılır?",
    category: "Tatil",
    answers: [
      { text: "Güneşlenmek / Bronzlaşmak", points: 42, keywords: ["güneşlenmek","bronzlaşmak","yanmak"] },
      { text: "Uyumak / Kestirmek", points: 26, keywords: ["uyumak","şekerleme","uyku","kestirmek"] },
      { text: "Telefonda gezinmek / Fotoğraf çekilmek", points: 16, keywords: ["telefon","fotoğraf","sosyal medya","story"] },
      { text: "Kitap veya dergi okumak", points: 10, keywords: ["kitap","dergi","okumak"] },
      { text: "Soğuk içecek içmek / Dondurma yemek", points: 6, keywords: ["içecek","dondurma","limonata","bira","kokteyl"] }
    ]
  },
  {
    id: "ay_54",
    question: "100 kişiye sorduk: Bir diş hekimine (dişçiye) gitmekten en çok neden korkulur?",
    category: "Korkular",
    answers: [
      { text: "Diş çekme veya iğne acısı", points: 46, keywords: ["iğne","acı","diş çekimi","can yanması","ağrı"] },
      { text: "Diş matkabının çıkardığı ses (Vızz sesi)", points: 28, keywords: ["matkap","ses","vızz","motor sesi","alet sesi"] },
      { text: "Kanal tedavisi korkusu", points: 14, keywords: ["kanal tedavisi","kanal","sinir"] },
      { text: "Ağzı uzun süre açık tutmak", points: 7, keywords: ["ağzı açık tutmak","çene yorulması","tükürük"] },
      { text: "Çıkacak yüksek muayene/tedavi ücreti", points: 5, keywords: ["fiyat","ücret","para","pahalı"] }
    ]
  },
  {
    id: "ay_55",
    question: "100 kişiye sorduk: Evde yemek yapmaya üşenildiğinde sipariş edilen ilk yemek nedir?",
    category: "Sipariş & Lezzet",
    answers: [
      { text: "Lahmacun / Pide", points: 38, keywords: ["lahmacun","pide","kıymalı pide"] },
      { text: "Pizza", points: 28, keywords: ["pizza","karışık pizza"] },
      { text: "Dürüm / Döner (Et/Tavuk döner)", points: 20, keywords: ["döner","dürüm","tavuk döner","et döner"] },
      { text: "Hamburger / Fast Food", points: 9, keywords: ["burger","hamburger","patates"] },
      { text: "Çiğ köfte", points: 5, keywords: ["çiğ köfte","çiğköfte","dürüm çiğköfte"] }
    ]
  },
  {
    id: "ay_56",
    question: "100 kişiye sorduk: Bir doğum günü partisinde mumlar üflenmeden önce ne yapılır?",
    category: "Kutlamalar",
    answers: [
      { text: "İçinden dilek tutmak", points: 58, keywords: ["dilek","dilek tutmak","niyet"] },
      { text: "İyi ki doğdun şarkısı söylemek ve alkışlamak", points: 24, keywords: ["şarkı","iyi ki doğdun","alkış","mutlu yıllar"] },
      { text: "Fotoğraf ve video çekmek", points: 10, keywords: ["fotoğraf","video","poz vermek","kamera"] },
      { text: "Işıkları kapatmak", points: 5, keywords: ["ışıklar","kapatmak","karanlık"] },
      { text: "Pastaya parmak daldırmak veya krema sürmek", points: 3, keywords: ["krema","parmak","yalamak","şaka"] }
    ]
  },
  {
    id: "ay_57",
    question: "100 kişiye sorduk: Kar yağdığında dışarı çıkıp yapılan en popüler şey nedir?",
    category: "Kış & Doğa",
    answers: [
      { text: "Kardan adam yapmak", points: 46, keywords: ["kardan adam","kardan adam yapmak","havuç"] },
      { text: "Kartopu savaşı oynamak", points: 34, keywords: ["kartopu","kartopu savaşı","kartopu oynamak"] },
      { text: "Poşetle veya kızakla kaymak", points: 10, keywords: ["kaymak","poşet","kızak","yokuş"] },
      { text: "Kar üstünde yürüyüp çıtırtı sesini dinlemek / Fotoğraf çekmek", points: 6, keywords: ["fotoğraf","yürümek","çıtırtı","manzara"] },
      { text: "Karın tadına bakmak / Kar yemek", points: 4, keywords: ["kar yemek","tatmak","ağzına kar almak"] }
    ]
  },
  {
    id: "ay_58",
    question: "100 kişiye sorduk: Taksiye binen bir yolcunun şoföre ilk söylediği şey nedir?",
    category: "Ulaşım",
    answers: [
      { text: "Gideceği adresi / Semti söylemek", points: 52, keywords: ["adres","nereye gideceği","kadıköy","beşiktaş","kızılay","şuraya"] },
      { text: "Selamünaleyküm / Kolay gelsin", points: 26, keywords: ["kolay gelsin","merhaba","selam","iyi günler"] },
      { text: "Kredi kartı geçiyor mu? / Pos var mı?", points: 12, keywords: ["kredi kartı","pos","kart","nakit mi"] },
      { text: "Acelem var biraz hızlı gidebilir miyiz?", points: 6, keywords: ["acelem var","hızlı","yetişmem lazım"] },
      { text: "Taksi boş mu? / Müsait misiniz?", points: 4, keywords: ["boş mu","alıyor musunuz","müsait misiniz"] }
    ]
  },
  {
    id: "ay_59",
    question: "100 kişiye sorduk: Bir işte terfi alan veya maaşına zam gelen birinden arkadaşları ne ister?",
    category: "İş & Kariyer",
    answers: [
      { text: "Yemek / Tatlı ısmarlaması (Islatmak)", points: 64, keywords: ["yemek","tatlı","ısmarlamak","ıslatmak","baklava","kutlama"] },
      { text: "Borç para istemek", points: 16, keywords: ["borç","para","borç vermek"] },
      { text: "Bizi de yanına al / Torpil yap demesi", points: 11, keywords: ["torpil","bizi de al","yanına çek","yardım et"] },
      { text: "Tebrik edip alkışlamak", points: 6, keywords: ["tebrik","alkış","kutlamak"] },
      { text: "Hediye istemek", points: 3, keywords: ["hediye","bize ne aldın"] }
    ]
  },
  {
    id: "ay_60",
    question: "100 kişiye sorduk: Kahvehanede oturan amcaların en çok oynadığı masa oyunu nedir?",
    category: "Kahvehane Kültürü",
    answers: [
      { text: "Okey (Düz veya 101 Okey)", points: 54, keywords: ["okey","101","taş","ıstaka"] },
      { text: "Tavla", points: 28, keywords: ["tavla","zar","mars","kapı"] },
      { text: "Batak / Pişti (Kağıt oyunları)", points: 12, keywords: ["batak","pişti","kağıt","iskambil","king"] },
      { text: "Domino", points: 4, keywords: ["domino"] },
      { text: "Satranç veya Dama", points: 2, keywords: ["satranç","dama"] }
    ]
  },
  {
    id: "ay_61",
    question: "100 kişiye sorduk: Bir lunaparkta en çok korkulan veya çığlık atılan alet nedir?",
    category: "Eğlence Parkı",
    answers: [
      { text: "Hız Treni (Roller Coaster)", points: 44, keywords: ["hız treni","roller coaster","tren"] },
      { text: "Gondol", points: 24, keywords: ["gondol","uçan gemi"] },
      { text: "Kamikaze / Ranger", points: 16, keywords: ["kamikaze","ranger","ters dönen"] },
      { text: "Korku Tüneli", points: 10, keywords: ["korku tüneli","korku evi"] },
      { text: "Dönme Dolap (Yükseklik korkusu olanlar için)", points: 6, keywords: ["dönme dolap","yükseklik"] }
    ]
  },
  {
    id: "ay_62",
    question: "100 kişiye sorduk: Çarşıda veya pazarda satıcıların müşteriyi çekmek için bağırdığı bir söz nedir?",
    category: "Pazar Kültürü",
    answers: [
      { text: "Gel abla gel / Gel abi gel!", points: 48, keywords: ["gel abla","gel abi","gel vatandaş","koş"] },
      { text: "Bedava bunlar bedava / Batan geminin malları!", points: 24, keywords: ["bedava","batan gemi","ucuz","kelepir"] },
      { text: "Taze bunlar taze / Dalından yeni koptu!", points: 14, keywords: ["taze","dalından","günlük","çıtır çıtır"] },
      { text: "Yarım kilo alana bir kilo bedava / Kampanya!", points: 8, keywords: ["kampanya","indirim","üç al iki öde"] },
      { text: "Tadına bakmadan geçme / Şeker bunlar şeker!", points: 6, keywords: ["şeker","tadına bak","bal bunlar"] }
    ]
  },
  {
    id: "ay_63",
    question: "100 kişiye sorduk: Bir insanın yeni eve taşınırken en çok zorlandığı şey nedir?",
    category: "Taşınma",
    answers: [
      { text: "Koli toplamak ve sonra kolileri açmak", points: 46, keywords: ["koli","koli yapmak","kutu","toplamak","açmak"] },
      { text: "Ağır mobilyaları ve beyaz eşyayı taşımak", points: 28, keywords: ["mobilya","beyaz eşya","buzdolabı","koltuk","ağır"] },
      { text: "Yeni evi köşe bucak temizlemek", points: 14, keywords: ["temizlik","boya badana","ev temizliği"] },
      { text: "Nakliyecilerle anlaşmak veya tartışmak", points: 8, keywords: ["nakliye","nakliyeci","kamyon"] },
      { text: "Abonelikleri (Elektrik, Su, İnternet) taşımak", points: 4, keywords: ["abonelik","internet","doğalgaz","su"] }
    ]
  },
  {
    id: "ay_64",
    question: "100 kişiye sorduk: Karadeniz denilince akla gelen ilk şey nedir?",
    category: "Türkiye Coğrafyası",
    answers: [
      { text: "Hamsi ve Hamsili yemekler", points: 44, keywords: ["hamsi","balık","hamsili pilav"] },
      { text: "Çay ve Çay bahçeleri", points: 26, keywords: ["çay","rize","çay tarlası"] },
      { text: "Horon ve Kemençe", points: 15, keywords: ["horon","kemençe","tulum"] },
      { text: "Sürekli yağmur ve yeşil yaylalar", points: 10, keywords: ["yağmur","yayla","yeşillik","sis","ayder"] },
      { text: "Karadeniz fıkraları ve Temel", points: 5, keywords: ["fıkra","temel","şive","karadenizli"] }
    ]
  },
  {
    id: "ay_65",
    question: "100 kişiye sorduk: Ege Bölgesi denilince akla gelen ilk lezzet veya özellik nedir?",
    category: "Türkiye Coğrafyası",
    answers: [
      { text: "Zeytin ve Zeytinyağlı yemekler", points: 48, keywords: ["zeytinyağı","zeytin","zeytinyağlı"] },
      { text: "Ege otları (Şevketibostan, Deniz börülcesi vb.)", points: 22, keywords: ["ot","ege otları","börülce","radika"] },
      { text: "Boyoz ve Gevrek (İzmir)", points: 14, keywords: ["boyoz","gevrek","kumru"] },
      { text: "Güzel tatil beldeleri (Bodrum, Çeşme, Alaçatı)", points: 10, keywords: ["bodrum","çeşme","alaçatı","deniz","tatil"] },
      { text: "Sıcakkanlı ve neşeli insanları", points: 6, keywords: ["insanlar","sıcakkanlı","rahat","huzur"] }
    ]
  },
  {
    id: "ay_66",
    question: "100 kişiye sorduk: Gaziantep denilince akla gelen ilk lezzet nedir?",
    category: "Gaziantep & Mutfak",
    answers: [
      { text: "Baklava (Fıstıklı baklava)", points: 52, keywords: ["baklava","antep baklavası","fıstıklı baklava"] },
      { text: "Antep fıstığı", points: 22, keywords: ["fıstık","antep fıstığı"] },
      { text: "Kebap (Ali Nazik, Küşleme vb.)", points: 14, keywords: ["kebap","ali nazik","küşleme","lahmacun"] },
      { text: "Beyran çorbası", points: 8, keywords: ["beyran","çorba"] },
      { text: "Katmer", points: 4, keywords: ["katmer","tatlı"] }
    ]
  },
  {
    id: "ay_67",
    question: "100 kişiye sorduk: Bir lunaparkta veya panayırda çocukların elinde görülen tatlı yiyecek nedir?",
    category: "Tatlılar",
    answers: [
      { text: "Pamuk şeker (Pembe pamuk şeker)", points: 54, keywords: ["pamuk şeker","pamuk","şeker"] },
      { text: "Elma şekeri", points: 26, keywords: ["elma şekeri","kırmızı elma"] },
      { text: "Dondurma (Maraş dondurması)", points: 12, keywords: ["dondurma","külah","maraş"] },
      { text: "Patlamış mısır", points: 5, keywords: ["mısır","patlamış mısır","popcorn"] },
      { text: "Macun (Osmanlı macunu)", points: 3, keywords: ["macun","osmanlı macunu"] }
    ]
  },
  {
    id: "ay_68",
    question: "100 kişiye sorduk: Hafta sonu balık tutmaya giden birinin yanında mutlaka olan şey nedir?",
    category: "Hobiler",
    answers: [
      { text: "Olta takımı ve misina", points: 48, keywords: ["olta","misina","iğne","kamış"] },
      { text: "Yem (Solucan, ekmek, kurt)", points: 24, keywords: ["yem","solucan","ekmek içi","karides"] },
      { text: "Kova / Balık filesi (Tuttuğu balıklar için)", points: 14, keywords: ["kova","file","leğen"] },
      { text: "Termos (Çay/Kahve)", points: 9, keywords: ["termos","çay","kahve"] },
      { text: "Katlanır kamp sandalyesi", points: 5, keywords: ["sandalye","kamp sandalyesi","tabure"] }
    ]
  },
  {
    id: "ay_69",
    question: "100 kişiye sorduk: Bir insanın telefonunda en çok şarj tüketen uygulama veya özellik nedir?",
    category: "Teknoloji",
    answers: [
      { text: "Instagram / TikTok (Video izlemek)", points: 46, keywords: ["instagram","tiktok","reels","video","sosyal medya"] },
      { text: "Oyunlar (Mobil oyunlar)", points: 24, keywords: ["oyun","pubg","mobil oyun"] },
      { text: "Navigasyon / Harita (GPS)", points: 14, keywords: ["navigasyon","harita","gps","konum"] },
      { text: "Kamera / Video kaydı", points: 10, keywords: ["kamera","video","fotoğraf"] },
      { text: "Ekran parlaklığının sonuna kadar açık olması", points: 6, keywords: ["ekran","parlaklık","ışık"] }
    ]
  },
  {
    id: "ay_70",
    question: "100 kişiye sorduk: Bir arkadaş ortamında ortamı en çok neşelendiren kişi kimdir?",
    category: "Sosyal Yaşam",
    answers: [
      { text: "Sürekli espri yapan / Komik anlatan (Grubun komedyeni)", points: 56, keywords: ["espri","komik","güldüren","komedyen","şakacı"] },
      { text: "Gitar çalan veya şarkı söyleyen kişi", points: 18, keywords: ["gitar","şarkı","müzisyen","türkü"] },
      { text: "Yemek veya tatlı ısmarlayan bonkör kişi", points: 12, keywords: ["ısmarlayan","bonkör","cömert","yediren"] },
      { text: "Enerjik ve herkesi oyuna/dansa kaldıran kişi", points: 9, keywords: ["dans","enerjik","hareketli","oyun"] },
      { text: "En taze dedikoduları ve haberleri getiren kişi", points: 5, keywords: ["dedikodu","haber","anlatan"] }
    ]
  }
];

export const AILELER_YARISIYOR_KIDS_QUESTIONS = [
  {
    id: "ay_kid_1",
    question: "100 çocuğa sorduk: Okul çantasında en çok bulunan eğlenceli eşya nedir?",
    category: "Çocuk Dünyası",
    answers: [
      { text: "Renkli Kalemler / Boyalar", points: 44, keywords: ["boya","renkli kalem","fosforlu"] },
      { text: "Oyun Hamuru veya Slime", points: 24, keywords: ["hamur","oyun hamuru","slime"] },
      { text: "Çizgi Roman / Hikaye Kitabı", points: 16, keywords: ["kitap","çizgi roman","hikaye"] },
      { text: "Küçük Oyuncak Figür", points: 11, keywords: ["oyuncak","figür","araba","bebek"] },
      { text: "Atıştırmalık / Çikolata", points: 5, keywords: ["çikolata","kek","bisküvi"] }
    ]
  },
  {
    id: "ay_kid_2",
    question: "100 çocuğa sorduk: Süper kahraman olsaydın sahip olmak isteyeceğin ilk güç ne olurdu?",
    category: "Hayal Gücü",
    answers: [
      { text: "Uçabilmek", points: 46, keywords: ["uçmak","uçabilmek","kanat"] },
      { text: "Görünmez Olmak", points: 26, keywords: ["görünmez","kaybolmak"] },
      { text: "Süper Hızlı Koşmak", points: 15, keywords: ["hız","flash","hızlı koşmak"] },
      { text: "Zamanı Durdurmak", points: 9, keywords: ["zaman","durdurmak","zamanı durdurma"] },
      { text: "Akıl Okuyabilmek", points: 4, keywords: ["akıl","düşünce","zihin okuma"] }
    ]
  },
  {
    id: "ay_kid_3",
    question: "100 çocuğa sorduk: En sevilen dondurma çeşidi hangisidir?",
    category: "Tatlılar",
    answers: [
      { text: "Çikolatalı", points: 43, keywords: ["çikolata","çikolatalı","kakaolu"] },
      { text: "Çilekli", points: 27, keywords: ["çilek","çilekli","pembe"] },
      { text: "Vanilyalı", points: 16, keywords: ["vanilya","vanilyalı","sade"] },
      { text: "Muzlu", points: 9, keywords: ["muz","muzlu","sarı"] },
      { text: "Karamelli", points: 5, keywords: ["karamel","karamelli"] }
    ]
  },
  {
    id: "ay_kid_4",
    question: "100 çocuğa sorduk: Evcil hayvan olarak en çok hangisi istenir?",
    category: "Sevimli Dostlar",
    answers: [
      { text: "Köpek (Yavru köpek)", points: 48, keywords: ["köpek","yavru köpek","puppy"] },
      { text: "Kedi", points: 31, keywords: ["kedi","yavru kedi","tekir"] },
      { text: "Muhabbet Kuşu / Papağan", points: 11, keywords: ["kuş","muhabbet kuşu","papağan"] },
      { text: "Tavşan / Hamster", points: 7, keywords: ["tavşan","hamster"] },
      { text: "Akvaryum Balığı", points: 3, keywords: ["balık","japon balığı"] }
    ]
  },
  {
    id: "ay_kid_5",
    question: "100 çocuğa sorduk: En sevilen çizgi film hangisidir?",
    category: "Çizgi Film",
    answers: [
      { text: "Kral Şakir", points: 42, keywords: ["kral şakir","şakir","fil necati"] },
      { text: "Rafadan Tayfa", points: 28, keywords: ["rafadan tayfa","rafadan","hayri"] },
      { text: "SüngerBob", points: 15, keywords: ["süngerbob","patrick"] },
      { text: "Tom ve Jerry", points: 10, keywords: ["tom","jerry","kedi fare"] },
      { text: "Pepee / Niloya", points: 5, keywords: ["pepee","niloya"] }
    ]
  },
  {
    id: "ay_kid_6",
    question: "100 çocuğa sorduk: Teneffüste bahçede en çok oynanan oyun nedir?",
    category: "Okul & Oyun",
    answers: [
      { text: "Kovalamaca / Yakalamaca", points: 44, keywords: ["kovalamaca","yakalamaca","ebe"] },
      { text: "Futbol (Maç yapmak)", points: 27, keywords: ["futbol","maç","top","şut"] },
      { text: "Saklambaç", points: 14, keywords: ["saklambaç","sobe"] },
      { text: "Yakan top", points: 10, keywords: ["yakan top","yakantop"] },
      { text: "İp atlama", points: 5, keywords: ["ip","ip atlama"] }
    ]
  },
  {
    id: "ay_kid_7",
    question: "100 çocuğa sorduk: Büyüyünce en çok hangi meslek olmak istersin?",
    category: "Hayaller & Meslekler",
    answers: [
      { text: "Doktor", points: 38, keywords: ["doktor","hekim","cerrah"] },
      { text: "Polis / Asker", points: 26, keywords: ["polis","asker","komiser"] },
      { text: "Öğretmen", points: 16, keywords: ["öğretmen","hoca"] },
      { text: "Pilot / Astronot", points: 12, keywords: ["pilot","astronot","uçak"] },
      { text: "Futbolcu / YouTuber", points: 8, keywords: ["futbolcu","youtuber","oyuncu"] }
    ]
  },
  {
    id: "ay_kid_8",
    question: "100 çocuğa sorduk: Annelerin en lezzetli yaptığı yemek nedir?",
    category: "Anne Mutfağı",
    answers: [
      { text: "Köfte Patates", points: 46, keywords: ["köfte","patates","patates kızartması"] },
      { text: "Makarna", points: 25, keywords: ["makarna","spagetti","salçalı"] },
      { text: "Pizza veya Börek", points: 14, keywords: ["pizza","börek","poğaça"] },
      { text: "Sarma / Dolma", points: 9, keywords: ["sarma","yaprak sarması","dolma"] },
      { text: "Tavuk Pilav", points: 6, keywords: ["pilav","tavuk","pirinç pilavı"] }
    ]
  },
  {
    id: "ay_kid_9",
    question: "100 çocuğa sorduk: En sevilen bilgisayar veya mobil oyun nedir?",
    category: "Oyun Dünyası",
    answers: [
      { text: "Minecraft", points: 42, keywords: ["minecraft","blok","küp"] },
      { text: "Roblox", points: 30, keywords: ["roblox","brookhaven"] },
      { text: "Brawl Stars", points: 14, keywords: ["brawl stars","brawl","elmas"] },
      { text: "PUBG Mobile", points: 8, keywords: ["pubg","pubg mobile"] },
      { text: "Subway Surfers", points: 6, keywords: ["subway","subway surfers","tren"] }
    ]
  },
  {
    id: "ay_kid_10",
    question: "100 çocuğa sorduk: Bir doğum günü partisinde en çok heyecanlandıran şey nedir?",
    category: "Parti & Eğlence",
    answers: [
      { text: "Hediye paketlerini açmak", points: 48, keywords: ["hediye","hediyeler","paket açmak"] },
      { text: "Doğum günü pastası ve mum üflemek", points: 26, keywords: ["pasta","mum","üflemek"] },
      { text: "Arkadaşlarla oyun oynamak / Dans etmek", points: 14, keywords: ["oyun","dans","arkadaşlar"] },
      { text: "Palyaço veya sihirbaz gösterisi", points: 7, keywords: ["palyaço","sihirbaz","gösteri"] },
      { text: "Balon patlatmak", points: 5, keywords: ["balon","balon patlatma"] }
    ]
  }
];

/**
 * Kullanıcı girdisini akıllı anahtar kelime eşleştirmesi ile panodaki cevapla eşler.
 * @param {string} input - Kullanıcının yazdığı veya söylediği cevap
 * @param {Array} answers - Panodaki cevap listesi
 * @returns {number} Eşleşen cevabın indeksi (-1 bulunamazsa)
 */
// Yaygın Türkçe Eş Anlamlılar ve Yakın Kavramlar Sözlüğü (Akıllı Hakem Asistanı)
const TURKISH_SYNONYMS = {
  'ayakkabı': ['pabuç', 'kundura', 'çizme', 'bot', 'terlik', 'çarık'],
  'araba': ['otomobil', 'taşıt', 'araç', 'vasıta', 'oto'],
  'para': ['nakit', 'cüzdan', 'banknot', 'madeni', 'dolar', 'avro', 'tl'],
  'ev': ['daire', 'konut', 'apartman', 'hane', 'yuva', 'villa'],
  'çay': ['demlik', 'çaydanlık', 'semaver', 'bardak', 'fincan'],
  'kahve': ['nescafe', 'espresso', 'türk kahvesi', 'fincan', 'cezve'],
  'öğretmen': ['muallim', 'hoca', 'eğitmen', 'öğretici'],
  'öğrenci': ['talebe', 'okullu', 'çocuk'],
  'doktor': ['hekim', 'tabip', 'sağlıkçı', 'uzman'],
  'telefon': ['cep', 'akıllı telefon', 'mobil', 'ahize'],
  'televizyon': ['tv', 'ekran', 'kumanda'],
  'bilgisayar': ['pc', 'laptop', 'dizüstü', 'tablet'],
  'kitap': ['roman', 'hikaye', 'eser', 'ansiklopedi', 'mecmua'],
  'çanta': ['sırt çantası', 'bavul', 'valiz', 'el çantası', 'torba'],
  'gözlük': ['güneş gözlüğü', 'lens', 'çerçeve'],
  'saat': ['kol saati', 'duvar saati', 'kronometre', 'çalar saat'],
  'yemek': ['aş', 'sofra', 'öğün', 'besin', 'gıda', 'ziyafet'],
  'ekmek': ['somun', 'pide', 'francala', 'lavaş'],
  'su': ['damacana', 'şişe', 'kaynak', 'maden suyu'],
  'deniz': ['sahil', 'kumsal', 'plaj', 'okyanus'],
  'anne': ['valide', 'ana', 'anneciğim', 'mami'],
  'baba': ['peder', 'babacığım', 'babişko'],
  'kardeş': ['abi', 'abla', 'bacı', 'birader']
};

/**
 * 2 Karakter Dizisi Arasındaki Levenshtein Düzenleme Mesafesi (Harf Hatası Toleransı)
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Akıllı Yakın Cevap Hakem Asistanı:
 * Kullanıcının yazdığı veya söylediği cevabı panodaki cevaplarla esnekçe karşılaştırır.
 * Eş anlamlı, yakın kelime veya 1-2 harf hatasını yakalar.
 * @returns {null | { index: number, answer: object, confidence: string, reason: string }}
 */
export function findSmartAnswerSuggestion(input, answers, revealedAnswers = {}) {
  if (!input || typeof input !== 'string') return null;
  const cleanInput = input.trim().toLocaleLowerCase('tr-TR');
  if (cleanInput.length < 2) return null;

  // 1. Doğrudan veya anahtar kelime eşleşmesi
  for (let i = 0; i < answers.length; i++) {
    if (revealedAnswers[i]) continue;
    const ans = answers[i];
    const cleanText = ans.text.toLocaleLowerCase('tr-TR');

    if (cleanText === cleanInput || cleanText.includes(cleanInput) || cleanInput.includes(cleanText)) {
      return { index: i, answer: ans, confidence: 'exact', reason: 'Tam / Kısmi İsim Eşleşmesi' };
    }

    if (ans.keywords && Array.isArray(ans.keywords)) {
      for (const kw of ans.keywords) {
        const cleanKw = kw.toLocaleLowerCase('tr-TR');
        if (cleanInput.includes(cleanKw) || cleanKw.includes(cleanInput)) {
          return { index: i, answer: ans, confidence: 'keyword', reason: `Anahtar Kelime: "${kw}"` };
        }
      }
    }
  }

  // 2. Eş Anlamlı & Kavramsal Yakınlık Denetimi
  for (let i = 0; i < answers.length; i++) {
    if (revealedAnswers[i]) continue;
    const ans = answers[i];
    const cleanText = ans.text.toLocaleLowerCase('tr-TR');

    // Panodaki kelime eş anlamlılar listesinde var mı?
    for (const [keyWord, synList] of Object.entries(TURKISH_SYNONYMS)) {
      const matchPano = cleanText.includes(keyWord);
      const matchInput = synList.some(s => cleanInput.includes(s) || s.includes(cleanInput));

      if (matchPano && matchInput) {
        return { index: i, answer: ans, confidence: 'synonym', reason: `Yakın Kavram / Eş Anlam (${cleanInput} ≈ ${keyWord})` };
      }

      // Veya tersi (kullanıcının söylediği ana kelime, panoda eş anlamlısı var)
      const inputIsKey = cleanInput.includes(keyWord);
      const panoHasSyn = synList.some(s => cleanText.includes(s));
      if (inputIsKey && panoHasSyn) {
        return { index: i, answer: ans, confidence: 'synonym', reason: `Yakın Kavram (${keyWord} ≈ ${ans.text})` };
      }
    }
  }

  // 3. Yazım / Harf Hatası Toleransı (Levenshtein Distance)
  for (let i = 0; i < answers.length; i++) {
    if (revealedAnswers[i]) continue;
    const ans = answers[i];
    const cleanText = ans.text.toLocaleLowerCase('tr-TR');

    // Kelimeleri bölerek de test et
    const panoWords = cleanText.split(/\s+/);
    for (const pw of panoWords) {
      if (pw.length >= 4 && cleanInput.length >= 4) {
        const dist = levenshteinDistance(pw, cleanInput);
        if (dist <= 2) {
          return { index: i, answer: ans, confidence: 'fuzzy', reason: `Yazım Toleransı ("${cleanInput}" ≈ "${pw}")` };
        }
      }
    }
  }

  return null;
}

/**
 * Kullanıcı girdisini mevcut cevaplarla eşleştirmeye çalışır
 * @param {string} input - Kullanıcı girdisi
 * @param {Array} answers - Soruya ait cevaplar dizisi
 * @returns {number} Eşleşen cevabın indeksi (-1 bulunamazsa)
 */
export function matchAnswerIndex(input, answers) {
  if (!input) return -1;
  const suggestion = findSmartAnswerSuggestion(input, answers, {});
  return suggestion ? suggestion.index : -1;
}
