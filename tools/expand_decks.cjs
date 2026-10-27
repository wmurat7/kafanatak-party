// tools/expand_decks.cjs
// Kafana Tak! Kelime havuzunu genişleten ve yeni trend desteler ekleyen araç

const fs = require('fs');
const path = require('path');

const decksPath = path.join(__dirname, '..', 'js', 'decks.js');
let content = fs.readFileSync(decksPath, 'utf8');

// Yeni kelimeler listesi (Her kategori için özgün 35-40 yeni kelime)
const categoryAdditions = {
  'adult-18': [
    'İlk Gece Korkusu', 'Kırmızı İç Çamaşırı', 'Ateşli Öpücük', 'Striptizci Dansı', 'Gece Kulübü Tuvaleti',
    'Yatak Odası Fantezisi', 'Boyun Isırma', 'Aşk Isırığı (Hickey)', 'Körleme Masaj', 'Cüretkar Mesaj (Sexting)',
    'Tek Gecelik İlişki', 'Kelepçe ve İpek Fular', 'Göz Bağı Oyunu', 'Şampanyalı Jakuzi', 'İtiraflar Şişesi',
    'Yasak Aşk Kaçamağı', 'Arka Koltuk Romantizmi', 'Gündüz Kaçamağı', 'Çıplak Gece Yüzüşü', 'Aşk Oteli',
    'Kamasutra Pozisyonu', 'Flörtöz Bakışlar', 'Sensual Masaj Yağı', 'Özel Dans Şovu', 'Baştan Çıkarıcı Parfüm',
    'Mini İpek Gecelik', 'Cesaret mi Doğruluk mu (+18)', 'Sıcak Duş Kaçamağı', 'Karanlıkta Dokunma', 'Gizli Randevu',
    'Dudak Parlatıcısı İzi', 'Gece Yarısı Fısıltısı', 'Balkon Kaçamağı', 'Fantezi Kostümü', 'Romantik Kelepçe'
  ],
  'complete-lyrics': [
    'Akdeniz Akşamları bir başka oluyor...', 'Arkadaşım Eşek, arkadaşım eş...', 'Domates biber patlıcan...',
    'Gülpembe, dudağımda son bir türkü...', 'Papatya gibisin beyaz ve ince...', 'Dalgalandım da duruldum...',
    'Ben benden geçtim ama bir senden vazgeçemem...', 'Aşkın kanununu yazsam yeniden...', 'Geceler kara tren geceler...',
    'Bu akşam bütün meyhanelerini dolaştım İstanbul\'un...', 'Sen Allah\'ın bir lütfusun, gözlerimin nurusun...',
    'Hani o bırakıp giderken seni, bu öksüz tavrını takmayacaktın...', 'Unutabilsem seni ah unutabilsem...',
    'Kuzu kuzu geldim kapına...', 'Şıkıdım şıkıdım oyna...', 'Yakalarsam tık tık...', 'Hadi hadi gel bana...',
    'Gözlerinin yeşilini özledim...', 'Sen kocaman çöllerde bir kalabalık gibisin...', 'Bir fırtına tuttu bizi deryaya kardı...',
    'Kaderimin oyunu bu, çekilir dert değil...', 'Batsın bu dünya bitsin bu rüya...', 'Bir teselli ver, kırılan gururuma...',
    'Tanrım nerden sevdim, nerden düştüm bu belaya...', 'Sevda yüklü kervanlar...', 'Leylim ley, leylim ley...',
    'Eller havaya, bir sağa bir sola...', 'Çakkıdı çakkıdı oyna canım...', 'Bangır bangır dinle...', 'Bi saniye dur...'
  ],
  'animation-movies': [
    'Zootropolis (Judy Hopps)', 'Kung Fu Panda (Po)', 'Moana ve Maui', 'Ters Yüz (Neşe & Üzüntü)', 'Ratatouille (Remy)',
    'Vol-i (WALL-E & Eve)', 'Yukarı Bak (Carl & Russell)', 'Otel Transilvanya (Drakula)', 'Karlar Ülkesi (Olaf)',
    'Ejderhanı Nasıl Eğitirsin (Dişsiz)', 'Kayıp Balık Dori', 'Cesur (Merida)', 'Arabalar (Şimşek McQueen)',
    'Çılgın Hırsız (Minyonlar)', 'Shrek ve Eşek', 'Madagaskar (Kral Julien)', 'Karlar Kraliçesi Elsa',
    'Soul (Joe Gardner)', 'Enkanto (Mirabel)', 'Kırmızı (Turning Red)', 'Pinokyo', 'Aladdin ve Sihirli Lamba',
    'Mulan', 'Herkül', 'Tarzan', 'Buz Devri (Sid & Scrat)', 'Sevimli Canavarlar (Mike & Sulley)',
    'Lilo ve Dikiş (Stitch)', 'Kayıp Balık Nemo', 'Coco (Miguel)', 'İnanılmaz Aile (Bob Parr)', 'Korkusuz Kedi Çizmeli Kedi'
  ],
  'kids-special': [
    'Pamuk Şeker', 'Uçan Balon', 'Dondurma Külahı', 'Kaydırak', 'Salıncak', 'Tahterevalli',
    'Lolipop Şeker', 'Kumdan Kale', 'Su Tabancası', 'Renkli Tebeşir', 'Plastik Ördek',
    'Pelüş Ayıcık', 'Gökkuşağı', 'Çizgi Film', 'Oyun Hamuru', 'Lunapark Treni', 'Dönme Dolap',
    'Köşe Kapmaca', 'Saklambaç', 'Körebe', 'Seksek Taşı', 'İp Atlama', 'Balon Patlatma',
    'Patlamış Mısır', 'Çikolatalı Süt', 'Piknik Sepeti', 'Uçurtma Kuyruğu', 'Deniz Simidi',
    'Rüzgar Gülü', 'Köpük Baloncuk', 'Boyama Kitabı', 'Yapboz Parçası', 'Çorap Kuklası'
  ],
  'roleplay-acting': [
    'Trafik Polisi Ceza Kesiyor', 'Doktor İğne Vuracakken Korkutan Hasta', 'Kuaförde Saçı Kötü Kesilen Kadın',
    'Pazarda Limon Satan Esnaf', 'Metrobüste Yer Kapmaya Çalışan Teyze', 'İlk Kez Sushi Yiyen Biri',
    'Futbol Hakemine İtiraz Eden Teknik Direktör', 'Korku Filmi İzlerken Mısır Döken Seyirci', 'Piyango Kazandığını Öğrenen Memur',
    'Düğünde Halay Başı Olan Dayı', 'Restoranda Hesaba İtiraz Eden Müşteri', 'Diş Hekimi Koltuğunda Terleyen Biri',
    'Uçakta Türbülansa Giren Yolcu', 'Canlı Yayında Pot Kıran Muhabir', 'Bebek Bakarken Uyuyakalan Baba',
    'Akıllı Telefona Alışmaya Çalışan Dede', 'Defilede Yürüyen Manken', 'Gizli Ajan Görevi İptal Ediyor',
    'Sahnede Sözlerini Unutan Şarkıcı', 'Asansörde Mahsur Kalan İki Komşu', 'Spor Salonunda Ağır Halter Kaldıran Kişi'
  ],
  'nostalgia-songs': [
    'Samanyolu (Berkant)', 'Sev Kardeşim (Şenay)', 'Delisin Delisin (Cici Kızlar)', 'Gençlik Başımda Duman (Güzin ile Baha)',
    'Arkadaş (Melike Demirağ)', 'Anlıyorsun Değil mi (Barış Manço)', 'Gül Güzeli (Leman Sam)', 'Olanlar Olmuş (İlhan Şeşen)',
    'Resimdeki Gözyaşları (Cem Karaca)', 'Tamirci Çırağı (Cem Karaca)', 'Dağlar Dağlar (Barış Manço)', 'Sarı Çizmeli Mehmet Ağa',
    'Ele Güne Karşı (MFÖ)', 'Ali Desidero (MFÖ)', 'Güllerin İçinden (MFÖ)', 'Affet (Müslüm Gürses)', 'Nilüfer (Müslüm Gürses)',
    'Götür Beni Gittiğin Yere (Emrah)', 'Hercai (Çelik)', 'Ateşteyim (Çelik)', 'Karabiberim (Serdar Ortaç)'
  ],
  'brands-icons': [
    'Trendyol', 'Getir', 'Yemeksepeti', 'Hepsiburada', 'Netflix', 'Spotify', 'Instagram', 'TikTok',
    'WhatsApp', 'YouTube', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Apple iPhone', 'Tesla',
    'Starbucks', 'McDonald\'s', 'Burger King', 'Dominos Pizza', 'Nike Air Jordan', 'Adidas Originals',
    'Zara', 'IKEA', 'Lego', 'Red Bull', 'Coca-Cola', 'Nutella', 'Kahve Dünyası', 'BİM', 'A101', 'ŞOK Market'
  ],
  'series-movies': [
    'Aşk-ı Memnu', 'Ezel', 'Kurtlar Vadisi', 'Avrupa Yakası', 'Leyla ile Mecnun', 'Kuzey Güney',
    'Behzat Ç.', 'Yargı', 'Kızılcık Şerbeti', 'Gibi (İlkkan & Yılmaz)', 'Prens', 'Kulüp',
    'G.O.R.A.', 'A.R.O.G.', 'Vizontele', 'Babam ve Oğlum', 'Hababam Sınıfı', 'Tosun Paşa',
    'Süt Kardeşler', 'Kibar Feyzo', 'Çöpçüler Kralı', 'Yeditepe İstanbul', 'İkinci Bahar', 'Çemberimde Gül Oya'
  ],
  'memes-trends': [
    'Nereden Nereye', 'O sırada ben', 'Mükemmeliyetçilik şakası', 'Bro gerçekten mi?', 'POV: Sınav haftası',
    'Sen bu işi biliyorsun', 'Yok artık Lebron James', 'Aura puanı (-1000 Aura)', 'Rizz Ustası', 'Skibidi Toilet',
    'Sigma Kuralı #1', 'Gizli Görev Modu', 'İşte bu tam ben', 'Kafamda kurduğum senaryolar', 'Story\'e bakan eski sevgili',
    'Görüldü atıp yazmamak', 'Gece 3\'te gelen tavan izleme krizi', 'Sessize alınan grup sohbeti', 'Kaçak çay muhabbeti'
  ],
  'turkish-street-food': [
    'Midye Dolma', 'Kokoreç', 'Islak Kekikli Hamburger', 'Balık Ekmek (Eminönü)', 'Tantuni (Yoğurtlu Mersin)',
    'Çiğ Köfte Dürüm', 'Kumpir (Ortaköy Bol Malzemos)', 'Simit & Ayran', 'Kestane Kebap', 'Tavuk Pilav Üstü Nohut',
    'Bici Bici Tatlısı', 'İzmir Kumru', 'Bursa İskender', 'Adana Kebap', 'Urfa Kebap', 'Kelle Paça Çorbası',
    'Beyran Çorbası', 'Boyoz & Haşlanmış Yumurta', 'Halka Tatlısı', 'Maraş Dondurması', 'Şalgam Suyu'
  ],
  'football-sports': [
    'Arda Güler (Real Madrid)', 'Kenan Yıldız (Juventus)', 'Hakan Çalhanoğlu (Inter)', 'Semih Kılıçsoy',
    'Ferdi Kadıoğlu (Brighton)', 'Mauro Icardi (Aşkın Olayım)', 'Dusan Tadic', 'Edin Dzeko', 'Ciro Immobile',
    'Victor Osimhen', 'Fernando Muslera', 'Gheorghe Hagi', 'Alex de Souza', 'Ricardo Quaresma',
    'Volkan Demirel', 'Rüştü Reçber', 'Fatih Terim', 'Mustafa Denizli', 'Şenol Güneş', 'Okan Buruk',
    'Jose Mourinho', 'Filenin Sultanları (Melissa Vargas)', 'Eda Erdem', 'Zehra Güneş', 'Mete Gazoz (Okçuluk Şampiyonu)'
  ],
  'animals-nature': [
    'Van Kedisi (İki Renk Gözlü)', 'Kangal Köpeği (Sivas)', 'Akdeniz Foku', 'Caretta Caretta Deniz Kaplumbağası',
    'Bozayı (Karadeniz Ormanı)', 'Kızıl Tilki', 'Yaban Domuzu', 'Kafkas Vaşağı', 'Puhu Kuşu', 'Kaya Kartalı',
    'Akbaba', 'Bukalemun', 'Ahtapot', 'Yunus Balığı', 'Manta Vatozu', 'Denizanası', 'Denizatı', 'Geko Kertenkele',
    'Kutup Ayısı', 'Penguen Kolonisi', 'Koala', 'Kızıl Panda', 'Tembel Hayvan', 'Bukalemun Bakışı'
  ],
  'tabu-classic': [
    { word: 'TÜRK KAHVESİ', taboo: ['FAL', 'KÖPÜK', 'LOKUM', 'FİNCAN'] },
    { word: 'KAPADOKYA', taboo: ['BALON', 'PERİ BACASI', 'NEVŞEHİR', 'TURİST'] },
    { word: 'ÇAY BARDAĞI', taboo: ['İNCE BELLİ', 'DEMLİK', 'ŞEKER', 'TABAK'] },
    { word: 'BEYOĞLU', taboo: ['İSTİKLAL', 'TRAMVAY', 'GALATA', 'TAKSİM'] },
    { word: 'NARGİLE', taboo: ['DUMAN', 'TÖMBERKİ', 'KÖMÜR', 'MARPUÇ'] },
    { word: 'TAVLA', taboo: ['ZAR', 'PUL', 'MARS', 'KAPI'] },
    { word: 'HAMAM', taboo: ['KESE', 'KÖPÜK', 'TELLAK', 'SICAK'] },
    { word: 'MANGAL', taboo: ['KÖMÜR', 'ET', 'YELPAZE', 'PİKNİK'] },
    { word: 'ÇEYİZ', taboo: ['DÜĞÜN', 'SANDIK', 'GELİN', 'DANTEL'] },
    { word: 'DÖNER', taboo: ['ET', 'TAVUK', 'PİLAV', 'DÜRÜM'] },
    { word: 'BOĞAZİÇİ', taboo: ['KÖPRÜ', 'İSTANBUL', 'DENİZ', 'VAPUR'] },
    { word: 'KOLONYA', taboo: ['LİMON', 'BAYRAM', 'MİSAFİR', 'FERAHLIK'] }
  ]
};

