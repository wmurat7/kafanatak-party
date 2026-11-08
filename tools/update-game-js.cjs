const fs = require('fs');

let c = fs.readFileSync('js/game.js', 'utf8');

if (!c.includes('in-app-scanner.js')) {
  c = c.replace(
    "import { contentSync } from './content-sync.js';",
    "import { contentSync } from './content-sync.js';\nimport { inAppScanner } from './in-app-scanner.js';"
  );
  c = c.replace(
    'contentSync.loadCachedPacks();',
    'contentSync.loadCachedPacks();\n    try { inAppScanner.init(); } catch (e) {}'
  );
  c = c.replace(
    'this.bottleEngine = new BottleGameEngine(this);',
    'this.bottleEngine = new BottleGameEngine(this);\n    if (this.bombEngine.bindSetup) this.bombEngine.bindSetup();\n    if (this.bottleEngine.bindSetup) this.bottleEngine.bindSetup();'
  );
  fs.writeFileSync('js/game.js', c, 'utf8');
  console.log('js/game.js updated with inAppScanner and setup bindings!');
} else {
  console.log('js/game.js already has inAppScanner');
}

