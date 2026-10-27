// js/bomb-game.js
// Kafana Tak! - Saatli Bomba (Tick Tack Boom / Kelime Bombası) Parti Oyunu

import { sounds } from './audio.js';

export const BOMB_PROMPTS = [
  "İçinde 'KAP' geçen bir kelime söyle!",
  "A harfiyle başlayan bir meyve veya sebze!",
  "Son harfi 'K' olan bir hayvan söyle!",
  "3 heceli bir şehir veya ülke söyle!",
  "Mutfakta bulunan elektrikli bir alet!",
  "İçinde 'ŞEN' geçen bir kelime söyle!",
  "Yeşil renkli bir şey söyle!",
  "S ile başlayan 5 harfli bir kelime!",
  "Düğünde görülen bir şey veya kişi!",
  "Trafikte veya arabada olan bir şey!",
  "Okulda veya sınıfta bulunan bir eşya!",
  "İçinde 'BAŞ' geçen bir kelime veya deyim!",
  "Deniz veya plajla ilgili bir şey!",
  "Kış mevsimiyle ilgili bir kelime!",
  "T ile başlayan bir meslek söyle!",
  "İçinde 'KOR' geçen bir kelime!",
  "Yatak odasında bulunan bir eşya!",
  "Piknikte yanına alacağın bir şey!",
  "Kırmızı renkli bir nesne söyle!",
  "Son harfi 'T' olan bir yemek adı!",
  "İçinde 'YAZ' geçen bir kelime!",
  "Süpermarkette satılan bir ürün!",
  "Havalimanında veya uçakta olan bir şey!",
  "Bebeklerle ilgili bir eşya veya kelime!",
  "İçinde 'EL' geçen 4 harfli bir kelime!",
  "Ç ile başlayan bir hayvan veya bitki!",
  "Futbol veya stadyumla ilgili bir şey!",
  "Televizyonda yayınlanan bir program türü!",
  "İçinde 'TAŞ' geçen bir kelime söyle!",
  "Restoranda sipariş edilen bir içecek!"
];

export const BOMB_PENALTIES = [
  "Sonraki tura kadar konuşurken her cümlenin sonuna 'Miyav' ekle!",
  "Masadakilerden birinin taklidini 30 saniye boyunca yap!",
  "En son dinlediğin şarkının nakaratını canlı söyle!",
  "Tavuk gibi kanat çırparak masanın etrafında bir tur at!",
  "Masadaki herkes hakkında samimi bir itirafta bulun!",
  "Telefonundan en son çektiğin fotoğrafı masadakilere göster!",
  "10 saniye boyunca kahkahalarla gülüyormuş gibi yap!"
];

export class BombGameEngine {
  constructor(game) {
    this.game = game;
    this.state = 'idle'; // idle, running, exploded
    this.currentPrompt = '';
    this.remainingTime = 0;
    this.totalDuration = 0;
    this.tickInterval = null;
    this.roundCount = 1;
    this.passCount = 0;
  }

