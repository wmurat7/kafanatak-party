// tools/apply-logo-and-permissions.cjs
// Logo Animasyonu & Ayarlar - İzinler Bölümünün Modernize Edilmesi

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');

console.log('🚀 Logo Animasyonu ve Ayarlar-İzinler Güncellemesi Başlatılıyor...');

let indexContent = fs.readFileSync(indexPath, 'utf8');
let cssContent = fs.readFileSync(cssPath, 'utf8');
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// 1. css/style.css: Logoyu Hareketlendiren Canlı Keyframes ve Dinamik Efektler
const logoAnimationCss = `
/* =========================================
   DİNAMİK LOGO ANİMASYONLARI (Kinetik Enerji & Shimmer)
   ========================================= */
@keyframes titleShimmerFlow {
  0% {
    background-position: 0% 50%;
    filter: drop-shadow(0 4px 18px rgba(236, 72, 153, 0.75));
  }
  50% {
    background-position: 100% 50%;
    filter: drop-shadow(0 4px 28px rgba(0, 245, 212, 0.85)) drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
  }
  100% {
    background-position: 0% 50%;
    filter: drop-shadow(0 4px 18px rgba(236, 72, 153, 0.75));
  }
}

@keyframes crownBounce3D {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
    filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.95)) drop-shadow(0 0 30px rgba(255, 142, 83, 0.6));
  }
  25% {
    transform: translateY(-8px) rotate(-6deg) scale(1.08);
  }
  50% {
    transform: translateY(-13px) rotate(0deg) scale(1.15);
    filter: drop-shadow(0 0 28px rgba(255, 215, 0, 1)) drop-shadow(0 0 45px rgba(255, 46, 147, 0.85));
  }
  75% {
    transform: translateY(-6px) rotate(6deg) scale(1.08);
  }
}

@keyframes badgeNeonBreathing {
  0%, 100% {
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
    border-color: rgba(0, 240, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(255, 46, 147, 0.7), inset 0 0 10px rgba(0, 240, 255, 0.3);
    border-color: #FF2E93;
    color: #FFF;
  }
}

.brand-crown-glow {
  font-size: 3.2rem;
  line-height: 1;
  animation: crownBounce3D 2.8s ease-in-out infinite;
  margin-bottom: 2px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.brand-crown-glow:active {
  transform: scale(1.25) rotate(15deg);
}

.brand-hero-title {
  font-family: var(--font-heading);
  font-size: 2.7rem;
  font-weight: 900;
  letter-spacing: 3.5px;
  background: linear-gradient(90deg, #FFFFFF, #FBBF24, #FF2E93, #00F5D4, #FBBF24, #FFFFFF);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShimmerFlow 4.5s ease-in-out infinite;
  line-height: 1.08;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.brand-hero-title:active {
  transform: scale(0.93) rotate(-2deg);
}

.brand-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(168, 85, 247, 0.18);
  border: 1.5px solid rgba(0, 240, 255, 0.5);
  color: #00F0FF;
  animation: badgeNeonBreathing 3s infinite ease-in-out;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 1px;
}
`;

