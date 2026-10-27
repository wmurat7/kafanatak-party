const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Convert applause_theatre.ogg: Cut 1.2s to 4.2s (the warmest, most natural theatre clapping)
// Normalize volume to loud and clear
const inputOgg = path.join(__dirname, '..', 'scratch', 'applause_theatre.ogg');
const outputWav = path.join(__dirname, '..', 'assets', 'sounds', 'applause.wav');
const outputOgg = path.join(__dirname, '..', 'assets', 'sounds', 'applause.ogg');

const targets = [
  path.join(__dirname, '..', 'assets', 'sounds'),
  path.join(__dirname, '..', 'www', 'assets', 'sounds'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'sounds')
];

console.log('Processing authentic crowd applause...');
const filter = 'afade=t=in:ss=0:d=0.08,afade=t=out:st=2.4:d=0.7,volume=2.2';
execSync(`ffmpeg -y -ss 1.2 -t 3.1 -i "${inputOgg}" -af "${filter}" -ac 2 -ar 44100 "${outputWav}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -i "${outputWav}" -c:a libvorbis -q:a 6 "${outputOgg}"`, { stdio: 'inherit' });

console.log(`Generated: ${outputWav} (${fs.statSync(outputWav).size} bytes)`);
console.log(`Generated: ${outputOgg} (${fs.statSync(outputOgg).size} bytes)`);

for (const dir of targets) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(outputWav, path.join(dir, 'applause.wav'));
  fs.copyFileSync(outputOgg, path.join(dir, 'applause.ogg'));
  console.log('Synced to', dir);
}
console.log('Authentic crowd applause successfully deployed!');
