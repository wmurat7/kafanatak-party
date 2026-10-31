// tools/apply-madde-11.cjs
// Madde 11: Çarkıfelek Oyununda Aşağı Kaydırmalı Ekran Yerine Yatay Sonsuz İlerlemeli Makaralı Şerit Motoru

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const carkJsPath = path.join(__dirname, '..', 'js', 'carkifelek-game.js');

console.log('🚀 Madde 11: Çarkıfelek Yatay Şerit Dönüşümü Başlatılıyor...');

let indexContent = fs.readFileSync(indexPath, 'utf8');
let carkJsContent = fs.readFileSync(carkJsPath, 'utf8');

// 1. index.html İçindeki 280x280 dairesel canvas'ı modern yatay makaralı şeritle değiştir
const oldWheelHtml = `    <!-- Dönen Çark Canvas -->
    <div style="position:relative; width:280px; height:280px; margin:0 auto 14px; -webkit-tap-highlight-color:transparent; outline:none;">
      <canvas id="carkifelek-wheel-canvas" width="280" height="280" style="width:280px; height:280px; -webkit-tap-highlight-color:transparent !important; outline:none; touch-action:manipulation;"></canvas>
    </div>`;

const newHorizontalReelHtml = `    <!-- YATAY SONSUZ MAKARALI ÇARK ŞERİDİ (Madde 11: Sıfır Dikey Kaydırma) -->
    <div id="cark-horizontal-reel-container" style="position:relative; width:100%; max-width:460px; height:82px; margin:0 auto 12px; background:linear-gradient(180deg, #0F172A, #1E293B); border:2px solid rgba(251,191,36,0.6); border-radius:18px; box-shadow:0 0 25px rgba(251,191,36,0.2), inset 0 2px 10px rgba(0,0,0,0.8); overflow:hidden; display:flex; align-items:center; user-select:none; -webkit-user-select:none;">
      
      <!-- Üst ve Alt Altın Merkez İbresi (Target Indicator) -->
      <div style="position:absolute; top:-2px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:11px solid transparent; border-right:11px solid transparent; border-top:14px solid var(--gold); z-index:10; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.8)); pointer-events:none;"></div>
      <div style="position:absolute; bottom:-2px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:11px solid transparent; border-right:11px solid transparent; border-bottom:14px solid var(--gold); z-index:10; filter:drop-shadow(0 -2px 6px rgba(0,0,0,0.8)); pointer-events:none;"></div>
      
      <!-- Merkez Vurgu Işığı (Center Highlight Beam) -->
      <div style="position:absolute; left:50%; top:0; bottom:0; width:80px; transform:translateX(-50%); background:rgba(251,191,36,0.14); border-left:2px solid rgba(251,191,36,0.8); border-right:2px solid rgba(251,191,36,0.8); pointer-events:none; z-index:8;"></div>

      <!-- Kenar Karartma Gradyanları (Vignette Fade) -->
      <div style="position:absolute; left:0; top:0; bottom:0; width:50px; background:linear-gradient(to right, #0B0E14, transparent); z-index:9; pointer-events:none;"></div>
      <div style="position:absolute; right:0; top:0; bottom:0; width:50px; background:linear-gradient(to left, #0B0E14, transparent); z-index:9; pointer-events:none;"></div>

      <!-- Yatay Kayan Şerit (Slot Strip) -->
      <div id="cark-strip-track" style="display:flex; height:68px; align-items:center; will-change:transform; transform:translateX(0px);"></div>
      
      <!-- Geriye dönük uyumluluk için gizli canvas -->
      <canvas id="carkifelek-wheel-canvas" width="10" height="10" style="display:none;"></canvas>
    </div>`;

// Normalize line endings for replacement
const normIndex = indexContent.replace(/\r\n/g, '\n');
const normOldHtml = oldWheelHtml.replace(/\r\n/g, '\n');

