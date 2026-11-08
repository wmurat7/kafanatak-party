const fs = require('fs');
let html = fs.readFileSync('passaparola.html', 'utf8');

// Replace avatar grid container
html = html.replace(
  /<div id="avatar-grid"[^>]*><\/div>/,
  '<div id="avatar-grid" class="avatar-grid"></div>'
);

// Replace avatar population loop
const oldLoopRegex = /\/\/ Avatar Se[^\n]+\n\s+const avContainer = document\.getElementById\('avatar-grid'\);[\s\S]*?avContainer\.appendChild\(btn\);\s+\}\);/;
const newLoop = `// Avatar Seçimi
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
    });`;

html = html.replace(oldLoopRegex, newLoop);
fs.writeFileSync('passaparola.html', html, 'utf8');
console.log('passaparola.html updated successfully!');

