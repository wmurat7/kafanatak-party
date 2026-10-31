// js/aileler-yarisiyor-game.js
// Kafana Tak! - Aileler Yarışıyor (100 Kişiye Sorduk!) Efsane TV Stüdyo Motoru

import { sounds } from './audio.js';
import QRCode from './qrcode.esm.js';
import { firebaseNetwork } from './firebase-network.js';
import { HostModerationPanel } from './host-moderation-panel.js';
import {
  AILELER_YARISIYOR_QUESTIONS,
  AILELER_YARISIYOR_KIDS_QUESTIONS,
  matchAnswerIndex
} from './aileler-yarisiyor-data.js';

export class AilelerYarisiyorEngine {
  constructor(game) {
    this.game = game;
    this.categoryMode = 'adult'; // 'adult' (Klasik/Aile) or 'kids' (Çocuk Modu)
    this.stage = 'setup'; // 'setup', 'faceoff', 'playing', 'steal', 'round_summary', 'game_over'

    // Takımlar ve Skorlar
    this.team1Name = '🔴 Kırmızı Aile';
    this.team2Name = '🔵 Mavi Aile';
    this.scores = { red: 0, blue: 0 };
    this.round = 1;
    this.maxRounds = 4;

    // Aktif Tur Durumu
    this.activeTeam = 'red'; // 'red' or 'blue'
    this.currentQuestion = null;
    this.bankPoints = 0;
    this.strikes = 0; // 0, 1, 2, 3
    this.revealedAnswers = []; // boolean array [false, false, ...]
    this.roundMultiplier = 1; // 1x, 2x, 3x

    // Soru Havuzları (Tekrarsız Karıştırma)
    this.questionDeck = [];
    this.usedQuestions = new Set();

    // Çoklu Telefon (Zil & Pano)
    this.roomId = null;
    this.isMultiDevice = false;
    this.connectedPlayers = [];
    this.lastBuzzer = null;
    this.unsubscribeRoom = null;

    window.__ailelerYarisiyor = this;
  }

  init() {
    this.stage = 'setup';
    this.resetTournament();
    this.ensureBackButton();
    this.renderScreen();
  }

