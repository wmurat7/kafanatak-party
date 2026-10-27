// js/spy-game.js
// Kafana Tak! - Casus Kim? (Spyfall / Undercover) Parti Oyunu Motoru

import { sounds } from './audio.js';

export const SPY_LOCATIONS = [
  {
    name: 'Havalimanı',
    icon: '✈️',
    roles: ['Pilot', 'Hostes', 'Yolcu', 'Güvenlik Görevlisi', 'Bavul Taşıyıcı', 'Pasaport Polisi', 'Duty Free Satıcısı']
  },
  {
    name: 'Düğün Salonu',
    icon: '👰',
    roles: ['Damat', 'Gelin', 'Kaynana', 'Düğün Fotoğrafçısı', 'Piyanist Şantör', 'Garson', 'Davetsiz Misafir', 'Halay Başı']
  },
  {
    name: 'Hastane',
    icon: '🏥',
    roles: ['Başhekim', 'Acil Doktoru', 'Hemşire', 'Hasta', 'Hasta Yakını', 'Ambulans Şoförü', 'Eczacı']
  },
  {
    name: 'Karakol',
    icon: '👮',
    roles: ['Başkomiser', 'Nöbetçi Polis', 'Şüpheli', 'Avukat', 'Gözaltındaki Suçlu', 'Trafik Polisi']
  },
  {
    name: 'Denizaltı',
    icon: '🌊',
    roles: ['Denizaltı Kaptanı', 'Torpidocu', 'Mühendis', 'Aşçı', 'Telsiz Subayı', 'Sonar Operatörü']
  },
  {
    name: 'Uzay İstasyonu',
    icon: '🚀',
    roles: ['Astronot', 'Uzay Yürüyüşçüsü', 'Görev Komutanı', 'Uzay Turisti', 'Biyolog', 'Uzay Aracı Pilotu']
  },
  {
    name: 'Karadeniz Yaylası',
    icon: '🏔️',
    roles: ['Çoban', 'Horon Başı', 'Kemençeci', 'Turist', 'Çay Toplayıcısı', 'Yayla Muhtarı']
  },
  {
    name: 'Lunapark',
    icon: '🎡',
    roles: ['Dönme Dolap Görevlisi', 'Pamuk Şekerci', 'Korku Tüneli Canavarı', 'Çocuk', 'Heyecanlı Genç', 'Biletçi']
  },
  {
    name: 'Tarihi Türk Hamamı',
    icon: '🛁',
    roles: ['Tellak', 'Natır', 'Kese Yaptıran Müşteri', 'Hamam Sahibi', 'Gelin Hamamı Misafiri']
  },
  {
    name: 'Banka Soygunu',
    icon: '💰',
    roles: ['Maskeli Soyguncu', 'Banka Müdürü', 'Veznedar', 'Rehine Müşteri', 'Güvenlik Görevlisi']
  },
  {
    name: 'Sinema Salonu',
    icon: '🍿',
    roles: ['Patlamış Mısır Satıcısı', 'Film Seyircisi', 'Yer Gösterici', 'Makinist', 'Film Eleştirmeni']
  },
  {
    name: 'Üniversite Sınav Salonu',
    icon: '📝',
    roles: ['Gözetmen Hoca', 'Kopya Çeken Öğrenci', 'İnek Öğrenci', 'Sınavda Uyuyakalan', 'Bina Sorumlusu']
  },
  {
    name: 'Gece Kulübü',
    icon: '🍸',
    roles: ['DJ', 'Barmen', 'Loca Ziyaretçisi', 'Kapıdaki Güvenlik (Bouncer)', 'Dansçı', 'Garson']
  },
  {
    name: 'Futbol Stadyumu',
    icon: '⚽',
    roles: ['Hakem', 'Tribün Lideri (Amigo)', 'Yedek Futbolcu', 'Köfte Ekmekçi', 'Teknik Direktör', 'Canlı Yayın Kameramanı']
  },
  {
    name: 'Süpermarket',
    icon: '🛒',
    roles: ['Kasiyer', 'Reyon Görevlisi', 'İndirim Avcısı Teyze', 'Güvenlik', 'Market Müdürü']
  },
  {
    name: 'Kamp Alanı',
    icon: '⛺',
    roles: ['Gitar Çalan Çocuk', 'Çadır Kuran Kampçı', 'Orman Korucusu', 'Ateş Başı Hikayecisi', 'Doğa Yürüyüşçüsü']
  },
  {
    name: 'Otobüs Terminali (Otogar)',
    icon: '🚌',
    roles: ['Muavin', 'Otobüs Şoförü', 'Yolcu', 'Çığırtkan Biletçi', 'Bavul Taşıyıcı', 'Yolcu Yakını']
  },
  {
    name: 'Tiyatro Sahnesi',
    icon: '🎭',
    roles: ['Başrol Oyuncusu', 'Yönetmen', 'Işıkçı', 'Suflör', 'Kostüm Tasarımcısı', 'Heyecanlı Seyirci']
  },
  {
    name: 'Pazar Yeri',
    icon: '🍉',
    roles: ['Domates Satan Esnaf', 'Fiyat Kırmaya Çalışan Müşteri', 'Limoncu', 'Pazar Zabıtası', 'Pazar Arabalı Teyze']
  },
  {
    name: 'İstanbul Şehir Hatları Vapuru',
    icon: '🚢',
    roles: ['Vapur Kaptanı', 'Çaycı', 'Martılara Simit Atan Yolcu', 'Akordeon Çalan Sokak Müzisyeni', 'İskele Görevlisi']
  }
];

