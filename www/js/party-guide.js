// js/party-guide.js
// Kafana Tak! - Parti Oyunları Oynanış Kılavuzları & Kurallar Sistemi

export const PARTY_GUIDES = {
  'isim-sehir': {
    id: 'isim-sehir',
    title: 'İsim Şehir Partisi',
    badge: '🎡 ÇARKLI & 📱 ÇOKLU TELEFON',
    icon: '🎡',
    players: '2-20 Kişi (Herkes Kendi Telefonundan Bağlanır)',
    duration: '60 - 90 Saniye / Tur',
    objective: 'Çarktan çıkan harfle başlayan kelimeleri rakiplerinden önce yazıp özgün cevaplarla en yüksek puanı toplamak!',
    howToPlay: [
      '1. Host "İsim Şehir Başlat" butonuna basar ve ekranda beliren QR kodu arkadaşlarına gösterir.',
      '2. Tüm oyuncular telefonlarının kamerasından QR kodu okutarak odaya katılır ve eğlenceli avatarlarını seçer.',
      '3. Host büyük 3D çarkı çevirir! Çark heyecanla döner ve bir harfte durur (Örn: "B").',
      '4. Herkesin ekranında aynı anda sayaç başlar ve 6 kategori açılır: İsim, Şehir, Hayvan, Bitki, Eşya, Ünlü.',
      '5. Tüm kategorileri ilk dolduran oyuncu "BİTTİ! 🛑" butonuna basarak herkesin süresini anında kilitler!',
      '6. Tur bitince ana ekranda tüm cevaplar kategori kategori sergilenir ve puanlar dağıtılır.'
    ],
    scoring: [
      '🌟 10 Puan: Başka kimsede olmayan ÖZGÜN ve doğru bir cevap.',
      '🤝 5 Puan: Başka bir oyuncuyla AYNI cevabı yazdıysan.',
      '❌ 0 Puan: Boş bırakılan, yanlış harfle başlayan veya uydurma cevaplar.'
    ],
    tips: [
      '💡 Herkesin aklına gelen ilk kelimeyi yazarsan puanın 5\'e düşer! Örneğin "Bursa" yerine "Bilecik" yazmak seni öne geçirir!',
      '⚡ Hızlı olmak çok önemlidir; ilk bitiren "BİTTİ!" butonuna bastığı an diğerleri yazmayı bırakmak zorunda kalır!'
    ],
    launchAction: 'isim-sehir'
  },

  'vampir-koylu': {
    id: 'vampir-koylu',
    title: 'Vampir - Köylü (Mafia)',
    badge: '🧛‍♂️ BLÖF & GİZLİ ROLLER • 👥 4-15 KİŞİ',
    icon: '🧛‍♂️',
    players: '4-15 Kişi',
    duration: '10 - 20 Dakika',
    objective: 'Köylüler gizlice aralarındaki vampirleri asmaya çalışırken, vampirler kimliklerini gizleyip köyü ele geçirmeye çalışır!',
    howToPlay: [
      '1. Herkese gizli bir rol atanır: Vampir, Doktor, Komiser veya Masum Köylü.',
      '2. GECE FAZI: Spiker "Köy halkı uyusun!" der. Herkes gözünü kapatır. Vampirler gizlice uyanıp avlarını seçer. Doktor birini korur, Komiser birinden şüphelenip rolünü sorgular.',
      '3. GÜNDÜZ FAZI: Köy uyanır! Gece bir kurban verildiyse açıklanır. Halk hararetle tartışmaya başlar: Kim şüpheli davranıyor? Kim blöf yapıyor?',
      '4. OYLAMA: Şüpheli görülen kişi için köy meydanında oylama yapılır. En çok oy alan kişi asılır ve gerçek rolü ortaya çıkar!'
    ],
    scoring: [
      '🧑‍🌾 Köylüler: Tüm vampirler yakalanıp asılırsa KÖYLÜLER kazanır!',
      '🧛‍♂️ Vampirler: Vampir sayısı yaşayan köylü sayısına eşit veya fazla olursa VAMPİRLER kazanır!'
    ],
    tips: [
      '💡 Doktor kendini her tur koruyamaz, mantıklı tahmin yapmalıdır.',
      '💡 Masum köylüler sessiz kalmamalı, sorular sorarak tutarsızlıkları yakalamalıdır.'
    ],
    launchAction: 'vampire'
  },

  'casus-kim': {
    id: 'casus-kim',
    title: 'Casus Kim? (Spyfall)',
    badge: '🕵️ GİZLİ MEKAN & BLÖF • 👥 3-10 KİŞİ',
    icon: '🕵️',
    players: '3-10 Kişi',
    duration: '5 - 8 Dakika / Tur',
    objective: 'Casus nerede olduğunu anlamaya çalışırken, diğer oyuncular aralarındaki casusun kim olduğunu bulmaya çalışır!',
    howToPlay: [
      '1. Telefon elden ele dolaşır. Herkes ekrana gizlice dokunup nerede olduğunu öğrenir (Örn: "Hastanedesiniz - Doktor").',
      '2. ANCAK BİR KİŞİ CASUSTUR! Casusun ekranında mekan yazmaz, sadece "SEN CASUSSUN!" yazar.',
      '3. Sırayla birbirinize sorular sormaya başlarsınız (Örn: "Buradaki kıyafetler nasıl?", "Burada çok ses var mı?").',
      '4. Casus mekanı bilmediği için genel ve yuvarlak cevaplar vermek zorundadır!',
      '5. Süre bittiğinde oylama yapılır. Casus yakalanırsa kaybeder; ama casus mekanı doğru tahmin ederse oyunu kazanır!'
    ],
    scoring: [
      '🕵️ Casus: Mekanı doğru tahmin ederse veya yakalanmazsa +10 Puan.',
      '👥 Ajanlar: Casusu oy birliğiyle ifşa ederlerse takımca +5\'er Puan.'
    ],
    tips: [
      '💡 Soruları çok açık sorma, yoksa casus mekanı hemen çözer!',
      '💡 Çok kapalı sorular da diğer ajanların senden şüphelenmesine yol açabilir!'
    ],
    launchAction: 'spy'
  },

  'sarki-duello': {
    id: 'sarki-duello',
    title: 'Şarkıyı Devam Ettir (Melodi Düellosu)',
    badge: '🎵 MÜZİK & HAFIZA • 👥 2-12 KİŞİ (TAKIM / BİREYSEL)',
    icon: '🎤',
    players: '2-12 Kişi (Takım Savaşı için harika!)',
    duration: '10 Saniye / Şarkı',
    objective: 'Ekranda çalan veya duraklayan efsane Türkçe şarkının devamındaki eksik sözü hafızandan doğru söylemek!',
    howToPlay: [
      '1. Ekrana Barış Manço, Tarkan, Sezen Aksu, Duman veya popüler nostalji şarkılarından biri gelir.',
      '2. Şarkının sözleri belirli bir noktaya kadar akar ve en can alıcı yerde durur: "[ ??? DEVAM ET ??? ]".',
      '3. Sıradaki takım veya yarışmacının 10 saniye içinde şarkıyı doğru melodiyle devam ettirmesi gerekir!',
      '4. "Cevabı Göster" butonuna basılarak gerçek şarkı sözü parıldayarak açılır.',
      '5. Doğru bilen takım puanı kapar, yanlış söyleyen takım sırayı rakibe devreder!'
    ],
    scoring: [
      '✅ Doğru Devam: +10 Puan.',
      '🎶 Hem sözü doğru hem de şarkıyı söyleyerek yaptıysa: Ekstra +5 Parti Bonusu!'
    ],
    tips: [
      '💡 Sözleri hatırlayamıyorsan ritme odaklan, kafiye ipucu verebilir!',
      '💡 Takım arkadaşlarınla fısıldaşarak hemen melodiyi yakalamaya çalışın.'
    ],
    launchAction: 'sarki-duello'
  },

  'kelime-bombasi': {
    id: 'kelime-bombasi',
    title: 'Son Sözü Kim Söyler? (Kelime Bombası)',
    badge: '💣 HIZLI ELİMİNASYON • 👥 3-12 KİŞİ',
    icon: '💣',
    players: '3-12 Kişi (Daire şeklinde oturulur)',
    duration: '4 Saniye / Pas (Giderek Hızlanır!)',
    objective: 'Verilen kategori ve harfe uygun kelimeyi 4 saniye dolmadan söyleyip sıradakine paslamak; bomba elinde patlayan elenir!',
    howToPlay: [
      '1. Ekranda bir kategori (Örn: "Meyveler & Sebzeler") ve bir harf (Örn: "K") belirir.',
      '2. 4 saniyelik gerilim dolu tik-tak sayacı hızla geri saymaya başlar!',
      '3. Sıradaki oyuncu hemen geçerli bir kelime söyler (Örn: "Karpuz!") ve anında ekrandaki "PASLA!" butonuna basar.',
      '4. Sayaç sıfırlanır ve telefon hemen dairedeki bir sonraki arkadaşa geçer.',
      '5. Turlar ilerledikçe süre 3 saniyeye, ardından 2 saniyeye düşer!',
      '6. Sayaç sıfırlandığında telefon kimin elindeyse KABOOM! 💥 Bomba onda patlar ve can kaybeder!'
    ],
    scoring: [
      '🏆 Hayatta Kalan Son Oyuncu partinin şampiyonu olur!',
      '💥 Elenen kişi eğlenceli bir parti cezası (şınav, taklit vb.) çeker.'
    ],
    tips: [
      '💡 Daha önce söylenmiş kelimeleri tekrar söylemek yasaktır!',
      '💡 Paniğe kapılma; basit ve kısa kelimeler hayat kurtarır.'
    ],
    launchAction: 'kelime-bombasi'
  },

  'gulmeme-meydani': {
    id: 'gulmeme-meydani',
    title: 'Gülmeme Meydan Okuması (Kamera Düellosu)',
    badge: '🤐 GÖZ GÖZE KAMERA • 👥 2 KİŞİ DÜELLO (TÜM GRUP İZLER)',
    icon: '😆',
    players: '2 Kişi Yüz Yüze (Seyirciler izler)',
    duration: '60 Saniye / Düello',
    objective: 'Ön kamerada göz göze bakışırken ekrandan akan absürt şakalara, seslere ve taklitlere karşı gülmemek ve ciddiyetini korumak!',
    howToPlay: [
      '1. İki rakip oyuncu telefonun ön kamerasının karşısına geçer ve ekranda yüzleri yan yana belirir.',
      '2. 60 saniyelik düello başlar. Ekranda komik espriler, saçma meydan okumalar ve beklenmedik ses efektleri patlar.',
      '3. Göz kırpmak serbest ama sırıtmak, kıkırdamak, diş göstermek veya kahkaha atmak kesinlikle YASAKTIR!',
      '4. Rakipler birbirini güldürmek için komik yüz ifadeleri yapabilir ama konuşamaz.',
      '5. İlk gülen veya sırıtan oyuncunun rakibi "GÜLDÜ! 😂" butonuna basarak raundu kazanır!'
    ],
    scoring: [
      '🏆 Rakibini güldüren oyuncu: +10 Puan.',
      '😐 60 saniye boyunca iki taraf da gülmezse: Berabere (+5\'er Puan).'
    ],
    tips: [
      '💡 Rakibinin burnuna veya kaşının ortasına odaklanırsan gülme refleksini kontrol etmek daha kolay olur!',
      '💡 İçinden ciddi ve sıkıcı şeyleri düşün!'
    ],
    launchAction: 'gulmeme-meydani'
  },

  'saatli-bomba': {
    id: 'saatli-bomba',
    title: 'Saatli Bomba (Tick Tack Boom)',
    badge: '💥 GİZLİ SÜRE & CEZA • 👥 3-10 KİŞİ',
    icon: '🧨',
    players: '3-10 Kişi',
    duration: '15 - 45 Saniye (Rastgele & Gizli Süre)',
    objective: 'Bomba elinde patlamadan ekrandaki şartı yerine getirip telefonu arkadaşına fırlatmak!',
    howToPlay: [
      '1. Bomba başlatıldığında ekranda rastgele bir kural belirir (Örn: "İçinde KAP geçen bir kelime söyle!").',
      '2. Tik-tak sesleri giderek hızlanır. Ancak sürenin tam olarak kaç saniye olduğu gizlidir!',
      '3. Şarta uygun kelimeyi söyleyen oyuncu telefonu yanındaki arkadaşına devreder.',
      '4. Telefon elinde patlayan oyuncu bombanın altındaki sürpriz parti cezasını çeker!'
    ],
    scoring: [
      '🏆 Bombayı patlatmadan en çok tur atlatan oyuncu kazanır.',
      '💥 Patlayan oyuncu masaya eğlenceli ceza görevi sunar.'
    ],
    tips: [
      '💡 Hızlı düşün, kelimeyi söyler söylemez hemen telefonu uzat!',
      '💡 Zor kelimeler aramak yerine hemen aklına gelen ilk kelimeyi yapıştır.'
    ],
    launchAction: 'bomb'
  },

  'sise-cevirmece': {
    id: 'sise-cevirmece',
    title: 'Şişe Çevirmece: Doğruluk mu Cesaret mi?',
    badge: '🍾 3D ŞİŞE & CESARET • 👥 2-15 KİŞİ',
    icon: '🍾',
    players: '2-15 Kişi',
    duration: 'Serbest Parti Oyunu',
    objective: '3D şişeyi masanın ortasında çevirip kime denk gelirse Doğruluk veya Cesaret seçmesini sağlayarak ortamı coşturmak!',
    howToPlay: [
      '1. Telefonu masanın tam ortasına koyun.',
      '2. Ekrana dokunarak veya kaydırarak 3D şişeyi çevirin. Şişe gerçekçi fizikle yavaşlayarak birini işaret eder.',
      '3. Şişenin gösterdiği oyuncu "Doğruluk" mu yoksa "Cesaret" mi istediğini seçer.',
      '4. 200+ özel soru ve çılgın parti görevlerinden biri ekrana gelir.',
      '5. Görevi tamamlayan bir sonraki çevirme hakkını kazanır!'
    ],
    scoring: [
      '🔥 Her cesur cevap veya tamamlanan görev partiye kahkaha ve puan kazandırır.'
    ],
    tips: [
      '💡 Pas geçme hakkı her oyuncu için partide sadece 1 keredir!',
      '💡 Arkadaş grubunun samimiyetine göre kuralları esnetebilirsiniz.'
    ],
    launchAction: 'bottle'
  },

  'sessiz-sinema': {
    id: 'sessiz-sinema',
    title: 'Sessiz Sinema Arenası (Charades)',
    badge: '🤐 JEST & MİMİK • 👥 4-16 KİŞİ (TAKIM SAVAŞI)',
    icon: '🎬',
    players: '4-16 Kişi (2 Takım Karşılıklı)',
    duration: '60 Saniye / Sahne',
    objective: 'Tek bir kelime bile fısıldamadan sadece el-kol hareketleri ve jestlerle popüler film ve dizileri takımına anlatmak!',
    howToPlay: [
      '1. Sırası gelen oyuncu sahneye çıkar ve ekrandaki gizli film/dizi adını okur.',
      '2. Konuşmak, harf çizmek, dudak oynatmak veya fısıldamak KESİNLİKLE YASAKTIR!',
      '3. Klasik işaretleri kullanabilirsiniz: Film (çark çevirme), Yerli/Yabancı (göğse vurma), Kaç kelime (parmakla gösterme).',
      '4. 60 saniye dolmadan takımı filmi doğru tahmin ederse puan hanelerine yazılır!'
    ],
    scoring: [
      '✅ 60 saniye içinde doğru tahmin: +10 Puan.',
      '⚡ İlk 30 saniyede bilirse: Hız Bonusu +5 Puan!'
    ],
    tips: [
      '💡 Kelimeleri tek tek anlatmak yerine filmin en ikonik sahnesini canlandırmak genelde çok daha hızlı sonuç verir!',
      '💡 Takımın tahmin ettiği kelimeleri parmakla onaylayarak yönlendir.'
    ],
    launchAction: 'mime'
  },

  'passaparola': {
    id: 'passaparola',
    title: 'A\'dan Z\'ye Passaparola',
    badge: '🎯 24 HARF ÇARKI • ⏱️ 120 SANİYE • 🧠 GENEL KÜLTÜR',
    icon: '🎯',
    players: '1-10 Kişi (Bireysel veya Takım)',
    duration: '120 Saniye',
    objective: 'A\'dan Z\'ye 24 harften oluşan çarkta her soruya o harfle başlayan doğru kelimeyi verip süren dolmadan rekor kırmak!',
    howToPlay: [
      '1. Süre başladığında en tepedeki A harfinden yarışmaya başlarsınız.',
      '2. Gelen sorunun cevabı o harfle başlar (Örn: A -> Astronomi).',
      '3. Eğer cevabı anında hatırlayamazsan "PAS" de ve sonraki harfe geç!',
      '4. Çark bir tur döndükten sonra pas geçtiğin harflere sırasıyla geri dönersin.',
      '5. 120 saniye dolmadan en çok doğruyu yapan yarışmayı kazanır!'
    ],
    scoring: [
      '🟢 Doğru: +10 Puan.',
      '🟡 Pas: 0 Puan (Tur sonuna bırakılır).',
      '🔴 Yanlış: 0 Puan (Harf kilitlenir).'
    ],
    tips: [
      '💡 Takıldığın anda bekleme, hemen "PAS" butonuna basıp süreni tasarruflu kullan!',
      '💡 Takım halinde oynarken herkes fısıldaşarak ortak bir sözcü seçebilir.'
    ],
    launchAction: 'passaparola'
  },

  'carkifelek': {
    id: 'carkifelek',
    title: 'Klasik Çarkıfelek',
    badge: '🎡 PUAN ÇARKI • 🧩 GİZLİ KELİME • 🔥 TAKIM SAVAŞI',
    icon: '🎡',
    players: '2-12 Kişi (Takımlar Halinde)',
    duration: '5 - 10 Dakika / Tur',
    objective: 'Çarkı çevirip puanları kapmak, sessiz harfleri açtırmak ve İflas tuzaklarına düşmeden gizli atasözü/filmi tahmin etmek!',
    howToPlay: [
      '1. Sırası gelen takım büyük renkli çarkı çevirir (100 - 3000 Puan, İflas, Pas, Ödül).',
      '2. Gelen puan diliminden sonra bir sessiz harf söyler (Örn: "M" harfi).',
      '3. Cümlede o harften kaç tane varsa açılır ve (Puan x Adet) kadar puan hanelerine yazılır ve tekrar çevirme hakkı kazanırlar!',
      '4. İflas gelirse puanlar sıfırlanır, Pas gelirse sıra rakibe geçer.',
      '5. Takım isterse 250 puan karşılığı sesli harf satın alabilir veya doğrudan "Tahmin Et" butonuna basıp cümleyi çözebilir!'
    ],
    scoring: [
      '🎡 Puan Dilimi: Bulunan her sessiz harf için dilimdeki puan.',
      '🎁 Ödül Dilimi: +1000 Bonus puan.',
      '💥 İflas: Tur puanı sıfırlanır ve sıra geçer.',
      '🏆 Cümleyi Çözme: Kalan kapalı harflerin tüm puanları + 1500 Büyük Çözüm Bonusu!'
    ],
    tips: [
      '💡 Türkçede en çok geçen sessiz harfler (R, N, L, K, T, D) ile başlamak kazanma şansınızı katlar!',
      '💡 Cümleyi tahmin ederken acele etmeyin; harf açtırarak puanınızı iyice yükseltip son darbeyi vurun!'
    ],
    launchAction: 'carkifelek'
  },

  'kelime-islem': {
    id: 'kelime-islem',
    title: 'Bir Kelime Bir İşlem',
    badge: '🔤 KELİME TÜRETME • 🧮 SAYI BULMACA • ⏱️ 45 SANİYE',
    icon: '🧠',
    players: '1-10 Kişi (Bireysel veya Takım)',
    duration: '3 - 6 Dakika / Tur',
    objective: '8 harf + 1 joker ile en uzun Türkçe kelimeyi türetmek ve 6 sayı ile 4 işlemi kullanarak hedef sayıyı tam vurmak!',
    howToPlay: [
      '1. 1. Etap (Bir Kelime): Sesli ve sessiz harf butonlarına basarak 8 harf çekin (9. harf altın ⭐ Jokerdir).',
      '2. 45 saniye sürede harflere dokunarak en uzun geçerli Türkçe kelimeyi oluşturun.',
      '3. 2. Etap (Bir İşlem): 3 basamaklı hedef sayı (Örn: 648) ve 6 sayı verilir (5 küçük + 1 büyük sayı).',
      '4. Dört işlem (+, -, ×, ÷) kullanarak hedef sayıya tam isabet yapmaya veya en çok yaklaşmaya çalışın!',
      '5. Süre bitince yapay zeka hakem hem en uzun kelimeyi hem de işlemin tam adımlarını ekrana yansıtır.'
    ],
    scoring: [
      '🔤 Kelime Etabı: Harf sayısı x 10 puan (8 harfli ise +20 bonus, 9 harfli ise +50 bonus).',
      '🎯 İşlem Etabı: Tam İsabet: 100 Puan | Fark 1: 90 Puan | Fark 2-5: 75 Puan | Fark 6-10: 50 Puan.'
    ],
    tips: [
      '💡 Joker harfi istediğiniz herhangi bir harf yerine seçebilirsiniz; kök kelimelere takı ekleyerek kelimeyi uzatın!',
      '💡 İşlem etabında büyük sayı ile küçük sayıları çarparak hedefin civarına yaklaşın, kalan farkı küçük sayılarla kapatın.'
    ],
    launchAction: 'kelime-islem'
  },

  'aileler-yarisiyor': {
    id: 'aileler-yarisiyor',
    title: 'Aileler Yarışıyor',
    badge: '📺 EFSANE YARIŞMA • 👥 100 KİŞİYE SORDUK • 🔥 PUAN ÇALMA',
    icon: '👨‍👩‍👧‍👦',
    players: '2-16 Kişi (Takımlar Halinde)',
    duration: '10 - 20 Dakika / Turnuva',
    objective: '100 kişiye sorulan anketin en popüler cevaplarını tahmin ederek panoyu açmak ve 3 çarpıya düşmeden puanları toplamak!',
    howToPlay: [
      '1. 1. Aşama (Kapışma): Masadan iki takımdan birer kişi öne çıkar, zile ilk basıp en iyi cevabı veren takım oyunu başlatır.',
      '2. Takım üyeleri sırayla tahmin yapar. Doğru cevaplar panoda açılır ve puanlar ortak havuzda (Bank) birikir.',
      '3. Yanlış cevapta takım bir ❌ (Çarpı) alır. 3 Çarpı alan takımın sırası biter!',
      '4. Çalma (Steal) Aşaması: 3 çarpı olunca karşı takım bir araya gelip tek bir ortak cevap söyler. Açılmamış bir cevabı bilirlerse havuzdaki TÜM puanları çalarlar!',
      '5. 1. ve 2. Turlar 1X, 3. Tur 2X (Çift Puan), 4. Tur 3X (Üç Kat Puan) değerindedir.'
    ],
    scoring: [
      '🎯 Panodaki her cevabın 100 kişi arasındaki popülerlik yüzdesi kadar puanı vardır.',
      '🔥 Çalma (Steal): Karşı takım tek doğru cevapla havuzdaki tüm puanları kendi hanesine yazdırır.'
    ],
    tips: [
      '💡 Kendi fikrinizi değil, "Sokaktaki 100 kişi ilk ne demiştir?" sorusunu düşünerek en klişe cevapları verin!',
      '💡 Çalma aşamasında takım kaptanı herkesi dinleyip en garanti cevabı seçmelidir.'
    ],
    launchAction: 'aileler-yarisiyor'
  }
};

