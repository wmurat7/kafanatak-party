// js/party-tournament.js
// Kafana Tak! - Parti Gecesi Turnuva & Çalma Listesi Modu (Cross-Game Tournament Engine)
// 3-5 oyunluk otomatik lig, canlı puan tablosu ve büyük şampiyonluk kupası

import { sounds } from './audio.js';
import { confetti } from './confetti.js';

export const TOURNAMENT_PRESETS = [
  {
    id: 'quick_3',
    name: '⚡ Hızlı Parti Kupası (3 Oyun)',
    desc: 'Alna Koyma ➔ Passaparola ➔ Çarkıfelek (~15 Dakika)',
    badge: '15 DK • EN ÇOK TERCİH EDİLEN',
    games: [
      { id: 'headsup', title: 'Alna Koyarak Tahmin', icon: '📱', screen: 'home' },
      { id: 'passaparola', title: 'Passaparola Quiz', icon: '🅰️', screen: 'passaparola' },
      { id: 'carkifelek', title: 'Çarkıfelek TV', icon: '🎡', screen: 'carkifelek' }
    ]
  },
  {
    id: 'grand_5',
    name: '👑 Büyük Gece Şampiyonası (5 Oyun)',
    desc: 'Alna Koyma ➔ İsim Şehir ➔ Passaparola ➔ Kelime Bombası ➔ Aileler Yarışıyor (~30 Dakika)',
    badge: '30 DK • BÜYÜK DERBİ',
    games: [
      { id: 'headsup', title: 'Alna Koyarak Tahmin', icon: '📱', screen: 'home' },
      { id: 'isim_sehir', title: 'İsim Şehir Partisi', icon: '📝', screen: 'isimSehir' },
      { id: 'passaparola', title: 'Passaparola Quiz', icon: '🅰️', screen: 'passaparola' },
      { id: 'kelime_bombasi', title: 'Kelime Bombası', icon: '💣', screen: 'kelimeBombasi' },
      { id: 'aileler', title: 'Aileler Yarışıyor', icon: '👨‍👩‍👧‍👦', screen: 'ailelerYarisiyor' }
    ]
  }
];

