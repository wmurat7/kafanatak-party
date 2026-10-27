const http = require('http');
const { execSync } = require('child_process');
const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';
execSync(`"${adbPath}" forward tcp:9222 localabstract:webview_devtools_remote_19085`);

http.get('http://127.0.0.1:9222/json', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const targets = JSON.parse(body);
    const t = targets.find(x => x.type === 'page');
    const ws = new globalThis.WebSocket(t.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: "window.gameApp.showScreen('isim-sehir'); window.scrollTo(0,0);" }
      }));
      setTimeout(() => {
        execSync(`"${adbPath}" exec-out screencap -p > test_isim_top_view.png`);
        ws.close();
      }, 700);
    };
  });
});
