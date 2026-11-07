const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// 1. Add imports at the top
const importAnchor = "import { HostModerationPanel } from './host-moderation-panel.js';";
const newImports = `import { HostModerationPanel } from './host-moderation-panel.js';\r\nimport { TersSesEngine } from './ters-ses-game.js';\r\nimport { contentSync } from './content-sync.js';`;

if (code.includes(importAnchor)) {
  code = code.replace(importAnchor, newImports);
  console.log('1. Imports added.');
} else {
  console.error('1. importAnchor not found');
}

// 2. In constructor, add loadCachedPacks and listener
const ctorAnchor = "this.categories = [...CATEGORIES];";
const newCtor = `contentSync.loadCachedPacks();\r\n    this.categories = [...CATEGORIES];\r\n    window.addEventListener('kafanatak-content-updated', () => {\r\n      this.categories = [...CATEGORIES];\r\n      this.loadCustomDecks();\r\n      if (typeof this.renderCategoryGrid === 'function') this.renderCategoryGrid();\r\n    });`;

if (code.includes(ctorAnchor)) {
  code = code.replace(ctorAnchor, newCtor);
  console.log('2. Constructor updated with contentSync.');
} else {
  console.error('2. ctorAnchor not found');
}

// 3. In this.screens, add tersSes
const screensAnchor = "ailelerYarisiyor: document.getElementById('screen-aileler-yarisiyor'),\r\n      'aileler-yarisiyor': document.getElementById('screen-aileler-yarisiyor')";
const screensAnchorLF = "ailelerYarisiyor: document.getElementById('screen-aileler-yarisiyor'),\n      'aileler-yarisiyor': document.getElementById('screen-aileler-yarisiyor')";
const newScreensCRLF = `ailelerYarisiyor: document.getElementById('screen-aileler-yarisiyor'),\r\n      'aileler-yarisiyor': document.getElementById('screen-aileler-yarisiyor'),\r\n      tersSes: document.getElementById('screen-ters-ses'),\r\n      'ters-ses': document.getElementById('screen-ters-ses')`;
const newScreensLF = `ailelerYarisiyor: document.getElementById('screen-aileler-yarisiyor'),\n      'aileler-yarisiyor': document.getElementById('screen-aileler-yarisiyor'),\n      tersSes: document.getElementById('screen-ters-ses'),\n      'ters-ses': document.getElementById('screen-ters-ses')`;

if (code.includes(screensAnchor)) {
  code = code.replace(screensAnchor, newScreensCRLF);
  console.log('3. screens updated (CRLF).');
} else if (code.includes(screensAnchorLF)) {
  code = code.replace(screensAnchorLF, newScreensLF);
  console.log('3. screens updated (LF).');
} else {
  console.error('3. screensAnchor not found');
}

// 4. Update toast message
code = code.replace("'🎭 Parti Arenası açıldı: 9 Efsane Oyun'", "'🎭 Parti Arenası açıldı: 10 Efsane Oyun'");
console.log('4. Toast updated to 10 Efsane Oyun.');

// 5. In initUI / game setup, initialize tersSesEngine and button
const engineAnchor = "this.ailelerYarisiyorEngine = new AilelerYarisiyorEngine(this);";
const newEngineCode = `this.ailelerYarisiyorEngine = new AilelerYarisiyorEngine(this);\r\n\r\n    // =========================================\r\n    // 10. TERS SES (GERİ VİTES)\r\n    // =========================================\r\n    this.tersSesEngine = new TersSesEngine(this);\r\n    const btnOpenTersSes = document.getElementById('btn-open-ters-ses-game');\r\n    if (btnOpenTersSes) {\r\n      btnOpenTersSes.addEventListener('click', () => {\r\n        sounds.playClick();\r\n        this.showScreen('tersSes');\r\n        this.tersSesEngine.init();\r\n        window.scrollTo({ top: 0, behavior: 'smooth' });\r\n      });\r\n    }`;

if (code.includes(engineAnchor)) {
  code = code.replace(engineAnchor, newEngineCode);
  console.log('5. tersSesEngine initialized.');
} else {
  console.error('5. engineAnchor not found');
}

// 6. Arka planda Firebase senkronizasyonu başlat
const endAnchor = "unlockAllAudio();";
const newEnd = `unlockAllAudio();\r\n  try {\r\n    setTimeout(() => {\r\n      contentSync.checkAndSync().catch(() => {});\r\n    }, 1200);\r\n  } catch (e) {}`;

if (code.includes(endAnchor)) {
  code = code.replace(endAnchor, newEnd);
  console.log('6. contentSync background sync wired.');
} else {
  console.error('6. endAnchor not found');
}

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('js/game.js successfully patched!');
