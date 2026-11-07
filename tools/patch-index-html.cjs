const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Insert Ters Ses Card after Aileler Yarisiyor card
const needleCard = 'id="btn-open-aileler-yarisiyor-game"';
const cardEndTagCRLF = '</div>\r\n      </div>\r\n      <!-- Alt Gezinme Barı';
const cardEndTagLF = '</div>\n      </div>\n      <!-- Alt Gezinme Barı';

const tersSesCard = `

      <!-- 10. Ters Ses (Geri Vites) -->
      <div class="party-game-card" style="background:linear-gradient(135deg, rgba(20,25,55,0.92), rgba(15,23,42,0.98)); border:2px solid #00F5D4; border-radius:20px; padding:18px; box-shadow:0 10px 30px rgba(0,245,212,0.18);">
        <div class="party-card-header">
          <div class="party-card-tags">
            <span class="party-tag party-tag-cyan">🔄 Tersten Dinle</span>
            <span class="party-tag party-tag-pink">🎙️ Geri Vites Challenge</span>
            <span class="party-tag party-tag-gold">👥 2-20 Kişi</span>
          </div>
          <div class="party-card-icon-wrap" style="background:rgba(0,245,212,0.16); border:1.5px solid rgba(0,245,212,0.4); box-shadow:0 0 15px rgba(0,245,212,0.25);">
            <span class="party-card-icon">🔄</span>
          </div>
        </div>
        <h3 style="font-size:1.35rem; font-weight:900; color:#FFF; margin-bottom:4px;">Ters Ses (Geri Vites)</h3>
        <p style="font-size:0.84rem; color:#CBD5E1; line-height:1.4; margin-bottom:14px;">Kelimeleri tersten dinleyin, uzaylı gibi duyulan sesi ilk çözen takım olun! Geri Vites Challenge ile ters sesi taklit edin, sesiniz tersten orijinal kelimeye dönüşsün!</p>
        <div style="display:grid; grid-template-columns:1fr 1.3fr; gap:8px;">
          <button type="button" class="btn-party-guide" data-game-guide="ters-ses" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); border-radius:12px; color:#FFF; font-size:0.85rem; font-weight:800; padding:11px; cursor:pointer;">
            📖 Nasıl Oynanır?
          </button>
          <button type="button" id="btn-open-ters-ses-game" class="btn-main" style="background:linear-gradient(135deg, #00F5D4, #7928CA); color:#FFFFFF; font-size:0.92rem; font-weight:900; padding:11px 14px; border-radius:12px; border:none; display:flex; justify-content:center; align-items:center; gap:6px;">
            <span>🔄 Sesi Başlat</span> <span>➔</span>
          </button>
        </div>
      </div>`;

if (html.includes(cardEndTagCRLF)) {
  html = html.replace(cardEndTagCRLF, '</div>\r\n      </div>' + tersSesCard + '\r\n      <!-- Alt Gezinme Barı');
  console.log('Ters Ses Card injected (CRLF).');
} else if (html.includes(cardEndTagLF)) {
  html = html.replace(cardEndTagLF, '</div>\n      </div>' + tersSesCard + '\n      <!-- Alt Gezinme Barı');
  console.log('Ters Ses Card injected (LF).');
} else {
  console.error('Could not find card end tag.');
}

// 2. Insert Screen Section for Ters Ses
const screenNeedleCRLF = '</section>\r\n\r\n  <!-- =========================================\r\n       VAMPİR - KÖYLÜ KURALLAR';
const screenNeedleLF = '</section>\n\n  <!-- =========================================\n       VAMPİR - KÖYLÜ KURALLAR';

const tersSesScreen = `\r\n\r\n  <!-- =========================================\r\n       10. TERS SES (GERİ VİTES) OYUN EKRANI\r\n       ========================================= -->\r\n  <section id="screen-ters-ses" class="screen ters-ses-screen" style="padding: calc(env(safe-area-inset-top, 24px) + 20px) 16px calc(env(safe-area-inset-bottom, 16px) + 24px); max-width: 520px; margin: 0 auto;">\r\n    <div id="screen-ters-ses-content"></div>\r\n  </section>`;

if (html.includes(screenNeedleCRLF)) {
  html = html.replace(screenNeedleCRLF, '</section>' + tersSesScreen + '\r\n\r\n  <!-- =========================================\r\n       VAMPİR - KÖYLÜ KURALLAR');
  console.log('Ters Ses Screen injected (CRLF).');
} else if (html.includes(screenNeedleLF)) {
  html = html.replace(screenNeedleLF, '</section>' + tersSesScreen + '\n\n  <!-- =========================================\n       VAMPİR - KÖYLÜ KURALLAR');
  console.log('Ters Ses Screen injected (LF).');
} else {
  console.error('Could not find screen needle.');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html updated successfully.');
