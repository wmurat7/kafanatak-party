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
        // 1. Kelime İşlem Aç ve Çoklu Telefonu Aktif Et
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              try {
                window.gameApp.showScreen('kelimeIslem');
                window.gameApp.kelimeIslemEngine.init();
                window.gameApp.kelimeIslemEngine.toggleMultiDevice();
                JSON.stringify({
                  stage: window.gameApp.kelimeIslemEngine.stage,
                  roomId: window.gameApp.kelimeIslemEngine.roomId,
                  isMulti: window.gameApp.kelimeIslemEngine.isMultiDevice
                });
              } catch (e) {
                JSON.stringify({ error: e.message });
              }
            `,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === 1) {
          console.log('1. Kelime İşlem Açıldı:', data.result);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 2) {
          fs.writeFileSync('test_live_ki_multi_qr.png', Buffer.from(data.result.data, 'base64'));
          console.log('📸 test_live_ki_multi_qr.png kaydedildi');

          // 2. Hardware Back Test: Kelime İşlem'den Parti Arenası'na dönmeli
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                try {
                  window.gameApp.handleHardwareBack();
                  JSON.stringify({
                    currentScreen: document.querySelector('.screen.active')?.id,
                    isPartyActive: window.gameApp.screens.partyGames.classList.contains('active')
                  });
                } catch (e) {
                  JSON.stringify({ error: e.message });
                }
              `,
              returnByValue: true
            }
          }));
        } else if (data.id === 3) {
          console.log('2. Kelime İşlem Back Tuşu Test Sonucu:', data.result);

          // 3. Aileler Yarışıyor Aç ve Çoklu Telefonu Aktif Et
          ws.send(JSON.stringify({
            id: 4,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                try {
                  window.gameApp.showScreen('ailelerYarisiyor');
                  window.gameApp.ailelerYarisiyorEngine.init();
                  window.gameApp.ailelerYarisiyorEngine.toggleMultiDevice();
                  JSON.stringify({
                    stage: window.gameApp.ailelerYarisiyorEngine.stage,
                    roomId: window.gameApp.ailelerYarisiyorEngine.roomId,
                    isMulti: window.gameApp.ailelerYarisiyorEngine.isMultiDevice
                  });
                } catch (e) {
                  JSON.stringify({ error: e.message });
                }
              `,
              returnByValue: true
            }
          }));
        } else if (data.id === 4) {
          console.log('3. Aileler Yarışıyor Açıldı:', data.result);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 5,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 5) {
          fs.writeFileSync('test_live_ay_multi_qr.png', Buffer.from(data.result.data, 'base64'));
          console.log('📸 test_live_ay_multi_qr.png kaydedildi');

          // 4. Hardware Back Test: Aileler Yarışıyor'dan Parti Arenası'na dönmeli
          ws.send(JSON.stringify({
            id: 6,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                try {
                  window.gameApp.handleHardwareBack();
                  JSON.stringify({
                    currentScreen: document.querySelector('.screen.active')?.id,
                    isPartyActive: window.gameApp.screens.partyGames.classList.contains('active')
                  });
                } catch (e) {
                  JSON.stringify({ error: e.message });
                }
              `,
              returnByValue: true
            }
          }));
        } else if (data.id === 6) {
          console.log('4. Aileler Yarışıyor Back Tuşu Test Sonucu:', data.result);
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
