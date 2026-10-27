const http = require('http');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          resolve(list[0].webSocketDebuggerUrl);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function evalInApp(expression) {
  const wsUrl = await getWsUrl();
  const ws = new globalThis.WebSocket(wsUrl);

  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true }
      }));
    };

    ws.onmessage = (event) => {
      const resp = JSON.parse(event.data);
      if (resp.id === 1) {
        ws.close();
        resolve(resp.result);
      }
    };

    ws.onerror = reject;
  });
}

const codeToRun = process.argv[2] || 'document.title';
evalInApp(codeToRun)
  .then(res => console.log('RESULT:', JSON.stringify(res)))
  .catch(err => console.error('ERR:', err.message));