// Yeni 2 Deste Tanımı
const newDecks = [
  {
    id: 'turkish-pop-culture',
    title: '📺 Türk Pop Kültürü & Efsane TV',
    icon: '📺',
    color: 'linear-gradient(135deg, #FF6B6B, #556270)',
    desc: 'Türk televizyon tarihinin unutulmaz replikleri, karakterleri ve ikonik anları!',
    badge: 'YENİ POPÜLER',
    words: [
      'Burhan Altıntop (Avrupa Yakası)', 'Bihter Ziyagil (Aşk-ı Memnu)', 'Polat Alemdar (Kurtlar Vadisi)',
      'Süleyman Çakır (İstanbul\'un Sefiri)', 'Memati Baş', 'Pembe ve Sultan (Cennet Mahallesi)',
      'Sihirli Annem Taci (Konuşan Köpek)', 'Dudu Peri (Betüş\'ün Annesi)', 'Çocuklar Duymasın Haluk (Taş Fırın)',
      'Meltem (Light Erkek Haluk)', 'Havuç Emre', 'Yaprak Dökümü Ali Rıza Bey (Tadımız Kaçmasın)',
      'Ferhunde (Entrika Kraliçesi)', 'Kuzey Tekinoğlu (Kuzey Güney Palto Çekişi)', 'Ali Kaptan (Öyle Bir Geçer Zaman ki)',
      'Behzat Ç. (La Bize Her Yer Ankara)', 'Hayalet ve Akbaba', 'Gibi Yılmaz ve İlkkan', 'Prens Bongomia Krallığı',
      'Yalan Dünya Vasfiye Teyze (N\'aptın Sen Ya)', 'Seksenler Ergun Plak', 'Ezel Bayraktar', 'Ramiz Dayı (Oysa Herkes Öldürür Sevdiğini)',
      'Eyşan (Tarihin En Büyük İhaneti)', 'Cengiz Atay', 'Kenan Birkan', 'İkinci Bahar Ali Haydar Usta',
      'Asmalı Konak Seymen Ağa', 'Mahallenin Muhtarları Temel', 'Çiçek Taksi Ramazan Baba', 'En Son Babalar Duyar Kadir (Hallederiz)',
      'Ayrılsak da Beraberiz Teoman ve Berna', 'Tatlı Hayat İhsan Yıldırım (Haluk Bilginer)', 'Menekşe (Hizmetçi)',
      'Ruhsar (Ruhuna El Fatiha)', 'Mazhar (Ruhsar\'ın Kocası)', 'Eyvah Kızım Büyüdü (Altay)', 'Yılan Hikayesi Memoli',
      'Zeyno (Köylü Kızı)', 'Kürşat (Kötü Adam)', 'Bizimkiler Şükrü Bey', 'Kapıcı Cafer (Buyruun)',
      'Cemil (Sevim Koş Katil Geldi)', 'Dunkof Halis', 'Sabri Bey (Apartman Yöneticisi)', 'Gülşen Abi',
      'Şahika Koçarslanlı (Ben Aslında Yoğum)', 'Gaffur (Beni Beğenmiyor musun?)', 'Sacit Kıral', 'İffet (Cemil Sahnesi)',
      'Kınalı Kar Kınalı Ali', 'Gümüş (Kıvanç Tatlıtuğ)', 'Sıla ve Boran Ağa', 'Aşk Yeniden Fatih ve Zeynep',
      'Medcezir Yaman ve Mira', 'Kiralık Aşk Defne ve Ömer', 'Sen Anlat Karadeniz Tahir ve Nefes',
      'Çukur Yamaç Koçovalı', 'İdris Baba (Çukur Evimiz İdris Babamız)', 'Vartolu Sadettin (Mihriban Dinlerken Ağlayan)',
      'Cumali Koçovalı', 'İçerde Sarp ve Umut (Kebapçı Celal)', 'Kızılcık Şerbeti Doğa ve Fatih', 'Görkem ve Pembe Hanım',
      'Kıvılcım Arslan', 'Apo Bey (Abdullah Ünal)', 'Yalı Çapkını Ferit ve Seyran', 'Halis Ağa', 'Kazım Ağa (Antep Beyi)'
    ]
  },
  {
    id: 'nightlife-party',
    title: '🍸 Gece Hayatı & Parti Muhabbetleri',
    icon: '🍸',
    color: 'linear-gradient(135deg, #8A2387, #E94057, #F27121)',
    desc: 'Gece kulüpleri, after partiler, damsız girilmezler ve sabaha karşı kokoreç kuyrukları!',
    badge: 'PARTİ VİTRİNİ',
    words: [
      'Girişte Damsız Girilmez Uyarısı', 'Vale Sırası Beklemek', 'Loca Açtırmak (VIP)', 'Masaya Maytaplı Şampanya',
      'Shot Bardağı Diklemek', 'DJ Kabinine İstek Parça İletmek', 'Gecenin Sonunda Kokoreç Kuyruğu', 'After Party Nerede?',
      'Barmene Göz Kırpmak', 'Vestiyer Fişini Kaybetmek', 'Topuklu Ayakkabıyı Çıkarmak', 'Tuvalette Kızlar Kulübü Sohbeti',
      'Bardağın Dibini Görmek', 'Story Atmak İçin Kadeh Tokuşturmak', 'Sabah Uyanınca Gelen Pişmanlık (Hangover)',
      'Taksi Çağırma Krizi', 'Gecenin Kahramanı Olmak', 'Hoparlörün Yanında Sağır Olmak', 'Duman Altı Teras Muhabbeti',
      'Lazer Işık Şovu', 'Neon Parti Gözlüğü', 'Flaşlı Dans Videosu', 'Mekanın Sahibine Selam Vermek', 'Hesap Gelince Sessizlik',
      'Alman Usulü Ödeşmek', 'Kredi Kartı Şifresini Üç Kere Yanlış Girmek', 'Damsız Kapıdan Dönen Arkadaş Grubu',
      'Bar Taburesinden Düşme Tehlikesi', 'Göz Göze Gelinen Gizemli Biri', 'Çıkışta Çorbacıya Gitmek (Kelle Paça)',
      'Sabah Güneşi Doğarken Ev Yolculuğu', 'Telefonun Şarjının %1 Kalması', 'Gece Yarısı Atılan Tehlikeli Mesaj',
      'Canlı Müzik Solistine Eşlik Etmek', 'Grupça Masada Dans Etmek', 'Masa Üstü Shot Dizimi', 'Enerji İçeceği Kapağı',
      'Happy Hour İndirimi', 'Giriş Bilekliği Yırtmak', 'Kulak Çınlamasıyla Uyumaya Çalışmak'
    ]
  }
];

