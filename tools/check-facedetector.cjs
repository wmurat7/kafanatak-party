const http = require('http');
const { execSync } = require('child_process');

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
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression: 'typeof window.FaceDetector', returnByValue: true }
        }));

        ws.onmessage = (msg) => {
          const res = JSON.parse(msg.data);
          console.log('FaceDetector type:', res.result?.result?.value);
          ws.close();
          process.exit(0);
        };
      };
    });
  });
}

main();
