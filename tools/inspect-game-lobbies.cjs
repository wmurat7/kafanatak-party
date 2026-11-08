const fs = require('fs');

const files = [
  'js/passaparola-game.js',
  'js/carkifelek-game.js',
  'js/isim-sehir-game.js',
  'js/kelime-islem-game.js',
  'js/aileler-yarisiyor-game.js',
  'js/vampire-game.js',
  'js/bomb-game.js',
  'js/bottle-game.js',
  'js/kelime-bombasi.js',
  'js/ters-ses-game.js'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n=== ${f} ===`);
  const hasWifi = content.includes('createWifiRoom') || content.includes('wifi') || content.includes('createRoom');
  const hasQR = content.includes('QRCode');
  const hasMod = content.includes('HostModerationPanel');
  const hasCopy = content.includes('clipboard') || content.includes('Kopyala');
  console.log(`hasWifi/createRoom: ${hasWifi}, hasQR: ${hasQR}, hasModeration: ${hasMod}, hasCopyLink: ${hasCopy}`);
});

