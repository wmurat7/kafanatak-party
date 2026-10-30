const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Normalize CRLF to LF for consistent searching
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

function removeBlock(content, startMarker, endMarker, label) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`[ATLANDI] ${label}: Başlangıç bulunamadı -> ${startMarker.substring(0, 40)}`);
    return content;
  }
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.log(`[HATA] ${label}: Bitiş bulunamadı -> ${endMarker.substring(0, 40)}`);
    return content;
  }
  const fullEnd = endIdx + endMarker.length;
  console.log(`[SİLİNDİ] ${label} (${fullEnd - startIdx} karakter)`);
  return content.substring(0, startIdx) + content.substring(fullEnd);
}

console.log('Başlangıç satır sayısı:', html.split('\n').length);

// 1. Gülmeme kartı (Parti Arenası)
html = removeBlock(
  html,
  '<!-- 6. Gülmeme Meydan Okuması (Kamera & Yüz Düellosu) -->',
  '<!-- 7. Saatli Bomba (Tick Tack Boom) -->',
  'Gülmeme Kartı'
);

// 2. Dock Scoreboard Butonları
html = removeBlock(
  html,
  '<button type="button" class="dock-nav-item" id="dock-btn-scoreboard"',
  '</button>',
  'Dock Skor Panosu Butonu 1'
);

html = removeBlock(
  html,
  '<button type="button" class="dock-nav-item" id="dock-btn-party-scoreboard">',
  '</button>',
  'Dock Skor Panosu Butonu 2'
);

// 3. Screen Şarkı Düello
html = removeBlock(
  html,
  '<section id="screen-sarki-duello"',
  '</section>',
  'Screen Şarkı Düello'
);

// 4. Screen Gülmeme Meydanı
html = removeBlock(
  html,
  '<section id="screen-gulmeme-meydani"',
  '</section>',
  'Screen Gülmeme Meydanı'
);

// 5. Screen Spy (Casus Kim)
html = removeBlock(
  html,
  '<section id="screen-spy"',
  '</section>',
  'Screen Casus Kim'
);

// 6. Modal Custom Deck (Kalan bozuk kısım)
html = removeBlock(
  html,
  '<div class="modal-card custom-deck-modal-card">',
  '<!-- =========================================\n       6.0. TURU BİTİR / MENÜYE DÖNÜŞ ONAY MODALI',
  'Modal Custom Deck Bozuk Bölüm'
);

// 7. Modal Team Scoreboard
html = removeBlock(
  html,
  '<div id="modal-team-scoreboard"',
  '<!-- =========================================\n       6.1.3. TAKIM KADER ÇARKI MODALI',
  'Modal Team Scoreboard'
);

// 8. Modal Spectator QR
html = removeBlock(
  html,
  '<div id="modal-spectator-qr"',
  '</div>\n  </div>',
  'Modal Spectator QR'
);

if (isCRLF) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Bitiş satır sayısı:', html.split(/\r?\n/).length);
