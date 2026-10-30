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
  { letter: 'Z', question: 'Olayların geçmişten bugüne ve geleceğe aktığı süreklilik boyutu', answer: 'ZAMAN' }
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
  { letter: 'Z', question: 'Okulda dersin bittiğini ve teneffüse çıkma vaktini haber veren ses', answer: 'ZİL' }
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
      btnFinishNow.onclick = () => this.finishGame('Yarışma Sunucu Tarafından Bitirildi');
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
    const btnNewQuestion = document.getElementById('btn-new-question');
    if (btnNewQuestion) {
      btnNewQuestion.onclick = () => {
        sounds.playClick();
        const currentLetter = PASSAPAROLA_LETTERS[this.currentIndex];
        const newQ = this.questionGenerator.getDynamicQuestion(currentLetter, this.categoryMode);
        this.currentQuestions[currentLetter] = newQ;
        this.loadQuestionForCurrent();
        this.game.showToast(`🔀 ${currentLetter} harfi için yeni soru yüklendi!`);
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

  startGame() {
    this.isPlaying = true;
    this.isFinished = false;
    this.currentIndex = 0;
    this.remainingSeconds = this.totalDuration;

    // Harf durumlarını sıfırla ve dinamik sorularla doldur
    PASSAPAROLA_LETTERS.forEach(letter => {
      this.letterStates[letter] = 'pending';
      this.currentQuestions[letter] = this.questionGenerator.getDynamicQuestion(letter, this.categoryMode);
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

    // Yatay strip öğeleri (çarkın altında harf listesi)
    const stripContainer = document.getElementById('passa-strip-container');
    if (!stripContainer) {
      const newStrip = document.createElement('div');
      newStrip.id = 'passa-strip-container';
      newStrip.style.cssText = `
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        padding: 6px 12px;
        background: rgba(0,0,0,0.5);
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 800;
        overflow-x: auto;
        scroll-behavior: smooth;
        white-space: nowrap;
        z-index: 10;
      `;
      wheelContainer.parentElement.appendChild(newStrip);
    }

    // Strip'e harfleri ekle
    const strip = document.getElementById('passa-strip-container');
    strip.innerHTML = '';
    PASSAPAROLA_LETTERS.forEach((letter, i) => {
      const isActive = this.letterStates[letter] === 'active';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = letter;
      btn.style.cssText = `
        flex: 0 0 40px;
        margin: 0 2px;
        padding: 6px 8px;
        border-radius: 20px;
        background: ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
        color: ${isActive ? '#0B0E14' : '#FFF'};
        border: 1.5px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.3)'};
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.85rem;
        font-weight: 800;
        min-width: 40px;
        text-align: center;
      `;
      btn.onclick = () => {
        // Harf seçilene kadar etkileşim kapalı, döndürme ile seçilir
      };
      strip.appendChild(btn);
    });

    // Çark düğümlerini oluştur
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
      // Aktif harfi büyült ve parlat
      if (this.letterStates[letter] === 'active') {
        node.style.transform = 'scale(1.3)';
        node.style.boxShadow = '0 0 25px var(--primary)';
      } else {
        node.style.transform = 'scale(1)';
        node.style.boxShadow = 'none';
      }
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

// =========================================================================
// 10. DINAMİK SORU ÜRETİCİ & AI ENTEGRASYONU
// =========================================================================
// Soru havuzu yönetimi ve yapay zeka destekli dinamik soru üretimi
// Kullanılabilir: Yerel DB'ler, externe API'lar veya AI modelleri

class QuestionGenerator {
  constructor(adultDB, kidsDB) {
    this.adultDB = adultDB;
    this.kidsDB = kidsDB;
    this.usedQuestions = new Map(); // letter -> used question indices
    this.maxUsesPerLetter = 5; // Aynı harften önce 5 soru sonra yenile
  }

  // Belirli harf için yeni bir soru getir (dinamik/rotasyon)
  getDynamicQuestion(letter, categoryMode = 'adult') {
    const db = categoryMode === 'kids' ? this.kidsDB : this.adultDB;
    const pool = db.filter(q => q.letter === letter);

    if (pool.length === 0) {
      return {
        letter,
        question: `${letter} harfi ile başlayan kelime`,
        answer: letter
      };
    }

    // Önceki soruların indekslerini başlat
    if (!this.usedQuestions.has(letter)) {
      this.usedQuestions.set(letter, []);
    }
    const usedIndices = this.usedQuestions.get(letter);

    // Havuzdaki kullanılmayan indeksleri bul
    const availableIndices = pool
      .map((q, idx) => idx)
      .filter(idx => !usedIndices.includes(idx));

    let questionData;
    if (availableIndices.length > 0) {
      // Kullanılmayan bir soru seç
      const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      questionData = { ...pool[randomIdx] };
      usedIndices.push(randomIdx);
    } else {
      // Tüm sorular kullanıldı, listeyi sıfırla ve yeni soru seç
      this.usedQuestions.set(letter, []);
      const allIndices = pool.map((q, idx) => idx);
      const randomIdx = allIndices[Math.floor(Math.random() * allIndices.length)];
      questionData = { ...pool[randomIdx] };
      usedIndices.push(randomIdx);
    }

    // Maksimum kullanım sayısını kontrol et (5 soru sonra yenile)
    if (usedIndices.length >= this.maxUsesPerLetter && availableIndices.length === 0) {
      this.usedQuestions.set(letter, []);
    }

    return {
      letter,
      question: questionData.question,
      answer: questionData.answer
    };
  }

  // AI destekli dinamik soru üretimi (gelecek için placeholder)
  // Gerçek uygulamada buraya OpenAI, Gemini veya Ollama entegrasyonu eklenebilir
  generateAIDynamicQuestion(letter, context = '') {
    // Placeholder: Mevcut DB'den rastgele soru döndür
    // Gelecekte: OpenAI GPT-4, Google Gemini veya Ollama SLM çağrısı
    const db = this.getCurrentDB();
    const pool = db.filter(q => q.letter === letter);
    if (pool.length > 0) {
      const randomIdx = Math.floor(Math.random() * pool.length);
      return {
        letter,
        question: pool[randomIdx].question,
        answer: pool[randomIdx].answer
      };
    }
    return {
      letter,
      question: `${letter} harfi ile başlayan kelime`,
      answer: letter
    };
  }

  getCurrentDB() {
    return 'adult'; // Varsayılan adult, setCategoryMode ile değiştirilebilir
  }
}