if (normIndex.includes(normOldHtml)) {
  const isCRLF = indexContent.includes('\r\n');
  indexContent = normIndex.replace(normOldHtml, newHorizontalReelHtml.replace(/\r\n/g, '\n'));
  if (isCRLF) indexContent = indexContent.replace(/\n/g, '\r\n');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✓ index.html: Dairesel çark yerine yatay makaralı şerit entegre edildi.');
} else {
  console.log('! index.html: Hedef canvas bloğu tam eşleşmedi, aranıyor...');
}

// 2. js/carkifelek-game.js İçinde Yatay Makaralı Şerit Motoru ve Animasyonu
const horizontalStripEngine = `
  // =========================================================================
  // YATAY SONSUZ MAKARALI ŞERİT MOTORU (Madde 11)
  // =========================================================================
  initHorizontalReel() {
    this.stripTrack = document.getElementById('cark-strip-track');
    this.reelContainer = document.getElementById('cark-horizontal-reel-container');
    this.cardWidth = 80; // 76px kart + 4px boşluk
    this.currentOffset = 0;
    this.stripCards = [];

    if (!this.stripTrack) return;
    this.stripTrack.innerHTML = '';

    // Sonsuz dönme hissi için 16 dilimi 15 kez ardışık olarak şeride ekle (240 kart)
    const REPEAT_COUNT = 15;
    for (let r = 0; r < REPEAT_COUNT; r++) {
      CARKIFELEK_SLICES.forEach((slice, idx) => {
        const card = document.createElement('div');
        card.className = 'cark-strip-card';
        card.style.cssText = \`
          width: 74px;
          height: 60px;
          margin: 0 3px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: \${slice.color};
          color: \${slice.type === 'points' && slice.value <= 500 ? '#0B0E14' : '#FFF'};
          font-weight: 900;
          font-size: \${slice.text.length > 5 ? '0.75rem' : '1.05rem'};
          box-shadow: inset 0 2px 6px rgba(255,255,255,0.4), 0 3px 8px rgba(0,0,0,0.5);
          border: 1.5px solid rgba(255,255,255,0.6);
          text-shadow: \${slice.type === 'bankrupt' || slice.type === 'pass' ? '0 1px 3px rgba(0,0,0,0.8)' : 'none'};
          transition: transform 0.2s, box-shadow 0.2s;
        \`;

        let icon = '';
        if (slice.type === 'bankrupt') icon = '💀 ';
        else if (slice.type === 'pass') icon = '⛔ ';
        else if (slice.type === 'reward') icon = '🎁 ';
        else if (slice.type === 'spin_again') icon = '🔄 ';

        card.innerHTML = \`
          <span style="font-size:0.68rem; opacity:0.9; font-weight:800; line-height:1;">\${icon}</span>
          <span style="line-height:1.1; letter-spacing:0.5px;">\${slice.text}</span>
        \`;

        this.stripTrack.appendChild(card);
        this.stripCards.push({ element: card, slice, originalIndex: idx });
      });
    }

    // İlk pozisyonu ortala
    const containerW = this.reelContainer ? this.reelContainer.clientWidth : 400;
    this.currentOffset = -(16 * 4 * this.cardWidth - (containerW / 2 - this.cardWidth / 2));
    this.stripTrack.style.transform = \`translateX(\${this.currentOffset}px)\`;
  }

  drawWheel() {
    // Yatay makaralı motoru hazırla (Eski drawWheel yerine)
    if (!this.stripTrack) {
      this.initHorizontalReel();
    }
  }

  spinWheel() {
    if (this.isSpinning || this.canPickLetter) return;
    this.isSpinning = true;

    if (!this.stripTrack) {
      this.initHorizontalReel();
    }

    const btnSpin = document.getElementById('btn-cark-spin');
    if (btnSpin) {
      btnSpin.disabled = true;
      btnSpin.innerHTML = '🎡 MAKARA DÖNÜYOR...';
    }

    try { sounds.playSpin(); } catch (e) {}

    // Rastgele kazanan dilim seç
    const chosenIndex = Math.floor(Math.random() * CARKIFELEK_SLICES.length);
    const chosenSlice = CARKIFELEK_SLICES[chosenIndex];

    const containerW = this.reelContainer ? this.reelContainer.clientWidth : 400;
    const centerOffset = (containerW / 2) - (this.cardWidth / 2);

    // 40 ila 60 kart ileriye fırla
    const cardsToSkip = 48 + chosenIndex;
    const targetOffset = -(cardsToSkip * this.cardWidth - centerOffset);
    const startOffset = this.currentOffset;
    const distance = targetOffset - startOffset;

    const duration = 3400; // 3.4 saniye gerçekçi slot makarası akışı
    const startTime = performance.now();
    let lastTickCard = -1;

    // Vurguları sıfırla
    if (this.stripCards) {
      this.stripCards.forEach(c => {
        c.element.style.transform = 'scale(1)';
        c.element.style.borderColor = 'rgba(255,255,255,0.6)';
        c.element.style.boxShadow = 'inset 0 2px 6px rgba(255,255,255,0.4), 0 3px 8px rgba(0,0,0,0.5)';
      });
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Yumuşak ve tatmin edici yavaşlama (Cubic ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const curPos = startOffset + distance * easeOut;
      this.currentOffset = curPos;

      if (this.stripTrack) {
        this.stripTrack.style.transform = \`translateX(\${curPos}px)\`;
      }

      // Merkezden geçen her kartta tik sesi
      const currentPassedCard = Math.floor((-curPos + centerOffset) / this.cardWidth);
      if (currentPassedCard !== lastTickCard && progress < 0.98) {
        lastTickCard = currentPassedCard;
        try { sounds.playWheelTick(); } catch (e) {}
      }

      if (progress < 1) {
        this.spinAnimId = requestAnimationFrame(animate);
      } else {
        this.spinAnimId = null;
        this.isSpinning = false;
        if (btnSpin) btnSpin.innerHTML = '🎡 ÇARKI ÇEVİR';

        // Kazanan kartı merkezde altın neon ile parlat
        if (this.stripCards && this.stripCards[cardsToSkip]) {
          const winEl = this.stripCards[cardsToSkip].element;
          winEl.style.transform = 'scale(1.14)';
          winEl.style.borderColor = 'var(--gold)';
          winEl.style.boxShadow = '0 0 25px var(--gold), inset 0 2px 8px #FFF';
          winEl.style.zIndex = '5';
        }

        // Kazanç veya İflas sesi
        if (chosenSlice.type === 'bankrupt' || chosenSlice.type === 'pass') {
          try { sounds.playBuzzer(); } catch(e) {}
        } else {
          try { sounds.playWheelWin(); } catch(e) {}
        }

        this.handleSliceOutcome(chosenSlice);
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }
`;

