const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
  execSync(`"${adbPath}" shell am start -n com.kafanatak.party/com.kafanatak.party.MainActivity`);
  await new Promise(r => setTimeout(r, 3500)); // WebView ve ESM yüklemesini bekle

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
        // Aileler Yarışıyor ekranını aç ve lobi durumunu çek
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                if (!window.gameApp) return { error: 'gameApp not loaded yet' };
                window.gameApp.showScreen('ailelerYarisiyor');
                if (window.gameApp.ailelerYarisiyorEngine) {
                  window.gameApp.ailelerYarisiyorEngine.init();
                }
                return {
                  hasEngine: !!window.gameApp.ailelerYarisiyorEngine,
                  screenActive: window.gameApp.screens.ailelerYarisiyor?.classList.contains('active')
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
          console.log('Aileler Yarışıyor Açıldı:', data.result.value);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 2) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_ay_setup.png', buf);
          console.log('Lobi Ekranı Kaydedildi: test_live_ay_setup.png');

          // Şimdi oyunu başlat ve 1. tura geç (Faceoff kazanıp panoyu aç)
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  window.gameApp.ailelerYarisiyorEngine.startNewGame();
                  window.gameApp.ailelerYarisiyorEngine.winFaceoff('red', true);
                  // 1. cevabı doğru bil
                  window.gameApp.ailelerYarisiyorEngine.revealAnswer(0);
                  // 1 tane de çarpı ekle
                  window.gameApp.ailelerYarisiyorEngine.addStrike();
                  return {
                    question: window.gameApp.ailelerYarisiyorEngine.currentQuestion.question,
                    bank: window.gameApp.ailelerYarisiyorEngine.bankPoints,
                    strikes: window.gameApp.ailelerYarisiyorEngine.strikes
                  };
                })()
              `,
              returnByValue: true
            }
          }));
        } else if (data.id === 3) {
          console.log('Pano Durumu:', JSON.stringify(data.result.value, null, 2));
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 4,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 4) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_ay_board.png', buf);
          console.log('Pano Ekranı Kaydedildi: test_live_ay_board.png');
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