// Replace existing brand-crown-glow and brand-hero-title styles in style.css
const oldBrandHeaderCssRegex = /\.brand-crown-glow\s*\{[\s\S]*?\.brand-hero-badge\s*\{[\s\S]*?padding:\s*4px\s*14px;[\s\S]*?\}/;
if (oldBrandHeaderCssRegex.test(cssContent)) {
  cssContent = cssContent.replace(oldBrandHeaderCssRegex, logoAnimationCss);
  console.log('✓ css/style.css: Canlı logo animasyonları başarıyla eklendi.');
} else {
  // Append to the end of style.css
  cssContent += '\n' + logoAnimationCss;
  console.log('✓ css/style.css: Canlı logo animasyonları dosya sonuna eklendi.');
}
fs.writeFileSync(cssPath, cssContent, 'utf8');

// 2. index.html: Ayarlar & İzinler Bölümünü Organize Et
const oldSystemTabRegex = /<!-- 5\. SEKME: SİSTEM İZİNLERİ & HTTPS -->[\s\S]*?<div id="hub-content-system" class="hub-tab-content">[\s\S]*?<\/div>\s*<\/div>\s*<div class="modal-actions"/;

const newSystemTabHtml = `<!-- 5. SEKME: CİHAZ İZİNLERİ & DONANIM MERKEZİ (Organize Edilmiş) -->
      <div id="hub-content-system" class="hub-tab-content">
        <div class="system-diagnostics-list">
          
          <!-- Kamera İzni Kartı -->
          <div class="system-diag-card" style="border-radius:16px; padding:14px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.12); margin-bottom:10px;">
            <div class="card-icon" style="font-size:1.8rem;">📸</div>
            <div class="card-details" style="flex:1;">
              <div class="card-title" style="font-weight:900; font-size:0.95rem; color:#FFF;">Kamera Erişimi</div>
              <div class="card-desc" style="font-size:0.78rem; color:#94A3B8; margin-top:2px;">
                Komik anları kaydetmek ve alın hareketlerini incelemek için kullanılır.
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
              <span id="perm-camera-badge" class="status-badge ok" style="font-size:0.75rem; font-weight:900; padding:4px 10px; border-radius:999px; background:rgba(16,185,129,0.2); color:#10B981; border:1px solid #10B981;">🟢 AKTİF</span>
              <button type="button" id="btn-test-perm-camera" class="btn-secondary" style="font-size:0.72rem; padding:4px 8px; border-radius:8px;">Kamerayı Aç</button>
            </div>
          </div>

          <!-- Jiroskop Sensör İzni Kartı -->
          <div class="system-diag-card" style="border-radius:16px; padding:14px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.12); margin-bottom:10px;">
            <div class="card-icon" style="font-size:1.8rem;">📱</div>
            <div class="card-details" style="flex:1;">
              <div class="card-title" style="font-weight:900; font-size:0.95rem; color:#FFF;">Jiroskop & Eğim Sensörü</div>
              <div class="card-desc" style="font-size:0.78rem; color:#94A3B8; margin-top:2px;">
                Telefonu alnınıza koyduğunuzda başınızı eğerek (Doğru/Pas) oynamanızı sağlar.
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
              <span id="perm-motion-badge" class="status-badge ok" style="font-size:0.75rem; font-weight:900; padding:4px 10px; border-radius:999px; background:rgba(16,185,129,0.2); color:#10B981; border:1px solid #10B981;">🟢 HAZIR</span>
              <button type="button" id="btn-goto-sensor-tab" class="btn-secondary" style="font-size:0.72rem; padding:4px 8px; border-radius:8px;">Sensör Testi</button>
            </div>
          </div>

          <!-- Ses Efektleri & Haptik Kartı -->
          <div class="system-diag-card" style="border-radius:16px; padding:14px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.12); margin-bottom:10px;">
            <div class="card-icon" style="font-size:1.8rem;">🔊</div>
            <div class="card-details" style="flex:1;">
              <div class="card-title" style="font-weight:900; font-size:0.95rem; color:#FFF;">Ses Efektleri & Titreşim</div>
              <div class="card-desc" style="font-size:0.78rem; color:#94A3B8; margin-top:2px;">
                Saatli bomba, geri sayım ve parti müzik efektleri Web Audio API ile yerel üretilir.
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
              <span class="status-badge ok" style="font-size:0.75rem; font-weight:900; padding:4px 10px; border-radius:999px; background:rgba(16,185,129,0.2); color:#10B981; border:1px solid #10B981;">🟢 AKTİF</span>
              <button type="button" id="btn-test-sound-sample" class="btn-secondary" style="font-size:0.72rem; padding:4px 8px; border-radius:8px;">Test Bipi Çal</button>
            </div>
          </div>

          <!-- Çevrimdışı Çalışma Güvencesi -->
          <div class="system-diag-card" style="border-radius:16px; padding:14px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.12); margin-bottom:12px;">
            <div class="card-icon" style="font-size:1.8rem;">⚡</div>
            <div class="card-details" style="flex:1;">
              <div class="card-title" style="font-weight:900; font-size:0.95rem; color:#FFF;">Çevrimdışı Mod Uyumluluğu</div>
              <div class="card-desc" style="font-size:0.78rem; color:#94A3B8; margin-top:2px;">
                Tüm parti oyunları ve yerel modlar internet bağlantısı olmaksızın %100 çevrimdışı çalışır.
              </div>
            </div>
            <span class="status-badge ok" style="font-size:0.75rem; font-weight:900; padding:4px 10px; border-radius:999px; background:rgba(0,245,212,0.2); color:#00F5D4; border:1px solid #00F5D4;">📶 TAM UYUMLU</span>
          </div>

          <!-- APK Paylaşım Kartı (Modern) -->
          <div class="system-diag-card" style="border-radius:16px; padding:14px; border: 1.5px solid rgba(0, 245, 212, 0.45); background: linear-gradient(135deg, rgba(0, 245, 212, 0.12), rgba(121, 40, 202, 0.2));">
            <div class="card-icon" style="font-size:2rem;">📲</div>
            <div class="card-details" style="flex:1;">
              <div class="card-title" style="color:#00F5D4; font-size:1rem; font-weight:900;">Kafana Tak! APK Paylaş</div>
              <div class="card-desc" style="font-size:0.8rem; color:#E2E8F0; line-height:1.4; margin-top:2px;">
                Oyunu arkadaşlarının telefonuna anında gönder (WhatsApp, Quick Share, Bluetooth).
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
              <button type="button" id="btn-share-app-apk" class="btn-main primary" style="padding:8px 14px; font-size:0.82rem; font-weight:900; white-space:nowrap; border-radius:10px;">
                🚀 APK Paylaş
              </button>
              <button type="button" id="btn-open-apk-qr" class="btn-secondary" style="padding:6px 10px; font-size:0.75rem; font-weight:800; white-space:nowrap; border-radius:10px;">
                📷 QR ile İndirt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-actions"`;

if (oldSystemTabRegex.test(indexContent)) {
  indexContent = indexContent.replace(oldSystemTabRegex, newSystemTabHtml);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✓ index.html: Ayarlar & İzinler sekmesi organize edildi.');
} else {
  console.log('! index.html: oldSystemTabRegex eşleşmedi.');
}

// 3. js/game.js: Logo tıklama efekti ve İzinler sekmesi butonları
const newGameEvents = `
    // Logo İnteraktif Dokunma Efekti (Madde: Logo Hareketlendirme)
    const brandHeader = document.querySelector('.main-brand-header');
    if (brandHeader) {
      brandHeader.addEventListener('click', () => {
        sounds.playPop();
        try { navigator.vibrate?.([40, 30, 40]); } catch(e) {}
        const crown = brandHeader.querySelector('.brand-crown-glow');
        if (crown) {
          crown.style.transform = 'scale(1.3) rotate(15deg)';
          setTimeout(() => { crown.style.transform = ''; }, 300);
        }
      });
    }

    // İzinler Sekmesi Hızlı Aksiyonları
    document.getElementById('btn-test-perm-camera')?.addEventListener('click', () => {
      this.switchHubTab('camera');
      this.hubStartCamera();
    });
    document.getElementById('btn-goto-sensor-tab')?.addEventListener('click', () => {
      this.switchHubTab('motion');
    });
    document.getElementById('btn-test-sound-sample')?.addEventListener('click', () => {
      sounds.playCountdownBeep(true);
    });
`;

// Insert into init() in js/game.js
const initRegex = /setupSettingsHub\(\);/;
if (initRegex.test(gameJsContent)) {
  gameJsContent = gameJsContent.replace(initRegex, `setupSettingsHub();\n${newGameEvents}`);
  fs.writeFileSync(gameJsPath, gameJsContent, 'utf8');
  console.log('✓ js/game.js: Logo ve İzinler etkileşimleri bağlandı.');
}

console.log('🎉 Logo animasyonu ve Ayarlar-İzinler tamamlandı!');
