// js/bottle-game.js
// Kafana Tak! - Şişe Çevirmece: Doğruluk mu Cesaret mi? Parti Oyunu Motoru

import { sounds } from './audio.js';

export const TRUTH_QUESTIONS_PARTY = [
  "Masadakilerden birinin en garip bulduğun huyu nedir?",
  "Hayatında yaptığın en utanç verici şey neydi?",
  "Buradaki insanlardan hangisiyle ıssız bir adada kalmak isterdin?",
  "Ailenin asla bilmesini istemediğin en büyük sırrın nedir?",
  "Son 1 ayda söylediğin en büyük yalan neydi?",
  "Hiç birine aşıkmış gibi davranıp kandırdın mı?",
  "Telefonundaki arama geçmişinin son 3 maddesi nedir?",
  "İlk görüşte aşka inanır mısın, hiç yaşadın mı?",
  "Bu masada en iyi giyinen ve en kötü giyinen kim?",
  "Hiç başkasının telefonunu gizlice karıştırdın mı?",
  "Görünmez olsaydın yapacağın ilk yaramazlık ne olurdu?",
  "Çocukken inandığın en saçma şey neydi?",
  "En son ne zaman ve neden ağladın?",
  "Masadakilerden biriyle yer değiştirecek olsan kimin hayatını seçerdin?",
  "Hiç arkadaşının sevgilisinden hoşlandın mı?"
];

export const DARE_CHALLENGES_PARTY = [
  "Masadaki herkesin önünde en sevdiğin şarkıyı rap tarzında söyle!",
  "Telefonundan rehberdeki rastgele birine 'Bana acil 100 TL borç verir misin?' mesajı at!",
  "1 dakika boyunca robot taklidi yaparak konuş!",
  "Masadakilerden birine gözlerinin içine bakarak 30 saniye iltifat et!",
  "Ayağa kalk ve en iyi dans figürünü 20 saniye sergile!",
  "Masadaki birinin ayakkabısını koklayıp yorum yap!",
  "Sonraki tura kadar konuşurken her cümlene 'Efendim' ekle!",
  "10 saniye boyunca hiç gözünü kırpmadan birine bak!",
  "Bebek gibi emekleyerek masanın etrafında bir tur at!",
  "Instagram veya WhatsApp hikayene komik bir selfie at ve 5 dakika silme!"
];

export const TRUTH_QUESTIONS_ADULT = [
  "En son ne zaman ve nerede cüretkar bir kaçamak yaşadın?",
  "En çılgın fantezin nedir, hiç gerçekleştirdin mi?",
  "Bu masadaki birinden hiç etkilendin mi ya da rüyanda gördün mü?",
  "Tek gecelik bir ilişki yaşadın mı, pişman oldun mu?",
  "Telefonunda kimseye gösteremeyeceğin özel fotoğraflar var mı?",
  "Vücudunda en beğendiğin ve partnerinin en sevdiği bölge neresi?",
  "Hiç uygunsuz bir yerde öpüştün mü (asansör, sinema, balkon)?",
  "İlk öpücüğün nasıldı, kimeydi?",
  "Cüretkar bir mesaj (sexting) attığın en son kişi kimdi?",
  "Bir ilişkide asla affetmeyeceğin sınırın nedir?"
];

export const DARE_CHALLENGES_ADULT = [
  "Masadaki karşı cinsten birinin kulağına en baştan çıkarıcı fısıltını yap!",
  "Karşındaki kişinin boynuna hafif bir öpücük kondur veya masaj yap!",
  "En çekici bakışını atarak masadakilerden birine göz kırp!",
  "Masadaki birinin elini tut ve 30 saniye boyunca bırakma!",
  "Telefonundaki en son romantik mesajı sesli oku!",
  "Gözlerini kapat, masadan biri yanağından öpsün ve kim olduğunu tahmin et!",
  "15 saniye boyunca baştan çıkarıcı bir dans figürü sergile!"
];