  ensureBackButton() {
    const btnBack = document.getElementById('btn-back-from-aileler-yarisiyor');
    if (btnBack) {
      btnBack.onclick = (e) => {
        if (e) e.preventDefault();
        sounds.playClick();
        if (this.unsubscribeRoom) {
          try { this.unsubscribeRoom(); } catch (err) {}
        }
        if (this.stage !== 'setup') {
          this.init();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        this.game.showScreen('partyGames');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }

  resetTournament() {
    this.scores = { red: 0, blue: 0 };
    this.round = 1;
    this.activeTeam = 'red';
    this.usedQuestions.clear();
    this.prepareDeck();
  }

  setCategoryMode(cat) {
    this.categoryMode = cat;
    this.resetTournament();
    this.renderScreen();
  }

  prepareDeck() {
    const source = this.categoryMode === 'kids'
      ? AILELER_YARISIYOR_KIDS_QUESTIONS
      : AILELER_YARISIYOR_QUESTIONS;

    this.questionDeck = [...source];
    // Fisher-Yates shuffle
    for (let i = this.questionDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questionDeck[i], this.questionDeck[j]] = [this.questionDeck[j], this.questionDeck[i]];
    }
  }

  startNewGame() {
    sounds.playClick();
    this.resetTournament();
    this.startRound(1);
  }

  startRound(roundNumber) {
    this.round = roundNumber;
    this.strikes = 0;
    this.bankPoints = 0;

    // Katsayı belirle: Tur 1-2: 1x, Tur 3: 2x, Tur 4: 3x
    if (this.round >= 4) {
      this.roundMultiplier = 3;
    } else if (this.round === 3) {
      this.roundMultiplier = 2;
    } else {
      this.roundMultiplier = 1;
    }

    // Sıradaki soruyu çek
    if (this.questionDeck.length === 0) {
      this.prepareDeck();
    }
    this.currentQuestion = this.questionDeck.pop();
    this.revealedAnswers = new Array(this.currentQuestion.answers.length).fill(false);

    // Açılış Aşaması: Kapışma / Face-off
    this.stage = 'faceoff';
    sounds.playBell();
    this.syncRoomState();
    this.renderScreen();
  }

  // --- 1. FACEOFF (KAPIŞMA) METOTLARI ---
  winFaceoff(team, chooseToPlay = true) {
    sounds.playCorrect();
    if (chooseToPlay) {
      this.activeTeam = team;
    } else {
      this.activeTeam = (team === 'red') ? 'blue' : 'red';
    }
    this.stage = 'playing';
    this.syncRoomState();
    this.renderScreen();
  }

  // --- 2. OYNAMA & CEVAP AÇMA METOTLARI ---
  handleUserAnswer(input) {
    if (this.stage !== 'playing' && this.stage !== 'steal') return;
    if (!input || !input.trim()) return;

    const matchedIdx = matchAnswerIndex(input, this.currentQuestion.answers);

    if (matchedIdx !== -1 && !this.revealedAnswers[matchedIdx]) {
      // Doğru cevap!
      this.revealAnswer(matchedIdx);
    } else {
      // Yanlış cevap!
      this.addStrike();
    }
  }

  revealAnswer(idx) {
    if (this.revealedAnswers[idx]) return;

    this.revealedAnswers[idx] = true;
    sounds.playCorrect();

    const ans = this.currentQuestion.answers[idx];
    const earnedPoints = ans.points * this.roundMultiplier;
    this.bankPoints += earnedPoints;

    // Eğer 'steal' aşamasındaysa ve bildilerse puanı çaldılar!
    if (this.stage === 'steal') {
      sounds.playApplause();
      sounds.playCheer();
      // Çalan takım puanları alır
      const stealingTeam = (this.activeTeam === 'red') ? 'blue' : 'red';
      this.scores[stealingTeam] += this.bankPoints;
      this.finishRound(`🏆 ${stealingTeam === 'red' ? this.team1Name : this.team2Name} PUANLARI ÇALDI! (+${this.bankPoints} P)`);
      return;
    }

    // Eğer panodaki TÜM cevaplar açıldıysa aktif takım kazanır
    const allRevealed = this.revealedAnswers.every(r => r === true);
    if (allRevealed) {
      sounds.playApplause();
      this.scores[this.activeTeam] += this.bankPoints;
      this.finishRound(`🎉 TÜM PANO AÇILDI! ${this.activeTeam === 'red' ? this.team1Name : this.team2Name} KAZANDI! (+${this.bankPoints} P)`);
      return;
    }

    this.syncRoomState();
    this.renderScreen();
  }

  addStrike() {
    if (sounds.playWrong) sounds.playWrong();
    else if (sounds.playPass) sounds.playPass();

    if (this.stage === 'steal') {
      // Karşı takım çalmaya çalışırken bilemedi! Puanlar ilk takıma kalır
      sounds.playApplause();
      this.scores[this.activeTeam] += this.bankPoints;
      this.finishRound(`❌ ÇALMA BAŞARISIZ! Puanlar ${this.activeTeam === 'red' ? this.team1Name : this.team2Name} takımına gitti! (+${this.bankPoints} P)`);
      return;
    }

    this.strikes++;
    this.syncRoomState();

    // 3 Çarpı olduysa ÇALMA (STEAL) aşamasına geç
    if (this.strikes >= 3) {
      setTimeout(() => {
        this.stage = 'steal';
        sounds.playBell();
        this.syncRoomState();
        this.renderScreen();
      }, 700);
    } else {
      this.renderScreen();
      // Kırmızı çarpı popup animasyonu
      this.triggerStrikeOverlay(this.strikes);
    }
  }

  triggerStrikeOverlay(count) {
    const overlay = document.getElementById('ay-strike-popup');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div style="font-size:5rem; animation:popIn 0.25s ease; filter:drop-shadow(0 0 25px #EF4444); color:#EF4444; font-weight:900;">
          ${'❌'.repeat(count)}
        </div>
      `;
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 900);
    }
  }

  finishRound(summaryMessage) {
    // Kalan kapalı cevapları göster
    this.revealedAnswers = this.revealedAnswers.map(() => true);
    this.stage = 'round_summary';
    this.roundSummaryMessage = summaryMessage;
    this.renderScreen();
  }

  nextRoundOrGameOver() {
    sounds.playClick();
    if (this.round >= this.maxRounds) {
      this.stage = 'game_over';
      sounds.playApplause();
      this.renderScreen();
    } else {
      this.startRound(this.round + 1);
    }
  }

  // --- 3. ARAYÜZ (RENDER) METOTLARI ---
  renderScreen() {
    const container = document.getElementById('screen-aileler-yarisiyor-content');
    if (!container) return;

    if (this.stage === 'setup') {
      container.innerHTML = this.renderSetupView();
      this.bindSetupEvents();
    } else if (this.stage === 'faceoff') {
      container.innerHTML = this.renderFaceoffView();
      this.bindFaceoffEvents();
    } else if (this.stage === 'playing' || this.stage === 'steal') {
      container.innerHTML = this.renderBoardView();
      this.bindBoardEvents();
    } else if (this.stage === 'round_summary') {
      container.innerHTML = this.renderRoundSummaryView();
      this.bindRoundSummaryEvents();
    } else if (this.stage === 'game_over') {
      container.innerHTML = this.renderGameOverView();
      this.bindGameOverEvents();
    }
  }

  renderScoreHeader() {
    const isRedTurn = this.activeTeam === 'red';
    const isBlueTurn = this.activeTeam === 'blue';

    return `
      <!-- Takım Skorları -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:12px; align-items:stretch;">
        <!-- Kırmızı Takım -->
        <div style="background:rgba(239,68,68,0.18); border:2px solid ${isRedTurn ? '#EF4444' : 'rgba(239,68,68,0.35)'}; border-radius:14px; padding:8px; text-align:center; box-shadow:${isRedTurn ? '0 0 15px rgba(239,68,68,0.4)' : 'none'};">
          <div style="font-size:0.75rem; font-weight:800; color:#EF4444; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${this.team1Name} ${isRedTurn ? '★' : ''}
          </div>
          <div style="font-size:1.4rem; font-weight:900; color:#FFF;">${this.scores.red} P</div>
        </div>

        <!-- Mavi Takım -->
        <div style="background:rgba(59,130,246,0.18); border:2px solid ${isBlueTurn ? '#3B82F6' : 'rgba(59,130,246,0.35)'}; border-radius:14px; padding:8px; text-align:center; box-shadow:${isBlueTurn ? '0 0 15px rgba(59,130,246,0.4)' : 'none'};">
          <div style="font-size:0.75rem; font-weight:800; color:#3B82F6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${this.team2Name} ${isBlueTurn ? '★' : ''}
          </div>
          <div style="font-size:1.4rem; font-weight:900; color:#FFF;">${this.scores.blue} P</div>
        </div>
      </div>
    `;
  }

  // --- 3.1. SETUP VIEW ---
  renderSetupView() {
    return `
      <div class="card" style="text-align:center; padding:22px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border:2px solid rgba(251,191,36,0.4); border-radius:20px;">
        <div style="font-size:3.2rem; margin-bottom:8px;">👨‍👩‍👧‍👦</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:#FFF; margin-bottom:6px;">AİLELER YARIŞIYOR</h2>
        <div style="display:inline-block; background:rgba(251,191,36,0.18); border:1px solid var(--gold); color:var(--gold); font-size:0.8rem; font-weight:900; padding:4px 14px; border-radius:999px; margin-bottom:14px;">
          👥 100 KİŞİYE SORDUK!
        </div>
        <p style="font-size:0.85rem; color:#CBD5E1; line-height:1.45; margin-bottom:18px;">
          Efsane televizyon yarışması! 100 kişiye sorduk, en popüler cevapları arıyoruz. Masadaki takımlar kapışsın, panodaki cevapları açtırıp 3 çarpıya düşmeden puanları cebe indirin!
        </p>

        <!-- Kategori Seçici: Klasik vs Çocuk -->
        <div style="font-size:0.78rem; font-weight:800; color:var(--gold); text-align:left; margin-bottom:6px;">SORU KATEGORİSİ:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
          <button type="button" id="btn-ay-mode-adult" class="rule-chip ${this.categoryMode === 'adult' ? 'active' : ''}" style="padding:10px; font-size:0.82rem; font-weight:900; justify-content:center; border-radius:12px; cursor:pointer;">
            🌟 Klasik / Aile Modu
          </button>
          <button type="button" id="btn-ay-mode-kids" class="rule-chip ${this.categoryMode === 'kids' ? 'active' : ''}" style="padding:10px; font-size:0.82rem; font-weight:900; justify-content:center; border-radius:12px; cursor:pointer;">
            🧒 Çocuk & Okul Modu
          </button>
        </div>

        <!-- Hakem Modu -->
        <div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:8px; margin-bottom:10px;">
          <span style="font-size:0.75rem; color:var(--text-muted); margin-right:8px;">Host Modu:</span>
          <span style="font-size:0.75rem; color:#10B981; font-weight:900;" id="ay-host-mode-status">KAPALI</span>
          <div style="margin-top:4px; display:flex; gap:4px;">
            <button type="button" id="ay-host-mode-toggle" style="background:rgba(16,185,129,0.2); border:1px solid #10B981; color:#10B981; font-size:0.7rem; font-weight:900; padding:3px 6px; border-radius:6px; cursor:pointer;">AÇ</button>
            <button type="button" id="ay-host-mode-toggle-kapali" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#EF4444; font-size:0.7rem; font-weight:900; padding:3px 6px; border-radius:6px; cursor:pointer;">KAPALI</button>
          </div>
        </div>

        <!-- Çoklu Telefon (Zil & Pano) Entegrasyonu -->
        <div style="background:rgba(0,0,0,0.35); border:1.5px solid ${this.isMultiDevice ? 'var(--gold)' : 'rgba(255,255,255,0.12)'}; border-radius:16px; padding:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="text-align:left;">
              <span style="font-size:0.85rem; font-weight:900; color:#FFF; display:block;">📱 Çoklu Telefon (Zil & Pano)</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">Oyuncular telefonlarını masabaşı zili yapsın</span>
            </div>
            <button type="button" id="btn-toggle-ay-multi" style="background:${this.isMultiDevice ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; color:${this.isMultiDevice ? '#0B0E14' : '#FFF'}; border:none; padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:900; cursor:pointer;">
              ${this.isMultiDevice ? 'AÇIK ✓' : 'AÇ +'}
            </button>
          </div>

          ${this.isMultiDevice ? `
            <div id="ay-multi-details" style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
              <div style="display:inline-block; background:rgba(251,191,36,0.18); border:1.5px solid var(--gold); padding:4px 16px; border-radius:999px; color:var(--gold); font-size:1rem; font-weight:900; letter-spacing:2px; margin-bottom:10px;">
                ODA: ${this.roomId || '----'}
              </div>
              <div id="ay-qr-canvas-box" style="margin:0 auto 10px; display:inline-block; background:#FFF; padding:6px; border-radius:12px;"></div>
              <div style="display:flex; justify-content:center; gap:8px;">
                <button type="button" id="btn-ay-copy-link" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-size:0.78rem; font-weight:800; padding:6px 12px; border-radius:10px; cursor:pointer;">
                  📋 Zil Bağlantısını Kopyala
                </button>
              </div>
              <div id="ay-connected-players-text" style="font-size:0.78rem; color:var(--gold); margin-top:8px; font-weight:800;">
                👥 Bağlı Yarışmacılar: ${this.connectedPlayers.length > 0 ? this.connectedPlayers.map(p => p.name).join(', ') : 'Bekleniyor...'}
              </div>
            </div>
          ` : ''}
        </div>

        <button type="button" id="btn-start-ay-game" class="btn-main btn-action-gold" style="background:linear-gradient(135deg, #FBBF24, #D97706) !important; color:#0B0E14 !important; font-size:1.15rem; font-weight:900; padding:15px; border-radius:999px; width:100%; box-shadow:0 6px 25px rgba(251,191,36,0.4); border:none; cursor:pointer;">
          🚀 YARIŞMAYI BAŞLAT!
        </button>
      </div>
    `;
  }

  bindSetupEvents() {
    document.getElementById('btn-ay-mode-adult')?.addEventListener('click', () => this.setCategoryMode('adult'));
    document.getElementById('btn-ay-mode-kids')?.addEventListener('click', () => this.setCategoryMode('kids'));
    document.getElementById('btn-start-ay-game')?.addEventListener('click', () => this.startNewGame());

    document.getElementById('ay-host-mode-toggle')?.addEventListener('click', () => {
      if (!this.game.hostMode) this.game.hostMode = 'aileler_yarisiyor';
      this.game.hostMode = null;
      this.renderScreen();
    });
    document.getElementById('ay-host-mode-toggle-kapali')?.addEventListener('click', () => {
      this.game.hostMode = 'aileler_yarisiyor';
      this.renderScreen();
    });

    document.getElementById('btn-toggle-ay-multi')?.addEventListener('click', () => this.toggleMultiDevice());
    document.getElementById('btn-ay-copy-link')?.addEventListener('click', () => {
      if (!this.roomId) return;
      const url = firebaseNetwork.getAilelerYarisiyorUrl(this.roomId);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        this.game.showToast('📋 Zil bağlantısı kopyalandı!');
      } else {
        prompt('Bağlantı:', url);
      }
    });

    if (this.isMultiDevice) {
      this.renderQrCode();
    }
  }

  renderQrCode() {
    const qrContainer = document.getElementById('ay-qr-canvas-box');
    if (!qrContainer || !this.roomId) return;
    qrContainer.innerHTML = '';

    const joinUrl = firebaseNetwork.getAilelerYarisiyorUrl(this.roomId);
    try {
      const cvs = document.createElement('canvas');
      qrContainer.appendChild(cvs);
      QRCode.toCanvas(cvs, joinUrl, {
        width: 150,
        margin: 1,
        color: { dark: '#D97706', light: '#FFFFFF' }
      }, (err) => {
        if (err) {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}" width="150" height="150" style="display:block; border-radius:8px;" />`;
        }
      });
    } catch (err) {
      qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}" width="150" height="150" style="display:block; border-radius:8px;" />`;
    }
  }

  async toggleMultiDevice() {
    sounds.playClick();
    this.isMultiDevice = !this.isMultiDevice;
    if (this.isMultiDevice) {
      if (!this.roomId) {
        this.roomId = firebaseNetwork.generateRoomCode();
      }
      await this.initMultiRoom();
    } else {
      if (this.unsubscribeRoom) {
        try { this.unsubscribeRoom(); } catch (e) {}
      }
    }
    this.renderScreen();
  }

  async initMultiRoom() {
    const initialData = {
      roomId: this.roomId,
      namespace: 'aileler_yarisiyor',
      stage: this.stage,
      round: this.round,
      roundMultiplier: this.roundMultiplier,
      activeTeam: this.activeTeam,
      bankPoints: this.bankPoints,
      strikes: this.strikes,
      question: this.currentQuestion ? this.currentQuestion.question : '',
      scores: this.scores,
      lastBuzzer: null
    };
    await firebaseNetwork.createRoom('aileler_yarisiyor', initialData);

    if (this.unsubscribeRoom) {
      try { this.unsubscribeRoom(); } catch (e) {}
    }

    this.unsubscribeRoom = firebaseNetwork.listenRoom('aileler_yarisiyor', this.roomId, (room) => {
      if (!room) return;
      if (room.players) {
        this.connectedPlayers = Object.values(room.players);
        this.renderConnectedPlayersUI();
      } else {
        this.connectedPlayers = [];
        this.renderConnectedPlayersUI();
      }
      if (room.actions) {
        const actionList = Object.values(room.actions);
        if (!this.processedActionIds) this.processedActionIds = new Set();
        const now = Date.now();
        actionList.forEach(act => {
          if (!act) return;
          const actId = act.id || (act.timestamp + '_' + act.type);
          if (!this.processedActionIds.has(actId) && (!act.timestamp || (now - act.timestamp) < 8000)) {
            this.processedActionIds.add(actId);
            this.handleIncomingAction(act);
          }
        });
      }
    });
  }

  renderConnectedPlayersUI() {
    const pContainer = document.getElementById('ay-connected-players-text');
    if (!pContainer) return;

    if (!this.connectedPlayers || this.connectedPlayers.length === 0) {
      pContainer.innerHTML = '<span style="color:var(--text-dim); font-size:0.78rem;">👥 Henüz bağlı yarışmacı yok. QR okutulduğunda burada listelenir.</span>';
      return;
    }

    pContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:0.78rem; color:#00F5D4; font-weight:800;">👥 Bağlı Yarışmacılar (${this.connectedPlayers.length}):</span>
        <button type="button" class="btn-host-moderation-badge" id="btn-ay-mod-open" style="padding:2px 8px; font-size:0.72rem; vertical-align:middle;">
          <span class="pulse-dot"></span> 🛡️ Yönetim Paneli
        </button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${this.connectedPlayers.map(p => {
          const isRed = p.team === 'red';
          return `
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1.5px solid ${isRed ? '#EF4444' : '#3B82F6'}; border-radius:999px; padding:4px 10px; font-size:0.8rem; font-weight:800;">
              <span>${isRed ? '🔴' : '🔵'}</span>
              <span style="color:#FFF;">${p.name || 'Yarışmacı'}</span>
              <button type="button" class="btn-ay-warn" data-id="${p.id}" data-name="${p.name}" style="background:rgba(251,191,36,0.2); border:1px solid #FBBF24; color:#FDE047; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="İkaz Gönder">⚠️ İkaz</button>
              <button type="button" class="btn-ay-kick" data-id="${p.id}" data-name="${p.name}" style="background:rgba(239,68,68,0.2); border:1px solid #EF4444; color:#FCA5A5; font-size:0.68rem; font-weight:900; border-radius:6px; padding:1px 5px; cursor:pointer;" title="Oyundan At">🚫 At</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-ay-mod-open')?.addEventListener('click', (e) => {
      e.stopPropagation();
      HostModerationPanel.open({
        namespace: 'aileler_yarisiyor',
        roomId: this.roomId,
        title: 'Aileler Yarışıyor Hakem Masası'
      });
    });

    pContainer.querySelectorAll('.btn-ay-warn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pId = btn.dataset.id;
        const pName = btn.dataset.name;
        const reason = prompt(`⚠️ ${pName} adlı yarışmacıya gönderilecek ikaz mesajı:`, 'Lütfen kurallara uyun ve ekrandan ayrılmayın!');
        if (reason && reason.trim()) {
          firebaseNetwork.warnPlayer('aileler_yarisiyor', this.roomId, pId, reason.trim());
          if (this.game && this.game.showToast) this.game.showToast(`⚠️ ${pName} ikaz edildi.`);
        }
      };
    });

    pContainer.querySelectorAll('.btn-ay-kick').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pId = btn.dataset.id;
        const pName = btn.dataset.name;
        if (confirm(`🚫 ${pName} adlı yarışmacıyı oyundan atmak istediğinize emin misiniz?`)) {
          firebaseNetwork.kickPlayer('aileler_yarisiyor', this.roomId, pId, 'Hakem masası tarafından oyundan çıkarıldınız.');
          this.connectedPlayers = this.connectedPlayers.filter(x => x.id !== pId);
          this.renderConnectedPlayersUI();
          if (this.game && this.game.showToast) this.game.showToast(`🚫 ${pName} odadan atıldı.`);
        }
      };
    });
  }

  handleIncomingAction(action) {
    if (!action) return;
    if (action.type === 'buzzer' && this.stage === 'faceoff') {
      sounds.playBell();
      this.lastBuzzer = action;
      const teamLabel = action.team === 'red' ? this.team1Name : this.team2Name;
      this.game.showToast(`🔔 [${action.playerName} (${teamLabel})] ZİLE İLK BASTI!`);
      this.winFaceoff(action.team, true);
    } else if (action.type === 'submit_answer') {
      this.game.showToast(`📱 [${action.playerName}]: "${action.answer}" cevabını verdi!`);
      this.handleUserAnswer(action.answer);
    } else if (action.type === 'reaction') {
      const text = (action.text || '').toLowerCase();
      if (text.includes('alkış') || text.includes('👏')) {
        sounds.playApplause();
      } else if (text.includes('zil') || text.includes('🔔')) {
        sounds.playBell();
      } else if (text.includes('dıııt') || text.includes('yanlış') || text.includes('❌')) {
        sounds.playWrong();
      } else if (text.includes('şampiyon') || text.includes('puan') || text.includes('🔥') || text.includes('oha') || text.includes('😱')) {
        sounds.playCheer();
      } else {
        sounds.playPop();
      }
      this.game.showToast(`💬 ${action.playerName}: ${action.text}`);
    }
  }

  renderQrCode() {
    const box = document.getElementById('ay-qr-canvas-box');
    if (!box || !this.roomId) return;
    box.innerHTML = '';

    const joinUrl = firebaseNetwork.getAilelerYarisiyorUrl(this.roomId);
    const cvs = document.createElement('canvas');
    cvs.style.display = 'block';
    cvs.style.borderRadius = '8px';
    box.appendChild(cvs);

    const fallbackImg = () => {
      box.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(joinUrl)}" width="170" height="170" style="display:block; border-radius:8px;" />`;
    };

    try {
      const qrEngine = (typeof QRCode !== 'undefined' && QRCode) || (typeof window !== 'undefined' && window.QRCode);
      if (qrEngine && qrEngine.toCanvas) {
        const res = qrEngine.toCanvas(cvs, joinUrl, {
          width: 170,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        }, (err) => {
          if (err) fallbackImg();
        });
        if (res && typeof res.catch === 'function') {
          res.catch(fallbackImg);
        }
      } else {
        fallbackImg();
      }
    } catch (err) {
      fallbackImg();
    }
  }

  async syncRoomState() {
    if (!this.isMultiDevice || !this.roomId) return;
    try {
      await firebaseNetwork.updateRoom('aileler_yarisiyor', this.roomId, {
        stage: this.stage,
        round: this.round,
        roundMultiplier: this.roundMultiplier,
        activeTeam: this.activeTeam,
        bankPoints: this.bankPoints,
        strikes: this.strikes,
        question: this.currentQuestion ? this.currentQuestion.question : '',
        scores: this.scores,
        lastBuzzer: this.lastBuzzer
      });
    } catch (e) {}
  }

  // --- 3.2. FACEOFF (KAPIŞMA) VIEW ---
  renderFaceoffView() {
    const q = this.currentQuestion;
    return `
      <div class="card" style="text-align:center; padding:18px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.9), rgba(15,23,42,0.95)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <div style="background:rgba(251,191,36,0.15); border:1px solid var(--gold); border-radius:12px; padding:6px 12px; margin-bottom:12px; font-size:0.85rem; font-weight:900; color:var(--gold);">
          🔔 1. AŞAMA: MASABAŞI KAPIŞMA (FACEOFF)
        </div>

        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px;">
          İki takımdan birer yarışmacı öne çıksın! Zile ilk basan takım cevabını söyler.
        </p>

        <!-- Soru Kartı -->
        <div style="background:rgba(0,0,0,0.5); border:2px solid var(--primary); border-radius:16px; padding:16px; margin-bottom:18px; box-shadow:0 0 20px rgba(0,245,212,0.25);">
          <div style="font-size:0.75rem; font-weight:800; color:var(--primary); margin-bottom:4px;">100 KİŞİYE SORDUK:</div>
          <div style="font-size:1.25rem; font-weight:900; color:#FFF; line-height:1.45;">
            "${q.question.replace(/^100 kişiye sorduk:\s*/i, '')}"
          </div>
        </div>

        <!-- Hangi Takım Kazandı? -->
        <div style="font-size:0.85rem; font-weight:900; color:#FFF; margin-bottom:10px;">
          Zile ilk basıp en iyi cevabı kim verdi?
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <button type="button" id="btn-win-faceoff-red" class="btn-main" style="background:linear-gradient(135deg, #EF4444, #B91C1C); color:#FFF; font-size:0.95rem; font-weight:900; padding:14px 8px; border-radius:14px; cursor:pointer;">
            🔴 Kırmızı Takım Kazandı
          </button>
          <button type="button" id="btn-win-faceoff-blue" class="btn-main" style="background:linear-gradient(135deg, #3B82F6, #1D4ED8); color:#FFF; font-size:0.95rem; font-weight:900; padding:14px 8px; border-radius:14px; cursor:pointer;">
            🔵 Mavi Takım Kazandı
          </button>
        </div>
      </div>
    `;
  }

  bindFaceoffEvents() {
    document.getElementById('btn-win-faceoff-red')?.addEventListener('click', () => this.winFaceoff('red'));
    document.getElementById('btn-win-faceoff-blue')?.addEventListener('click', () => this.winFaceoff('blue'));
  }

  // --- 3.3. BOARD (PANO & OYNAMA) VIEW ---
  renderBoardView() {
    const q = this.currentQuestion;
    const isSteal = this.stage === 'steal';
    const stealingTeam = (this.activeTeam === 'red') ? 'blue' : 'red';
    const currentTeamLabel = isSteal
      ? `🔥 PUAN ÇALMA SIRASI: ${stealingTeam === 'red' ? this.team1Name : this.team2Name}`
      : `🎯 SIRADAKİ TAKIM: ${this.activeTeam === 'red' ? this.team1Name : this.team2Name}`;

    // 1. Stüdyo TV Panosu (Yarışmacıların Gördüğü Kapalı/Açık Kutular)
    const boardTiles = q.answers.map((ans, idx) => {
      const isRevealed = !!this.revealedAnswers[idx];
      return `
        <div class="ay-board-tile" data-idx="${idx}" style="background:${isRevealed ? 'linear-gradient(135deg, #064E3B, #0F172A)' : 'linear-gradient(135deg, rgba(30,27,75,0.7), rgba(15,23,42,0.9))'}; border:2px solid ${isRevealed ? '#10B981' : 'rgba(251,191,36,0.35)'}; border-radius:14px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; min-height:54px; cursor:pointer; transition:all 0.25s ease; box-shadow:${isRevealed ? '0 0 16px rgba(16,185,129,0.35)' : '0 4px 12px rgba(0,0,0,0.3)'};">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:30px; height:30px; border-radius:50%; background:${isRevealed ? '#10B981' : 'rgba(251,191,36,0.2)'}; color:${isRevealed ? '#FFF' : '#FBBF24'}; font-weight:900; font-size:0.9rem; display:flex; align-items:center; justify-content:center; border:1.5px solid ${isRevealed ? '#10B981' : 'rgba(251,191,36,0.5)'};">
              ${idx + 1}
            </span>
            <div style="text-align:left;">
              <span style="font-size:1.02rem; font-weight:900; color:${isRevealed ? '#FFF' : '#94A3B8'}; letter-spacing:${isRevealed ? '0.5px' : '2px'};">
                ${isRevealed ? ans.text : '🔒 KAPALI KUTU'}
              </span>
            </div>
          </div>
          <div style="background:${isRevealed ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}; color:${isRevealed ? '#0B0E14' : '#64748B'}; font-weight:900; font-size:1.1rem; padding:4px 12px; border-radius:10px; font-family:monospace; min-width:44px; text-align:center;">
            ${isRevealed ? ans.points : '??'}
          </div>
        </div>
      `;
    });

    // 2. Sunucu / Hakem Kontrol Listesi (Sunucunun cevapları görerek tek tıkla açtığı özel konsol)
    const hostActionList = q.answers.map((ans, idx) => {
      const isRevealed = !!this.revealedAnswers[idx];
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:${isRevealed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}; border:1px solid ${isRevealed ? '#10B981' : 'rgba(255,255,255,0.15)'}; border-radius:10px; padding:6px 10px; margin-bottom:5px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.8rem; font-weight:900; color:${isRevealed ? '#10B981' : 'var(--gold)'};">${idx + 1}.</span>
            <span style="font-size:0.88rem; font-weight:800; color:#FFF; text-decoration:${isRevealed ? 'line-through' : 'none'}; opacity:${isRevealed ? '0.6' : '1'};">${ans.text}</span>
            <span style="font-size:0.75rem; color:var(--gold); font-weight:900;">(${ans.points}P)</span>
          </div>
          <button type="button" class="btn-host-open-tile" data-idx="${idx}" style="background:${isRevealed ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10B981, #059669)'}; color:${isRevealed ? '#94A3B8' : '#FFF'}; border:none; border-radius:8px; font-size:0.75rem; font-weight:900; padding:5px 12px; cursor:${isRevealed ? 'default' : 'pointer'};" ${isRevealed ? 'disabled' : ''}>
            ${isRevealed ? '✓ Açıldı' : '👁️ Aç'}
          </button>
        </div>
      `;
    });

    // Çarpı (Strike) Göstergesi
    const strikeIcons = [];
    for (let i = 0; i < 3; i++) {
      const active = i < this.strikes;
      strikeIcons.push(`
        <div style="width:38px; height:38px; border-radius:10px; background:${active ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.4)'}; border:2px solid ${active ? '#EF4444' : 'rgba(255,255,255,0.15)'}; display:flex; align-items:center; justify-content:center; font-size:1.3rem; font-weight:900; color:${active ? '#EF4444' : 'rgba(255,255,255,0.2)'}; filter:${active ? 'drop-shadow(0 0 8px #EF4444)' : 'none'};">
          ${active ? '❌' : ''}
        </div>
      `);
    }

    return `
      <div class="card" style="text-align:center; padding:16px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.95), rgba(15,23,42,0.98)); border-radius:20px; position:relative;">
        ${this.renderScoreHeader()}

        <!-- Sıradaki Takım & Durum Rozeti -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:900; background:${isSteal ? 'rgba(255,46,147,0.25)' : 'rgba(0,245,212,0.2)'}; color:${isSteal ? '#FF2E93' : '#00F5D4'}; padding:4px 12px; border-radius:999px; border:1px solid ${isSteal ? '#FF2E93' : '#00F5D4'};">
            ${currentTeamLabel}
          </span>
          <div style="display:flex; gap:6px;">
            ${strikeIcons.join('')}
          </div>
        </div>

        <!-- Tur Katsayısı & Kasa Puanı -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.35); padding:8px 12px; border-radius:12px; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">
            Tur: <strong style="color:#FFF;">${this.round} / ${this.maxRounds}</strong> (${this.roundMultiplier}X)
          </span>
          <span style="font-size:0.95rem; font-weight:900; color:var(--gold);">
            💰 KASA: ${this.bankPoints} P
          </span>
        </div>

        <!-- Soru Başlığı -->
        <div style="background:rgba(0,0,0,0.4); border-radius:12px; padding:10px 14px; margin-bottom:12px; text-align:left;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--gold);">SORU:</span>
          <div style="font-size:1.05rem; font-weight:900; color:#FFF; line-height:1.35;">
            "${q.question.replace(/^100 kişiye sorduk:\s*/i, '')}"
          </div>
        </div>

        <!-- 1. STÜDYO TV PANOSU (Yarışmacı Ekranı - Kapalı Kutular) -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
          ${boardTiles.join('')}
        </div>

        <!-- 2. SUNUCU / HAKEM CEVAP KONSOLU (Cevapları Gör ve Tek Tıkla Aç) -->
        <div style="background:rgba(16,185,129,0.1); border:1.5px solid rgba(16,185,129,0.4); border-radius:14px; padding:12px; margin-bottom:12px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.78rem; font-weight:900; color:#10B981; letter-spacing:0.5px;">
              🎙️ SUNUCU CEVAP KONSOLU (Doğru Cevabı Aç):
            </span>
          </div>
          ${hostActionList.join('')}
        </div>

        <!-- 3. CEVAP GİRİŞİ VEYA YANLIŞ CEVAP (+1 ÇARPI) BUTONU -->
        <div style="background:rgba(0,0,0,0.3); border-radius:14px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <input type="text" id="input-ay-answer" placeholder="Cevabı yazın veya yukarıdan açın..." style="flex:1; background:#0F172A; border:1.5px solid rgba(255,255,255,0.25); color:#FFF; font-size:0.92rem; font-weight:800; padding:11px 14px; border-radius:12px; outline:none;" />
            <button type="button" id="btn-submit-ay-answer" class="btn-main primary" style="padding:11px 16px; font-weight:900; font-size:0.95rem; border-radius:12px; cursor:pointer;">
              ✅ Dene
            </button>
          </div>

          <!-- Moderatör / Hakem Hızlı Çarpı Butonu -->
          <button type="button" id="btn-add-ay-strike" class="btn-secondary" style="width:100%; padding:11px; font-weight:900; font-size:0.9rem; border-radius:10px; background:rgba(239,68,68,0.18); border:1.5px solid #EF4444; color:#EF4444; cursor:pointer;">
            ❌ Yanlış Cevap Verildi (+1 Çarpı Ekle)
          </button>
        </div>

        <!-- Çarpı Tam Ekran Popup Alanı -->
        <div id="ay-strike-popup" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:100; align-items:center; justify-content:center; border-radius:20px;"></div>
      </div>
    `;
  }

  bindBoardEvents() {
    // 1. Panodaki kutulara tıklayarak doğrudan açma
    document.querySelectorAll('.ay-board-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.revealAnswer(idx);
      });
    });

    // 2. Sunucu konsolundaki "👁️ Aç" butonları
    document.querySelectorAll('.btn-host-open-tile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.revealAnswer(idx);
      });
    });

    // 3. Yazılı cevap girişi
    const submitBtn = document.getElementById('btn-submit-ay-answer');
    const inputEl = document.getElementById('input-ay-answer');

    const doSubmit = () => {
      if (inputEl && inputEl.value) {
        this.handleUserAnswer(inputEl.value);
        inputEl.value = '';
      }
    };

    submitBtn?.addEventListener('click', doSubmit);
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSubmit();
    });

    // 4. Yanlış Cevap (+1 Çarpı)
    document.getElementById('btn-add-ay-strike')?.addEventListener('click', () => {
      this.addStrike();
    });
  }

  // --- 3.4. ROUND SUMMARY VIEW ---
  renderRoundSummaryView() {
    const q = this.currentQuestion;

    const boardTiles = q.answers.map((ans, idx) => `
      <div style="background:linear-gradient(135deg, #064E3B, #0F172A); border:1.5px solid #10B981; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.9rem; font-weight:800; color:#FFF;">
          ${idx + 1}. ${ans.text}
        </span>
        <span style="background:var(--gold); color:#0B0E14; font-weight:900; font-size:0.95rem; padding:3px 8px; border-radius:6px; font-family:monospace;">
          ${ans.points}
        </span>
      </div>
    `);

    return `
      <div class="card" style="text-align:center; padding:20px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.95), rgba(15,23,42,0.98)); border-radius:20px;">
        ${this.renderScoreHeader()}

        <div style="font-size:2.8rem; margin-bottom:6px;">🎉</div>
        <h3 style="font-size:1.35rem; font-weight:900; color:var(--gold); margin-bottom:8px;">
          ${this.roundSummaryMessage}
        </h3>

        <!-- Tüm Panonun Açık Hali -->
        <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); margin-bottom:8px; text-align:left;">
          TÜM ANKET CEVAPLARI:
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:18px;">
          ${boardTiles.join('')}
        </div>

        <button type="button" id="btn-ay-next-round" class="btn-main primary" style="font-size:1.05rem; font-weight:900; padding:14px; border-radius:999px; width:100%; box-shadow:0 6px 20px rgba(0,245,212,0.4); cursor:pointer;">
          ${this.round >= this.maxRounds ? '🏆 Büyük Şampiyonluk Sonucuna Geç ➔' : `➡️ ${this.round + 1}. Tura Geç (${this.round + 1 >= 4 ? '3X' : (this.round + 1 === 3 ? '2X' : '1X')}) ➔`}
        </button>
      </div>
    `;
  }

  bindRoundSummaryEvents() {
    document.getElementById('btn-ay-next-round')?.addEventListener('click', () => {
      this.nextRoundOrGameOver();
    });
  }

  // --- 3.5. GAME OVER VIEW ---
  renderGameOverView() {
    let winnerText = '';
    if (this.scores.red > this.scores.blue) {
      winnerText = `🏆 ${this.team1Name.toUpperCase()} ŞAMPİYON!`;
    } else if (this.scores.blue > this.scores.red) {
      winnerText = `🏆 ${this.team2Name.toUpperCase()} ŞAMPİYON!`;
    } else {
      winnerText = '🤝 DOSTLUK KAZANDI! BERABERE!';
    }

    return `
      <div class="card" style="text-align:center; padding:24px; max-width:480px; margin:0 auto; background:linear-gradient(135deg, rgba(30,27,75,0.95), rgba(15,23,42,0.98)); border:2px solid var(--gold); border-radius:24px; box-shadow:0 0 35px rgba(251,191,36,0.3);">
        <div style="font-size:4rem; margin-bottom:8px;">🏆</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:var(--gold); margin-bottom:16px;">
          ${winnerText}
        </h2>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:22px;">
          <div style="background:rgba(239,68,68,0.2); border:2px solid #EF4444; border-radius:16px; padding:16px;">
            <div style="font-size:0.85rem; font-weight:800; color:#EF4444;">${this.team1Name}</div>
            <div style="font-size:2.2rem; font-weight:900; color:#FFF;">${this.scores.red} P</div>
          </div>
          <div style="background:rgba(59,130,246,0.2); border:2px solid #3B82F6; border-radius:16px; padding:16px;">
            <div style="font-size:0.85rem; font-weight:800; color:#3B82F6;">${this.team2Name}</div>
            <div style="font-size:2.2rem; font-weight:900; color:#FFF;">${this.scores.blue} P</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button type="button" id="btn-ay-restart" class="btn-main primary" style="font-size:1rem; font-weight:900; padding:14px; border-radius:14px; cursor:pointer;">
            🔄 Yeni Turnuva
          </button>
          <button type="button" id="btn-ay-back-arena" class="btn-secondary" style="font-size:1rem; font-weight:800; padding:14px; border-radius:14px; cursor:pointer;">
            ← Parti Arenası
          </button>
        </div>
      </div>
    `;
  }

  bindGameOverEvents() {
    document.getElementById('btn-ay-restart')?.addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-ay-back-arena')?.addEventListener('click', () => {
      this.game.showScreen('partyGames');
    });
  }
}
