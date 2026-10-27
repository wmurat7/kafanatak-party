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

export const BOTTLE_SKINS = {
  green: {
    id: 'green',
    name: '🟢 Zümrüt Cam',
    svg: `
      <svg viewBox="0 0 80 240" width="70" height="210" style="display:block; margin:0 auto; filter:drop-shadow(0 8px 18px rgba(0,0,0,0.6)); pointer-events:none;">
        <defs>
          <linearGradient id="greenGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="35%" stop-color="#10b981"/>
            <stop offset="65%" stop-color="#047857"/>
            <stop offset="100%" stop-color="#022c22"/>
          </linearGradient>
          <linearGradient id="goldCap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#D97706"/>
            <stop offset="50%" stop-color="#FDE68A"/>
            <stop offset="100%" stop-color="#B45309"/>
          </linearGradient>
        </defs>
        <!-- Altın Taç Kapak -->
        <rect x="33" y="10" width="14" height="12" rx="3" fill="url(#goldCap)"/>
        <!-- Şişe Boyun ve Gövde -->
        <path d="M34 22 L46 22 L46 65 Q46 95 24 110 L24 210 Q24 225 40 225 Q56 225 56 210 L56 110 Q34 95 34 65 Z" fill="url(#greenGlass)"/>
        <!-- Işık Yansıması / Cam Parıltısı -->
        <path d="M36 26 L39 26 L39 65 Q39 90 28 108 L28 205 Q28 215 35 218 L33 220 Q24 216 24 205 L24 108 Q36 90 36 65 Z" fill="rgba(255,255,255,0.4)"/>
        <!-- Retro Etiket -->
        <rect x="25" y="130" width="30" height="42" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
        <circle cx="40" cy="148" r="8" fill="#10B981"/>
        <text x="40" y="152" font-size="8" font-weight="900" fill="#FFF" text-anchor="middle">77</text>
        <text x="40" y="166" font-size="6" font-weight="900" fill="#047857" text-anchor="middle">SODA</text>
      </svg>
    `
  },
  wine: {
    id: 'wine',
    name: '🍷 Bordo Şarap',
    svg: `
      <svg viewBox="0 0 80 240" width="70" height="210" style="display:block; margin:0 auto; filter:drop-shadow(0 8px 18px rgba(0,0,0,0.6)); pointer-events:none;">
        <defs>
          <linearGradient id="wineGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#450a0a"/>
            <stop offset="35%" stop-color="#991b1b"/>
            <stop offset="65%" stop-color="#7f1d1d"/>
            <stop offset="100%" stop-color="#1c0505"/>
          </linearGradient>
          <linearGradient id="corkCap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#78350f"/>
            <stop offset="50%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
        </defs>
        <!-- Mantar Tıpa -->
        <rect x="33" y="8" width="14" height="18" rx="2" fill="url(#corkCap)"/>
        <rect x="31" y="24" width="18" height="6" rx="2" fill="#991b1b"/>
        <!-- Boyun ve Gövde -->
        <path d="M34 28 L46 28 L46 80 Q58 105 58 125 L58 212 Q58 226 40 226 Q22 226 22 212 L22 125 Q22 105 34 80 Z" fill="url(#wineGlass)"/>
        <!-- Cam Highlight -->
        <path d="M36 32 L39 32 L39 80 Q45 100 45 120 L45 208 Q35 218 30 212 L26 210 Q26 125 36 80 Z" fill="rgba(255,255,255,0.25)"/>
        <!-- Lüks Vintage Etiket -->
        <rect x="25" y="125" width="30" height="52" rx="3" fill="#18181B" stroke="#FBBF24" stroke-width="1.2"/>
        <text x="40" y="142" font-size="6" font-weight="900" fill="#FBBF24" text-anchor="middle">CHÂTEAU</text>
        <line x1="28" y1="146" x2="52" y2="146" stroke="#FBBF24" stroke-width="0.8"/>
        <text x="40" y="158" font-size="8" font-weight="900" fill="#FFF" text-anchor="middle">RESERVE</text>
        <text x="40" y="169" font-size="5" font-weight="700" fill="#A1A1AA" text-anchor="middle">1988</text>
      </svg>
    `
  },
  neon: {
    id: 'neon',
    name: '⚡ Siber Neon',
    svg: `
      <svg viewBox="0 0 80 240" width="70" height="210" style="display:block; margin:0 auto; filter:drop-shadow(0 0 16px #00F5D4); pointer-events:none;">
        <defs>
          <linearGradient id="neonBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00F5D4"/>
            <stop offset="50%" stop-color="#7928CA"/>
            <stop offset="100%" stop-color="#FF2E93"/>
          </linearGradient>
        </defs>
        <!-- Siber Kapak -->
        <polygon points="34,8 46,8 48,22 32,22" fill="#FF2E93" stroke="#FFF" stroke-width="1"/>
        <!-- Fütüristik Gövde -->
        <path d="M33 22 L47 22 L49 70 L60 100 L56 215 Q40 230 24 215 L20 100 L31 70 Z" fill="#0B0E14" stroke="url(#neonBody)" stroke-width="3"/>
        <!-- İç Neon Enerji Çekirdeği -->
        <path d="M37 75 L43 75 L50 102 L48 200 Q40 210 32 200 L30 102 Z" fill="url(#neonBody)" opacity="0.6"/>
        <line x1="40" y1="28" x2="40" y2="205" stroke="#FFF" stroke-width="1.5" stroke-dasharray="4,2"/>
        <circle cx="40" cy="145" r="9" fill="#00F5D4"/>
        <text x="40" y="149" font-size="8" font-weight="900" fill="#0B0E14" text-anchor="middle">⚡</text>
      </svg>
    `
  },
  champagne: {
    id: 'champagne',
    name: '🥂 Şampanya',
    svg: `
      <svg viewBox="0 0 80 240" width="70" height="210" style="display:block; margin:0 auto; filter:drop-shadow(0 8px 18px rgba(251,191,36,0.4)); pointer-events:none;">
        <defs>
          <linearGradient id="champBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="50%" stop-color="#022c22"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B"/>
            <stop offset="40%" stop-color="#FDE68A"/>
            <stop offset="80%" stop-color="#D97706"/>
            <stop offset="100%" stop-color="#B45309"/>
          </linearGradient>
        </defs>
        <!-- Altın Folyo & Mantar -->
        <ellipse cx="40" cy="10" rx="8" ry="4" fill="url(#goldFoil)"/>
        <path d="M32 10 L48 10 L47 55 L33 55 Z" fill="url(#goldFoil)" stroke="#78350F" stroke-width="0.5"/>
        <rect x="31" y="46" width="18" height="5" fill="#EF4444"/>
        <circle cx="40" cy="48" r="4" fill="#FBBF24"/>
        <!-- Şampanya Gövdesi -->
        <path d="M33 55 L47 55 Q56 85 60 120 L60 210 Q60 226 40 226 Q20 226 20 210 L20 120 Q24 85 33 55 Z" fill="url(#champBody)"/>
        <!-- Kristal Parlama Çizgisi -->
        <path d="M35 60 L38 60 Q45 90 48 120 L48 205 Q40 216 35 212 Q24 200 24 120 Q28 90 35 60 Z" fill="rgba(255,255,255,0.2)"/>
        <!-- Altın Oval Etiket -->
        <ellipse cx="40" cy="145" rx="16" ry="24" fill="#0B0E14" stroke="url(#goldFoil)" stroke-width="1.8"/>
        <text x="40" y="138" font-size="6" font-weight="900" fill="#FBBF24" text-anchor="middle">DOM</text>
        <text x="40" y="148" font-size="7" font-weight="900" fill="#FFF" text-anchor="middle">PARTY</text>
        <text x="40" y="157" font-size="5" font-weight="700" fill="#FDE68A" text-anchor="middle">BRUT</text>
      </svg>
    `
  }
};

