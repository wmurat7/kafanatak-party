// tools/apply-faz1.cjs - Kafana Tak! FAZ 1 Temizlik Scripti
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const gameJsPath = path.join(rootDir, 'js', 'game.js');
const partyGuidePath = path.join(rootDir, 'js', 'party-guide.js');

console.log('🚀 FAZ 1 Temizlik İşlemleri Başlatılıyor...');

// ==========================================
// 1. INDEX.HTML DÜZENLEMELERİ
// ==========================================
let html = fs.readFileSync(indexPath, 'utf8');
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 1.1. Madde 5: Seyirci Ekranı & İkinci Telefon Çağrı Barı
const specStart = html.indexOf('<!-- Canlı Seyirci & İkinci Ekran QR Hızlı Çağrı Barı -->');
if (specStart !== -1) {
  const specEnd = html.indexOf('</section>', specStart);
  if (specEnd !== -1) {
    const fullEnd = specEnd + '</section>'.length;
    html = html.substring(0, specStart) + html.substring(fullEnd);
    console.log('✓ Madde 5: Seyirci Ekranı & İkinci Telefon butonu ana menüden kaldırıldı.');
  }
}

// 1.2. Madde 4: Casus Kim? (Spyfall) Kartı
const spyStart = html.indexOf('<!-- 3. Casus Kim? (Spyfall) -->');
if (spyStart !== -1) {
  const sarkiStart = html.indexOf('<!-- 4. Şarkıyı Devam Ettir', spyStart);
  if (sarkiStart !== -1) {
    html = html.substring(0, spyStart) + html.substring(sarkiStart);
    console.log('✓ Madde 4: Casus Kim? (Spyfall) kartı parti arenadan kaldırıldı.');
  }
}

// 1.3. Madde 2: Şarkıyı Devam Ettir (Melodi Düellosu) Kartı
const sarkiStart2 = html.indexOf('<!-- 4. Şarkıyı Devam Ettir (Melodi Düellosu) -->');
if (sarkiStart2 !== -1) {
  const kelimeStart = html.indexOf('<!-- 5. Son Sözü Kim Söyler?', sarkiStart2);
  if (kelimeStart !== -1) {
    html = html.substring(0, sarkiStart2) + html.substring(kelimeStart);
    console.log('✓ Madde 2: Şarkıyı Devam Ettir kartı parti arenadan kaldırıldı.');
  }
}

// 1.4. Madde 3: Parti Oyunları Sayısı ve Başlığı Güncelleme (12 -> 9)
html = html.replace('12 EĞLENCELİ PARTİ OYUNU', '9 EFSANE PARTİ OYUNU');
html = html.replace('12 süper parti oyunu!', '9 süper parti oyunu!');
console.log('✓ Madde 3: Parti oyunları sayacı 9 olarak güncellendi.');

// 1.5. Madde 14: Takımlar Arası Skor Panosu Elemanları
html = html.replace(/<div id="summary-team-scoreboard" class="summary-scoreboard-row"[^>]*><\/div>/g, '');
html = html.replace(/<!-- =========================================\s+6\.1\.2\. TAKIMLAR ARASI SKOR PANOSU \(LİDERLİK YERİNE\)\s+=========================================\s+-->/g, '');
console.log('✓ Madde 14: Takımlar Arası Skor Panosu kaldırıldı.');

// 1.6. Madde 15: Yeni Deste Paketi Ekle (Paketler Dock Butonları & Kalan Tagler)
const deckBtnHomeRegex = /<button type="button" class="dock-nav-item" id="dock-btn-decks">[\s\S]*?<\/button>\s*/g;
html = html.replace(deckBtnHomeRegex, '');

const deckBtnPartyRegex = /<button type="button" class="dock-nav-item" id="dock-btn-party-decks">[\s\S]*?<\/button>\s*/g;
html = html.replace(deckBtnPartyRegex, '');

html = html.replace(/<div id="modal-custom-deck" class="modal-overlay">\s*/g, '');
console.log('✓ Madde 15: Paketler (Yeni Deste Ekle) dock butonları kaldırıldı.');

if (isCRLF) {
  html = html.replace(/\n/g, '\r\n');
}
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html güncellendi.');

// ==========================================
// 2. JS/GAME.JS DÜZENLEMELERİ
// ==========================================
let gameJs = fs.readFileSync(gameJsPath, 'utf8');
const isCRLFGame = gameJs.includes('\r\n');
gameJs = gameJs.replace(/\r\n/g, '\n');

// 2.1. summaryTeamScoreboard temizliği
gameJs = gameJs.replace(
  /if \(this\.summaryTeamScoreboard\) this\.summaryTeamScoreboard\.style\.display = 'flex';/g,
  '/* summaryTeamScoreboard kaldırıldı */'
);

if (isCRLFGame) {
  gameJs = gameJs.replace(/\n/g, '\r\n');
}
fs.writeFileSync(gameJsPath, gameJs, 'utf8');
console.log('✅ js/game.js güncellendi.');

// ==========================================
// 3. JS/PARTY-GUIDE.JS DÜZENLEMELERİ
// ==========================================
let guideJs = fs.readFileSync(partyGuidePath, 'utf8');
const isCRLFGuide = guideJs.includes('\r\n');
guideJs = guideJs.replace(/\r\n/g, '\n');

// Kaldırılan rehber aksiyonları
guideJs = guideJs.replace(/else if \(action === 'sarki-duello'\) \{[\s\S]*?\}/g, "/* sarki-duello kaldırıldı */");
guideJs = guideJs.replace(/else if \(action === 'gulmeme-meydani'\) \{[\s\S]*?\}/g, "/* gulmeme-meydani kaldırıldı */");

if (isCRLFGuide) {
  guideJs = guideJs.replace(/\n/g, '\r\n');
}
fs.writeFileSync(partyGuidePath, guideJs, 'utf8');
console.log('✅ js/party-guide.js güncellendi.');

console.log('🎉 FAZ 1 tüm adımlarıyla başarıyla tamamlandı!');
