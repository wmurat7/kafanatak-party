const http = require('http');
const { execSync } = require('child_process');

const adbPath = 'C:\\Users\\murat\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('1. Checking sockets & forward...');
  try {
    const sockets = execSync(`"${adbPath}" shell cat /proc/net/unix`).toString();
    const match = sockets.match(/webview_devtools_remote_(\d+)/);
    if (match) {
      execSync(`"${adbPath}" forward tcp:9222 localabstract:${match[0]}`);
      console.log('Forwarded to', match[0]);
    }
  } catch (e) {}

  http.get('http://127.0.0.1:9222/json', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', async () => {
      const list = JSON.parse(body);
      const target = list.find(t => t.type === 'page' || t.webSocketDebuggerUrl);
      if (!target) {
        console.error('Hedef sayfa yok:', list);
        process.exit(1);
      }

      const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);
      let curId = 1;

      const evalJs = (expr) => {
        return new Promise(resolve => {
          const reqId = curId++;
          const handler = (evt) => {
            const data = JSON.parse(evt.data);
            if (data.id === reqId) {
              ws.removeEventListener('message', handler);
              resolve(data.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id: reqId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
        });
      };

      ws.onopen = async () => {
        console.log('CDP WebSocket bağlı.');

        // 1. ŞİŞE ÇEVİRMECE TESTİ
        console.log('--- TEST 1: ŞİŞE ÇEVİRMECE ---');
        await evalJs(`window.gameApp.showScreen('bottle'); window.gameApp.bottleEngine.renderScreen();`);
        await sleep(1000);
        execSync(`"${adbPath}" exec-out screencap -p > test_live_bottle.png`);
        console.log('✓ test_live_bottle.png kaydedildi');

        // 2. GÜLMEME MEYDANI TESTİ
        console.log('--- TEST 2: GÜLMEME MEYDANI ---');
        await evalJs(`window.gameApp.showScreen('gulmeme-meydani'); window.gameApp.gulmemeEngine.init();`);
        await sleep(1000);
        execSync(`"${adbPath}" exec-out screencap -p > test_live_gulmeme.png`);
        console.log('✓ test_live_gulmeme.png kaydedildi');

        // 3. PASSAPAROLA QR KOD TESTİ
        console.log('--- TEST 3: PASSAPAROLA QR ---');
        await evalJs(`
          window.gameApp.showScreen('passaparola');
          window.gameApp.passaparolaEngine.init();
          window.gameApp.passaparolaEngine.createWifiRoom();
        `);
        await sleep(1200);
        execSync(`"${adbPath}" exec-out screencap -p > test_live_passaparola_qr.png`);
        console.log('✓ test_live_passaparola_qr.png kaydedildi');

        // 4. DONANIM GERİ TUŞU TESTİ
        console.log('--- TEST 4: DONANIM GERİ TUŞU ---');
        const s1 = await evalJs(`document.querySelector('.screen.active')?.id`);
        console.log('Geri basılmadan önce ekran:', s1?.result?.value);

        // Native donanım tuşu gönder (Keyevent 4 = BACK)
        execSync(`"${adbPath}" shell input keyevent 4`);
        await sleep(700);
        const s2 = await evalJs(`document.querySelector('.screen.active')?.id`);
        console.log('1. Donanım geri tuşu sonrası ekran (partyGames olmalı):', s2?.result?.value);

        execSync(`"${adbPath}" shell input keyevent 4`);
        await sleep(700);
        const s3 = await evalJs(`document.querySelector('.screen.active')?.id`);
        console.log('2. Donanım geri tuşu sonrası ekran (screen-home olmalı):', s3?.result?.value);

        execSync(`"${adbPath}" exec-out screencap -p > test_live_back_home.png`);
        console.log('✓ test_live_back_home.png kaydedildi');

        ws.close();
        process.exit(0);
      };
    });
  });
}

main();
