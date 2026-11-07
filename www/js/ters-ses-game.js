// js/ters-ses-game.js
// Kafana Tak! & Parti Arenası - 10. Efsane Oyun: "Ters Ses (Geri Vites / Ters Köşe)"
// Web Audio API ve konuşma motoruyla kelimeleri tersten çalar, ters ses taklidini
// anında tersine çevirerek mikrofon kaydını hoparlörden orijinal ses olarak patlatır!

import { sounds } from './audio.js';
import { confettiEffect } from './confetti.js';
import { contentSync } from './content-sync.js';

export function reverseWordPhonetic(word) {
  if (!word) return '';
  const clean = word.trim();
  const words = clean.split(' ');
  // Kelime kelime tersine çevirerek telaffuz ritmini koru
  const revWords = words.map(w => {
    const chars = Array.from(w);
    const rev = chars.reverse().join('');
    return rev.charAt(0).toLocaleUpperCase('tr-TR') + rev.slice(1).toLocaleLowerCase('tr-TR');
  });
  return revWords.reverse().join(' ');
}

export class TersSesEngine {
  constructor(game) {
    this.game = game;
    this.activeMode = 'guess'; // 'guess' (Uzaylı Dilini Çöz) | 'mimic' (Geri Vites Taklidi)
    this.wordsList = [];
    this.currentIndex = 0;
    this.currentWord = null;
    this.isRevealed = false;
    this.hintOpened = false;

    // Skorlar (Takımlar)
    this.scores = {
      teamA: 0,
      teamB: 0
    };

    // Ses ve Mikrofon Kaydı Durumu
    this.audioCtx = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.lastRecordedBuffer = null;
  }