export function showPartyGuide(gameId, appInstance) {
  const guide = PARTY_GUIDES[gameId];
  if (!guide) return;

  const modal = document.getElementById('modal-party-game-guide');
  if (!modal) return;

  document.getElementById('guide-modal-icon').textContent = guide.icon;
  document.getElementById('guide-modal-title').textContent = guide.title;
  document.getElementById('guide-modal-badge').textContent = guide.badge;
  document.getElementById('guide-modal-players').textContent = guide.players;
  document.getElementById('guide-modal-duration').textContent = guide.duration;
  document.getElementById('guide-modal-objective').textContent = guide.objective;

  const howToList = document.getElementById('guide-modal-how-to');
  howToList.innerHTML = guide.howToPlay.map(item => `<li>${item}</li>`).join('');

  const scoringList = document.getElementById('guide-modal-scoring');
  scoringList.innerHTML = guide.scoring.map(item => `<li>${item}</li>`).join('');

  const tipsList = document.getElementById('guide-modal-tips');
  tipsList.innerHTML = guide.tips.map(item => `<li>${item}</li>`).join('');

  const btnLaunch = document.getElementById('guide-modal-launch-btn');
  btnLaunch.onclick = () => {
    modal.classList.remove('active');
    triggerGameLaunch(guide.launchAction, appInstance);
  };

  modal.classList.add('active');
}

