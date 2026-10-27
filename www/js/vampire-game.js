// Kafana Tak! - Vampir - Köylü (Mafia / Werewolf) Oyun Motoru
// Desteklenen 2 Mod:
// 1. Tek Telefon (Elden Ele Gizli Rol & Masada Moderatör)
// 2. Çoklu Telefon (Aynı Wi-Fi / Hotspot QR Oda Modu - Jackbox Tarzı)

export function getApiBaseUrl() {
  const savedIp = localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159';
  const port = 3000;
  
  // Capacitor, dosya veya webview altındaysa
  if (
    typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && window.location.port !== '3000') ||
      (window.location.hostname === '127.0.0.1' && window.location.port !== '3000')
    )
  ) {
    return `http://${savedIp}:${port}`;
  }

  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return window.location.origin;
  }

  return `http://${savedIp}:${port}`;
}

export class VampireGameEngine {
  constructor(gameApp) {
    this.app = gameApp;
    this.mode = 'single'; // 'single' | 'multi'
    this.roomId = '';
    this.hostId = '';
    this.players = [];
    this.phase = 'lobby';
    this.dayNumber = 1;
    this.winner = null;
    this.settings = {
      vampireCount: 2,
      hasDoctor: true,
      hasDetective: true,
      discussDuration: 60
    };
    this.singleCurrentPeekIndex = 0;
    this.nightActions = {
      vampireTarget: null,
      doctorTarget: null,
      detectiveTarget: null,
      detectiveResult: null
    };
    this.pollTimer = null;
    this.discussTimer = null;
    this.discussSecondsRemaining = 60;
    this.selectedSingleLynchTarget = null;
  }

  // Spiker Seslendirmesi (Türkçe Web Speech API)
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  // =========================================
  // MOD 1: TEK TELEFON (ELDEN ELE & MASADA)
  // =========================================
  startSinglePhoneLobby(playerNames) {
    this.mode = 'single';
    this.phase = 'lobby';
    this.dayNumber = 1;
    this.winner = null;
    this.selectedSingleLynchTarget = null;
    this.players = playerNames.map((name, i) => ({
      id: 'p_' + i,
      name,
      avatar: ['🧑‍🌾', '🦊', '🐺', '🤠', '🧙‍♂️', '👸', '🥷', '🦁', '🍕', '🚀'][i % 10],
      role: null,
      alive: true
    }));

    // Rolleri Dağıt
    this.assignSingleRoles();
    this.singleCurrentPeekIndex = 0;
    this.renderSinglePeekScreen();
  }

  assignSingleRoles() {
    const total = this.players.length;
    let vCount = Math.min(Math.max(1, this.settings.vampireCount || (total >= 7 ? 2 : 1)), Math.floor(total / 2));
    let pool = [];
    for (let i = 0; i < vCount; i++) pool.push('vampir');
    if (this.settings.hasDoctor && total >= 4) pool.push('doktor');
    if (this.settings.hasDetective && total >= 5) pool.push('komiser');
    while (pool.length < total) pool.push('koylu');

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.players.forEach((p, idx) => {
      p.role = pool[idx];
      p.alive = true;
    });
  }

