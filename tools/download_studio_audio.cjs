const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const sounds = {
  'correct.ogg': 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg',
  'pass.ogg': 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
  'slide.ogg': 'https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg',
  'tick.ogg': 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
  'countdown.ogg': 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  'bell.ogg': 'https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg',
  'triangle.ogg': 'https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg',
  'applause.ogg': 'https://actions.google.com/sounds/v1/crowds/female_crowd_celebration.ogg',
  'cheer.ogg': 'https://actions.google.com/sounds/v1/crowds/team_cheer.ogg',
  'drumroll.ogg': 'https://actions.google.com/sounds/v1/cartoon/drum_roll.ogg',
  'horn.ogg': 'https://actions.google.com/sounds/v1/transportation/car_horn.ogg',
  'clown_horn.ogg': 'https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg'
};

async function downloadAll() {
  console.log('Downloading studio sound files into assets/sounds/ ...');
  for (const [filename, url] of Object.entries(sounds)) {
    const dest = path.join(soundsDir, filename);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed ${filename}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`✓ ${filename} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${filename}:`, e.message);
    }
  }
  console.log('All downloads completed!');
}

downloadAll();
