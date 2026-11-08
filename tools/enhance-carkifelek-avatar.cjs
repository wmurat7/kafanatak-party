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
    .avatar-btn:active { transform: scale(0.92); }
    .avatar-btn.selected {
      border-color: var(--gold, #FBBF24) !important;
      background: rgba(251, 191, 36, 0.22) !important;
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.45) !important;
      transform: scale(1.05);
    }
`;

// 1. CARKIFELEK.HTML
if (fs.existsSync('carkifelek.html')) {
  let c = fs.readFileSync('carkifelek.html', 'utf8');
  if (!c.includes('.avatar-grid')) {
    c = c.replace('</style>', `${standardAvatarCSS}\n  </style>`);
  }
  if (!c.includes('id="avatar-grid"')) {
    const target = '<input type="text" id="inp-player-name"';
    const avatarHtml = `
      <div style="margin-bottom:12px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>
    `;
    c = c.replace(target, avatarHtml + target);
  }
  if (!c.includes('const AVATARS =')) {
    const targetScript = 'let myPlayerName =';
    const avatarScript = `
    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    const avContainer = document.getElementById('avatar-grid');
    if (avContainer) {
      AVATARS.forEach(av => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'avatar-btn' + (av === selectedAvatar ? ' selected' : '');
        btn.textContent = av;
        btn.onclick = () => {
          selectedAvatar = av;
          avContainer.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        };
        avContainer.appendChild(btn);
      });
    }
    `;
    c = c.replace(targetScript, avatarScript + targetScript);
  }
  fs.writeFileSync('carkifelek.html', c, 'utf8');
  console.log('carkifelek.html avatar support added!');
}

// 2. KELIME-ISLEM.HTML
if (fs.existsSync('kelime-islem.html')) {
  let c = fs.readFileSync('kelime-islem.html', 'utf8');
  if (!c.includes('.avatar-grid')) {
    c = c.replace('</style>', `${standardAvatarCSS}\n  </style>`);
  }
  if (!c.includes('id="avatar-grid"')) {
    const target = '<input type="text" id="inp-player-name"';
    const avatarHtml = `
      <div style="margin-bottom:12px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>
    `;
    c = c.replace(target, avatarHtml + target);
  }
  if (!c.includes('const AVATARS =')) {
    const targetScript = 'let myPlayerName =';
    const avatarScript = `
    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    const avContainer = document.getElementById('avatar-grid');
    if (avContainer) {
      AVATARS.forEach(av => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'avatar-btn' + (av === selectedAvatar ? ' selected' : '');
        btn.textContent = av;
        btn.onclick = () => {
          selectedAvatar = av;
          avContainer.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        };
        avContainer.appendChild(btn);
      });
    }
    `;
    c = c.replace(targetScript, avatarScript + targetScript);
  }
  fs.writeFileSync('kelime-islem.html', c, 'utf8');
  console.log('kelime-islem.html avatar support added!');
}

// 3. AILELER-YARISIYOR.HTML
if (fs.existsSync('aileler-yarisiyor.html')) {
  let c = fs.readFileSync('aileler-yarisiyor.html', 'utf8');
  if (!c.includes('.avatar-grid')) {
    c = c.replace('</style>', `${standardAvatarCSS}\n  </style>`);
  }
  if (!c.includes('id="avatar-grid"')) {
    const target = '<div class="btn-team-select">';
    const avatarHtml = `
      <div style="margin-bottom:12px;">
        <label style="font-size:0.75rem; font-weight:800; color:var(--gold); display:block; margin-bottom:6px; text-align:left;">KAPTAN AVATARINI SEÇ:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>
    `;
    c = c.replace(target, avatarHtml + target);
  }
  if (!c.includes('const AVATARS =')) {
    const targetScript = 'let myPlayerName =';
    const avatarScript = `
    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    const avContainer = document.getElementById('avatar-grid');
    if (avContainer) {
      AVATARS.forEach(av => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'avatar-btn' + (av === selectedAvatar ? ' selected' : '');
        btn.textContent = av;
        btn.onclick = () => {
          selectedAvatar = av;
          avContainer.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        };
        avContainer.appendChild(btn);
      });
    }
    `;
    c = c.replace(targetScript, avatarScript + targetScript);
  }
  fs.writeFileSync('aileler-yarisiyor.html', c, 'utf8');
  console.log('aileler-yarisiyor.html avatar support added!');
}

