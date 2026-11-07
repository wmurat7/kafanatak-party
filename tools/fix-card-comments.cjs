const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix line 266 description: "9 süper" -> "10 süper"
html = html.replace('oynayabileceğiniz 9 süper parti oyunu!', 'oynayabileceğiniz 10 süper parti oyunu!');

// 2. Fix comment numbering in cards
html = html.replace('<!-- 5. Son Sözü Kim Söyler? (Kelime Bombası) -->', '<!-- 3. Son Sözü Kim Söyler? (Kelime Bombası) -->');
html = html.replace('<div class="party-game-card" style="background:linear-gradient(135deg, rgba(69,10,10,0.85)', '<!-- 4. Saatli Bomba (Tick Tack Boom) -->\r\n      <div class="party-game-card" style="background:linear-gradient(135deg, rgba(69,10,10,0.85)');
html = html.replace('<!-- 8. Şişe Çevirmece: Doğruluk mu Cesaret mi? -->', '<!-- 5. Şişe Çevirmece: Doğruluk mu Cesaret mi? -->');
html = html.replace('<!-- 9. A\'dan Z\'ye Passaparola -->', '<!-- 6. A\'dan Z\'ye Passaparola -->');
html = html.replace('<!-- 10. Klasik Çarkıfelek -->', '<!-- 7. Klasik Çarkıfelek -->');
html = html.replace('<!-- 11. Bir Kelime Bir İşlem -->', '<!-- 8. Bir Kelime Bir İşlem -->');
html = html.replace('<!-- 12. Aileler Yarışıyor -->', '<!-- 9. Aileler Yarışıyor -->');
// Ters Ses is already <!-- 10. Ters Ses (Geri Vites) -->

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed card numbering & descriptions in index.html.');