export class PartyTournamentEngine {
  constructor(game) {
    this.game = game;
    this.isActive = false;
    this.currentPresetId = 'quick_3';
    this.playlist = [...TOURNAMENT_PRESETS[0].games];
    this.currentStep = 0;
    this.teams = [
      { id: 'team_red', name: '🔴 Kırmızı Kaplanlar', score: 0, wins: 0, color: '#EF4444' },
      { id: 'team_blue', name: '🔵 Mavi Şahinler', score: 0, wins: 0, color: '#3B82F6' }
    ];
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Turnuva Başlat Butonu (Parti Arenası tepesindeki banner)
    const btnOpenSetup = document.getElementById('btn-open-tournament-modal');
    if (btnOpenSetup) {
      btnOpenSetup.onclick = () => {
        sounds.playClick();
        this.openSetupModal();
      };
    }

    // Modal Kapat
    const btnCloseModal = document.getElementById('btn-close-tournament-modal');
    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        sounds.playClick();
        this.closeSetupModal();
      };
    }

    // Turnuvayı Başlat Butonu (Modal içi)
    const btnStart = document.getElementById('btn-start-tournament-flow');
    if (btnStart) {
      btnStart.onclick = () => {
        sounds.playFanfare();
        this.startTournament();
      };
    }
  }

  openSetupModal() {
    const modal = document.getElementById('modal-tournament-setup');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
  }

  closeSetupModal() {
    const modal = document.getElementById('modal-tournament-setup');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  setPreset(presetId) {
    this.currentPresetId = presetId;
    const found = TOURNAMENT_PRESETS.find(p => p.id === presetId);
    if (found) {
      this.playlist = [...found.games];
    }
    // Preset kartları stil güncelle
    document.querySelectorAll('.tournament-preset-card').forEach(card => {
      if (card.dataset.preset === presetId) {
        card.style.borderColor = '#00F5D4';
        card.style.background = 'rgba(0, 245, 212, 0.15)';
      } else {
        card.style.borderColor = 'rgba(255,255,255,0.15)';
        card.style.background = 'rgba(255,255,255,0.05)';
      }
    });
  }

  startTournament() {
    this.isActive = true;
    this.currentStep = 0;
    this.teams.forEach(t => {
      t.score = 0;
      t.wins = 0;
    });

    // Takım İsimlerini Inputlardan Oku
    const inRed = document.getElementById('input-tournament-team-red');
    const inBlue = document.getElementById('input-tournament-team-blue');
    if (inRed && inRed.value.trim()) this.teams[0].name = inRed.value.trim();
    if (inBlue && inBlue.value.trim()) this.teams[1].name = inBlue.value.trim();

    this.closeSetupModal();
    this.launchCurrentGame();
  }

  launchCurrentGame() {
    if (!this.isActive) return;
    if (this.currentStep >= this.playlist.length) {
      this.showFinalPodium();
      return;
    }

    const currentItem = this.playlist[this.currentStep];
    this.showFloatingHud();

    // İlgili oyun ekranına geçiş yap
    if (currentItem.id === 'headsup') {
      this.game.showScreen('home');
      this.game.showToast(`🏆 Turnuva 1. Raunt: ${currentItem.title}!`);
    } else if (currentItem.id === 'passaparola') {
      this.game.showScreen('passaparola');
      if (this.game.passaparolaEngine) {
        this.game.passaparolaEngine.init();
      }
    } else if (currentItem.id === 'carkifelek') {
      this.game.showScreen('carkifelek');
      if (this.game.carkifelekEngine) {
        this.game.carkifelekEngine.init();
      }
    } else if (currentItem.id === 'isim_sehir') {
      this.game.showScreen('isimSehir');
      if (this.game.isimSehirEngine) {
        this.game.isimSehirEngine.init();
      }
    } else if (currentItem.id === 'kelime_bombasi') {
      this.game.showScreen('kelimeBombasi');
      if (this.game.kelimeBombasiEngine) {
        this.game.kelimeBombasiEngine.init();
      }
    } else if (currentItem.id === 'aileler') {
      this.game.showScreen('ailelerYarisiyor');
      if (this.game.ailelerYarisiyorEngine) {
        this.game.ailelerYarisiyorEngine.init();
      }
    }
  }

  recordRoundResult(winningTeamId, points = 100) {
    if (!this.isActive) return;
    const team = this.teams.find(t => t.id === winningTeamId);
    if (team) {
      team.score += points;
      team.wins += 1;
    }
    this.currentStep++;
    this.showRoundSummaryModal(team, points);
  }

  showFloatingHud() {
    let hud = document.getElementById('tournament-live-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'tournament-live-hud';
      hud.style.cssText = `
        position: fixed;
        top: calc(env(safe-area-inset-top, 24px) + 8px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(251, 191, 36, 0.5);
        border-radius: 999px;
        padding: 4px 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 800;
        color: #FFF;
      `;
      document.body.appendChild(hud);
    }

    const cur = this.playlist[this.currentStep] || this.playlist[0];
    hud.innerHTML = `
      <span style="color:#FBBF24;">🏆 Raunt ${this.currentStep + 1}/${this.playlist.length}</span>
      <span style="opacity:0.4;">|</span>
      <span style="color:#EF4444;">${this.teams[0].score}</span>
      <span style="opacity:0.3;">vs</span>
      <span style="color:#3B82F6;">${this.teams[1].score}</span>
      <button type="button" id="btn-hud-tournament-abort" style="background:none; border:none; color:#94A3B8; font-size:0.9rem; cursor:pointer; margin-left:4px;">✕</button>
    `;
    hud.style.display = 'flex';

    const btnAbort = document.getElementById('btn-hud-tournament-abort');
    if (btnAbort) {
      btnAbort.onclick = () => {
        if (confirm('Turnuva modundan çıkmak istiyor musunuz? Puanlar sıfırlanacaktır.')) {
          this.endTournament();
        }
      };
    }
  }

  hideFloatingHud() {
    const hud = document.getElementById('tournament-live-hud');
    if (hud) hud.style.display = 'none';
  }

  showRoundSummaryModal(lastWinnerTeam, points) {
    sounds.playApplause();
    this.hideFloatingHud();

    let modal = document.getElementById('modal-tournament-round-summary');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-tournament-round-summary';
      modal.className = 'custom-modal-overlay active';
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center; padding: 16px;
      `;
      document.body.appendChild(modal);
    }

    const isLastRound = (this.currentStep >= this.playlist.length);
    const nextGame = isLastRound ? null : this.playlist[this.currentStep];

    modal.innerHTML = `
      <div class="custom-modal-content" style="background: linear-gradient(145deg, #1e1b4b, #0f172a); border: 2px solid #FBBF24; border-radius: 24px; padding: 24px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(251,191,36,0.3);">
        <div style="font-size: 3rem; margin-bottom: 8px;">🎉</div>
        <h2 style="font-size: 1.4rem; font-weight: 900; color: #FFF; margin: 0 0 4px;">Raunt Tamamlandı!</h2>
        <p style="font-size: 0.88rem; color: #FBBF24; font-weight: 800; margin-bottom: 16px;">
          ${lastWinnerTeam ? `🔥 ${lastWinnerTeam.name} +${points} Puan Kazandı!` : 'Dostluk Kazandı!'}
        </p>

        <!-- Canlı Puan Tablosu -->
        <div style="background: rgba(255,255,255,0.06); border-radius: 16px; padding: 14px; margin-bottom: 20px;">
          <div style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 10px;">
            Turnuva Puan Durumu (${this.currentStep}/${this.playlist.length} Oyun)
          </div>
          <div style="display:flex; justify-content:space-around; align-items:center;">
            <div style="text-align:center;">
              <div style="font-size:1rem; font-weight:900; color:#EF4444;">${this.teams[0].name}</div>
              <div style="font-size:1.8rem; font-weight:900; color:#FFF; margin-top:2px;">${this.teams[0].score}</div>
              <div style="font-size:0.75rem; color:#94A3B8;">${this.teams[0].wins} Galibiyet</div>
            </div>
            <div style="font-size:1.2rem; font-weight:900; color:#FBBF24;">VS</div>
            <div style="text-align:center;">
              <div style="font-size:1rem; font-weight:900; color:#3B82F6;">${this.teams[1].name}</div>
              <div style="font-size:1.8rem; font-weight:900; color:#FFF; margin-top:2px;">${this.teams[1].score}</div>
              <div style="font-size:0.75rem; color:#94A3B8;">${this.teams[1].wins} Galibiyet</div>
            </div>
          </div>
        </div>

        ${isLastRound ? `
          <button type="button" id="btn-tournament-to-podium" class="btn-primary-big" style="width:100%; padding:14px; font-size:1rem; font-weight:900; background:linear-gradient(135deg, #FBBF24, #F59E0B); color:#000;">
            👑 BÜYÜK KUPA TÖRENİNE GEÇ ➔
          </button>
        ` : `
          <button type="button" id="btn-tournament-next-round" class="btn-primary-big" style="width:100%; padding:14px; font-size:1rem; font-weight:900; background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#000;">
            ▶️ Sonraki Oyun: ${nextGame.title} ➔
          </button>
        `}
      </div>
    `;
    modal.style.display = 'flex';

    if (isLastRound) {
      document.getElementById('btn-tournament-to-podium').onclick = () => {
        modal.style.display = 'none';
        this.showFinalPodium();
      };
    } else {
      document.getElementById('btn-tournament-next-round').onclick = () => {
        modal.style.display = 'none';
        this.launchCurrentGame();
      };
    }
  }

  showFinalPodium() {
    this.hideFloatingHud();
    sounds.playFanfare();
    confetti.launch({ duration: 5000, particleCount: 150 });

    const sorted = [...this.teams].sort((a,b) => b.score - a.score);
    const champion = sorted[0];
    const runnerUp = sorted[1];
    const isTie = champion.score === runnerUp.score;

    let modal = document.getElementById('modal-tournament-podium');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-tournament-podium';
      modal.className = 'custom-modal-overlay active';
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10001;
        background: rgba(0,0,0,0.92); backdrop-filter: blur(14px);
        display: flex; align-items: center; justify-content: center; padding: 16px;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="custom-modal-content" style="background: linear-gradient(145deg, #2e1065, #0f172a); border: 2.5px solid #FBBF24; border-radius: 28px; padding: 28px 20px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 25px 60px rgba(251,191,36,0.4);">
        <div style="font-size: 4rem; filter: drop-shadow(0 0 20px rgba(251,191,36,0.8));">🏆</div>
        <div style="font-size: 0.8rem; font-weight: 800; color: #FBBF24; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px;">
          PARTİ GECESİ BÜYÜK ŞAMPİYONU
        </div>
        <h1 style="font-size: 1.8rem; font-weight: 900; color: #FFF; margin: 6px 0 16px;">
          ${isTie ? '🤝 BÜYÜK BERABERLİK!' : `🥇 ${champion.name}!`}
        </h1>

        <!-- Podyum Kartı -->
        <div style="display:flex; justify-content:center; align-items:flex-end; gap:14px; margin-bottom: 24px;">
          <!-- 2. İkinci -->
          <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:16px 16px 0 0; padding:14px 8px; border-top:3px solid #94A3B8;">
            <div style="font-size:1.4rem;">🥈</div>
            <div style="font-size:0.85rem; font-weight:800; color:#E2E8F0; margin-top:4px;">${runnerUp.name}</div>
            <div style="font-size:1.3rem; font-weight:900; color:#94A3B8;">${runnerUp.score} P</div>
          </div>
          <!-- 1. Şampiyon -->
          <div style="flex:1.2; background:linear-gradient(180deg, rgba(251,191,36,0.25), rgba(251,191,36,0.05)); border-radius:20px 20px 0 0; padding:20px 10px; border-top:4px solid #FBBF24;">
            <div style="font-size:2rem;">👑</div>
            <div style="font-size:0.95rem; font-weight:900; color:#FFF; margin-top:4px;">${champion.name}</div>
            <div style="font-size:1.6rem; font-weight:900; color:#FBBF24;">${champion.score} P</div>
          </div>
        </div>

        <button type="button" id="btn-finish-tournament" class="btn-primary-big" style="width:100%; padding:14px; font-size:1rem; font-weight:900; background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#000;">
          🏁 Turnuvayı Tamamla ve Menüye Dön
        </button>
      </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('btn-finish-tournament').onclick = () => {
      modal.style.display = 'none';
      this.endTournament();
      this.game.showScreen('partyGames');
    };
  }

  endTournament() {
    this.isActive = false;
    this.currentStep = 0;
    this.hideFloatingHud();
  }
}
