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

## 📱 Derleme & Telefona Kurulum Prosedürü

Kaynak dosyalarda (`js/*.js`, `css/*.css`, HTML'ler) değişiklik yapıldığında güncel APK'yı telefona yüklemek için:

```powershell
# Yöntem 1: Tek komutla — Derle + Yükle + Aç (ÖNERİLEN)
cd "c:\Users\murat\OneDrive\Belgeler\New OpenCode Project\guess-up-party"
.\telefona-kur.bat
```

Bu script sırasıyla:
1. `node tools/bundle-mobile.cjs` → Tüm HTML/JS/CSS/assets dosyalarını `www/` klasörüne kopyalar.
2. `npx cap sync android` → Capacitor Android platformunu senkronize eder.
3. `android\gradlew.bat assembleDebug` → APK derler (`app-debug.apk`).
4. `adb install -r KafanaTak-v1.0.apk` → Bağlı Android telefona (USB, Hata Ayıklama açık) yükler.
5. `adb shell am start -n com.kafanatak.party/.MainActivity` → Uygulamayı telefonda otomatik açar.

### Ön Koşullar
- **ADB yolu:** `C:\Users\murat\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- **Java (Gradle için):** `C:\Program Files\Android\Android Studio\jbr`
- **Telefon:** USB ile bağlı, USB Hata Ayıklama (Developer Options → USB Debugging) AÇIK
- **Uygulama Paketi:** `com.kafanatak.party` (MainActivity)

### Sadece APK üretmek (yüklemeden)
```bat
.\apk-uret.bat
```
Çıktı: `KafanaTak-v1.0.apk` proje kökünde oluşur.

---

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

### 📋 Dışarıda Yapılan Canlı Test Sonrası 15 Maddelik Revizyon Listesi (28 Ekim 2026 - 22:16)
> *Kullanıcı Prensibi: "Bunları tek tek, acele etmeden ve sistemi bozmadan yapacağız. Adım adım komutla ilerlenecek."*

1. **🔴 QR & Çok Oyunculu Giriş / Host Yönetim Paneli:**
   - QR takılıyor, eklenen kullanıcılar giriş yapamıyor, avatar seçimini yapamıyor.
   - Sistemi tek bir merkezden (Host ekranı) yönetmeli; oyuncu giriş/çıkışları anlık kontrol edilmeli ve tek tıkla "Sistemi Yeniden Başlat / Odayı Sıfırla" yeteneği olmalı.
2. **🗑️ Oyun Kaldırma:** "Şarkıyı Devam Ettir" oyunu tamamen kaldırılacak.
3. **🗑️ Oyun Kaldırma:** "Gülmeme Meydan Okuma" oyunu tamamen kaldırılacak.
4. **🗑️ Oyun Kaldırma:** "Casus Kim?" oyunu tamamen kaldırılacak.
5. **🗑️ Seyirci Ekranı Temizliği:** Seyirci Ekranı ve İkinci Telefon Butonu bulunduğu yerden kaldırılacak (Seyirci ekranı özelliği tamamen iptal).
6. **🔊 Genel Ses Revizyonu:** Oyun içindeki tüm ses efektleri baştan aşağı yenilenecek.
7. **💣 Saatli Bomba Butonu:** "Söyledim! Pasla!" butonu ekranda oldukça büyük, belirgin ve çok rahat basılabilir hale getirilecek.
8. **🔊 Temel Ses Efektleri Değişimi:** Oyun içi temel seslerdeki "Geri Sayım", "Bomba" ve "Palyaço" sesleri kalitesiz/itici bulundu; daha kaliteli ve eğlenceli seslerle değiştirilecek.
9. **🍾 Şişe Çevirme -> Çark & İsim Çevirme:** Şişe çevirme animasyonu yerine oyuncuların isimlerinin girildiği ve çarkın döndüğü Doğruluk / Cesaret formatına geçilecek.
10. **🔤 Passaparola Dinamik & AI Soru Desteği:** Sorular sürekli değişmeli, her takıma farklı sorular gelmeli; gerekirse Yapay Zeka (AI) destekli dinamik soru havuzu entegre edilecek.
11. **🎡 Çarkıfelek Ekran Optimizasyonu:** Aşağı kaydırmalı (scroll) ekran yerine yatay ve sonsuz ilerlemeli (infinite scroll/strip) görsel tasarımla optimize edilecek (klasik dairesel çark şart değil, akıcı ve ferah olacak).
12. **🔢 Bir Kelime Bir İşlem İyileştirmeleri:** Takımların nasıl ayrıştığı netleştirilecek. Süre manuel ayarlanabilir olacak. Çalışmayan "Geri Al" butonu düzeltilecek.
13. **👨‍👩‍👧‍👦 Aileler Yarışıyor Mantık Düzenlemesi:** "İpucu: Yarışmacı doğru cevabı söylediğinde listedeki kapalı kutuya dokunarak da açabilirsiniz" akışındaki mantık hatası giderilecek (Host kapalı kutuların altında ne olduğunu göremiyor; host için cevapları önceden gösteren yönetimli ekran tasarlanacak).
14. **🗑️ Skor Panosu:** Takımlar Arası Skor Panosu kaldırılacak.
15. **🗑️ Deste Yönetimi:** "Yeni Deste Paketi Ekle" bölümü kaldırılacak.




