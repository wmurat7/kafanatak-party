const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('--- ALL SCREENS IN INDEX.HTML ---');
lines.forEach((l, i) => {
  if (l.includes('id="screen-')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});