// Replace drawWheel and spinWheel in js/carkifelek-game.js
const drawAndSpinRegex = /drawWheel\(\)\s*\{[\s\S]*?spinWheel\(\)\s*\{[\s\S]*?this\.handleSliceOutcome\(chosenSlice\);\s*\}\s*\}\s*;/;
if (drawAndSpinRegex.test(carkJsContent)) {
  carkJsContent = carkJsContent.replace(drawAndSpinRegex, horizontalStripEngine);
  console.log('✓ js/carkifelek-game.js: Yatay makara motoru başarıyla uygulandı.');
} else {
  // Alternatif olarak drawWheel'dan handleSliceOutcome'a kadar olan bloğu bul
  const startIdx = carkJsContent.indexOf('drawWheel()');
  const endIdx = carkJsContent.indexOf('this.handleSliceOutcome(chosenSlice);');
  if (startIdx !== -1 && endIdx !== -1) {
    const closeBraceIdx = carkJsContent.indexOf('}', endIdx);
    const finalCloseIdx = carkJsContent.indexOf('}', closeBraceIdx + 1);
    carkJsContent = carkJsContent.slice(0, startIdx) + horizontalStripEngine + carkJsContent.slice(finalCloseIdx + 1);
    console.log('✓ js/carkifelek-game.js: Yatay makara motoru indeks bazlı başarıyla uygulandı.');
  } else {
    console.log('! drawWheel ve spinWheel eşleşmedi.');
  }
}

fs.writeFileSync(carkJsPath, carkJsContent, 'utf8');
console.log('🎉 Madde 11 başarıyla tamamlandı!');

