# 🎉 Kafana Tak! - Parti Oyunu Geliştirme Kuralları & Hafıza

Bu dosya **Kafana Tak! (`guess-up-party`)** projesine özel çalışma alanıdır. Diğer projelerle (PlusWalnut, Aslan Apartmanı, PlusUstalar, Okul Servisi vb.) kesinlikle karıştırılmaz.

## 📌 Proje Özeti
- **Dizin:** `C:\Users\murat\OneDrive\Belgeler\New OpenCode Project\guess-up-party`
- **Başlatıcı:** `baslat.bat` (`node server.js`) -> `http://localhost:3000` ve yerel Wi-Fi IP'si
- **Teknoloji:** HTML5, Vanilla JS (ES Modules), Web Audio API, Canvas HUD Video Recording, Motion/Gyroscope Sensors, Capacitor (Planlanan)

## 🎯 Temel Özellikler
1. **Hareket ve Eğim Algılama:** Telefon alında tutulur. Baş öne = DOĞRU, baş yukarı = PAS.
2. **Reels & TikTok HUD Video Kaydı:** Ön kamera ile oynayan grubun kahkahalarını kaydederken ekrana kelime altyazısı ve animasyonlu damgalar basar.
3. **Takım Savaşı (Team VS):** Kırmızı vs Mavi, turlu puan takibi, podyum ve konfeti.
4. **Zengin İçerik:** 13 kategori, 1.390+ kelime, Tabu modu, özel deste oluşturucu.
5. **📳 Haptik Titreşim Motoru:** Doğru (çift vuruş), Pas (tek tok vuruş), Son 5 sn (kalp atışı nabzı) - *Tamamlandı*.
6. **💡 Screen WakeLock API:** Oyun esnasında ekranın kararmasını/uyumasını önleme - *Tamamlandı*.
7. **👤 Oyuncu Profili & İstatistikler:** Avatar seçimi, toplam oyun, bilinen kelime, tur rekoru ve maç geçmişi - *Tamamlandı*.
8. **🪄 AI Deste Sihirbazı (Gemini + Ollama):** Tek bir temayla saniyeler içinde 20-40 kartlık otomatik deste türetme (Normal & Tabu modu) - *Tamamlandı*.
9. **📱 Native Android APK Paketleme:** Capacitor entegrasyonu, tam donanım izinleri, `apk-uret.bat` ve `KafanaTak-v1.0.apk` hazır - *Tamamlandı*.

## 🚀 Aktif Geliştirme Yol Haritası & Yapılacaklar Listesi

### 🎨 Tasarım & Düzen İyileştirmeleri (Sıradaki Aşama)
1. **👑 Oyun İsmi ve Logo Büyütme:**
   - "KAFANA TAK!" başlığı ve tacı büyütülerek ana sayfanın en üst merkezine, güçlü bir odak noktası olacak şekilde yerleştirilecek.
2. **🟡 Level, Elmas & Altın İkonlarının Taşınması:**
   - Üst kısımdaki sıkışıklığı önlemek ve görsel hiyerarşiyi rahatlatmak için profil/alt dock veya daha dengeli bir alana taşınacak.
3. **🎯 Kalibrasyon / Nötr Rozeti Konumlandırması:**
   - Tekli Mod ve Takım Savaşı butonlarının altında akışı bölen kalibrasyon/açı rozeti daha estetik ve doğru bir noktaya konumlandırılacak.
4. **🎮 Oyun Kural Modları Düzenlemesi:**
   - Klasik, Bomba Modu, Sessiz Sinema ve Yasak Harf modlarının yer aldığı kartlardaki minik ölçülendirme ve responsive simetri hataları düzeltilecek.

### 📚 İçerik & Havuz Genişletme
5. **📝 Kategorilerin Kelime Sayılarını Artırma:**
   - Mevcut 13 kategorideki kelime havuzları genişletilecek; daha komik, popüler, eğlenceli ve güncel yeni kelimeler eklenecek (özellikle hızlı tükenmeyi önleyecek zengin listeler).

### 🔊 Ses, Müzik & Ambiyans Geliştirmeleri
6. **🎵 Arka Plan Parti Müziği & Akustik Yenileme:**
   - Telefon hoparlörlerinden duyulmayan düşük bas frekansları yerine, telefonun 400Hz-8000Hz aralığına uygun tok vuruşlar, parlak synth staccato akorlar ve kıvrak parti perküsyonu ile duyulabilir, gür bir parti ritmi oluşturulacak. Test butonu kesintisiz çalışacak.
7. **📣 Canlandırıcı Tezahürat, Gaz Verme Sesleri & Test Paneli:**
   - Oyun esnasında ve serilerde devreye giren havalı korna (airhorn), vuvuzela, stadyum alkışı, parti düdüğü gibi canlandırıcı tezahürat sesleri zenginleştirilecek; Ayarlar içine bu seslerin tek tek dinlenebildiği "Tezahürat Test Paneli" eklenecek.

---

## 📌 Sonraki Seans Notları ve Öncelikli Geliştirme Görevleri (Kullanıcı Talepleri)

1. **⏱️ İkaz & Bildirim Süreleri, Oyuncu Ekranları Ufak Hataları & Hotspot Altyapısı:**
   - **Kısa Süreli Bildirimler:** İkaz uyarıları (`player_warning`), yönetici duyuruları ve toast bildirimleri ekranda daha kısa süre görünüp otomatik kaybolacak, oyuncuyu oyundan alıkoymayacak.
   - **Oyuncu Ekranları İnceleme & Düzeltme:** İstemci ekranlarındaki (`spectator.html`, `isim-sehir.html`, `aileler-yarisiyor.html`, `kelime-islem.html`, `sarki-duello.html`, `passaparola.html`, `carkifelek.html`, `koy.html`) minik görsel/arayüz hataları, özellikle modal "X" kapatma tuşları, dokunma alanları ve taşmalar tek tek incelenip parlatılacak.
   - **İnternetsiz Hotspot (Yerel Ağ) Oynama Altyapısı:** İnternet bağlantısının (Firebase RTDB) çekmediği ortamlarda, ana telefonun Hotspot (Kişisel Erişim Noktası) veya yerel Wi-Fi ağı üzerinden yerel HTTP/WebSocket sunucusuyla (`server.js`) tüm oyunların kesintisiz oynanabilmesini sağlayacak hibrit/yerel bağlantı mimarisi tamamlanacak.
2. **🎨 Logo & Görsel Kimlik Düzenlemesi:**
   - "Kafana Tak!" logosu, taç ikonu ve görsel kimliği yeniden tasarlanıp modernize edilecek.
3. **🎬 Açılış (Splash / Intro) Ekranı:**
   - Uygulama ilk başlatıldığında oynatılacak sinematik kısa bir açılış videosu veya animasyonlu logo introlu şık bir karşılama sahnesi eklenecek.




