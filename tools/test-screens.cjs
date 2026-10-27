const http = require('http');
const { execSync } = require('child_process');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

async function main() {
  console.log('1. Forwarding port 9222...');
  try {
    const sockets = execSync(`"${adbPath}" shell cat /proc/net/unix`).toString();
    const match = sockets.match(/webview_devtools_remote_(\d+)/);
    if (!match) return;
    const socketName = match[0];
    execSync(`"${adbPath}" forward tcp:9222 localabstract:${socketName}`);
  } catch (e) {
    console.error('Forward hatası:', e.message);
  }

  http.get('http://127.0.0.1:9222/json', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const targets = JSON.parse(body);
        const webview = targets.find(t => t.type === 'page' || t.webSocketDebuggerUrl);
        if (!webview) return;

        const ws = new globalThis.WebSocket(webview.webSocketDebuggerUrl);
        ws.onopen = () => {
          let id = 1;
          const send = (expr) => ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));

          // 1. Şarkı Düellosu Çoklu Modunu Aç
          send("window.gameApp.showScreen('sarki-duello'); if (window.gameApp.sarkiDuelloEngine) { window.gameApp.sarkiDuelloEngine.init(); window.gameApp.sarkiDuelloEngine.setMode('wifi'); }");

          setTimeout(() => {
            console.log('📸 Ekran görüntüsü alınıyor: test_sarki_multi_live.png');
            execSync(`"${adbPath}" exec-out screencap -p > test_sarki_multi_live.png`);

            // 2. Vampir Köylü Çoklu Modunu Aç (hubSelect kapat, multiContainer aç, renderWifiSetupScreen çağır)
            send("window.gameApp.showScreen('vampire'); document.getElementById('vampire-hub-select').style.display='none'; document.getElementById('vampire-multi-container').style.display='block'; window.gameApp.vampireEngine.renderWifiSetupScreen();");

            setTimeout(() => {
              console.log('📸 Ekran görüntüsü alınıyor: test_vampire_multi_live.png');
              execSync(`"${adbPath}" exec-out screencap -p > test_vampire_multi_live.png`);
              ws.close();
              process.exit(0);
            }, 1500);
          }, 1500);
        };
      } catch (err) {
        console.error('Hata:', err.message);
      }
    });
  });
}

main();