export class SpyGameEngine {
  constructor(game) {
    this.game = game;
    this.players = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Burak'];
    this.spyCount = 1;
    this.gameDuration = 300; // 5 dakika
    this.remainingTime = 300;
    this.timerInterval = null;

    this.currentLocation = null;
    this.assignedRoles = []; // { name, role, isSpy }
    this.currentRevealIndex = 0;
    this.phase = 'setup'; // setup, reveal, play, vote, result
    this.selectedAccused = null;
  }

  startNewGame() {
    if (this.players.length < 3) {
      alert('Casus Kim oynamak için en az 3 oyuncu gereklidir!');
      return;
    }

    // 1. Rastgele mekan seç
    this.currentLocation = SPY_LOCATIONS[Math.floor(Math.random() * SPY_LOCATIONS.length)];

    // 2. Casus(ları) belirle
    const count = this.players.length;
    let actualSpyCount = Math.min(this.spyCount, Math.floor(count / 3) || 1);

    let indices = this.players.map((_, i) => i).sort(() => Math.random() - 0.5);
    let spyIndices = new Set(indices.slice(0, actualSpyCount));

    // 3. Rolleri ata
    let shuffledRoles = [...this.currentLocation.roles].sort(() => Math.random() - 0.5);

    this.assignedRoles = this.players.map((name, i) => {
      const isSpy = spyIndices.has(i);
      const role = isSpy ? 'CASUS' : (shuffledRoles[i % shuffledRoles.length] || 'Ziyaretçi');
      return { name, role, isSpy };
    });

    this.currentRevealIndex = 0;
    this.phase = 'reveal';
    this.renderRevealScreen();
  }

