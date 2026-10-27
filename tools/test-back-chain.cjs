const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const list = JSON.parse(body);
    const target = list.find(t => t.type === 'page');
    const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

    ws.onopen = () => {
      const code = `
        (() => {
          window.gameApp.showScreen('passaparola');
          const step1 = document.querySelector('.screen.active')?.id;
          window.gameApp.handleHardwareBack();
          const step2 = document.querySelector('.screen.active')?.id;
          window.gameApp.handleHardwareBack();
          const step3 = document.querySelector('.screen.active')?.id;
          return { step1, step2, step3 };
        })()
      `;

      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: code, returnByValue: true }
      }));

      ws.onmessage = (msg) => {
        const res = JSON.parse(msg.data);
        console.log('SONUÇ:', res.result?.result?.value);
        ws.close();
      };
    };
  });
});
