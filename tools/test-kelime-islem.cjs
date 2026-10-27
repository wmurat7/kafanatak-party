const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
  const sockets = execSync(`"${adbPath}" shell cat /proc/net/unix`).toString();
  const match = sockets.match(/webview_devtools_remote_(\d+)/);
  if (!match) return;
  execSync(`"${adbPath}" forward tcp:9222 localabstract:${match[0]}`);

  http.get('http://127.0.0.1:9222/json', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const list = JSON.parse(body);
      const target = list.find(t => t.type === 'page' || t.webSocketDebuggerUrl);
      const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

      ws.onopen = () => {
        // Kelime etabını otomatik dağıt ve kelime türet
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                window.gameApp.showScreen('kelimeIslem');
                window.gameApp.kelimeIslemEngine.setMode('kelime');
                window.gameApp.kelimeIslemEngine.startNewGame();
                window.gameApp.kelimeIslemEngine.drawAutoLetters();
                // 2-3 harf seçerek kelime oluştur
                if (window.gameApp.kelimeIslemEngine.letters.length >= 3) {
                  window.gameApp.kelimeIslemEngine.toggleLetterInWord(0);
                  window.gameApp.kelimeIslemEngine.toggleLetterInWord(1);
                  window.gameApp.kelimeIslemEngine.toggleLetterInWord(2);
                }
                return {
                  letters: window.gameApp.kelimeIslemEngine.letters,
                  currentWord: window.gameApp.kelimeIslemEngine.currentWord,
                  compBest: window.gameApp.kelimeIslemEngine.computerBestWord
                };
              })()
            `,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === 1) {
          console.log('Kelime Etabı Bilgileri:', data.result.value);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 2) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_kelime_game.png', buf);
          console.log('Kelime Ekranı Kaydedildi: test_live_kelime_game.png');
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
