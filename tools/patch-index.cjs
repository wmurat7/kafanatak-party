const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const needle = 'id="passa-question-text" style="font-size:0.98rem; font-weight:800; color:#FFF; line-height:1.45; margin:0;">Soru yükleniyor...</p>';
const target = html.indexOf(needle);

if (target !== -1) {
  const closeDiv = html.indexOf('</div>', target);
  if (closeDiv !== -1) {
    const insertPos = closeDiv + 6;
    const aiButtonHtml = `\r\n\r\n      <!-- YAPAY ZEKA DESTEKLİ ANLIK YENİ SORU GETİR BUTONU (Madde 10) -->\r\n      <div style="display:flex; justify-content:flex-end; margin-bottom:8px;">\r\n        <button type="button" id="btn-passa-ai-question" class="btn-secondary" style="font-size:0.75rem; font-weight:800; padding:6px 14px; border-radius:999px; background:rgba(0,245,212,0.12); border:1.2px solid var(--primary); color:#00F5D4; display:flex; align-items:center; gap:6px; cursor:pointer;">\r\n          <span>🤖</span> <span>Başka Soru Getir (Yapay Zeka / Yeni Soru)</span>\r\n        </button>\r\n      </div>`;
    
    html = html.slice(0, insertPos) + aiButtonHtml + html.slice(insertPos);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ index.html başarıyla güncellendi.');
  }
} else {
  console.log('Needle not found');
}

