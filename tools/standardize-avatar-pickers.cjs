const fs = require('fs');

const standardAvatarCSS = `
    /* ULTRA-RESPONSIVE COMPACT AVATAR GRID */
    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      max-width: 300px;
      margin: 0 auto 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .avatar-btn {
      aspect-ratio: 1 / 1;
      width: 100%;
      max-width: 64px;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(1.3rem, 5.5vw, 1.6rem);
      line-height: 1;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      cursor: pointer;
      padding: 0;
      margin: 0 auto;
      transition: all 0.18s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .avatar-btn:active {
      transform: scale(0.92);
    }
    .avatar-btn.selected {
      border-color: var(--gold, #FBBF24) !important;
      background: rgba(251, 191, 36, 0.22) !important;
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.45) !important;
      transform: scale(1.05);
    }
`;

// 1. ISIM-SEHIR.HTML
if (fs.existsSync('isim-sehir.html')) {
  let c = fs.readFileSync('isim-sehir.html', 'utf8');
  c = c.replace(/\/\* Avatar Grid \*\/[\s\S]*?\.avatar-btn\.selected\s*\{[\s\S]*?\}/, standardAvatarCSS.trim());
  fs.writeFileSync('isim-sehir.html', c, 'utf8');
  console.log('isim-sehir.html avatar styles updated!');
}

// 2. KOY.HTML
if (fs.existsSync('koy.html')) {
  let c = fs.readFileSync('koy.html', 'utf8');
  c = c.replace(/\/\* Avatar Grid \*\/[\s\S]*?\.avatar-btn\.selected\s*\{[\s\S]*?\}/, standardAvatarCSS.trim());
  fs.writeFileSync('koy.html', c, 'utf8');
  console.log('koy.html avatar styles updated!');
}

// 3. SARKI-DUELLO.HTML
if (fs.existsSync('sarki-duello.html')) {
  let c = fs.readFileSync('sarki-duello.html', 'utf8');
  c = c.replace(/\.avatar-picker\s*\{[\s\S]*?\.avatar-btn\.selected\s*\{[\s\S]*?\}/, standardAvatarCSS.trim().replace(/\.avatar-grid/g, '.avatar-picker'));
  fs.writeFileSync('sarki-duello.html', c, 'utf8');
  console.log('sarki-duello.html avatar styles updated!');
}

console.log('Avatar pickers standardized!');

