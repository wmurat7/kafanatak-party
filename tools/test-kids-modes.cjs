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
        // Test Passaparola Kids
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                window.gameApp.showScreen('passaparola');
                if (window.gameApp.passaparolaEngine) {
                  window.gameApp.passaparolaEngine.init();
                  window.gameApp.passaparolaEngine.setCategoryMode('kids');
                }
                return {
                  catMode: window.gameApp.passaparolaEngine?.categoryMode,
                  qA: window.gameApp.passaparolaEngine?.currentQuestions['A']
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
          console.log('Passaparola Kids Mode Test:', data.result?.result?.value);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 2) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_passa_kids.png', buf);
          console.log('Passaparola Kids Screenshot: test_live_passa_kids.png');

          // Now test Carkifelek Kids
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  window.gameApp.showScreen('carkifelek');
                  if (window.gameApp.carkifelekEngine) {
                    window.gameApp.carkifelekEngine.init();
                    window.gameApp.carkifelekEngine.setCategoryMode('kids');
                  }
                  return {
                    catMode: window.gameApp.carkifelekEngine?.categoryMode,
                    puzzle: window.gameApp.carkifelekEngine?.currentPuzzle
                  };
                })()
              `,
              returnByValue: true
            }
          }));
        } else if (data.id === 3) {
          console.log('Carkifelek Kids Mode Test:', data.result?.result?.value);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 4,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 800);
        } else if (data.id === 4) {
          const buf = Buffer.from(data.result.data, 'base64');
          fs.writeFileSync('test_live_cark_kids.png', buf);
          console.log('Carkifelek Kids Screenshot: test_live_cark_kids.png');
          ws.close();
          process.exit(0);
        }
      };
    });
  });
}

main();