  renderRevealScreen() {
    const container = document.getElementById('spy-game-content');
    if (!container) return;

    if (this.currentRevealIndex >= this.assignedRoles.length) {
      // Herkes rolünü gördü, oyunu başlat
      this.phase = 'play';
      this.startDiscussionTimer();
      return;
    }

    const cur = this.assignedRoles[this.currentRevealIndex];

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:24px;">
        <span style="background:rgba(255,46,147,0.2); color:#FF2E93; font-size:0.75rem; font-weight:900; padding:4px 12px; border-radius:999px;">
          OYUNCU ${this.currentRevealIndex + 1} / ${this.assignedRoles.length}
        </span>
        <h2 style="font-size:1.6rem; font-weight:900; color:#FFF; margin:10px 0 4px;">
          👤 ${cur.name}
        </h2>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:18px;">
          Telefonu <strong>${cur.name}</strong> alsın. Diğerleri ekrana bakmasın!
        </p>

        <!-- Bas-Tut Gizli Kart -->
        <div id="spy-peek-card" style="background:linear-gradient(135deg, #1e1b4b, #0f172a); border:2px dashed rgba(255,46,147,0.4); border-radius:20px; padding:32px 16px; cursor:pointer; user-select:none; margin-bottom:18px; transition:all 0.2s;">
          <div id="spy-peek-hidden">
            <div style="font-size:3rem; margin-bottom:8px; filter:drop-shadow(0 0 15px rgba(255,46,147,0.6));">🤫</div>
            <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:4px;">GİZLİ KARTINI GÖRMEK İÇİN</div>
            <div style="font-size:0.82rem; color:#A78BFA; font-weight:800;">👉 PARMAĞINI BURAYA BASILI TUT 👈</div>
          </div>
          <div id="spy-peek-shown" style="display:none;">
            ${cur.isSpy ? `
              <div style="font-size:3.5rem; margin-bottom:6px;">🕵️‍♂️</div>
              <div style="font-size:1.4rem; font-weight:900; color:#FF2E93; margin-bottom:6px;">SEN CASUSSUN!</div>
              <p style="font-size:0.86rem; color:#FDA4AF; line-height:1.4; margin:0;">
                Mekanı bilmiyorsun! Sorulan soruları dikkatle dinle, çaktırma ve mekanı tahmin etmeye çalış!
              </p>
            ` : `
              <div style="font-size:3rem; margin-bottom:6px;">${this.currentLocation.icon}</div>
              <div style="font-size:0.8rem; font-weight:800; color:#38BDF8; letter-spacing:1px; text-transform:uppercase;">MEKAN:</div>
              <div style="font-size:1.6rem; font-weight:900; color:#FFF; margin-bottom:8px;">${this.currentLocation.name}</div>
              <div style="background:rgba(0,245,212,0.15); border:1px solid rgba(0,245,212,0.4); border-radius:12px; padding:8px 12px;">
                <span style="font-size:0.75rem; color:#00F5D4; font-weight:800;">ROLÜN:</span>
                <div style="font-size:1.1rem; font-weight:900; color:#FFF;">${cur.role}</div>
              </div>
            `}
          </div>
        </div>

        <button type="button" id="btn-spy-next-player" class="btn-main primary" style="font-size:1.05rem; padding:14px;">
          ${this.currentRevealIndex + 1 === this.assignedRoles.length ? '🚀 Oyunu Başlat (Süre Başlasın)' : 'Sıradaki Oyuncuya Ver ➔'}
        </button>
      </div>
    `;

    const peekCard = document.getElementById('spy-peek-card');
    const hiddenBox = document.getElementById('spy-peek-hidden');
    const shownBox = document.getElementById('spy-peek-shown');

    const showCard = (e) => {
      e.preventDefault();
      sounds.playClick();
      hiddenBox.style.display = 'none';
      shownBox.style.display = 'block';
      peekCard.style.border = cur.isSpy ? '2px solid #FF2E93' : '2px solid #00F5D4';
      peekCard.style.background = cur.isSpy ? 'linear-gradient(135deg, #450a0a, #831843)' : 'linear-gradient(135deg, #082f49, #0369a1)';
    };

    const hideCard = (e) => {
      e.preventDefault();
      hiddenBox.style.display = 'block';
      shownBox.style.display = 'none';
      peekCard.style.border = '2px dashed rgba(255,46,147,0.4)';
      peekCard.style.background = 'linear-gradient(135deg, #1e1b4b, #0f172a)';
    };

    peekCard.addEventListener('mousedown', showCard);
    peekCard.addEventListener('mouseup', hideCard);
    peekCard.addEventListener('touchstart', showCard, { passive: false });
    peekCard.addEventListener('touchend', hideCard);

    document.getElementById('btn-spy-next-player').addEventListener('click', () => {
      sounds.playClick();
      this.currentRevealIndex++;
      this.renderRevealScreen();
    });
  }

  startDiscussionTimer() {
    this.remainingTime = this.gameDuration;
    sounds.startPartyBeat();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.renderPlayScreen();
      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        sounds.playBuzzer();
        this.startVotingPhase();
      }
    }, 1000);

    this.renderPlayScreen();
  }

  renderPlayScreen() {
    const container = document.getElementById('spy-game-content');
    if (!container) return;

    const mins = Math.floor(this.remainingTime / 60);
    const secs = this.remainingTime % 60;
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px;">
        <span style="background:rgba(0,245,212,0.15); color:#00F5D4; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:999px;">
          🕵️ SORU - CEVAP FAZI
        </span>

        <!-- Büyük Geri Sayım Kronometresi -->
        <div style="font-size:3.5rem; font-weight:900; font-family:monospace; color:${this.remainingTime <= 30 ? '#EF4444' : '#FFF'}; margin:12px 0 6px; text-shadow:0 0 20px rgba(0,245,212,0.4);">
          ${timeStr}
        </div>

        <div style="background:rgba(0,0,0,0.35); border-radius:14px; padding:12px; margin-bottom:16px; text-align:left;">
          <div style="font-size:0.8rem; font-weight:800; color:#FF8E53; margin-bottom:4px;">💡 NASIL OYNANIR?</div>
          <p style="font-size:0.82rem; color:#CBD5E1; line-height:1.4; margin:0;">
            Bir kişi seçin ve ona mekanı açık etmeyecek kurnazca bir soru sorun (Örn: <em>"Buraya gelirken ne giydin?", "Hava nasıldı?"</em>). Cevap veren kişi başka birine soru sorar. Casusu bulmaya çalışın!
          </p>
        </div>

        <!-- Olası Mekanlar Listesi (Casusun tahmin etmesi için faydalı) -->
        <details style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; margin-bottom:16px; text-align:left; cursor:pointer;">
          <summary style="font-size:0.82rem; font-weight:800; color:#38BDF8;">📍 Olası Mekanlar Listesini Gör (${SPY_LOCATIONS.length} Mekan)</summary>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-top:8px; font-size:0.78rem;">
            ${SPY_LOCATIONS.map(loc => `
              <div style="background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:8px;">${loc.icon} ${loc.name}</div>
            `).join('')}
          </div>
        </details>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" id="btn-spy-accuse" class="btn-main" style="background:linear-gradient(135deg, #FF2E93, #EF4444); font-size:1.05rem; padding:14px;">
            🚨 Şüpheliyi İfşa Et / Oylama Başlat
          </button>
          <button type="button" id="btn-spy-guess-location" class="btn-secondary" style="font-size:0.85rem; padding:10px; color:#A78BFA; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:12px; cursor:pointer;">
            🕵️ Casus Mekanı Tahmin Etsin
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-spy-accuse').addEventListener('click', () => {
      clearInterval(this.timerInterval);
      sounds.playClick();
      this.startVotingPhase();
    });

    document.getElementById('btn-spy-guess-location').addEventListener('click', () => {
      this.openSpyGuessLocationModal();
    });
  }

  startVotingPhase() {
    this.phase = 'vote';
    const container = document.getElementById('spy-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px;">
        <span style="background:rgba(255,46,147,0.2); color:#FF2E93; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:999px;">
          ⚖️ CASUS OYLAMASI
        </span>
        <h2 style="font-size:1.5rem; font-weight:900; color:#FFF; margin:8px 0 4px;">Casus Kim?</h2>
        <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:16px;">
          Masa halkı olarak şüphelendiğiniz casusun ismine dokunun:
        </p>

        <div style="display:grid; gap:8px; margin-bottom:16px;">
          ${this.assignedRoles.map((p, idx) => `
            <button type="button" class="btn-spy-target" data-idx="${idx}" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); padding:12px 16px; border-radius:14px; color:#FFF; font-size:0.95rem; font-weight:800; cursor:pointer;">
              <span>👤 ${p.name}</span>
              <span style="color:#FF2E93; font-weight:900;">Bu Kişi Casus! 🕵️</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-spy-target').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        const idx = parseInt(btn.dataset.idx, 10);
        this.resolveAccusation(idx);
      });
    });
  }

  resolveAccusation(accusedIdx) {
    const accused = this.assignedRoles[accusedIdx];
    const isActuallySpy = accused.isSpy;

    if (isActuallySpy) {
      sounds.playCheer();
    } else {
      sounds.playBuzzer();
    }

    const container = document.getElementById('spy-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:24px;">
        <div style="font-size:3.5rem; margin-bottom:8px;">${isActuallySpy ? '🎉' : '😱'}</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:${isActuallySpy ? '#00F5D4' : '#FF2E93'}; margin-bottom:6px;">
          ${isActuallySpy ? 'KASABA KAZANDI!' : 'CASUS KAZANDI!'}
        </h2>
        <p style="font-size:0.9rem; color:#FFF; margin-bottom:14px;">
          ${accused.name} seçildi ve kendisi ${isActuallySpy ? '<strong>GERÇEKTEN CASUSTU! 🕵️‍♂️</strong>' : '<strong>MASUM BİRİYDİ! 🧑‍💼</strong>'}
        </p>

        <div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:14px; margin-bottom:18px; text-align:left;">
          <div style="font-size:0.8rem; color:#38BDF8; font-weight:800; margin-bottom:4px;">📍 GİZLİ MEKAN:</div>
          <div style="font-size:1.2rem; font-weight:900; color:#FFF; margin-bottom:10px;">${this.currentLocation.icon} ${this.currentLocation.name}</div>
          <div style="font-size:0.8rem; color:#A78BFA; font-weight:800; margin-bottom:6px;">👥 ROL DAĞILIMI:</div>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:0.84rem;">
            ${this.assignedRoles.map(p => `
              <div style="display:flex; justify-content:space-between;">
                <span>${p.name}:</span>
                <strong style="color:${p.isSpy ? '#FF2E93' : '#00F5D4'};">${p.isSpy ? '🕵️ CASUS' : p.role}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <button type="button" id="btn-spy-restart" class="btn-main primary" style="font-size:1.05rem; padding:14px;">
          🔄 Yeni Tur Başlat
        </button>
      </div>
    `;

    document.getElementById('btn-spy-restart').addEventListener('click', () => {
      sounds.playClick();
      this.startNewGame();
    });
  }

  openSpyGuessLocationModal() {
    const guess = prompt(`Casussan gizli mekanı tahmin et! (${SPY_LOCATIONS.map(l => l.name).join(', ')})`);
    if (!guess) return;

    if (guess.trim().toLowerCase() === this.currentLocation.name.toLowerCase()) {
      sounds.playCheer();
      alert(`🎉 TEBRİKLER! Mekan gerçekten "${this.currentLocation.name}" idi! Casus mekanı bilerek KAZANDI! 🕵️‍♂️🏆`);
      this.resolveAccusation(this.assignedRoles.findIndex(p => p.isSpy));
    } else {
      sounds.playBuzzer();
      alert(`❌ YANLIŞ TAHMİN! Mekan "${this.currentLocation.name}" idi. Casus kaybetti! Kasaba halkı kazandı! 🏆`);
      this.resolveAccusation(this.assignedRoles.findIndex(p => p.isSpy));
    }
  }
}