  startRound() {
    this.state = 'running';
    this.passCount = 0;
    // 18 ile 38 saniye arası sürpriz gizli patlama süresi
    this.totalDuration = Math.floor(18 + Math.random() * 20);
    this.remainingTime = this.totalDuration;
    this.currentPrompt = BOMB_PROMPTS[Math.floor(Math.random() * BOMB_PROMPTS.length)];

    sounds.startPartyBeat();
    this.renderBombScreen();

    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      this.remainingTime--;

      // Hızlanan ses efekti
      sounds.playBombTick(this.remainingTime);

      if (this.remainingTime <= 0) {
        clearInterval(this.tickInterval);
        this.explodeBomb();
      } else {
        this.updateBombDisplay();
      }
    }, 1000);
  }

  passTurn() {
    if (this.state !== 'running') return;
    this.passCount++;
    sounds.playCorrect();
    // Yeni kural/soru
    this.currentPrompt = BOMB_PROMPTS[Math.floor(Math.random() * BOMB_PROMPTS.length)];
    this.updateBombDisplay();
  }

  explodeBomb() {
    this.state = 'exploded';
    sounds.stopAll();
    sounds.playBombExplosion();

    const penalty = BOMB_PENALTIES[Math.floor(Math.random() * BOMB_PENALTIES.length)];
    const container = document.getElementById('bomb-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:24px; border:2px solid #EF4444; box-shadow:0 0 40px rgba(239,68,68,0.5); animation:pulse 0.5s infinite;">
        <div style="font-size:4.5rem; margin-bottom:8px; animation:bounce 0.4s ease infinite alternate;">💥</div>
        <h2 style="font-size:2rem; font-weight:900; color:#EF4444; margin-bottom:6px;">BOOOOOM!</h2>
        <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:12px;">
          BOMBA ELİNDE PATLADI!
        </div>
        <p style="font-size:0.86rem; color:#FDA4AF; line-height:1.4; margin-bottom:16px;">
          Telefon şu an kimin elindeyse bu turu kaybetti! Ceza görevini yerine getirmek zorunda:
        </p>

        <div style="background:rgba(239,68,68,0.15); border:1.5px solid #EF4444; border-radius:16px; padding:16px; margin-bottom:20px; text-align:left;">
          <div style="font-size:0.8rem; font-weight:800; color:#F87171; text-transform:uppercase; margin-bottom:4px;">🎭 CEZA GÖREVİ:</div>
          <div style="font-size:1.05rem; font-weight:900; color:#FFF; line-height:1.4;">${penalty}</div>
        </div>

        <button type="button" id="btn-bomb-restart" class="btn-main primary" style="font-size:1.1rem; padding:14px;">
          💣 Sıradaki Turu Başlat (Tur ${this.roundCount + 1})
        </button>
      </div>
    `;

    document.getElementById('btn-bomb-restart').addEventListener('click', () => {
      this.roundCount++;
      this.startRound();
    });
  }

  renderBombScreen() {
    const container = document.getElementById('bomb-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="background:rgba(239,68,68,0.2); color:#EF4444; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:999px;">
            TUR ${this.roundCount}
          </span>
          <span style="font-size:0.8rem; color:#A78BFA; font-weight:800;">
            Paslaşma: <span id="bomb-pass-num">0</span>
          </span>
        </div>

        <!-- Nabız Gibi Atan Bomba -->
        <div id="bomb-visual" style="font-size:5rem; margin:14px 0 10px; transition:transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); filter:drop-shadow(0 0 25px rgba(239,68,68,0.6));">
          💣
        </div>

        <div style="font-size:0.8rem; font-weight:800; color:#EF4444; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">
          TİK-TAK... TİK-TAK!
        </div>

        <!-- Kural / Görev Kutusu -->
        <div style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(255,46,147,0.4); border-radius:18px; padding:18px; margin-bottom:20px; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="font-size:0.78rem; font-weight:800; color:#00F5D4; text-transform:uppercase; margin-bottom:6px;">KELİME GÖREVİ:</div>
          <div id="bomb-prompt-text" style="font-size:1.3rem; font-weight:900; color:#FFF; line-height:1.35;">
            ${this.currentPrompt}
          </div>
        </div>

        <button type="button" id="btn-bomb-pass" class="btn-main" style="background:linear-gradient(135deg, #00F5D4, #00ba9f); color:#0B0E14; font-size:1.25rem; font-weight:900; padding:18px; box-shadow:0 6px 25px rgba(0,245,212,0.4); border-radius:999px;">
          SÖYLEDİM! PASLA! ➔
        </button>

        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:14px; line-height:1.4;">
          Kelimeyi yüksek sesle söyle, hemen <strong>PASLA</strong>'ya bas ve telefonu yanındakine ver!
        </p>
      </div>
    `;

    document.getElementById('btn-bomb-pass').addEventListener('click', () => {
      this.passTurn();
    });
  }

  updateBombDisplay() {
    const promptEl = document.getElementById('bomb-prompt-text');
    const passNum = document.getElementById('bomb-pass-num');
    const bombVis = document.getElementById('bomb-visual');

    if (promptEl) promptEl.textContent = this.currentPrompt;
    if (passNum) passNum.textContent = this.passCount;
    if (bombVis) {
      // Bomba süre azaldıkça büyür ve kızarır
      const scale = 1 + (1 - (this.remainingTime / this.totalDuration)) * 0.45;
      bombVis.style.transform = `scale(${scale})`;
    }
  }
}
