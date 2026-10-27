const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/murat/.gemini/antigravity-ide/brain/6f6a58c7-996d-4086-9d8b-97aff00caa47/.system_generated/logs/transcript_full.jsonl')
});

let count = 0;
rl.on('line', (line) => {
  count++;
  if (count === 8487) {
    try {
      const obj = JSON.parse(line);
      const text = obj.content;
      const start = text.indexOf('<main id="screen-home"');
      const end = text.indexOf('</main>', start);
      if (start !== -1 && end !== -1) {
        fs.writeFileSync('tools/original_screen_home.html', text.substring(start, end + 7), 'utf8');
        console.log('Saved original_screen_home.html successfully!');
      } else {
        console.log('Could not find tags:', start, end);
      }
    } catch (e) {
      console.error(e);
    }
  }
});
