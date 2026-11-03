const fs = require('fs');

// 1. Patch index.html with Volume Slider
let html = fs.readFileSync('index.html', 'utf8');
const sliderSnippet = `
            <!-- Master Ses Seviyesi Sürgüsü -->
            <div class="hub-volume-slider-row" style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:10px 14px; margin:10px 0;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.15rem;">🎚️</span>
                <div>
                  <div style="font-size:0.82rem; font-weight:800; color:#FFF;">Ses Seviyesi</div>
                  <div style="font-size:0.7rem; color:var(--text-muted);" id="label-volume-percent">%100</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; flex:1; max-width:210px;">
                <span style="font-size:0.75rem; color:#94A3B8;">🔈</span>
                <input type="range" id="input-master-volume" min="0" max="100" step="5" value="100" class="range-slider" style="flex:1; cursor:pointer;" />
                <span style="font-size:0.75rem; color:#94A3B8;">🔊</span>
              </div>
            </div>`;

if (!html.includes('id="input-master-volume"')) {
  const needle = 'id="toggle-sound"';
  const idx = html.indexOf(needle);
  if (idx !== -1) {
    const closeDiv = html.indexOf('</div>', idx);
    if (closeDiv !== -1) {
      const insertAt = closeDiv + 6;
      html = html.slice(0, insertAt) + sliderSnippet + html.slice(insertAt);
      fs.writeFileSync('index.html', html, 'utf8');
      console.log('✓ index.html volume slider injected successfully');
    }
  }
} else {
  console.log('index.html already has volume slider');
}