  init() {
    this.wordsList = this.shuffleArray(contentSync.getTersSesWords());
    this.currentIndex = 0;
    this.scores.teamA = 0;
    this.scores.teamB = 0;

    this.renderUI();
    this.loadWord(0);
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  shuffleArray(arr) {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  renderUI() {
    const container = document.getElementById('screen-ters-ses-content');
    if (!container) return;

    container.innerHTML = `
      <div class="ters-ses-wrap" style="display:flex; flex-direction:column; gap:14px; color:#FFFFFF;">
        <!-- Üst Bar: Geri Dön & Başlık & Mod Seçici -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <button type="button" id="btn-back-ters-ses" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.18); color:#CBD5E1; font-weight:800; font-size:0.85rem; padding:8px 14px; border-radius:12px; cursor:pointer;">
            ← Parti Arenası
          </button>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:1.3rem;">🔄</span>
            <span style="font-size:1.05rem; font-weight:900; background:linear-gradient(135deg, #00F5D4, #7928CA); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">TERS SES</span>
          </div>
          <button type="button" id="btn-ters-ses-guide" style="background:rgba(0,245,212,0.12); border:1.5px solid rgba(0,245,212,0.35); color:#00F5D4; font-weight:800; font-size:0.82rem; padding:8px 12px; border-radius:12px; cursor:pointer;">
            📖 Kurallar
          </button>
        </div>

        <!-- Mod Değiştirme Butonları (Haplar) -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:rgba(15,23,42,0.8); padding:6px; border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
          <button type="button" id="btn-mode-guess" class="ters-mode-tab active" style="background:linear-gradient(135deg, #7928CA, #FF0080); color:#FFF; border:none; padding:10px; border-radius:12px; font-weight:900; font-size:0.86rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>🎧</span> <span>Uzaylı Dilini Çöz</span>
          </button>
          <button type="button" id="btn-mode-mimic" class="ters-mode-tab" style="background:transparent; color:#94A3B8; border:none; padding:10px; border-radius:12px; font-weight:800; font-size:0.86rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>🎙️</span> <span>Geri Vites Challenge</span>
          </button>
        </div>

        <!-- Takım Skorları Barı -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.7); border:1.5px solid rgba(255,255,255,0.12); border-radius:16px; padding:10px 16px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.1rem;">🔴</span>
            <div>
              <div style="font-size:0.75rem; color:#94A3B8; font-weight:700;">Kırmızı Takım</div>
              <div id="ts-score-team-a" style="font-size:1.15rem; font-weight:900; color:#FF416C;">0 Puan</div>
            </div>
          </div>
          <div style="font-size:0.8rem; font-weight:800; color:#CBD5E1; background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:999px;">
            Kelime <span id="ts-word-counter">1 / 25</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; text-align:right;">
            <div>
              <div style="font-size:0.75rem; color:#94A3B8; font-weight:700;">Mavi Takım</div>
              <div id="ts-score-team-b" style="font-size:1.15rem; font-weight:900; color:#00F5D4;">0 Puan</div>
            </div>
            <span style="font-size:1.1rem;">🔵</span>
          </div>
        </div>

        <!-- Ana Oyun Sahnesi -->
        <div style="background:linear-gradient(135deg, rgba(20,25,45,0.92), rgba(10,14,28,0.98)); border:2px solid rgba(0,245,212,0.3); border-radius:24px; padding:22px 18px; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.5); position:relative; overflow:hidden;">
          
          <!-- Kategori ve Zorluk Rozeti -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:14px;">
            <span id="ts-cat-tag" style="background:rgba(0,245,212,0.15); border:1px solid rgba(0,245,212,0.35); color:#00F5D4; font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:999px;">
              📁 Kategori
            </span>
            <span id="ts-diff-tag" style="background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.35); color:#FBBF24; font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:999px;">
              ⚡ Kolay
            </span>
          </div>

          <!-- Mod 1 İçeriği (Hızlı Tahmin) -->
          <div id="ts-view-guess">
            <div style="font-size:0.85rem; color:#94A3B8; margin-bottom:8px;">Tersten Okunan Gizemli Ses:</div>
            <div id="ts-reverse-text" style="font-size:1.85rem; font-weight:900; color:#FBBF24; letter-spacing:3px; margin:10px 0; min-height:44px; display:flex; align-items:center; justify-content:center; text-shadow:0 0 20px rgba(251,191,36,0.4);">
              ...
            </div>

            <!-- Ses Çalma Butonları -->
            <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:10px; margin:16px 0;">
              <button type="button" id="btn-play-reverse" style="background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#061426; border:none; border-radius:16px; padding:14px; font-size:1.02rem; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 8px 25px rgba(0,245,212,0.35);">
                <span style="font-size:1.25rem;">🔊</span> <span>TERSTEN DİNLE</span>
              </button>
              <button type="button" id="btn-play-slow" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.22); color:#FFFFFF; border-radius:16px; padding:14px; font-size:0.92rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>🐢</span> <span>Yavaşlat (%70)</span>
              </button>
            </div>

            <!-- İpucu Kutusu -->
            <div id="ts-hint-box" style="display:none; background:rgba(251,191,36,0.1); border:1.5px dashed rgba(251,191,36,0.4); border-radius:14px; padding:10px 14px; margin-bottom:14px; font-size:0.88rem; color:#FDE68A; line-height:1.4;">
              💡 <strong>İpucu:</strong> <span id="ts-hint-text">...</span>
            </div>
            
            <button type="button" id="btn-toggle-hint" style="background:transparent; border:none; color:#FBBF24; font-size:0.84rem; font-weight:800; text-decoration:underline; cursor:pointer; margin-bottom:14px;">
              💡 İpucu Göster
            </button>

            <!-- Gizli Cevap Gösterim Sahnesi -->
            <div id="ts-answer-box" style="display:none; background:rgba(16,185,129,0.15); border:2px solid #10B981; border-radius:18px; padding:14px; margin-bottom:16px; animation:scaleUp 0.3s ease;">
              <div style="font-size:0.8rem; color:#6EE7B7; font-weight:700;">DOĞRU KELİME:</div>
              <div id="ts-real-word" style="font-size:1.75rem; font-weight:900; color:#FFFFFF; letter-spacing:1px; margin:6px 0;">
                ...
              </div>
              <button type="button" id="btn-play-normal" style="background:#10B981; color:#06231A; border:none; padding:8px 16px; border-radius:999px; font-weight:900; font-size:0.85rem; cursor:pointer; margin-top:4px;">
                ▶️ Düz Halini Dinle
              </button>
            </div>

            <!-- Cevabı Aç Butonu -->
            <button type="button" id="btn-reveal-answer" style="width:100%; background:linear-gradient(135deg, #FF0080, #7928CA); color:#FFF; border:none; border-radius:16px; padding:14px; font-size:1.02rem; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 8px 25px rgba(255,0,128,0.3); margin-bottom:14px;">
              <span>👁️</span> <span>CEVABI GÖSTER & DÜZ ÇAL</span>
            </button>
          </div>

          <!-- Mod 2 İçeriği (Geri Vites Challenge - Canlı Mikrofon Taklidi) -->
          <div id="ts-view-mimic" style="display:none;">
            <div style="font-size:0.84rem; color:#CBD5E1; margin-bottom:8px; line-height:1.4;">
              1. Oyuncu kulaklıkla/gizlice ters sesi dinler. Mikrofon butonuna basılı tutarak o ters sesi taklit eder!
            </div>
            
            <div id="ts-mimic-secret-panel" style="background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:12px; margin-bottom:14px;">
              <button type="button" id="btn-peek-secret" style="background:rgba(0,245,212,0.15); border:1px solid rgba(0,245,212,0.4); color:#00F5D4; font-size:0.85rem; font-weight:800; padding:8px 16px; border-radius:10px; cursor:pointer;">
                👀 Gizli Kelimeyi Gör (Sadece 1. Oyuncu)
              </button>
              <div id="ts-peek-text" style="display:none; font-size:1.25rem; font-weight:900; color:#FBBF24; margin-top:8px;"></div>
            </div>

            <button type="button" id="btn-play-reverse-mimic" style="width:100%; background:rgba(0,245,212,0.18); border:1.5px solid rgba(0,245,212,0.4); color:#00F5D4; border-radius:14px; padding:12px; font-size:0.95rem; font-weight:800; cursor:pointer; margin-bottom:14px;">
              🔊 Tersten Sesini Dinle (Taklit İçin)
            </button>

            <!-- Dev Mikrofon Kayıt Butonu -->
            <div style="margin:16px 0;">
              <button type="button" id="btn-record-mimic" style="width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg, #EF4444, #B91C1C); border:4px solid rgba(255,255,255,0.3); color:#FFF; font-size:2.2rem; cursor:pointer; box-shadow:0 0 30px rgba(239,68,68,0.5); display:inline-flex; align-items:center; justify-content:center; transition:transform 0.15s ease, box-shadow 0.15s ease;">
                🎙️
              </button>
              <div id="ts-record-status" style="font-size:0.85rem; font-weight:800; color:#CBD5E1; margin-top:10px;">
                Mikrofon butonuna BASILI TUT ve taklit et!
              </div>
            </div>

            <!-- Kayıt Ters Çalma Butonu -->
            <div id="ts-recorded-playback-box" style="display:none; background:rgba(121,40,202,0.2); border:1.5px solid rgba(121,40,202,0.5); border-radius:16px; padding:12px; margin-top:14px;">
              <div style="font-size:0.8rem; color:#D8B4FE; font-weight:700; margin-bottom:6px;">SESİNİZ TERSİNE ÇEVRİLDİ!</div>
              <button type="button" id="btn-play-user-reversed" style="background:linear-gradient(135deg, #7928CA, #FF0080); color:#FFF; border:none; padding:12px 20px; border-radius:12px; font-weight:900; font-size:0.95rem; cursor:pointer; width:100%;">
                🔄 Taklidini Tersten Oynat (Orijinal Ses Çıkacak mı?!)
              </button>
            </div>
          </div>

          <!-- Puan Verme & Sıradaki Kelime Butonları -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1);">
            <button type="button" id="btn-award-team-a" style="background:linear-gradient(135deg, #FF416C, #FF4B2B); color:#FFF; border:none; border-radius:14px; padding:12px; font-weight:900; font-size:0.88rem; cursor:pointer;">
              🔴 Kırmızı Bildi (+10)
            </button>
            <button type="button" id="btn-award-team-b" style="background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#061426; border:none; border-radius:14px; padding:12px; font-weight:900; font-size:0.88rem; cursor:pointer;">
              🔵 Mavi Bildi (+10)
            </button>
          </div>
          <button type="button" id="btn-next-word" style="width:100%; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); color:#FFFFFF; border-radius:14px; padding:11px; font-weight:800; font-size:0.9rem; cursor:pointer; margin-top:10px;">
            ⏭️ Sıradaki Kelimeye Geç ➔
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Geri Dön Butonu
    const btnBack = document.getElementById('btn-back-ters-ses');
    if (btnBack) {
      btnBack.onclick = () => {
        this.stopSpeech();
        this.game.showScreen('partyGames');
      };
    }

    // Rehber / Kurallar
    const btnGuide = document.getElementById('btn-ters-ses-guide');
    if (btnGuide) {
      btnGuide.onclick = () => {
        if (typeof window.showPartyGuideModal === 'function') {
          window.showPartyGuideModal('ters-ses');
        } else {
          alert('Ters Ses: Kelimelerin tersten okunuşunu dinleyin, doğru kelimeyi rakiplerinizden önce tahmin edin!');
        }
      };
    }

    // Mod Geçişleri
    const btnModeGuess = document.getElementById('btn-mode-guess');
    const btnModeMimic = document.getElementById('btn-mode-mimic');
    const viewGuess = document.getElementById('ts-view-guess');
    const viewMimic = document.getElementById('ts-view-mimic');

    if (btnModeGuess && btnModeMimic && viewGuess && viewMimic) {
      btnModeGuess.onclick = () => {
        sounds.playClick();
        this.activeMode = 'guess';
        btnModeGuess.style.background = 'linear-gradient(135deg, #7928CA, #FF0080)';
        btnModeGuess.style.color = '#FFF';
        btnModeMimic.style.background = 'transparent';
        btnModeMimic.style.color = '#94A3B8';
        viewGuess.style.display = 'block';
        viewMimic.style.display = 'none';
      };

      btnModeMimic.onclick = () => {
        sounds.playClick();
        this.activeMode = 'mimic';
        btnModeMimic.style.background = 'linear-gradient(135deg, #7928CA, #FF0080)';
        btnModeMimic.style.color = '#FFF';
        btnModeGuess.style.background = 'transparent';
        btnModeGuess.style.color = '#94A3B8';
        viewGuess.style.display = 'none';
        viewMimic.style.display = 'block';
      };
    }

    // Ses Çalma Butonları (Mod 1)
    const btnPlayReverse = document.getElementById('btn-play-reverse');
    if (btnPlayReverse) {
      btnPlayReverse.onclick = () => this.speakReversed(1.0);
    }

    const btnPlaySlow = document.getElementById('btn-play-slow');
    if (btnPlaySlow) {
      btnPlaySlow.onclick = () => this.speakReversed(0.68);
    }

    const btnPlayNormal = document.getElementById('btn-play-normal');
    if (btnPlayNormal) {
      btnPlayNormal.onclick = () => this.speakNormal();
    }

    // İpucu Açma / Kapama
    const btnToggleHint = document.getElementById('btn-toggle-hint');
    const hintBox = document.getElementById('ts-hint-box');
    if (btnToggleHint && hintBox) {
      btnToggleHint.onclick = () => {
        this.hintOpened = !this.hintOpened;
        hintBox.style.display = this.hintOpened ? 'block' : 'none';
        btnToggleHint.textContent = this.hintOpened ? '❌ İpucunu Gizle' : '💡 İpucu Göster';
        sounds.playClick();
      };
    }

    // Cevabı Göster Butonu
    const btnRevealAnswer = document.getElementById('btn-reveal-answer');
    if (btnRevealAnswer) {
      btnRevealAnswer.onclick = () => this.revealAnswer();
    }

    // Skor Verme Butonları
    const btnTeamA = document.getElementById('btn-award-team-a');
    if (btnTeamA) {
      btnTeamA.onclick = () => {
        this.scores.teamA += 10;
        this.updateScoreUI();
        sounds.playCorrect();
        confettiEffect.fire({ particleCount: 35, spread: 55, origin: { x: 0.2, y: 0.7 } });
        if (!this.isRevealed) this.revealAnswer();
      };
    }

    const btnTeamB = document.getElementById('btn-award-team-b');
    if (btnTeamB) {
      btnTeamB.onclick = () => {
        this.scores.teamB += 10;
        this.updateScoreUI();
        sounds.playCorrect();
        confettiEffect.fire({ particleCount: 35, spread: 55, origin: { x: 0.8, y: 0.7 } });
        if (!this.isRevealed) this.revealAnswer();
      };
    }

    // Sıradaki Kelime
    const btnNext = document.getElementById('btn-next-word');
    if (btnNext) {
      btnNext.onclick = () => {
        sounds.playClick();
        this.nextWord();
      };
    }

    // Mod 2: Gizli Kelimeyi Gör
    const btnPeek = document.getElementById('btn-peek-secret');
    const peekText = document.getElementById('ts-peek-text');
    if (btnPeek && peekText) {
      btnPeek.onclick = () => {
        if (peekText.style.display === 'none') {
          peekText.style.display = 'block';
          peekText.textContent = `🤫 Gizli: "${this.currentWord ? this.currentWord.word : ''}"`;
          btnPeek.textContent = '🙈 Gizle';
        } else {
          peekText.style.display = 'none';
          btnPeek.textContent = '👀 Gizli Kelimeyi Gör (Sadece 1. Oyuncu)';
        }
      };
    }

    const btnPlayRevMimic = document.getElementById('btn-play-reverse-mimic');
    if (btnPlayRevMimic) {
      btnPlayRevMimic.onclick = () => this.speakReversed(0.85);
    }

    // Mikrofon Basılı Tut Kayıt (Touch & Mouse)
    const btnRecord = document.getElementById('btn-record-mimic');
    if (btnRecord) {
      const startRec = (e) => {
        e.preventDefault();
        this.startMicRecording();
      };
      const stopRec = (e) => {
        e.preventDefault();
        this.stopMicRecording();
      };

      btnRecord.addEventListener('mousedown', startRec);
      btnRecord.addEventListener('mouseup', stopRec);
      btnRecord.addEventListener('touchstart', startRec, { passive: false });
      btnRecord.addEventListener('touchend', stopRec, { passive: false });
    }

    // Kullanıcı Sesini Tersten Çalma
    const btnPlayUserRev = document.getElementById('btn-play-user-reversed');
    if (btnPlayUserRev) {
      btnPlayUserRev.onclick = () => this.playReversedBuffer();
    }
  }

  loadWord(index) {
    if (!this.wordsList || this.wordsList.length === 0) {
      this.wordsList = contentSync.getTersSesWords();
    }
    if (index >= this.wordsList.length) {
      this.wordsList = this.shuffleArray(this.wordsList);
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    this.currentWord = this.wordsList[this.currentIndex];
    this.isRevealed = false;
    this.hintOpened = false;

    // DOM Güncelle
    const counter = document.getElementById('ts-word-counter');
    if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.wordsList.length}`;

    const catTag = document.getElementById('ts-cat-tag');
    if (catTag) catTag.textContent = `📁 ${this.currentWord.category || 'Genel'}`;

    const diffTag = document.getElementById('ts-diff-tag');
    if (diffTag) {
      const diff = (this.currentWord.difficulty || 'kolay').toLowerCase();
      diffTag.textContent = diff === 'zor' ? '🔥 Zor (+20 Puan)' : diff === 'orta' ? '⚡ Orta (+15 Puan)' : '🟢 Kolay (+10 Puan)';
    }

    const reverseTextEl = document.getElementById('ts-reverse-text');
    if (reverseTextEl) {
      reverseTextEl.textContent = `"${reverseWordPhonetic(this.currentWord.word)}"`;
    }

    const hintTextEl = document.getElementById('ts-hint-text');
    if (hintTextEl) {
      hintTextEl.textContent = `${this.currentWord.hint || ''} (${this.currentWord.word.length} Harf)`;
    }

    const hintBox = document.getElementById('ts-hint-box');
    if (hintBox) hintBox.style.display = 'none';

    const btnToggleHint = document.getElementById('btn-toggle-hint');
    if (btnToggleHint) btnToggleHint.textContent = '💡 İpucu Göster';

    const answerBox = document.getElementById('ts-answer-box');
    if (answerBox) answerBox.style.display = 'none';

    const peekText = document.getElementById('ts-peek-text');
    if (peekText) {
      peekText.style.display = 'none';
      peekText.textContent = '';
    }
    const btnPeek = document.getElementById('btn-peek-secret');
    if (btnPeek) btnPeek.textContent = '👀 Gizli Kelimeyi Gör (Sadece 1. Oyuncu)';

    const recPlayback = document.getElementById('ts-recorded-playback-box');
    if (recPlayback) recPlayback.style.display = 'none';

    // Yeni kelime geldiğinde otomatik ilk ters dinletiyi yap
    setTimeout(() => {
      this.speakReversed(1.0);
    }, 450);
  }

  nextWord() {
    this.loadWord(this.currentIndex + 1);
  }

  updateScoreUI() {
    const aEl = document.getElementById('ts-score-team-a');
    if (aEl) aEl.textContent = `${this.scores.teamA} Puan`;
    const bEl = document.getElementById('ts-score-team-b');
    if (bEl) bEl.textContent = `${this.scores.teamB} Puan`;
  }

  revealAnswer() {
    if (!this.currentWord) return;
    this.isRevealed = true;

    const answerBox = document.getElementById('ts-answer-box');
    const realWordEl = document.getElementById('ts-real-word');
    if (answerBox && realWordEl) {
      realWordEl.textContent = this.currentWord.word.toLocaleUpperCase('tr-TR');
      answerBox.style.display = 'block';
    }

    sounds.playVictory();
    this.speakNormal();
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  speakReversed(rate = 1.0) {
    if (!this.currentWord) return;
    this.stopSpeech();

    const revText = reverseWordPhonetic(this.currentWord.word);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(revText);
      utterance.lang = 'tr-TR';
      utterance.rate = rate;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }

  speakNormal() {
    if (!this.currentWord) return;
    this.stopSpeech();

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(this.currentWord.word);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Mod 2: Mikrofon Kaydı Başlat
   */
  async startMicRecording() {
    if (this.isRecording) return;
    try {
      this.recordedChunks = [];
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      const btnRecord = document.getElementById('btn-record-mimic');
      const statusEl = document.getElementById('ts-record-status');
      if (btnRecord) {
        btnRecord.style.transform = 'scale(1.15)';
        btnRecord.style.boxShadow = '0 0 45px #EF4444';
      }
      if (statusEl) {
        statusEl.innerHTML = '<span style="color:#EF4444; font-weight:900;">🔴 KAYDEDİLİYOR... Konuşun!</span>';
      }
    } catch (err) {
      console.warn('Mikrofon erişim hatası:', err);
      alert('Mikrofon izni alınamadı: ' + err.message);
    }
  }

  /**
   * Mod 2: Mikrofon Kaydını Bitir & Sesi Tersine Çevir
   */
  async stopMicRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    this.isRecording = false;

    const btnRecord = document.getElementById('btn-record-mimic');
    const statusEl = document.getElementById('ts-record-status');
    if (btnRecord) {
      btnRecord.style.transform = 'scale(1.0)';
      btnRecord.style.boxShadow = '0 0 30px rgba(239,68,68,0.5)';
    }
    if (statusEl) {
      statusEl.textContent = '⏳ Ses tersine çevriliyor...';
    }

    this.mediaRecorder.onstop = async () => {
      try {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const arrayBuffer = await blob.arrayBuffer();

        const ctx = this.getAudioContext();
        const decoded = await ctx.decodeAudioData(arrayBuffer);

        // Web Audio API ile tüm PCM kanallarını tersine çevir
        const numChannels = decoded.numberOfChannels;
        const reversedBuffer = ctx.createBuffer(numChannels, decoded.length, decoded.sampleRate);

        for (let ch = 0; ch < numChannels; ch++) {
          const src = decoded.getChannelData(ch);
          const dst = reversedBuffer.getChannelData(ch);
          for (let i = 0; i < decoded.length; i++) {
            dst[i] = src[decoded.length - 1 - i];
          }
        }

        this.lastRecordedBuffer = reversedBuffer;

        if (statusEl) {
          statusEl.innerHTML = '✅ <span style="color:#10B981; font-weight:900;">Ses Hazır! Aşağıdan dinleyin!</span>';
        }
        const recPlayback = document.getElementById('ts-recorded-playback-box');
        if (recPlayback) recPlayback.style.display = 'block';

        // Anında ilk ters çalmayı yap!
        this.playReversedBuffer();
      } catch (e) {
        console.warn('Ters ses işleme hatası:', e);
        if (statusEl) statusEl.textContent = '❌ Ses işlenemedi, lütfen tekrar deneyin.';
      } finally {
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(t => t.stop());
        }
      }
    };

    this.mediaRecorder.stop();
  }

  playReversedBuffer() {
    if (!this.lastRecordedBuffer) return;
    try {
      const ctx = this.getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = this.lastRecordedBuffer;
      source.connect(ctx.destination);
      source.start(0);
      sounds.playBoing();
    } catch (e) {
      console.warn('Buffer oynatma hatası:', e);
    }
  }
}
