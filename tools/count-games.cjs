const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="party-game-card"[\s\S]*?<h3[^>]*>(.*?)<\/h3>[\s\S]*?(id="btn-open-[^"]+")/g;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null) {
  count++;
  console.log(`${count}. ${m[1].trim()} (${m[2]})`);
}
console.log('TOTAL PARTY GAMES FOUND:', count);
