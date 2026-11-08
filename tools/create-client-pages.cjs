const fs = require('fs');

const baseHead = (title) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${title} | Kafana Tak Party</title>
  <link rel="icon" type="image/svg+xml" href="assets/icon.svg">
  <style>
    :root {
      --bg: #0B0E14;
      --card-bg: rgba(22, 27, 46, 0.94);
      --card-border: rgba(255, 255, 255, 0.12);
      --primary: #00F5D4;
      --accent: #FF2E93;
      --gold: #FBBF24;
      --danger: #EF4444;
      --success: #10B981;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-tap-highlight-color: transparent; }
    body {
      background: radial-gradient(circle at 50% 0%, #1e102f 0%, var(--bg) 85%);
      color: var(--text);
      min-height: 100vh;
      padding: 16px 14px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      user-select: none;
    }
    .container { max-width: 440px; width: 100%; display: flex; flex-direction: column; gap: 12px; }
    header { text-align: center; margin-bottom: 2px; position: relative; width: 100%; }
    .header-top-row { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 4px; }
    .btn-leave-header {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #F87171;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
    }
    .header-logo { font-size: 2.2rem; display: inline-block; filter: drop-shadow(0 0 15px rgba(0, 245, 212, 0.6)); }
    h1 { font-size: 1.45rem; font-weight: 900; background: linear-gradient(135deg, #FFF, var(--primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .room-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 800; padding: 4px 14px; border-radius: 999px; background: rgba(0, 245, 212, 0.15); border: 1px solid var(--primary); color: var(--primary); margin-top: 4px; }

    .card {
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      backdrop-filter: blur(14px);
      text-align: center;
    }

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
      border-color: var(--gold) !important;
      background: rgba(251, 191, 36, 0.22) !important;
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.45) !important;
      transform: scale(1.05);
    }

    .btn-main {
      background: linear-gradient(135deg, var(--gold), #D97706);
      border: none;
      border-radius: 999px;
      color: #0B0E14;
      font-size: 1rem;
      font-weight: 900;
      padding: 12px 24px;
      width: 100%;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
      transition: all 0.15s;
    }
    .btn-main:active { transform: scale(0.97); }
    .btn-main.cyan {
      background: linear-gradient(135deg, #00F5D4, #00B4D8);
      box-shadow: 0 4px 20px rgba(0, 245, 212, 0.4);
    }
    .btn-main.danger {
      background: linear-gradient(135deg, #EF4444, #B91C1C);
      color: #FFF;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    }
  </style>
</head>`;

// 1. BOMB.HTML (Saatli Bomba)
const bombHtml = `${baseHead('Saatli Bomba')}
<body>
  <div class="container">
    <header>
      <div class="header-top-row">
        <a href="index.html" class="btn-leave-header">🚪 Çıkış</a>
        <div class="header-logo">💣</div>
        <div style="width:60px;"></div>
      </div>
      <h1>Saatli Bomba</h1>
      <div class="room-badge">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#EF4444;"></span>
        ODA: <span id="lbl-room-id">----</span>
      </div>
    </header>

    <!-- 1. Katılım / Lobi -->
    <div id="stage-lobby" class="card">
      <h2 style="font-size:1.3rem; font-weight:900; color:var(--gold); margin-bottom:6px;">Bombaya Bağlan!</h2>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">Bomba elden ele geçecek; elinde patlayan yanar!</p>
      
      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">🔑 Oda Kodu:</label>
        <input type="text" id="inp-room-code" placeholder="Örn: 8XFE" maxlength="6" style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:900; font-size:1.1rem; text-align:center; letter-spacing:2px; text-transform:uppercase; outline:none;" />
      </div>

      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">İsminiz:</label>
        <input type="text" id="inp-player-name" placeholder="Adınızı yazın..." style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:800; font-size:1rem; outline:none;" />
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>

      <button type="button" id="btn-join-room" class="btn-main">
        🚀 Bombaya Katıl
      </button>
    </div>

    <!-- 2. Canlı Oyun -->
    <div id="stage-playing" class="card" style="display:none;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:8px 14px; border-radius:12px; margin-bottom:14px;">
        <span id="lbl-my-identity" style="font-size:0.85rem; font-weight:900; color:var(--gold);">👤 Ben</span>
        <span id="lbl-bomb-holder" style="font-size:0.85rem; font-weight:900; color:#EF4444;">💣 Bomba: Bekleniyor</span>
      </div>

      <!-- Bomba Görseli -->
      <div id="bomb-visual-box" style="margin:20px auto; width:120px; height:120px; display:flex; align-items:center; justify-content:center; font-size:4.5rem; transition:transform 0.1s ease;">
        💣
      </div>

      <div id="prompt-box" style="background:rgba(0,0,0,0.45); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:16px; margin-bottom:16px;">
        <span style="font-size:0.75rem; color:var(--gold); font-weight:900; text-transform:uppercase; display:block; margin-bottom:4px;">GÖREV:</span>
        <p id="lbl-bomb-prompt" style="font-size:1.05rem; font-weight:900; color:#FFF; line-height:1.4;">Bomba hazırlanıyor...</p>
      </div>

      <button type="button" id="btn-pass-bomb" class="btn-main danger" style="padding:16px; font-size:1.1rem;">
        💣 BİLDİM, SIRADAKİNE PASLA!
      </button>

      <div id="boom-overlay" style="display:none; margin-top:16px; background:rgba(239,68,68,0.25); border:2px solid #EF4444; border-radius:16px; padding:14px;">
        <div style="font-size:2.5rem;">💥 BOOOM!</div>
        <div id="lbl-exploded-who" style="font-size:1.1rem; font-weight:900; color:#FFF; margin-top:4px;">Bomba Patladı!</div>
      </div>
    </div>
  </div>

  <script type="module">
    import { firebaseNetwork } from './js/firebase-network.js';

    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    let myPlayerId = 'p_' + Math.random().toString(36).substr(2, 6);
    let roomId = (new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase();

    if (roomId) {
      document.getElementById('inp-room-code').value = roomId;
      document.getElementById('lbl-room-id').textContent = roomId;
    }

    const avContainer = document.getElementById('avatar-grid');
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

    document.getElementById('btn-join-room').onclick = async () => {
      const code = (document.getElementById('inp-room-code').value || roomId).trim().toUpperCase();
      const name = (document.getElementById('inp-player-name').value || 'Oyuncu').trim();
      if (!code) return alert('Lütfen oda kodunu girin!');
      roomId = code;
      document.getElementById('lbl-room-id').textContent = roomId;
      document.getElementById('lbl-my-identity').textContent = \`\${selectedAvatar} \${name}\`;

      await firebaseNetwork.setPlayer('bomb', roomId, {
        id: myPlayerId,
        name,
        avatar: selectedAvatar,
        joinedAt: Date.now()
      });

      document.getElementById('stage-lobby').style.display = 'none';
      document.getElementById('stage-playing').style.display = 'block';

      firebaseNetwork.listenRoom('bomb', roomId, (room) => {
        if (!room) return;
        if (room.prompt) document.getElementById('lbl-bomb-prompt').textContent = room.prompt;
        if (room.currentHolderName) {
          document.getElementById('lbl-bomb-holder').textContent = \`💣 Bomba: \${room.currentHolderName}\`;
        }
        if (room.exploded) {
          document.getElementById('boom-overlay').style.display = 'block';
          document.getElementById('lbl-exploded-who').textContent = \`Bomba \${room.explodedPlayerName || 'birinde'} patladı!\`;
        } else {
          document.getElementById('boom-overlay').style.display = 'none';
        }
      });
    };

    document.getElementById('btn-pass-bomb').onclick = async () => {
      await firebaseNetwork.sendAction('bomb', roomId, 'pass_bomb', {
        fromPlayerId: myPlayerId
      });
    };
  </script>
</body>
</html>`;

fs.writeFileSync('bomb.html', bombHtml, 'utf8');
console.log('bomb.html created!');

// 2. BOTTLE.HTML (Şişe Çevirmece / Doğruluk Cesaret)
const bottleHtml = `${baseHead('Doğruluk mu Cesaret mi?')}
<body>
  <div class="container">
    <header>
      <div class="header-top-row">
        <a href="index.html" class="btn-leave-header">🚪 Çıkış</a>
        <div class="header-logo">🍾</div>
        <div style="width:60px;"></div>
      </div>
      <h1>Doğruluk mu Cesaret mi?</h1>
      <div class="room-badge">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#FBBF24;"></span>
        ODA: <span id="lbl-room-id">----</span>
      </div>
    </header>

    <div id="stage-lobby" class="card">
      <h2 style="font-size:1.3rem; font-weight:900; color:var(--gold); margin-bottom:6px;">Masaya Katıl!</h2>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">Şişe çevrildiğinde görev anında ekranına gelecek!</p>
      
      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">🔑 Oda Kodu:</label>
        <input type="text" id="inp-room-code" placeholder="Örn: 8XFE" maxlength="6" style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:900; font-size:1.1rem; text-align:center; letter-spacing:2px; text-transform:uppercase; outline:none;" />
      </div>

      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">İsminiz:</label>
        <input type="text" id="inp-player-name" placeholder="Adınızı yazın..." style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:800; font-size:1rem; outline:none;" />
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>

      <button type="button" id="btn-join-room" class="btn-main">
        🚀 Masaya Bağlan
      </button>
    </div>

    <div id="stage-playing" class="card" style="display:none;">
      <div style="background:rgba(255,255,255,0.06); padding:8px 14px; border-radius:12px; margin-bottom:14px;">
        <span id="lbl-turn-info" style="font-size:0.95rem; font-weight:900; color:var(--gold);">🍾 Şişe Çevriliyor...</span>
      </div>

      <div id="task-box" style="background:rgba(0,0,0,0.45); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:16px; margin-bottom:16px;">
        <span id="lbl-task-type" style="font-size:0.75rem; color:#00F5D4; font-weight:900; text-transform:uppercase; display:block; margin-bottom:4px;">GÖREV</span>
        <p id="lbl-task-text" style="font-size:1.05rem; font-weight:900; color:#FFF; line-height:1.4;">Şişenin durması bekleniyor...</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button type="button" id="btn-vote-pass" class="btn-main" style="background:linear-gradient(135deg, #10B981, #059669); color:#FFF;">
          👍 Yaptı (+10)
        </button>
        <button type="button" id="btn-vote-fail" class="btn-main danger">
          👎 Kaçtı (Ceza!)
        </button>
      </div>
    </div>
  </div>

  <script type="module">
    import { firebaseNetwork } from './js/firebase-network.js';

    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    let myPlayerId = 'p_' + Math.random().toString(36).substr(2, 6);
    let roomId = (new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase();

    if (roomId) {
      document.getElementById('inp-room-code').value = roomId;
      document.getElementById('lbl-room-id').textContent = roomId;
    }

    const avContainer = document.getElementById('avatar-grid');
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

    document.getElementById('btn-join-room').onclick = async () => {
      const code = (document.getElementById('inp-room-code').value || roomId).trim().toUpperCase();
      const name = (document.getElementById('inp-player-name').value || 'Oyuncu').trim();
      if (!code) return alert('Lütfen oda kodunu girin!');
      roomId = code;
      document.getElementById('lbl-room-id').textContent = roomId;

      await firebaseNetwork.setPlayer('bottle', roomId, {
        id: myPlayerId,
        name,
        avatar: selectedAvatar,
        joinedAt: Date.now()
      });

      document.getElementById('stage-lobby').style.display = 'none';
      document.getElementById('stage-playing').style.display = 'block';

      firebaseNetwork.listenRoom('bottle', roomId, (room) => {
        if (!room) return;
        if (room.turnInfo) document.getElementById('lbl-turn-info').textContent = room.turnInfo;
        if (room.taskText) document.getElementById('lbl-task-text').textContent = room.taskText;
        if (room.taskType) document.getElementById('lbl-task-type').textContent = room.taskType;
      });
    };

    document.getElementById('btn-vote-pass').onclick = async () => {
      await firebaseNetwork.sendAction('bottle', roomId, 'vote_task', { voter: myPlayerId, vote: 'pass' });
    };
    document.getElementById('btn-vote-fail').onclick = async () => {
      await firebaseNetwork.sendAction('bottle', roomId, 'vote_task', { voter: myPlayerId, vote: 'fail' });
    };
  </script>
</body>
</html>`;

fs.writeFileSync('bottle.html', bottleHtml, 'utf8');
console.log('bottle.html created!');

// 3. KELIME-BOMBASI.HTML (Son Sözü Kim Söyler?)
const kelimeBombasiHtml = `${baseHead('Kelime Bombası')}
<body>
  <div class="container">
    <header>
      <div class="header-top-row">
        <a href="index.html" class="btn-leave-header">🚪 Çıkış</a>
        <div class="header-logo">💥</div>
        <div style="width:60px;"></div>
      </div>
      <h1>Kelime Bombası</h1>
      <div class="room-badge">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#FF2E93;"></span>
        ODA: <span id="lbl-room-id">----</span>
      </div>
    </header>

    <div id="stage-lobby" class="card">
      <h2 style="font-size:1.3rem; font-weight:900; color:var(--gold); margin-bottom:6px;">Oyuna Katıl!</h2>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">Kategori ve harfi canlı takip et, kelimeyi ilk söyleyen ol!</p>
      
      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">🔑 Oda Kodu:</label>
        <input type="text" id="inp-room-code" placeholder="Örn: 8XFE" maxlength="6" style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:900; font-size:1.1rem; text-align:center; letter-spacing:2px; text-transform:uppercase; outline:none;" />
      </div>

      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">İsminiz:</label>
        <input type="text" id="inp-player-name" placeholder="Adınızı yazın..." style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:800; font-size:1rem; outline:none;" />
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>

      <button type="button" id="btn-join-room" class="btn-main">
        🚀 Bombaya Katıl
      </button>
    </div>

    <div id="stage-playing" class="card" style="display:none;">
      <div style="background:linear-gradient(135deg, rgba(255,46,147,0.2), rgba(121,40,202,0.3)); border:2px solid #FF2E93; border-radius:16px; padding:16px; margin-bottom:14px;">
        <span style="font-size:0.75rem; color:#FFF; font-weight:900; text-transform:uppercase; display:block; margin-bottom:2px;">KATEGORİ:</span>
        <div id="lbl-kb-category" style="font-size:1.25rem; font-weight:900; color:var(--gold);">Yükleniyor...</div>
      </div>

      <div style="background:rgba(0,0,0,0.45); border:2px solid var(--primary); border-radius:20px; padding:20px; margin-bottom:16px;">
        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:800; display:block; margin-bottom:4px;">BAŞLANGIÇ HARFİ:</span>
        <div id="lbl-kb-letter" style="font-size:3.5rem; font-weight:900; color:#00F5D4; line-height:1;">A</div>
      </div>

      <button type="button" id="btn-kb-buzzer" class="btn-main cyan" style="padding:16px; font-size:1.15rem; font-weight:900;">
        🎯 KELİMEYİ BİLDİM!
      </button>
    </div>
  </div>

  <script type="module">
    import { firebaseNetwork } from './js/firebase-network.js';

    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    let myPlayerId = 'p_' + Math.random().toString(36).substr(2, 6);
    let roomId = (new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase();

    if (roomId) {
      document.getElementById('inp-room-code').value = roomId;
      document.getElementById('lbl-room-id').textContent = roomId;
    }

    const avContainer = document.getElementById('avatar-grid');
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

    document.getElementById('btn-join-room').onclick = async () => {
      const code = (document.getElementById('inp-room-code').value || roomId).trim().toUpperCase();
      const name = (document.getElementById('inp-player-name').value || 'Oyuncu').trim();
      if (!code) return alert('Lütfen oda kodunu girin!');
      roomId = code;
      document.getElementById('lbl-room-id').textContent = roomId;

      await firebaseNetwork.setPlayer('kelimebombasi', roomId, {
        id: myPlayerId,
        name,
        avatar: selectedAvatar,
        joinedAt: Date.now()
      });

      document.getElementById('stage-lobby').style.display = 'none';
      document.getElementById('stage-playing').style.display = 'block';

      firebaseNetwork.listenRoom('kelimebombasi', roomId, (room) => {
        if (!room) return;
        if (room.category) document.getElementById('lbl-kb-category').textContent = room.category;
        if (room.letter) document.getElementById('lbl-kb-letter').textContent = room.letter;
      });
    };

    document.getElementById('btn-kb-buzzer').onclick = async () => {
      await firebaseNetwork.sendAction('kelimebombasi', roomId, 'buzz_word', { playerId: myPlayerId });
      document.getElementById('btn-kb-buzzer').textContent = '✅ Cevaplandı!';
      setTimeout(() => {
        document.getElementById('btn-kb-buzzer').textContent = '🎯 KELİMEYİ BİLDİM!';
      }, 2000);
    };
  </script>
</body>
</html>`;

fs.writeFileSync('kelime-bombasi.html', kelimeBombasiHtml, 'utf8');
console.log('kelime-bombasi.html created!');

// 4. TERS-SES.HTML (Ters Ses / Geri Vites)
const tersSesHtml = `${baseHead('Ters Ses (Geri Vites)')}
<body>
  <div class="container">
    <header>
      <div class="header-top-row">
        <a href="index.html" class="btn-leave-header">🚪 Çıkış</a>
        <div class="header-logo">⏪</div>
        <div style="width:60px;"></div>
      </div>
      <h1>Ters Ses (Geri Vites)</h1>
      <div class="room-badge">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00F5D4;"></span>
        ODA: <span id="lbl-room-id">----</span>
      </div>
    </header>

    <div id="stage-lobby" class="card">
      <h2 style="font-size:1.3rem; font-weight:900; color:var(--gold); margin-bottom:6px;">Ters Sese Katıl!</h2>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">Tersten çalınan sesi dinle, doğru kelimeyi ilk sen bil!</p>
      
      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">🔑 Oda Kodu:</label>
        <input type="text" id="inp-room-code" placeholder="Örn: 8XFE" maxlength="6" style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:900; font-size:1.1rem; text-align:center; letter-spacing:2px; text-transform:uppercase; outline:none;" />
      </div>

      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:4px;">İsminiz:</label>
        <input type="text" id="inp-player-name" placeholder="Adınızı yazın..." style="width:100%; background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; color:#FFF; font-weight:800; font-size:1rem; outline:none;" />
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:0.8rem; font-weight:800; color:var(--text-muted); display:block; margin-bottom:6px; text-align:left;">Avatar Seçin:</label>
        <div id="avatar-grid" class="avatar-grid"></div>
      </div>

      <button type="button" id="btn-join-room" class="btn-main">
        🚀 Odaya Katıl
      </button>
    </div>

    <div id="stage-playing" class="card" style="display:none;">
      <div style="background:rgba(255,255,255,0.06); padding:8px 14px; border-radius:12px; margin-bottom:14px;">
        <span id="lbl-ters-round" style="font-size:0.95rem; font-weight:900; color:var(--gold);">Tur: 1 / 5</span>
      </div>

      <div style="background:rgba(0,0,0,0.45); border:2px dashed var(--primary); border-radius:20px; padding:24px; margin-bottom:16px;">
        <div style="font-size:3rem; margin-bottom:8px;">🎧</div>
        <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:6px;">Ters Ses Canlı Çalıyor</div>
        <p style="font-size:0.82rem; color:var(--text-muted);">Ana cihazdan veya kulaklığından tersten sesi dinle!</p>
      </div>

      <button type="button" id="btn-ters-buzzer" class="btn-main cyan" style="padding:16px; font-size:1.2rem; font-weight:900; box-shadow:0 0 25px rgba(0,245,212,0.4);">
        🎯 BULDUM! CEVAP BENDİ!
      </button>
    </div>
  </div>

  <script type="module">
    import { firebaseNetwork } from './js/firebase-network.js';

    const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🦄', '🐸', '🐶', '🐱'];
    let selectedAvatar = '🦁';
    let myPlayerId = 'p_' + Math.random().toString(36).substr(2, 6);
    let roomId = (new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase();

    if (roomId) {
      document.getElementById('inp-room-code').value = roomId;
      document.getElementById('lbl-room-id').textContent = roomId;
    }

    const avContainer = document.getElementById('avatar-grid');
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

    document.getElementById('btn-join-room').onclick = async () => {
      const code = (document.getElementById('inp-room-code').value || roomId).trim().toUpperCase();
      const name = (document.getElementById('inp-player-name').value || 'Oyuncu').trim();
      if (!code) return alert('Lütfen oda kodunu girin!');
      roomId = code;
      document.getElementById('lbl-room-id').textContent = roomId;

      await firebaseNetwork.setPlayer('tersses', roomId, {
        id: myPlayerId,
        name,
        avatar: selectedAvatar,
        joinedAt: Date.now()
      });

      document.getElementById('stage-lobby').style.display = 'none';
      document.getElementById('stage-playing').style.display = 'block';

      firebaseNetwork.listenRoom('tersses', roomId, (room) => {
        if (!room) return;
        if (room.round) document.getElementById('lbl-ters-round').textContent = \`Tur: \${room.round}\`;
      });
    };

    document.getElementById('btn-ters-buzzer').onclick = async () => {
      await firebaseNetwork.sendAction('tersses', roomId, 'buzz_guess', { playerId: myPlayerId });
      document.getElementById('btn-ters-buzzer').textContent = '✅ Zili Çaldın!';
      setTimeout(() => {
        document.getElementById('btn-ters-buzzer').textContent = '🎯 BULDUM! CEVAP BENDİ!';
      }, 2500);
    };
  </script>
</body>
</html>`;

fs.writeFileSync('ters-ses.html', tersSesHtml, 'utf8');
console.log('ters-ses.html created!');

