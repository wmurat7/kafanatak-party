// js/passaparola-game.js
// Kafana Tak! - Efsane A'dan Z'ye Passaparola Alfabe Arenası
// 1 Sunucu (Cevapları görür, Doğru/Yanlış/Pas basar) & Sırayla Yarışan Oyuncular Modu

import { sounds } from './audio.js';
import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';
import { HostModerationPanel } from './host-moderation-panel.js';

if (typeof window !== 'undefined' && QRCode) {
  window.QRCode = QRCode;
}

export const PASSAPAROLA_LETTERS = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 
  'H', 'I', 'İ', 'K', 'L', 'M', 'N', 'O', 
  'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'V', 
  'Y', 'Z'
];

export const PASSAPAROLA_QUESTIONS_DB = [
{ letter: 'A', question: 'Gök cisimlerinin hareketlerini ve evreni inceleyen bilim dalı', answer: 'ASTRONOMİ' },
  { letter: 'A', question: 'Türkiye\'nin güneyinde yer alan, kıyısında Antalya ve Mersin bulunan deniz', answer: 'AKDENİZ' },
  { letter: 'A', question: 'Türkiye Cumhuriyeti\'nin başkenti ve Anıtkabir\'in bulunduğu ilimiz', answer: 'ANKARA' },
  { letter: 'A', question: 'Haritaları ve coğrafi bilgileri bir arada toplayan ciltli kitap', answer: 'ATLAS' },

  { letter: 'B', question: 'Suda solungaçlarıyla nefes alan yüzgeçli omurgalı canlı', answer: 'BALIK' },
  { letter: 'B', question: 'İki tekerlekli, insan gücüyle pedalları çevrilerek sürülen binek araç', answer: 'BİSİKLET' },
  { letter: 'B', question: 'Asya ile Avrupa kıtalarını birbirinden ayıran dünyaca ünlü deniz geçidi', answer: 'BOĞAZİÇİ' },
  { letter: 'B', question: 'Gökyüzünde su buharının yoğunlaşmasıyla oluşan beyaz veya gri kütle', answer: 'BULUT' },

  { letter: 'C', question: 'Para, kimlik ve banka kartlarını taşımaya yarayan küçük deri cep cüzdanı', answer: 'CÜZDAN' },
  { letter: 'C', question: 'Sert kabuğu kırıldığında beyni andıran faydalı bir kuruyemiş türü', answer: 'CEVİZ' },
  { letter: 'C', question: 'Yeryüzünü, iklimleri ve ülkeleri inceleyen temel bilim dalı', answer: 'COĞRAFYA' },
  { letter: 'C', question: 'Müslümanların topluca ibadet ettiği minareli kubbeli kutsal mabet', answer: 'CAMİ' },

  { letter: 'Ç', question: 'Kakao çekirdeklerinden üretilen, sütlüsü ve bitteri olan tatlı yiyecek', answer: 'ÇİKOLATA' },
  { letter: 'Ç', question: 'İnce belli bardakta içilen, Karadeniz\'de yetişen milli sıcak içeceğimiz', answer: 'ÇAY' },
  { letter: 'Ç', question: 'Yüzyıllarca yaşayabilen, heybetli ve geniş gövdeli ulu bir ağaç türü', answer: 'ÇINAR' },
  { letter: 'Ç', question: 'Bitkilerin üreme organı olan, güzel kokulu ve rengarenk açan bölümü', answer: 'ÇİÇEK' },

  { letter: 'D', question: 'Tıp eğitimi almış, hastalıkları teşhis ve tedavi eden meslek insanı', answer: 'DOKTOR' },
  { letter: 'D', question: 'Okyanusla bağlantısı olan, tuzlu büyük su kütlesi', answer: 'DENİZ' },
  { letter: 'D', question: 'Güneş sistemi içinde üzerinde hayat barındıran mavi gezegenimiz', answer: 'DÜNYA' },
  { letter: 'D', question: 'Uzak mesafelerdeki nesneleri büyütüp yakından görmeyi sağlayan optik alet', answer: 'DÜRBÜN' },

  { letter: 'E', question: 'Fırınlarda un, su ve mayayla pişirilen temel sofralık gıda', answer: 'EKMEK' },
  { letter: 'E', question: 'Amasya ile özdeşleşen, kırmızı veya yeşil sulu meyve', answer: 'ELMA' },
  { letter: 'E', question: 'Duygu, düşünce ve hayalleri dil aracılığıyla estetik biçimde anlatan sanat', answer: 'EDEBİYAT' },
  { letter: 'E', question: 'Vücudu zinde ve sağlıklı tutmak için yapılan bedensel hareketler', answer: 'EGZERSİZ' },

  { letter: 'F', question: 'On birer kişilik iki takım arasında topla oynanan en popüler spor dalı', answer: 'FUTBOL' },
  { letter: 'F', question: 'Karadeniz bölgesinde fındık ocaklarında yetişen kabuklu meşhur kuruyemiş', answer: 'FINDIK' },
  { letter: 'F', question: 'Varlık, bilgi ve ahlak üzerine derin akıl yürüten düşünce disiplini', answer: 'FELSEFE' },
  { letter: 'F', question: 'Çok sert esen ve çevreye zarar verebilen şiddetli rüzgar', answer: 'FIRTINA' },

  { letter: 'G', question: 'Gündüz dünyamızı aydınlatan ve ısıtan en yakın yıldız', answer: 'GÜNEŞ' },
  { letter: 'G', question: 'Daha iyi görmek veya güneşten korunmak için gözün önüne takılan çerçeveli cam', answer: 'GÖZLÜK' },
  { letter: 'G', question: 'Yağmurdan sonra güneş açınca gökyüzünde beliren 7 renkli yay', answer: 'GÖKKUŞAĞI' },
  { letter: 'G', question: 'Denizlerde ve göllerde yolcu ya da yük taşıyan büyük yüzen taşıt', answer: 'GEMİ' },

  { letter: 'H', question: 'Hasta ve yaralıların tedavi edildiği yataklı büyük sağlık kuruluşu', answer: 'HASTANE' },
  { letter: 'H', question: 'Tavşanların çok sevdiği, turuncu renkli kök sebze', answer: 'HAVUÇ' },
  { letter: 'H', question: 'Taş, kil, tunç veya ahşaptan yontularak yapılan üç boyutlu sanat eseri', answer: 'HEYKEL' },
  { letter: 'H', question: 'Yeryüzünün tamamını veya bir parçasını ölçekli olarak gösteren çizim', answer: 'HARİTA' },

  { letter: 'I', question: 'Karanlığı aydınlatan ve nesneleri görmemizi sağlayan fiziksel enerji', answer: 'IŞIK' },
  { letter: 'I', question: 'Temel Reis\'in güçlenmek için yediği demir zengini yeşil yapraklı sebze', answer: 'ISPANAK' },
  { letter: 'I', question: 'Genellikle göllere veya denizlere dökülen geniş ve uzun akarsu', answer: 'IRMAK' },
  { letter: 'I', question: 'Kışın demlenerek içilen, güzel kokulu sarı çiçekleri olan şifalı ağaç', answer: 'IHLAMUR' },

  { letter: 'İ', question: 'Türkiye\'nin en kalabalık ve Boğaziçi ile iki kıtayı bağlayan megakenti', answer: 'İSTANBUL' },
  { letter: 'İ', question: 'Dikiş dikerken ipliğin geçirildiği delikli ince metal araç', answer: 'İĞNE' },
  { letter: 'İ', question: 'Tüm dünyadaki bilgisayarları ve telefonları birbirine bağlayan dev ağ', answer: 'İNTERNET' },
  { letter: 'İ', question: 'Kıyıya yanaşan vapur veya teknelerin yolcu indirip bindirdiği platform', answer: 'İSKELE' },

  { letter: 'K', question: 'Kış mevsiminde yağan beyaz renkli hafif buz kristalleri', answer: 'KAR' },
  { letter: 'K', question: 'Fincanda köpüklü pişirilen, 40 yıl hatırı olan geleneksel içeceğimiz', answer: 'KAHVE' },
  { letter: 'K', question: 'Basılı ya da yazılı sayfaların ciltlenmesiyle oluşan okuma hazinesi', answer: 'KİTAP' },
  { letter: 'K', question: 'Tarihi kentleri düşman saldırılarından korumak için yapılan taş burçlu hisar', answer: 'KALE' },

  { letter: 'L', question: 'Salata ve çorbalara sıkılan sarı renkli, C vitamini zengini ekşi narenciye', answer: 'LİMON' },
  { letter: 'L', question: 'Karanlıkta elektrikle aydınlatma sağlayan araç', answer: 'LAMBA' },
  { letter: 'L', question: 'Gemilerin yanaştığı, yük alıp boşalttığı sığınaklı kıyı tesisi', answer: 'LİMAN' },
  { letter: 'L', question: 'İçinden çıkılması güç, çok sayıda karmaşık geçidi olan yol şebekesi', answer: 'LABİRENT' },

  { letter: 'M', question: 'Üzerinde yemek yenilen veya çalışılan dört ayaklı yaygın mobilya', answer: 'MASA' },
  { letter: 'M', question: 'Nota ve seslerin ahenkli birleşimiyle kulağa hoş gelen sanat dalı', answer: 'MÜZİK' },
  { letter: 'M', question: 'Yılın ilkbahar, yaz, sonbahar ve kış olarak dörde ayrılan dönemlerinden her biri', answer: 'MEVSİM' },
  { letter: 'M', question: 'Demir, nikel gibi metalleri kendine çeken manyetik kutuplu madde', answer: 'MIKNATIS' },

  { letter: 'N', question: 'Yılın dördüncü ayı, ilkbaharın ortası', answer: 'NİSAN' },
  { letter: 'N', question: 'Kabuğu soyulduğunda içinden yüzlerce kırmızı tanecik çıkan bereket meyvesi', answer: 'NAR' },
  { letter: 'N', question: 'Deniz, göl veya başka bir akarsuya dökülen büyük su yolu', answer: 'NEHİR' },
  { letter: 'N', question: 'Müzikte seslerin perdesini ve süresini belirten evrensel işaretler', answer: 'NOTA' },

  { letter: 'O', question: 'Öğrencilerin eğitim gördüğü ve öğretmenlerin ders anlattığı bina', answer: 'OKUL' },
  { letter: 'O', question: 'Çok sayıda ağacın bir arada bulunduğu geniş yeşil doğal alan', answer: 'ORMAN' },
  { letter: 'O', question: 'Kıtaları birbirinden ayıran uçsuz bucaksız engin su kütlesi', answer: 'OKYANUS' },
  { letter: 'O', question: 'Şehir içi veya şehirler arası çok sayıda yolcu taşıyan büyük motorlu taşıt', answer: 'OTOBÜS' },

  { letter: 'Ö', question: 'Okullarda öğrencilere bilgi öğreten ve yol gösteren saygıdeğer eğitimci', answer: 'ÖĞRETMEN' },
  { letter: 'Ö', question: 'Suda yüzebilen, yassı gagalı ve "vak vak" diye ses çıkaran evcil kuş', answer: 'ÖRDEK' },
  { letter: 'Ö', question: 'Hiçbir baskı veya zorlama altında kalmadan kendi iradesiyle karar verebilme', answer: 'ÖZGÜRLÜK' },
  { letter: 'Ö', question: 'Bir başarı, yarışma veya üstün gayret karşılığında verilen kupa ya da plaket', answer: 'ÖDÜL' },

  { letter: 'P', question: 'Kızartması, püresi ve fırınlaması yapılan toprak altı yumru sebze', answer: 'PATATES' },
  { letter: 'P', question: 'Alışveriş yaparken veya borç öderken kullanılan resmi madeni ya da kağıt araç', answer: 'PARA' },
  { letter: 'P', question: 'Tuşlarına basıldığında tellere çekiçlerin vurmasıyla ses çıkaran klavyeli çalgı', answer: 'PİYANO' },
  { letter: 'P', question: 'Manyetik iğnesiyle yönleri (kuzey, güney) gösteren seyrüsefer aleti', answer: 'PUSULA' },

  { letter: 'R', question: 'Kırmızı, mavi, sarı gibi gözün ışık dalgalarıyla algıladığı tonlar', answer: 'RENK' },
  { letter: 'R', question: 'Havanın yüksek basınçtan alçak basınca doğru esmesiyle oluşan hava akımı', answer: 'RÜZGAR' },
  { letter: 'R', question: 'Sesli yayınları elektromanyetik dalgalarla dinleyiciye ileten haberleşme aracı', answer: 'RADYO' },
  { letter: 'R', question: 'Boya, kalem veya fırça kullanılarak yüzey üzerine yapılan görsel sanat çalışması', answer: 'RESİM' },

  { letter: 'S', question: 'Canlıların yaşaması için şart olan şeffaf, kokusuz temel sıvı', answer: 'SU' },
  { letter: 'S', question: 'Günün saat, dakika ve saniyesini gösteren mekanik ya da dijital alet', answer: 'SAAT' },
  { letter: 'S', question: 'Filmlerin dev perdede topluca izlendiği salon ve seyir sanatı', answer: 'SİNEMA' },
  { letter: 'S', question: 'Güneş sistemi ve milyarlarca yıldızın içinde bulunduğu sarmal galaksimiz', answer: 'SAMANYOLU' },

  { letter: 'Ş', question: 'Çay ve kahveleri tatlandırmak için kullanılan beyaz kristal madde', answer: 'ŞEKER' },
  { letter: 'Ş', question: 'Yağmurlu günlerde ıslanmamak için açılıp baş üstünde tutulan siperlik', answer: 'ŞEMSİYE' },
  { letter: 'Ş', question: 'Yüksek bir kayalıktan coşkuyla ve köpürerek dökülen su çağlayanı', answer: 'ŞELALE' },
  { letter: 'Ş', question: 'Dizeler, kafiyeler ve ahenk ile yazılan edebi sanat türü', answer: 'ŞİİR' },

  { letter: 'T', question: 'Görüntü ve ses yayınlarını ekrana taşıyan en yaygın ev cihazı', answer: 'TELEVİZYON' },
  { letter: 'T', question: 'Raylar üzerinde vagonları çekerek ilerleyen uzun demiryolu taşıtı', answer: 'TREN' },
  { letter: 'T', question: 'Oyuncuların bir sahnede canlı seyirciler önünde sergilediği dramatik temsil', answer: 'TİYATRO' },
  { letter: 'T', question: 'Geçmişte yaşamış toplumların olaylarını ve medeniyetlerini inceleyen bilim', answer: 'TARİH' },

  { letter: 'U', question: 'Kanatları ve jet motorlarıyla gökyüzünde hızla yolcu taşıyan hava aracı', answer: 'UÇAK' },
  { letter: 'U', question: 'Dünya atmosferinin ötesindeki gezegenler ve yıldızlarla dolu sonsuz boşluk', answer: 'UZAY' },
  { letter: 'U', question: 'Gökyüzü ile deniz veya yer yüzeyinin birleşiyormuş gibi göründüğü çizgi', answer: 'UFUK' },
  { letter: 'U', question: 'Gezegenlerin etrafında dönen veya haberleşme için yörüngeye fırlatılan cihaz', answer: 'UYDU' },

  { letter: 'V', question: 'Şehir hatlarında iskeleler arasında deniz yoluyla yolcu taşıyan gemi', answer: 'VAPUR' },
  { letter: 'V', question: 'İçine su konulup taze çiçeklerin yerleştirildiği süs eşyası', answer: 'VAZO' },
  { letter: 'V', question: 'Yerin derinliklerinden lav ve kül püskürten yanardağ', answer: 'VOLKAN' },
  { letter: 'V', question: 'İnsanın doğru ile yanlışı ayırt etmesini sağlayan iç ahlaki ses', answer: 'VİCDAN' },

  { letter: 'Y', question: 'Bulutlardan su damlacıkları halinde yeryüzüne inen bereketli yağış', answer: 'YAĞMUR' },
  { letter: 'Y', question: 'Uyurken başın altına konulan yumuşak dolgulu minder', answer: 'YASTIK' },
  { letter: 'Y', question: 'Gece gökyüzünde ışıldayan uzaktaki gök cisimleri', answer: 'YILDIZ' },
  { letter: 'Y', question: 'Rüzgar gücüyle hareket eden bez kanatlı deniz aracı', answer: 'YELKENLİ' },

  { letter: 'Z', question: 'Kahvaltı sofralarının vazgeçilmezi olan siyah veya yeşil taneli Akdeniz meyvesi', answer: 'ZEYTİN' },
  { letter: 'Z', question: 'Okulda teneffüsü, kapıda misafiri haber veren çınlamalı ses aleti', answer: 'ZİL' },
  { letter: 'Z', question: 'Upuzun boynu ve sarı-kahve desenleriyle tanınan dünyanın en uzun kara hayvanı', answer: 'ZÜRAFA' },
  { letter: 'Z', question: 'Olayların geçmişten bugüne ve geleceğe aktığı süreklilik boyutu', answer: 'ZAMAN' },

  // EKSTRA GELİŞMİŞ HAVUZ (Madde 10)
  { letter: 'A', question: "Maddenin bölünemez kabul edilen en küçük temel yapı taşı", answer: 'ATOM' },
  { letter: 'A', question: "Çamgillerden, dört mevsim yeşil kalan ve iğne yapraklı orman ağacı", answer: 'ARDIÇ' },
  { letter: 'A', question: "Tiyatro veya sinemada bir rolü canlandıran kadın ya da erkek oyuncu", answer: 'AKTÖR' },
  { letter: 'A', question: "Trafik kazası veya ani rahatsızlıklarda hastaları hastaneye taşıyan acil araç", answer: 'AMBULANS' },
  { letter: 'A', question: "Sekiz kollu, tehlike anında mürekkep püskürten akıllı deniz canlısı", answer: 'AHTAPOT' },
  { letter: 'B', question: "Pota adı verilen çemberden top geçirilerek 5'er kişiyle oynanan salon sporu", answer: 'BASKETBOL' },
  { letter: 'B', question: "Gözün hemen üzerinde yer alan ve terin göze girmesini engelleyen kıl kümesi", answer: 'BAŞ' },
  { letter: 'B', question: "Arıların çiçeklerden nektar toplayarak kovanlarında ürettiği tatlı şifa kaynağı", answer: 'BAL' },
  { letter: 'B', question: "Fırtınalı havalarda gemilere kılavuzluk eden ışıklı kıyı kulesi", answer: 'BALIKÇI FENERİ' },
  { letter: 'C', question: "Ressamların boyalarını sürdüğü tahta veya gerilmiş bez yüzey", answer: 'CUMBA' },
  { letter: 'C', question: "Vücudun dışını tamamen kaplayan en büyük duyu organımız", answer: 'CİLT' },
  { letter: 'C', question: "Suda ve karada yaşayabilen, sevimli yürüyüşlü minik sürüngen", answer: 'CÜCE KAPLUMBAĞA' },
  { letter: 'Ç', question: "Toprağı kazmaya, bellemeye yarayan metal uçlu tarım aleti", answer: 'ÇAPA' },
  { letter: 'Ç', question: "Gözün etrafını veya tabloları çevreleyen koruyucu süslü kenarlık", answer: 'ÇERÇEVE' },
  { letter: 'Ç', question: "Kışın dağlardan yuvarlandıkça büyüyen tehlikeli kar kütlesi", answer: 'ÇIĞ' },
  { letter: 'D', question: "Gemilerin akıntıya kapılmadan sabit kalması için denize atılan ağır demir çapa", answer: 'DEMİR' },
  { letter: 'D', question: "Sıvıların ve havanın sıcaklığını ölçmeye yarayan dereceli alet", answer: 'DERECE' },
  { letter: 'D', question: "Ağız içinde tat almaya ve konuşmaya yarayan kaslı organımız", answer: 'DİL' },
  { letter: 'E', question: "Bir ülkenin başka bir devletteki en üst düzey diplomatik temsilcisi", answer: 'ELÇİ' },
  { letter: 'E', question: "Gözleri güneşin zararlı ışınlarından korumak için takılan koyu renkli cam", answer: 'EKRAN' },
  { letter: 'E', question: "Eski zamanlardan kalma tarihi eserlerin sergilendiği yer", answer: 'ENSTİTÜ' },
  { letter: 'F', question: "Geceleyin karanlık yolları aydınlatan otomobil ön ışığı", answer: 'FAR' },
  { letter: 'F', question: "Hamur işi, kek ve ekmeklerin yüksek ısıda pişirildiği mutfak cihazı", answer: 'FIRIN' },
  { letter: 'F', question: "Akdeniz ve Ege kıyılarında yetişen, mor kabuklu tatlı meyve", answer: 'FRENK İNCİRİ' },
  { letter: 'G', question: "Geceleri gökyüzünde parlayan parlak göktaşı izi veya kuyruklu yıldız", answer: 'GÖKTAŞI' },
  { letter: 'G', question: "Boyna takılan, düğüm atılarak bağlanan klasik erkek giyim aksesuarı", answer: 'GRAVAT' },
  { letter: 'G', question: "Dikenli yaprakları olan, kırmızı veya beyaz açan güzel kokulu çiçek", answer: 'GÜL' },
  { letter: 'G', question: "Yerin altında derin çatlaklardan fışkıran sıcak su kaynağı", answer: 'GAYZER' },
  { letter: 'H', question: "Uçak ve helikopterlerin iniş kalkış yaptığı geniş pistli tesis", answer: 'HAVALİMANI' },
  { letter: 'H', question: "Duvara veya yere serilen, yün ya da ipekten dokunmuş desenli yaygı", answer: 'HALI' },
  { letter: 'H', question: "Haftanın son iş günü olan, tatilden önceki gün", answer: 'CUMA' },
  { letter: 'I', question: "Deniz veya nehir kenarlarındaki kumluk ya da çakıllık kıyı şeridi", answer: 'ILICA' },
  { letter: 'I', question: "Ağaç gövdesini veya kalın dalları kesmekte kullanılan iki saplı büyük bıçkı", answer: 'IZGARA' },
  { letter: 'İ', question: "Gemilerin güvenle yanaşıp bağlandığı ahşap ya da beton kıyı uzantısı", answer: 'İSKELE' },
  { letter: 'İ', question: "Deniz diplerinde istiridyelerin içinde oluşan değerli parlak sedef tanesi", answer: 'İNCİ' },
  { letter: 'İ', question: "İpek böceğinin kozasından elde edilen parlak ve yumuşak kıymetli kumaş", answer: 'İPEK' },
  { letter: 'K', question: "Göz kapaklarının kenarında dizili duran koruyucu ince kıllar", answer: 'KİRPİK' },
  { letter: 'K', question: "Çorba içmeye ve yemek servisi yapmaya yarayan uzun saplı derin metal kaşık", answer: 'KEPÇE' },
  { letter: 'K', question: "İki yakayı birbirine bağlayan nehir veya deniz üstündeki geçit yapısı", answer: 'KÖPRÜ' },
  { letter: 'K', question: "Kırmızı renkte, ortasında sert çekirdeği olan nefis yaz meyvesi", answer: 'KİRAZ' },
  { letter: 'L', question: "İlkbaharda laleler açtığında parkları süsleyen geleneksel soğanlı çiçek", answer: 'LALE' },
  { letter: 'L', question: "Tıbbi tahlillerin ve bilimsel deneylerin yapıldığı donanımlı araştırma odası", answer: 'LABORATUVAR' },
  { letter: 'M', question: "Meyve bahçelerinde yetişen, turuncu renkli tatlı kış narenciyesi", answer: 'MANDALİNA' },
  { letter: 'M', question: "Yüksek binalarda katlar arasında inip çıkmaya yarayan basamaklar", answer: 'MERDİVEN' },
  { letter: 'N', question: "Doktorların bileğe dokunarak kalp atışını kontrol ettiği ritmik atım", answer: 'NABIZ' },
  { letter: 'N', question: "Çorbalara ve cacığa serpiştirilen ferahlatıcı kokulu yeşil baharat yaprağı", answer: 'NANE' },
  { letter: 'O', question: "Gözün hemen ortasındaki ışığa göre büyüyüp küçülen siyah açıklık", answer: 'ODAK' },
  { letter: 'O', question: "Yılın onuncu ayı olan, sonbahar ayı", answer: 'EKİM' },
  { letter: 'Ö', question: "Suda vak vak diyerek yüzen perdeli ayaklı sevimli su kuşu", answer: 'ÖRDEK' },
  { letter: 'Ö', question: "Geleceğe dair tahmin yapma, önceden görme yeteneği", answer: 'ÖNGÖRÜ' },
  { letter: 'Ö', question: "Bir kimsenin veya topluluğun sahip olduğu tam bağımsızlık durumu", answer: 'ÖZGÜRLÜK' },
  { letter: 'P', question: "Gemi veya uçakların rotasını belirleyen kaptan ve uçuş yöneticisi", answer: 'PİLOT' },
  { letter: 'P', question: "Denizlerde ve okyanuslarda yaşayan zeki memeli yüzücü", answer: 'YUNUS' },
  { letter: 'R', question: "Gemilerin yönünü belirlemeye yarayan arka dümen palası", answer: 'ROTA' },
  { letter: 'R', question: "Radyo dalgalarıyla çalışan, havadaki uçakları ve fırtınaları tespit eden sistem", answer: 'RADAR' },
  { letter: 'R', question: "Havadaki basınç farkından kaynaklanan hava akımı, esinti", answer: 'RÜZGAR' },
  { letter: 'S', question: "Güneş ışığını enerjiye dönüştüren çatılardaki elektrik paneli", answer: 'SOLAR' },
  { letter: 'S', question: "Bir metreyi yüze bölen temel uzunluk ölçü birimi", answer: 'SANTİMETRE' },
  { letter: 'Ş', question: "Yüksekten köpürerek dökülen büyüleyici doğal su çağlayanı", answer: 'ŞELALE' },
  { letter: 'Ş', question: "Gözleri güneşten korumak için başa takılan siperlikli başlık", answer: 'ŞAPKA' },
  { letter: 'Ş', question: "Duyguları ve güzellikleri ahenkli mısralarla anlatan edebi tür", answer: 'ŞİİR' },
  { letter: 'T', question: "Tarlayı sürmeye ve çiftlik işlerinde römork çekmeye yarayan güçlü motorlu araç", answer: 'TRAKTÖR' },
  { letter: 'T', question: "Uzaktaki gök cisimlerini ve yıldızları incelemeye yarayan astronomik cihaz", answer: 'TELESKOP' },
  { letter: 'U', question: "Dünya atmosferi dışında kalan, gezegen ve yıldızların bulunduğu sonsuz boşluk", answer: 'UZAY' },
  { letter: 'U', question: "Uzayda araştırmalar yapan, uzay giysisi giyen cesur astronot", answer: 'UZAY ADAMI' },
  { letter: 'V', question: "Altışar kişilik iki takımın file üzerinden topla oynadığı spor", answer: 'VOLEYBOL' },
  { letter: 'V', question: "İki dağ arasındaki uzun ve derin doğal çöküntü, akarsu yatağı", answer: 'VADİ' },
  { letter: 'V', question: "Vücuttaki organların uyumlu çalışması için besinlerden alınan organik bileşik", answer: 'VİTAMİN' },
  { letter: 'Y', question: "Bulutlardan yeryüzüne su damlacıkları halinde düşen bereketli yağış", answer: 'YAĞMUR' },
  { letter: 'Y', question: "Rüzgar gücüyle denizde hızla yol alan üçgen veya dörtgen yelkenli tekne", answer: 'YAT' },
  { letter: 'Z', question: "Akdeniz bölgesinde yetişen, kahvaltıda yenen veya yağı çıkarılan kutsal meyve", answer: 'ZEYTİN' },
  { letter: 'Z', question: "Dağların en yüksek noktası, doruk tepesi", answer: 'ZİRVE' },
  { letter: 'A', question: 'Gaziantep yöresine özgü, közlenmiş patlıcanlı ve yoğurtlu meşhur kebap türü', answer: 'ALİ NAZİK' },
  { letter: 'A', question: 'Vücuttaki kanı kalpten diğer organlara taşıyan en büyük ana atardamar', answer: 'AORT' },
  { letter: 'A', question: 'Elmasıyla ünlü, Şehzadeler Şehri olarak bilinen Karadeniz ilimiz', answer: 'AMASYA' },
  { letter: 'A', question: 'İğnelerle vücuttaki belirli noktalara uygulanan geleneksel Çin tedavi yöntemi', answer: 'AKUPUNKTUR' },
  { letter: 'A', question: 'Dünyanın en geniş kanat açıklığına sahip okyanus kuşu', answer: 'ALBATROS' },
  { letter: 'B', question: 'Gaziantep ile özdeşleşen, incecik açılmış yufka ve fıstıkla yapılan şerbetli tatlı', answer: 'BAKLAVA' },
  { letter: 'B', question: 'Çanakkale iline bağlı, rüzgar gülleri ve bağcılığıyla ünlü Ege adası', answer: 'BOZCAADA' },
  { letter: 'B', question: 'Canlıların yapısını, gelişimini ve yaşam süreçlerini inceleyen doğa bilimi', answer: 'BİYOLOJİ' },
  { letter: 'B', question: 'Okyanuslarda yaşayan dünyanın en büyük memeli deniz canlısı', answer: 'BALİNA' },
  { letter: 'B', question: 'Tıpta vücuttan doku veya hücre örneği alarak mikroskop altında inceleme işlemi', answer: 'BİYOPSİ' },
  { letter: 'C', question: 'Halkın kendi yöneticilerini oy vererek seçtiği demokratik devlet yönetim biçimi', answer: 'CUMHURİYET' },
  { letter: 'C', question: 'Geleneksel Türk atlı sporu; at koştururken rakibe değnek fırlatılarak oynanır', answer: 'CİRİT' },
  { letter: 'C', question: 'Kuzey Afrika\'da yer alan, başkenti kendi adını taşıyan Akdeniz ülkesi', answer: 'CEZAYİR' },
  { letter: 'C', question: 'Yaraların iyileşmesinde ve cilt bakımında kullanılan şifalı sarı çiçekli kır bitkisi', answer: 'CİVANPERÇEMİ' },
  { letter: 'C', question: 'Maddenin uzayda kapladığı yer, kütle ve hacmi olan her türlü fiziksel varlık', answer: 'CİSİM' },
  { letter: 'Ç', question: '1915 yılında "Geçilmez" destanının yazıldığı, Şehitler Abidesi\'nin bulunduğu ilimiz', answer: 'ÇANAKKALE' },
  { letter: 'Ç', question: 'Demir ile karbon alaşımından elde edilen, inşaat ve sanayide kullanılan çok sağlam metal', answer: 'ÇELİK' },
  { letter: 'Ç', question: 'Uzun arka bacaklarıyla zıplayabilen, yaz geceleri ses çıkaran zıplayan böcek', answer: 'ÇEKİRGE' },
  { letter: 'Ç', question: 'Kastamonu\'da bulunan, dik yamaçları ve kanyonuyla ünlü milli tabiat parkı', answer: 'ÇATAK' },
  { letter: 'Ç', question: 'Börek ve poğaçaların üzerine serpilen küçük siyah şifalı tohum', answer: 'ÇÖREKOTU' },
  { letter: 'D', question: 'Milyonlarca yıl önce yaşamış ve nesli tükenmiş devasa sürüngen canlı', answer: 'DİNOZOR' },
  { letter: 'D', question: 'Muğla Ortaca\'da bulunan, kaya mezarları ve caretta carettalarıyla ünlü doğa harikası', answer: 'DALYAN' },
  { letter: 'D', question: 'Yaprakları yemeklere aroma katan, zaferi ve barışı simgeleyen yaprak dökmeyen ağaç', answer: 'DEFNE' },
  { letter: 'D', question: 'Alfred Nobel tarafından icat edilen, madencilikte ve patlatmalarda kullanılan kimyasal patlayıcı', answer: 'DİNAMİT' },
  { letter: 'D', question: 'Bir milletin kahramanlıklarını, savaşlarını veya göçlerini anlatan uzun manzum halk hikayesi', answer: 'DESTAN' },
  { letter: 'E', question: 'Türkiye\'nin batısında kıyısı olan, zeytin ve tatil beldeleriyle ünlü deniz ve bölge', answer: 'EGE' },
  { letter: 'E', question: 'İlaçların hazırlandığı veya reçeteyle satıldığı sağlık kuruluşu dükkanı', answer: 'ECZANE' },
  { letter: 'E', question: 'Canlıların birbirleriyle ve cansız çevreleriyle oluşturduğu doğal yaşam birliği', answer: 'EKOSİSTEM' },
  { letter: 'E', question: 'Palandöken kayak merkezi ve Cağ Kebabı ile tanınan Doğu Anadolu ilimiz', answer: 'ERZURUM' },
  { letter: 'E', question: 'Tarih boyunca dilden dile anlatılarak günümüze ulaşan olağanüstü olay veya halk söylencesi', answer: 'EFSANE' },
  { letter: 'F', question: 'Türkiye\'den doğup Basra Körfezi\'ne dökülen, Mezopotamya\'ya can veren büyük nehir', answer: 'FIRAT' },
  { letter: 'F', question: 'Düşünceyi, varlığı, bilginin kaynağını ve ahlakı akıl yoluyla sorgulayan disiplin', answer: 'FELSEFE' },
  { letter: 'F', question: 'Işığın en küçük temel enerji paketi veya birimi olan kuantum parçacığı', answer: 'FOTON' },
  { letter: 'F', question: 'Muğla\'da bulunan, Ölüdeniz ve Babadağ yamaç paraşütüyle dünyaca ünlü turistik ilçe', answer: 'FETHİYE' },
  { letter: 'F', question: 'Karadeniz bölgesinde fındıktan sonra en çok tüketilen kurutulmuş veya taze baklagil', answer: 'FASULYE' },
  { letter: 'G', question: 'Şanlıurfa\'da bulunan, tarihin bilinen en eski tapınak ve ibadet merkezi kompleksi', answer: 'GÖBEKLİTEPE' },
  { letter: 'G', question: 'Telli ve perdeli, parmakla veya penayla çalınan dünyaca ünlü müzik aleti', answer: 'GİTAR' },
  { letter: 'G', question: 'Yağmurdan sonra güneş ışınlarının su damlacıklarında kırılmasıyla beliren yedi renkli gök olayı', answer: 'GÖKKUŞAĞI' },
  { letter: 'G', question: 'Antik Roma\'da arenalarda seyirciler önünde savaşan dövüşçü köle veya savaşçı', answer: 'GLADYATÖR' },
  { letter: 'G', question: 'Toprak tencerede fırında veya ateşte ağır ağır pişirilen geleneksel etli yemek', answer: 'GÜVEÇ' },
  { letter: 'H', question: 'Karadeniz halkının kışın tavasını, buğulamasını ve ızgarasını yaptığı meşhur küçük balık', answer: 'HAMSİ' },
  { letter: 'H', question: 'Bir araştırmada veya bilimsel yöntemde doğruluğu test edilmek üzere öne sürülen varsayım', answer: 'HİPOTEZ' },
  { letter: 'H', question: 'Döner kanatları sayesinde dikey kalkış ve iniş yapabilen hava aracı', answer: 'HELİKOPTER' },
  { letter: 'H', question: 'Kil, alçı, taş veya bronz gibi malzemelerden yontularak yapılan üç boyutlu plastik sanat eseri', answer: 'HEYKEL' },
  { letter: 'H', question: 'Düğünlerde ve kutlamalarda el ele tutuşarak veya mendil sallanarak çekilen ritmik halk dansı', answer: 'HALAY' },
  { letter: 'I', question: 'Kış aylarında kaynatılıp limonla içilen, göğsü yumuşatan sarı çiçekli şifalı ağaç', answer: 'IHLAMUR' },
  { letter: 'I', question: 'Gül bahçeleri, gülsuyu ve lavantasıyla tanınan Akdeniz bölgemizdeki ilimiz', answer: 'ISPARTA' },
  { letter: 'I', question: 'Temel Reis çizgi filminde güç veren, demir deposu yeşil yapraklı sebze', answer: 'ISPANAK' },
  { letter: 'I', question: 'Yerden fışkıran sıcak ve mineralli şifalı kaplıca suları', answer: 'ILICA' },
  { letter: 'I', question: 'Bir ışık kaynağından çıkarak her yöne yayılan doğrusal ışık çizgisi', answer: 'IŞIN' },
  { letter: 'İ', question: 'İpekböceği kozalarından elde edilen çok parlak, yumuşak ve değerli doğal kumaş ipliği', answer: 'İPEK' },
  { letter: 'İ', question: 'Bursa yöresine ait, pide üzerine döner eti, domates sosu ve tereyağı ile servis edilen kebap', answer: 'İSKENDER' },
  { letter: 'İ', question: 'Eskimoların kardan ve sıkıştırılmış buz bloklarından yaptığı kubbe şeklindeki kış evi', answer: 'İGLO' },
  { letter: 'İ', question: 'Elektrik akımını veya ısıyı kolayca ileten bakır ve gümüş gibi maddeler', answer: 'İLETKEN' },
  { letter: 'İ', question: 'İki kıtayı birleştiren, Boğaziçi ve Ayasofya\'ya ev sahipliği yapan mega şehrimiz', answer: 'İSTANBUL' },
  { letter: 'K', question: 'Peri bacaları, yer altı şehirleri ve sıcak hava balonlarıyla büyüleyen tarihi bölge', answer: 'KAPADOKYA' },
  { letter: 'K', question: 'Kış aylarında sobada veya közde pişirilen, Bursa\'nın şekeriyle de ünlü sert kabuklu yemişi', answer: 'KESTANE' },
  { letter: 'K', question: 'Avustralya\'da yaşayan, yavrularını karınlarındaki kesede taşıyan ve zıplayan memeli hayvan', answer: 'KANGURU' },
  { letter: 'K', question: 'Maddelerin yapılarını, özelliklerini ve kimyasal tepkimelerini inceleyen temel pozitif bilim', answer: 'KİMYA' },
  { letter: 'K', question: 'Kıymayla baharatların yoğrulup şekil verilerek ızgarada pişirilmesiyle yapılan milli et yemeğimiz', answer: 'KÖFTE' },
  { letter: 'L', question: 'Su, nişasta ve şekerle pişirilen, fıstıklı veya güllü çeşitleri olan dünyaca ünlü Türk tatlısı', answer: 'LOKUM' },
  { letter: 'L', question: 'Çıkış yolu karmaşık ve çok sayıda çıkmaz sokaktan oluşan bulmaca veya yapı', answer: 'LABİRENT' },
  { letter: 'L', question: 'C vitamini deposu olan, sarı kabuklu, ekşi narenciye meyvesi', answer: 'LİMON' },
  { letter: 'L', question: 'Baharın gelişini müjdeleyen, baca ve elektrik direklerine yuva yapan uzun bacaklı göçmen kuş', answer: 'LEYLEK' },
  { letter: 'L', question: 'İnce açılmış yuvarlak hamurun üzerine kıymalı harç sürülüp taş fırında pişirilen Türk çıtırı', answer: 'LAHMACUN' },
  { letter: 'M', question: 'Edirne\'deki Selimiye ve İstanbul\'daki Süleymaniye Camii\'nin efsanevi Osmanlı baş mimarı', answer: 'MİMAR SİNAN' },
  { letter: 'M', question: 'Demir, nikel ve kobalt gibi metalleri kendine çeken manyetik cisim', answer: 'MIKNATIS' },
  { letter: 'M', question: 'Türkiye\'nin en kalabalık, Asya ile Avrupa\'yı denizle bağlayan coğrafi bölgesi', answer: 'MARMARA' },
  { letter: 'M', question: 'Ormanlarda kendiliğinden yetişen veya kültürü yapılan şapkalı sporlu canlı', answer: 'MANTAR' },
  { letter: 'M', question: 'Bir müzik eserini oluşturan, kulağa hoş gelen ritmik sesler dizisi', answer: 'MELODİ' },
  { letter: 'N', question: 'Durgun sularda ve göllerde su üstünde açan geniş yapraklı zarif su çiçeği', answer: 'NİLÜFER' },
  { letter: 'N', question: 'Adıyaman\'da bulunan, Kommagene Krallığı\'na ait devasa taş heykellerin yer aldığı dağ', answer: 'NEMRUT' },
  { letter: 'N', question: 'Baharın başlangıcı ve doğanın uyanışı olarak 21 Mart\'ta kutlanan geleneksel bayram', answer: 'NEVRUZ' },
  { letter: 'N', question: 'Atom çekirdeğinin parçalanması veya birleşmesiyle açığa çıkan yüksek enerjili güç türü', answer: 'NÜKLEER' },
  { letter: 'N', question: 'Pilavın içine de konulan, humus ve çorbası yapılan sarı renkli sert baklagil', answer: 'NOHUT' },
  { letter: 'O', question: 'Kıtaları birbirinden ayıran çok büyük tuzlu su kütlesi (Örn: Pasifik, Atlas)', answer: 'OKYANUS' },
  { letter: 'O', question: 'Canlıların solunum yapmasını sağlayan, havanın yaklaşık yüzde yirmi birini oluşturan gaz', answer: 'OKSİJEN' },
  { letter: 'O', question: 'Ağaçlarla ve yeşilliklerle kaplı, binlerce hayvana yuva olan geniş doğal alan', answer: 'ORMAN' },
  { letter: 'O', question: 'Yaylı, üflemeli ve vurmalı çok sayıda enstrümanın bir şef eşliğinde çaldığı büyük müzik topluluğu', answer: 'ORKESTRA' },
  { letter: 'O', question: 'Dört tekerlekli, motorlu, yolcu taşımaya yarayan kara taşıtı (Araba)', answer: 'OTOMOBİL' },
  { letter: 'Ö', question: 'Sekiz bacaklı, avını yakalamak için havada ipekten ağ ören eklembacaklı hayvan', answer: 'ÖRÜMCEK' },
  { letter: 'Ö', question: 'Göllerde ve sulak alanlarda yaşayan, perde ayaklı ve yassı gagalı su kuşu', answer: 'ÖRDEK' },
  { letter: 'Ö', question: 'Bir yarışmada, sınavda veya başarıda takdir amacıyla verilen kupa, madalya veya takı', answer: 'ÖDÜL' },
  { letter: 'Ö', question: 'Okulda öğrencilere bilgi ve beceri kazandıran kutsal meslek insanı', answer: 'ÖĞRETMEN' },
  { letter: 'Ö', question: 'Hiçbir baskı veya zorlama olmadan kendi kararlarını verebilme durumu (Hürriyet)', answer: 'ÖZGÜRLÜK' },
  { letter: 'P', question: 'Denizli ilimizde yer alan, bembeyaz kalker basamakları ve travertenleriyle ünlü doğa harikası', answer: 'PAMUKKALE' },
  { letter: 'P', question: 'Eski Mısır firavunları için anıt mezar olarak inşa edilen üçgen prizma şeklindeki dev taş yapılar', answer: 'PİRAMİT' },
  { letter: 'P', question: 'Tuşlarına basıldığında tokmakların tellere vurmasıyla ses çıkaran büyük kuyruklu çalgı', answer: 'PİYANO' },
  { letter: 'P', question: 'Kayseri ile özdeşleşen, çemenle kaplanıp kurutulmuş baharatlı dana eti dilimleri', answer: 'PASTIRMA' },
  { letter: 'P', question: 'Güney Kutbu\'nda yaşayan, uçamayan ama usta bir şekilde yüzen fraklı deniz kuşu', answer: 'PENGUEN' },
  { letter: 'R', question: 'Önceden programlanmış görevleri yerine getirebilen mekanik ve elektronik yapay zeka makinesi', answer: 'ROBOT' },
  { letter: 'R', question: '14. ve 16. yüzyıllarda İtalya\'da başlayıp Avrupa\'yı saran sanat ve bilimdeki "Yeniden Doğuş"', answer: 'RÖNESANS' },
  { letter: 'R', question: 'Balık sofralarının ve salataların vazgeçilmezi olan keskin aromalı yeşil yapraklı ot', answer: 'ROKA' },
  { letter: 'R', question: 'Yüksek basınç alanından alçak basınç alanına doğru esen yatay hava akımı', answer: 'RÜZGAR' },
  { letter: 'R', question: 'Atom çekirdeklerinin kararsızlığı sonucu çevreye yayılan elektromanyetik dalga veya parçacık ışıması', answer: 'RADYASYON' },
  { letter: 'S', question: 'Afrika savanlarında vahşi hayvanları doğal ortamlarında gözlemlemek için yapılan macera gezisi', answer: 'SAFARİ' },
  { letter: 'S', question: 'Günü, saati, dakikayı ve saniyeyi gösteren mekanik veya dijital zaman ölçme aleti', answer: 'SAAT' },
  { letter: 'S', question: 'Edirne\'de bulunan, Mimar Sinan\'ın "Ustalık Eserim" dediği şaheser cami', answer: 'SELİMİYE' },
  { letter: 'S', question: 'Bir şeklin veya cismin iki yarısının bir doğruya göre birbirinin tam aynısı olması kuralı', answer: 'SİMETRİ' },
  { letter: 'S', question: 'Yapraklarında veya gövdesinde su depolayabilen, kuraklığa dayanıklı etli bitki türü (Örn: Kaktüs)', answer: 'SUKULENT' },
  { letter: 'Ş', question: 'Akarsuyun yüksek bir kayalıktan veya uçurumdan dikey olarak aşağıya gürül gürül dökülmesi', answer: 'ŞELALE' },
  { letter: 'Ş', question: 'Peygamberler Şehri ve Balıklıgöl\'ün bulunduğu Güneydoğu Anadolu ilimiz', answer: 'ŞANLIURFA' },
  { letter: 'Ş', question: 'Bulutlar arasında gerçekleşen yüksek voltajlı ani elektrik deşarjı ve ışık parlaması', answer: 'ŞİMŞEK' },
  { letter: 'Ş', question: 'Evlerde duvara gömülü, odun yakılarak ısınmayı sağlayan bacalı açık ocak', answer: 'ŞÖMİNE' },
  { letter: 'Ş', question: 'Duygularını, hayallerini ve düşüncelerini mısralarla ve kafiyelerle anlatan edebiyatçı (Ozan)', answer: 'ŞAİR' },
  { letter: 'T', question: 'Çanakkale Boğazı yakınlarında bulunan, tahta at efsanesiyle ünlü antik çağ kenti', answer: 'TROYA' },
  { letter: 'T', question: 'Kablolu bağlantı olmadan radyo dalgalarıyla karşılıklı ses iletimi sağlayan seyyar iletişim cihazı', answer: 'TELSİZ' },
  { letter: 'T', question: 'Yazılı metne dayanmadan, sahnede oyuncuların içinden geldiği gibi doğaçlama yaptığı tiyatro türü', answer: 'TULUAT' },
  { letter: 'T', question: 'Graham Bell tarafından icat edilen, sesli konuşmayı sağlayan iletişim aygıtı', answer: 'TELEFON' },
  { letter: 'T', question: 'İnce ve çevik gövdesiyle çok hızlı koşabilen ve av takibi yapabilen özel bir av köpeği ırkı', answer: 'TAZI' },
  { letter: 'U', question: 'Kanatları ve motor gücü sayesinde gökyüzünde süzülerek yolcu ve yük taşıyan hava taşıtı', answer: 'UÇAK' },
  { letter: 'U', question: 'Bir gezegenin veya gök cisminin yörüngesinde dönen doğal veya insan yapımı yapay araç', answer: 'UYDU' },
  { letter: 'U', question: 'Dünya atmosferinin ötesinde bulunan, yıldızları ve gezegenleri barındıran sonsuz boşluk', answer: 'UZAY' },
  { letter: 'U', question: 'Düz bir ovada veya denizde gökyüzü ile yeryüzünün birleştiği gibi görünen en uzak çizgi', answer: 'UFUK' },
  { letter: 'U', question: 'Aynı topraklar üzerinde yaşayan, aynı tarihe ve kültüre sahip insan topluluğu (Millet)', answer: 'ULUS' },
  { letter: 'V', question: 'Yerin derinliklerindeki lav, kül ve gazların yeryüzüne püskürdüğü yanardağ', answer: 'VOLKAN' },
  { letter: 'V', question: 'Havası veya gazı tamamen boşaltılmış sıfır basınçlı kapalı ortam', answer: 'VAKUM' },
  { letter: 'V', question: 'Keman ailesinden, oturarak ve dizlerin arasına alınarak çalınan kalın sesli yaylı enstrüman (Çello)', answer: 'VİYOLONSEL' },
  { letter: 'V', question: 'Sadece canlı hücrelerin içine girerek çoğalabilen mikroskobik hastalık etkeni', answer: 'VİRÜS' },
  { letter: 'V', question: 'Kürkü çok değerli olan, su kenarlarında yaşayan küçük yırtıcı memeli sansargil hayvanı', answer: 'VİZON' },
  { letter: 'Y', question: 'Kütlesi olan cisimlerin birbirini çekmesini sağlayan, Newton\'un tanımladığı doğa kuvveti', answer: 'YERÇEKİMİ' },
  { letter: 'Y', question: 'Denizlerde yaşayan, zekası ve insan dostluğuyla bilinen sevimli memeli hayvan', answer: 'YUNUS' },
  { letter: 'Y', question: 'Rüzgar gücünü kullanarak teknelerin suda ilerlemesini sağlayan geniş dayanıklı bez', answer: 'YELKEN' },
  { letter: 'Y', question: 'Bilgisayarların ve akıllı telefonların çalışmasını sağlayan kodlanmış programlar bütünü', answer: 'YAZILIM' },
  { letter: 'Y', question: 'Kendi enerjisini üreten, uzayda parlayan nükleer gaz kütlesi (Örn: Güneş)', answer: 'YILDIZ' },
  { letter: 'Z', question: 'Yeşil rengiyle bilinen, beril grubuna ait çok değerli bir mücevher ve süs taşı', answer: 'ZÜMRÜT' },
  { letter: 'Z', question: 'Afrika savanlarında yaşayan, siyah-beyaz çizgili derisiyle ünlü vahşi at türü', answer: 'ZEBRA' },
  { letter: 'Z', question: 'Ege ve Akdeniz ile özdeşleşen, kahvaltıda yenen ve yağı çıkarılan kutsal ağaç meyvesi', answer: 'ZEYTİN' },
  { letter: 'Z', question: 'Geçmiş, şu an ve gelecek arasındaki akışı ifade eden, saatle ölçülen soyut kavram', answer: 'ZAMAN' },
  { letter: 'Z', question: 'Trabzon ile Gümüşhane arasında bulunan, Doğu Karadeniz dağlarındaki efsanevi geçit ve tünel', answer: 'ZİGANA' }
];

