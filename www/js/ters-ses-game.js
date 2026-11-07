// js/ters-ses-game.js
// Kafana Tak! & Parti Arenası - 10. Efsane Oyun: "Ters Ses (Geri Vites / Ters Köşe)"
// Web Audio API, Kaset Geri Sarma (Rewind Tape) efekti, Yerel Android TTS ve
// 30 saniyelik seri maç formatıyla kelimeleri tersten dinleten ve taklit ettiren yarışma motoru.

import { sounds } from './audio.js';
import { confetti } from './confetti.js';
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
    this.letterHintOpened = false;

    // Maç ve Tur Ayarları
    this.totalRounds = 5; // 5 kelimelik seri maç
    this.roundNumber = 1;
    this.timerSeconds = 30;
    this.remainingSeconds = 30;
    this.timerInterval = null;
    this.isTimerRunning = false;

    // Takım Skorları
    this.scores = {
      teamA: 0,
      teamB: 0
    };

    // Ses ve Mikrofon Durumu
    this.audioCtx = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.lastRecordedBuffer = null;
  }

  init() {
    this.stopTimer();
    this.stopSpeech();

    this.wordsList = this.shuffleArray(contentSync.getTersSesWords());
    this.currentIndex = 0;
    this.roundNumber = 1;
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
      <div class="ters-ses-wrap" style="display:flex; flex-direction:column; gap:12px; color:#FFFFFF; max-width:500px; margin:0 auto;">
        <!-- Üst Bar: Geri Dön & Başlık & Rehber -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button type="button" id="btn-back-ters-ses" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.18); color:#CBD5E1; font-weight:800; font-size:0.84rem; padding:8px 12px; border-radius:12px; cursor:pointer;">
            ← Parti Arenası
          </button>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:1.2rem;">🔄</span>
            <span style="font-size:1.02rem; font-weight:900; background:linear-gradient(135deg, #00F5D4, #7928CA); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">TERS SES</span>
          </div>
          <button type="button" id="btn-ters-ses-guide" style="background:rgba(0,245,212,0.12); border:1.5px solid rgba(0,245,212,0.35); color:#00F5D4; font-weight:800; font-size:0.80rem; padding:8px 12px; border-radius:12px; cursor:pointer;">
            📖 Kurallar
          </button>
        </div>

        <!-- Mod Seçici Sekmeler -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:rgba(15,23,42,0.85); padding:5px; border-radius:14px; border:1px solid rgba(255,255,255,0.1);">
          <button type="button" id="btn-mode-guess" class="ters-mode-tab active" style="background:linear-gradient(135deg, #7928CA, #FF0080); color:#FFF; border:none; padding:9px; border-radius:10px; font-weight:900; font-size:0.84rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
            <span>🎧</span> <span>Uzaylı Dilini Çöz</span>
          </button>
          <button type="button" id="btn-mode-mimic" class="ters-mode-tab" style="background:transparent; color:#94A3B8; border:none; padding:9px; border-radius:10px; font-weight:800; font-size:0.84rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
            <span>🎙️</span> <span>Geri Vites Challenge</span>
          </button>
        </div>

        <!-- Takım Skorları & Tur İlerlemesi -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.7); border:1.5px solid rgba(255,255,255,0.12); border-radius:16px; padding:8px 14px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:1.05rem;">🔴</span>
            <div>
              <div style="font-size:0.72rem; color:#94A3B8; font-weight:700;">Kırmızı</div>
              <div id="ts-score-team-a" style="font-size:1.1rem; font-weight:900; color:#FF416C;">0 Puan</div>
            </div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.72rem; color:#94A3B8; font-weight:700;">SERİ MAÇ</div>
            <div id="ts-round-counter" style="font-size:0.86rem; font-weight:900; color:#FBBF24;">Tur 1 / 5</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; text-align:right;">
            <div>
              <div style="font-size:0.72rem; color:#94A3B8; font-weight:700;">Mavi</div>
              <div id="ts-score-team-b" style="font-size:1.1rem; font-weight:900; color:#00F5D4;">0 Puan</div>
            </div>
            <span style="font-size:1.05rem;">🔵</span>
          </div>
        </div>

        <!-- 30 Saniyelik Dinamik Süre Barı -->
        <div id="ts-timer-wrap" style="background:rgba(15,23,42,0.8); border:1.5px solid rgba(255,255,255,0.15); border-radius:14px; padding:8px 12px; display:flex; align-items:center; gap:10px;">
          <div style="font-size:1.1rem;">⏱️</div>
          <div style="flex:1; height:10px; background:rgba(255,255,255,0.1); border-radius:999px; overflow:hidden;">
            <div id="ts-timer-bar" style="height:100%; width:100%; background:linear-gradient(90deg, #10B981, #FBBF24); border-radius:999px; transition:width 1s linear, background 0.3s ease;"></div>
          </div>
          <div id="ts-timer-number" style="font-size:1.05rem; font-weight:900; color:#10B981; min-width:32px; text-align:right;">30s</div>
        </div>

        <!-- Ana Oyun Sahnesi -->
        <div style="background:linear-gradient(135deg, rgba(20,25,45,0.94), rgba(10,14,28,0.98)); border:2px solid rgba(0,245,212,0.3); border-radius:22px; padding:18px 16px; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.5); position:relative;">
          
          <!-- Rozetler: Kategori & Zorluk -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:12px;">
            <span id="ts-cat-tag" style="background:rgba(0,245,212,0.15); border:1px solid rgba(0,245,212,0.35); color:#00F5D4; font-size:0.76rem; font-weight:800; padding:4px 10px; border-radius:999px;">
              📁 Kategori
            </span>
            <span id="ts-diff-tag" style="background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.35); color:#FBBF24; font-size:0.76rem; font-weight:800; padding:4px 10px; border-radius:999px;">
              ⚡ Kolay (+10)
            </span>
          </div>

          <!-- Mod 1 İçeriği (Hızlı Tahmin) -->
          <div id="ts-view-guess">
            <div style="font-size:0.82rem; color:#94A3B8; margin-bottom:4px;">Tersten Seslendirilen Gizemli Kelime:</div>
            
            <!-- Tersten Yazılış / Ses Dalgası Sahnesi -->
            <div id="ts-reverse-stage" style="background:rgba(0,0,0,0.35); border:1.5px dashed rgba(0,245,212,0.4); border-radius:16px; padding:14px; margin:10px 0;">
              <div id="ts-reverse-text" style="font-size:1.85rem; font-weight:900; color:#00F5D4; letter-spacing:2px; text-shadow:0 0 20px rgba(0,245,212,0.5);">
                ...
              </div>
              <div id="ts-audio-status" style="font-size:0.75rem; color:#A7F3D0; margin-top:4px; font-weight:700;">
                ▶️ Kaset Geri Sarma Modu Aktif
              </div>
            </div>

            <!-- Ses Çalma Butonları -->
            <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:8px; margin:14px 0;">
              <button type="button" id="btn-play-reverse" style="background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#061426; border:none; border-radius:14px; padding:13px; font-size:0.95rem; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 8px 20px rgba(0,245,212,0.3);">
                <span style="font-size:1.2rem;">🔊</span> <span>TERSTEN DİNLE</span>
              </button>
              <button type="button" id="btn-play-slow" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); color:#FFFFFF; border-radius:14px; padding:13px; font-size:0.85rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                <span>🐢</span> <span>Yavaşlat (%65)</span>
              </button>
            </div>

            <!-- İpuçları Çubuğu -->
            <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
              <button type="button" id="btn-toggle-hint" style="background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.35); color:#FBBF24; font-size:0.80rem; font-weight:800; padding:6px 12px; border-radius:10px; cursor:pointer;">
                💡 İpucu
              </button>
              <button type="button" id="btn-toggle-letter-hint" style="background:rgba(121,40,202,0.15); border:1px solid rgba(121,40,202,0.4); color:#D8B4FE; font-size:0.80rem; font-weight:800; padding:6px 12px; border-radius:10px; cursor:pointer;">
                🔤 İlk Harfi Aç
              </button>
            </div>

            <!-- İpucu Kutusu -->
            <div id="ts-hint-box" style="display:none; background:rgba(251,191,36,0.1); border:1.5px dashed rgba(251,191,36,0.4); border-radius:12px; padding:10px; margin-bottom:12px; font-size:0.84rem; color:#FDE68A; line-height:1.4;">
              💡 <strong>İpucu:</strong> <span id="ts-hint-text">...</span>
            </div>

            <!-- İlk Harf Joker Kutusu -->
            <div id="ts-letter-hint-box" style="display:none; background:rgba(121,40,202,0.15); border:1.5px dashed rgba(121,40,202,0.5); border-radius:12px; padding:10px; margin-bottom:12px; font-size:1.15rem; font-weight:900; color:#E9D5FF; letter-spacing:4px;">
              ...
            </div>

            <!-- Gizli Cevap Açılım Paneli -->
            <div id="ts-answer-box" style="display:none; background:rgba(16,185,129,0.15); border:2px solid #10B981; border-radius:16px; padding:12px; margin-bottom:14px; animation:scaleUp 0.3s ease;">
              <div style="font-size:0.75rem; color:#6EE7B7; font-weight:700;">DOĞRU KELİME:</div>
              <div id="ts-real-word" style="font-size:1.65rem; font-weight:900; color:#FFFFFF; letter-spacing:1px; margin:4px 0;">
                ...
              </div>
              <button type="button" id="btn-play-normal" style="background:#10B981; color:#06231A; border:none; padding:7px 16px; border-radius:999px; font-weight:900; font-size:0.82rem; cursor:pointer; margin-top:2px;">
                ▶️ Düz Orijinal Sesi Dinle
              </button>
            </div>

            <!-- Cevabı Aç Butonu -->
            <button type="button" id="btn-reveal-answer" style="width:100%; background:linear-gradient(135deg, #FF0080, #7928CA); color:#FFF; border:none; border-radius:14px; padding:13px; font-size:0.96rem; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 8px 20px rgba(255,0,128,0.3); margin-bottom:12px;">
              <span>👁️</span> <span>CEVABI GÖSTER & DÜZ ÇAL</span>
            </button>
          </div>

          <!-- Mod 2 İçeriği (Geri Vites Challenge) -->
          <div id="ts-view-mimic" style="display:none;">
            <div style="font-size:0.80rem; color:#CBD5E1; margin-bottom:8px; line-height:1.4;">
              1. Oyuncu gizlice ters sesi dinler. Mikrofon butonuna basılı tutarak duyduğu ters sesi taklit eder!
            </div>
            
            <div id="ts-mimic-secret-panel" style="background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.15); border-radius:14px; padding:10px; margin-bottom:12px;">
              <button type="button" id="btn-peek-secret" style="background:rgba(0,245,212,0.15); border:1px solid rgba(0,245,212,0.4); color:#00F5D4; font-size:0.82rem; font-weight:800; padding:7px 14px; border-radius:8px; cursor:pointer;">
                👀 Gizli Kelimeyi Gör (1. Oyuncu)
              </button>
              <div id="ts-peek-text" style="display:none; font-size:1.2rem; font-weight:900; color:#FBBF24; margin-top:6px;"></div>
            </div>

            <button type="button" id="btn-play-reverse-mimic" style="width:100%; background:rgba(0,245,212,0.18); border:1.5px solid rgba(0,245,212,0.4); color:#00F5D4; border-radius:12px; padding:11px; font-size:0.90rem; font-weight:800; cursor:pointer; margin-bottom:12px;">
              🔊 Tersten Sesini Dinle (Taklit Etmek İçin)
            </button>

            <!-- Dev Mikrofon Butonu -->
            <div style="margin:12px 0;">
              <button type="button" id="btn-record-mimic" style="width:85px; height:85px; border-radius:50%; background:linear-gradient(135deg, #EF4444, #B91C1C); border:4px solid rgba(255,255,255,0.3); color:#FFF; font-size:2.1rem; cursor:pointer; box-shadow:0 0 25px rgba(239,68,68,0.5); display:inline-flex; align-items:center; justify-content:center; transition:transform 0.15s ease, box-shadow 0.15s ease;">
                🎙️
              </button>
              <div id="ts-record-status" style="font-size:0.80rem; font-weight:800; color:#CBD5E1; margin-top:8px;">
                Butona BASILI TUT ve taklit et!
              </div>
            </div>

            <!-- Kayıt Çalma Paneli -->
            <div id="ts-recorded-playback-box" style="display:none; background:rgba(121,40,202,0.2); border:1.5px solid rgba(121,40,202,0.5); border-radius:14px; padding:12px; margin-top:10px;">
              <div style="font-size:0.75rem; color:#D8B4FE; font-weight:700; margin-bottom:6px;">SESİNİZ TERSİNE ÇEVRİLDİ!</div>
              <button type="button" id="btn-play-user-reversed" style="background:linear-gradient(135deg, #7928CA, #FF0080); color:#FFF; border:none; padding:11px 18px; border-radius:10px; font-weight:900; font-size:0.90rem; cursor:pointer; width:100%;">
                🔄 Taklidini Tersten Çal (Orijinal Ses Çıkacak mı?!)
              </button>
            </div>
          </div>

          <!-- Puan Verme & Pas Butonları -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
            <button type="button" id="btn-award-team-a" style="background:linear-gradient(135deg, #FF416C, #FF4B2B); color:#FFF; border:none; border-radius:12px; padding:11px; font-weight:900; font-size:0.85rem; cursor:pointer;">
              🔴 Kırmızı Bildi (+10)
            </button>
            <button type="button" id="btn-award-team-b" style="background:linear-gradient(135deg, #00F5D4, #00BBF9); color:#061426; border:none; border-radius:12px; padding:11px; font-weight:900; font-size:0.85rem; cursor:pointer;">
              🔵 Mavi Bildi (+10)
            </button>
          </div>
          <button type="button" id="btn-pass-word" style="width:100%; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.18); color:#CBD5E1; border-radius:12px; padding:10px; font-weight:800; font-size:0.85rem; cursor:pointer; margin-top:8px;">
            ⏭️ Kimse Bilemedi / Pas Geç ➔
          </button>
        </div>

        <!-- Seri Maç Sonu Podyum Modalı -->
        <div id="ts-match-end-modal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(7,3,17,0.92); backdrop-filter:blur(8px); align-items:center; justify-content:center; padding:16px;">
          <div style="background:linear-gradient(135deg, #1E1B4B, #0F172A); border:2px solid #FBBF24; border-radius:24px; padding:24px; max-width:400px; width:100%; text-align:center; box-shadow:0 0 50px rgba(251,191,36,0.3);">
            <div style="font-size:3.5rem; margin-bottom:8px;">🏆</div>
            <h2 id="ts-winner-title" style="font-size:1.6rem; font-weight:900; color:#FBBF24; margin:0 0 8px;">KAZANAN TAKIM!</h2>
            <div id="ts-winner-scores" style="font-size:1.05rem; color:#E2E8F0; margin-bottom:18px;">
              🔴 Kırmızı: 30 Puan | 🔵 Mavi: 20 Puan
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button type="button" id="btn-restart-match" style="background:linear-gradient(135deg, #FBBF24, #D97706); color:#000; border:none; border-radius:14px; padding:14px; font-weight:900; font-size:1.0rem; cursor:pointer;">
                🔄 Yeni Seri Maç Başlat
              </button>
              <button type="button" id="btn-exit-match" style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); color:#FFF; border-radius:14px; padding:12px; font-weight:800; font-size:0.9rem; cursor:pointer;">
                🚪 Parti Arenasına Dön
              </button>
            </div>
          </div>
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
        this.stopTimer();
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
        this.startTimer();
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
        this.stopTimer();
      };
    }

    // Ses Çalma Butonları (Mod 1)
    const btnPlayReverse = document.getElementById('btn-play-reverse');
    if (btnPlayReverse) {
      btnPlayReverse.onclick = () => this.playReversedWithRewindEffect(1.0);
    }

    const btnPlaySlow = document.getElementById('btn-play-slow');
    if (btnPlaySlow) {
      btnPlaySlow.onclick = () => this.playReversedWithRewindEffect(0.65);
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
        btnToggleHint.textContent = this.hintOpened ? '❌ İpucu Kapat' : '💡 İpucu';
        sounds.playClick();
      };
    }

    // İlk Harf Açma Jokeri
    const btnToggleLetterHint = document.getElementById('btn-toggle-letter-hint');
    const letterBox = document.getElementById('ts-letter-hint-box');
    if (btnToggleLetterHint && letterBox) {
      btnToggleLetterHint.onclick = () => {
        this.letterHintOpened = true;
        sounds.playClick();
        if (this.currentWord) {
          const w = this.currentWord.word.toLocaleUpperCase('tr-TR');
          const masked = w.charAt(0) + ' ' + Array(w.length - 1).fill('_').join(' ');
          letterBox.textContent = masked;
          letterBox.style.display = 'block';
          btnToggleLetterHint.style.opacity = '0.5';
          btnToggleLetterHint.disabled = true;
        }
      };
    }

    // Cevabı Aç Butonu
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
        confetti.fire({ count: 40 });
        if (!this.isRevealed) this.revealAnswer();
      };
    }

    const btnTeamB = document.getElementById('btn-award-team-b');
    if (btnTeamB) {
      btnTeamB.onclick = () => {
        this.scores.teamB += 10;
        this.updateScoreUI();
        sounds.playCorrect();
        confetti.fire({ count: 40 });
        if (!this.isRevealed) this.revealAnswer();
      };
    }

    // Pas / Kimse Bilemedi
    const btnPass = document.getElementById('btn-pass-word');
    if (btnPass) {
      btnPass.onclick = () => {
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
          btnPeek.textContent = '👀 Gizli Kelimeyi Gör (1. Oyuncu)';
        }
      };
    }

    const btnPlayRevMimic = document.getElementById('btn-play-reverse-mimic');
    if (btnPlayRevMimic) {
      btnPlayRevMimic.onclick = () => this.playReversedWithRewindEffect(0.85);
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

    // Podyum Modalı Butonları
    const btnRestartMatch = document.getElementById('btn-restart-match');
    if (btnRestartMatch) {
      btnRestartMatch.onclick = () => {
        const modal = document.getElementById('ts-match-end-modal');
        if (modal) modal.style.display = 'none';
        this.init();
      };
    }

    const btnExitMatch = document.getElementById('btn-exit-match');
    if (btnExitMatch) {
      btnExitMatch.onclick = () => {
        const modal = document.getElementById('ts-match-end-modal');
        if (modal) modal.style.display = 'none';
        this.stopSpeech();
        this.game.showScreen('partyGames');
      };
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
    this.letterHintOpened = false;

    // Tur İlerlemesi
    const roundCounter = document.getElementById('ts-round-counter');
    if (roundCounter) {
      roundCounter.textContent = `Tur ${this.roundNumber} / ${this.totalRounds}`;
    }

    // DOM Güncelle
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
    if (btnToggleHint) btnToggleHint.textContent = '💡 İpucu';

    const letterBox = document.getElementById('ts-letter-hint-box');
    if (letterBox) letterBox.style.display = 'none';

    const btnLetterHint = document.getElementById('btn-toggle-letter-hint');
    if (btnLetterHint) {
      btnLetterHint.style.opacity = '1';
      btnLetterHint.disabled = false;
    }

    const answerBox = document.getElementById('ts-answer-box');
    if (answerBox) answerBox.style.display = 'none';

    const peekText = document.getElementById('ts-peek-text');
    if (peekText) {
      peekText.style.display = 'none';
      peekText.textContent = '';
    }
    const btnPeek = document.getElementById('btn-peek-secret');
    if (btnPeek) btnPeek.textContent = '👀 Gizli Kelimeyi Gör (1. Oyuncu)';

    const recPlayback = document.getElementById('ts-recorded-playback-box');
    if (recPlayback) recPlayback.style.display = 'none';

    // Sayacı 30 saniyeye kur ve başlat
    if (this.activeMode === 'guess') {
      this.startTimer();
      // İlk gelişinde kaset sarma efektiyle tersten oku
      setTimeout(() => {
        this.playReversedWithRewindEffect(1.0);
      }, 350);
    }
  }

  startTimer() {
    this.stopTimer();
    this.remainingSeconds = this.timerSeconds;
    this.isTimerRunning = true;
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerUI();

      if (this.remainingSeconds <= 10 && this.remainingSeconds > 0) {
        // Son 10 saniye acil tick sesi
        try { sounds.playTick(); } catch(e) {}
      }

      if (this.remainingSeconds <= 0) {
        this.stopTimer();
        try { sounds.playWrong(); } catch(e) {}
        this.revealAnswer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  updateTimerUI() {
    const bar = document.getElementById('ts-timer-bar');
    const num = document.getElementById('ts-timer-number');
    if (!bar || !num) return;

    const pct = Math.max(0, (this.remainingSeconds / this.timerSeconds) * 100);
    bar.style.width = pct + '%';
    num.textContent = this.remainingSeconds + 's';

    if (this.remainingSeconds <= 8) {
      bar.style.background = 'linear-gradient(90deg, #EF4444, #B91C1C)';
      num.style.color = '#EF4444';
    } else if (this.remainingSeconds <= 15) {
      bar.style.background = 'linear-gradient(90deg, #FBBF24, #D97706)';
      num.style.color = '#FBBF24';
    } else {
      bar.style.background = 'linear-gradient(90deg, #10B981, #059669)';
      num.style.color = '#10B981';
    }
  }

  nextWord() {
    this.stopTimer();
    this.roundNumber++;

    if (this.roundNumber > this.totalRounds) {
      this.showMatchWinner();
      return;
    }

    this.loadWord(this.currentIndex + 1);
  }

  showMatchWinner() {
    this.stopTimer();
    this.stopSpeech();

    const modal = document.getElementById('ts-match-end-modal');
    const title = document.getElementById('ts-winner-title');
    const scores = document.getElementById('ts-winner-scores');
    if (!modal || !title || !scores) return;

    let winnerText = '🤝 DOSTLUK KAZANDI (BERABERE)!';
    if (this.scores.teamA > this.scores.teamB) {
      winnerText = '🔴 KIRMIZI TAKIM KAZANDI!';
    } else if (this.scores.teamB > this.scores.teamA) {
      winnerText = '🔵 MAVİ TAKIM KAZANDI!';
    }

    title.textContent = winnerText;
    scores.textContent = `🔴 Kırmızı: ${this.scores.teamA} Puan  |  🔵 Mavi: ${this.scores.teamB} Puan`;
    modal.style.display = 'flex';

    sounds.playVictory();
    confetti.celebrate();
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
    this.stopTimer();

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
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) {
      try { window.Capacitor.Plugins.TextToSpeech.stop(); } catch(e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
  }

  /**
   * Kaset Geri Sarma (Rewind Scratch) efektiyle birlikte ters okuma yapar
   */
  async playReversedWithRewindEffect(rate = 1.0) {
    if (!this.currentWord) return;
    this.stopSpeech();

    // 1. Kaset sarma ses efektini çal
    try {
      sounds.playTapeRewind();
    } catch(e) {}

    // 2. Efektin ardından tersten telaffuzu patlat
    setTimeout(async () => {
      const revText = reverseWordPhonetic(this.currentWord.word);
      await this.speakText(revText, rate, 1.05);
    }, 220);
  }

  async speakNormal() {
    if (!this.currentWord) return;
    this.stopSpeech();
    await this.speakText(this.currentWord.word, 0.95, 1.0);
  }

  /**
   * Güçlü Native TTS (Capacitor) ve Web Speech API yedekli konuşma yöneticisi
   */
  async speakText(text, rate = 1.0, pitch = 1.0) {
    if (!text) return;

    // 1. Öncelikle yerel Capacitor TextToSpeech dene
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) {
      try {
        await window.Capacitor.Plugins.TextToSpeech.stop();
        await window.Capacitor.Plugins.TextToSpeech.speak({
          text: String(text),
          lang: 'tr-TR',
          rate: rate,
          pitch: pitch,
          volume: 1.0,
          category: 'ambient'
        });
        return;
      } catch (err) {
        console.warn('[TersSes] Native TTS başarısız, web speech deneniyor:', err);
      }
    }

    // 2. Tarayıcı Web Speech API Yedeği
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = 'tr-TR';
        utterance.rate = rate;
        utterance.pitch = pitch;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[TersSes] Web Speech hatası:', e);
      }
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
      btnRecord.style.boxShadow = '0 0 25px rgba(239,68,68,0.5)';
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
          statusEl.innerHTML = '✅ <span style="color:#10B981; font-weight:900;">Ses Hazır! Dinleyin!</span>';
        }
        const recPlayback = document.getElementById('ts-recorded-playback-box');
        if (recPlayback) recPlayback.style.display = 'block';

        // Anında ilk ters çalmayı yap!
        this.playReversedBuffer();
      } catch (e) {
        console.warn('Ters ses işleme hatası:', e);
        if (statusEl) statusEl.textContent = '❌ Ses işlenemedi, tekrar deneyin.';
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
      sounds.playTapeRewind();
      setTimeout(() => {
        const ctx = this.getAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = this.lastRecordedBuffer;
        source.connect(ctx.destination);
        source.start(0);
      }, 200);
    } catch (e) {
      console.warn('Buffer oynatma hatası:', e);
    }
  }
}