export class BottleGameEngine {
  constructor(game) {
    this.game = game;
    this.mode = 'party'; // party or adult
    this.selectedSkin = localStorage.getItem('kafanatak_bottle_skin') || 'green';
    this.rotation = 0;
    this.isSpinning = false;
    this.selectedChoice = null; // truth or dare
  }

  setMode(mode) {
    this.mode = mode;
    this.renderScreen();
  }

  setSkin(skinId) {
    if (!BOTTLE_SKINS[skinId]) return;
    this.selectedSkin = skinId;
    localStorage.setItem('kafanatak_bottle_skin', skinId);
    sounds.playClick();
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

    const activeSkin = BOTTLE_SKINS[this.selectedSkin] || BOTTLE_SKINS.green;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:460px; margin:0 auto; padding:20px;">
        <!-- Mod Seçici -->
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
          <button type="button" id="btn-bottle-mode-party" class="filter-chip ${this.mode === 'party' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px; border-radius:999px; cursor:pointer;">
            🎉 Parti Modu
          </button>
          <button type="button" id="btn-bottle-mode-adult" class="filter-chip ${this.mode === 'adult' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px; border-radius:999px; cursor:pointer;">
            🔞 Yetişkinler (+18)
          </button>
        </div>

        <!-- Şişe Modeli Seçici Çipleri -->
        <div style="margin-bottom:14px;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--text-dim); margin-bottom:6px; letter-spacing:0.5px;">ŞİŞE MODELİNİ SEÇ:</div>
          <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:6px;">
            ${Object.values(BOTTLE_SKINS).map(s => `
              <button type="button" class="btn-bottle-skin-chip ${this.selectedSkin === s.id ? 'active' : ''}" data-skin="${s.id}" style="background:${this.selectedSkin === s.id ? 'rgba(0,245,212,0.2)' : 'rgba(255,255,255,0.06)'}; border:1.5px solid ${this.selectedSkin === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}; color:${this.selectedSkin === s.id ? '#FFF' : 'var(--text-dim)'}; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:999px; cursor:pointer; transition:all 0.2s;">
                ${s.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3D Dönen Şişe Sahnesi (Kusursuz Merkez Geometrisi) -->
        <div style="position:relative; width:250px; height:250px; margin:10px auto 16px; display:flex; align-items:center; justify-content:center;">
          <!-- Dış Halka -->
          <div style="position:absolute; width:250px; height:250px; border-radius:50%; border:2px dashed rgba(255,46,147,0.35); animation:spinSlow 25s linear infinite; pointer-events:none;"></div>
          <!-- İç Hedef Çemberi -->
          <div style="position:absolute; width:190px; height:190px; border-radius:50%; border:1px solid rgba(0,245,212,0.25); pointer-events:none;"></div>
          <div style="position:absolute; width:8px; height:8px; border-radius:50%; background:var(--gold); box-shadow:0 0 10px var(--gold); z-index:2; pointer-events:none;"></div>

          <!-- Gerçekçi Dönen Vektör Şişe -->
          <div id="spinning-bottle-img" style="position:absolute; width:70px; height:210px; transform-origin:50% 50%; cursor:pointer; z-index:5; transform:rotate(${this.rotation}deg);">
            ${activeSkin.svg}
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

    container.querySelectorAll('.btn-bottle-skin-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const skinId = btn.dataset.skin;
        this.setSkin(skinId);
      });
    });
  }
}