export const PASSAPAROLA_KIDS_QUESTIONS_DB = [
  { letter: 'A', question: 'Ormanlar kralı olarak bilinen, kocaman yelesi olan güçlü hayvan', answer: 'ASLAN' },
  { letter: 'A', question: 'Dört tekerleği olan, ailenizle seyahat ettiğiniz binek taşıt', answer: 'ARABA' },
  { letter: 'B', question: 'Denizlerde yaşayan, yüzgeçleri olan ve suda nefes alan sevimli canlı', answer: 'BALIK' },
  { letter: 'B', question: 'Üfleyince şişen, rengarenk uçan hafif oyuncak', answer: 'BALON' },
  { letter: 'C', question: 'Tavuğun yumurtasından "cik cik" diyerek çıkan sarı minik yavru', answer: 'CİVCİV' },
  { letter: 'C', question: 'Sert kabuğu kırıldığında beyni andıran faydalı kuruyemiş', answer: 'CEVİZ' },
  { letter: 'Ç', question: 'Doğum günlerinde ve bayramlarda severek yediğimiz lezzetli tatlı', answer: 'ÇİKOLATA' },
  { letter: 'Ç', question: 'Okula giderken kitap ve defterlerimizi içine koyduğumuz sırt eşyası', answer: 'ÇANTA' },
  { letter: 'D', question: 'Yazın külahın içinde yediğimiz buz gibi lezzetli tatlı', answer: 'DONDURMA' },
  { letter: 'D', question: 'Hastalandığımızda bizi muayene edip iyileştiren beyaz önlüklü kişi', answer: 'DOKTOR' },
  { letter: 'E', question: 'Amasya\'nın meşhur, kırmızı veya yeşil sulu kütür kütür meyvesi', answer: 'ELMA' },
  { letter: 'E', question: 'Her sabah kahvaltıda tereyağı sürüp yediğimiz fırın yiyeceği', answer: 'EKMEK' },
  { letter: 'F', question: 'Upuzun hortumu ve kocaman yelpaze kulakları olan dev hayvan', answer: 'FİL' },
  { letter: 'F', question: 'Karadeniz\'de yetişen, kırılıp yenen yuvarlak kabuklu kuruyemiş', answer: 'FINDIK' },
  { letter: 'G', question: 'Gündüz gökyüzünde parlayan, dünyamızı ısıtan sıcacık yıldız', answer: 'GÜNEŞ' },
  { letter: 'G', question: 'Gözlerimizi güneşten korumak veya daha net görmek için taktığımız camlı eşya', answer: 'GÖZLÜK' },
  { letter: 'H', question: 'Tavşanların bayılarak yediği turuncu renkli kıtır kıtır sebze', answer: 'HAVUÇ' },
  { letter: 'H', question: 'Birçok farklı vahşi ve sevimli hayvanı görebildiğimiz büyük park', answer: 'HAYVANAT BAHÇESİ' },
  { letter: 'I', question: 'Karanlık odaya girip elektrik düğmesine basınca odayı aydınlatan enerji', answer: 'IŞIK' },
  { letter: 'I', question: 'Temel Reis\'in yediğinde kaslarını güçlendiren yeşil yapraklı sebze', answer: 'ISPANAK' },
  { letter: 'İ', question: 'Bize her sabah taze süt veren "möö" diyen çiftlik hayvanı', answer: 'İNEK' },
  { letter: 'İ', question: 'Uçurtmanın gökyüzünde uçması için elimizde tuttuğumuz uzun bağ', answer: 'İP' },
  { letter: 'K', question: 'Miyav miyav diyen, süt içmeyi ve yün yumağıyla oynamayı çok seven evcil dostumuz', answer: 'KEDİ' },
  { letter: 'K', question: 'Sadık dostumuz olan, hav hav diyerek kuyruk sallayan sevimli hayvan', answer: 'KÖPEK' },
  { letter: 'L', question: 'Çorbaya ve salataya sıkılan, çok ekşi ve sapsarı narenciye meyvesi', answer: 'LİMON' },
  { letter: 'L', question: 'Karanlıkta odamızı aydınlatan elektrikli masa veya tavan aracı', answer: 'LAMBA' },
  { letter: 'M', question: 'Maymunların bayılarak yediği, kabuğu soyulan tatlı sarı meyve', answer: 'MUZ' },
  { letter: 'M', question: 'Uyumadan önce anne veya babamızın bize anlattığı sihirli hikaye', answer: 'MASAL' },
  { letter: 'N', question: 'Kırmızı kabuğu kırılınca içinden yüzlerce tatlı yakut tanesi çıkan meyve', answer: 'NAR' },
  { letter: 'N', question: 'Bebeklerin mışıl mışıl uyuması için söylenen sakinleştirici ezgi', answer: 'NİNNİ' },
  { letter: 'O', question: 'Öğretmenimiz ve arkadaşlarımızla buluşup yeni bilgiler öğrendiğimiz bina', answer: 'OKUL' },
  { letter: 'O', question: 'Oyun oynarken en çok sevdiğimiz araba, bebek ve yapboz gibi nesneler', answer: 'OYUNCAK' },
  { letter: 'Ö', question: 'Suda "vak vak" diyerek yüzen, sarı yassı gagalı sevimli kuş', answer: 'ÖRDEK' },
  { letter: 'Ö', question: 'Okulda bize okumayı, yazmayı ve güzel şeyleri öğreten değerli kişi', answer: 'ÖĞRETMEN' },
  { letter: 'P', question: 'Doğum günlerinde üzerine mum dikip üflediğimiz kremalı tatlı', answer: 'PASTA' },
  { letter: 'P', question: 'Karlar ve buzlar üzerinde paytak paytak yürüyen smokinli sevimli kuş', answer: 'PENGUEN' },
  { letter: 'R', question: 'Boya kalemleriyle kağıda çizdiğimiz rengarenk görsel çalışma', answer: 'RESİM' },
  { letter: 'R', question: 'Kırmızı, mavi, sarı, yeşil gibi dünyayı süsleyen tüm tonlar', answer: 'RENK' },
  { letter: 'S', question: 'Canımız her susadığında kana kana içtiğimiz en sağlıklı ve temel sıvı', answer: 'SU' },
  { letter: 'S', question: 'Kemiklerimizi ve dişlerimizi güçlendiren bembeyaz faydalı içecek', answer: 'SÜT' },
  { letter: 'Ş', question: 'Yağmur yağdığında ıslanmamak için başımızın üzerinde açtığımız siperlik', answer: 'ŞEMSİYE' },
  { letter: 'Ş', question: 'Bayramlarda çocuklara ikram edilen renkli tatlı yiyecek', answer: 'ŞEKER' },
  { letter: 'T', question: 'Raylar üzerinde "çuf çuf" diyerek ilerleyen uzun vagonlu taşıt', answer: 'TREN' },
  { letter: 'T', question: 'Uzun kulakları olan, zıp zıp zıplayan ve havuç seven sevimli hayvan', answer: 'TAVŞAN' },
  { letter: 'U', question: 'Gökyüzünde bulutların arasında kanatlarıyla hızla uçan büyük yolcu taşıtı', answer: 'UÇAK' },
  { letter: 'U', question: 'Rüzgarlı havalarda gökyüzünde iple uçurduğumuz rengarenk hafif oyuncak', answer: 'UÇURTMA' },
  { letter: 'V', question: 'Denizde "düüt" diye düdük çalarak iskeleler arası yolcu taşıyan deniz aracı', answer: 'VAPUR' },
  { letter: 'V', question: 'Çiçekleri içine koyup masamızı süslediğimiz cam veya porselen kap', answer: 'VAZO' },
  { letter: 'Y', question: 'Gece gökyüzünde pırıl pırıl parıldayan minik ışık noktaları', answer: 'YILDIZ' },
  { letter: 'Y', question: 'Kahvaltıda rafadan veya haşlanmış yediğimiz, tavuğun hediyesi', answer: 'YUMURTA' },
  { letter: 'Z', question: 'Upuzun boynuyla ağaçların tepesindeki yaprakları yiyen benekli hayvan', answer: 'ZÜRAFA' },
  { letter: 'Z', question: 'Okulda dersin bittiğini ve teneffüse çıkma vaktini haber veren ses', answer: 'ZİL' },
  { letter: 'A', question: 'Ormanlar kralı olarak bilinen, yelesi olan güçlü büyük kedi', answer: 'ASLAN' },
  { letter: 'A', question: 'Çiçeklerden nektar toplayıp kovanında tatlı bal yapan kanatlı çalışkan böcek', answer: 'ARI' },
  { letter: 'A', question: 'Kış uykusuna yatan, balı ve somon balığını çok seven tüylü iri hayvan', answer: 'AYI' },
  { letter: 'A', question: 'Geceleri gökyüzünde parlayan, hilal veya dolunay şeklinde görülen uydumuz', answer: 'AY' },
  { letter: 'B', question: 'Suda solungaçlarıyla yüzen ve pulları olan sevimli su canlısı', answer: 'BALIK' },
  { letter: 'B', question: 'Doğum günlerinde üflenerek şişirilen rengarenk uçan oyuncak', answer: 'BALON' },
  { letter: 'B', question: 'İki tekerleği olan ve pedallarını çevirerek sürdüğümüz eğlenceli araç', answer: 'BİSİKLET' },
  { letter: 'B', question: 'Soğuk havalarda başımıza taktığımız sıcacık tutan örgü şapka', answer: 'BERE' },
  { letter: 'C', question: 'Tavuğun yumurtasından "Cik cik" sesiyle çıkan sarı tüylü minik yavru', answer: 'CİVCİV' },
  { letter: 'C', question: 'Sert kabuğu kırılınca içinden beynimize benzeyen faydalı bir kuruyemiş çıkan yemiş', answer: 'CEVİZ' },
  { letter: 'C', question: 'Pantolon veya montlarımızda küçük eşyalarımızı koyduğumuz kumaş torbacık', answer: 'CEP' },
  { letter: 'C', question: 'Pencerelerimize takılan, evi aydınlatan şeffaf sert malzeme', answer: 'CAM' },
  { letter: 'Ç', question: 'Kakao çekirdeklerinden yapılan, sütlüsü ve fındıklısı olan en lezzetli tatlı', answer: 'ÇİKOLATA' },
  { letter: 'Ç', question: 'Bahar gelince rengarenk açan, mis gibi kokan papatya, gül ve lale gibi bitkiler', answer: 'ÇİÇEK' },
  { letter: 'Ç', question: 'Okula giderken kitaplarımızı ve defterlerimizi içine koyup sırtımıza taktığımız eşya', answer: 'ÇANTA' },
  { letter: 'Ç', question: 'Yazın kıpkırmızı olgunlaşan, üzerinde minik çekirdekleri olan tatlı ve sulu meyve', answer: 'ÇİLEK' },
  { letter: 'D', question: 'Yazın sıcağında külahın içinde yediğimiz vanilyalı ve kakaolu buz gibi tatlı', answer: 'DONDURMA' },
  { letter: 'D', question: 'Hasta olduğumuzda bizi muayene eden ve iyileşmemize yardım eden önlüklü kişi', answer: 'DOKTOR' },
  { letter: 'D', question: 'Üzerinde yaşadığımız, uzaydan bakıldığında masmavi görünen gezegenimiz', answer: 'DÜNYA' },
  { letter: 'D', question: 'Gömlek ve hırkalarımızın önünü iliklemeye yarayan minik yuvarlak parça', answer: 'DÜĞME' },
  { letter: 'E', question: 'Kırmızı veya yeşil renkli, ısırdığımızda çıtır çıtır ses çıkaran sulu meyve', answer: 'ELMA' },
  { letter: 'E', question: 'Fırından yeni çıkmış sıcacık, sofraların vazgeçilmezi temel gıda', answer: 'EKMEK' },
  { letter: 'E', question: 'Kışın ellerimiz üşümesin diye parmaklarımıza giydiğimiz sıcak giyecek', answer: 'ELDİVEN' },
  { letter: 'E', question: 'Uzun kulakları olan, "A-i a-i" diye anıran sevimli binek hayvanı', answer: 'EŞEK' },
  { letter: 'F', question: 'Kocaman kulakları ve upuzun bir hortumu olan karaların en büyük hayvanı', answer: 'FİL' },
  { letter: 'F', question: 'Karadeniz fındık bahçelerinde yetişen, çikolataların içine de konulan çıtır kuruyemiş', answer: 'FINDIK' },
  { letter: 'F', question: 'Karanlıkta önümüzü aydınlatmak için elimizde taşıdığımız pilli ışık aleti', answer: 'FENER' },
  { letter: 'F', question: 'Peyniri çok seven, kedi görünce hemen yuvasına kaçan minik kemirgen', answer: 'FARE' },
  { letter: 'G', question: 'Dünyamızı ısıtan ve aydınlatan gökyüzündeki sapsarı büyük yıldızımız', answer: 'GÜNEŞ' },
  { letter: 'G', question: 'Yağmurdan sonra gökyüzünde beliren 7 renkli muhteşem kemer', answer: 'GÖKKUŞAĞI' },
  { letter: 'G', question: 'Denizde yolcu ve yük taşıyan büyük motorlu deniz aracı', answer: 'GEMİ' },
  { letter: 'G', question: 'Gözlerimizin daha net görmesini sağlayan veya güneşten koruyan çerçeveli camlı araç', answer: 'GÖZLÜK' },
  { letter: 'H', question: 'Tavşanların çok sevdiği, kardan adama da burun yapılan turuncu uzun sebze', answer: 'HAVUÇ' },
  { letter: 'H', question: 'Gökyüzünde dönen pervanesi sayesinde havada durabilen hava taşıtı', answer: 'HELİKOPTER' },
  { letter: 'H', question: 'Doğum günlerinde arkadaşlarımıza hediye paketi içinde verdiğimiz güzel şey', answer: 'HEDİYE' },
  { letter: 'H', question: 'Denizde yaşayan, Karadenizlilerin tavasını çok sevdiği parlak küçük balık', answer: 'HAMSİ' },
  { letter: 'I', question: 'Kışın annemizin kaynatıp içine limon sıktığı şifalı mis kokulu sarı çiçekli çay', answer: 'IHLAMUR' },
  { letter: 'I', question: 'Temel Reis\'in yiyince kaslarının şiştiği yeşil yapraklı vitaminli sebze', answer: 'ISPANAK' },
  { letter: 'I', question: 'Karanlık bir odaya girdiğimizde lambayı açınca odayı aydınlatan şey', answer: 'IŞIK' },
  { letter: 'I', question: 'Bizi çağırmak veya müzik yapmak için dudaklarımızı büzerek çıkardığımız ince ses', answer: 'ISLIK' },
  { letter: 'İ', question: 'Bize süt veren, çimenleri otlayan ve "Möö" diye ses çıkaran uysal çiftlik hayvanı', answer: 'İNEK' },
  { letter: 'İ', question: 'Kuklaları oynatmak veya iğneye takıp dikiş dikmek için kullanılan ince bağ', answer: 'İP' },
  { letter: 'İ', question: 'Eskimoların kardan ve buz tuğlalarından yaptığı minik yuvarlak ev', answer: 'İGLO' },
  { letter: 'İ', question: 'Hasta olunca doktora gidip aldığımız, bizi iyileştiren şurup veya tablet', answer: 'İLAÇ' },
  { letter: 'K', question: 'Mırıldayan, yumakla oynayan ve "Miyav" diye ses çıkaran tüylü evcil hayvan', answer: 'KEDİ' },
  { letter: 'K', question: 'Sadık dostumuz olan, kemik seven ve "Hav hav" diye havlayan evcil hayvan', answer: 'KÖPEK' },
  { letter: 'K', question: 'Yere gökten lapa lapa yağan, beyaz renkli, soğuk ve yumuşacık yağış türü', answer: 'KAR' },
  { letter: 'K', question: 'Resim yaparken ve yazı yazarken kullandığımız, ucu açılan kırtasiye aracı', answer: 'KALEM' },
  { letter: 'L', question: 'Sarı renkli, kabuğu kokulu, çorbaya sıkılan çok ekşi meyve', answer: 'LİMON' },
  { letter: 'L', question: 'İstanbul\'un simgesi olan, baharda parklarda rengarenk açan soğanlı zarif çiçek', answer: 'LALE' },
  { letter: 'L', question: 'Kışın sıcak ülkelere uçan, evlerin bacasına yuva kuran uzun bacaklı kuş', answer: 'LEYLEK' },
  { letter: 'L', question: 'Akşam evimizi aydınlatması için tavana veya çalışma masasına konulan elektrikli aydınlatıcı', answer: 'LAMBA' },
  { letter: 'M', question: 'Maymunların çok sevdiği, sarı renkli, kabuğu kolayca soyulan tatlı meyve', answer: 'MUZ' },
  { letter: 'M', question: 'Buzdolabına yapışan, demirleri ve ataşları kendine çeken cisim', answer: 'MIKNATIS' },
  { letter: 'M', question: 'Kağıtları kesmek için kullandığımız iki bıçaklı ve halkalı kesme aracı', answer: 'MAKAS' },
  { letter: 'M', question: 'Doğum günü pastasının üzerine dikip üflediğimiz minik alevli şey', answer: 'MUM' },
  { letter: 'N', question: 'Kabuğunu kırınca içinden yüzlerce yakut gibi kırmızı tatlı taneler çıkan meyve', answer: 'NAR' },
  { letter: 'N', question: 'Sakızlara ve naneli şekerlere ferahlık veren mis kokulu yeşil yapraklı baharat', answer: 'NANE' },
  { letter: 'N', question: 'Bebeklerin uyuması için annelerinin yumuşak sesle söylediği ninni ve şarkı', answer: 'NİNNİ' },
  { letter: 'N', question: 'Göllerde suyun üstünde yüzen, kurbağaların üzerine oturduğu beyaz geniş çiçek', answer: 'NİLÜFER' },
  { letter: 'O', question: 'Her sabah çantamızı alıp gittiğimiz, arkadaşlarımızla yeni bilgiler öğrendiğimiz bina', answer: 'OKUL' },
  { letter: 'O', question: 'Çocukların teneffüste ve evde eğlenmek için arkadaşlarıyla kurduğu yarış ve aktivite', answer: 'OYUN' },
  { letter: 'O', question: 'Sincapların, kuşların ve yüzlerce ağacın bir arada yaşadığı yemyeşil büyük doğa parçası', answer: 'ORMAN' },
  { letter: 'O', question: 'Yay ile fırlatılan, hedef tahtasını tam ortasından vurmaya yarayan sivri uçlu çubuk', answer: 'OK' },
  { letter: 'Ö', question: 'Vak vak sesleri çıkaran, suda neşeyle yüzen sarı gagalı sevimli kuş', answer: 'ÖRDEK' },
  { letter: 'Ö', question: 'Köşelerde ipekten ağ kurup minik böcekleri yakalayan sekiz bacaklı canlı', answer: 'ÖRÜMCEK' },
  { letter: 'Ö', question: 'Okulda bize okuma yazmayı ve dünyayı öğreten sevgili rehberimiz', answer: 'ÖĞRETMEN' },
  { letter: 'Ö', question: 'Okuldan sonra evde derslerimizi pekiştirmek için yaptığımız çalışma ve görevler', answer: 'ÖDEV' },
  { letter: 'P', question: 'Kışın kutup ayılarının yanında buz üstünde paytak paytak yürüyen fraklı sevimli kuş', answer: 'PENGUEN' },
  { letter: 'P', question: 'Bambu dallarını çok seven, gözlerinin etrafı siyah halkalı sevimli dev ayı', answer: 'PANDA' },
  { letter: 'P', question: 'Kızartması ve ketçapla yenmesi çok sevilen toprak altında yetişen sebze', answer: 'PATATES' },
  { letter: 'P', question: 'İnsanların söylediklerini taklit edebilen rengarenk tüylü geveze evcil kuş', answer: 'PAPAĞAN' },
  { letter: 'R', question: 'Boya kalemleriyle deftere çizdiğimiz manzara, ev ve güneş çizimi', answer: 'RESİM' },
  { letter: 'R', question: 'Müzik ve haber dinlemek için açılan, anteni olan nostaljik ses cihazı', answer: 'RADYO' },
  { letter: 'R', question: 'Uzaya astronotları ve uyduları fırlatan devasa ateşli hava aracı', answer: 'ROKET' },
  { letter: 'R', question: 'Metal parçalardan yapılan, komutları dinleyen ve hareket eden yapay zeka makine', answer: 'ROBOT' },
  { letter: 'S', question: 'Parkta arkadaşlarımızla sallanırken gökyüzüne doğru yükseldiğimiz eğlenceli oyuncak', answer: 'SALINCAK' },
  { letter: 'S', question: 'Üzerinde susamları olan, çıtır çıtır, yuvarlak fırın lezzeti', answer: 'SİMİT' },
  { letter: 'S', question: 'Yaşamak için her gün en az 8 bardak içmemiz gereken berrak temel içecek', answer: 'SU' },
  { letter: 'S', question: 'Ağaçlarda yaşayan, meşe palamudu ve ceviz toplayan kabarık kuyruklu sevimli hayvan', answer: 'SİNCAP' },
  { letter: 'Ş', question: 'Yazın güneşten, kışın soğuktan korunmak için başımıza taktığımız siperlikli giyecek', answer: 'ŞAPKA' },
  { letter: 'Ş', question: 'Yağmur yağdığında ıslanmamak için üzerimize açtığımız telli tente', answer: 'ŞEMSİYE' },
  { letter: 'Ş', question: 'Çayımıza tat versin diye attığımız beyaz minik küp tatlandırıcı', answer: 'ŞEKER' },
  { letter: 'Ş', question: 'Müzik dinlerken ağzımızla veya enstrümanla söylediğimiz melodik sözler', answer: 'ŞARKI' },
  { letter: 'T', question: 'Upuzun kulakları olan, hızlı koşan, havuç yemeyi çok seven zıpzıp hayvan', answer: 'TAVŞAN' },
  { letter: 'T', question: 'Demir raylar üzerinde ilerleyen, "Çuf çuf" sesi çıkaran çok vagonlu kara taşıtı', answer: 'TREN' },
  { letter: 'T', question: 'Futbol, basketbol veya voleybol oynarken ayağımızla ya da elimizle vurduğumuz yuvarlak nesne', answer: 'TOP' },
  { letter: 'T', question: 'Kümeste her sabah yumurtlayan, "Gıt gıt gıdak" diye öten çiftlik kuşu', answer: 'TAVUK' },
  { letter: 'U', question: 'Gökyüzünde bulutların üstünde kanatlarıyla uçan dev motorlu hava taşıtı', answer: 'UÇAK' },
  { letter: 'U', question: 'İpini elimizde tutarak rüzgarda gökyüzünde dalgalandırdığımız renkli kağıttan oyuncak', answer: 'UÇURTMA' },
  { letter: 'U', question: 'Kırmızı kanatlarının üzerinde siyah benekleri olan, el üstünde uğur getirdiğine inanılan sevimli minik böcek', answer: 'UĞUR BÖCEĞİ' },
  { letter: 'U', question: 'Her gece yatağımıza yattığımızda gözlerimizi kapatınca gördüğümüz tatlı rüyalar alemi', answer: 'UYKU' },
  { letter: 'V', question: 'İstanbul Boğazı\'nda martılara simit atarak bir yakadan diğerine geçtiğimiz nostaljik deniz aracı', answer: 'VAPUR' },
  { letter: 'V', question: 'Çiçekler solmasın ve odamız güzelleşsin diye içine su koyup çiçek yerleştirdiğimiz süslü kap', answer: 'VAZO' },
  { letter: 'V', question: 'Kolları ve parmakları kullanarak file üstünden topu karşı sahaya geçirdiğimiz takım sporu', answer: 'VOLEYBOL' },
  { letter: 'V', question: 'Trenlerin arkasına zincirlerle bağlanan yolcuların veya yüklerin bindiği bölümler', answer: 'VAGON' },
  { letter: 'Y', question: 'Gece gökyüzünde ışıl ışıl parlayan minik gök cismi', answer: 'YILDIZ' },
  { letter: 'Y', question: 'Kahvaltıda haşlanmış veya tavada yediğimiz, tavuğun beyaz kabuklu besini', answer: 'YUMURTA' },
  { letter: 'Y', question: 'Gökyüzündeki bulutlardan toprağa damla damla düşen bereketli su damlaları', answer: 'YAĞMUR' },
  { letter: 'Y', question: 'Denizde yaşayan, gemilerin yanında zıplayarak neşeyle yüzen sevimli memeli hayvan', answer: 'YUNUS' },
  { letter: 'Z', question: 'Uzun sarı boynuyla yüksek ağaçlardaki yaprakları kolayca yiyen dünyanın en uzun boylu hayvanı', answer: 'ZÜRAFA' },
  { letter: 'Z', question: 'Siyah beyaz çizgili pijaması varmış gibi görünen sevimli Afrika vahşi atı', answer: 'ZEBRA' },
  { letter: 'Z', question: 'Tavla oynarken veya masa oyunlarında elimizde sallayıp masa üstüne attığımız 1\'den 6\'ya kadar noktalı küp', answer: 'ZAR' },
  { letter: 'Z', question: 'Evimizin kapısına gelindiğinde misafirlerin bastığı "Dın don" sesi çıkaran cihaz', answer: 'ZİL' }
];

