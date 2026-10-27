const fs = require('fs');

async function run() {
  const r = await fetch('https://mixkit.co/free-sound-effects/clapping/');
  const html = await r.text();
  
  // Find cards
  const cardRegex = /data-audio-player-preview-url-value="([^"]+)"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    console.log(title, '-->', url);
  }

  // Also check applause page
  const r2 = await fetch('https://mixkit.co/free-sound-effects/applause/');
  const html2 = await r2.text();
  let match2;
  while ((match2 = cardRegex.exec(html2)) !== null) {
    const url = match2[1];
    const title = match2[2].replace(/<[^>]+>/g, '').trim();
    console.log('[Applause]', title, '-->', url);
  }
}
run();
