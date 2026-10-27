// tools/bundle-mobile.cjs - Kafana Tak! Mobil Paketleme Scripti
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'www');

console.log('📦 Kafana Tak! mobil varlıkları www/ klasörüne kopyalanıyor...');

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Ana dosyaları kopyala
['index.html', 'spectator.html', 'koy.html', 'isim-sehir.html', 'passaparola.html', 'carkifelek.html', 'manifest.json'].forEach(f => {
  const src = path.join(rootDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, f));
    console.log(`  ✓ ${f}`);
  }
});

// 2. Klasörleri kopyala
['assets', 'css', 'js'].forEach(d => {
  const src = path.join(rootDir, d);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(outDir, d));
    console.log(`  ✓ ${d}/`);
  }
});

console.log('✅ Mobil paketleme tamamlandı: www/ klasörü hazır.');
