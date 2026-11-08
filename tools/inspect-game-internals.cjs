const fs = require('fs');

function inspectFile(path, keywords) {
  if (!fs.existsSync(path)) return;
  const content = fs.readFileSync(path, 'utf8');
  console.log(`\n================ ${path} ================`);
  keywords.forEach(kw => {
    const idx = content.indexOf(kw);
    if (idx !== -1) {
      console.log(`Found '${kw}' around pos ${idx}:`);
      console.log(content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 150)).replace(/\n/g, ' '));
    }
  });
}

inspectFile('js/kelime-islem-game.js', ['createWifiRoom', 'wifi-box', 'renderLobby', 'QRCode']);
inspectFile('js/aileler-yarisiyor-game.js', ['createWifiRoom', 'wifi-box', 'renderLobby', 'QRCode']);
inspectFile('js/vampire-game.js', ['createWifiRoom', 'qr-canvas', 'drawQRCode']);
inspectFile('js/bomb-game.js', ['setup', 'render', 'start']);
inspectFile('js/bottle-game.js', ['setup', 'render', 'start']);
inspectFile('js/kelime-bombasi.js', ['setup', 'render', 'start']);
inspectFile('js/ters-ses-game.js', ['setup', 'render', 'start']);

