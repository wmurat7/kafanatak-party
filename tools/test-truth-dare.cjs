const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
  execSync(`"${adbPath}" shell am start -n com.kafanatak.party/com.kafanatak.party.MainActivity`);
  await new Promise(r => setTimeout(r, 1200));

  const sockets = execSync(`"${adbPath}" shell cat /proc/net/unix`).toString();
  const match = sockets.match(/webview_devtools_remote_(\d+)/);
  if (!match) {
    console.error('Socket bulunamadı');
    return;
  }
  execSync(`"${adbPath}" forward tcp:9222 localabstract:${match[0]}`);

  http.get('http://127.0.0.1:9222/json', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const list = JSON.parse(body);
      const target = list.find(t => t.type === 'page' || t.webSocketDebuggerUrl);
      const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

      ws.onopen = () => {
        // Ekranı aç, doğruluk kartını göster ve farklı seçenek butonunu test et
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                window.gameApp.showScreen('bottle');
                if (window.gameApp.bottleEngine) {
                  window.gameApp.bottleEngine.renderScreen();
                  window.gameApp.bottleEngine.showCard('truth');
                }
                const poolStats = {
                  partyTruth: window.gameApp.bottleEngine.decks.partyTruth.deck.length,
                  partyDare: window.gameApp.bottleEngine.decks.partyDare.deck.length,
                  adultTruth: window.gameApp.bottleEngine.decks.adultTruth.deck.length,
                  adultDare: window.gameApp.bottleEngine.decks.adultDare.deck.length,
                  currentText: document.getElementById('bottle-card-text')?.innerText
                };
                return poolStats;
              })()
            `,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === 1) {
          console.log('Havuz İstatistikleri:', JSON.stringify(data.result.value, null, 2));
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 2) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_truth_card.png', buf);
          console.log('Canlı Kart Ekran Görüntüsü Kaydedildi: test_live_truth_card.png');
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