  renderSinglePeekScreen() {
    const container = document.getElementById('vampire-single-screen');
    if (!container) return;

    if (this.singleCurrentPeekIndex >= this.players.length) {
      // Herkes rolünü gördü, masaya koyma vakti!
      this.startSingleNightPhase();
      return;
    }

    const cur = this.players[this.singleCurrentPeekIndex];
    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px; border:1.5px solid rgba(0,245,212,0.4); box-shadow:0 12px 35px rgba(0,0,0,0.5);">
        <div style="display:inline-block; font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:999px; background:rgba(0,245,212,0.15); color:var(--primary); margin-bottom:8px;">
          ADIM 1: GİZLİ ROL ÖĞRENME (${this.singleCurrentPeekIndex + 1} / ${this.players.length})
        </div>
        <h3 style="font-size:1.05rem; color:var(--text-muted); margin-top:4px;">Telefonu Sıradaki Oyuncuya Verin:</h3>
        <h2 style="font-size:1.85rem; font-weight:900; color:#FFF; margin:8px 0; letter-spacing:0.5px;">${cur.avatar} ${cur.name}</h2>
        
        <div class="role-peek-card" id="single-peek-card" style="margin:16px 0; height:250px;">
          <div class="role-peek-inner">
            <div class="card-front" style="background:linear-gradient(135deg, #1e1b4b, #0f172a); border:2px dashed rgba(0,245,212,0.4); border-radius:18px;">
              <span style="font-size:3.2rem; margin-bottom:8px; filter:drop-shadow(0 0 15px rgba(0,245,212,0.5));">🔒</span>
              <h3 style="font-size:1.15rem; font-weight:900; color:#FFF;">ROLÜNÜ GÖRMEK İÇİN BASILI TUT</h3>
              <p style="font-size:0.8rem; color:var(--text-dim); margin-top:6px;">Kimseye göstermeden basılı tut, öğrenince bırak!</p>
            </div>
            <div class="card-back ${cur.role}" style="border-radius:18px;">
              <span style="font-size:3.6rem; margin-bottom:6px;">${cur.role === 'vampir' ? '🧛‍♂️' : cur.role === 'doktor' ? '🩺' : cur.role === 'komiser' ? '🕵️' : '🧑‍🌾'}</span>
              <h2 style="font-size:1.6rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${cur.role}</h2>
              <p style="font-size:0.86rem; padding:0 14px; margin-top:6px; line-height:1.4;">
                ${cur.role === 'vampir' ? 'Sen bir vampirsin! Geceleri köy halkından birini avlayacaksın. Gündüz masum köylü taklidi yap!' : cur.role === 'doktor' ? 'Sen bir doktorsun! Her gece bir kişiyi (veya kendini) vampirlerin saldırısından kurtarabilirsin!' : cur.role === 'komiser' ? 'Sen bir komisersin! Her gece bir kişinin kimliğini gizlice soruşturup vampir olup olmadığını öğrenebilirsin!' : 'Masum bir köylüsün! Gece uyur, gündüz ipuçlarıyla vampirleri bulup asmaya çalışırsın.'}
              </p>
            </div>
          </div>
        </div>

        <button type="button" id="btn-next-single-peek" class="btn-main primary" style="font-size:1.05rem; padding:13px;">
          ${this.singleCurrentPeekIndex + 1 === this.players.length ? '🚀 Herkes Gördü! Geceyi Başlat ➔' : '👍 Gördüm, Sıradaki Oyuncuya Ver ➔'}
        </button>
      </div>
    `;

    const peekCard = document.getElementById('single-peek-card');
    const showRole = () => peekCard.classList.add('revealed');
    const hideRole = () => peekCard.classList.remove('revealed');

    peekCard.addEventListener('mousedown', showRole);
    peekCard.addEventListener('mouseup', hideRole);
    peekCard.addEventListener('mouseleave', hideRole);
    peekCard.addEventListener('touchstart', (e) => { e.preventDefault(); showRole(); });
    peekCard.addEventListener('touchend', hideRole);

    document.getElementById('btn-next-single-peek').addEventListener('click', () => {
      this.singleCurrentPeekIndex++;
      this.renderSinglePeekScreen();
    });
  }

  // =========================================
  // TEK TELEFON OYUN AŞAMALARI (MODERATÖR MASADA)
  // =========================================
  startSingleNightPhase() {
    this.phase = 'night';
    this.nightActions = {
      vampireTarget: null,
      doctorTarget: null,
      detectiveTarget: null,
      detectiveResult: null
    };

    this.speak('Gece çöktü. Tüm köy halkı gözlerini kapatsın ve başını masaya koysun.');
    this.renderSingleTableScreen();
  }

  renderSingleTableScreen() {
    const container = document.getElementById('vampire-single-screen');
    if (!container) return;

    const alive = this.players.filter(p => p.alive);

    if (this.phase === 'night') {
      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px; border:2px solid rgba(255,46,147,0.4); box-shadow:0 12px 35px rgba(255,46,147,0.2);">
          <div style="font-size:0.78rem; font-weight:800; color:#FF2E93; text-transform:uppercase; letter-spacing:1px;">🌙 ${this.dayNumber}. GECE (MASA MODERATÖRÜ)</div>
          <h2 style="font-size:1.55rem; font-weight:900; color:#FFF; margin:6px 0;">Gece Çöktü... Köy Uyuyor</h2>
          
          <div style="background:rgba(0,0,0,0.5); border-radius:14px; padding:12px; margin:12px 0; border:1px solid rgba(255,255,255,0.1); text-align:left;">
            <div style="font-size:0.8rem; font-weight:800; color:#00F5D4; margin-bottom:4px;">📖 REHBER & TALİMATLAR:</div>
            <p style="font-size:0.82rem; color:var(--text-dim); line-height:1.4; margin:0;">
              Telefonu masanın ortasına bırakın veya moderatör eline alsın. Aşağıdaki sırayla rolleri uyandırın ve hedefleri ekranda işaretleyin:
            </p>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
            <!-- 1. Vampirler -->
            <button type="button" id="btn-call-vampires" class="btn-target" style="padding:14px 16px; border-color:rgba(255,46,147,0.5); background:linear-gradient(135deg, rgba(69,10,10,0.4), rgba(15,23,42,0.8));">
              <span style="font-size:1rem; font-weight:900;">🧛‍♂️ 1. Vampirleri Uyandır</span>
              <span id="badge-vampire-chosen" style="font-size:0.8rem; color:#FF8E53; font-weight:800;">${this.nightActions.vampireTarget ? 'Hedef Seçildi ✓' : 'Hedef Seç ➔'}</span>
            </button>
            <div id="box-vampire-targets" style="display:none; background:rgba(0,0,0,0.5); border-radius:14px; padding:12px;"></div>

            <!-- 2. Doktor -->
            ${this.settings.hasDoctor ? `
              <button type="button" id="btn-call-doctor" class="btn-target" style="padding:14px 16px; border-color:rgba(56,189,248,0.5); background:linear-gradient(135deg, rgba(8,47,73,0.4), rgba(15,23,42,0.8));">
                <span style="font-size:1rem; font-weight:900;">🩺 2. Doktoru Uyandır</span>
                <span id="badge-doctor-chosen" style="font-size:0.8rem; color:#38BDF8; font-weight:800;">${this.nightActions.doctorTarget ? 'Seçildi ✓' : 'Koru ➔'}</span>
              </button>
              <div id="box-doctor-targets" style="display:none; background:rgba(0,0,0,0.5); border-radius:14px; padding:12px;"></div>
            ` : ''}

            <!-- 3. Komiser -->
            ${this.settings.hasDetective ? `
              <button type="button" id="btn-call-detective" class="btn-target" style="padding:14px 16px; border-color:rgba(251,191,36,0.5); background:linear-gradient(135deg, rgba(69,26,3,0.4), rgba(15,23,42,0.8));">
                <span style="font-size:1rem; font-weight:900;">🕵️ 3. Komiseri Uyandır</span>
                <span id="badge-detective-chosen" style="font-size:0.8rem; color:#FBBF24; font-weight:800;">${this.nightActions.detectiveTarget ? 'Sorgulandı ✓' : 'Sorgula ➔'}</span>
              </button>
              <div id="box-detective-targets" style="display:none; background:rgba(0,0,0,0.5); border-radius:14px; padding:12px;"></div>
            ` : ''}
          </div>

          <button type="button" id="btn-single-wake-up" class="btn-main primary" style="font-size:1.1rem; padding:14px;">
            ☀️ Geceyi Bitir & Sabah Köyü Uyandır ➔
          </button>
        </div>
      `;

      // Vampir uyandırma
      document.getElementById('btn-call-vampires').addEventListener('click', () => {
        this.speak('Vampirler gözlerinizi açın ve kurbanınızı fısıltıyla seçin.');
        const box = document.getElementById('box-vampire-targets');
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
        box.innerHTML = `
          <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:8px; font-weight:700;">Vampirler Kimi Avlayacak?</div>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
            ${alive.map(p => `
              <button type="button" class="btn-target ${this.nightActions.vampireTarget === p.id ? 'selected' : ''}" data-target="${p.id}" style="padding:8px 10px; font-size:0.85rem; justify-content:center;">
                ${p.avatar} ${p.name}
              </button>
            `).join('')}
          </div>
        `;
        box.querySelectorAll('[data-target]').forEach(b => {
          b.addEventListener('click', () => {
            this.nightActions.vampireTarget = b.dataset.target;
            document.getElementById('badge-vampire-chosen').textContent = 'Hedef Seçildi ✓';
            box.style.display = 'none';
            this.speak('Vampirler tekrar gözlerini kapatsın.');
          });
        });
      });

      // Doktor uyandırma
      if (this.settings.hasDoctor) {
        document.getElementById('btn-call-doctor').addEventListener('click', () => {
          this.speak('Doktor gözlerini açsın ve bu gece korumak istediği kişiyi işaret etsin.');
          const box = document.getElementById('box-doctor-targets');
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
          box.innerHTML = `
            <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:8px; font-weight:700;">Doktor Kimi Koruyacak?</div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
              ${alive.map(p => `
                <button type="button" class="btn-target ${this.nightActions.doctorTarget === p.id ? 'selected' : ''}" data-target="${p.id}" style="padding:8px 10px; font-size:0.85rem; justify-content:center;">
                  ${p.avatar} ${p.name}
                </button>
              `).join('')}
            </div>
          `;
          box.querySelectorAll('[data-target]').forEach(b => {
            b.addEventListener('click', () => {
              this.nightActions.doctorTarget = b.dataset.target;
              document.getElementById('badge-doctor-chosen').textContent = 'Seçildi ✓';
              box.style.display = 'none';
              this.speak('Doktor tekrar gözlerini kapatsın.');
            });
          });
        });
      }

      // Komiser uyandırma
      if (this.settings.hasDetective) {
        document.getElementById('btn-call-detective').addEventListener('click', () => {
          this.speak('Komiser gözlerini açsın ve şüphelendiği kişiyi ekrandan seçsin.');
          const box = document.getElementById('box-detective-targets');
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
          box.innerHTML = `
            <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:8px; font-weight:700;">Komiser Kimi Sorgulayacak?</div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
              ${alive.map(p => `
                <button type="button" class="btn-target ${this.nightActions.detectiveTarget === p.id ? 'selected' : ''}" data-target="${p.id}" style="padding:8px 10px; font-size:0.85rem; justify-content:center;">
                  ${p.avatar} ${p.name}
                </button>
              `).join('')}
            </div>
          `;
          box.querySelectorAll('[data-target]').forEach(b => {
            b.addEventListener('click', () => {
              const targetP = this.players.find(p => p.id === b.dataset.target);
              box.innerHTML = `
                <div style="font-size:1.05rem; font-weight:900; color:#FFF; margin-bottom:8px; padding:10px; background:rgba(0,0,0,0.6); border-radius:12px;">
                  🔍 ${targetP.name}: <span style="color:${targetP.role === 'vampir' ? '#FF2E93' : '#00F5D4'};">${targetP.role === 'vampir' ? 'VAMPİR! 🧛‍♂️' : 'MASUM KÖYLÜ 🧑‍🌾'}</span>
                </div>
                <button type="button" id="btn-close-detective" class="btn-main" style="padding:10px 16px; font-size:0.85rem;">Tamam, Gözlerini Kapat</button>
              `;
              document.getElementById('btn-close-detective').addEventListener('click', () => {
                box.style.display = 'none';
                this.speak('Komiser tekrar gözlerini kapatsın.');
              });
            });
          });
        });
      }

      // Sabahı Başlat
      document.getElementById('btn-single-wake-up').addEventListener('click', () => {
        this.resolveSingleNight();
      });

    } else if (this.phase === 'day_reveal' || this.phase === 'day_discuss') {
      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px; border:2px solid rgba(255,215,0,0.4); box-shadow:0 12px 35px rgba(255,215,0,0.15);">
          <div style="font-size:0.78rem; font-weight:800; color:#FFE600; text-transform:uppercase; letter-spacing:1px;">☀️ ${this.dayNumber}. GÜN (SABAH RAPORU)</div>
          <h2 style="font-size:1.7rem; font-weight:900; color:#FFF; margin:6px 0;">Köy Halkı Uyanın!</h2>
          
          <div class="status-box" style="font-size:1.1rem; font-weight:800; color:#FFF; margin:14px 0; background:rgba(0,0,0,0.5); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.15); line-height:1.4;">
            ${this.singleReportText}
          </div>

          <div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:12px; margin-bottom:16px; text-align:left;">
            <div style="font-size:0.78rem; font-weight:800; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px;">Kalan Yaşayan Köylüler (${alive.length}):</div>
            <div class="player-pills" style="justify-content:flex-start;">
              ${this.players.map(p => `
                <div class="player-pill ${p.alive ? '' : 'dead'}" style="${!p.alive ? 'opacity:0.4; text-decoration:line-through; background:rgba(239,68,68,0.1);' : 'background:rgba(0,245,212,0.1); border-color:var(--primary);'}">
                  ${p.avatar} ${p.name} ${!p.alive ? '☠️' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <button type="button" id="btn-start-single-vote" class="btn-main primary" style="font-size:1.1rem; padding:14px;">
            ⚖️ Köy Meydanı Linç Oylamasını Başlat ➔
          </button>
        </div>
      `;

      document.getElementById('btn-start-single-vote').addEventListener('click', () => {
        this.startSingleVoting();
      });

    } else if (this.phase === 'voting') {
      // YÜKSEK KONTRASTLI, NET VE KRİSTAL OYLAMA EKRANI
      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:460px; margin:0 auto; padding:20px; border:2px solid #EF4444; box-shadow:0 12px 40px rgba(239,68,68,0.25);">
          <div style="display:inline-block; font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:999px; background:rgba(239,68,68,0.2); color:#FCA5A5; margin-bottom:8px; border:1px solid rgba(239,68,68,0.4);">
            ⚖️ KÖY MEYDANI LİNÇ SANDIĞI (${this.dayNumber}. GÜN)
          </div>
          <h2 style="font-size:1.65rem; font-weight:900; color:#FFF; margin:4px 0 6px;">Kimi Asıyoruz?</h2>
          <p style="font-size:0.86rem; color:#CBD5E1; line-height:1.4; margin-bottom:16px;">
            Tartışma bitti! Köy halkı el kaldırarak veya anlaşarak kimi asmak istediğinizi seçin. Seçilen kişiye dokunun:
          </p>

          <!-- Aday Kartları Grid (Net, Yüksek Kontrast, Kart Başına Geniş Alan) -->
          <div class="lynch-action-grid" style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
            ${alive.map(p => `
              <div class="lynch-candidate-card ${this.selectedSingleLynchTarget === p.id ? 'active' : ''}" data-target-id="${p.id}" role="button" tabindex="0" style="display:flex; align-items:center; justify-content:space-between; background:rgba(26,20,40,0.9); border:2px solid ${this.selectedSingleLynchTarget === p.id ? '#FF2E93' : 'rgba(255,255,255,0.15)'}; padding:14px 16px; border-radius:16px; cursor:pointer; transition:all 0.2s; box-shadow:${this.selectedSingleLynchTarget === p.id ? '0 0 20px rgba(255,46,147,0.5)' : 'none'};">
                <div style="display:flex; align-items:center; gap:12px; text-align:left;">
                  <span style="font-size:2.2rem; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5));">${p.avatar}</span>
                  <div>
                    <div style="font-size:1.15rem; font-weight:900; color:#FFF;">${p.name}</div>
                    <div style="font-size:0.75rem; color:#94A3B8; font-weight:700;">ŞÜPHELİ KÖYLÜ</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="lynch-select-indicator" style="background:${this.selectedSingleLynchTarget === p.id ? '#FF2E93' : 'rgba(255,255,255,0.1)'}; color:#FFF; font-size:0.85rem; font-weight:900; padding:8px 14px; border-radius:10px; border:1px solid ${this.selectedSingleLynchTarget === p.id ? '#FF8E53' : 'transparent'};">
                    ${this.selectedSingleLynchTarget === p.id ? 'SEÇİLDİ ☠️' : 'BU KİŞİYİ AS ➔'}
                  </span>
                </div>
              </div>
            `).join('')}

            <!-- Pas / Kimse Asılmasın Seçeneği -->
            <div class="lynch-candidate-card ${this.selectedSingleLynchTarget === 'none' ? 'active' : ''}" data-target-id="none" role="button" tabindex="0" style="display:flex; align-items:center; justify-content:space-between; background:rgba(15,23,42,0.8); border:2px dashed ${this.selectedSingleLynchTarget === 'none' ? '#00F5D4' : 'rgba(255,255,255,0.2)'}; padding:14px 16px; border-radius:16px; cursor:pointer; transition:all 0.2s;">
              <div style="display:flex; align-items:center; gap:12px; text-align:left;">
                <span style="font-size:2rem;">🤝</span>
                <div>
                  <div style="font-size:1.05rem; font-weight:900; color:#FFF;">Kimse Asılmasın</div>
                  <div style="font-size:0.75rem; color:#94A3B8; font-weight:700;">Oylar Eşit / Çoğunluk Yok</div>
                </div>
              </div>
              <span class="lynch-select-indicator" style="background:${this.selectedSingleLynchTarget === 'none' ? '#00F5D4' : 'rgba(255,255,255,0.08)'}; color:${this.selectedSingleLynchTarget === 'none' ? '#0B0E14' : '#FFF'}; font-size:0.85rem; font-weight:900; padding:8px 14px; border-radius:10px;">
                ${this.selectedSingleLynchTarget === 'none' ? 'PAS SEÇİLDİ ✓' : 'PAS GEÇ ➔'}
              </span>
            </div>
          </div>

          <button type="button" id="btn-confirm-single-lynch" class="btn-main primary" style="font-size:1.1rem; padding:15px; width:100%;" ${!this.selectedSingleLynchTarget ? 'disabled style="opacity:0.5; pointer-events:none;"' : ''}>
            ⚖️ Kararı Kesinleştir ve İdam Et ➔
          </button>
        </div>
      `;

      container.querySelectorAll('[data-target-id]').forEach(card => {
        card.addEventListener('click', () => {
          this.selectedSingleLynchTarget = card.dataset.targetId;
          this.renderSingleTableScreen();
        });
      });

      const confirmBtn = document.getElementById('btn-confirm-single-lynch');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (!this.selectedSingleLynchTarget) return;
          this.resolveSingleVoting(this.selectedSingleLynchTarget);
        });
      }

    } else if (this.phase === 'vote_result') {
      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px; border:2px solid rgba(0,245,212,0.4); box-shadow:0 12px 35px rgba(0,245,212,0.15);">
          <div style="font-size:2.8rem; margin-bottom:6px;">⚖️</div>
          <h2 style="font-size:1.6rem; font-weight:900; color:#FFF; margin-bottom:8px;">Oylama Sonucu Açıklandı</h2>
          <div class="status-box" style="font-size:1.1rem; font-weight:900; color:#FFF; margin:16px 0; background:rgba(0,0,0,0.5); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.15); line-height:1.4;">
            ${this.singleVoteResultText}
          </div>
          <button type="button" id="btn-single-next-night" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #7928CA); font-size:1.1rem; padding:14px;">
            🌙 Sıradaki Geceye Geç ➔
          </button>
        </div>
      `;
      document.getElementById('btn-single-next-night').addEventListener('click', () => {
        this.dayNumber++;
        this.selectedSingleLynchTarget = null;
        this.startSingleNightPhase();
      });

    } else if (this.phase === 'game_over') {
      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:24px; border:2px solid ${this.winner === 'vampir' ? '#FF2E93' : '#00F5D4'}; box-shadow:0 12px 40px ${this.winner === 'vampir' ? 'rgba(255,46,147,0.3)' : 'rgba(0,245,212,0.3)'};">
          <span style="font-size:4rem; filter:drop-shadow(0 4px 15px rgba(0,0,0,0.5));">${this.winner === 'vampir' ? '🧛‍♂️' : '🏆'}</span>
          <h2 style="font-size:1.85rem; font-weight:900; color:${this.winner === 'vampir' ? '#FF2E93' : '#00F5D4'}; margin:8px 0;">
            ${this.winner === 'vampir' ? 'VAMPİRLER KAZANDI!' : 'KÖYLÜLER KAZANDI!'}
          </h2>
          <p style="font-size:0.9rem; color:var(--text-dim); line-height:1.4; margin-bottom:16px;">
            ${this.winner === 'vampir' ? 'Vampirler köye tamamen hakim oldu ve tüm masumları avladı.' : 'Köy halkı tüm gizli vampirleri asarak köyü kurtardı!'}
          </p>

          <div style="background:rgba(0,0,0,0.5); border-radius:14px; padding:14px; margin-bottom:18px; text-align:left;">
            <div style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-bottom:8px; text-transform:uppercase;">🎭 Tüm Rol İtirafları:</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${this.players.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:8px 12px; border-radius:10px;">
                  <span>${p.avatar} ${p.name}</span>
                  <strong style="color:${p.role === 'vampir' ? '#FF2E93' : '#00F5D4'}; text-transform:uppercase;">${p.role}</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <button type="button" id="btn-single-restart" class="btn-main primary" style="font-size:1.1rem; padding:14px;">
            🔄 Yeni Oyun Başlat
          </button>
        </div>
      `;
      document.getElementById('btn-single-restart').addEventListener('click', () => {
        this.assignSingleRoles();
        this.singleCurrentPeekIndex = 0;
        this.dayNumber = 1;
        this.selectedSingleLynchTarget = null;
        this.renderSinglePeekScreen();
      });
    }
  }

  resolveSingleNight() {
    const vTarget = this.nightActions.vampireTarget;
    const dTarget = this.nightActions.doctorTarget;

    if (vTarget && vTarget === dTarget) {
      this.singleReportText = '🎉 Doktor harika bir iş çıkardı! Gece saldırıya uğrayan köylüyü iyileştirdi. Bu gece kimse ölmedi!';
      this.speak('Güneş doğdu! Köy halkı uyanın! Doktor harika bir iş çıkardı, dün gece kimse ölmedi.');
    } else if (vTarget) {
      const victim = this.players.find(p => p.id === vTarget);
      if (victim) {
        victim.alive = false;
        this.singleReportText = `☠️ Korkunç bir geceydi... Dün gece ${victim.name} vampirler tarafından ısırıldı ve hayatını kaybetti!`;
        this.speak(`Güneş doğdu! Köy halkı uyanın! Korkunç bir geceydi, dün gece ${victim.name} aramızdan ayrıldı.`);
      }
    } else {
      this.singleReportText = 'Köyde sakin bir gece geçti, kimse yaralanmadı.';
      this.speak('Güneş doğdu! Bu gece köy sakin geçti.');
    }

    const win = this.checkWin();
    if (win) {
      this.phase = 'game_over';
      this.winner = win;
    } else {
      this.phase = 'day_reveal';
    }
    this.renderSingleTableScreen();
  }

  startSingleVoting() {
    this.phase = 'voting';
    this.selectedSingleLynchTarget = null;
    this.speak('Köy halkı, tartışma sona erdi. Şüphelendiğiniz kişiyi oylayın ve asılacak kişiyi seçin.');
    this.renderSingleTableScreen();
  }

  resolveSingleVoting(lynchId) {
    if (lynchId === 'none' || !lynchId) {
      this.singleVoteResultText = '🤝 Oylar eşit çıktı veya çoğunluk sağlanamadı. Bu tur kimse asılmadı!';
      this.speak('Köy halkı uzlaşamadı, bu tur kimse asılmadı.');
    } else {
      const p = this.players.find(x => x.id === lynchId);
      if (p) {
        p.alive = false;
        const isV = p.role === 'vampir';
        this.singleVoteResultText = `⚖️ Köy halkının kararıyla ${p.name} asıldı! Kendisi bir ${isV ? 'VAMPİRDİ! 🧛‍♂️' : 'MASUM KÖYLÜYDÜ! 🧑‍🌾'}`;
        this.speak(`Köy halkının kararıyla ${p.name} asıldı. Kendisi bir ${isV ? 'vampirdi' : 'masum köylüydü'}.`);
      }
    }

    const win = this.checkWin();
    if (win) {
      this.phase = 'game_over';
      this.winner = win;
    } else {
      this.phase = 'vote_result';
    }
    this.renderSingleTableScreen();
  }

  checkWin() {
    const aliveV = this.players.filter(p => p.alive && p.role === 'vampir').length;
    const aliveVillagers = this.players.filter(p => p.alive && p.role !== 'vampir').length;
    if (aliveV === 0) return 'koylu';
    if (aliveV >= aliveVillagers) return 'vampir';
    return null;
  }

  // =========================================
  // MOD 2: ÇOKLU TELEFON (AYNI Wİ-Fİ / QR MODU)
  // =========================================
  renderWifiSetupScreen() {
    const container = document.getElementById('vampire-multi-screen');
    if (!container) return;

    const currentIp = localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159';

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:480px; margin:0 auto; padding:22px; border:2px solid rgba(0,245,212,0.5); box-shadow:0 12px 35px rgba(0,245,212,0.15);">
        <div style="font-size:2.8rem; margin-bottom:6px;">🌐</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:#FFF; margin-bottom:6px;">Aynı Ağda Çoklu Telefon</h2>
        <p style="font-size:0.86rem; color:var(--text-dim); line-height:1.4; margin-bottom:16px;">
          Bu cihaz <strong>Ana Oyun Panosu</strong> olur. Diğer arkadaşlarınız kendi telefonlarından kamerayla ekrandaki QR kodu okutarak odaya katılır.
        </p>

        <!-- 3 Adımlı Kurulum Rehberi -->
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left; margin-bottom:16px;">
          <div style="display:flex; gap:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px;">
            <span style="background:var(--primary); color:#0B0E14; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; flex-shrink:0;">1</span>
            <div>
              <strong style="color:#FFF; font-size:0.9rem;">Aynı Wi-Fi veya Hotspot Ağı:</strong>
              <p style="font-size:0.8rem; color:var(--text-dim); margin-top:2px;">Tüm telefonlar ve bilgisayar aynı Wi-Fi ağına (veya telefonun internet paylaşımına) bağlı olmalıdır.</p>
            </div>
          </div>

          <div style="display:flex; gap:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px;">
            <span style="background:var(--primary); color:#0B0E14; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; flex-shrink:0;">2</span>
            <div>
              <strong style="color:#FFF; font-size:0.9rem;">Oyun Sunucusu (baslat.bat):</strong>
              <p style="font-size:0.8rem; color:var(--text-dim); margin-top:2px;">Bilgisayarınızda <code>baslat.bat</code> dosyası açık olmalı ve port 3000 dinlenmelidir.</p>
            </div>
          </div>

          <div style="display:flex; gap:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px;">
            <span style="background:var(--primary); color:#0B0E14; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; flex-shrink:0;">3</span>
            <div style="flex:1;">
              <strong style="color:#FFF; font-size:0.9rem;">Sunucu IP & Bağlantı Testi:</strong>
              <div style="display:flex; gap:8px; margin-top:6px;">
                <input type="text" id="input-wifi-ip" class="form-input" value="${currentIp}" style="flex:1; padding:8px 12px; font-size:0.9rem;" placeholder="Örn: 192.168.1.159">
                <button type="button" id="btn-test-wifi-conn" class="btn-secondary" style="padding:8px 14px; font-size:0.85rem; flex-shrink:0;">
                  📡 Test Et
                </button>
              </div>
              <div id="wifi-test-status" style="font-size:0.75rem; margin-top:4px; font-weight:800; color:var(--text-dim);">
                Varsayılan IP: ${currentIp} (Port: 3000)
              </div>
            </div>
          </div>
        </div>

        <button type="button" id="btn-launch-wifi-room" class="btn-main primary" style="font-size:1.1rem; padding:15px; width:100%;">
          🚀 Odayı Kur & QR Kodu Aç ➔
        </button>
      </div>
    `;

    const ipInput = document.getElementById('input-wifi-ip');
    const testBtn = document.getElementById('btn-test-wifi-conn');
    const statusEl = document.getElementById('wifi-test-status');
    const launchBtn = document.getElementById('btn-launch-wifi-room');

    testBtn.addEventListener('click', async () => {
      const ip = (ipInput.value || '').trim();
      if (!ip) return;
      localStorage.setItem('kafanatak_last_server_ip', ip);
      statusEl.innerHTML = '<span style="color:#FFE600;">⏳ Sunucu kontrol ediliyor...</span>';
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`http://${ip}:3000/api/system/info`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          statusEl.innerHTML = '<span style="color:#00E676;">🟢 Sunucu Aktif ve Bağlandı! (Port 3000)</span>';
        } else {
          statusEl.innerHTML = '<span style="color:#FF416C;">🔴 Sunucu yanıt vermedi! HTTP: ' + res.status + '</span>';
        }
      } catch (err) {
        statusEl.innerHTML = '<span style="color:#FF416C;">🔴 Bağlanılamadı! Bilgisayarda "baslat.bat" açık mı?</span>';
      }
    });

    launchBtn.addEventListener('click', async () => {
      const ip = (ipInput.value || '').trim();
      if (ip) localStorage.setItem('kafanatak_last_server_ip', ip);
      
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:35px; max-width:440px; margin:0 auto;">
          <div class="ai-spinner" style="width:40px; height:40px; border-width:4px; margin:0 auto 14px;"></div>
          <h3 style="color:#FFF; font-size:1.2rem; font-weight:900;">Oda Kuruluyor...</h3>
          <p style="color:var(--text-dim); font-size:0.85rem; margin-top:6px;">Sunucuya bağlanılıyor (http://${ip || '192.168.1.159'}:3000)</p>
        </div>
      `;

      const result = await this.createMultiplayerRoom(this.app?.profile?.name || 'Köy Muhtarı');
      if (!result.success) {
        container.innerHTML = `
          <div class="card" style="text-align:center; max-width:460px; margin:0 auto; padding:22px; border:2px solid #EF4444;">
            <div style="font-size:3rem; margin-bottom:6px;">⚠️</div>
            <h2 style="font-size:1.4rem; font-weight:900; color:#EF4444; margin-bottom:8px;">Oda Kurulamadı!</h2>
            <p style="font-size:0.86rem; color:#FCA5A5; line-height:1.4; margin-bottom:14px;">
              Hata Detayı: ${result.error || 'Sunucuya ulaşılamadı'}.
            </p>
            <div style="background:rgba(0,0,0,0.5); border-radius:12px; padding:12px; font-size:0.82rem; text-align:left; color:#CBD5E1; margin-bottom:16px;">
              <strong>Olası Nedenler & Çözüm:</strong>
              <ul style="padding-left:18px; margin-top:4px;">
                <li>Bilgisayarınızda <code>baslat.bat</code> penceresi açık ve çalışıyor mu?</li>
                <li>Telefonunuz bilgisayar ile kesinlikle AYNI Wi-Fi ağına bağlı mı?</li>
                <li>IP adresi doğru mu? (CMD ekranında <code>ipconfig</code> yazarak teyit edin).</li>
              </ul>
            </div>
            <button type="button" id="btn-retry-wifi" class="btn-main primary" style="font-size:1rem; padding:12px;">
              🔄 Yeniden Dene / Ayarlara Dön
            </button>
          </div>
        `;
        document.getElementById('btn-retry-wifi').addEventListener('click', () => {
          this.renderWifiSetupScreen();
        });
      }
    });
  }

  async createMultiplayerRoom(hostName) {
    this.mode = 'multi';
    const baseUrl = getApiBaseUrl();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${baseUrl}/api/vampire/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: hostName || 'Köy Muhtarı', settings: this.settings }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      this.roomId = data.roomId;
      this.hostId = data.hostId;
      this.phase = 'lobby';

      this.startHostPolling();
      return { success: true, roomId: this.roomId };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  startHostPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    const baseUrl = getApiBaseUrl();

    this.pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/api/vampire/state?room=${this.roomId}&player=${this.hostId}`);
        if (!res.ok) return;
        const state = await res.json();
        this.renderMultiHostScreen(state);
      } catch (e) {}
    }, 1000);
  }

  renderMultiHostScreen(state) {
    const container = document.getElementById('vampire-multi-screen');
    if (!container) return;
    const baseUrl = getApiBaseUrl();

    if (state.phase === 'lobby') {
      const clientUrl = `${baseUrl}/koy.html?room=${encodeURIComponent(state.roomId)}`;

      container.innerHTML = `
        <div class="card" style="text-align:center; max-width:480px; margin:0 auto; padding:22px; border:2px solid var(--primary); box-shadow:0 12px 35px rgba(0,245,212,0.2);">
          <div style="font-size:0.78rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1px;">🌐 ÇOKLU TELEFON ODASI AÇIK</div>
          <h2 style="font-size:2.2rem; font-weight:900; letter-spacing:6px; color:#FFF; margin:6px 0;">ODA: <span style="color:var(--primary);">${state.roomId}</span></h2>
          <p style="font-size:0.86rem; color:var(--text-dim); margin-bottom:14px;">
            Arkadaşlarınız kendi telefonlarından aşağıdaki QR kodu okutarak odaya katılabilir:
          </p>

          <div id="vampire-qr-box" style="background:#FFF; padding:12px; border-radius:18px; display:inline-block; margin-bottom:14px; box-shadow:0 8px 30px rgba(0,245,212,0.4);">
            <canvas id="vampire-qr-canvas" width="220" height="220"></canvas>
          </div>

          <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:10px;">
            Veya tarayıcıya yazın: <strong style="color:#FFF;">${clientUrl}</strong>
          </div>

          <div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:12px; margin-bottom:16px;">
            <div style="font-size:0.82rem; font-weight:800; color:var(--primary); margin-bottom:8px;">
              Katılan Köylüler (${state.players.length}):
            </div>
            <div class="player-pills" style="justify-content:center; min-height:40px;">
              ${state.players.map(p => `
                <div class="player-pill" style="background:rgba(0,245,212,0.15); border:1px solid var(--primary);">
                  <span>${p.avatar}</span> <span>${p.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <button type="button" id="btn-multi-start-game" class="btn-main primary" style="font-size:1.15rem; padding:15px; width:100%;">
            🚀 Oyunu Başlat & Rolleri Dağıt (${state.players.length} Oyuncu)
          </button>
        </div>
      `;

      // QR Kod çiz (Doğru LAN IP adresiyle!)
      this.drawQRCode('vampire-qr-canvas', clientUrl);

      document.getElementById('btn-multi-start-game').addEventListener('click', async () => {
        if (state.players.length < 3) {
          alert('Oyunu başlatmak için en az 3 oyuncu katılmalıdır!');
          return;
        }
        await fetch(`${baseUrl}/api/vampire/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, playerId: this.hostId })
        });
      });
      return;
    }

    // Oyun Fazı (Host Büyük Ekran / TV Panosu)
    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:480px; margin:0 auto; padding:22px; border:2px solid rgba(255,46,147,0.4); box-shadow:0 12px 35px rgba(255,46,147,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.82rem; font-weight:800; color:var(--primary); background:rgba(0,245,212,0.15); padding:3px 10px; border-radius:999px;">ODA: ${state.roomId}</span>
          <span style="font-size:0.82rem; font-weight:800; color:#FF2E93; background:rgba(255,46,147,0.15); padding:3px 10px; border-radius:999px;">${state.dayNumber}. ${state.phase.toUpperCase()}</span>
        </div>

        <h2 style="font-size:1.65rem; font-weight:900; color:#FFF; margin:6px 0;">
          ${state.phase === 'night' ? '🌙 Gece Çöktü...' : state.phase === 'day_reveal' ? '☀️ Güneş Doğdu!' : state.phase === 'day_discuss' ? '🗣️ Köy Tartışması' : state.phase === 'voting' ? '⚖️ Linç Oylaması' : '🏆 Oyun Bitti'}
        </h2>

        <div class="status-box" style="font-size:1.1rem; font-weight:800; color:#FFF; margin:14px 0; background:rgba(0,0,0,0.5); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.15); line-height:1.4;">
          ${state.narratorText || ''}
        </div>

        <!-- Oylama Aşamasında Canlı Oy Durumu -->
        ${state.phase === 'voting' ? `
          <div style="background:rgba(239,68,68,0.15); border:1.5px solid #EF4444; border-radius:16px; padding:14px; margin-bottom:16px; text-align:left;">
            <div style="font-size:0.82rem; font-weight:800; color:#FCA5A5; text-transform:uppercase; margin-bottom:8px;">🗳️ CANLI SANDIK DURUMU:</div>
            <p style="font-size:0.8rem; color:#CBD5E1; margin:0;">
              Oyuncular kendi telefon ekranlarından oylarını kullanıyor. Herkes oyunu verdiğinde aşağıdaki butonla oylamayı tamamlayabilirsiniz.
            </p>
          </div>
        ` : ''}

        <div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:12px; margin-bottom:16px; text-align:left;">
          <div style="font-size:0.78rem; font-weight:800; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px;">Köy Halkı Durumu:</div>
          <div class="player-pills" style="justify-content:flex-start;">
            ${state.players.map(p => `
              <div class="player-pill ${p.alive ? '' : 'dead'}" style="${!p.alive ? 'opacity:0.4; text-decoration:line-through;' : ''}">
                <span>${p.avatar}</span> <span>${p.name}</span> ${!p.alive ? '☠️' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        ${state.phase !== 'game_over' ? `
          <button type="button" id="btn-multi-advance-phase" class="btn-main primary" style="font-size:1.1rem; padding:14px; width:100%;">
            ${state.phase === 'night' ? '☀️ Sabahı Başlat (Sonuçları Açıkla)' : state.phase === 'day_reveal' ? '🗣️ Tartışmaya Geç' : state.phase === 'day_discuss' ? '⚖️ Oylamayı Başlat' : state.phase === 'voting' ? '📜 Oylama Sonucunu Açıkla' : '🌙 Sıradaki Geceye Geç'} ➔
          </button>
        ` : `
          <button type="button" id="btn-multi-reset" class="btn-main primary" style="font-size:1.1rem; padding:14px; width:100%;">
            🔄 Yeni Tur İçin Lobiye Dön
          </button>
        `}
      </div>
    `;

    const advBtn = document.getElementById('btn-multi-advance-phase');
    if (advBtn) {
      advBtn.addEventListener('click', async () => {
        await fetch(`${baseUrl}/api/vampire/advance-phase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, playerId: this.hostId })
        });
      });
    }

    const resetBtn = document.getElementById('btn-multi-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await fetch(`${baseUrl}/api/vampire/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, playerId: this.hostId })
        });
      });
    }
  }

  // QR Kod Çizici (Kütüphanesiz Basit QR veya Canvas)
  drawQRCode(canvasId, url) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (window.QRCode) {
      QRCode.toCanvas(canvas, url, { width: 220, margin: 1 });
      return;
    }
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  }
}
