const fs = require('fs');

const files = ['passaparola.html', 'isim-sehir.html', 'koy.html', 'sarki-duello.html', 'carkifelek.html', 'kelime-islem.html', 'aileler-yarisiyor.html', 'spectator.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const hasAvatar = c.includes('avatar') || c.includes('AVATARS');
    console.log(`\n=== ${f} (hasAvatar: ${hasAvatar}) ===`);
    const lines = c.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('avatar-grid') || l.includes('avatar-picker') || l.includes('avatar-btn') || l.includes('AVATARS')) {
        console.log(`  Line ${idx + 1}: ${l.trim()}`);
      }
    });
  }
});
