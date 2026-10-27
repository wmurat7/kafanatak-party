const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
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
        // Navigate to gulmeme
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                window.gameApp.showScreen('gulmeme-meydani');
                if (window.gameApp.gulmemeEngine) {
                  window.gameApp.gulmemeEngine.init();
                }
                return true;
              })()
            `,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === 1) {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 1200);
        } else if (data.id === 2) {
          const buffer = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_gulmeme_v2.png', buffer);
          console.log('Ekran görüntüsü kaydedildi: test_live_gulmeme_v2.png');
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