export const LOCAL_AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];

export class PassaparolaEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'local'; // 'local' (sunucu masada) | 'wifi' (bulut / QR)
    this.categoryMode = 'adult'; // 'adult' | 'kids'
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

    // Dinamik Soru Motoru: AI destekli soru üretimi için temel
    this.questionGenerator = new QuestionGenerator(PASSAPAROLA_QUESTIONS_DB, PASSAPAROLA_KIDS_QUESTIONS_DB);

    window.__passaparola = this;
  }

  init() {
    this.bindEvents();
    this.setupLocalMode();
    this.showSetup();
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

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

    // Bağlantıyı Kopyala Butonu
    const btnCopyLink = document.getElementById('btn-copy-passa-link');
    if (btnCopyLink) {
      btnCopyLink.onclick = async () => {
        sounds.playClick();
        const url = firebaseNetwork.getPassaparolaUrl(this.roomId || 'PASS');
        try {
          await navigator.clipboard.writeText(url);
          this.game.showToast('📋 Passaparola bağlantısı panoya kopyalandı!');
        } catch (e) {
          prompt('Passaparola bağlantısı:', url);
        }
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
      btnFinishNow.onclick = () => this.finishTeamTurn('Yarışma Sunucu Tarafından Bitirildi');
    }

    const btnRestart = document.getElementById('btn-passa-restart');
    if (btnRestart) {
      btnRestart.onclick = () => {
        this.resetGame();
        this.startGame();
      };
    }

    // Kategori Modu Butonları (Genel Kültür / Çocuk)
    const btnCatAdult = document.getElementById('btn-passa-cat-adult');
    const btnCatKids = document.getElementById('btn-passa-cat-kids');
    if (btnCatAdult) {
      btnCatAdult.onclick = () => this.setCategoryMode('adult');
    }
    if (btnCatKids) {
      btnCatKids.onclick = () => this.setCategoryMode('kids');
    }

    // Yeni Soru Butonu (Dinamik Soru Üretimi)
    
    // AI Yeni Soru Değiştirme Butonu (Madde 10)
    const btnAi = document.getElementById('btn-passa-ai-question');
    if (btnAi) {
      btnAi.onclick = () => this.changeCurrentQuestionWithAI();
    }

    // Geri Dön: Oyun/Sonuç ekranındayken hazırlık menüsüne döner; hazırlıktayken parti menüsüne döner
    const btnBack = document.getElementById('btn-back-from-passaparola');
    if (btnBack) {
      btnBack.onclick = () => {
        sounds.playClick();
        if (this.isInGameOrResult()) {
          this.showSetup();
        } else {
          this.game.showScreen('partyGames');
        }
      };
    }

    // Sonuç Ekranından Hazırlık Menüsüne Dön Butonu
    const btnBackToSetup = document.getElementById('btn-passa-back-to-setup');
    if (btnBackToSetup) {
      btnBackToSetup.onclick = () => {
        sounds.playClick();
        this.showSetup();
      };
    }
  }

  setCategoryMode(cat) {
    this.categoryMode = cat;
    const btnAdult = document.getElementById('btn-passa-cat-adult');
    const btnKids = document.getElementById('btn-passa-cat-kids');
    if (btnAdult) btnAdult.classList.toggle('active', cat === 'adult');
    if (btnKids) btnKids.classList.toggle('active', cat === 'kids');
    sounds.playClick();
    if (!this.isPlaying) {
      this.resetGame();
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
    if (cvsContainer) {
      cvsContainer.innerHTML = '';
      cvsContainer.style.background = '#FFFFFF';
      cvsContainer.style.padding = '8px';
      cvsContainer.style.borderRadius = '14px';
      cvsContainer.style.display = 'inline-block';
      cvsContainer.style.boxShadow = '0 0 25px rgba(0,245,212,0.4)';

      const cvs = document.createElement('canvas');
      cvs.style.display = 'block';
      cvs.style.borderRadius = '8px';
      cvsContainer.appendChild(cvs);

      const qrEngine = (typeof QRCode !== 'undefined' && QRCode) || (typeof window !== 'undefined' && window.QRCode);
      if (qrEngine && qrEngine.toCanvas) {
        qrEngine.toCanvas(cvs, joinUrl, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        }).catch(err => {
          console.warn('Passaparola QR canvas hatası, fallback resim:', err);
          cvsContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}" width="180" height="180" style="display:block; border-radius:8px; background:#FFF;" />`;
        });
      } else {
        cvsContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}" width="180" height="180" style="display:block; border-radius:8px; background:#FFF;" />`;
      }
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
          if (badge) {
            badge.innerHTML = `
              <span style="margin-right:6px;">${pList.length} Yarışmacı Bağlı</span>
              <button type="button" class="btn-host-moderation-badge" id="btn-passa-mod-open" style="padding:2px 8px; font-size:0.72rem; vertical-align:middle;">
                <span class="pulse-dot"></span> 🛡️ Yönetim Masası
              </button>
            `;
            document.getElementById('btn-passa-mod-open')?.addEventListener('click', (e) => {
              e.stopPropagation();
              HostModerationPanel.open({
                namespace: 'passaparola',
                roomId: this.roomId,
                title: 'Passaparola Yarışmacı Masası'
              });
            });
          }
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
      // Dinamik soru getir (AI destekli rotasyon)
      this.currentQuestions[letter] = this.questionGenerator.getDynamicQuestion(letter, this.categoryMode);
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

  showSetup() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
    this.isFinished = false;
    try { sounds.stopPartyBeat(); } catch (e) {}
    try { sounds.setMusicUrgent(false); } catch (e) {}

    const setupBox = document.getElementById('passa-setup-stage');
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');

    if (setupBox) setupBox.style.display = 'block';
    if (playBox) playBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'none';

    this.renderLocalPlayersUI();
    this.renderWheel();
    this.updateStatsUI();
  }

  isInGameOrResult() {
    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');
    const isPlayVisible = playBox && playBox.style.display !== 'none';
    const isResultVisible = resultBox && resultBox.style.display !== 'none';
    return this.isPlaying || isPlayVisible || isResultVisible;
  }

  startGame() {
    this.startTeamTurn(0);
  }

  // =========================================================================
  // TAKIM SIRALI YARIŞMA VE DİNAMİK AI SORU YÖNETİMİ (Madde 10)
  // =========================================================================
  startTeamTurn(playerIndex = 0) {
    this.activePlayerIndex = playerIndex;

    // Yeni yarışma başlarken tüm oyuncuların puan ve sayaçlarını sıfırla
    if (playerIndex === 0) {
      this.players.forEach(p => {
        p.score = 0;
        p.correct = 0;
        p.wrong = 0;
        p.pass = 0;
      });
    }

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
    try { sounds.startPartyBeat(); } catch (e) {}
    this.renderWheel();
    this.loadQuestionForCurrent();
    this.updateStatsUI();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerUI();

      if (this.remainingSeconds <= 15 && this.remainingSeconds > 0) {
        try { sounds.setMusicUrgent(true); } catch (e) {}
      }

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
    this.isFinished = true;
    clearInterval(this.timerInterval);
    try { sounds.setMusicUrgent(false); } catch (e) {}
    try { sounds.stopPartyBeat(); } catch (e) {}
    try { sounds.playFanfare(); } catch (e) {}

    const playBox = document.getElementById('passa-play-stage');
    const resultBox = document.getElementById('passa-result-stage');
    if (playBox) playBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'block';

    const titleEl = document.getElementById('passa-result-title');
    const scoreEl = document.getElementById('passa-result-score');
    const correctEl = document.getElementById('passa-result-correct');
    const wrongEl = document.getElementById('passa-result-wrong');
    const rateEl = document.getElementById('passa-result-rate');

    const totalCorrect = PASSAPAROLA_LETTERS.filter(l => this.letterStates[l] === 'correct').length;
    const totalWrong = PASSAPAROLA_LETTERS.filter(l => this.letterStates[l] === 'wrong').length;
    const totalScore = totalCorrect * 10;
    const totalAnswered = totalCorrect + totalWrong;
    const rate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    if (titleEl) {
      titleEl.innerHTML = (reason || 'Yarışma Bitti!') + '<br><span style="font-size:1.15rem; color:#FFF; font-weight:800;">🎉 Passaparola Turu Tamamlandı!</span>';
    }
    if (scoreEl) scoreEl.textContent = totalScore + ' Puan';
    if (correctEl) correctEl.textContent = totalCorrect;
    if (wrongEl) wrongEl.textContent = totalWrong;
    if (rateEl) rateEl.textContent = '%' + rate;

    // Oyuncu Katkıları & Puan Dağılımı Dökümü
    const breakdownEl = document.getElementById('passa-result-players-breakdown');
    if (breakdownEl) {
      if (this.players.length > 1) {
        breakdownEl.style.display = 'block';
        const sorted = [...this.players].sort((a, b) => (b.score || 0) - (a.score || 0));
        breakdownEl.innerHTML = `
          <div style="font-size:0.8rem; font-weight:800; color:rgba(255,255,255,0.7); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">👥 Oyuncu Skorları & Katkıları</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${sorted.map(p => `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.06); padding:8px 12px; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:1.15rem;">${p.avatar || '🦁'}</span>
                  <span style="font-weight:800; font-size:0.95rem; color:#FFF;">${p.name}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:0.85rem; color:rgba(255,255,255,0.6);">${p.correct || 0} Doğru</span>
                  <span style="font-weight:900; font-size:1rem; color:var(--primary);">${p.score || 0} P</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        breakdownEl.style.display = 'none';
      }
    }

    const btnNextTeam = document.getElementById('btn-passa-next-team-turn');
    if (btnNextTeam) {
      btnNextTeam.style.display = 'none';
    }

    this.syncRoomState('finished');
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

    // Eski strip varsa DOM'dan temizle
    const existingStrip = document.getElementById('passa-strip-container');
    if (existingStrip && existingStrip.parentNode) {
      existingStrip.parentNode.removeChild(existingStrip);
    } else if (existingStrip && existingStrip.remove) {
      existingStrip.remove();
    }

    const radius = 125;
    const cx = 145;
    const cy = 145;
    const total = PASSAPAROLA_LETTERS.length;
    const angleStep = (2 * Math.PI) / total;

    // 26 Harfli Kusursuz Dairesel Çark
    PASSAPAROLA_LETTERS.forEach((letter, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      const node = document.createElement('div');
      const state = this.letterStates[letter] || 'pending';
      node.className = `passa-node node-${state}`;
      node.id = `passa-node-${letter}`;
      node.textContent = letter;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      // Harfe doğrudan dokunarak geçiş yapabilme
      node.onclick = () => {
        if (this.isPlaying && !this.isFinished) {
          this.jumpToLetter(letter);
        }
      };

      wheelContainer.appendChild(node);
    });
  }

  updateWheelNode(letter) {
    const node = document.getElementById(`passa-node-${letter}`);
    if (node) {
      const state = this.letterStates[letter] || 'pending';
      node.className = `passa-node node-${state}`;
    }
  }

  jumpToLetter(letter) {
    if (!this.isPlaying || this.isFinished) return;
    const targetIdx = PASSAPAROLA_LETTERS.indexOf(letter);
    if (targetIdx === -1) return;
    try { sounds.playClick(); } catch (e) {}

    const prevLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    if (this.letterStates[prevLetter] === 'active') {
      this.letterStates[prevLetter] = 'pending';
      this.updateWheelNode(prevLetter);
    }

    this.currentIndex = targetIdx;
    this.loadQuestionForCurrent();
    this.syncRoomState('jump');
  }

  loadQuestionForCurrent() {
    const currentLetter = PASSAPAROLA_LETTERS[this.currentIndex];
    const qData = this.currentQuestions[currentLetter];

    // Önceki aktif harfleri temizle
    PASSAPAROLA_LETTERS.forEach(l => {
      if (l !== currentLetter && this.letterStates[l] === 'active') {
        this.letterStates[l] = 'pending';
        this.updateWheelNode(l);
      }
    });

    // Harf durumu bitmemişse active yap
    if (this.letterStates[currentLetter] !== 'correct' && this.letterStates[currentLetter] !== 'wrong') {
      this.letterStates[currentLetter] = 'active';
    }
    this.updateWheelNode(currentLetter);

    // Aktif Yarışmacı
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0];
    const lblPlayer = document.getElementById('lbl-passa-active-player');
    if (lblPlayer && activePlayer) {
      lblPlayer.textContent = `${activePlayer.avatar || '🦁'} ${activePlayer.name}`;
    }

    // Çark Merkezi Harf
    const letterHero = document.getElementById('passa-center-letter');
    if (letterHero) letterHero.textContent = currentLetter;

    // Soru Metni
    const qText = document.getElementById('passa-question-text');
    if (qText) {
      qText.textContent = (qData && qData.question) ? qData.question : `${currentLetter} harfi ile başlayan soruyu yanıtlayınız.`;
    }

    // SUNUCU DOĞRU CEVAP KUTUSU (Sunucuya her zaman açık ve net görünür)
    const hostAns = document.getElementById('passa-answer-text');
    if (hostAns) {
      hostAns.textContent = (qData && qData.answer) ? qData.answer : currentLetter;
    }

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
      this.finishTeamTurn('🎉 Tüm Harfler Tamamlandı!');
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
    this.updateStatsUI();
    this.syncRoomState();
  }

  updateStatsUI() {
    const activePlayer = this.players[this.activePlayerIndex] || this.players[0] || {};
    const elCorrect = document.getElementById('passa-stat-correct');
    const elWrong = document.getElementById('passa-stat-wrong');
    const elScore = document.getElementById('passa-stat-score');

    // Turun toplam doğru, yanlış ve puanı (26 harf üzerinden hesaplanır)
    const totalCorrect = PASSAPAROLA_LETTERS.filter(l => this.letterStates[l] === 'correct').length;
    const totalWrong = PASSAPAROLA_LETTERS.filter(l => this.letterStates[l] === 'wrong').length;
    const totalScore = totalCorrect * 10;

    if (elCorrect) elCorrect.textContent = `${totalCorrect} Doğru`;
    if (elWrong) elWrong.textContent = `${totalWrong} Yanlış`;
    if (elScore) elScore.textContent = `${totalScore} P`;

    // Aktif yarışmacı etiketi: çoklu oyuncuda oyuncunun bireysel puanını da gösterir
    const lbl = document.getElementById('lbl-passa-active-player');
    if (lbl && activePlayer && activePlayer.name) {
      lbl.textContent = this.players.length > 1
        ? `${activePlayer.avatar || '🦁'} ${activePlayer.name} (${activePlayer.score || 0} P)`
        : `${activePlayer.avatar || '🦁'} ${activePlayer.name}`;
    }
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
    try { sounds.setMusicUrgent(false); } catch (e) {}
    try { sounds.stopPartyBeat(); } catch (e) {}

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

// =========================================================================
// 10. DINAMİK SORU ÜRETİCİ & AI ENTEGRASYONU
// =========================================================================
// Soru havuzu yönetimi ve yapay zeka destekli dinamik soru üretimi
// Kullanılabilir: Yerel DB'ler, externe API'lar veya AI modelleri

class QuestionGenerator {
  constructor(adultDB, kidsDB) {
    this.adultDB = adultDB;
    this.kidsDB = kidsDB;
    this.usedGlobalQuestions = new Set();
  }

  // Tekil harf için senkron dinamik soru getir (resetGame vb. için)
  getDynamicQuestion(letter, categoryMode = 'adult') {
    const db = categoryMode === 'kids' ? this.kidsDB : this.adultDB;
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
      question: `${letter} harfi ile başlayan kavram`,
      answer: letter
    };
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

    const prompt = 'Sen popüler Türk televizyon yarışması Passaparola\'nın soru yazarısın. Lütfen ' + letter + ' harfi ile başlayan ve doğru cevabı tam olarak ' + letter + ' harfiyle başlayan 1 adet ' + (categoryMode === 'kids' ? 'çocuklara uygun' : 'genel kültür') + ' sorusu üret. Yalnızca JSON formatında yanıt ver: {"letter": "' + letter + '", "question": "...", "answer": "..."}';

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