export class BottleGameEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'party'; // party or adult
    this.rotation = 0;
    this.isSpinning = false;
    this.selectedChoice = null; // truth or dare
  }

  setMode(mode) {
    this.mode = mode;
    this.renderScreen();
  }

  spinBottle() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    sounds.playWheelTick();

    const minRotations = 5;
    const maxRotations = 9;
    const randomExtra = Math.floor(Math.random() * 360);
    const totalSpin = (minRotations + Math.floor(Math.random() * (maxRotations - minRotations))) * 360 + randomExtra;

    this.rotation += totalSpin;

    const bottle = document.getElementById('spinning-bottle-img');
    if (bottle) {
      bottle.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.9, 0.3, 1)';
      bottle.style.transform = `rotate(${this.rotation}deg)`;
    }

    setTimeout(() => {
      this.isSpinning = false;
      sounds.playBell();
      this.promptTruthOrDare();
    }, 3600);
  }

  promptTruthOrDare() {
    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    actionArea.innerHTML = `
      <div style="background:rgba(0,0,0,0.5); border:1.5px solid rgba(255,46,147,0.5); border-radius:18px; padding:18px; animation:popIn 0.3s ease;">
        <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:6px;">ŞİŞE DURDU! 👉 KİME GELDİYSE SEÇSİN:</div>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px;">Cesaretin var mı, yoksa itiraf mı edeceksin?</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button type="button" id="btn-choose-truth" class="btn-main" style="flex:1; background:linear-gradient(135deg, #00F5D4, #00ba9f); color:#0B0E14; font-size:1.05rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🤔 DOĞRULUK
          </button>
          <button type="button" id="btn-choose-dare" class="btn-main" style="flex:1; background:linear-gradient(135deg, #FF2E93, #7928CA); color:#FFF; font-size:1.05rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🔥 CESARET
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-choose-truth').addEventListener('click', () => this.showCard('truth'));
    document.getElementById('btn-choose-dare').addEventListener('click', () => this.showCard('dare'));
  }

  showCard(type) {
    sounds.playClick();
    let text = '';
    if (this.mode === 'adult') {
      const pool = type === 'truth' ? TRUTH_QUESTIONS_ADULT : DARE_CHALLENGES_ADULT;
      text = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const pool = type === 'truth' ? TRUTH_QUESTIONS_PARTY : DARE_CHALLENGES_PARTY;
      text = pool[Math.floor(Math.random() * pool.length)];
    }

    const actionArea = document.getElementById('bottle-action-area');
    if (!actionArea) return;

    const isTruth = type === 'truth';
    actionArea.innerHTML = `
      <div style="background:linear-gradient(135deg, ${isTruth ? '#064e3b, #0f172a' : '#450a0a, #0f172a'}); border:2px solid ${isTruth ? '#00F5D4' : '#FF2E93'}; border-radius:18px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); animation:popIn 0.3s ease;">
        <span style="background:${isTruth ? 'rgba(0,245,212,0.2)' : 'rgba(255,46,147,0.2)'}; color:${isTruth ? '#00F5D4' : '#FF2E93'}; font-size:0.75rem; font-weight:900; padding:4px 12px; border-radius:999px;">
          ${isTruth ? '🤔 DOĞRULUK İTİRAFI' : '🔥 CESARET GÖREVİ'}
        </span>
        <div style="font-size:1.25rem; font-weight:900; color:#FFF; line-height:1.4; margin:14px 0 16px;">
          "${text}"
        </div>
        <button type="button" id="btn-spin-again" class="btn-main primary" style="font-size:1.05rem; padding:12px 24px; border-radius:999px; cursor:pointer;">
          🔄 Şişeyi Tekrar Çevir
        </button>
      </div>
    `;

    document.getElementById('btn-spin-again').addEventListener('click', () => {
      this.renderScreen();
      this.spinBottle();
    });
  }

  renderScreen() {
    const container = document.getElementById('bottle-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:460px; margin:0 auto; padding:20px;">
        <!-- Mod Seçici -->
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:14px;">
          <button type="button" id="btn-bottle-mode-party" class="filter-chip ${this.mode === 'party' ? 'active' : ''}" style="font-size:0.82rem; padding:7px 16px; border-radius:999px; cursor:pointer;">
            🎉 Parti Modu
          </button>
          <button type="button" id="btn-bottle-mode-adult" class="filter-chip ${this.mode === 'adult' ? 'active' : ''}" style="font-size:0.82rem; padding:7px 16px; border-radius:999px; cursor:pointer;">
            🔞 Yetişkinler (+18)
          </button>
        </div>

        <!-- 3D Dönen Şişe Sahnesi (Kusursuz Merkez Geometrisi) -->
        <div style="position:relative; width:260px; height:260px; margin:14px auto 20px; display:flex; align-items:center; justify-content:center;">
          <!-- Dış Halka -->
          <div style="position:absolute; width:260px; height:260px; border-radius:50%; border:2px dashed rgba(255,46,147,0.35); animation:spinSlow 25s linear infinite; pointer-events:none;"></div>
          <!-- İç Hedef Çemberi & Zemin Işıltısı -->
          <div style="position:absolute; width:200px; height:200px; border-radius:50%; border:1px solid rgba(0,245,212,0.25); background:radial-gradient(circle, rgba(255,46,147,0.12) 0%, rgba(0,0,0,0.6) 70%); pointer-events:none;"></div>
          <!-- Merkez Pivot Noktası -->
          <div style="position:absolute; width:10px; height:10px; border-radius:50%; background:var(--gold); box-shadow:0 0 12px var(--gold); z-index:2; pointer-events:none;"></div>

          <!-- Gerçekçi Dönen Şarap Şişesi -->
          <div id="spinning-bottle-img" style="position:absolute; width:65px; height:230px; transform-origin:50% 50%; cursor:pointer; z-index:5; transform:rotate(${this.rotation}deg); display:flex; align-items:center; justify-content:center;">
            <img src="assets/wine_bottle.webp" alt="Şişe" style="width:100%; height:100%; object-fit:contain; pointer-events:none; filter:drop-shadow(0 14px 25px rgba(0,0,0,0.85));" />
          </div>
        </div>

        <div id="bottle-action-area">
          <button type="button" id="btn-start-spin-bottle" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); font-size:1.15rem; font-weight:900; padding:15px; box-shadow:0 6px 25px rgba(255,46,147,0.4); border-radius:999px; width:100%; cursor:pointer;">
            🍾 ŞİŞEYİ ÇEVİR!
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-bottle-mode-party').addEventListener('click', () => this.setMode('party'));
    document.getElementById('btn-bottle-mode-adult').addEventListener('click', () => this.setMode('adult'));
    document.getElementById('btn-start-spin-bottle').addEventListener('click', () => this.spinBottle());
    document.getElementById('spinning-bottle-img').addEventListener('click', () => this.spinBottle());
  }
}
