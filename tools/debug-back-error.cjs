const http = require('http');
const { execSync } = require('child_process');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
  const sockets = execSync(`"${adbPath}" shell cat /proc/net/unix`).toString();
  const match = sockets.match(/webview_devtools_remote_(\d+)/);
  if (match) execSync(`"${adbPath}" forward tcp:9222 localabstract:${match[0]}`);

  http.get('http://127.0.0.1:9222/json', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const list = JSON.parse(body);
      const target = list.find(t => t.type === 'page' || t.webSocketDebuggerUrl);
      const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

      ws.onopen = () => {
        const code = `
          (() => {
            try {
              const debugLogs = [];
              const activeScreen = document.querySelector('.screen.active');
              debugLogs.push('Başlangıç aktif ekran: ' + (activeScreen ? activeScreen.id : 'yok'));

              // handleHardwareBack çağır
              window.gameApp.handleHardwareBack();

              const afterScreen = document.querySelector('.screen.active');
              debugLogs.push('Sonraki aktif ekran: ' + (afterScreen ? afterScreen.id : 'yok'));

              return { success: true, logs: debugLogs };
            } catch (err) {
              return { success: false, error: err.message, stack: err.stack };
            }
          })()
        `;

        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression: code, returnByValue: true }
        }));

        ws.onmessage = (msg) => {
          const res = JSON.parse(msg.data);
          console.log('RESULT:', JSON.stringify(res.result?.result?.value, null, 2));
          ws.close();
          process.exit(0);
        };
      };
    });
  });
}

main();