console.log('Mevcut kategori sayısı ve kelimeler kontrol ediliyor...');

// Deste dosyasını güncelle: CATEGORIES array'ini modüle et
// js/decks.js dosyasını import edip yeni kelimelerle birleştiren temiz export yazıyoruz:
const currentContent = fs.readFileSync(decksPath, 'utf8');

// CATEGORIES array'ini bulup regex ile güvenle değiştirmek yerine decks.js'i AST veya modül yapısı üzerinden işleyelim.
// decks.js bir ES Module: `export const CATEGORIES = [ ... ];`
// Node 20'de dynamic import kullanarak objeyi çekip temiz JS kodu olarak yeniden yazalım:
async function run() {
  const fileUrl = 'file:///' + decksPath.replace(/\\/g, '/');
  const mod = await import(fileUrl);
  const oldCategories = mod.CATEGORIES;

  const updatedCategories = oldCategories.map(cat => {
    const additions = categoryAdditions[cat.id];
    if (additions && additions.length > 0) {
      // Çift kelimeleri önle
      const existingWordStrings = new Set(cat.words.map(w => typeof w === 'string' ? w.toLowerCase() : (w.word ? w.word.toLowerCase() : '')));
      const newUniqueWords = additions.filter(w => {
        const text = typeof w === 'string' ? w.toLowerCase() : (w.word ? w.word.toLowerCase() : '');
        return !existingWordStrings.has(text);
      });
      return {
        ...cat,
        words: [...cat.words, ...newUniqueWords]
      };
    }
    return cat;
  });

  // Yeni desteleri ekle
  newDecks.forEach(nd => {
    const exists = updatedCategories.some(c => c.id === nd.id);
    if (!exists) {
      updatedCategories.push(nd);
    }
  });

  // Temiz ve formatlı JS çıktısı hazırla
  const jsOutput = `// Kafana Tak! - Kategori ve Kelime Desteleri Veritabanı
// Zenginleştirilmiş ve Genişletilmiş Deste Havuzu (2400+ Kelime, 15 Tematik Deste)

export const CATEGORIES = ${JSON.stringify(updatedCategories, null, 2)};
`;

  fs.writeFileSync(decksPath, jsOutput, 'utf8');
  console.log('js/decks.js başarıyla güncellendi!');
  
  let totalW = 0;
  updatedCategories.forEach(c => {
    console.log(`- ${c.id} (${c.title}): ${c.words.length} kelime`);
    totalW += c.words.length;
  });
  console.log(`TOPLAM KELİME: ${totalW}`);
}

run().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
