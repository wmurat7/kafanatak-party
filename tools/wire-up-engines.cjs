const fs = require('fs');

// 1. CARKIFELEK-GAME.JS
if (fs.existsSync('js/carkifelek-game.js')) {
  let c = fs.readFileSync('js/carkifelek-game.js', 'utf8');
  // Wire up copy and mod buttons in createWifiRoom
  if (!c.includes('btn-copy-cark-link')) {
    const target = 'const joinUrl = firebaseNetwork.getCarkifelekUrl(this.roomId);';
    const addition = `
    const btnCopy = document.getElementById('btn-copy-cark-link');
    if (btnCopy) {
      btnCopy.onclick = async () => {
        sounds.playClick();
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(joinUrl);
          btnCopy.textContent = '✅ Kopyalandı!';
          setTimeout(() => { if (btnCopy) btnCopy.textContent = '📋 Bağlantıyı Kopyala'; }, 2000);
        } else {
          prompt('Çarkıfelek Bağlantısı:', joinUrl);
        }
      };
    }
    const btnMod = document.getElementById('btn-cark-mod-open');
    if (btnMod) {
      btnMod.onclick = (e) => {
        e.stopPropagation();
        sounds.playClick();
        HostModerationPanel.open({
          namespace: 'carkifelek',
          roomId: this.roomId || 'CARK',
          title: 'Çarkıfelek Yarışma Masası'
        });
      };
    }
    `;
    c = c.replace(target, target + addition);
  }
  // Change QR color to black-on-white for highest camera scanning reliability
  c = c.replace(
    /color:\s*\{\s*dark:\s*['"]#00F5D4['"],\s*light:\s*['"]#0B0E14['"]\s*\}/g,
    "color: { dark: '#000000', light: '#FFFFFF' }"
  );
  fs.writeFileSync('js/carkifelek-game.js', c, 'utf8');
  console.log('js/carkifelek-game.js updated!');
}

// 2. BOMB-GAME.JS
if (fs.existsSync('js/bomb-game.js')) {
  let c = fs.readFileSync('js/bomb-game.js', 'utf8');
  if (!c.includes('PartyMultiDeviceHelper')) {
    c = `import { PartyMultiDeviceHelper } from './party-multi-device.js';\n` + c;
    c = c.replace(
      'this.passCount = 0;',
      `this.passCount = 0;
    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'bomb',
      title: 'Saatli Bomba Masası',
      subtitle: '☁️ Bomba telefonlar arasında canlı elden ele geçer, patlayan elenir!',
      prefix: 'bomb'
    });`
    );
    // In startRound, sync with Firebase
    c = c.replace(
      'sounds.startBombTicking();',
      `sounds.startBombTicking();
    if (this.multiHelper) {
      this.multiHelper.updateRoomState({
        phase: 'running',
        prompt: this.currentPrompt,
        currentHolderName: 'Ana Ekran (Masa)',
        exploded: false
      });
    }`
    );
    // In explodeBomb, sync with Firebase
    c = c.replace(
      'sounds.playBombExplode();',
      `sounds.playBombExplode();
    if (this.multiHelper) {
      this.multiHelper.updateRoomState({
        phase: 'exploded',
        exploded: true,
        explodedPlayerName: 'Son Oyuncu'
      });
    }`
    );
    // Add bindSetupEvents
    c = c.replace(
      'export class BombGameEngine {',
      `export class BombGameEngine {
  bindSetup() {
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[BombGame] Mod değişti:', mode);
      });
    }
  }`
    );
  }
  fs.writeFileSync('js/bomb-game.js', c, 'utf8');
  console.log('js/bomb-game.js updated!');
}

// 3. BOTTLE-GAME.JS
if (fs.existsSync('js/bottle-game.js')) {
  let c = fs.readFileSync('js/bottle-game.js', 'utf8');
  if (!c.includes('PartyMultiDeviceHelper')) {
    c = `import { PartyMultiDeviceHelper } from './party-multi-device.js';\n` + c;
    c = c.replace(
      'this.isSpinning = false;',
      `this.isSpinning = false;
    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'bottle',
      title: 'Şişe Çevirmece Masası',
      subtitle: '☁️ Şişe ve görevler herkesin telefonuna anında düşer, cesaret oylanır!',
      prefix: 'bottle'
    });`
    );
    // Add bindSetup
    c = c.replace(
      'export class BottleGameEngine {',
      `export class BottleGameEngine {
  bindSetup() {
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[BottleGame] Mod değişti:', mode);
      });
    }
  }`
    );
  }
  fs.writeFileSync('js/bottle-game.js', c, 'utf8');
  console.log('js/bottle-game.js updated!');
}

// 4. KELIME-BOMBASI.JS
if (fs.existsSync('js/kelime-bombasi.js')) {
  let c = fs.readFileSync('js/kelime-bombasi.js', 'utf8');
  if (!c.includes('PartyMultiDeviceHelper')) {
    c = `import { PartyMultiDeviceHelper } from './party-multi-device.js';\n` + c;
    c = c.replace(
      'this.isExploded = false;',
      `this.isExploded = false;
    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'kelimebombasi',
      title: 'Kelime Bombası Masası',
      subtitle: '☁️ Harf ve kategori canlı akar, kelimeyi bilen zili çalar!',
      prefix: 'kelime'
    });`
    );
    // In bindEvents, bind helper events
    c = c.replace(
      'this.bindEvents();',
      `this.bindEvents();
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[KelimeBombasi] Mod değişti:', mode);
      });
    }`
    );
    // In newRound, update room
    c = c.replace(
      'this.renderActiveStage();',
      `this.renderActiveStage();
    if (this.multiHelper) {
      this.multiHelper.updateRoomState({
        category: this.category,
        letter: this.letter,
        phase: 'running'
      });
    }`
    );
  }
  fs.writeFileSync('js/kelime-bombasi.js', c, 'utf8');
  console.log('js/kelime-bombasi.js updated!');
}

// 5. TERS-SES-GAME.JS
if (fs.existsSync('js/ters-ses-game.js')) {
  let c = fs.readFileSync('js/ters-ses-game.js', 'utf8');
  if (!c.includes('PartyMultiDeviceHelper')) {
    c = `import { PartyMultiDeviceHelper } from './party-multi-device.js';\n` + c;
    c = c.replace(
      'this.lastRecordedBuffer = null;',
      `this.lastRecordedBuffer = null;
    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'tersses',
      title: 'Ters Ses (Geri Vites) Masası',
      subtitle: '☁️ Ters ses herkesin telefonunda canlı çalar, cevabı bilen zili çalar!',
      prefix: 'ters'
    });`
    );
    // Inject multiHelper HTML above mode tabs in renderUI
    const targetTabs = '<!-- Mod Seçici Sekmeler -->';
    const multiBoxHtml = `
        <!-- Çoklu Cihaz / Wi-Fi Kutusu -->
        <div id="ters-multidevice-wrap" style="margin-bottom:6px;">
          \${this.multiHelper ? this.multiHelper.renderSetupHTML() : ''}
        </div>
        ` + targetTabs;
    c = c.replace(targetTabs, multiBoxHtml);

    // In renderUI after innerHTML, bind helper events
    const targetBind = 'this.bindEvents();';
    const bindMulti = `
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[TersSes] Mod değişti:', mode);
      });
    }
    ` + targetBind;
    c = c.replace(targetBind, bindMulti);

    // In loadWord, update room state
    c = c.replace(
      'this.updateCardWord();',
      `this.updateCardWord();
    if (this.multiHelper) {
      this.multiHelper.updateRoomState({
        round: this.roundNumber,
        totalRounds: this.totalRounds,
        activeMode: this.activeMode
      });
    }`
    );
  }
  fs.writeFileSync('js/ters-ses-game.js', c, 'utf8');
  console.log('js/ters-ses-game.js updated!');
}

console.log('Engine wiring complete!');