export function triggerGameLaunch(action, appInstance) {
  if (!appInstance) return;

  if (action === 'isim-sehir') {
    appInstance.showScreen('isim-sehir');
    if (appInstance.isimSehirEngine) appInstance.isimSehirEngine.init();
  } else if (action === 'vampire') {
    appInstance.showScreen('vampire');
    const hub = document.getElementById('vampire-hub-select');
    if (hub) hub.style.display = 'block';
  } else if (action === 'spy') {
    appInstance.showScreen('spy');
    if (appInstance.spyEngine) appInstance.spyEngine.init();
  } /* sarki-duello kaldırıldı */ else if (action === 'kelime-bombasi') {
    appInstance.showScreen('kelime-bombasi');
    if (appInstance.kelimeBombasiEngine) appInstance.kelimeBombasiEngine.init();
  } /* gulmeme-meydani kaldırıldı */ else if (action === 'bomb') {
    appInstance.showScreen('bomb');
    if (appInstance.bombEngine) appInstance.bombEngine.init();
  } else if (action === 'bottle') {
    appInstance.showScreen('bottle');
    if (appInstance.bottleEngine) appInstance.bottleEngine.init();
  } else if (action === 'passaparola') {
    appInstance.showScreen('passaparola');
    if (appInstance.passaparolaEngine) appInstance.passaparolaEngine.init();
  } else if (action === 'carkifelek') {
    appInstance.showScreen('carkifelek');
    if (appInstance.carkifelekEngine) appInstance.carkifelekEngine.init();
  } else if (action === 'kelime-islem') {
    appInstance.showScreen('kelimeIslem');
    if (appInstance.kelimeIslemEngine) appInstance.kelimeIslemEngine.init();
  } else if (action === 'aileler-yarisiyor') {
    appInstance.showScreen('ailelerYarisiyor');
    if (appInstance.ailelerYarisiyorEngine) appInstance.ailelerYarisiyorEngine.init();
  }
}

export function initPartyGuides(appInstance) {
  // Nasıl Oynanır butonlarını bağla
  document.querySelectorAll('.btn-party-guide').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const gameId = btn.getAttribute('data-game-guide');
      showPartyGuide(gameId, appInstance);
    });
  });

  // Kapatma butonu
  const btnClose = document.getElementById('btn-close-party-guide');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      const modal = document.getElementById('modal-party-game-guide');
      if (modal) modal.classList.remove('active');
    });
  }

  // Modal dışına tıklayınca kapatma
  const modal = document.getElementById('modal-party-game-guide');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
