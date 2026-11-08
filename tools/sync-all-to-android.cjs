const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (element === 'node_modules' || element === '.git' || element === 'android' || element === 'tools') return;
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log('--- 1. Syncing root files to www/ ---');
const rootFilesToCopy = [
  'index.html',
  'passaparola.html',
  'carkifelek.html',
  'isim-sehir.html',
  'kelime-islem.html',
  'aileler-yarisiyor.html',
  'koy.html',
  'spectator.html',
  'sarki-duello.html',
  'bomb.html',
  'bottle.html',
  'kelime-bombasi.html',
  'ters-ses.html'
];

rootFilesToCopy.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('www', f));
    console.log(`Copied ${f} to www/${f}`);
  }
});

// Copy js/ and css/ to www/
copyFolderSync('js', 'www/js');
console.log('Copied js/ to www/js');
copyFolderSync('css', 'www/css');
console.log('Copied css/ to www/css');

console.log('--- 2. Syncing www/ to android/app/src/main/assets/public/ ---');
const targetPublic = path.join('android', 'app', 'src', 'main', 'assets', 'public');
copyFolderSync('www', targetPublic);
console.log('Capacitor assets synchronized successfully!');

