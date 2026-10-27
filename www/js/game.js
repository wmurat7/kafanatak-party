// Kafana Tak! - Ana Oyun Mantığı, Takım Savaşı Modu ve 3D Görsel Şölen

import { CATEGORIES } from './decks.js';
import { sounds, announcer } from './audio.js';
import { CameraRecorder } from './camera.js';
import { MotionDetector } from './motion.js';
import { confetti } from './confetti.js';
import QRCode from './qrcode.esm.js';
import jsQR from './jsqr.esm.js';
import { VampireGameEngine } from './vampire-game.js';
import { SpyGameEngine } from './spy-game.js';
import { BombGameEngine } from './bomb-game.js';
import { BottleGameEngine } from './bottle-game.js';
import { IsimSehirGameEngine } from './isim-sehir-game.js';
import { SarkiDuelloEngine } from './sarki-duello.js';
import { KelimeBombasiEngine } from './kelime-bombasi.js';
import { GulmemeMeydaniEngine } from './gulmeme-meydani.js';
import { PassaparolaEngine } from './passaparola-game.js';
import { CarkifelekEngine } from './carkifelek-game.js';
import { initPartyGuides } from './party-guide.js';
import { firebaseNetwork } from './firebase-network.js';

class GameApp {
  constructor() {
    this.categories = [...CATEGORIES];
    this.currentCategory = this.categories[0];
    this.roundDuration = 60; // saniye
    this.remainingTime = 60;
    this.timerInterval = null;

    // Oyun Modu: 'solo' veya 'teams'
    this.gameMode = 'solo';
    // Parti Kural Modu: 'classic' | 'bomb' | 'mime' | 'letter'
    this.ruleMode = localStorage.getItem('kafanatak_rule_mode') || 'classic';
    this.forbiddenLetter = 'E';
    this.bombExplosionTimeout = null;

    // Çarkıfelek Durumu
    this.wheelSpinning = false;
    this.wheelRotation = 0;
    this.wheelSlices = [];

    this.teams = [
      { id: 'team-a', name: '🔴 Kırmızı Takım', score: 0, color: '#FF416C' },
      { id: 'team-b', name: '🔵 Mavi Takım', score: 0, color: '#0072FF' }
    ];
    this.currentTeamIndex = 0;
    this.totalRounds = 4; // 2'şer tur
    this.currentRoundNumber = 1;
    this.isFortuneWheelMatch = false;

    this.wordsPool = [];
    this.currentWordIndex = 0;
    this.currentWordItem = null;

    this.score = {
      correct: [],
      passed: []
    };

    this.cameraEnabled = true;
    this.musicEnabled = true;
    this.camera = new CameraRecorder();
    this.motion = new MotionDetector({
      onCorrect: () => this.handleAction('correct'),
      onPass: () => this.handleAction('pass'),
      onTiltStateChange: (state, deltaZ, degrees) => this.handleTiltStateChange(state, deltaZ, degrees)
    });

    this.customDecksKey = 'kafanatak_custom_decks';
    this.pinStorageKey = 'kafanatak_parental_pin';
    this.recoveryStorageKey = 'kafanatak_parental_recovery';
    this.recoveryQuestionKey = 'kafanatak_parental_recovery_q';
    this.lockedCatsKey = 'kafanatak_locked_categories';
    this.activeFilter = 'all';

    // Seyirci Ekranı (İkinci Telefon & QR Odası)
    this.spectatorRoomId = localStorage.getItem('kafanatak_room_id') || ('PARTI' + Math.floor(100 + Math.random() * 900));
    this.serverInfo = { localIp: window.location.hostname || 'localhost', httpPort: 3000, httpsPort: 3443 };
    this.cheerPollTimer = null;
    this.spectatorBroadcast = null;

    // QR Kod Tarayıcı Durumu
    this.qrScannerStream = null;
    this.qrScanInterval = null;
    this.scannedDeckPending = null;

    // Takım Sayısı (2, 3 veya 4 Takım Turnuvası)
    this.teamCount = 2;

    // Haptik Titreşim ve WakeLock Durumu
    this.hapticsEnabled = localStorage.getItem('kafanatak_haptics') !== 'false';
    this.wakeLockEnabled = localStorage.getItem('kafanatak_wakelock') !== 'false';
    this.wakeLock = null;

    // Oyuncu Profili & Rekorlar
    this.profileStorageKey = 'kafanatak_user_profile';
    this.historyStorageKey = 'kafanatak_match_history';
    this.profile = {
      name: 'Parti Canavarı',
      avatar: '🦁',
      totalGames: 0,
      totalCorrect: 0,
      highScore: 0,
      teamWins: 0
    };
    this.matchHistory = [];

    this.loadCustomDecks();
    this.loadProfile();

    this.initDOMElements();
    this.bindEvents();
    this.initHardwareHub();
    this.renderCategoryGrid();
    this.updateTeamModeUI();
    this.initRuleChips();
    this.initSpectatorChannel();
    this.initTeamFortuneWheel();
    this.initPartyDareWheel();
    this.initVampireGame();
    this.initOtherPartyGames();
    this.updateHealthBar();

    // Pasif hareket algılamayı başlat (Ana ekranda sağlık barı & açı canlı aksın)
    this.motion.start();
  }

  initRuleChips() {
    this.ruleMode = this.ruleMode || 'classic';
    const descMap = {
      classic: '⭐ Klasik: Telefonu alnına koy, arkadaşlarının anlattıklarını doğru tahmin et!',
      bomb: '💣 Bomba: Süre bitmeden kelimeyi bil ve telefonu hemen sıradaki arkadaşına pasla!',
      mime: '🤐 Sessiz Sinema: Konuşmak, ses çıkarmak yasak! Sadece mimik ve hareketlerle anlat!',
      letter: '🔤 Yasak Harf: Belirlenen yasak harfi kullanmadan anlatmaya çalış!',
      taboo: '🚫 Tabu: Yasaklı 5 kelimeyi söylemeden anlat!'
    };

    if (this.ruleChips && this.ruleChips.length) {
      this.ruleChips.forEach(chip => {
        chip.addEventListener('click', () => {
          sounds.playClick();
          const mode = chip.dataset.rule || 'classic';
          this.ruleMode = mode;
          this.ruleChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (this.ruleModeDesc && descMap[mode]) {
            this.ruleModeDesc.textContent = descMap[mode];
          }
        });
      });
    }
  }

  loadCustomDecks() {
    try {
      const saved = localStorage.getItem(this.customDecksKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.categories = [...CATEGORIES, ...parsed];
        }
      }
    } catch (e) {
      console.warn('Özel paketler yüklenemedi:', e);
    }
  }

  saveCustomDeck(newCategory) {
    try {
      const saved = localStorage.getItem(this.customDecksKey);
      let list = saved ? JSON.parse(saved) : [];
      list.push(newCategory);
      localStorage.setItem(this.customDecksKey, JSON.stringify(list));
      this.categories.push(newCategory);
      this.renderCategoryGrid();
    } catch (e) {
      console.error('Özel paket kaydedilemedi:', e);
    }
  }

  initDOMElements() {
    this.screens = {
      home: document.getElementById('screen-home'),
      partyGames: document.getElementById('screen-party-games'),
      'party-games': document.getElementById('screen-party-games'),
      countdown: document.getElementById('screen-countdown'),
      round: document.getElementById('screen-round'),
      summary: document.getElementById('screen-summary'),
      matchWinner: document.getElementById('screen-match-winner'),
      vampire: document.getElementById('screen-vampire'),
      spy: document.getElementById('screen-spy'),
      bomb: document.getElementById('screen-bomb'),
      bottle: document.getElementById('screen-bottle'),
      'isim-sehir': document.getElementById('screen-isim-sehir'),
      'sarki-duello': document.getElementById('screen-sarki-duello'),
      'kelime-bombasi': document.getElementById('screen-kelime-bombasi'),
      'gulmeme-meydani': document.getElementById('screen-gulmeme-meydani'),
      passaparola: document.getElementById('screen-passaparola'),
      carkifelek: document.getElementById('screen-carkifelek')
    };

    // Ayarlar & Modlar
    this.categoryGrid = document.getElementById('category-grid');
    this.cameraToggle = document.getElementById('toggle-camera');
    this.soundToggle = document.getElementById('toggle-sound');
    this.musicToggle = document.getElementById('toggle-music');
    this.roundDurationSelect = document.getElementById('select-duration');
    this.customDurationBox = document.getElementById('custom-duration-box');
    this.inputCustomDuration = document.getElementById('input-custom-duration');
    this.btnCustomDurMinus = document.getElementById('btn-custom-dur-minus');
    this.btnCustomDurPlus = document.getElementById('btn-custom-dur-plus');

    // Takım Kader Çarkı (2 Aşamalı Şans Çarkı)
    this.modalTeamFortune = document.getElementById('modal-team-fortune-wheel');
    this.btnOpenTeamFortune = document.getElementById('btn-open-team-fortune-wheel');
    this.btnCloseTeamFortune = document.getElementById('btn-close-team-fortune');
    this.teamFortuneCanvas = document.getElementById('team-fortune-canvas');
    this.btnSpinTeamFortune = document.getElementById('btn-spin-team-fortune');
    this.btnTeamFortuneCenter = document.getElementById('btn-team-fortune-center');
    this.btnNextTeamSpin = document.getElementById('btn-next-team-spin');
    this.btnLaunchFortuneRound = document.getElementById('btn-launch-fortune-round');
    this.teamFortuneBadge = document.getElementById('team-fortune-badge');
    this.fortuneStep1 = document.getElementById('fortune-step-1');
    this.fortuneStep2 = document.getElementById('fortune-step-2');
    this.fortuneResultCategory = document.getElementById('fortune-result-category');
    this.fortuneResultDuration = document.getElementById('fortune-result-duration');
    this.teamFortuneMatchupSummary = document.getElementById('team-fortune-matchup-summary');
    this.fortuneMatchupTeamsList = document.getElementById('fortune-matchup-teams-list');
    this.teamFortuneWheelStage = document.getElementById('team-fortune-wheel-stage');
    this.teamFortuneResultBox = document.getElementById('team-fortune-result-box');

    this.teamFortuneStage = 1;
    this.teamFortuneSpinning = false;
    this.teamFortuneRotation = 0;
    this.teamFortuneSelectedCategory = null;
    this.teamFortuneSelectedModifier = null;
    this.teamFortuneSpinTeamIndex = 0;
    this.teamFortuneSelections = [];
    this.roundScoreMultiplier = 1;
    this.fortuneWheelOverrideDuration = null;
    this.isPlayingTestMusic = false;

    this.modeSoloBtn = document.getElementById('mode-solo-btn');
    this.modeTeamBtn = document.getElementById('mode-team-btn');
    this.teamSettingsBox = document.getElementById('team-settings-box');
    this.selectTeamCount = document.getElementById('select-team-count');
    this.inputTeamAName = document.getElementById('team-a-name-input');
    this.inputTeamBName = document.getElementById('team-b-name-input');
    this.inputTeamCName = document.getElementById('team-c-name-input');
    this.inputTeamDName = document.getElementById('team-d-name-input');
    this.teamCGroup = document.getElementById('team-c-group');
    this.teamDGroup = document.getElementById('team-d-group');
    this.selectTotalRounds = document.getElementById('select-total-rounds');

    // Geri sayım
    this.countdownNumber = document.getElementById('countdown-number');
    this.countdownCatName = document.getElementById('countdown-category-name');
    this.countdownTeamBadge = document.getElementById('countdown-team-badge');
    this.btnAbortCountdown = document.getElementById('btn-abort-countdown');
    this.btnCountdownCalibrate = document.getElementById('btn-countdown-calibrate');
    this.countdownCalibVal = document.getElementById('countdown-calib-val');
    this.countdownInterval = null;

    // Tur Ekranı
    this.screenRound = document.getElementById('screen-round');
    this.roundFullscreenCameraVideo = document.getElementById('round-fullscreen-camera-video');
    this.btnAbortRound = document.getElementById('btn-abort-round');
    this.roundWordCard = document.getElementById('round-word-card');
    this.roundWord = document.getElementById('round-word');
    this.roundTabooList = document.getElementById('round-taboo-list');
    this.roundTimerText = document.getElementById('round-timer-text');
    this.roundTimerBar = document.getElementById('round-timer-bar');
    this.roundScoreCorrect = document.getElementById('round-score-correct');
    this.roundScorePass = document.getElementById('round-score-pass');
    this.roundFlash = document.getElementById('round-flash');
    this.roundTeamIndicator = document.getElementById('round-team-indicator');
    this.roundTiltIndicator = document.getElementById('round-tilt-indicator');
    this.cameraPip = document.getElementById('camera-pip-video');
    this.cameraPipContainer = document.getElementById('camera-pip-container');
    this.touchBtnCorrect = document.getElementById('touch-btn-correct');
    this.touchBtnPass = document.getElementById('touch-btn-pass');

    // Altın Kart (Golden Card 2X)
    this.goldenCardBadge = document.getElementById('golden-card-badge');
    this.isGoldenCard = false;

    // Hızlı Kalibrasyon & Parti Üst Bar Kontrolleri
    this.btnQuickCalibrate = document.getElementById('btn-quick-calibrate');
    this.btnStatusPill = document.getElementById('btn-status-pill');
    this.btnQuickDuration = document.getElementById('btn-quick-duration');
    this.btnQuickWheelStart = document.getElementById('btn-quick-wheel-start');
    this.headerDurText = document.getElementById('header-dur-text');
    this.headerPlayerName = document.getElementById('header-player-name');
    this.headerModeSub = document.getElementById('header-mode-sub');
    this.btnDailySpin = document.getElementById('btn-daily-spin');

    // İkinci Telefon Zil (Buzzer) Alert Overlay
    this.buzzerAlertOverlay = document.getElementById('buzzer-alert-overlay');
    this.buzzerSenderName = document.getElementById('buzzer-sender-name');
    this.buzzerAlertTimer = null;

    // Takım Skor Panosu Modalı
    this.modalTeamScoreboard = document.getElementById('modal-team-scoreboard');
    this.btnCloseTeamScoreboard = document.getElementById('btn-close-team-scoreboard');
    this.teamScoreboardCards = document.getElementById('team-scoreboard-cards');
    this.teamMatchHistoryList = document.getElementById('team-match-history-list');
    this.btnClearTeamScores = document.getElementById('btn-clear-team-scores');
    this.btnLaunchTeamBattleFromScores = document.getElementById('btn-launch-team-battle-from-scores');
    this.dockBtnScoreboard = document.getElementById('dock-btn-scoreboard') || document.getElementById('dock-btn-leaderboard');

    // Uygulamadan Çıkış Onay Modalı
    this.modalConfirmExit = document.getElementById('modal-confirm-exit');
    this.btnCancelAppExit = document.getElementById('btn-cancel-app-exit');
    this.btnConfirmAppExit = document.getElementById('btn-confirm-app-exit');

    // Oyundan Çıkış ve Menüye Dönüş Onay Modalı (Tüm Parti Oyunları ve Tur İçi)
    this.modalGameLeaveConfirm = document.getElementById('modal-game-leave-confirm');
    this.btnCancelGameLeave = document.getElementById('btn-cancel-game-leave');
    this.btnConfirmGameLeave = document.getElementById('btn-confirm-game-leave');
    this.pendingLeaveTarget = 'partyGames';
    this.pendingLeaveCleaner = null;

    // Tur Bitirme / Menüye Dönüş Onay Modalı
    this.modalAbortRound = document.getElementById('modal-abort-round');
    this.btnAbortRoundCancel = document.getElementById('btn-abort-round-cancel');
    this.btnAbortRoundConfirm = document.getElementById('btn-abort-round-confirm');

    // Kamera Kayıt Onay Modalı
    this.modalCameraConfirm = document.getElementById('modal-camera-confirm');
    this.btnCameraOptOn = document.getElementById('btn-camera-opt-on');
    this.btnCameraOptOff = document.getElementById('btn-camera-opt-off');
    this.chkCameraRemember = document.getElementById('chk-camera-remember');

    // Kamera Ayarları Hub Kontrolleri
    this.toggleSettingCameraRecord = document.getElementById('toggle-setting-camera-record');
    this.toggleSettingCameraPrompt = document.getElementById('toggle-setting-camera-prompt');
    this.selectSettingCameraFormat = document.getElementById('select-setting-camera-format');
    this.selectSettingCameraFacing = document.getElementById('select-setting-camera-facing');
    this.btnResetCameraPrefs = document.getElementById('btn-reset-camera-prefs');

    // Eğim Ayarları
    this.selectSensitivity = document.getElementById('select-sensitivity');
    this.toggleInvertTilt = document.getElementById('toggle-invert-tilt');

    // Özet Ekranı
    this.summaryTitle = document.getElementById('summary-title');
    this.summaryTeamNotice = document.getElementById('summary-team-notice');
    this.summaryScoreCorrect = document.getElementById('summary-correct-count');
    this.summaryScorePassed = document.getElementById('summary-passed-count');
    this.summaryList = document.getElementById('summary-words-list');
    this.summaryVideoSection = document.getElementById('summary-video-section');
    this.summaryVideo = document.getElementById('summary-video');
    this.btnVideoSpeed1 = document.getElementById('btn-speed-1');
    this.btnVideoSpeed15 = document.getElementById('btn-speed-15');
    this.btnVideoSpeed2 = document.getElementById('btn-speed-2');
    this.btnDownloadVideo = document.getElementById('btn-download-video');
    this.btnShareVideo = document.getElementById('btn-share-video');
    this.btnPlayAgain = document.getElementById('btn-play-again');
    this.btnGoHome = document.getElementById('btn-go-home');
    this.summaryTeamScoreboard = document.getElementById('summary-team-scoreboard');

    // Maç Kazananı Ekranı
    this.winnerTeamTitle = document.getElementById('winner-team-title');
    this.winnerFinalScores = document.getElementById('winner-final-scores');
    this.btnRematch = document.getElementById('btn-rematch');
    this.btnWinnerHome = document.getElementById('btn-winner-home');

    // Parti Ceza Çarkı (Dare Wheel)
    this.modalPartyDare = document.getElementById('modal-party-dare-wheel');
    this.btnClosePartyDare = document.getElementById('btn-close-dare-wheel');
    this.btnOpenDareWheelSummary = document.getElementById('btn-open-dare-wheel-summary');
    this.btnOpenDareWheelMatch = document.getElementById('btn-open-dare-wheel-match');
    this.btnOpenDareWheelTeam = document.getElementById('btn-open-dare-wheel-team');
    this.partyDareCanvas = document.getElementById('party-dare-canvas');
    this.btnSpinDareWheel = document.getElementById('btn-spin-dare-wheel');
    this.btnSpinDareCenter = document.getElementById('btn-spin-dare-center');
    this.btnDoneDareWheel = document.getElementById('btn-done-dare-wheel');
    this.dareResultBox = document.getElementById('dare-result-box');
    this.dareResultText = document.getElementById('dare-result-text');
    this.isDareWheelSpinning = false;
    this.dareWheelRotation = 0;

    // Özel Paket & AI Deste Modalı
    this.modalCustom = document.getElementById('modal-custom-deck');
    this.btnOpenCustomModal = document.getElementById('btn-open-custom-modal');
    this.btnCloseCustomModal = document.getElementById('btn-close-custom-modal');
    this.btnCancelAiDeck = document.getElementById('btn-cancel-ai-deck');
    this.btnCancelManualDeck = document.getElementById('btn-cancel-manual-deck');
    this.tabBtnDeckAi = document.getElementById('tab-btn-deck-ai');
    this.tabBtnDeckManual = document.getElementById('tab-btn-deck-manual');
    this.deckPanelAi = document.getElementById('deck-panel-ai');
    this.deckPanelManual = document.getElementById('deck-panel-manual');
    this.formAiDeck = document.getElementById('form-ai-deck');
    this.formCustomDeck = document.getElementById('form-custom-deck');
    this.inputAiTheme = document.getElementById('ai-deck-theme');
    this.selectAiCount = document.getElementById('ai-deck-count');
    this.selectAiMode = document.getElementById('ai-deck-mode');
    this.inputGeminiKey = document.getElementById('ai-gemini-key');
    this.aiLoader = document.getElementById('ai-generating-loader');
    this.aiLoaderStatus = document.getElementById('ai-loader-status');
    this.btnSubmitAiDeck = document.getElementById('btn-submit-ai-deck');

    // Deste QR Tara Sekmesi Elemanları
    this.tabBtnDeckScan = document.getElementById('tab-btn-deck-scan');
    this.deckPanelScan = document.getElementById('deck-panel-scan');
    this.qrScanVideo = document.getElementById('qr-scan-video');
    this.qrScanCanvas = document.getElementById('qr-scan-canvas');
    this.qrScanPlaceholder = document.getElementById('qr-scan-placeholder');
    this.btnStartQrCamera = document.getElementById('btn-start-qr-camera');
    this.fileQrImage = document.getElementById('file-qr-image');
    this.qrDetectedDeckCard = document.getElementById('qr-detected-deck-card');
    this.scannedDeckIcon = document.getElementById('scanned-deck-icon');
    this.scannedDeckTitle = document.getElementById('scanned-deck-title');
    this.scannedDeckCount = document.getElementById('scanned-deck-count');
    this.scannedWordsPreview = document.getElementById('scanned-words-preview');
    this.btnSaveScannedDeck = document.getElementById('btn-save-scanned-deck');

    // Canlı Seyirci QR Modalı Elemanları
    this.btnOpenSpectatorQr = document.getElementById('btn-open-spectator-qr');
    this.modalSpectatorQr = document.getElementById('modal-spectator-qr');
    this.btnCloseSpectatorQr = document.getElementById('btn-close-spectator-qr');
    this.qrSpectatorCanvas = document.getElementById('qr-spectator-canvas');
    this.specQrRoomCode = document.getElementById('spec-qr-room-code');
    this.specQrLinkText = document.getElementById('spec-qr-link-text');
    this.btnCopySpectatorLink = document.getElementById('btn-copy-spectator-link');
    this.btnOpenSpectatorBrowser = document.getElementById('btn-open-spectator-browser');
    this.inputSpectatorIp = document.getElementById('input-spectator-ip');
    this.btnUpdateSpectatorIp = document.getElementById('btn-update-spectator-ip');

    // Deste QR Paylaşım Modalı Elemanları
    this.modalDeckQrShare = document.getElementById('modal-deck-qr-share');
    this.btnCloseDeckShareQr = document.getElementById('btn-close-deck-share-qr');
    this.btnDoneDeckShare = document.getElementById('btn-done-deck-share');
    this.qrDeckShareCanvas = document.getElementById('qr-deck-share-canvas');
    this.shareDeckIcon = document.getElementById('share-deck-icon');
    this.shareDeckTitle = document.getElementById('share-deck-title');
    this.shareDeckWordCount = document.getElementById('share-deck-word-count');

    // APK Paylaşım ve İndirme QR Modalı Elemanları
    this.btnShareAppApk = document.getElementById('btn-share-app-apk');
    this.btnOpenApkQr = document.getElementById('btn-open-apk-qr');
    this.modalApkQrDownload = document.getElementById('modal-apk-qr-download');
    this.btnCloseApkQr = document.getElementById('btn-close-apk-qr');
    this.btnCopyApkLink = document.getElementById('btn-copy-apk-link');
    this.btnDirectDownloadApk = document.getElementById('btn-direct-download-apk');
    this.qrApkDownloadCanvas = document.getElementById('qr-apk-download-canvas');
    this.apkDownloadUrlText = document.getElementById('apk-download-url-text');
    this.tabApkCloud = document.getElementById('tab-apk-cloud');
    this.tabApkLocal = document.getElementById('tab-apk-local');
    this.apkStatusPill = document.getElementById('apk-status-pill');
    this.apkModalDesc = document.getElementById('apk-modal-desc');
    this.currentApkSource = localStorage.getItem('kafanatak_apk_source') || 'cloud';

    // Kural Modları Elemanları
    this.ruleChips = document.querySelectorAll('.rule-chip');
    this.ruleModeDesc = document.getElementById('rule-mode-desc-text');
    this.bombHudBadge = document.getElementById('bomb-status-indicator');
    this.bombStatusText = document.getElementById('bomb-status-text');
    this.bombPassPrompt = document.getElementById('bomb-pass-prompt');
    this.bombExplosionOverlay = document.getElementById('bomb-explosion-overlay');
    this.boomPenaltyDesc = document.getElementById('boom-penalty-desc');
    this.mimeBanner = document.getElementById('mime-banner-indicator');
    this.letterBanner = document.getElementById('letter-banner-indicator');
    this.valForbiddenLetter = document.getElementById('val-forbidden-letter');

    // Günlük Çarkıfelek Elemanları
    this.btnDailySpin = document.getElementById('btn-daily-spin');
    this.modalDailySpin = document.getElementById('modal-daily-spin');
    this.btnCloseDailySpin = document.getElementById('btn-close-daily-spin');
    this.wheelCanvas = document.getElementById('wheel-canvas');
    this.btnSpinWheelCenter = document.getElementById('btn-spin-wheel-center');
    this.wheelResultBox = document.getElementById('wheel-result-box');
    this.wheelPrizeTitle = document.getElementById('wheel-prize-title');
    this.wheelPrizeDesc = document.getElementById('wheel-prize-desc');
    this.spinFooterTimer = document.getElementById('spin-footer-timer');
    this.spinBadgeDot = document.getElementById('spin-badge-dot');

    // Spiker Ayarı
    this.toggleAnnouncer = document.getElementById('toggle-announcer');

    // PIN Kilidi ve Sıfırlama Modalları
    this.modalPinLock = document.getElementById('modal-pin-lock');
    this.formPinLock = document.getElementById('form-pin-lock');
    this.inputPinCode = document.getElementById('input-pin-code');
    this.pinErrorMsg = document.getElementById('pin-error-msg');
    this.btnClosePinModal = document.getElementById('btn-close-pin-modal');
    this.btnForgotPinLink = document.getElementById('btn-forgot-pin-link');
    this.modalPinReset = document.getElementById('modal-pin-reset');
    this.btnClosePinResetModal = document.getElementById('btn-close-pin-reset-modal');
    this.btnCancelPinReset = document.getElementById('btn-cancel-pin-reset');
    this.formPinResetVerify = document.getElementById('form-pin-reset-verify');
    this.inputResetAuth = document.getElementById('input-reset-auth');
    this.resetAuthError = document.getElementById('reset-auth-error');
    this.pinResetQuestionText = document.getElementById('pin-reset-question-text');
    this.btnOpenResetPinModal = document.getElementById('btn-open-reset-pin-modal');
    this.pendingCategory = null;

    // Sensör Test Modalı (Eski/Hızlı)
    this.btnOpenSensorTest = document.getElementById('btn-open-sensor-test');
    this.modalSensorTest = document.getElementById('modal-sensor-test');
    this.btnCloseSensorTest = document.getElementById('btn-close-sensor-test');
    this.btnCalibrateNeutral = document.getElementById('btn-calibrate-neutral');
    this.sensorTestBadge = document.getElementById('sensor-test-badge');
    this.sensorTestValues = document.getElementById('sensor-test-values');
    this.sensorTestTimer = null;

    // Hızlı Sistem & Donanım Sağlık Barı
    this.healthBar = document.querySelector('.system-health-bar');
    this.healthCameraBadge = document.getElementById('health-camera-badge');
    this.healthMotionBadge = document.getElementById('health-motion-badge');
    this.healthSecurityBadge = document.getElementById('health-security-badge');
    this.btnQuickCalibrate = document.getElementById('btn-quick-calibrate');

    // Donanım & Ayarlar Merkezi (Settings Hub Modal)
    this.modalSettingsHub = document.getElementById('modal-settings-hub');
    this.btnOpenSettingsHub = document.getElementById('btn-open-settings-hub');
    this.btnCloseSettingsHub = document.getElementById('btn-close-settings-hub');
    this.btnHubDone = document.getElementById('btn-hub-done');

    // Hub 5 Sekme Referansları
    this.hubTabs = {
      security: { btn: document.getElementById('tab-btn-security'), content: document.getElementById('hub-content-security') },
      gameplay: { btn: document.getElementById('tab-btn-gameplay'), content: document.getElementById('hub-content-gameplay') },
      motion: { btn: document.getElementById('tab-btn-motion'), content: document.getElementById('hub-content-motion') },
      camera: { btn: document.getElementById('tab-btn-camera'), content: document.getElementById('hub-content-camera') },
      system: { btn: document.getElementById('tab-btn-system'), content: document.getElementById('hub-content-system') }
    };

    // Hub Eğim & Ufuk Çizgisi Kontrolleri
    this.horizonBubble = document.getElementById('horizon-bubble');
    this.horizonBubbleIcon = document.getElementById('horizon-bubble-icon');
    this.horizonAngleText = document.getElementById('horizon-angle-text');
    this.horizonZoneStatus = document.getElementById('horizon-zone-status');
    this.horizonSensorInfo = document.getElementById('horizon-sensor-info');
    this.btnHubSaveNeutral = document.getElementById('btn-hub-save-neutral');
    this.hubSliderThreshold = document.getElementById('hub-slider-threshold');
    this.hubThresholdValue = document.getElementById('hub-threshold-value');
    this.hubToggleInvert = document.getElementById('hub-toggle-invert');
    this.hubToggleTouchOnly = document.getElementById('hub-toggle-touchonly');

    // Hub Kamera Kontrolleri
    this.hubCameraPreview = document.getElementById('hub-camera-preview');
    this.hubCameraPlaceholder = document.getElementById('hub-camera-placeholder');
    this.btnHubStartCamera = document.getElementById('btn-hub-start-camera');
    this.btnHubSwitchCamera = document.getElementById('btn-hub-switch-camera');
    this.diagCamStatus = document.getElementById('diag-cam-status');
    this.diagCamFacing = document.getElementById('diag-cam-facing');

    // Hub Sistem & İzinler Kontrolleri
    this.sysHttpsIcon = document.getElementById('sys-https-icon');
    this.sysHttpsDesc = document.getElementById('sys-https-desc');
    this.sysHttpsBadge = document.getElementById('sys-https-badge');
    this.btnSysRequestMotion = document.getElementById('btn-sys-request-motion');

    // Haptik & WakeLock Toggles
    this.hapticsToggle = document.getElementById('toggle-haptics');
    this.wakelockToggle = document.getElementById('toggle-wakelock');

    // Profil Modalı Elemanları
    this.modalProfile = document.getElementById('modal-player-profile');
    this.btnOpenProfileModal = document.getElementById('btn-open-profile-modal');
    this.btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
    this.btnSaveProfile = document.getElementById('btn-save-profile');
    this.btnResetProfileStats = document.getElementById('btn-reset-profile-stats');
    this.headerAvatarBadge = document.getElementById('header-avatar-badge');
    this.headerProfileName = document.getElementById('header-profile-name');
    this.profileCurrentAvatar = document.getElementById('profile-current-avatar');
    this.inputProfileName = document.getElementById('input-profile-name');
    this.avatarGridPicker = document.getElementById('avatar-grid-picker');
    this.statTotalGames = document.getElementById('stat-total-games');
    this.statTotalCorrect = document.getElementById('stat-total-correct');
    this.statHighScore = document.getElementById('stat-high-score');
    this.statTeamWins = document.getElementById('stat-team-wins');
    this.profileHistoryList = document.getElementById('profile-history-list');

    this.orientationWarning = document.getElementById('orientation-warning');

    // Parti Kural Modları & Round Banner Göstergeleri
    this.ruleChips = document.querySelectorAll('.rule-chip');
    this.ruleModeDesc = document.getElementById('rule-mode-desc-text');
    this.bombHudBadge = document.getElementById('bomb-status-indicator');
    this.mimeBanner = document.getElementById('mime-banner-indicator');
    this.letterBanner = document.getElementById('letter-banner-indicator');
    this.valForbiddenLetter = document.getElementById('val-forbidden-letter');
    this.bombPassPrompt = document.getElementById('bomb-pass-prompt');
    this.bombExplosionOverlay = document.getElementById('bomb-explosion-overlay');
    this.tabooBanner = document.getElementById('taboo-banner-indicator');

    // Dikey ve Elde Oynama Hızlı Aksiyon Barı (Portrait Handheld Buttons)
    this.handheldBar = document.getElementById('round-handheld-bar');
    this.btnHandheldPass = document.getElementById('btn-handheld-pass');
    this.btnHandheldTaboo = document.getElementById('btn-handheld-taboo');
    this.btnHandheldCorrect = document.getElementById('btn-handheld-correct');
  }

  bindEvents() {
    // Mod değişimi (Tekli / Takım)
    if (this.modeSoloBtn && this.modeTeamBtn) {
      this.modeSoloBtn.addEventListener('click', () => {
        sounds.playClick();
        this.gameMode = 'solo';
        this.updateTeamModeUI();
      });
      this.modeTeamBtn.addEventListener('click', () => {
        sounds.playClick();
        this.gameMode = 'teams';
        this.updateTeamModeUI();
      });
    }

    // Party Arcade: Hızlı Başla Hero Kartı
    const btnHeroQuick = document.getElementById('hero-quick-play');
    if (btnHeroQuick) {
      btnHeroQuick.addEventListener('click', () => {
        sounds.playClick();
        const unlocked = this.categories.filter(c => !this.isCategoryLocked(c.id));
        const chosen = unlocked[Math.floor(Math.random() * unlocked.length)] || this.categories[0];
        this.selectCategoryAndStart(chosen);
      });
    }

    // Party Arcade: Üst Profil Avatarı
    const btnHeaderProfile = document.getElementById('btn-header-profile');
    if (btnHeaderProfile && this.modalProfile) {
      btnHeaderProfile.addEventListener('click', () => {
        sounds.playClick();
        this.openProfileModal();
      });
    }

    // Party Arcade: Yüzen Alt Navigasyon Dock
    const dockHome = document.getElementById('dock-btn-home');
    const dockPartyGames = document.getElementById('dock-btn-party-games');
    const dockDecks = document.getElementById('dock-btn-decks');
    const dockScoreboard = document.getElementById('dock-btn-scoreboard') || document.getElementById('dock-btn-leaderboard');
    const dockProfile = document.getElementById('dock-btn-profile');
    const dockSettings = document.getElementById('dock-btn-settings');

    const dockPartyGamesPage = document.getElementById('dock-btn-party-games-page');
    const dockPartyHome = document.getElementById('dock-btn-party-home');
    const dockPartyDecks = document.getElementById('dock-btn-party-decks');
    const dockPartyScoreboard = document.getElementById('dock-btn-party-scoreboard');
    const dockPartySettings = document.getElementById('dock-btn-party-settings');
    const btnBackFromParty = document.getElementById('btn-back-from-party-games');

    const updateDockActive = (activeBtn) => {
      document.querySelectorAll('.dock-nav-item').forEach(btn => btn.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    };

    if (dockHome) {
      dockHome.addEventListener('click', () => {
        sounds.playClick();
        updateDockActive(dockHome);
        this.stopSummaryVideo();
        this.showScreen('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (dockPartyGames) {
      dockPartyGames.addEventListener('click', () => {
        sounds.playClick();
        updateDockActive(dockPartyGames);
        this.stopSummaryVideo();
        this.showScreen('partyGames');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const returnToHome = () => {
      sounds.playClick();
      updateDockActive(dockHome);
      this.stopSummaryVideo();
      this.showScreen('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (btnBackFromParty) btnBackFromParty.addEventListener('click', returnToHome);
    if (dockPartyHome) dockPartyHome.addEventListener('click', returnToHome);

    if (dockPartyDecks && dockDecks) {
      dockPartyDecks.addEventListener('click', () => dockDecks.click());
    }
    if (dockPartyScoreboard && dockScoreboard) {
      dockPartyScoreboard.addEventListener('click', () => dockScoreboard.click());
    }
    if (dockPartySettings && dockSettings) {
      dockPartySettings.addEventListener('click', () => dockSettings.click());
    }
    if (dockDecks) {
      dockDecks.addEventListener('click', () => {
        sounds.playClick();
        updateDockActive(dockDecks);
        this.stopSummaryVideo();
        this.showScreen('home');
        if (this.modalCustom) this.modalCustom.classList.add('active');
      });
    }
    if (dockScoreboard) {
      dockScoreboard.addEventListener('click', () => {
        sounds.playClick();
        updateDockActive(dockScoreboard);
        this.stopSummaryVideo();
        this.openTeamScoreboardModal();
      });
    }
    if (dockProfile) {
      dockProfile.addEventListener('click', () => {
        sounds.playClick();
        updateDockActive(dockProfile);
        this.stopSummaryVideo();
        this.openProfileModal();
      });
    }
    if (dockSettings) {
      dockSettings.addEventListener('click', () => {
        sounds.playClick();
        this.stopSummaryVideo();
        this.openSettingsHub('gameplay');
      });
    }

    // Parti Kural Modları (Klasik, Bomba, Sessiz Sinema, Yasak Harf)
    if (this.ruleChips) {
      this.ruleChips.forEach(chip => {
        chip.addEventListener('click', () => {
          sounds.playClick();
          this.ruleChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.ruleMode = chip.dataset.rule || 'classic';
          localStorage.setItem('kafanatak_rule_mode', this.ruleMode);
          this.updateRuleModeDesc();
          if (this.ruleMode === 'bomb') {
            announcer.speak('Bomba modu seçildi! Telefon elden ele dolaşacak!');
          } else if (this.ruleMode === 'mime') {
            announcer.speak('Sessiz sinema seçildi! Konuşmak kesinlikle yasak!');
          } else if (this.ruleMode === 'letter') {
            announcer.speak('Yasak harf modu seçildi!');
          } else if (this.ruleMode === 'taboo') {
            announcer.speak('Klasik Tabu modu seçildi! Yasaklı kelimelere dikkat!');
          }
        });
      });
    }

    // Dikey / Elde Oynama Hızlı Aksiyon Butonları (Handheld Action Bar)
    if (this.btnHandheldPass) {
      this.btnHandheldPass.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction('pass');
      });
    }
    if (this.btnHandheldCorrect) {
      this.btnHandheldCorrect.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction('correct');
      });
    }
    if (this.btnHandheldTaboo) {
      this.btnHandheldTaboo.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction('taboo');
      });
    }

    // Günlük Çarkıfelek Olayları
    if (this.btnDailySpin) {
      this.btnDailySpin.addEventListener('click', () => {
        sounds.playClick();
        this.openDailySpinModal();
      });
    }
    if (this.btnCloseDailySpin) {
      this.btnCloseDailySpin.addEventListener('click', () => {
        this.closeDailySpinModal();
      });
    }
    if (this.btnSpinWheelCenter) {
      this.btnSpinWheelCenter.addEventListener('click', () => {
        this.spinDailyWheel();
      });
    }

    // Takım Kader Çarkı (2 Aşamalı Şans Çarkı) Olayları
    if (this.btnOpenTeamFortune) {
      this.btnOpenTeamFortune.addEventListener('click', () => {
        sounds.playClick();
        this.gameMode = 'teams';
        this.updateTeamModeUI();
        this.currentRoundNumber = 1;
        this.currentTeamIndex = 0;
        this.teams.forEach(t => t.score = 0);
        this.openTeamFortuneWheel();
      });
    }
    if (this.btnCloseTeamFortune) {
      this.btnCloseTeamFortune.addEventListener('click', () => {
        this.closeTeamFortuneWheel();
      });
    }
    if (this.btnSpinTeamFortune) {
      this.btnSpinTeamFortune.addEventListener('click', () => {
        this.spinTeamFortuneWheel();
      });
    }
    if (this.btnTeamFortuneCenter) {
      this.btnTeamFortuneCenter.addEventListener('click', () => {
        this.spinTeamFortuneWheel();
      });
    }
    if (this.btnLaunchFortuneRound) {
      this.btnLaunchFortuneRound.addEventListener('click', () => {
        sounds.playClick();
        this.launchTeamFortuneRound();
      });
    }
    if (this.btnNextTeamSpin) {
      this.btnNextTeamSpin.addEventListener('click', () => {
        sounds.playClick();
        this.teamFortuneSpinTeamIndex++;
        this.setupTeamFortuneForCurrentTeam();
      });
    }

    // APK Paylaşım ve İndirme Buton Dinleyicileri
    if (this.btnShareAppApk) {
      this.btnShareAppApk.addEventListener('click', () => this.shareAppApk());
    }
    if (this.btnOpenApkQr) {
      this.btnOpenApkQr.addEventListener('click', () => this.openApkQrModal());
    }
    if (this.btnCloseApkQr) {
      this.btnCloseApkQr.addEventListener('click', () => this.closeApkQrModal());
    }
    if (this.btnCopyApkLink) {
      this.btnCopyApkLink.addEventListener('click', () => this.copyApkDownloadLink());
    }
    if (this.btnDirectDownloadApk) {
      this.btnDirectDownloadApk.addEventListener('click', () => this.directDownloadApk());
    }
    if (this.tabApkCloud) {
      this.tabApkCloud.addEventListener('click', () => this.switchApkSource('cloud'));
    }
    if (this.tabApkLocal) {
      this.tabApkLocal.addEventListener('click', () => this.switchApkSource('local'));
    }
    if (this.modalApkQrDownload) {
      this.modalApkQrDownload.addEventListener('click', (e) => {
        if (e.target === this.modalApkQrDownload) this.closeApkQrModal();
      });
    }

    // Modal Dışı (Backdrop) Tıklamaları - Sesi anında keserek kapatma garantisi
    if (this.modalSettingsHub) {
      this.modalSettingsHub.addEventListener('click', (e) => {
        if (e.target === this.modalSettingsHub) {
          this.closeSettingsHub();
        }
      });
    }
    if (this.modalTeamFortune) {
      this.modalTeamFortune.addEventListener('click', (e) => {
        if (e.target === this.modalTeamFortune) {
          this.closeTeamFortuneWheel();
        }
      });
    }
    if (this.modalDailySpin) {
      this.modalDailySpin.addEventListener('click', (e) => {
        if (e.target === this.modalDailySpin) {
          this.closeDailySpinModal();
        }
      });
    }

    // Spiker Toggle ve Test Butonu
    if (this.toggleAnnouncer) {
      this.toggleAnnouncer.checked = announcer.enabled;
      this.toggleAnnouncer.addEventListener('change', (e) => {
        announcer.setEnabled(e.target.checked);
        if (e.target.checked) {
          announcer.unlockAudio();
          announcer.speak('Spiker aktif edildi! Haydi başlayalım!', { force: true });
        }
      });
    }

    // ==========================================
    // SES EFEKTLERİ, SOUNDBOARD & MASTER PLAY/STOP
    // ==========================================
    const btnSoundTestPlay = document.getElementById('btn-sound-test-play');
    const btnSoundTestStop = document.getElementById('btn-sound-test-stop');
    const soundTestStatus = document.getElementById('sound-test-status');

    if (btnSoundTestPlay) {
      btnSoundTestPlay.addEventListener('click', () => {
        sounds.unlockAudio();
        btnSoundTestPlay.classList.add('playing');
        if (soundTestStatus) soundTestStatus.textContent = '▶️ Test Başlatıldı...';

        sounds.testAllSounds(
          (stepName, idx, total) => {
            if (soundTestStatus) {
              soundTestStatus.textContent = `▶️ [${idx + 1}/${total}] Çalıyor: ${stepName}`;
            }
          },
          () => {
            if (btnSoundTestPlay) btnSoundTestPlay.classList.remove('playing');
            if (soundTestStatus) soundTestStatus.textContent = '✅ Demo Test Tamamlandı';
          }
        );
        this.showToast('🔊 Ses efektleri demo testi başlatıldı!');
      });
    }

    if (btnSoundTestStop) {
      btnSoundTestStop.addEventListener('click', () => {
        sounds.stopAll();
        if (btnSoundTestPlay) btnSoundTestPlay.classList.remove('playing');
        if (soundTestStatus) soundTestStatus.textContent = '⏹️ Tüm Sesler Susturuldu';
        this.showToast('⏹️ Tüm sesler ve testler durduruldu!');
      });
    }

    // Soundboard Butonları (Tek tek basıp dinleme)
    const fxSoundButtons = document.querySelectorAll('.btn-fx-sound');
    fxSoundButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.unlockAudio();
        const fxType = btn.dataset.fx;
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 250);

        switch (fxType) {
          case 'correct': sounds.playCorrect(); this.showToast('🟢 Doğru Tahmin Çanı'); break;
          case 'pass': sounds.playPass(); this.showToast('🔴 Pas / Yay Sesi'); break;
          case 'tick': sounds.playTick(true); this.showToast('⏱️ Saat Tik-Tak'); break;
          case 'countdown': sounds.playCountdownBeep(true); this.showToast('⏳ Son 5s Bip Sayacı'); break;
          case 'drumroll': sounds.playDrumroll(); this.showToast('🥁 Trampet / Davul'); break;
          case 'bomb': sounds.playBombExplosion(); this.showToast('💣 Bomba Patlaması'); break;
          case 'applause': sounds.playApplause(); this.showToast('👏 Coşkulu Alkış'); break;
          case 'airhorn': sounds.playAirhorn(); this.showToast('🎺 Havalı Korna'); break;
          case 'vuvuzela': sounds.playVuvuzela(); this.showToast('📣 Stadyum Vuvuzela'); break;
          case 'bell': sounds.playBell(); this.showToast('🔔 Boks Zili'); break;
          case 'clownhorn': sounds.playClownHorn(); this.showToast('🎪 Palyaço Kornası'); break;
          case 'buzzer': sounds.playBuzzer(); this.showToast('🚨 Yarışma Buzzer\'ı'); break;
        }
      });
    });

    // 5 Farklı Alkış Örneği Dinleme ve Seçme Paneli
    const applauseSampleBtns = document.querySelectorAll('.btn-applause-sample');
    const activeApplauseBadge = document.getElementById('active-applause-name-badge');
    const applauseSampleDesc = document.getElementById('applause-sample-desc');

    const sampleDescs = {
      ornek1_net_hizli_studyo: '👏 <strong>1. Temiz & Hızlı Stüdyo Alkışı:</strong> Sıfır yankı, pürüzsüz stüdyo ortamı. El şaklamaları tane tane, hızlı ve son derece net.',
      ornek2_neseli_kucuk_grup: '🎈 <strong>2. Neşeli Küçük Grup:</strong> Tatlı bir "Woo/Yay!" sevinç nidası ve sıcak, samimi, neşeli el çırpışı.',
      ornek3_kipir_kipir_parti: '🎉 <strong>3. Kıpır Kıpır Parti:</strong> Dinamik ve neşeli küçük bir grubun enerjik alkışı. Gürültüden uzak, sade ve kıpır kıpır.',
      ornek4_ritmik_tempo: '🥁 <strong>4. Ritmik Parti Temposu:</strong> Kutlama temposunda ("ta - ta - ta-ta-ta!") ritmik el çırpışı. Çok net ve oyuncuyu havaya sokar.',
      ornek5_genc_aydinlik: '✨ <strong>5. Genç & Aydınlık:</strong> Taze, ferah ve pırıl pırıl bir alkış. Tizler canlı, orta frekanslar berrak, sade ve neşeli.'
    };

    const sampleNames = {
      ornek1_net_hizli_studyo: 'Seçili: 1. Hızlı Stüdyo',
      ornek2_neseli_kucuk_grup: 'Seçili: 2. Neşeli Grup',
      ornek3_kipir_kipir_parti: 'Seçili: 3. Kıpır Kıpır',
      ornek4_ritmik_tempo: 'Seçili: 4. Ritmik Tempo',
      ornek5_genc_aydinlik: 'Seçili: 5. Genç Aydınlık'
    };

    // Kayıtlı seçimi UI'a yansıt
    const savedSample = sounds.activeApplauseSample || 'ornek1_net_hizli_studyo';
    applauseSampleBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sample === savedSample);
    });
    if (activeApplauseBadge && sampleNames[savedSample]) {
      activeApplauseBadge.textContent = sampleNames[savedSample];
    }
    if (applauseSampleDesc && sampleDescs[savedSample]) {
      applauseSampleDesc.innerHTML = sampleDescs[savedSample];
    }

    applauseSampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleKey = btn.dataset.sample;
        sounds.unlockAudio();
        sounds.activeApplauseSample = sampleKey;
        try { localStorage.setItem('kafanatak_applause_sample', sampleKey); } catch (e) {}

        applauseSampleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (activeApplauseBadge && sampleNames[sampleKey]) {
          activeApplauseBadge.textContent = sampleNames[sampleKey];
        }
        if (applauseSampleDesc && sampleDescs[sampleKey]) {
          applauseSampleDesc.innerHTML = sampleDescs[sampleKey];
        }

        sounds.playApplauseSample(sampleKey);
        this.showToast(`👏 ${sampleNames[sampleKey]} Dinletiliyor ve Seçildi`);
      });
    });

    // Müzik Teması Seçimi & Play / Stop Butonları
    const selectMusicTheme = document.getElementById('select-music-theme');
    if (selectMusicTheme) {
      const validThemes = ['none', 'suspense', 'ticking_clock', 'noir_mystery', 'minimal_drone'];
      if (!validThemes.includes(sounds.musicTheme)) {
        sounds.musicTheme = 'suspense';
      }
      selectMusicTheme.value = sounds.musicTheme;
      selectMusicTheme.addEventListener('change', (e) => {
        sounds.setMusicTheme(e.target.value);
        if (e.target.value === 'none') {
          this.showToast('🔕 Sessiz & Sade Mod Seçildi (Müziksiz)');
        } else {
          const names = {
            suspense: '💓 Kalp Atışı Nabzı (Gerilim)',
            ticking_clock: '⏱️ Yarışma Sayacı (Tansiyon)',
            noir_mystery: '🕵️ Gizem & Tekinsiz (Ağır Gerilim)',
            minimal_drone: '🌌 Sinematik Odaklanma (Ambiyans)'
          };
          this.showToast(`🎵 ${names[e.target.value] || ''} Teması Seçildi`);
        }
      });
    }

    const btnMusicPlay = document.getElementById('btn-music-play');
    if (btnMusicPlay) {
      btnMusicPlay.addEventListener('click', () => {
        sounds.unlockAudio();
        if (sounds.musicTheme === 'none') {
          this.showToast('ℹ️ Tema "Sessiz" seçili. Dinlemek için listeden bir müzik seçin.');
          return;
        }
        sounds.startPartyBeat();
        this.showToast('🎵 Arka plan parti ritmi başlatıldı!');
      });
    }

    const btnMusicStop = document.getElementById('btn-music-stop');
    if (btnMusicStop) {
      btnMusicStop.addEventListener('click', () => {
        sounds.stopPartyBeat();
        this.showToast('⏹️ Arka plan müziği durduruldu.');
      });
    }

    if (this.selectTeamCount) {
      this.selectTeamCount.addEventListener('change', (e) => {
        this.setupTeams(e.target.value);
      });
    }
    if (this.inputTeamAName) {
      this.inputTeamAName.addEventListener('input', (e) => {
        if (this.teams[0]) this.teams[0].name = e.target.value.trim() || '🔴 Kırmızı Takım';
      });
    }
    if (this.inputTeamBName) {
      this.inputTeamBName.addEventListener('input', (e) => {
        if (this.teams[1]) this.teams[1].name = e.target.value.trim() || '🔵 Mavi Takım';
      });
    }
    if (this.inputTeamCName) {
      this.inputTeamCName.addEventListener('input', (e) => {
        if (this.teams[2]) this.teams[2].name = e.target.value.trim() || '🟡 Sarı Fırtınalar';
      });
    }
    if (this.inputTeamDName) {
      this.inputTeamDName.addEventListener('input', (e) => {
        if (this.teams[3]) this.teams[3].name = e.target.value.trim() || '🟢 Yeşil Devler';
      });
    }
    if (this.selectTotalRounds) {
      this.selectTotalRounds.addEventListener('change', (e) => {
        this.totalRounds = parseInt(e.target.value, 10) || 4;
      });
    }

    // Ayarlar
    if (this.cameraToggle) {
      this.cameraToggle.addEventListener('change', (e) => {
        this.cameraEnabled = e.target.checked;
      });
    }

    if (this.soundToggle) {
      this.soundToggle.checked = !sounds.muted;
      this.soundToggle.addEventListener('change', (e) => {
        sounds.muted = !e.target.checked;
        try { localStorage.setItem('kafanatak_sound_muted', sounds.muted ? 'true' : 'false'); } catch (err) {}
        if (!sounds.muted) {
          sounds.unlockAudio();
          sounds.playCorrect();
        }
      });
    }

    if (this.musicToggle) {
      this.musicToggle.checked = sounds.musicEnabled;
      this.musicToggle.addEventListener('change', (e) => {
        sounds.musicEnabled = e.target.checked;
        this.musicEnabled = e.target.checked;
        try { localStorage.setItem('kafanatak_music_enabled', sounds.musicEnabled ? 'true' : 'false'); } catch (err) {}
        if (sounds.musicEnabled) {
          sounds.unlockAudio();
        }
      });
    }

    if (this.roundDurationSelect) {
      const savedDurChoice = localStorage.getItem('kafanatak_duration_choice');
      const savedCustomDur = localStorage.getItem('kafanatak_custom_duration');
      if (savedCustomDur && this.inputCustomDuration) {
        this.inputCustomDuration.value = savedCustomDur;
      }
      if (savedDurChoice) {
        this.roundDurationSelect.value = savedDurChoice;
        if (savedDurChoice === 'custom' && this.customDurationBox) {
          this.customDurationBox.style.display = 'flex';
        }
      }

      this.roundDurationSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        localStorage.setItem('kafanatak_duration_choice', val);
        if (val === 'custom') {
          if (this.customDurationBox) this.customDurationBox.style.display = 'flex';
        } else {
          if (this.customDurationBox) this.customDurationBox.style.display = 'none';
        }
        this.roundDuration = this.getEffectiveRoundDuration();
      });
    }

    if (this.btnCustomDurMinus && this.inputCustomDuration) {
      this.btnCustomDurMinus.addEventListener('click', () => {
        sounds.playClick();
        let cur = parseInt(this.inputCustomDuration.value, 10) || 60;
        cur = Math.max(10, cur - 10);
        this.inputCustomDuration.value = cur;
        localStorage.setItem('kafanatak_custom_duration', cur.toString());
        this.roundDuration = cur;
      });
    }

    if (this.btnCustomDurPlus && this.inputCustomDuration) {
      this.btnCustomDurPlus.addEventListener('click', () => {
        sounds.playClick();
        let cur = parseInt(this.inputCustomDuration.value, 10) || 60;
        cur = Math.min(300, cur + 10);
        this.inputCustomDuration.value = cur;
        localStorage.setItem('kafanatak_custom_duration', cur.toString());
        this.roundDuration = cur;
      });
    }

    if (this.inputCustomDuration) {
      this.inputCustomDuration.addEventListener('change', () => {
        let cur = parseInt(this.inputCustomDuration.value, 10) || 60;
        cur = Math.max(10, Math.min(300, cur));
        this.inputCustomDuration.value = cur;
        localStorage.setItem('kafanatak_custom_duration', cur.toString());
        this.roundDuration = cur;
      });
    }

    if (this.selectSensitivity) {
      this.selectSensitivity.addEventListener('change', (e) => {
        this.motion.setSensitivity(e.target.value);
      });
    }

    if (this.toggleInvertTilt) {
      this.toggleInvertTilt.addEventListener('change', (e) => {
        this.motion.invertTilt = e.target.checked;
      });
    }

    // Haptik & WakeLock Ayarları
    if (this.hapticsToggle) {
      this.hapticsToggle.checked = this.hapticsEnabled;
      this.hapticsToggle.addEventListener('change', (e) => {
        this.hapticsEnabled = e.target.checked;
        localStorage.setItem('kafanatak_haptics', e.target.checked);
        if (e.target.checked) this.triggerHaptic('correct');
      });
    }

    if (this.wakelockToggle) {
      this.wakelockToggle.checked = this.wakeLockEnabled;
      this.wakelockToggle.addEventListener('change', (e) => {
        this.wakeLockEnabled = e.target.checked;
        localStorage.setItem('kafanatak_wakelock', e.target.checked);
      });
    }

    // Profil Modalı Dinleyicileri
    if (this.btnOpenProfileModal) {
      this.btnOpenProfileModal.addEventListener('click', () => this.openProfileModal());
    }
    if (this.btnCloseProfileModal) {
      this.btnCloseProfileModal.addEventListener('click', () => this.closeProfileModal());
    }
    if (this.btnSaveProfile) {
      this.btnSaveProfile.addEventListener('click', () => {
        this.saveProfile();
        this.closeProfileModal();
      });
    }
    if (this.btnResetProfileStats) {
      this.btnResetProfileStats.addEventListener('click', () => {
        if (confirm('Tüm oyun ve skor istatistikleriniz sıfırlansın mı?')) {
          this.resetProfileStats();
        }
      });
    }

    if (this.avatarGridPicker) {
      this.avatarGridPicker.querySelectorAll('.avatar-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.avatarGridPicker.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const chosen = btn.dataset.avatar;
          this.profile.avatar = chosen;
          if (this.profileCurrentAvatar) this.profileCurrentAvatar.textContent = chosen;
        });
      });
    }

    // Görünürlük değişince WakeLock yenileme
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.screens.round.classList.contains('active')) {
        await this.requestWakeLock();
      }
    });

    // Dokunmatik
    if (this.touchBtnCorrect) {
      this.touchBtnCorrect.addEventListener('click', () => this.handleAction('correct'));
    }
    if (this.touchBtnPass) {
      this.touchBtnPass.addEventListener('click', () => this.handleAction('pass'));
    }

    // Klavye kısayolları
    window.addEventListener('keydown', (e) => {
      if (this.screens.round.classList.contains('active')) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === ' ') {
          this.handleAction('correct');
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          this.handleAction('pass');
        }
      }
    });

    // Tur Esnasında Menüye Dönüş (Onay İsteyerek Duraklat)
    if (this.btnAbortRound) {
      this.btnAbortRound.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        sounds.playClick();
        this.promptAbortRound();
      });
      this.btnAbortRound.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    if (this.btnAbortCountdown) {
      this.btnAbortCountdown.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        sounds.playClick();
        this.abortGameToHome();
      });
      this.btnAbortCountdown.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    // Tur Bitirme Onay Modalı Butonları
    if (this.btnAbortRoundCancel) {
      this.btnAbortRoundCancel.addEventListener('click', () => {
        sounds.playClick();
        this.resumeRoundFromAbort();
      });
    }

    if (this.btnAbortRoundConfirm) {
      this.btnAbortRoundConfirm.addEventListener('click', () => {
        sounds.playClick();
        if (this.modalAbortRound) this.modalAbortRound.classList.remove('active');
        this.abortGameToHome();
      });
    }

    // Kamera Kayıt Onay Modalı Butonları
    if (this.btnCameraOptOn) {
      this.btnCameraOptOn.addEventListener('click', () => {
        sounds.playClick();
        const remember = this.chkCameraRemember ? this.chkCameraRemember.checked : false;
        if (remember) {
          localStorage.setItem('kafanatak_camera_consent', 'enabled');
          localStorage.setItem('kafanatak_camera_always_ask', 'false');
        } else {
          localStorage.setItem('kafanatak_camera_always_ask', 'true');
        }
        this.cameraEnabled = true;
        if (this.modalCameraConfirm) this.modalCameraConfirm.classList.remove('active');
        const cat = this.pendingCategory;
        this.pendingCategory = null;
        this.proceedStartCategory(cat);
      });
    }

    if (this.btnCameraOptOff) {
      this.btnCameraOptOff.addEventListener('click', () => {
        sounds.playClick();
        const remember = this.chkCameraRemember ? this.chkCameraRemember.checked : false;
        if (remember) {
          localStorage.setItem('kafanatak_camera_consent', 'disabled');
          localStorage.setItem('kafanatak_camera_always_ask', 'false');
        } else {
          localStorage.setItem('kafanatak_camera_always_ask', 'true');
        }
        this.cameraEnabled = false;
        if (this.modalCameraConfirm) this.modalCameraConfirm.classList.remove('active');
        const cat = this.pendingCategory;
        this.pendingCategory = null;
        this.proceedStartCategory(cat);
      });
    }

    // Özet Butonları
    if (this.btnPlayAgain) {
      this.btnPlayAgain.addEventListener('click', () => {
        this.stopSummaryVideo();
        this.handleNextRoundOrRematch();
      });
    }
    if (this.btnGoHome) {
      this.btnGoHome.addEventListener('click', () => {
        this.stopSummaryVideo();
        this.showScreen('home');
      });
    }

    // Maç Kazananı Butonları
    if (this.btnRematch) {
      this.btnRematch.addEventListener('click', () => {
        this.stopSummaryVideo();
        this.resetMatchAndPlay();
      });
    }
    if (this.btnWinnerHome) {
      this.btnWinnerHome.addEventListener('click', () => {
        this.stopSummaryVideo();
        this.showScreen('home');
      });
    }

    // Video Hız butonları
    if (this.btnVideoSpeed1) this.btnVideoSpeed1.addEventListener('click', () => this.setVideoPlaybackRate(1));
    if (this.btnVideoSpeed15) this.btnVideoSpeed15.addEventListener('click', () => this.setVideoPlaybackRate(1.5));
    if (this.btnVideoSpeed2) this.btnVideoSpeed2.addEventListener('click', () => this.setVideoPlaybackRate(2));

    // Video İndirme & Paylaşma (Capacitor Native Filesystem & Share Entegrasyonlu)
    if (this.btnDownloadVideo) {
      this.btnDownloadVideo.addEventListener('click', async () => {
        try {
          const catId = (this.currentCategory && (this.currentCategory.id || this.currentCategory.name)) || 'parti';
          this.showToast('💾 Video hazırlanıyor ve kaydediliyor...', 2500);
          const res = await this.camera.downloadVideo(`kafanatak-${catId}-${Date.now()}`);
          if (res && res.success) {
            this.showToast('✅ Video başarıyla hazırlandı / kaydedildi!', 3000);
          } else if (res && res.reason === 'no_video') {
            this.showToast('⚠️ Bu tur için kaydedilmiş video bulunamadı.', 3000);
          }
        } catch (err) {
          console.error('Video kaydetme hatası:', err);
          this.showToast('⚠️ Video kaydedilirken bir sorun oluştu.', 3000);
        }
      });
    }
    if (this.btnShareVideo) {
      this.btnShareVideo.addEventListener('click', async () => {
        try {
          this.showToast('📲 Paylaşım hazırlanıyor...', 2500);
          const res = await this.camera.shareVideo();
          if (res && res.success) {
            // Paylaşım menüsü açıldı veya başarıyla paylaşıldı
          } else if (res && res.reason === 'no_video') {
            this.showToast('⚠️ Bu tur için paylaşılacak video bulunamadı.', 3000);
          } else {
            this.showToast('ℹ️ Paylaşım menüsü kapatıldı veya desteklenmiyor.', 3000);
          }
        } catch (err) {
          console.error('Video paylaşım hatası:', err);
          this.showToast('⚠️ Video paylaşılırken bir sorun oluştu.', 3000);
        }
      });
    }

    // Özel Paket & AI Deste Modalı Olayları
    if (this.btnOpenCustomModal) {
      this.btnOpenCustomModal.addEventListener('click', () => {
        this.modalCustom.classList.add('active');
        if (this.inputGeminiKey) {
          this.inputGeminiKey.value = localStorage.getItem('kafanatak_gemini_key') || '';
        }
      });
    }
    if (this.btnCloseCustomModal) {
      this.btnCloseCustomModal.addEventListener('click', () => {
        this.stopQrCamera();
        this.modalCustom.classList.remove('active');
      });
    }
    if (this.btnCancelAiDeck) this.btnCancelAiDeck.addEventListener('click', () => {
      this.stopQrCamera();
      this.modalCustom.classList.remove('active');
    });
    if (this.btnCancelManualDeck) this.btnCancelManualDeck.addEventListener('click', () => {
      this.stopQrCamera();
      this.modalCustom.classList.remove('active');
    });

    // AI / Manuel / QR Tara Sekme Değişimi (3'lü Sekme)
    const switchDeckTab = (tab) => {
      [this.tabBtnDeckAi, this.tabBtnDeckManual, this.tabBtnDeckScan].forEach(b => b?.classList.remove('active'));
      [this.deckPanelAi, this.deckPanelManual, this.deckPanelScan].forEach(p => p?.classList.remove('active'));

      if (tab === 'ai') {
        this.tabBtnDeckAi?.classList.add('active');
        this.deckPanelAi?.classList.add('active');
        this.stopQrCamera();
      } else if (tab === 'manual') {
        this.tabBtnDeckManual?.classList.add('active');
        this.deckPanelManual?.classList.add('active');
        this.stopQrCamera();
      } else if (tab === 'scan') {
        this.tabBtnDeckScan?.classList.add('active');
        this.deckPanelScan?.classList.add('active');
        this.startQrCamera();
      }
    };

    if (this.tabBtnDeckAi) this.tabBtnDeckAi.addEventListener('click', () => switchDeckTab('ai'));
    if (this.tabBtnDeckManual) this.tabBtnDeckManual.addEventListener('click', () => switchDeckTab('manual'));
    if (this.tabBtnDeckScan) this.tabBtnDeckScan.addEventListener('click', () => switchDeckTab('scan'));

    // QR Tarayıcı Butonları
    if (this.btnStartQrCamera) {
      this.btnStartQrCamera.addEventListener('click', () => this.startQrCamera());
    }

    if (this.fileQrImage) {
      this.fileQrImage.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleQrImageFile(e.target.files[0]);
        }
      });
    }

    if (this.btnSaveScannedDeck) {
      this.btnSaveScannedDeck.addEventListener('click', () => {
        if (!this.scannedDeckPending) return;
        sounds.playClick();
        this.saveCustomDeck(this.scannedDeckPending);
        confetti.celebrate();
        this.showToast(`🎉 "${this.scannedDeckPending.title}" destesi kaydedildi!`);
        this.scannedDeckPending = null;
        this.qrDetectedDeckCard.style.display = 'none';
        this.stopQrCamera();
        if (this.modalCustom) this.modalCustom.classList.remove('active');
      });
    }

    // Canlı Seyirci QR Modalı Olayları
    if (this.btnOpenSpectatorQr) {
      this.btnOpenSpectatorQr.addEventListener('click', () => {
        sounds.playClick();
        this.openSpectatorModal();
      });
    }

    if (this.btnCloseSpectatorQr) {
      this.btnCloseSpectatorQr.addEventListener('click', () => {
        sounds.playClick();
        if (this.modalSpectatorQr) this.modalSpectatorQr.classList.remove('active');
      });
    }

    if (this.btnCopySpectatorLink) {
      this.btnCopySpectatorLink.addEventListener('click', async () => {
        sounds.playClick();
        const url = this.getSpectatorUrl();
        try {
          await navigator.clipboard.writeText(url);
          this.showToast('📋 Seyirci bağlantısı panoya kopyalandı!');
        } catch (e) {
          prompt('Seyirci bağlantısını kopyalayın:', url);
        }
      });
    }

    if (this.btnOpenSpectatorBrowser) {
      this.btnOpenSpectatorBrowser.addEventListener('click', () => {
        sounds.playClick();
        window.open(this.getSpectatorUrl(), '_blank');
      });
    }

    if (this.btnUpdateSpectatorIp) {
      this.btnUpdateSpectatorIp.addEventListener('click', () => {
        sounds.playClick();
        const customIp = this.inputSpectatorIp ? this.inputSpectatorIp.value.trim() : '';
        if (customIp) {
          this.serverInfo = { ...this.serverInfo, localIp: customIp };
          localStorage.setItem('kafanatak_last_server_ip', customIp);
          this.renderSpectatorQR();
          this.showToast('✅ IP güncellendi ve QR yenilendi!');
        }
      });
    }

    // Deste QR Paylaş Modalı Olayları
    if (this.btnCloseDeckShareQr) {
      this.btnCloseDeckShareQr.addEventListener('click', () => {
        sounds.playClick();
        if (this.modalDeckQrShare) this.modalDeckQrShare.classList.remove('active');
      });
    }

    if (this.btnDoneDeckShare) {
      this.btnDoneDeckShare.addEventListener('click', () => {
        sounds.playClick();
        if (this.modalDeckQrShare) this.modalDeckQrShare.classList.remove('active');
      });
    }

    // AI Tema Çipleri
    document.querySelectorAll('.theme-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (this.inputAiTheme) {
          this.inputAiTheme.value = chip.dataset.theme;
          this.inputAiTheme.focus();
        }
      });
    });

    // Gemini API Key Girişi
    if (this.inputGeminiKey) {
      this.inputGeminiKey.value = localStorage.getItem('kafanatak_gemini_key') || '';
      this.inputGeminiKey.addEventListener('change', (e) => {
        localStorage.setItem('kafanatak_gemini_key', e.target.value.trim());
      });
    }

    // AI Deste Gönderimi
    if (this.formAiDeck) {
      this.formAiDeck.addEventListener('submit', async (e) => {
        e.preventDefault();
        const theme = this.inputAiTheme.value.trim();
        const count = parseInt(this.selectAiCount.value, 10) || 30;
        const isTaboo = this.selectAiMode.value === 'taboo';
        const apiKey = this.inputGeminiKey.value.trim();

        if (apiKey) localStorage.setItem('kafanatak_gemini_key', apiKey);
        await this.handleGenerateAiDeck(theme, count, isTaboo, apiKey);
      });
    }

    // Elle Ekleme Formu
    if (this.formCustomDeck) {
      this.formCustomDeck.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('custom-deck-title').value.trim();
        const wordsRaw = document.getElementById('custom-deck-words').value;
        const words = wordsRaw.split('\n').map(w => w.trim()).filter(w => w.length > 0);

        if (!title || words.length < 5) {
          alert('Lütfen en az 5 kelime ve bir başlık girin!');
          return;
        }

        const newDeck = {
          id: 'custom-' + Date.now(),
          title: title,
          icon: '✨',
          description: `${words.length} özel kelimeden oluşan desteniz.`,
          gradient: 'linear-gradient(135deg, #FF0844 0%, #FFB199 100%)',
          words: words,
          isCustom: true
        };

        this.saveCustomDeck(newDeck);
        this.modalCustom.classList.remove('active');
        this.formCustomDeck.reset();
      });
    }

    // PIN Kilidi Modalı Olayları
    if (this.btnClosePinModal) {
      this.btnClosePinModal.addEventListener('click', () => {
        this.modalPinLock.classList.remove('active');
        this.pendingCategory = null;
      });
    }

    if (this.formPinLock) {
      this.formPinLock.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPin = this.inputPinCode.value.trim();
        const requiredPin = this.getPin();

        if (enteredPin === requiredPin) {
          this.modalPinLock.classList.remove('active');
          this.pinErrorMsg.style.display = 'none';
          const cat = this.pendingCategory;
          this.pendingCategory = null;
          this.checkCameraConsentAndStart(cat);
        } else {
          this.pinErrorMsg.style.display = 'block';
          this.pinErrorMsg.textContent = 'Hatalı PIN!';
          this.inputPinCode.classList.add('shake');
          setTimeout(() => this.inputPinCode.classList.remove('shake'), 400);
          this.inputPinCode.value = '';
          this.inputPinCode.focus();
        }
      });
    }

    // PIN Değiştirme Formu Olayları
    const formChangePin = document.getElementById('form-change-pin');
    const inputCurrentPin = document.getElementById('input-current-pin');
    const inputNewPin = document.getElementById('input-new-pin');
    const inputNewPinConfirm = document.getElementById('input-new-pin-confirm');
    const selectRecoveryQuestion = document.getElementById('select-recovery-question');
    const inputRecoveryAnswer = document.getElementById('input-recovery-answer');
    const pinChangeStatusMsg = document.getElementById('pin-change-status-msg');

    if (formChangePin) {
      formChangePin.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = inputCurrentPin.value.trim();
        const next = inputNewPin.value.trim();
        const nextConfirm = inputNewPinConfirm.value.trim();
        const question = selectRecoveryQuestion ? selectRecoveryQuestion.value.trim() : '';
        const answer = inputRecoveryAnswer ? inputRecoveryAnswer.value.trim() : '';

        if (current !== this.getPin()) {
          pinChangeStatusMsg.className = 'pin-status-text error';
          pinChangeStatusMsg.textContent = '❌ Mevcut PIN hatalı!';
          pinChangeStatusMsg.style.display = 'block';
          inputCurrentPin.focus();
          return;
        }

        if (!/^\d{4}$/.test(next)) {
          pinChangeStatusMsg.className = 'pin-status-text error';
          pinChangeStatusMsg.textContent = '❌ Yeni PIN tam 4 rakamdan oluşmalıdır!';
          pinChangeStatusMsg.style.display = 'block';
          inputNewPin.focus();
          return;
        }

        if (next !== nextConfirm) {
          pinChangeStatusMsg.className = 'pin-status-text error';
          pinChangeStatusMsg.textContent = '❌ Yeni PIN ile PIN tekrarı uyuşmuyor!';
          pinChangeStatusMsg.style.display = 'block';
          inputNewPinConfirm.focus();
          return;
        }

        this.setPin(next);
        if (question) {
          this.setRecoveryQuestion(question);
        }
        if (answer) {
          this.setRecoveryAnswer(answer);
        }

        pinChangeStatusMsg.className = 'pin-status-text success';
        pinChangeStatusMsg.textContent = `✅ PIN başarıyla güncellendi! Yeni PIN: ${next}${answer ? ' (Kurtarma sorusu kaydedildi)' : ''}`;
        pinChangeStatusMsg.style.display = 'block';
        formChangePin.reset();
        sounds.playFinish();
      });
    }

    // PIN Sıfırlama Modalı Tetikleyicileri
    if (this.btnOpenResetPinModal) {
      this.btnOpenResetPinModal.addEventListener('click', () => {
        this.openPinResetModal();
      });
    }

    if (this.btnForgotPinLink) {
      this.btnForgotPinLink.addEventListener('click', () => {
        if (this.modalPinLock) this.modalPinLock.classList.remove('active');
        this.openPinResetModal();
      });
    }

    if (this.btnClosePinResetModal) {
      this.btnClosePinResetModal.addEventListener('click', () => {
        this.closePinResetModal();
      });
    }

    if (this.btnCancelPinReset) {
      this.btnCancelPinReset.addEventListener('click', () => {
        this.closePinResetModal();
      });
    }

    // PIN Sıfırlama Doğrulama Formu
    if (this.formPinResetVerify) {
      this.formPinResetVerify.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = (this.inputResetAuth ? this.inputResetAuth.value : '').trim().toLowerCase();
        const currentPin = this.getPin().toLowerCase();
        const savedAnswer = this.getRecoveryAnswer().toLowerCase();

        const isPinMatch = entered === currentPin;
        const isAnswerMatch = savedAnswer.length >= 2 && entered === savedAnswer;

        if (isPinMatch || isAnswerMatch) {
          this.resetPin();
          this.closePinResetModal();
          sounds.playFinish();
          alert('✅ Güvenlik doğrulaması başarılı!\nPIN kodunuz varsayılan "1818" olarak sıfırlandı.');
          if (pinChangeStatusMsg) {
            pinChangeStatusMsg.className = 'pin-status-text success';
            pinChangeStatusMsg.textContent = '✅ Doğrulama başarılı! PIN "1818" olarak sıfırlandı.';
            pinChangeStatusMsg.style.display = 'block';
          }
          if (formChangePin) formChangePin.reset();
        } else {
          if (this.resetAuthError) {
            this.resetAuthError.style.display = 'block';
            this.resetAuthError.textContent = '❌ Hatalı kurtarma cevabı veya PIN! Sıfırlama reddedildi.';
          }
          if (this.inputResetAuth) {
            this.inputResetAuth.classList.add('shake');
            setTimeout(() => this.inputResetAuth.classList.remove('shake'), 400);
            this.inputResetAuth.select();
          }
          sounds.playPass();
        }
      });
    }

    // Kategori Filtre Çipleri
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter') || 'all';
        this.renderCategoryGrid();
      });
    });

    // Ana Sayfa Kompakt Durum Rozeti Tıklaması
    const btnStatusPill = document.getElementById('btn-status-pill');
    if (btnStatusPill) {
      btnStatusPill.addEventListener('click', (e) => {
        if (e.target.closest('#btn-quick-calibrate')) return;
        this.openSettingsHub();
      });
    }

    // Donanım & Ayarlar Merkezi (Settings Hub) Olayları
    if (this.btnOpenSettingsHub) {
      this.btnOpenSettingsHub.addEventListener('click', async () => {
        await MotionDetector.requestSensorPermission();
        this.openSettingsHub();
      });
    }

    if (this.btnCloseSettingsHub) {
      this.btnCloseSettingsHub.addEventListener('click', () => this.closeSettingsHub());
    }

    if (this.btnHubDone) {
      this.btnHubDone.addEventListener('click', () => this.closeSettingsHub());
    }

    // Sekme Geçişleri
    Object.keys(this.hubTabs).forEach(tabKey => {
      const item = this.hubTabs[tabKey];
      if (item && item.btn) {
        item.btn.addEventListener('click', () => this.switchHubTab(tabKey));
      }
    });

    // Kalibrasyon Sıfırlama Butonları
    if (this.btnQuickCalibrate) {
      this.btnQuickCalibrate.addEventListener('click', () => this.calibrateNeutralWithFeedback());
    }
    if (this.btnHubSaveNeutral) {
      this.btnHubSaveNeutral.addEventListener('click', () => this.calibrateNeutralWithFeedback());
    }

    // Eşik Açısı Slider Kontrolü
    if (this.hubSliderThreshold) {
      this.hubSliderThreshold.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.hubThresholdValue) this.hubThresholdValue.textContent = `${val}°`;
      });
      this.hubSliderThreshold.addEventListener('change', (e) => {
        this.motion.setSensitivityDegrees(parseInt(e.target.value, 10));
      });
    }

    // Yön Ters Çevirme
    if (this.hubToggleInvert) {
      this.hubToggleInvert.addEventListener('change', (e) => {
        this.motion.setInvert(e.target.checked);
        if (this.toggleInvertTilt) this.toggleInvertTilt.checked = e.target.checked;
      });
    }

    // Dokunmatik Mod
    if (this.hubToggleTouchOnly) {
      this.hubToggleTouchOnly.addEventListener('change', (e) => {
        this.motion.setTouchOnly(e.target.checked);
        this.updateHealthBar();
      });
    }

    // Kamera Test Butonu
    if (this.btnHubStartCamera) {
      this.btnHubStartCamera.addEventListener('click', async () => {
        this.btnHubStartCamera.disabled = true;
        this.btnHubStartCamera.textContent = '⏳ Kamera Başlatılıyor...';
        const success = await this.camera.initCamera(this.hubCameraPreview);
        this.btnHubStartCamera.disabled = false;
        if (success) {
          this.btnHubStartCamera.textContent = '✅ Kamera Çalışıyor';
          if (this.hubCameraPlaceholder) this.hubCameraPlaceholder.style.display = 'none';
          if (this.diagCamStatus) {
            this.diagCamStatus.textContent = 'Aktif & İzin Verildi';
            this.diagCamStatus.style.color = 'var(--correct-green)';
          }
        } else {
          this.btnHubStartCamera.textContent = '❌ Kamera Açılamadı (Tekrar Dene)';
          if (this.diagCamStatus) {
            this.diagCamStatus.textContent = window.isSecureContext ? 'İzin Verilmedi' : 'HTTPS Gerekli!';
            this.diagCamStatus.style.color = '#FF3B30';
          }
        }
        this.updateHealthBar();
      });
    }

    // Ön / Arka Kamera Değiştir
    if (this.btnHubSwitchCamera) {
      this.btnHubSwitchCamera.addEventListener('click', async () => {
        await this.camera.switchCamera(this.hubCameraPreview);
        if (this.diagCamFacing) {
          this.diagCamFacing.textContent = this.camera.facingMode === 'user' ? 'Ön Kamera (Selfie)' : 'Arka Kamera (Çevre)';
        }
        this.updateHealthBar();
      });
    }

    // iOS Sensör İzin İsteği
    if (this.btnSysRequestMotion) {
      this.btnSysRequestMotion.addEventListener('click', async () => {
        const granted = await MotionDetector.requestSensorPermission();
        alert(granted ? '✅ Jiroskop / Hareket sensörü izni verildi!' : '❌ Sensör izni verilemedi veya tarayıcınız desteklemiyor.');
        this.updateHealthBar();
      });
    }

    // Kamera Ayarları Hub Dinleyicileri
    if (this.toggleSettingCameraRecord) {
      const saved = localStorage.getItem('kafanatak_camera_consent') !== 'disabled';
      this.toggleSettingCameraRecord.checked = saved;
      this.toggleSettingCameraRecord.addEventListener('change', (e) => {
        this.cameraEnabled = e.target.checked;
        localStorage.setItem('kafanatak_camera_consent', e.target.checked ? 'enabled' : 'disabled');
        this.showToast(e.target.checked ? '📹 Kamera kaydı açıldı' : '🚫 Kamera kaydı kapatıldı');
      });
    }

    if (this.toggleSettingCameraPrompt) {
      const saved = localStorage.getItem('kafanatak_camera_always_ask') !== 'false';
      this.toggleSettingCameraPrompt.checked = saved;
      this.toggleSettingCameraPrompt.addEventListener('change', (e) => {
        localStorage.setItem('kafanatak_camera_always_ask', e.target.checked ? 'true' : 'false');
        this.showToast(e.target.checked ? '❓ Oyun öncesi kamera onayı aktif' : '⚡ Otomatik başlatma aktif');
      });
    }

    if (this.selectSettingCameraFormat) {
      const saved = localStorage.getItem('kafanatak_camera_format') || 'webm';
      this.selectSettingCameraFormat.value = saved;
      this.selectSettingCameraFormat.addEventListener('change', (e) => {
        this.camera.preferredFormat = e.target.value;
        localStorage.setItem('kafanatak_camera_format', e.target.value);
        this.showToast(`🎬 Format: ${e.target.value.toUpperCase()}`);
      });
    }

    if (this.selectSettingCameraFacing) {
      this.selectSettingCameraFacing.value = this.camera.facingMode || 'user';
      this.selectSettingCameraFacing.addEventListener('change', async (e) => {
        this.camera.facingMode = e.target.value;
        if (this.hubCameraPreview && this.hubCameraPreview.srcObject) {
          await this.camera.initCamera(this.hubCameraPreview);
        }
        if (this.diagCamFacing) {
          this.diagCamFacing.textContent = e.target.value === 'user' ? 'Ön Kamera (Selfie)' : 'Arka Kamera (Çevre)';
        }
        this.showToast(`📱 Kamera: ${e.target.value === 'user' ? 'Ön (Selfie)' : 'Arka'}`);
      });
    }

    if (this.btnResetCameraPrefs) {
      this.btnResetCameraPrefs.addEventListener('click', () => {
        localStorage.removeItem('kafanatak_camera_consent');
        localStorage.removeItem('kafanatak_camera_always_ask');
        localStorage.removeItem('kafanatak_camera_format');
        this.cameraEnabled = true;
        if (this.toggleSettingCameraRecord) this.toggleSettingCameraRecord.checked = true;
        if (this.toggleSettingCameraPrompt) this.toggleSettingCameraPrompt.checked = true;
        if (this.selectSettingCameraFormat) this.selectSettingCameraFormat.value = 'webm';
        this.showToast('✅ Kamera ayarları ve izin onayları sıfırlandı.');
      });
    }

    // Uygulamadan Çıkış Onayı Dinleyicileri
    if (this.btnCancelAppExit) {
      this.btnCancelAppExit.addEventListener('click', () => this.hideExitConfirmModal());
    }
    if (this.btnConfirmAppExit) {
      this.btnConfirmAppExit.addEventListener('click', () => this.confirmExitApp());
    }

    // Oyundan Çıkış ve Menüye Dönüş Onay Modalı Dinleyicileri
    if (this.btnCancelGameLeave) {
      this.btnCancelGameLeave.addEventListener('click', () => this.hideGameLeaveConfirmModal());
    }
    if (this.btnConfirmGameLeave) {
      this.btnConfirmGameLeave.addEventListener('click', () => this.confirmGameLeave());
    }

    // Android Donanım Geri Tuşu ve Escape Dinleyicisi
    this.initBackNavigation();

    // Geri Sayım Ekranı Hızlı Kalibrasyon Butonu
    if (this.btnCountdownCalibrate) {
      this.btnCountdownCalibrate.addEventListener('click', () => {
        this.motion.calibrateNeutral();
        try { sounds.playClick(); } catch (e) {}
        this.triggerHaptic('correct');
        if (this.countdownCalibVal) {
          this.countdownCalibVal.textContent = '0° (Nötr ✅)';
        }
        try { announcer.speak('Kalibre edildi! Tamamsın!'); } catch (e) {}
      });
    }

    // Üst Bar Hızlı Kalibrasyon Dinleyicileri
    const handleQuickCalibrate = () => {
      this.motion.calibrateNeutral();
      try { sounds.playClick(); } catch (e) {}
      this.triggerHaptic('correct');
      this.updateHealthBar();
      this.showToast('🎯 Hareket sensörü başarıyla kalibre edildi (0° Nötr)');
      try { announcer.speak('Sensör kalibre edildi!'); } catch (e) {}
    };
    if (this.btnQuickCalibrate) {
      this.btnQuickCalibrate.addEventListener('click', handleQuickCalibrate);
    }
    if (this.btnStatusPill) {
      this.btnStatusPill.addEventListener('click', handleQuickCalibrate);
    }

    // Üst Bar Hızlı Tur Süresi Değiştirici (45s -> 60s -> 90s -> 120s döngüsü)
    if (this.btnQuickDuration) {
      this.btnQuickDuration.addEventListener('click', () => {
        sounds.playClick();
        this.triggerHaptic('tick');
        const options = [45, 60, 90, 120];
        const currentDur = parseInt(this.roundDurationSelect?.value || '60', 10);
        const nextIdx = (options.indexOf(currentDur) + 1) % options.length;
        const newDur = options[nextIdx];
        this.roundDuration = newDur;
        if (this.roundDurationSelect) this.roundDurationSelect.value = String(newDur);
        if (this.headerDurText) this.headerDurText.textContent = `${newDur}s`;
        this.showToast(`⏱️ Tur süresi ${newDur} saniye yapıldı!`);
      });
    }

    // Üst Bar Hızlı Çarkla Başla Butonu (Kader Çarkı Tur Başlatıcı)
    if (this.btnQuickWheelStart) {
      this.btnQuickWheelStart.addEventListener('click', () => {
        sounds.playClick();
        this.gameMode = 'teams';
        this.updateTeamModeUI();
        this.currentRoundNumber = 1;
        this.currentTeamIndex = 0;
        this.teams.forEach(t => t.score = 0);
        this.openTeamFortuneWheel();
      });
    }
    if (this.btnDailySpin) {
      this.btnDailySpin.addEventListener('click', () => {
        sounds.playClick();
        this.openTeamFortuneWheel();
      });
    }

    // Takım Skor Panosu Aksiyonları
    if (this.btnCloseTeamScoreboard) {
      this.btnCloseTeamScoreboard.addEventListener('click', () => this.closeTeamScoreboardModal());
    }
    if (this.btnClearTeamScores) {
      this.btnClearTeamScores.addEventListener('click', () => {
        if (confirm('Tüm takım maç geçmişi ve skorlar sıfırlansın mı?')) {
          localStorage.removeItem('kafanatak_team_history');
          sounds.playClick();
          this.renderTeamScoreboard();
          this.showToast('🗑️ Takım maç skorları sıfırlandı.');
        }
      });
    }
    if (this.btnLaunchTeamBattleFromScores) {
      this.btnLaunchTeamBattleFromScores.addEventListener('click', () => {
        sounds.playClick();
        this.closeTeamScoreboardModal();
        this.gameMode = 'teams';
        this.updateTeamModeUI();
        this.showScreen('home');
        this.openTeamFortuneWheel();
      });
    }

    // Parti Ceza Çarkı Dinleyicileri
    if (this.btnOpenDareWheelSummary) {
      this.btnOpenDareWheelSummary.addEventListener('click', () => this.openPartyDareWheel());
    }
    if (this.btnOpenDareWheelMatch) {
      this.btnOpenDareWheelMatch.addEventListener('click', () => this.openPartyDareWheel());
    }
    if (this.btnOpenDareWheelTeam) {
      this.btnOpenDareWheelTeam.addEventListener('click', () => this.openPartyDareWheel());
    }
    if (this.btnClosePartyDare) {
      this.btnClosePartyDare.addEventListener('click', () => this.closePartyDareWheel());
    }
    if (this.btnDoneDareWheel) {
      this.btnDoneDareWheel.addEventListener('click', () => this.closePartyDareWheel());
    }
    if (this.btnSpinDareWheel) {
      this.btnSpinDareWheel.addEventListener('click', () => this.spinPartyDareWheel());
    }
    if (this.btnSpinDareCenter) {
      this.btnSpinDareCenter.addEventListener('click', () => this.spinPartyDareWheel());
    }

    // Ekran yönü
    window.addEventListener('resize', () => {
      this.checkOrientation();
      if (this.screens.round && this.screens.round.classList.contains('active')) {
        this.fitWordToScreen(this.getCurrentWordText(), this.roundTabooList && this.roundTabooList.style.display !== 'none');
      }
    });
    window.addEventListener('orientationchange', () => {
      this.checkOrientation();
      if (this.screens.round && this.screens.round.classList.contains('active')) {
        this.fitWordToScreen(this.getCurrentWordText(), this.roundTabooList && this.roundTabooList.style.display !== 'none');
      }
    });
    this.checkOrientation();
  }

  initVampireGame() {
    this.vampireEngine = new VampireGameEngine(this);
    this.singleVampirePlayers = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep'];

    const btnOpenVampire = document.getElementById('btn-open-vampire-game');
    const btnVampireBackHome = document.getElementById('btn-vampire-back-home');
    const hubSelect = document.getElementById('vampire-hub-select');
    const singleContainer = document.getElementById('vampire-single-container');
    const multiContainer = document.getElementById('vampire-multi-container');

    const btnChooseSingle = document.getElementById('btn-vampire-choose-single');
    const btnChooseMulti = document.getElementById('btn-vampire-choose-multi');
    const btnBackHub1 = document.getElementById('btn-vampire-back-hub-1');
    const btnBackHub2 = document.getElementById('btn-vampire-back-hub-2');

    const renderSinglePlayerList = () => {
      const listEl = document.getElementById('single-players-list');
      const countEl = document.getElementById('single-player-count');
      if (countEl) countEl.textContent = this.singleVampirePlayers.length;
      if (!listEl) return;
      listEl.innerHTML = this.singleVampirePlayers.map((name, i) => `
        <div class="player-pill" style="display:inline-flex; align-items:center; gap:6px;">
          <span>👤 ${name}</span>
          <button type="button" data-idx="${i}" class="btn-remove-v-player" style="background:none; border:none; color:#FF416C; cursor:pointer; font-weight:900; font-size:0.9rem; padding:0 4px;">✕</button>
        </div>
      `).join('');

      listEl.querySelectorAll('.btn-remove-v-player').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          this.singleVampirePlayers.splice(idx, 1);
          renderSinglePlayerList();
        });
      });
    };

    if (btnOpenVampire) {
      btnOpenVampire.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('vampire');
        if (hubSelect) hubSelect.style.display = 'block';
        if (singleContainer) singleContainer.style.display = 'none';
        if (multiContainer) multiContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (btnVampireBackHome) {
      btnVampireBackHome.addEventListener('click', () => {
        sounds.playClick();
        if ((singleContainer && singleContainer.style.display !== 'none') ||
            (multiContainer && multiContainer.style.display !== 'none')) {
          this.showGameLeaveConfirmModal('vampire', () => {
            if (this.vampireEngine) {
              if (this.vampireEngine.pollTimer) clearInterval(this.vampireEngine.pollTimer);
              if (this.vampireEngine.discussTimer) clearInterval(this.vampireEngine.discussTimer);
              if (this.vampireEngine.fbUnsub) { this.vampireEngine.fbUnsub(); this.vampireEngine.fbUnsub = null; }
            }
            if (singleContainer) singleContainer.style.display = 'none';
            if (multiContainer) multiContainer.style.display = 'none';
            if (hubSelect) hubSelect.style.display = 'block';
          });
          return;
        }
        this.showGameLeaveConfirmModal('partyGames', () => {
          if (this.vampireEngine) {
            if (this.vampireEngine.pollTimer) clearInterval(this.vampireEngine.pollTimer);
            if (this.vampireEngine.discussTimer) clearInterval(this.vampireEngine.discussTimer);
            if (this.vampireEngine.fbUnsub) { this.vampireEngine.fbUnsub(); this.vampireEngine.fbUnsub = null; }
          }
        });
      });
    }

    if (btnChooseSingle) {
      btnChooseSingle.addEventListener('click', () => {
        sounds.playClick();
        if (hubSelect) hubSelect.style.display = 'none';
        if (singleContainer) singleContainer.style.display = 'block';
        if (multiContainer) multiContainer.style.display = 'none';
        const singleLobby = document.getElementById('vampire-single-lobby');
        const singleScreen = document.getElementById('vampire-single-screen');
        if (singleLobby) singleLobby.style.display = 'block';
        if (singleScreen) singleScreen.innerHTML = '';
        renderSinglePlayerList();
      });
    }

    if (btnChooseMulti) {
      btnChooseMulti.addEventListener('click', () => {
        sounds.playClick();
        if (hubSelect) hubSelect.style.display = 'none';
        if (singleContainer) singleContainer.style.display = 'none';
        if (multiContainer) multiContainer.style.display = 'block';
        this.vampireEngine.renderWifiSetupScreen();
      });
    }

    // Vampir - Köylü Kurallar Modalı
    const btnVampireRules = document.getElementById('btn-vampire-rules-toggle');
    const modalVampireRules = document.getElementById('modal-vampire-rules');
    const btnCloseVampireRules = document.getElementById('btn-close-vampire-rules');
    const btnConfirmVampireRules = document.getElementById('btn-confirm-vampire-rules');

    if (btnVampireRules && modalVampireRules) {
      btnVampireRules.addEventListener('click', () => {
        sounds.playClick();
        modalVampireRules.classList.add('active');
      });
    }
    if (btnCloseVampireRules && modalVampireRules) {
      btnCloseVampireRules.addEventListener('click', () => {
        sounds.playClick();
        modalVampireRules.classList.remove('active');
      });
    }
    if (btnConfirmVampireRules && modalVampireRules) {
      btnConfirmVampireRules.addEventListener('click', () => {
        sounds.playClick();
        modalVampireRules.classList.remove('active');
      });
    }

    if (btnBackHub1) {
      btnBackHub1.addEventListener('click', () => {
        sounds.playClick();
        if (this.vampireEngine) {
          if (this.vampireEngine.pollTimer) clearInterval(this.vampireEngine.pollTimer);
          if (this.vampireEngine.discussTimer) clearInterval(this.vampireEngine.discussTimer);
        }
        if (hubSelect) hubSelect.style.display = 'block';
        if (singleContainer) singleContainer.style.display = 'none';
        if (multiContainer) multiContainer.style.display = 'none';
      });
    }

    if (btnBackHub2) {
      btnBackHub2.addEventListener('click', () => {
        sounds.playClick();
        if (this.vampireEngine) {
          if (this.vampireEngine.pollTimer) clearInterval(this.vampireEngine.pollTimer);
          if (this.vampireEngine.discussTimer) clearInterval(this.vampireEngine.discussTimer);
        }
        if (hubSelect) hubSelect.style.display = 'block';
        if (singleContainer) singleContainer.style.display = 'none';
        if (multiContainer) multiContainer.style.display = 'none';
      });
    }

    // Tek telefon oyuncu ekleme
    const inputPlayer = document.getElementById('input-single-player-name');
    const btnAddPlayer = document.getElementById('btn-add-single-player');
    const addPlayerAction = () => {
      if (!inputPlayer) return;
      const name = inputPlayer.value.trim();
      if (!name) return;
      this.singleVampirePlayers.push(name);
      inputPlayer.value = '';
      inputPlayer.focus();
      renderSinglePlayerList();
    };

    if (btnAddPlayer) btnAddPlayer.addEventListener('click', addPlayerAction);
    if (inputPlayer) {
      inputPlayer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addPlayerAction();
        }
      });
    }

    // Hızlı doldur butonları
    const btnQuick4 = document.getElementById('btn-quick-fill-4');
    const btnQuick6 = document.getElementById('btn-quick-fill-6');
    const btnQuick8 = document.getElementById('btn-quick-fill-8');
    if (btnQuick4) {
      btnQuick4.addEventListener('click', () => {
        this.singleVampirePlayers = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep'];
        renderSinglePlayerList();
      });
    }
    if (btnQuick6) {
      btnQuick6.addEventListener('click', () => {
        this.singleVampirePlayers = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Burak', 'Elif'];
        renderSinglePlayerList();
      });
    }
    if (btnQuick8) {
      btnQuick8.addEventListener('click', () => {
        this.singleVampirePlayers = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Burak', 'Elif', 'Can', 'Merve'];
        renderSinglePlayerList();
      });
    }

    // Tek telefon başlat butonu
    const btnStartSingle = document.getElementById('btn-start-single-game-roles');
    if (btnStartSingle) {
      btnStartSingle.addEventListener('click', () => {
        if (this.singleVampirePlayers.length < 3) {
          alert('Vampir - Köylü oynamak için en az 3 (tercihen 4+) oyuncu eklemelisiniz!');
          return;
        }

        const vSelect = document.getElementById('single-setting-vampires');
        const docChk = document.getElementById('single-setting-doctor');
        const detChk = document.getElementById('single-setting-detective');

        this.vampireEngine.settings.vampireCount = vSelect ? parseInt(vSelect.value, 10) : 2;
        this.vampireEngine.settings.hasDoctor = docChk ? docChk.checked : true;
        this.vampireEngine.settings.hasDetective = detChk ? detChk.checked : true;

        sounds.playClick();
        const singleLobby = document.getElementById('vampire-single-lobby');
        if (singleLobby) singleLobby.style.display = 'none';
        this.vampireEngine.startSinglePhoneLobby(this.singleVampirePlayers);
      });
    }
  }

  initOtherPartyGames() {
    this.spyEngine = new SpyGameEngine(this);
    this.bombEngine = new BombGameEngine(this);
    this.bottleEngine = new BottleGameEngine(this);

    // =========================================
    // 1. CASUS KİM? (SPYFALL)
    // =========================================
    const btnOpenSpy = document.getElementById('btn-open-spy-game');
    const btnSpyBackHome = document.getElementById('btn-spy-back-home');
    const btnStartSpyRound = document.getElementById('btn-start-spy-round');
    const inputSpyPlayer = document.getElementById('input-spy-player-name');
    const btnAddSpyPlayer = document.getElementById('btn-add-spy-player');
    const spyPlayerList = document.getElementById('spy-players-list');

    const renderSpyPlayers = () => {
      if (!spyPlayerList) return;
      spyPlayerList.innerHTML = this.spyEngine.players.map((name, i) => `
        <div class="player-pill" style="display:inline-flex; align-items:center; gap:6px;">
          <span>👤 ${name}</span>
          <button type="button" data-idx="${i}" class="btn-remove-spy-player" style="background:none; border:none; color:#FF416C; cursor:pointer; font-weight:900; font-size:0.9rem; padding:0 4px;">✕</button>
        </div>
      `).join('');

      spyPlayerList.querySelectorAll('.btn-remove-spy-player').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          this.spyEngine.players.splice(idx, 1);
          renderSpyPlayers();
        });
      });
    };

    if (btnOpenSpy) {
      btnOpenSpy.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('spy');
        const setup = document.getElementById('spy-setup-screen');
        const content = document.getElementById('spy-game-content');
        if (setup) setup.style.display = 'block';
        if (content) content.innerHTML = '';
        renderSpyPlayers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (btnSpyBackHome) {
      btnSpyBackHome.addEventListener('click', () => {
        sounds.playClick();
        if (this.spyEngine && this.spyEngine.timerInterval) clearInterval(this.spyEngine.timerInterval);
        try { sounds.stopPartyBeat(); } catch (e) {}
        this.showScreen('partyGames');
      });
    }

    const addSpyAction = () => {
      if (!inputSpyPlayer) return;
      const name = inputSpyPlayer.value.trim();
      if (!name) return;
      this.spyEngine.players.push(name);
      inputSpyPlayer.value = '';
      inputSpyPlayer.focus();
      renderSpyPlayers();
    };

    if (btnAddSpyPlayer) btnAddSpyPlayer.addEventListener('click', addSpyAction);
    if (inputSpyPlayer) {
      inputSpyPlayer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addSpyAction();
        }
      });
    }

    document.getElementById('btn-spy-fill-4')?.addEventListener('click', () => {
      this.spyEngine.players = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep'];
      renderSpyPlayers();
    });
    document.getElementById('btn-spy-fill-6')?.addEventListener('click', () => {
      this.spyEngine.players = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Burak', 'Elif'];
      renderSpyPlayers();
    });
    document.getElementById('btn-spy-fill-8')?.addEventListener('click', () => {
      this.spyEngine.players = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Burak', 'Elif', 'Can', 'Selin'];
      renderSpyPlayers();
    });

    // Casus Sayısı & Soru Sorma Süresi Seçim Hapları
    document.querySelectorAll('.btn-spy-opt-count').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        const val = btn.dataset.val;
        document.querySelectorAll('.btn-spy-opt-count').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'rgba(255,255,255,0.08)';
          b.style.color = '#CBD5E1';
          b.style.border = '1.5px solid rgba(255,255,255,0.2)';
          b.style.boxShadow = 'none';
        });
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg, #FBBF24, #D97706)';
        btn.style.color = '#0B0E14';
        btn.style.border = 'none';
        btn.style.boxShadow = '0 0 16px rgba(251,191,36,0.45)';

        const sel = document.getElementById('select-spy-count');
        if (sel) sel.value = val;
        const badge = document.getElementById('spy-count-badge');
        if (badge) badge.textContent = `${val} Casus`;
        if (this.spyEngine) this.spyEngine.spyCount = parseInt(val, 10);
      });
    });

    document.querySelectorAll('.btn-spy-opt-dur').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        const val = btn.dataset.val;
        document.querySelectorAll('.btn-spy-opt-dur').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'rgba(255,255,255,0.08)';
          b.style.color = '#CBD5E1';
          b.style.border = '1.5px solid rgba(255,255,255,0.2)';
          b.style.boxShadow = 'none';
        });
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg, #00F5D4, #00BBF9)';
        btn.style.color = '#0B0E14';
        btn.style.border = 'none';
        btn.style.boxShadow = '0 0 16px rgba(0,245,212,0.45)';

        const sel = document.getElementById('select-spy-duration');
        if (sel) sel.value = val;
        const badge = document.getElementById('spy-dur-badge');
        const mins = Math.floor(parseInt(val, 10) / 60);
        if (badge) badge.textContent = `${mins} Dakika`;
        if (this.spyEngine) this.spyEngine.gameDuration = parseInt(val, 10);
      });
    });

    if (btnStartSpyRound) {
      btnStartSpyRound.addEventListener('click', () => {
        sounds.playClick();
        const spyCountSel = document.getElementById('select-spy-count');
        const spyDurSel = document.getElementById('select-spy-duration');
        if (spyCountSel) this.spyEngine.spyCount = parseInt(spyCountSel.value, 10);
        if (spyDurSel) this.spyEngine.gameDuration = parseInt(spyDurSel.value, 10);
        this.spyEngine.startNewGame();
      });
    }

    // =========================================
    // 2. SAATLİ BOMBA (TICK TACK BOOM)
    // =========================================
    const btnOpenBomb = document.getElementById('btn-open-bomb-game');
    const btnBombBackHome = document.getElementById('btn-bomb-back-home');
    const btnLaunchBomb = document.getElementById('btn-launch-bomb-round');

    if (btnOpenBomb) {
      btnOpenBomb.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('bomb');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (btnBombBackHome) {
      btnBombBackHome.addEventListener('click', () => {
        sounds.playClick();
        if (this.bombEngine.tickInterval) clearInterval(this.bombEngine.tickInterval);
        sounds.stopAll();
        this.showScreen('partyGames');
      });
    }

    if (btnLaunchBomb) {
      btnLaunchBomb.addEventListener('click', () => {
        sounds.playClick();
        this.bombEngine.startRound();
      });
    }

    // =========================================
    // 3. ŞİŞE ÇEVİRMECE (DOĞRULUK MU CESARET Mİ)
    // =========================================
    const btnOpenBottle = document.getElementById('btn-open-bottle-game');
    const btnBottleBackHome = document.getElementById('btn-bottle-back-home');
    const btnSpinBottle = document.getElementById('btn-spin-bottle');
    const btnBottleParty = document.getElementById('btn-bottle-mode-party');
    const btnBottleAdult = document.getElementById('btn-bottle-mode-adult');
    const spinningBottle = document.getElementById('spinning-bottle-img');

    if (btnOpenBottle) {
      btnOpenBottle.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('bottle');
        this.bottleEngine.renderScreen();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (btnBottleBackHome) {
      btnBottleBackHome.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('partyGames');
      });
    }

    if (btnBottleParty) {
      btnBottleParty.addEventListener('click', () => {
        sounds.playClick();
        this.bottleEngine.mode = 'party';
        btnBottleParty.classList.add('active');
        btnBottleAdult.classList.remove('active');
      });
    }

    if (btnBottleAdult) {
      btnBottleAdult.addEventListener('click', () => {
        sounds.playClick();
        this.bottleEngine.mode = 'adult';
        btnBottleAdult.classList.add('active');
        btnBottleParty.classList.remove('active');
      });
    }

    if (btnSpinBottle) {
      btnSpinBottle.addEventListener('click', () => {
        this.bottleEngine.spinBottle();
      });
    }

    if (spinningBottle) {
      spinningBottle.addEventListener('click', () => {
        this.bottleEngine.spinBottle();
      });
    }

    // =========================================
    // 4. SESSİZ SİNEMA ARENASI
    // =========================================
    const btnOpenMime = document.getElementById('btn-open-mime-game');
    if (btnOpenMime) {
      btnOpenMime.addEventListener('click', () => {
        sounds.playClick();
        this.gameMode = 'solo';
        this.ruleMode = 'mime';
        localStorage.setItem('kafanatak_rule_mode', 'mime');
        this.updateTeamModeUI();
        const cinemaDeck = this.categories.find(c => c.id === 'movies' || c.id === 'cinema') || this.categories[0];
        this.selectCategoryAndStart(cinemaDeck);
      });
    }

    // =========================================
    // 5. İSİM ŞEHİR PARTİSİ (ÇARKLI & ÇOKLU TELEFON)
    // =========================================
    this.isimSehirEngine = new IsimSehirGameEngine(this);
    const btnOpenIsim = document.getElementById('btn-open-isim-game');
    if (btnOpenIsim) {
      btnOpenIsim.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('isim-sehir');
        this.isimSehirEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 6. ŞARKIYI DEVAM ETTİR (MELODİ DÜELLOSU)
    // =========================================
    this.sarkiDuelloEngine = new SarkiDuelloEngine(this);
    const btnOpenSarki = document.getElementById('btn-open-sarki-game');
    if (btnOpenSarki) {
      btnOpenSarki.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('sarki-duello');
        this.sarkiDuelloEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 7. SON SÖZÜ KİM SÖYLER? (KELİME BOMBASI)
    // =========================================
    this.kelimeBombasiEngine = new KelimeBombasiEngine(this);
    const btnOpenKelime = document.getElementById('btn-open-kelime-game');
    if (btnOpenKelime) {
      btnOpenKelime.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('kelime-bombasi');
        this.kelimeBombasiEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 8. GÜLMEME MEYDAN OKUMASI (KAMERA DÜELLOSU)
    // =========================================
    this.gulmemeEngine = new GulmemeMeydaniEngine(this);
    const btnOpenGulmeme = document.getElementById('btn-open-gulmeme-game');
    if (btnOpenGulmeme) {
      btnOpenGulmeme.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('gulmeme-meydani');
        this.gulmemeEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 9. A'DAN Z'YE PASSAPAROLA
    // =========================================
    this.passaparolaEngine = new PassaparolaEngine(this);
    const btnOpenPassa = document.getElementById('btn-open-passaparola-game');
    if (btnOpenPassa) {
      btnOpenPassa.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('passaparola');
        this.passaparolaEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 10. KLASİK ÇARKIFELEK
    // =========================================
    this.carkifelekEngine = new CarkifelekEngine(this);
    const btnOpenCark = document.getElementById('btn-open-carkifelek-game');
    if (btnOpenCark) {
      btnOpenCark.addEventListener('click', () => {
        sounds.playClick();
        this.showScreen('carkifelek');
        this.carkifelekEngine.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================
    // 11. NASIL OYNANIR REHBER MODALI BAĞLANTILARI
    // =========================================
    initPartyGuides(this);

    // =========================================
    // 12. OYUNDAN ÇIKIŞ VE MENÜYE DÖNÜŞ MODALI OLAYLARI
    // =========================================
    const btnCancelGameLeave = document.getElementById('btn-cancel-game-leave');
    const btnConfirmGameLeave = document.getElementById('btn-confirm-game-leave');
    const modalGameLeave = document.getElementById('modal-game-leave-confirm');
    if (btnCancelGameLeave && modalGameLeave) {
      btnCancelGameLeave.addEventListener('click', () => {
        sounds.playClick();
        modalGameLeave.classList.remove('active');
      });
    }
    if (btnConfirmGameLeave && modalGameLeave) {
      btnConfirmGameLeave.addEventListener('click', () => {
        sounds.playClick();
        modalGameLeave.classList.remove('active');
        this.endRound();
        this.showScreen('home');
      });
    }

    // =========================================
    // 13. UYGULAMADAN ÇIKIŞ ONAY MODALI OLAYLARI
    // =========================================
    const btnCancelAppExit = document.getElementById('btn-cancel-app-exit');
    const btnConfirmAppExit = document.getElementById('btn-confirm-app-exit');
    const modalAppExit = document.getElementById('modal-confirm-exit');
    if (btnCancelAppExit && modalAppExit) {
      btnCancelAppExit.addEventListener('click', () => {
        sounds.playClick();
        modalAppExit.classList.remove('active');
      });
    }
    if (btnConfirmAppExit && modalAppExit) {
      btnConfirmAppExit.addEventListener('click', () => {
        sounds.playClick();
        this.exitApplication();
      });
    }

    // =========================================
    // 14. DONANIM VE TARAYICI GERİ TUŞU DİNLEYİCİLERİ
    // =========================================
    window.addEventListener('popstate', (e) => {
      this.handleHardwareBack();
    });
    window.addEventListener('backbutton', (e) => {
      e.preventDefault();
      this.handleHardwareBack();
    });
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      try {
        window.Capacitor.Plugins.App.addListener('backButton', () => {
          this.handleHardwareBack();
        });
      } catch (err) {
        console.warn('Capacitor App backButton listener hatası:', err);
      }
    }
  }

  updateTeamModeUI() {
    const heroCard = document.getElementById('hero-quick-play')?.parentElement;
    const rulesBar = document.querySelector('.rules-mode-bar');
    const specBar = document.querySelector('.spectator-quick-invite-wrapper');

    if (this.gameMode === 'teams') {
      if (this.modeTeamBtn) this.modeTeamBtn.classList.add('active');
      if (this.modeSoloBtn) this.modeSoloBtn.classList.remove('active');
      if (this.teamSettingsBox) this.teamSettingsBox.style.display = 'flex';
      if (this.categoryGrid) this.categoryGrid.style.display = 'grid';
      if (heroCard) heroCard.style.display = 'block';
      if (rulesBar) rulesBar.style.display = 'block';
      if (specBar) specBar.style.display = 'block';
      if (this.headerModeSub) this.headerModeSub.textContent = '⚔️ TAKIM SAVAŞI';
    } else {
      if (this.modeSoloBtn) this.modeSoloBtn.classList.add('active');
      if (this.modeTeamBtn) this.modeTeamBtn.classList.remove('active');
      if (this.teamSettingsBox) this.teamSettingsBox.style.display = 'none';
      if (this.categoryGrid) this.categoryGrid.style.display = 'grid';
      if (heroCard) heroCard.style.display = 'block';
      if (rulesBar) rulesBar.style.display = 'block';
      if (specBar) specBar.style.display = 'block';
      if (this.headerModeSub) this.headerModeSub.textContent = '🎮 TEKLİ MOD';
    }
  }

  checkOrientation() {
    // Hem dikey (elde) hem yatay (alında) serbest oynanış desteklenir
    if (this.orientationWarning) {
      this.orientationWarning.classList.remove('visible');
    }
  }

  stopSummaryVideo() {
    if (this.summaryVideo) {
      try {
        this.summaryVideo.pause();
        this.summaryVideo.currentTime = 0;
        this.summaryVideo.removeAttribute('src');
        this.summaryVideo.load();
      } catch (e) {}
    }
  }

  showScreen(screenKey) {
    // 1. Summary ekranından çıkılıyorsa video oynatıcısını tamamen durdur ve sustur
    if (screenKey !== 'summary') {
      this.stopSummaryVideo();
    }

    // 2. Oyun (round) veya geri sayım (countdown) haricinde bir ekrana geçiliyorsa:
    // - Parti müziğini durdur
    // - Aktif mikrofon ve kamera donanımını kapat (Android mikrofon simgesi kapansın)
    if (screenKey !== 'round' && screenKey !== 'countdown') {
      try { sounds.stopAll(); } catch (e) {}
      this.isPlayingTestMusic = false;
      if (this.btnTestMusicRef) {
        this.btnTestMusicRef.textContent = '▶️ Dinle';
      }
      if (this.camera) {
        try {
          if (this.camera.isRecording) {
            this.camera.stopRecording();
          }
          this.camera.stopCamera();
        } catch (e) {}
      }
    }

    if (screenKey !== 'passaparola' && this.passaparolaEngine) {
      if (this.passaparolaEngine.timerInterval) clearInterval(this.passaparolaEngine.timerInterval);
      this.passaparolaEngine.isPlaying = false;
    }

    if (screenKey === 'party-games') screenKey = 'partyGames';

    Object.values(this.screens).forEach(el => {
      if (el) el.classList.remove('active');
    });
    if (this.screens[screenKey]) {
      this.screens[screenKey].classList.add('active');
    }

    if (screenKey !== 'round' && this.screens.round) {
      this.screens.round.classList.remove('camera-active');
    } else if (screenKey === 'round' && this.cameraEnabled && this.camera && this.camera.hasPermission) {
      if (this.screens.round) {
        this.screens.round.classList.add('camera-active');
      }
      const bgVideo = document.getElementById('round-fullscreen-camera-video');
      if (bgVideo && this.camera.stream) {
        bgVideo.srcObject = this.camera.stream;
        bgVideo.play().catch(e => console.warn('bgVideo play error:', e));
      }
    }
    this.checkOrientation();
  }

  handleHardwareBack() {
    sounds.playClick();

    // 1. Herhangi bir açık modal var mı?
    const activeModals = document.querySelectorAll('.modal-overlay.active, .modal.active, .rules-guide-overlay.active');
    if (activeModals && activeModals.length > 0) {
      const topModal = activeModals[activeModals.length - 1];
      // Eğer zaten çıkış modalı açıksa ve yine basıldıysa çıkış yap
      if (topModal.id === 'modal-confirm-exit') {
        this.exitApplication();
        return;
      }
      topModal.classList.remove('active');
      return;
    }

    // 2. Aktif ekran hangisi?
    const activeScreen = document.querySelector('.screen.active');
    const screenId = activeScreen ? activeScreen.id : 'screen-home';

    // 3. Parti oyunlarının içindeyse -> party-games ekranına dön
    const partyScreens = [
      'screen-vampire', 'screen-spy', 'screen-bomb', 'screen-bottle',
      'screen-isim-sehir', 'screen-sarki-duello', 'screen-kelime-bombasi',
      'screen-gulmeme-meydani', 'screen-passaparola', 'screen-carkifelek'
    ];
    if (partyScreens.includes(screenId)) {
      if (this.gulmemeEngine) {
        try { this.gulmemeEngine.stopCamera(); } catch (e) {}
      }
      if (this.passaparolaEngine && this.passaparolaEngine.timerInterval) {
        clearInterval(this.passaparolaEngine.timerInterval);
      }
      if (this.sarkiDuelloEngine && this.sarkiDuelloEngine.audioElement) {
        try { this.sarkiDuelloEngine.audioElement.pause(); } catch (e) {}
      }
      this.showScreen('partyGames');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4. Parti oyunları ana ekranındaysa ('screen-party-games') -> Ana sayfaya dön
    if (screenId === 'screen-party-games') {
      this.showScreen('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 5. Oyun turları esnasındaysa ('screen-round' veya 'screen-countdown') -> Oyundan çıkış onay modalını aç
    if (screenId === 'screen-round' || screenId === 'screen-countdown') {
      const leaveModal = document.getElementById('modal-game-leave-confirm');
      if (leaveModal) {
        leaveModal.classList.add('active');
      } else {
        this.showScreen('home');
      }
      return;
    }

    // 6. Tur özeti veya kazanan ekranındaysa ('screen-summary' veya 'screen-match-winner') -> Ana sayfaya dön
    if (screenId === 'screen-summary' || screenId === 'screen-match-winner') {
      this.stopSummaryVideo();
      this.showScreen('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 7. Ana sayfadaysa ('screen-home') -> Uygulamadan çıkış onay modalını aç
    if (screenId === 'screen-home') {
      const exitModal = document.getElementById('modal-confirm-exit');
      if (exitModal) {
        exitModal.classList.add('active');
      } else {
        this.exitApplication();
      }
    }
  }

  exitApplication() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else if (navigator && navigator.app && navigator.app.exitApp) {
      navigator.app.exitApp();
    } else {
      window.close();
    }
  }

  getPin() {
    return localStorage.getItem(this.pinStorageKey) || '1818';
  }

  setPin(newPin) {
    if (!/^\d{4}$/.test(newPin)) return false;
    localStorage.setItem(this.pinStorageKey, newPin);
    return true;
  }

  getRecoveryQuestion() {
    return localStorage.getItem(this.recoveryQuestionKey) || 'İlk evcil hayvanınızın adı nedir?';
  }

  setRecoveryQuestion(question) {
    if (!question) return;
    localStorage.setItem(this.recoveryQuestionKey, question);
  }

  getRecoveryAnswer() {
    return (localStorage.getItem(this.recoveryStorageKey) || '').trim().toLowerCase();
  }

  setRecoveryAnswer(answer) {
    if (!answer || answer.trim().length < 2) return false;
    localStorage.setItem(this.recoveryStorageKey, answer.trim().toLowerCase());
    return true;
  }

  resetPin() {
    localStorage.removeItem(this.pinStorageKey);
    localStorage.removeItem(this.recoveryStorageKey);
    localStorage.removeItem(this.recoveryQuestionKey);
    return '1818';
  }

  openPinResetModal() {
    if (this.modalPinReset) {
      if (this.resetAuthError) this.resetAuthError.style.display = 'none';
      if (this.inputResetAuth) this.inputResetAuth.value = '';
      if (this.pinResetQuestionText) {
        const savedAnswer = this.getRecoveryAnswer();
        if (savedAnswer) {
          this.pinResetQuestionText.textContent = this.getRecoveryQuestion();
        } else {
          this.pinResetQuestionText.textContent = 'Kurtarma sorusu henüz belirlenmemiş. PIN sıfırlamak için mevcut PIN kodunuzu girin.';
        }
      }
      this.modalPinReset.classList.add('active');
      if (this.inputResetAuth) {
        setTimeout(() => this.inputResetAuth.focus(), 150);
      }
    }
  }

  closePinResetModal() {
    if (this.modalPinReset) {
      this.modalPinReset.classList.remove('active');
    }
  }

  getLockedCategories() {
    try {
      const saved = localStorage.getItem(this.lockedCatsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['adult-18']; // Varsayılan olarak Yetişkinler kilitlidir
  }

  isCategoryLocked(catId) {
    return this.getLockedCategories().includes(catId);
  }

  setCategoryLock(catId, isLocked) {
    const list = this.getLockedCategories();
    let updated;
    if (isLocked) {
      updated = Array.from(new Set([...list, catId]));
    } else {
      updated = list.filter(id => id !== catId);
    }
    localStorage.setItem(this.lockedCatsKey, JSON.stringify(updated));
  }

  renderCategoryLocksList() {
    const container = document.getElementById('category-locks-container');
    if (!container) return;

    container.innerHTML = '';
    const lockedIds = this.getLockedCategories();

    this.categories.forEach(cat => {
      const isLocked = lockedIds.includes(cat.id);
      const row = document.createElement('div');
      row.className = 'cat-lock-item';
      row.innerHTML = `
        <div class="cat-lock-info">
          <span class="icon">${cat.icon}</span>
          <div>
            <span class="name">${cat.title}</span>
            ${isLocked ? '<span class="cat-lock-badge" style="margin-left:6px;">🔒 KİLİTLİ</span>' : ''}
          </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-cat-id="${cat.id}" ${isLocked ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      `;

      const input = row.querySelector('input');
      input.addEventListener('change', (e) => {
        const wantsToUnlock = !e.target.checked;
        if (wantsToUnlock) {
          const verifyPin = prompt('🔐 Kategori kilidini kaldırmak için PIN kodunuzu girin:');
          if (verifyPin !== this.getPin()) {
            alert('❌ Hatalı PIN! Kategori kilidi kaldırılamadı.');
            e.target.checked = true;
            return;
          }
        }
        this.setCategoryLock(cat.id, e.target.checked);
        this.renderCategoryLocksList();
        this.renderCategoryGrid();
      });

      container.appendChild(row);
    });
  }

  renderCategoryGrid() {
    this.categoryGrid.innerHTML = '';

    const filter = this.activeFilter || 'all';
    const filtered = this.categories.filter(cat => {
      if (filter === 'all') return true;
      if (filter === 'party') return ['roleplay-acting', 'memes-trends', 'tabu-classic', 'adult-18'].includes(cat.id);
      if (filter === 'music') return ['complete-lyrics', 'nostalgia-songs'].includes(cat.id);
      if (filter === 'cinema') return ['series-movies', 'animation-movies'].includes(cat.id);
      if (filter === 'adult') return cat.id === 'adult-18';
      if (filter === 'kids') return ['kids-special', 'animals-nature', 'animation-movies'].includes(cat.id);
      return true;
    });

    filtered.forEach(cat => {
      const isLocked = this.isCategoryLocked(cat.id);
      const card = document.createElement('div');
      card.className = 'arcade-cat-card';

      let cleanTitle = cat.title;
      if (cleanTitle.startsWith(cat.icon)) {
        cleanTitle = cleanTitle.replace(cat.icon, '').trim();
      }

      card.innerHTML = `
        <div class="arcade-card-top-row">
          <span class="arcade-count-pill">${cat.words.length}+</span>
          ${isLocked ? '<span class="arcade-status-tag">🔒 Kilitli</span>' : ''}
        </div>
        <div class="arcade-icon-stage">${cat.icon}</div>
        <div class="arcade-card-body">
          <h3 class="arcade-card-title">${cleanTitle}</h3>
        </div>
      `;

      // Deste QR Paylaş Butonu
      const topRow = card.querySelector('.arcade-card-top-row');
      if (topRow) {
        const btnShareDeck = document.createElement('button');
        btnShareDeck.type = 'button';
        btnShareDeck.className = 'cat-share-qr-btn';
        btnShareDeck.innerHTML = '<span>📲 QR</span>';
        btnShareDeck.title = 'Desteyi QR ile Paylaş';
        btnShareDeck.addEventListener('click', (e) => {
          e.stopPropagation();
          sounds.playClick();
          this.openDeckShareQR(cat);
        });
        topRow.appendChild(btnShareDeck);
      }

      card.addEventListener('click', () => {
        sounds.playClick();
        this.selectCategoryAndStart(cat);
      });

      this.categoryGrid.appendChild(card);
    });
  }

  selectCategoryAndStart(cat) {
    if (this.isCategoryLocked(cat.id)) {
      this.pendingCategory = cat;
      this.modalPinLock.classList.add('active');
      this.inputPinCode.value = '';
      this.pinErrorMsg.style.display = 'none';
      setTimeout(() => this.inputPinCode.focus(), 150);
      return;
    }
    this.checkCameraConsentAndStart(cat);
  }

  checkCameraConsentAndStart(cat) {
    this.pendingCategory = cat;

    const cameraConsent = localStorage.getItem('kafanatak_camera_consent'); // 'enabled', 'disabled'
    const askConsentAlways = localStorage.getItem('kafanatak_camera_always_ask') !== 'false';

    // Eğer kullanıcı her defasında onay sorma dediyse ve kayıtlı bir tercih varsa doğrudan başla
    if (!askConsentAlways && cameraConsent) {
      this.cameraEnabled = cameraConsent === 'enabled';
      this.proceedStartCategory(cat);
      return;
    }

    // Aksi halde kullanıcıdan açık onay al
    if (this.modalCameraConfirm) {
      if (this.chkCameraRemember) {
        this.chkCameraRemember.checked = !askConsentAlways;
      }
      this.modalCameraConfirm.classList.add('active');
    } else {
      this.proceedStartCategory(cat);
    }
  }

  async proceedStartCategory(cat) {
    this.currentCategory = cat;
    this.isFortuneWheelMatch = false;

    if (this.gameMode === 'teams') {
      this.currentTeamIndex = 0;
      this.currentRoundNumber = 1;
      this.teams[0].score = 0;
      this.teams[1].score = 0;
    }

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    await MotionDetector.requestSensorPermission();

    if (this.cameraEnabled) {
      await this.camera.initCamera(this.cameraPip);
      this.cameraPipContainer.style.display = 'block';
    } else {
      this.cameraPipContainer.style.display = 'none';
    }

    this.startCountdown();
  }

  startCountdown() {
    try { history.pushState({ screen: 'game' }, ''); } catch (e) {}
    this.showScreen('countdown');
    this.countdownCatName.textContent = this.currentCategory ? this.currentCategory.title : '';
    try { sounds.unlockAudio(); } catch (e) {}
    try { announcer.unlockAudio(); } catch (e) {}
    try { this.broadcastSpectatorState('countdown'); } catch (e) {}

    if (this.gameMode === 'teams') {
      const activeTeam = this.teams[this.currentTeamIndex];
      this.countdownTeamBadge.style.display = 'inline-block';
      this.countdownTeamBadge.textContent = `⚔️ ${activeTeam.name} Sırası (Tur ${this.currentRoundNumber}/${this.totalRounds})`;
      this.countdownTeamBadge.style.backgroundColor = activeTeam.color;
    } else {
      this.countdownTeamBadge.style.display = 'none';
    }

    let count = 3;
    this.countdownNumber.textContent = count;
    sounds.playCountdownBeep(false);

    // Sensörü şimdiden başlat
    this.motion.start();

    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.textContent = count;
        this.countdownNumber.classList.add('pulse');
        setTimeout(() => this.countdownNumber.classList.remove('pulse'), 400);
        sounds.playCountdownBeep(false);

        // Son saniyede (telefon artık alındayken) dik duruşu tam olarak mühürle
        if (count === 1) {
          this.motion.calibrateNow();
        }
      } else if (count === 0) {
        this.countdownNumber.textContent = 'BAŞLA!';
        sounds.playCountdownBeep(true);
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.startRound();
      }
    }, 1000);
  }

  getEffectiveRoundDuration() {
    if (this.roundDurationSelect && this.roundDurationSelect.value === 'custom') {
      const val = parseInt(this.inputCustomDuration ? this.inputCustomDuration.value : '60', 10);
      return isNaN(val) ? 60 : Math.max(10, Math.min(300, val));
    }
    const selectVal = parseInt(this.roundDurationSelect ? this.roundDurationSelect.value : '60', 10);
    return isNaN(selectVal) ? 60 : selectVal;
  }

  startRound() {
    this.showScreen('round');

    this.wordsPool = [...this.currentCategory.words].sort(() => Math.random() - 0.5);
    this.currentWordIndex = 0;
    this.score = { correct: [], passed: [], taboo: [] };

    // Kural Modu Başlatma ve Süre Ayarı
    if (this.fortuneWheelOverrideDuration) {
      this.roundDuration = this.fortuneWheelOverrideDuration;
      this.remainingTime = this.roundDuration;
      this.fortuneWheelOverrideDuration = null; // Sadece bu tura özel
      if (this.bombHudBadge) this.bombHudBadge.style.display = (this.ruleMode === 'bomb') ? 'flex' : 'none';
      if (this.mimeBanner) this.mimeBanner.style.display = (this.ruleMode === 'mime') ? 'flex' : 'none';
      if (this.letterBanner) this.letterBanner.style.display = 'none';
      if (this.tabooBanner) this.tabooBanner.style.display = (this.ruleMode === 'taboo') ? 'flex' : 'none';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = (this.ruleMode === 'taboo') ? 'flex' : 'none';
    } else if (this.ruleMode === 'bomb') {
      // Bomba modu: Rastgele gizli süre (35 - 55 saniye)
      this.roundDuration = Math.floor(Math.random() * 21) + 35;
      this.remainingTime = this.roundDuration;
      if (this.bombHudBadge) this.bombHudBadge.style.display = 'flex';
      if (this.mimeBanner) this.mimeBanner.style.display = 'none';
      if (this.letterBanner) this.letterBanner.style.display = 'none';
      if (this.tabooBanner) this.tabooBanner.style.display = 'none';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = 'none';
      if (this.bombPassPrompt) this.bombPassPrompt.classList.remove('show');
      if (this.bombExplosionOverlay) this.bombExplosionOverlay.classList.remove('active');
      announcer.speak('Bomba turu başladı! Doğru bil ve hemen yanındakine pasla!');
    } else if (this.ruleMode === 'mime') {
      this.roundDuration = this.getEffectiveRoundDuration();
      this.remainingTime = this.roundDuration;
      if (this.bombHudBadge) this.bombHudBadge.style.display = 'none';
      if (this.mimeBanner) this.mimeBanner.style.display = 'flex';
      if (this.letterBanner) this.letterBanner.style.display = 'none';
      if (this.tabooBanner) this.tabooBanner.style.display = 'none';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = 'none';
      announcer.speak('Sessiz Sinema! Konuşmak ve ses çıkarmak kesinlikle yasak!');
    } else if (this.ruleMode === 'letter') {
      this.roundDuration = this.getEffectiveRoundDuration();
      this.remainingTime = this.roundDuration;
      const letters = ['E', 'A', 'İ', 'K', 'M', 'T', 'S', 'L', 'O', 'R'];
      this.forbiddenLetter = letters[Math.floor(Math.random() * letters.length)];
      if (this.valForbiddenLetter) this.valForbiddenLetter.textContent = this.forbiddenLetter;
      if (this.bombHudBadge) this.bombHudBadge.style.display = 'none';
      if (this.mimeBanner) this.mimeBanner.style.display = 'none';
      if (this.letterBanner) this.letterBanner.style.display = 'flex';
      if (this.tabooBanner) this.tabooBanner.style.display = 'none';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = 'none';
      announcer.speak(`Yasak Harf: ${this.forbiddenLetter}! Bu harfi içeren kelime kullanan ceza alır!`);
    } else if (this.ruleMode === 'taboo') {
      // Klasik Tabu Modu (4 Yasaklı Kelime + Yanında -1 Ceza Butonu)
      this.roundDuration = this.getEffectiveRoundDuration();
      this.remainingTime = this.roundDuration;
      if (this.bombHudBadge) this.bombHudBadge.style.display = 'none';
      if (this.mimeBanner) this.mimeBanner.style.display = 'none';
      if (this.letterBanner) this.letterBanner.style.display = 'none';
      if (this.tabooBanner) this.tabooBanner.style.display = 'flex';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = 'flex';

      // Eğer seçili kategoride tabu kelimesi yoksa otomatik 'tabu-classic' destesini kullan
      const hasTabooWords = this.currentCategory && this.currentCategory.words && this.currentCategory.words.some(w => typeof w === 'object' && w.taboo && w.taboo.length > 0);
      if (!hasTabooWords) {
        const tabuCategory = this.categories.find(c => c.id === 'tabu-classic');
        if (tabuCategory) {
          this.currentCategory = tabuCategory;
          this.wordsPool = [...this.currentCategory.words].sort(() => Math.random() - 0.5);
        }
      }
      announcer.speak('Klasik Tabu turu başladı! Yasaklı kelimeleri söyleme!');
    } else {
      // Klasik (Seçilen veya Manuel Belirlenen Tur Süresi)
      this.roundDuration = this.getEffectiveRoundDuration();
      this.remainingTime = this.roundDuration;
      if (this.bombHudBadge) this.bombHudBadge.style.display = 'none';
      if (this.mimeBanner) this.mimeBanner.style.display = 'none';
      if (this.letterBanner) this.letterBanner.style.display = 'none';
      if (this.tabooBanner) this.tabooBanner.style.display = 'none';
      if (this.btnHandheldTaboo) this.btnHandheldTaboo.style.display = 'none';
      try { announcer.speak('Parti başladı! Kafana tak ve bil!', { force: true }); } catch (e) {}
    }

    if (this.gameMode === 'teams') {
      const activeTeam = this.teams[this.currentTeamIndex];
      this.roundTeamIndicator.style.display = 'block';
      this.roundTeamIndicator.textContent = activeTeam.name;
      this.roundTeamIndicator.style.backgroundColor = activeTeam.color;
    } else {
      this.roundTeamIndicator.style.display = 'none';
    }

    this.updateScoreDisplay();
    this.displayNextWord();

    // Kamera HUD başlat
    this.camera.updateHUD({
      category: this.currentCategory.title,
      word: this.getCurrentWordText(),
      remainingTime: this.remainingTime,
      scoreCorrect: 0,
      scorePassed: 0
    });

    if (this.cameraEnabled && this.camera.hasPermission) {
      if (this.screens.round) {
        this.screens.round.classList.add('camera-active');
      }
      const bgVideo = document.getElementById('round-fullscreen-camera-video');
      if (bgVideo && this.camera.stream) {
        bgVideo.srcObject = this.camera.stream;
        bgVideo.play().catch(e => console.warn('bgVideo play error:', e));
      }
      if (this.cameraPip) {
        this.cameraPip.play().catch(e => console.warn('PIP play error:', e));
      }
      this.camera.startRecording();
    } else {
      if (this.screens.round) {
        this.screens.round.classList.remove('camera-active');
      }
    }

    // Sensör zaten startCountdown'da başlatıldı ve kalibre edildi
    sounds.startPartyBeat();
    this.requestWakeLock();
    this.triggerHaptic('start');
    this.startCheerPolling();
    this.broadcastSpectatorState('playing');
    this.startTimer();
  }

  startTimer() {
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.updateTimerDisplay();
      if (this.remainingTime % 2 === 0) {
        this.broadcastSpectatorState();
      }

      // Kamera HUD süresini güncelle
      this.camera.updateHUD({ remainingTime: this.remainingTime });

      if (this.ruleMode === 'bomb') {
        // Bomba Modu: Süre azaldıkça hızlanan bomba tık sesi
        try { sounds.playBombTick(this.remainingTime, this.roundDuration); } catch (e) {}
        if (this.remainingTime <= 5) {
          this.triggerHaptic('tick');
        }

        if (this.remainingTime <= 0) {
          clearInterval(this.timerInterval);
          this.triggerBombExplosion();
          return;
        }
      } else {
        // Normal / Klasik Mod
        if (this.remainingTime === 10) {
          try { announcer.onCountdown10(); } catch (e) {}
        }

        // Panik HUD: Son 10 saniyede ekran kenarlarında atan neon kırmızı nabız
        if (this.remainingTime <= 10 && this.remainingTime > 0) {
          if (this.screens && this.screens.round) {
            this.screens.round.classList.add('panic-pulse-active');
          }
        } else {
          if (this.screens && this.screens.round) {
            this.screens.round.classList.remove('panic-pulse-active');
          }
        }

        if (this.remainingTime <= 5 && this.remainingTime > 0) {
          try { sounds.playTick(true); } catch (e) {}
          this.triggerHaptic('tick');
        } else if (this.remainingTime % 10 === 0 && this.remainingTime > 0) {
          try { sounds.playTick(false); } catch (e) {}
        }

        if (this.remainingTime <= 0) {
          clearInterval(this.timerInterval);
          this.endRound();
        }
      }
    }, 1000);
  }

  updateTimerDisplay() {
    if (this.ruleMode === 'bomb') {
      this.roundTimerText.textContent = '💣 SÜRPRİZ!';
      this.roundTimerBar.style.width = '100%';
      this.roundTimerBar.style.backgroundColor = '#FF9500';
      return;
    }

    this.roundTimerText.textContent = `${this.remainingTime}s`;
    const percentage = (this.remainingTime / this.roundDuration) * 100;
    this.roundTimerBar.style.width = `${percentage}%`;

    if (this.remainingTime <= 10) {
      this.roundTimerBar.style.backgroundColor = '#FF3B30';
    } else {
      this.roundTimerBar.style.backgroundColor = '#00F5D4';
    }
  }

  getCurrentWordText() {
    return typeof this.currentWordItem === 'string'
      ? this.currentWordItem
      : (this.currentWordItem?.word || '');
  }

  fitWordToScreen(wordText, hasTaboo = false) {
    if (!this.roundWord) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    const len = (wordText || '').length;

    let sizeRem = 5.2;

    if (hasTaboo) {
      if (isPortrait) {
        if (len <= 7) sizeRem = 2.4;
        else if (len <= 13) sizeRem = 2.0;
        else if (len <= 20) sizeRem = 1.7;
        else sizeRem = 1.4;
      } else {
        if (len <= 7) sizeRem = 3.6;
        else if (len <= 13) sizeRem = 3.0;
        else if (len <= 20) sizeRem = 2.4;
        else sizeRem = 2.0;
      }
    } else {
      if (isPortrait) {
        if (len <= 6) sizeRem = 3.8;
        else if (len <= 10) sizeRem = 3.0;
        else if (len <= 16) sizeRem = 2.4;
        else if (len <= 22) sizeRem = 2.0;
        else sizeRem = 1.7;
      } else {
        if (len <= 6) sizeRem = 6.4;
        else if (len <= 10) sizeRem = 5.2;
        else if (len <= 16) sizeRem = 4.2;
        else if (len <= 22) sizeRem = 3.4;
        else sizeRem = 2.7;
      }
    }

    this.roundWord.style.fontSize = `${sizeRem}rem`;
  }

  displayNextWord() {
    if (this.currentWordIndex >= this.wordsPool.length) {
      this.wordsPool = [...this.currentCategory.words].sort(() => Math.random() - 0.5);
      this.currentWordIndex = 0;
    }

    const item = this.wordsPool[this.currentWordIndex];
    this.currentWordItem = item;

    // 3D kart dönüş animasyonu
    if (this.roundWordCard) {
      this.roundWordCard.classList.remove('flip-3d-active');
      void this.roundWordCard.offsetWidth; // DOM reflow
      this.roundWordCard.classList.add('flip-3d-active');
    }

    // Altın Kart (2X Çift Puan) Mekaniği: Bomba modu haricinde ~%22 şansla parlayan altın kart
    this.isGoldenCard = (this.ruleMode !== 'bomb') && (Math.random() < 0.22);
    if (this.roundWordCard) {
      if (this.isGoldenCard) {
        this.roundWordCard.classList.add('golden-card-active');
        if (this.goldenCardBadge) this.goldenCardBadge.style.display = 'inline-flex';
        try { sounds.playChime(); } catch (e) {}
      } else {
        this.roundWordCard.classList.remove('golden-card-active');
        if (this.goldenCardBadge) this.goldenCardBadge.style.display = 'none';
      }
    }

    let hasTaboo = false;
    if (typeof item === 'string') {
      this.roundWord.textContent = item;
      this.roundTabooList.style.display = 'none';
      this.roundTabooList.innerHTML = '';
    } else if (item && item.word) {
      this.roundWord.textContent = item.word;
      if (item.taboo && item.taboo.length > 0) {
        hasTaboo = true;
        this.roundTabooList.style.display = 'flex';
        this.roundTabooList.innerHTML = item.taboo
          .map(t => `<div class="taboo-badge">❌ ${t}</div>`)
          .join('');
      } else {
        this.roundTabooList.style.display = 'none';
      }
    }

    // Kelimenin ekrana taşmadan kusursuz oturmasını sağla
    this.fitWordToScreen(this.getCurrentWordText(), hasTaboo);

    // Video HUD üzerine kelimeyi yaz
    this.camera.updateHUD({
      word: this.getCurrentWordText(),
      scoreCorrect: this.score.correct.length,
      scorePassed: this.score.passed.length
    });

    try { this.broadcastSpectatorState(); } catch (e) {}
  }

  promptAbortRound() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    try { sounds.stopPartyBeat(); } catch (e) {}
    try { announcer.stop(); } catch (e) {}

    if (this.modalAbortRound) {
      this.modalAbortRound.classList.add('active');
    }
  }

  resumeRoundFromAbort() {
    if (this.modalAbortRound) {
      this.modalAbortRound.classList.remove('active');
    }

    if (this.screens.round && this.screens.round.classList.contains('active') && this.remainingTime > 0) {
      sounds.startPartyBeat();
      this.startTimer();
    }
  }

  abortGameToHome() {
    try {
      if (this.modalAbortRound) {
        this.modalAbortRound.classList.remove('active');
      }
      if (this.modalCameraConfirm) {
        this.modalCameraConfirm.classList.remove('active');
      }
      if (this.bombExplosionOverlay) {
        this.bombExplosionOverlay.classList.remove('active');
      }
      if (this.screens && this.screens.round) {
        this.screens.round.classList.remove('panic-pulse-active');
      }
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }

      if (this.motion) {
        try { this.motion.stop(); } catch (e) {}
      }

      try { sounds.stopAll(); } catch (e) {}
      try { announcer.stop(); } catch (e) {}

      if (this.camera) {
        try {
          if (this.camera.isRecording) {
            this.camera.stopRecording();
          }
          this.camera.stopCamera();
        } catch (e) {}
      }

      this.stopSummaryVideo();
      try { this.stopCheerPolling(); } catch (e) {}
      try { this.broadcastSpectatorState('idle'); } catch (e) {}
      try { this.releaseWakeLock(); } catch (e) {}
    } catch (err) {
      console.warn('abortGameToHome temizleme hatası:', err);
    } finally {
      this.showScreen('home');
      try { this.refreshCategoriesList(); } catch (e) {}
      try { this.motion.start(); } catch (e) {} // Ana ekranda canlı açı barı çalışsın
    }
  }

  showExitConfirmModal() {
    if (this.modalConfirmExit) {
      this.modalConfirmExit.classList.add('active');
    }
  }

  hideExitConfirmModal() {
    if (this.modalConfirmExit) {
      this.modalConfirmExit.classList.remove('active');
    }
  }

  confirmExitApp() {
    this.hideExitConfirmModal();
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (e) {}

    if (navigator.app && navigator.app.exitApp) {
      navigator.app.exitApp();
    } else {
      window.close();
    }
  }

  showGameLeaveConfirmModal(targetScreen = 'partyGames', cleaner = null) {
    this.pendingLeaveTarget = targetScreen;
    this.pendingLeaveCleaner = cleaner;
    if (this.modalGameLeaveConfirm) {
      this.modalGameLeaveConfirm.classList.add('active');
      this.modalGameLeaveConfirm.style.display = 'flex';
      try { sounds.playClick(); } catch (e) {}
    }
  }

  hideGameLeaveConfirmModal() {
    if (this.modalGameLeaveConfirm) {
      this.modalGameLeaveConfirm.classList.remove('active');
      this.modalGameLeaveConfirm.style.display = 'none';
    }
    this.pendingLeaveCleaner = null;
  }

  confirmGameLeave() {
    const cleaner = this.pendingLeaveCleaner;
    const target = this.pendingLeaveTarget || 'partyGames';
    this.hideGameLeaveConfirmModal();
    try { sounds.playClick(); } catch (e) {}

    if (typeof cleaner === 'function') {
      try { cleaner(); } catch (e) { console.warn('Cleaner hatası:', e); }
    }

    if (target === 'home') {
      this.abortGameToHome();
    } else {
      this.showScreen(target);
    }
  }

  initBackNavigation() {
    const handleBack = () => {
      // 1. Oyundan çıkış onay modalı açıksa kapat (oyunda kal)
      if (this.modalGameLeaveConfirm && (this.modalGameLeaveConfirm.classList.contains('active') || this.modalGameLeaveConfirm.style.display === 'flex')) {
        this.hideGameLeaveConfirmModal();
        return;
      }

      // 1.1. Uygulamadan çıkış onay modalı açıksa kapat
      if (this.modalConfirmExit && this.modalConfirmExit.classList.contains('active')) {
        this.hideExitConfirmModal();
        return;
      }

      // 1.5. Tur iptal onay modalı açıksa iptal et (oyuna devam et)
      if (this.modalAbortRound && this.modalAbortRound.classList.contains('active')) {
        this.resumeRoundFromAbort();
        return;
      }

      // 1.6. Kamera onay modalı açıksa kapat
      if (this.modalCameraConfirm && this.modalCameraConfirm.classList.contains('active')) {
        this.modalCameraConfirm.classList.remove('active');
        return;
      }

      // 1.7. Takım Kader Çarkı modalı açıksa kapat
      if (this.modalTeamFortune && this.modalTeamFortune.classList.contains('active')) {
        this.closeTeamFortuneWheel();
        return;
      }

      // 1.8. Ayarlar Merkezi modalı açıksa kapat (sesleri kesin olarak susturur)
      if (this.modalSettingsHub && this.modalSettingsHub.classList.contains('active')) {
        this.closeSettingsHub();
        return;
      }

      // 2. Açık olan tüm diğer alt modalları kapat ve sesleri kes
      const openModals = [
        document.getElementById('modal-party-game-guide'),
        document.getElementById('modal-vampire-rules'),
        document.getElementById('modal-apk-qr-download'),
        document.getElementById('modal-dare-wheel'),
        document.getElementById('modal-spectator-qr'),
        document.getElementById('modal-spy-guess-location'),
        document.getElementById('modal-isim-categories'),
        this.modalDailySpin,
        this.modalCustom,
        this.modalProfile,
        this.modalPinLock,
        this.modalPinReset,
        this.modalSensorTest
      ];
      for (const modal of openModals) {
        if (modal && (modal.classList.contains('active') || modal.style.display === 'flex' || modal.style.display === 'block')) {
          try { sounds.stopAll(); } catch (e) {}
          modal.classList.remove('active');
          modal.style.display = 'none';
          return;
        }
      }

      // 3. Tur ekranındaysa veya geri sayım ekranındaysa: Menüye dönmek için ONAY İSTE
      if (
        (this.screens.round && this.screens.round.classList.contains('active')) ||
        (this.screens.countdown && this.screens.countdown.classList.contains('active'))
      ) {
        this.showGameLeaveConfirmModal('home', () => {
          this.abortGameToHome();
        });
        return;
      }

      // 4. Parti Oyunlarındaysa: Doğrudan temizle ve Parti Arenasına dön (Bloke edici popup olmadan)
      // 4.1 İsim Şehir
      if (this.screens['isim-sehir'] && this.screens['isim-sehir'].classList.contains('active')) {
        if (this.isimSehirEngine) {
          if (this.isimSehirEngine.pollInterval) clearInterval(this.isimSehirEngine.pollInterval);
          if (this.isimSehirEngine.timerInterval) clearInterval(this.isimSehirEngine.timerInterval);
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.2 Çarkıfelek
      if (this.screens.carkifelek && this.screens.carkifelek.classList.contains('active')) {
        if (this.carkifelekEngine) {
          if (this.carkifelekEngine.turnTimer) clearInterval(this.carkifelekEngine.turnTimer);
          this.carkifelekEngine.isSpinning = false;
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.3 Passaparola
      if (this.screens.passaparola && this.screens.passaparola.classList.contains('active')) {
        if (this.passaparolaEngine) {
          if (this.passaparolaEngine.timerInterval) clearInterval(this.passaparolaEngine.timerInterval);
          this.passaparolaEngine.isPlaying = false;
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.4 Şarkı Düellosu
      if (this.screens['sarki-duello'] && this.screens['sarki-duello'].classList.contains('active')) {
        if (this.sarkiDuelloEngine) {
          if (this.sarkiDuelloEngine.timerInterval) clearInterval(this.sarkiDuelloEngine.timerInterval);
          if (this.sarkiDuelloEngine.audioElement) {
            try { this.sarkiDuelloEngine.audioElement.pause(); } catch (e) {}
          }
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.5 Kelime Bombası / Son Sözü Söyle
      if (this.screens['kelime-bombasi'] && this.screens['kelime-bombasi'].classList.contains('active')) {
        if (this.kelimeBombasiEngine) {
          if (this.kelimeBombasiEngine.timerInterval) clearInterval(this.kelimeBombasiEngine.timerInterval);
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.6 Gülmeme Meydanı
      if (this.screens['gulmeme-meydani'] && this.screens['gulmeme-meydani'].classList.contains('active')) {
        if (this.gulmemeEngine) {
          this.gulmemeEngine.stopCamera();
          if (this.gulmemeEngine.timerInterval) clearInterval(this.gulmemeEngine.timerInterval);
          if (this.gulmemeEngine.promptInterval) clearInterval(this.gulmemeEngine.promptInterval);
          if (this.gulmemeEngine.tensionInterval) clearInterval(this.gulmemeEngine.tensionInterval);
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.7 Vampir - Köylü
      if (this.screens.vampire && this.screens.vampire.classList.contains('active')) {
        const singleContainer = document.getElementById('vampire-single-container');
        const multiContainer = document.getElementById('vampire-multi-container');
        const hubSelect = document.getElementById('vampire-hub-select');
        if ((singleContainer && singleContainer.style.display !== 'none') ||
            (multiContainer && multiContainer.style.display !== 'none')) {
          if (this.vampireEngine) {
            if (this.vampireEngine.pollTimer) clearInterval(this.vampireEngine.pollTimer);
            if (this.vampireEngine.discussTimer) clearInterval(this.vampireEngine.discussTimer);
          }
          if (singleContainer) singleContainer.style.display = 'none';
          if (multiContainer) multiContainer.style.display = 'none';
          if (hubSelect) hubSelect.style.display = 'block';
          sounds.playClick();
          return;
        }
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.8 Casus Kim / Casus Var
      if (this.screens.spy && this.screens.spy.classList.contains('active')) {
        if (this.spyEngine) {
          if (this.spyEngine.timerInterval) clearInterval(this.spyEngine.timerInterval);
        }
        try { sounds.stopPartyBeat(); } catch (e) {}
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.9 Saatli Bomba
      if (this.screens.bomb && this.screens.bomb.classList.contains('active')) {
        if (this.bombEngine) {
          if (this.bombEngine.tickInterval) clearInterval(this.bombEngine.tickInterval);
        }
        try { sounds.stopAll(); } catch (e) {}
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 4.10 Şişe Çevirmece
      if (this.screens.bottle && this.screens.bottle.classList.contains('active')) {
        sounds.playClick();
        this.showScreen('partyGames');
        return;
      }

      // 5. Parti Oyunları Ana Arenasındaysa -> Ana Menüye dön
      if (
        (this.screens.partyGames && this.screens.partyGames.classList.contains('active')) ||
        (this.screens['party-games'] && this.screens['party-games'].classList.contains('active'))
      ) {
        sounds.playClick();
        this.showScreen('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 6. Özet veya maç kazananı ekranındaysa ana menüye dön
      if (
        (this.screens.summary && this.screens.summary.classList.contains('active')) ||
        (this.screens['match-winner'] && this.screens['match-winner'].classList.contains('active'))
      ) {
        sounds.playClick();
        this.showScreen('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 7. Ana menüdeyse çıkış onayı göster
      if (this.screens.home && this.screens.home.classList.contains('active')) {
        this.showExitConfirmModal();
      }
    };

    // Global Native Android donanım geri tuşu köprüsü
    this.handleHardwareBack = () => {
      console.log('📱 Android Donanım Geri Tuşu Algılandı!');
      handleBack();
    };
    if (typeof window !== 'undefined') {
      window.handleHardwareBack = this.handleHardwareBack;
    }

    // 1. Capacitor Native Hardware Back Button (Android Geri Tuşu)
    const registerCapacitorBack = () => {
      try {
        const appPlugin = window.Capacitor?.Plugins?.App;
        if (appPlugin && typeof appPlugin.addListener === 'function') {
          appPlugin.addListener('backButton', () => {
            handleBack();
          });
          return true;
        }
      } catch (e) {}
      return false;
    };
    if (!registerCapacitorBack()) {
      setTimeout(registerCapacitorBack, 1000);
      setTimeout(registerCapacitorBack, 3000);
    }

    // 2. Cordova / Android WebView backbutton event
    document.addEventListener('backbutton', (e) => {
      if (e && e.preventDefault) e.preventDefault();
      handleBack();
    }, false);

    // 3. Android WebView Popstate / Geri Navigasyonu Desteği
    window.addEventListener('popstate', (e) => {
      handleBack();
    });

    // 4. Web / Desktop Escape tuşu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Back') {
        handleBack();
      }
    });
  }

  handleAction(action) {
    if (!this.screens.round.classList.contains('active')) return;
    if (this.remainingTime <= 0) return;

    const currentWordText = this.getCurrentWordText();

    if (action === 'correct') {
      if (this.isGoldenCard) {
        this.score.correct.push(`${currentWordText} ⭐(2X)`);
        this.score.correct.push(`⭐ 2X Altın Puanı`);
        try { sounds.playChime(); } catch (e) {}
        this.triggerHaptic('combo');
      } else {
        this.score.correct.push(currentWordText);
        try { sounds.playCorrect(); } catch (e) {}
        this.triggerHaptic('correct');
      }
      try { announcer.onCorrect(); } catch (e) {}
      try { this.camera.triggerStamp('correct'); } catch (e) {}
      this.flashScreen('correct');

      // Bomba moduysa hemen yanındakine ver uyarısı çıkar
      if (this.ruleMode === 'bomb' && this.bombPassPrompt) {
        this.bombPassPrompt.classList.add('show');
        setTimeout(() => {
          if (this.bombPassPrompt) this.bombPassPrompt.classList.remove('show');
        }, 1400);
      }
    } else if (action === 'pass') {
      this.score.passed.push(currentWordText);
      try { sounds.playPass(); } catch (e) {}
      try { announcer.onPass(); } catch (e) {}
      this.triggerHaptic('pass');
      try { this.camera.triggerStamp('pass'); } catch (e) {}
      this.flashScreen('pass');
    } else if (action === 'taboo') {
      if (!this.score.taboo) this.score.taboo = [];
      this.score.taboo.push(currentWordText);
      try { sounds.playError(); } catch (e) {}
      this.triggerHaptic('finish');
      try { this.camera.triggerStamp('pass'); } catch (e) {}
      this.flashScreen('taboo');
    }

    this.currentWordIndex++;
    this.updateScoreDisplay();
    this.displayNextWord();
  }

  flashScreen(type) {
    if (type === 'correct') {
      this.roundFlash.textContent = this.isGoldenCard ? '2X ALTIN PUAN! 🌟 (+2)' : 'DOĞRU! ✅';
    } else if (type === 'taboo') {
      this.roundFlash.textContent = 'TABU! 🚫 (-1)';
    } else {
      this.roundFlash.textContent = 'PAS! ⏭️';
    }
    this.roundFlash.className = `round-flash-overlay flash-${type}`;
    setTimeout(() => {
      this.roundFlash.className = 'round-flash-overlay';
      this.roundFlash.textContent = '';
    }, 400);
  }

  initHardwareHub() {
    // LocalStorage veya kayıtlı değerleri UI kontrolleri ile senkronize et
    if (this.hubSliderThreshold) {
      const currentDeg = this.motion.getThresholdDegrees();
      this.hubSliderThreshold.value = currentDeg;
      if (this.hubThresholdValue) this.hubThresholdValue.textContent = `${currentDeg}°`;
    }

    if (this.hubToggleInvert) {
      this.hubToggleInvert.checked = this.motion.invertTilt;
    }
    if (this.toggleInvertTilt) {
      this.toggleInvertTilt.checked = this.motion.invertTilt;
    }

    if (this.hubToggleTouchOnly) {
      this.hubToggleTouchOnly.checked = this.motion.touchOnlyMode;
    }

    // HTTPS / Güvenlik Durumu Denetimi
    const support = CameraRecorder.checkSupport();
    if (this.sysHttpsDesc && this.sysHttpsBadge && this.sysHttpsIcon) {
      if (support.isSecure) {
        this.sysHttpsIcon.textContent = '🔒';
        this.sysHttpsDesc.textContent = `Güvenli bağlantı aktif (${location.protocol}//${location.host}). Kamera ve hareket sensörü tam yetkilidir.`;
        this.sysHttpsBadge.className = 'status-badge ok';
        this.sysHttpsBadge.textContent = 'GÜVENLİ (HTTPS)';
      } else {
        this.sysHttpsIcon.textContent = '⚠️';
        this.sysHttpsDesc.innerHTML = `Güvensiz HTTP bağlantısı! Telefonunuz kameraya erişimi engeller.<br>Lütfen <strong>https://${location.hostname}:3443</strong> adresinden bağlanın.`;
        this.sysHttpsBadge.className = 'status-badge warn';
        this.sysHttpsBadge.textContent = 'HTTP (KİLİTLİ)';
      }
    }

    if (this.diagCamFacing) {
      this.diagCamFacing.textContent = this.camera.facingMode === 'user' ? 'Ön Kamera (Selfie)' : 'Arka Kamera (Çevre)';
    }

    this.renderCategoryLocksList();
  }

  openSettingsHub(tab = 'security') {
    if (this.modalSettingsHub) {
      this.modalSettingsHub.classList.add('active');
      const card = this.modalSettingsHub.querySelector('.settings-hub-card');
      if (card) card.scrollTop = 0;
      this.switchHubTab(tab);
      this.renderCategoryLocksList();
      this.motion.start();
      this.updateHealthBar();
    }
  }

  closeSettingsHub() {
    try { sounds.stopAll(); } catch (e) {}
    this.isPlayingTestMusic = false;
    if (this.btnTestMusicRef) {
      this.btnTestMusicRef.textContent = '▶️ Dinle';
    }
    if (this.modalSettingsHub) {
      this.modalSettingsHub.classList.remove('active');
      // Turda değilsek ve kamera testi açıksa testi durdur
      if (!this.screens.round.classList.contains('active')) {
        if (this.hubCameraPreview && this.hubCameraPreview.srcObject) {
          this.camera.stopCamera();
          this.hubCameraPreview.srcObject = null;
          if (this.hubCameraPlaceholder) this.hubCameraPlaceholder.style.display = 'flex';
          if (this.btnHubStartCamera) this.btnHubStartCamera.textContent = '📹 Kamerayı Test Et & Aç';
        }
      }
    }
  }

  switchHubTab(activeKey) {
    // Sekme değişince önceki sekmede başlayan test seslerini anında kes
    try { sounds.stopAll(); } catch (e) {}
    this.isPlayingTestMusic = false;
    if (this.btnTestMusicRef) {
      this.btnTestMusicRef.textContent = '▶️ Dinle';
    }

    Object.keys(this.hubTabs).forEach(key => {
      const item = this.hubTabs[key];
      if (!item) return;
      if (key === activeKey) {
        if (item.btn) {
          item.btn.classList.add('active');
          item.btn.setAttribute('aria-selected', 'true');
        }
        if (item.content) item.content.classList.add('active');
      } else {
        if (item.btn) {
          item.btn.classList.remove('active');
          item.btn.setAttribute('aria-selected', 'false');
        }
        if (item.content) item.content.classList.remove('active');
      }
    });
  }

  calibrateNeutralWithFeedback() {
    this.motion.saveCurrentAsNeutral();
    sounds.playTick(true);

    const showToast = (btn) => {
      if (!btn) return;
      const prev = btn.innerHTML;
      btn.innerHTML = '✅ Sıfırlandı!';
      btn.style.transform = 'scale(0.96)';
      setTimeout(() => {
        btn.innerHTML = prev;
        btn.style.transform = '';
      }, 1200);
    };

    showToast(this.btnHubSaveNeutral);
    showToast(this.btnQuickCalibrate);
    this.updateHealthBar();
  }

  handleTiltStateChange(state, deltaZ, degrees) {
    // 1. Tur Ekranı Rozeti
    this.updateTiltIndicator(state, deltaZ);

    // 2. Settings Hub - Canlı Ufuk Çizgisi Baloncuğu
    if (this.horizonBubble && this.modalSettingsHub && this.modalSettingsHub.classList.contains('active')) {
      const clampedDeg = Math.max(-45, Math.min(45, degrees));
      const percent = 50 + clampedDeg; // [-45, +45] aralığını %5-%95 bandına eşler
      this.horizonBubble.style.left = `${percent}%`;

      if (this.horizonAngleText) {
        this.horizonAngleText.textContent = `${degrees > 0 ? '+' : ''}${degrees}°`;
      }

      if (this.horizonZoneStatus) {
        if (this.motion.touchOnlyMode) {
          this.horizonZoneStatus.className = 'status-pill';
          this.horizonZoneStatus.style.background = 'rgba(255, 230, 0, 0.2)';
          this.horizonZoneStatus.style.color = '#FFE600';
          this.horizonZoneStatus.textContent = '🖐️ Dokunmatik Mod Aktif';
        } else if (state === 'CORRECT') {
          this.horizonZoneStatus.className = 'status-pill correct';
          this.horizonZoneStatus.textContent = '⬇️ DOĞRU! (Yeşil)';
        } else if (state === 'PASS') {
          this.horizonZoneStatus.className = 'status-pill pass';
          this.horizonZoneStatus.textContent = '⬆️ PAS! (Turuncu)';
        } else if (state === 'WAITING_RETURN') {
          this.horizonZoneStatus.className = 'status-pill waiting';
          this.horizonZoneStatus.textContent = '🔄 Dik Konuma Dön';
        } else {
          this.horizonZoneStatus.className = 'status-pill neutral';
          this.horizonZoneStatus.textContent = '🟢 Nötr / Dik Duruş';
        }
      }

      if (this.horizonSensorInfo) {
        const typeName = this.motion.sensorType === 'motion' ? 'İvmeölçer (Motion)' :
                         this.motion.sensorType === 'orientation' ? 'Jiroskop (Orientation)' : 'Sensör Bekleniyor...';
        this.horizonSensorInfo.textContent = `Sensör: ${typeName} | Açı: ${degrees > 0 ? '+' : ''}${degrees}° | Ham Z: ${this.motion.currentRawZ.toFixed(2)} | Nötr Z: ${this.motion.calibratedNeutralZ.toFixed(2)}`;
      }
    }

    // 3. Ana Sayfa Kompakt Durum Rozeti Güncellemesi
    const pillText = document.getElementById('pill-status-text');
    const pillDot = document.getElementById('pill-status-dot');
    if (pillText && pillDot) {
      if (this.motion.touchOnlyMode) {
        pillDot.className = 'pill-dot orange';
        pillText.textContent = '🖐️ Dokunmatik Mod';
      } else {
        pillDot.className = state === 'CORRECT' ? 'pill-dot green' : state === 'PASS' ? 'pill-dot orange' : 'pill-dot green';
        const stLabel = state === 'CORRECT' ? 'Doğru' : state === 'PASS' ? 'Pas' : 'Nötr';
        pillText.textContent = `📱 ${degrees > 0 ? '+' : ''}${degrees}° (${stLabel})`;
      }
    }
  }

  updateHealthBar() {
    const support = CameraRecorder.checkSupport();

    // Mini Durum Rozeti (Home Screen Pill)
    const pillDot = document.getElementById('pill-status-dot');
    const pillText = document.getElementById('pill-status-text');

    if (pillText && pillDot) {
      const camOk = this.camera.hasPermission;
      const secOk = support.isSecure;
      const degText = `${this.motion.currentDegrees > 0 ? '+' : ''}${this.motion.currentDegrees}°`;
      
      if (!secOk) {
        pillDot.className = 'pill-dot red';
        pillText.textContent = '⚠️ HTTP (Kamera Kilitli)';
      } else if (camOk) {
        pillDot.className = 'pill-dot green';
        pillText.textContent = `📱 ${degText} • 📹 Aktif`;
      } else {
        pillDot.className = 'pill-dot green';
        pillText.textContent = `📱 ${degText} • 🔒 Güvenli`;
      }
    }

    // Güvenlik Durumu (Sistem sekmesi)
    if (this.healthSecurityBadge) {
      const dot = this.healthSecurityBadge.querySelector('.dot');
      const label = this.healthSecurityBadge.querySelector('.label');
      if (support.isSecure) {
        if (dot) dot.className = 'dot green';
        if (label) label.textContent = '🔒 Bağlantı: Güvenli';
      } else {
        if (dot) dot.className = 'dot red';
        if (label) label.textContent = '⚠️ HTTP (Kamera Kilitli)';
      }
    }

    // Kamera Durumu
    if (this.healthCameraBadge) {
      const dot = this.healthCameraBadge.querySelector('.dot');
      const label = this.healthCameraBadge.querySelector('.label');
      if (this.camera.hasPermission) {
        if (dot) dot.className = 'dot green';
        if (label) label.textContent = `📹 Kamera: Aktif (${this.camera.facingMode === 'user' ? 'Ön' : 'Arka'})`;
      } else if (!support.isSecure) {
        if (dot) dot.className = 'dot red';
        if (label) label.textContent = '📹 Kamera: Kilitli (HTTP)';
      } else {
        if (dot) dot.className = 'dot orange';
        if (label) label.textContent = '📹 Kamera: Beklemede';
      }
    }
  }

  updateTiltIndicator(state, deltaZ = 0) {
    if (!this.roundTiltIndicator) return;

    if (state === 'CORRECT') {
      this.roundTiltIndicator.className = 'tilt-status-badge state-correct';
      this.roundTiltIndicator.textContent = '⬇️ DOĞRU!';
    } else if (state === 'PASS') {
      this.roundTiltIndicator.className = 'tilt-status-badge state-pass';
      this.roundTiltIndicator.textContent = '⬆️ PAS!';
    } else if (state === 'WAITING_RETURN') {
      this.roundTiltIndicator.className = 'tilt-status-badge state-waiting';
      this.roundTiltIndicator.textContent = '🔄 DÜZELT';
    } else {
      this.roundTiltIndicator.className = 'tilt-status-badge state-neutral';
      this.roundTiltIndicator.textContent = '🟢 DİK DUR';
    }
  }

  updateScoreDisplay() {
    this.roundScoreCorrect.textContent = `✅ ${this.score.correct.length}`;
    if (this.ruleMode === 'taboo' && this.score.taboo) {
      this.roundScorePass.textContent = `🚫 -${this.score.taboo.length} | ⏭️ ${this.score.passed.length}`;
    } else {
      this.roundScorePass.textContent = `⏭️ ${this.score.passed.length}`;
    }
  }

  async endRound() {
    clearInterval(this.timerInterval);
    try { this.stopCheerPolling(); } catch (e) {}
    try { this.broadcastSpectatorState('summary'); } catch (e) {}
    this.motion.stop();
    sounds.stopPartyBeat();
    sounds.playFinish();
    this.releaseWakeLock();
    this.triggerHaptic('finish');

    if (this.bombExplosionOverlay) {
      this.bombExplosionOverlay.classList.remove('active');
    }
    if (this.screens && this.screens.round) {
      this.screens.round.classList.remove('panic-pulse-active');
    }
    try { announcer.stop(); } catch (e) {}

    const tabooCount = (this.score.taboo && this.score.taboo.length) || 0;
    const netCorrect = Math.max(0, this.score.correct.length - tabooCount);

    // Skor ve profil geçmişini kaydet
    this.recordMatchResult(this.currentCategory.title, netCorrect, this.score.passed.length);

    // Takım modu puanı ekle (2X Çark çarpanı desteği)
    if (this.gameMode === 'teams') {
      const multiplier = this.roundScoreMultiplier || 1;
      this.teams[this.currentTeamIndex].score += (netCorrect * multiplier);
      this.roundScoreMultiplier = 1;
    }

    // Konfeti patlaması
    if (netCorrect >= 3) {
      confetti.celebrate();
    }

    let recordResult = null;
    if (this.cameraEnabled && this.camera.isRecording) {
      recordResult = await this.camera.stopRecording();
    }

    // Tur bittiğinde mikrofon ve kamera donanımını tamamen kapat (arka planda ses dinlemesin)
    if (this.camera) {
      try { this.camera.stopCamera(); } catch (e) {}
    }

    this.showSummaryScreen(recordResult, netCorrect, tabooCount);
  }

  showSummaryScreen(recordResult, netCorrect = null, tabooCount = 0) {
    this.showScreen('summary');

    const effectiveNet = netCorrect !== null ? netCorrect : (this.score.correct.length - ((this.score.taboo && this.score.taboo.length) || 0));

    this.summaryScoreCorrect.textContent = effectiveNet;
    this.summaryScorePassed.textContent = this.score.passed.length;

    // Spiker Tur Sonu Yorumu
    if (this.ruleMode === 'bomb') {
      announcer.speak(`Bomba turu bitti! Toplam ${this.score.correct.length} kelime bilindi!`);
    } else if (this.ruleMode === 'taboo') {
      announcer.speak(`Tabu turu bitti! ${this.score.correct.length} doğru, ${tabooCount} tabu cezası, net ${effectiveNet} puan!`);
    } else if (this.score.correct.length >= 7) {
      announcer.speak(`Müthiş tur! Tam ${this.score.correct.length} doğru! Fişek gibisin!`);
    } else if (this.score.correct.length >= 3) {
      announcer.speak(`Güzel oyun! ${this.score.correct.length} doğru bildiniz.`);
    } else {
      announcer.speak(`Bir dahaki sefere daha iyi olacak! Hadi tekrar!`);
    }

    // Takım modu skor tablosu
    if (this.gameMode === 'teams') {
      const activeTeam = this.teams[this.currentTeamIndex];
      this.summaryTeamNotice.style.display = 'block';
      this.summaryTeamNotice.innerHTML = `
        <span style="color:${activeTeam.color}; font-weight:800;">${activeTeam.name}</span> bu turda <strong>+${effectiveNet}</strong> net puan kazandı!
      `;

      this.summaryTeamScoreboard.style.display = 'flex';
      this.summaryTeamScoreboard.innerHTML = this.teams.map(t => `
        <div class="team-score-badge" style="border-color:${t.color};">
          <div class="team-name">${t.name}</div>
          <div class="team-pts" style="color:${t.color};">${t.score} Puan</div>
        </div>
      `).join('<div class="scoreboard-vs">VS</div>');

      if (this.currentRoundNumber >= this.totalRounds) {
        this.btnPlayAgain.textContent = '🏆 Maç Sonucunu Gör';
      } else {
        const nextTeam = this.teams[(this.currentTeamIndex + 1) % this.teams.length];
        if (this.isFortuneWheelMatch) {
          const nextSel = this.teamFortuneSelections && this.teamFortuneSelections[(this.currentTeamIndex + 1) % this.teams.length];
          if (nextSel) {
            const catName = nextSel.category.title || nextSel.category.name || 'Kategori';
            const durText = (nextSel.modifier && nextSel.modifier.text) || 'Standart';
            this.btnPlayAgain.textContent = `👉 Sıradaki: ${nextTeam.name} Sahaya! (${catName} - ${durText})`;
          } else {
            this.btnPlayAgain.textContent = `🎡 Sıradaki: ${nextTeam.name} Sahaya!`;
          }
        } else {
          this.btnPlayAgain.textContent = `👉 Sıradaki Tur (${nextTeam.name})`;
        }
      }
    } else {
      this.summaryTeamNotice.style.display = 'none';
      this.summaryTeamScoreboard.style.display = 'none';
      this.btnPlayAgain.textContent = '🔄 Tekrar Oyna';
    }

    // Kelime listesi
    this.summaryList.innerHTML = '';
    this.score.correct.forEach(word => {
      const li = document.createElement('div');
      li.className = 'summary-word-badge badge-correct';
      li.innerHTML = `<span>✅</span> <strong>${word}</strong>`;
      this.summaryList.appendChild(li);
    });

    if (this.score.taboo) {
      this.score.taboo.forEach(word => {
        const li = document.createElement('div');
        li.className = 'summary-word-badge badge-taboo';
        li.style.background = 'rgba(239, 68, 68, 0.18)';
        li.style.border = '1px solid rgba(239, 68, 68, 0.45)';
        li.innerHTML = `<span>🚫</span> <span style="color:#FF3B30;">TABU (-1): <strong>${word}</strong></span>`;
        this.summaryList.appendChild(li);
      });
    }

    this.score.passed.forEach(word => {
      const li = document.createElement('div');
      li.className = 'summary-word-badge badge-pass';
      li.innerHTML = `<span>⏭️</span> <span>${word}</span>`;
      this.summaryList.appendChild(li);
    });

    if (this.score.correct.length === 0 && this.score.passed.length === 0 && (!this.score.taboo || this.score.taboo.length === 0)) {
      this.summaryList.innerHTML = '<p class="text-muted">Bu turda kelime oynanmadı.</p>';
    }

    // Video oynatıcı
    if (recordResult && recordResult.url) {
      this.summaryVideoSection.style.display = 'block';
      this.summaryVideo.src = recordResult.url;
      try { this.summaryVideo.load(); } catch (e) {}
      this.setVideoPlaybackRate(1.5);
      this.summaryVideo.play().catch(e => console.log('Video autoplay:', e));
    } else {
      this.summaryVideoSection.style.display = 'none';
      this.summaryVideo.removeAttribute('src');
    }
  }

  async handleNextRoundOrRematch() {
    if (this.gameMode === 'teams') {
      if (this.currentRoundNumber >= this.totalRounds) {
        this.isFortuneWheelMatch = false;
        this.showMatchWinnerScreen();
        return;
      }
      this.currentRoundNumber++;
      this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;

      if (this.isFortuneWheelMatch) {
        this.stopSummaryVideo();
        const sel = this.teamFortuneSelections && this.teamFortuneSelections[this.currentTeamIndex];
        if (sel) {
          this.currentCategory = sel.category;
          const mod = sel.modifier || { duration: 60, multiplier: 1, rule: 'classic' };
          this.fortuneWheelOverrideDuration = mod.duration || 60;
          this.roundScoreMultiplier = mod.multiplier || 1;
          this.ruleMode = mod.rule || 'classic';
          if (this.cameraEnabled) {
            await this.camera.initCamera(this.cameraPip).catch(() => {});
          }
          this.startCountdown();
          return;
        } else {
          this.showScreen('home');
          this.openTeamFortuneWheel();
          return;
        }
      }
    }
    if (this.cameraEnabled) {
      await this.camera.initCamera(this.cameraPip).catch(() => {});
    }
    this.startCountdown();
  }

  showMatchWinnerScreen() {
    this.isFortuneWheelMatch = false;
    this.showScreen('matchWinner');
    confetti.celebrate();
    setTimeout(() => confetti.celebrate(), 700);

    const sorted = [...this.teams].sort((a, b) => b.score - a.score);
    const topTeam = sorted[0];
    const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score;

    this.recordTeamMatchHistory(sorted, isTie);

    if (isTie) {
      this.winnerTeamTitle.textContent = '🤝 DOSTLUK KAZANDI! BERABERE!';
      this.winnerTeamTitle.style.color = '#FFE600';
    } else {
      this.winnerTeamTitle.textContent = `👑 ${topTeam.name} ŞAMPİYON! 🎉`;
      this.winnerTeamTitle.style.color = topTeam.color;
    }

    const rankEmojis = ['🥇 1.', '🥈 2.', '🥉 3.', '4.'];
    this.winnerFinalScores.innerHTML = sorted.map((t, idx) => `
      <div class="winner-score-card" style="border: 2px solid ${t.color};">
        <div class="team-rank" style="font-size:0.85rem; font-weight:800; color:#A78BFA; margin-bottom:4px;">${rankEmojis[idx] || (idx + 1) + '.'} SIRA</div>
        <div class="team-name" style="font-weight:800;">${t.name}</div>
        <div class="team-score-num" style="color:${t.color}; font-size:2.2rem; font-weight:900;">${t.score}</div>
      </div>
    `).join('');
  }

  resetMatchAndPlay() {
    this.teams.forEach(t => t.score = 0);
    this.currentRoundNumber = 1;
    this.currentTeamIndex = 0;
    this.startCountdown();
  }

  // =========================================
  // CANLI SEYİRCİ & İKİNCİ EKRAN (QR ODASI)
  // =========================================
  async fetchServerInfo() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 600);
      const res = await fetch('/api/system/info', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const info = await res.json();
        if (info && info.localIp && info.localIp !== 'localhost') {
          this.serverInfo = info;
          localStorage.setItem('kafanatak_last_server_ip', info.localIp);
        }
      }
    } catch (e) {
      const savedIp = localStorage.getItem('kafanatak_last_server_ip');
      if (savedIp) {
        this.serverInfo = { localIp: savedIp, httpPort: 3000, httpsPort: 3443 };
      }
    }
  }

  getSpectatorUrl() {
    if (firebaseNetwork.getNetworkMode() === 'firebase') {
      return firebaseNetwork.getSpectatorUrl(this.spectatorRoomId);
    }
    const savedIp = localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159';
    let hostIp = (this.serverInfo && this.serverInfo.localIp && this.serverInfo.localIp !== 'localhost')
      ? this.serverInfo.localIp
      : savedIp;
    const port = (this.serverInfo && this.serverInfo.httpPort) ? this.serverInfo.httpPort : 3000;
    return `http://${hostIp}:${port}/spectator.html?room=${encodeURIComponent(this.spectatorRoomId)}`;
  }

  async openSpectatorModal() {
    // 1. Modalı anında aç (asla bekletme)
    if (this.modalSpectatorQr) {
      this.modalSpectatorQr.classList.add('active');
    }

    const currentIp = (this.serverInfo && this.serverInfo.localIp && this.serverInfo.localIp !== 'localhost')
      ? this.serverInfo.localIp
      : (localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159');

    if (this.inputSpectatorIp) {
      this.inputSpectatorIp.value = currentIp;
    }

    // 2. İlk QR çizimini mevcut modla (Bulut/Firebase) anında yap
    await this.renderSpectatorQR();

    // 3. Arka planda sunucu IP bilgisini yokla
    this.fetchServerInfo().then(() => {
      if (this.inputSpectatorIp && this.serverInfo && this.serverInfo.localIp && this.serverInfo.localIp !== 'localhost') {
        this.inputSpectatorIp.value = this.serverInfo.localIp;
      }
      this.renderSpectatorQR();
    });
  }

  async renderSpectatorQR() {
    if (!this.qrSpectatorCanvas) return;
    const url = this.getSpectatorUrl();
    if (this.specQrRoomCode) this.specQrRoomCode.textContent = this.spectatorRoomId;
    if (this.specQrLinkText) this.specQrLinkText.textContent = url;
    try {
      await QRCode.toCanvas(this.qrSpectatorCanvas, url, {
        width: 220,
        margin: 1,
        color: { dark: '#0B0E14', light: '#FFFFFF' }
      });
    } catch (err) {
      console.warn('QR kod üretilemedi:', err);
    }
  }

  broadcastSpectatorState(overrideState = null) {
    const activeTeamObj = this.teams[this.currentTeamIndex];
    const payload = {
      roomId: this.spectatorRoomId,
      state: overrideState || (this.screens.round.classList.contains('active') ? 'playing' : (this.screens.countdown.classList.contains('active') ? 'countdown' : 'summary')),
      category: this.currentCategory ? this.currentCategory.title : '',
      word: this.getCurrentWordText(),
      taboo: (this.currentWordItem && typeof this.currentWordItem === 'object' && this.currentWordItem.taboo) ? this.currentWordItem.taboo : [],
      timeLeft: this.remainingTime,
      scoreCorrect: this.score.correct.length,
      scorePass: this.score.passed.length,
      activeTeam: (this.gameMode === 'teams' && activeTeamObj) ? activeTeamObj.name : 'Tekli Mod',
      activeTeamColor: (this.gameMode === 'teams' && activeTeamObj) ? activeTeamObj.color : '#7928CA',
      ruleMode: this.ruleMode
    };

    // 1. BroadcastChannel (Aynı sekme/cihaz)
    try {
      if (!this.spectatorBroadcast) {
        this.spectatorBroadcast = new BroadcastChannel('kafanatak_spectator_' + this.spectatorRoomId);
      }
      this.spectatorBroadcast.postMessage(payload);
    } catch (e) {}

    // 2. Firebase Bulut Odayı Güncelle (Tüm internetten anlık erişim)
    firebaseNetwork.updateRoom('spectator', this.spectatorRoomId, payload);

    // 3. HTTP POST to server.js (Yerel Sunucu)
    try {
      fetch('/api/room/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  startCheerPolling() {
    this.stopCheerPolling();

    // 1. Firebase Bulut Dinleyicisi (SSE / Realtime Tezahürat & Zil)
    this.fbCheerCleanup = firebaseNetwork.listenRoom('spectator', this.spectatorRoomId, (roomData) => {
      if (roomData && roomData.actions) {
        const actList = Array.isArray(roomData.actions) ? roomData.actions : Object.values(roomData.actions);
        const now = Date.now();
        actList.forEach(a => {
          if (a.timestamp && (now - a.timestamp) < 4000 && (!this.processedCheerIds || !this.processedCheerIds.has(a.id || a.timestamp))) {
            if (!this.processedCheerIds) this.processedCheerIds = new Set();
            this.processedCheerIds.add(a.id || a.timestamp);
            if (a.cheer === 'buzzer') {
              this.triggerBuzzerAlert(a.sender || 'İkinci Telefon (Zil)');
            } else {
              sounds.playCheerSound(a.cheer);
              const emoji = a.cheer === 'horn' ? '🎺 Vuvuzela!' : (a.cheer === 'bell' ? '🔔 Çan!' : (a.cheer === 'boo' ? '😱 Abooov!' : '👏 Alkış!'));
              this.showToast(`📣 Seyirci: ${emoji}`);
            }
          }
        });
      }
    });

    // 2. Yerel Sunucu Yoklaması
    this.cheerPollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/room/drain-cheers?room=${encodeURIComponent(this.spectatorRoomId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.cheers && data.cheers.length > 0) {
            data.cheers.forEach(c => {
              if (c.cheer === 'buzzer') {
                this.triggerBuzzerAlert(c.sender || 'İkinci Telefon (Zil)');
              } else {
                sounds.playCheerSound(c.cheer);
                const emoji = c.cheer === 'horn' ? '🎺 Vuvuzela!' : (c.cheer === 'bell' ? '🔔 Çan!' : (c.cheer === 'boo' ? '😱 Abooov!' : '👏 Alkış!'));
                this.showToast(`📣 Seyirci: ${emoji}`);
              }
            });
          }
        }
      } catch (e) {}
    }, 1200);
  }

  stopCheerPolling() {
    if (this.fbCheerCleanup) {
      try { this.fbCheerCleanup(); } catch(e) {}
      this.fbCheerCleanup = null;
    }
    if (this.cheerPollTimer) {
      clearInterval(this.cheerPollTimer);
      this.cheerPollTimer = null;
    }
  }

  // =========================================
  // ÖZEL DESTE PAYLAŞIM & TARAMA (QR SİSTEMİ)
  // =========================================
  async openDeckShareQR(cat) {
    if (!cat) return;
    if (this.shareDeckIcon) this.shareDeckIcon.textContent = cat.icon || '🎁';
    if (this.shareDeckTitle) this.shareDeckTitle.textContent = `${cat.title} Paylaş`;
    if (this.shareDeckWordCount) this.shareDeckWordCount.textContent = `${cat.words.length} Kelime`;

    const payload = JSON.stringify({
      app: 'kafanatak',
      type: 'deck',
      v: 1,
      title: cat.title,
      icon: cat.icon || '✨',
      words: cat.words.slice(0, 60),
      isCustom: true
    });

    try {
      await QRCode.toCanvas(this.qrDeckShareCanvas, payload, {
        width: 220,
        margin: 1,
        color: { dark: '#0B0E14', light: '#FFFFFF' }
      });
      if (this.modalDeckQrShare) {
        this.modalDeckQrShare.classList.add('active');
      }
    } catch (err) {
      alert('QR kod oluşturulamadı: ' + err.message);
    }
  }

  async startQrCamera() {
    try {
      this.stopQrCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.qrScannerStream = stream;
      if (this.qrScanVideo) {
        this.qrScanVideo.srcObject = stream;
        await this.qrScanVideo.play().catch(() => {});
      }
      if (this.qrScanPlaceholder) this.qrScanPlaceholder.style.display = 'none';

      let barcodeDetector = null;
      if ('BarcodeDetector' in window) {
        try {
          barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
        } catch (e) {}
      }

      this.qrScanInterval = setInterval(async () => {
        if (!this.qrScanVideo || this.qrScanVideo.readyState < 2) return;

        let detectedRaw = null;

        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(this.qrScanVideo);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              detectedRaw = barcodes[0].rawValue;
            }
          } catch (e) {}
        }

        if (!detectedRaw && jsQR && this.qrScanCanvas) {
          try {
            const w = this.qrScanVideo.videoWidth || 320;
            const h = this.qrScanVideo.videoHeight || 240;
            this.qrScanCanvas.width = w;
            this.qrScanCanvas.height = h;
            const ctx = this.qrScanCanvas.getContext('2d');
            ctx.drawImage(this.qrScanVideo, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const code = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });
            if (code && code.data) {
              detectedRaw = code.data;
            }
          } catch (e) {}
        }

        if (detectedRaw) {
          this.handleScannedQrPayload(detectedRaw);
        }
      }, 350);
    } catch (err) {
      console.warn('QR kamera açılamadı:', err);
      if (this.qrScanPlaceholder) {
        this.qrScanPlaceholder.style.display = 'flex';
      }
    }
  }

  stopQrCamera() {
    if (this.qrScanInterval) {
      clearInterval(this.qrScanInterval);
      this.qrScanInterval = null;
    }
    if (this.qrScannerStream) {
      this.qrScannerStream.getTracks().forEach(t => t.stop());
      this.qrScannerStream = null;
    }
    if (this.qrScanVideo) {
      this.qrScanVideo.srcObject = null;
    }
    if (this.qrScanPlaceholder) {
      this.qrScanPlaceholder.style.display = 'flex';
    }
  }

  handleScannedQrPayload(raw) {
    try {
      let data = null;
      if (typeof raw === 'string' && raw.trim().startsWith('{')) {
        data = JSON.parse(raw);
      }
      if (data && data.app === 'kafanatak' && Array.isArray(data.words) && data.words.length > 0) {
        sounds.playCorrect();
        this.stopQrCamera();
        this.scannedDeckPending = {
          id: 'custom-' + Date.now(),
          title: data.title || 'İçe Aktarılan Deste',
          icon: data.icon || '✨',
          description: `${data.words.length} kelimelik QR ile paylaşılan deste.`,
          words: data.words,
          gradient: 'linear-gradient(135deg, #00F5D4 0%, #7928CA 100%)',
          isCustom: true
        };

        if (this.scannedDeckIcon) this.scannedDeckIcon.textContent = this.scannedDeckPending.icon;
        if (this.scannedDeckTitle) this.scannedDeckTitle.textContent = this.scannedDeckPending.title;
        if (this.scannedDeckCount) this.scannedDeckCount.textContent = `${this.scannedDeckPending.words.length} Kelime`;
        if (this.scannedWordsPreview) {
          this.scannedWordsPreview.innerHTML = this.scannedDeckPending.words.slice(0, 15).map(w => {
            const txt = typeof w === 'object' ? w.word : w;
            return `<span class="scanned-word-chip">${txt}</span>`;
          }).join('') + (this.scannedDeckPending.words.length > 15 ? `<span class="scanned-word-chip">+${this.scannedDeckPending.words.length - 15} daha</span>` : '');
        }

        if (this.qrDetectedDeckCard) {
          this.qrDetectedDeckCard.style.display = 'block';
        }
        this.showToast('🎉 Deste QR Kodu başarıyla okundu!');
      }
    } catch (e) {}
  }

  handleQrImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        if (jsQR) {
          const code = jsQR(imgData.data, img.width, img.height);
          if (code && code.data) {
            this.handleScannedQrPayload(code.data);
            return;
          }
        }
        alert('Görselde geçerli bir Kafana Tak deste QR kodu bulunamadı.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // =========================================
  // ÇOKLU TAKIM (2, 3 VEYA 4 TAKIM TURNUVASI)
  // =========================================
  setupTeams(count) {
    this.teamCount = parseInt(count, 10) || 2;
    const baseTeams = [
      { id: 'team-a', name: this.inputTeamAName ? this.inputTeamAName.value.trim() : '🔴 Kırmızı Takım', score: 0, color: '#FF416C' },
      { id: 'team-b', name: this.inputTeamBName ? this.inputTeamBName.value.trim() : '🔵 Mavi Takım', score: 0, color: '#0072FF' },
      { id: 'team-c', name: this.inputTeamCName ? this.inputTeamCName.value.trim() : '🟡 Sarı Fırtınalar', score: 0, color: '#FBBF24' },
      { id: 'team-d', name: this.inputTeamDName ? this.inputTeamDName.value.trim() : '🟢 Yeşil Devler', score: 0, color: '#10B981' }
    ];
    this.teams = baseTeams.slice(0, this.teamCount);
    if (this.teamCGroup) this.teamCGroup.style.display = this.teamCount >= 3 ? 'block' : 'none';
    if (this.teamDGroup) this.teamDGroup.style.display = this.teamCount >= 4 ? 'block' : 'none';
  }

  setVideoPlaybackRate(speed) {
    if (!this.summaryVideo) return;
    this.summaryVideo.playbackRate = speed;
    [this.btnVideoSpeed1, this.btnVideoSpeed15, this.btnVideoSpeed2].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (speed === 1 && this.btnVideoSpeed1) this.btnVideoSpeed1.classList.add('active');
    if (speed === 1.5 && this.btnVideoSpeed15) this.btnVideoSpeed15.classList.add('active');
    if (speed === 2 && this.btnVideoSpeed2) this.btnVideoSpeed2.classList.add('active');
  }

  // =========================================
  // HAPTİK TİTREŞİM VE WAKELOCK MOTORU
  // =========================================
  triggerHaptic(type) {
    if (!this.hapticsEnabled || !('vibrate' in navigator)) return;
    try {
      switch (type) {
        case 'correct':
          navigator.vibrate([60, 40, 100]); // Neşeli çift vuruş
          break;
        case 'pass':
          navigator.vibrate(140); // Tok tek vuruş
          break;
        case 'tick':
          navigator.vibrate(35); // Kalp atışı nabız tik'i
          break;
        case 'start':
          navigator.vibrate([100, 50, 150]); // Tur başlangıcı
          break;
        case 'finish':
          navigator.vibrate([120, 80, 200, 100, 300]); // Tur bitişi
          break;
      }
    } catch (e) {
      console.warn('Haptik titreşim hatası:', e);
    }
  }

  async requestWakeLock() {
    if (!this.wakeLockEnabled || !('wakeLock' in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
    } catch (err) {
      console.warn('WakeLock talebi:', err);
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch (e) {}
      this.wakeLock = null;
    }
  }

  // =========================================
  // OYUNCU PROFİLİ & İSTATİSTİK YÖNETİMİ
  // =========================================
  loadProfile() {
    try {
      const saved = localStorage.getItem(this.profileStorageKey);
      if (saved) {
        this.profile = { ...this.profile, ...JSON.parse(saved) };
      }
      if (typeof this.profile.totalGames !== 'number') this.profile.totalGames = 0;
      if (typeof this.profile.totalCorrect !== 'number') this.profile.totalCorrect = 0;
      if (typeof this.profile.highScore !== 'number') this.profile.highScore = 0;
      if (typeof this.profile.teamWins !== 'number') this.profile.teamWins = 0;

      const savedHist = localStorage.getItem(this.historyStorageKey);
      if (savedHist) {
        this.matchHistory = JSON.parse(savedHist);
      }
    } catch (e) {
      console.warn('Profil yüklenemedi:', e);
    }
    this.updateProfileUI();
  }

  saveProfile() {
    if (this.inputProfileName) {
      this.profile.name = this.inputProfileName.value.trim() || 'Parti Canavarı';
    }
    try {
      localStorage.setItem(this.profileStorageKey, JSON.stringify(this.profile));
    } catch (e) {}
    this.updateProfileUI();
  }

  showToast(message, duration = 3000) {
    let toast = document.getElementById('app-party-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-party-toast';
      toast.className = 'party-toast-floating';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

  updateProfileUI() {
    if (this.headerAvatarBadge) this.headerAvatarBadge.textContent = this.profile.avatar;
    if (this.headerProfileName) this.headerProfileName.textContent = this.profile.name;
    if (this.profileCurrentAvatar) this.profileCurrentAvatar.textContent = this.profile.avatar;
    if (this.inputProfileName) this.inputProfileName.value = this.profile.name;

    if (this.statTotalGames) this.statTotalGames.textContent = this.profile.totalGames;
    if (this.statTotalCorrect) this.statTotalCorrect.textContent = this.profile.totalCorrect;
    if (this.statHighScore) this.statHighScore.textContent = this.profile.highScore;
    if (this.statTeamWins) this.statTeamWins.textContent = this.profile.teamWins;

    if (this.avatarGridPicker) {
      this.avatarGridPicker.querySelectorAll('.avatar-opt-btn').forEach(btn => {
        if (btn.dataset.avatar === this.profile.avatar) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    this.renderMatchHistoryList();
  }

  recordMatchResult(categoryTitle, correctCount, passedCount) {
    this.profile.totalGames++;
    this.profile.totalCorrect += correctCount;
    let isNewRecord = false;
    if (correctCount > this.profile.highScore) {
      this.profile.highScore = correctCount;
      isNewRecord = true;
    }

    if (isNewRecord && correctCount > 0) {
      this.showToast('🏆 YENİ REKOR! Tebrikler!');
    }

    const matchItem = {
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      category: categoryTitle,
      correct: correctCount,
      passed: passedCount,
      mode: this.gameMode === 'teams' ? 'Takım' : 'Tekli'
    };

    this.matchHistory.unshift(matchItem);
    if (this.matchHistory.length > 10) this.matchHistory.pop();

    try {
      localStorage.setItem(this.profileStorageKey, JSON.stringify(this.profile));
      localStorage.setItem(this.historyStorageKey, JSON.stringify(this.matchHistory));
    } catch (e) {}

    this.updateProfileUI();
  }

  renderMatchHistoryList() {
    if (!this.profileHistoryList) return;
    if (!this.matchHistory || this.matchHistory.length === 0) {
      this.profileHistoryList.innerHTML = '<p class="text-muted" style="text-align:center; padding:12px; font-size:0.85rem;">Henüz tamamlanan maç bulunmuyor.</p>';
      return;
    }

    this.profileHistoryList.innerHTML = this.matchHistory.map(m => `
      <div class="history-item">
        <div>
          <span class="cat-name">${m.category}</span>
          <span style="font-size:0.75rem; color:var(--text-dim); margin-left:6px;">(${m.mode}) • ${m.date}</span>
        </div>
        <div class="pts">+${m.correct} Doğru ${m.passed > 0 ? `<span style="color:var(--text-dim); font-size:0.75rem;">(${m.passed} Pas)</span>` : ''}</div>
      </div>
    `).join('');
  }

  resetProfileStats() {
    this.profile.totalGames = 0;
    this.profile.totalCorrect = 0;
    this.profile.highScore = 0;
    this.profile.teamWins = 0;
    this.matchHistory = [];
    try {
      localStorage.setItem(this.profileStorageKey, JSON.stringify(this.profile));
      localStorage.removeItem(this.historyStorageKey);
    } catch (e) {}
    this.updateProfileUI();
    this.showToast('✅ Tüm istatistikler ve maç geçmişi sıfırlandı.');
  }

  openProfileModal() {
    if (this.modalProfile) {
      this.updateProfileUI();
      this.modalProfile.classList.add('active');
    }
  }

  closeProfileModal() {
    if (this.modalProfile) {
      this.modalProfile.classList.remove('active');
    }
  }

  // =========================================
  // AI DESTE SİHİRBAZI (GEMINI + OLLAMA)
  // =========================================
  async handleGenerateAiDeck(theme, count, isTaboo, apiKey) {
    if (this.aiLoader) this.aiLoader.style.display = 'flex';
    if (this.btnSubmitAiDeck) this.btnSubmitAiDeck.disabled = true;
    if (this.aiLoaderStatus) this.aiLoaderStatus.textContent = `🪄 Gemini "${theme}" için kartları tasarlıyor...`;

    try {
      const prompt = `Sen "Kafana Tak!" (Guess Up & Tabu) mobil parti oyunu için uzman bir Türkçe oyun yazarısın.
Kullanıcı teması: "${theme}"
Bu temaya özel, arkadaş ortamında oynarken çok eğlendirecek, kahkaha attıracak, anlaşılması kolay ve popüler ${count} adet kelime üret.
${isTaboo ? 'ÖNEMLİ: Her kelime için anlatırken söylenmesi YASAK 3-4 adet zorlayıcı ve komik kelime belirle. Format örneği: [{"word": "Recep İvedik", "taboo": ["Böhöhöyt", "Turuncu", "Güngören"]}]' : 'Format örneği: ["Kelime 1", "Kelime 2", "Kelime 3"]'}

SADECE geçerli bir JSON array döndür. Başka hiçbir açıklama veya markdown backtick (\`\`\`json) ekleme.`;

      let cards = null;

      // 1. Google Gemini Flash Doğrudan İstem (İnternet / APK üzerinden)
      if (apiKey) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.85,
                responseMimeType: 'application/json'
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
              cards = JSON.parse(clean);
            }
          } else {
            const err = await res.json().catch(() => ({}));
            console.warn('Gemini doğrudan istek hatası:', err);
          }
        } catch (e) {
          console.warn('Gemini fetch hatası:', e);
        }
      }

      // 2. Eğer key yoksa veya doğrudan istek başarısız olduysa sunucu üzerinden dene
      if (!cards) {
        try {
          const sRes = await fetch('/api/generate-deck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, count, isTaboo, apiKey })
          });
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData.cards && Array.isArray(sData.cards)) {
              cards = sData.cards;
            }
          }
        } catch (sErr) {}
      }

      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        throw new Error('Yapay zeka kartları üretemedi. Lütfen geçerli bir ücretsiz Gemini API Anahtarı girin (aistudio.google.com/app/apikey).');
      }

      // Yeni Deste Objesi
      const gradients = [
        'linear-gradient(135deg, #FF2E93, #FF8E53)',
        'linear-gradient(135deg, #7928CA, #4A00E0)',
        'linear-gradient(135deg, #00F5D4, #0072FF)',
        'linear-gradient(135deg, #FF416C, #8A2387)',
        'linear-gradient(135deg, #F9D423, #FF4E50)'
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const newCategory = {
        id: 'ai-' + Date.now(),
        title: theme.replace(/[🎬💻💍🍔🚗✨]/g, '').trim(),
        description: `Yapay zeka (Gemini) tarafından üretilen özel ${theme} destesi.`,
        icon: isTaboo ? '🚫' : '🪄',
        gradient: randomGradient,
        isTaboo: isTaboo,
        words: cards
      };

      this.saveCustomDeck(newCategory);
      sounds.playFinish();
      confetti.celebrate();

      if (this.modalCustom) this.modalCustom.classList.remove('active');
      if (this.inputAiTheme) this.inputAiTheme.value = '';

      alert(`🎉 "${newCategory.title}" destesi ${cards.length} kart ile başarıyla oluşturuldu ve ana sayfaya eklendi!`);
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      if (this.aiLoader) this.aiLoader.style.display = 'none';
      if (this.btnSubmitAiDeck) this.btnSubmitAiDeck.disabled = false;
    }
  }

  // =========================================
  // BOMBA MODU & PARTİ KURAL MODLARI
  // =========================================
  triggerBombExplosion() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    sounds.stopPartyBeat();
    sounds.playExplosion();
    this.triggerHaptic('finish');
    announcer.speak('BUM! Bomba patladı! Telefon kimin elindeyse yandı!');

    if (this.bombExplosionOverlay) {
      this.bombExplosionOverlay.classList.add('active');
    }

    setTimeout(() => {
      if (this.bombExplosionOverlay) {
        this.bombExplosionOverlay.classList.remove('active');
      }
      this.endRound();
    }, 2500);
  }

  updateRuleModeUI() {
    if (this.ruleChips) {
      this.ruleChips.forEach(chip => {
        if (chip.dataset.rule === this.ruleMode) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }
    this.updateRuleModeDesc();
  }

  updateRuleModeDesc() {
    if (!this.ruleModeDesc) return;
    switch (this.ruleMode) {
      case 'bomb':
        this.ruleModeDesc.textContent = '💣 Bomba Modu: Telefon elden ele dolaşır! Doğru bil ve hemen pasla. Süre rastgele bittiğinde bomba patlar!';
        break;
      case 'mime':
        this.ruleModeDesc.textContent = '🤐 Sessiz Sinema: Konuşmak ve ses çıkarmak kesinlikle yasak! Sadece jest ve mimiklerle anlat.';
        break;
      case 'letter':
        this.ruleModeDesc.textContent = '🔤 Yasak Harf: Tur başında rastgele bir harf kilitlenir. O harfi içeren kelime kullanan ceza alır!';
        break;
      case 'taboo':
        this.ruleModeDesc.textContent = '🚫 Klasik Tabu: Asıl kelimeyi anlatırken 4 yasaklı kelimeyi söyleme! Söylersen TABU (-1) cezası alırsın!';
        break;
      case 'classic':
      default:
        this.ruleModeDesc.textContent = '🌟 Klasik Mod: Alnına koy veya dikey tut, doğru bilince DOĞRU, pas için PAS bas!';
        break;
    }
  }

  // =========================================================================
  // İKİNCİ TELEFON ZİL (BUZZER) & SEYİRCİ DİNLEYİCİSİ
  // =========================================================================
  initSpectatorChannel() {
    try {
      if (!this.spectatorBroadcast) {
        this.spectatorBroadcast = new BroadcastChannel('kafanatak_spectator_' + this.spectatorRoomId);
        this.spectatorBroadcast.onmessage = (ev) => {
          if (ev && ev.data) {
            if (ev.data.cheer === 'buzzer' || ev.data.action === 'buzzer') {
              this.triggerBuzzerAlert(ev.data.sender || 'İkinci Telefon (Zil)');
            } else if (ev.data.cheer) {
              sounds.playCheerSound(ev.data.cheer);
              this.showToast(`📣 Seyirci: ${ev.data.cheer}`);
            }
          }
        };
      }
    } catch (e) {}
  }

  triggerBuzzerAlert(sender = 'İkinci Telefon') {
    // 1. Ses & Haptik
    sounds.playBuzzer();
    this.triggerHaptic('finish');

    // 2. HUD Banner & Görsel Şok
    if (this.buzzerAlertOverlay) {
      this.buzzerAlertOverlay.classList.add('active');
      if (this.buzzerSenderName) {
        this.buzzerSenderName.textContent = `${sender} Zile Bastı!`;
      }
      if (this.buzzerAlertTimer) clearTimeout(this.buzzerAlertTimer);
      this.buzzerAlertTimer = setTimeout(() => {
        if (this.buzzerAlertOverlay) {
          this.buzzerAlertOverlay.classList.remove('active');
        }
      }, 2400);
    }

    // 3. Tabu Modunda Otomatik Ceza / Hata İşlemi
    if (this.screens.round.classList.contains('active') && this.remainingTime > 0) {
      if (this.ruleMode === 'taboo') {
        this.handleAction('taboo');
      } else {
        this.showToast(`🚨 ${sender} Zile Bastı! (İtiraz / Hata)`);
      }
    } else {
      this.showToast(`🚨 ${sender} Zile Bastı!`);
    }
  }

  // =========================================================================
  // TAKIM SKOR PANOSU (HEAD-TO-HEAD MATCH STATS & SCOREBOARD)
  // =========================================================================
  recordTeamMatchHistory(sortedTeams, isTie) {
    try {
      const historyKey = 'kafanatak_team_history';
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const matchRecord = {
        id: 'match_' + Date.now(),
        date: dateStr,
        timestamp: Date.now(),
        isTie: !!isTie,
        winner: isTie ? 'Berabere' : sortedTeams[0].name,
        teams: sortedTeams.map(t => ({
          name: t.name,
          score: t.score,
          color: t.color
        }))
      };

      existing.unshift(matchRecord);
      if (existing.length > 30) existing.length = 30; // Son 30 karşılaşma
      localStorage.setItem(historyKey, JSON.stringify(existing));
    } catch (e) {
      console.warn('Takım maç geçmişi kaydedilemedi:', e);
    }
  }

  openTeamScoreboardModal() {
    sounds.playClick();
    this.renderTeamScoreboard();
    if (this.modalTeamScoreboard) {
      this.modalTeamScoreboard.classList.add('active');
    }
  }

  closeTeamScoreboardModal() {
    sounds.playClick();
    if (this.modalTeamScoreboard) {
      this.modalTeamScoreboard.classList.remove('active');
    }
  }

  renderTeamScoreboard() {
    try {
      const historyKey = 'kafanatak_team_history';
      const matches = JSON.parse(localStorage.getItem(historyKey) || '[]');

      // Takım bazında istatistikleri topla
      const teamStats = {};

      matches.forEach(m => {
        if (!m.teams || !Array.isArray(m.teams)) return;
        m.teams.forEach(t => {
          if (!teamStats[t.name]) {
            teamStats[t.name] = {
              name: t.name,
              color: t.color || '#FF2E93',
              matches: 0,
              wins: 0,
              losses: 0,
              ties: 0,
              totalPoints: 0
            };
          }
          teamStats[t.name].matches++;
          teamStats[t.name].totalPoints += (t.score || 0);
          if (m.isTie) {
            teamStats[t.name].ties++;
          } else if (t.name === m.winner) {
            teamStats[t.name].wins++;
          } else {
            teamStats[t.name].losses++;
          }
        });
      });

      const sortedStats = Object.values(teamStats).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.totalPoints - a.totalPoints;
      });

      // 1. Takım Kartları Panosu
      if (this.teamScoreboardCards) {
        if (sortedStats.length === 0) {
          this.teamScoreboardCards.innerHTML = `
            <div class="team-scoreboard-empty">
              <div class="empty-icon">🏆</div>
              <div class="empty-title">Henüz Takım Maçı Oynanmadı</div>
              <div class="empty-desc">Arkadaşlarınla Takım Modunda kapışın, tüm zaferler ve kafa kafaya skorlar bu panoda saklansın!</div>
            </div>
          `;
        } else {
          const medals = ['🥇', '🥈', '🥉', '🎖️'];
          this.teamScoreboardCards.innerHTML = sortedStats.map((st, idx) => {
            const winRate = st.matches > 0 ? Math.round((st.wins / st.matches) * 100) : 0;
            return `
              <div class="team-scoreboard-card" style="--team-accent: ${st.color}">
                <div class="team-card-header">
                  <div class="team-card-rank">${medals[idx] || (idx + 1) + '.'}</div>
                  <div class="team-card-name">${st.name}</div>
                  <div class="team-card-winrate">${winRate}% Zafer</div>
                </div>
                <div class="team-stat-grid">
                  <div class="team-stat-box">
                    <span class="stat-num win">${st.wins}</span>
                    <span class="stat-lbl">Galibiyet</span>
                  </div>
                  <div class="team-stat-box">
                    <span class="stat-num loss">${st.losses}</span>
                    <span class="stat-lbl">Mağlubiyet</span>
                  </div>
                  <div class="team-stat-box">
                    <span class="stat-num tie">${st.ties}</span>
                    <span class="stat-lbl">Berabere</span>
                  </div>
                  <div class="team-stat-box">
                    <span class="stat-num points">${st.totalPoints}</span>
                    <span class="stat-lbl">Toplam Puan</span>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 2. Geçmiş Karşılaşmalar Listesi
      if (this.teamMatchHistoryList) {
        if (matches.length === 0) {
          this.teamMatchHistoryList.innerHTML = `<div class="empty-history-text">Geçmiş maç kaydı bulunmuyor.</div>`;
        } else {
          this.teamMatchHistoryList.innerHTML = matches.map(m => {
            const teamsHtml = m.teams.map(t => `
              <div class="match-team-chip" style="border-color:${t.color};">
                <span class="match-team-name">${t.name}</span>
                <span class="match-team-score" style="color:${t.color};">${t.score}</span>
              </div>
            `).join('<span class="match-vs-divider">VS</span>');

            const winnerBadge = m.isTie 
              ? `<span class="match-result-pill tie">🤝 Berabere</span>`
              : `<span class="match-result-pill win">👑 ${m.winner} Kazandı</span>`;

            return `
              <div class="team-match-history-item">
                <div class="match-item-top">
                  <span class="match-item-date">📅 ${m.date}</span>
                  ${winnerBadge}
                </div>
                <div class="match-teams-row">
                  ${teamsHtml}
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (err) {
      console.error('Takım skor panosu render hatası:', err);
    }
  }

  // Geriye dönük uyumluluk için günlük çark çağrılarını Kader Çarkına yönlendir
  openDailySpinModal() {
    this.openTeamFortuneWheel();
  }

  closeDailySpinModal() {
    this.closeTeamFortuneWheel();
  }

  // =========================================================================
  // TAKIM KADER ÇARKI (2 AŞAMALI ŞANS ÇARKI: KATEGORİ & SÜRE)
  // =========================================================================
  initTeamFortuneWheel() {
    this.teamFortuneStage = 1;
    this.teamFortuneSpinning = false;
    this.teamFortuneRotation = 0;
    this.teamFortuneSelectedCategory = null;
    this.teamFortuneSelectedModifier = null;
  }

  openTeamFortuneWheel() {
    this.isFortuneWheelMatch = true;
    this.teamFortuneSpinTeamIndex = 0;
    this.teamFortuneSelections = [];

    if (this.gameMode !== 'teams') {
      this.gameMode = 'teams';
      this.updateTeamModeUI();
    }

    if (this.modalTeamFortune) {
      this.modalTeamFortune.classList.add('active');
    }

    this.setupTeamFortuneForCurrentTeam();
  }

  setupTeamFortuneForCurrentTeam() {
    this.teamFortuneStage = 1;
    this.teamFortuneSpinning = false;
    this.teamFortuneRotation = 0;
    this.teamFortuneSelectedCategory = null;
    this.teamFortuneSelectedModifier = null;

    const activeTeam = (this.teams && this.teams[this.teamFortuneSpinTeamIndex]) || { name: `Takım ${this.teamFortuneSpinTeamIndex + 1}`, color: '#FF2E93' };
    const totalTeams = (this.teams && this.teams.length) || 2;

    if (this.teamFortuneBadge) {
      this.teamFortuneBadge.textContent = `${activeTeam.name} (${this.teamFortuneSpinTeamIndex + 1}/${totalTeams}. Takım Çevirisi)`;
      this.teamFortuneBadge.style.color = activeTeam.color || '#FFD166';
    }

    if (this.fortuneStep1) this.fortuneStep1.className = 'fortune-step active';
    if (this.fortuneStep2) this.fortuneStep2.className = 'fortune-step';

    if (this.fortuneResultCategory) this.fortuneResultCategory.textContent = 'Çevrilmeyi bekliyor...';
    if (this.fortuneResultDuration) this.fortuneResultDuration.textContent = '2. aşamada seçilecek';

    if (this.teamFortuneWheelStage) this.teamFortuneWheelStage.style.display = 'block';
    if (this.teamFortuneResultBox) this.teamFortuneResultBox.style.display = 'block';
    if (this.fortuneStep1 && this.fortuneStep1.parentElement) this.fortuneStep1.parentElement.style.display = 'flex';
    if (this.teamFortuneMatchupSummary) this.teamFortuneMatchupSummary.style.display = 'none';
    if (this.btnNextTeamSpin) this.btnNextTeamSpin.style.display = 'none';
    if (this.btnLaunchFortuneRound) this.btnLaunchFortuneRound.style.display = 'none';

    if (this.btnSpinTeamFortune) {
      this.btnSpinTeamFortune.style.display = 'block';
      this.btnSpinTeamFortune.disabled = false;
      const span = this.btnSpinTeamFortune.querySelector('span');
      if (span) span.textContent = `🎲 ${activeTeam.name}: Kategori Çarkını Çevir!`;
    }
    if (this.btnTeamFortuneCenter) {
      this.btnTeamFortuneCenter.disabled = false;
    }

    // DOM layoutunun tamamlanmasını bekle, sonra çiz
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.drawTeamFortuneWheel(this.teamFortuneRotation || 0);
      });
    });
  }

  closeTeamFortuneWheel() {
    if (this.teamFortuneSpinning) return;
    try { sounds.stopAll(); } catch (e) {}
    if (this.modalTeamFortune) {
      this.modalTeamFortune.classList.remove('active');
    }
  }

  getTeamCategorySlices() {
    const unlocked = this.categories.filter(c => !this.isCategoryLocked(c.id));
    const list = unlocked.length >= 4 ? unlocked : this.categories;
    const colors = ['#FF2E93', '#7928CA', '#00E5FF', '#FFD166', '#00F5D4', '#FF7043', '#3B82F6', '#10B981'];
    return list.slice(0, 8).map((cat, idx) => {
      // Baştaki emojiyi ve parantez içlerini temizle (Örn: "🔞 Yetişkinler (+18)" -> "Yetişkinler")
      let cleanTitle = (cat.title || cat.name || '')
        .replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '')
        .replace(/\([^)]*\)/g, '')
        .trim();
      if (cleanTitle.length > 10) {
        cleanTitle = cleanTitle.slice(0, 9) + '…';
      }
      return {
        id: cat.id,
        text: cleanTitle,
        fullTitle: cat.title,
        icon: cat.icon || '🎯',
        color: colors[idx % colors.length],
        categoryObj: cat
      };
    });
  }

  getTeamDurationSlices() {
    return [
      { text: '30s Yıldırım', icon: '⚡', color: '#FFD166', duration: 30, multiplier: 1, rule: 'classic' },
      { text: '45s Dinamik', icon: '🔥', color: '#FF7043', duration: 45, multiplier: 1, rule: 'classic' },
      { text: '60s Standart', icon: '⏱️', color: '#00E5FF', duration: 60, multiplier: 1, rule: 'classic' },
      { text: '90s Bonus', icon: '🎁', color: '#00E676', duration: 90, multiplier: 1, rule: 'classic' },
      { text: '120s Mega', icon: '🚀', color: '#7928CA', duration: 120, multiplier: 1, rule: 'classic' },
      { text: '2X Çift Puan', icon: '⭐', color: '#FF2E93', duration: 60, multiplier: 2, rule: 'classic' },
      { text: 'Bomba (45s)', icon: '💣', color: '#EF4444', duration: 45, multiplier: 1, rule: 'bomb' },
      { text: 'Sessiz Sinema', icon: '🤐', color: '#8B5CF6', duration: 60, multiplier: 1, rule: 'mime' }
    ];
  }

  drawTeamFortuneWheel(currentAngle = 0) {
    if (!this.teamFortuneCanvas) return;
    const canvas = this.teamFortuneCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    const rect = canvas.getBoundingClientRect();
    const cssSize = (rect && rect.width > 80) ? Math.round(rect.width) : 280;
    const targetPx = Math.round(cssSize * dpr);

    if (canvas.width !== targetPx || canvas.height !== targetPx) {
      canvas.width = targetPx;
      canvas.height = targetPx;
    }

    // DPR transformunu sıfırla ve temizle
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const centerX = cssSize / 2;
    const centerY = cssSize / 2;
    const radius = cssSize / 2 - 8;

    const slices = this.teamFortuneStage === 1 ? this.getTeamCategorySlices() : this.getTeamDurationSlices();
    const numSlices = slices.length;
    if (numSlices === 0) return;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    for (let i = 0; i < numSlices; i++) {
      const slice = slices[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';

      // İkon (Dış halkada, büyük)
      ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(slice.icon, radius - 26, 7);

      // Metin (İç halkada, merkez butondan uzak ve net)
      ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.text, radius - 62, 4);

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.restore();
  }

  spinTeamFortuneWheel() {
    if (this.teamFortuneSpinning) return;
    sounds.unlockAudio();
    this.teamFortuneSpinning = true;

    if (this.btnSpinTeamFortune) this.btnSpinTeamFortune.disabled = true;
    if (this.btnTeamFortuneCenter) this.btnTeamFortuneCenter.disabled = true;

    const slices = this.teamFortuneStage === 1 ? this.getTeamCategorySlices() : this.getTeamDurationSlices();
    const winningIndex = Math.floor(Math.random() * slices.length);
    const winningItem = slices[winningIndex];

    const numSlices = slices.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = (3 * Math.PI / 2) - targetSliceCenter;

    const extraRounds = 5 + Math.floor(Math.random() * 2);
    const totalRotation = this.teamFortuneRotation + (extraRounds * 2 * Math.PI) + (targetAngle - (this.teamFortuneRotation % (2 * Math.PI)));

    const startTime = performance.now();
    const duration = 3400;
    const initialRotation = this.teamFortuneRotation;
    let lastTickAngle = initialRotation;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = initialRotation + (totalRotation - initialRotation) * easeOut;

      this.teamFortuneRotation = current;
      this.drawTeamFortuneWheel(current);

      if (Math.abs(current - lastTickAngle) >= sliceAngle) {
        sounds.playWheelTick();
        this.triggerHaptic('tick');
        lastTickAngle = current;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.teamFortuneSpinning = false;
        if (this.btnSpinTeamFortune) this.btnSpinTeamFortune.disabled = false;
        if (this.btnTeamFortuneCenter) this.btnTeamFortuneCenter.disabled = false;

        if (this.teamFortuneStage === 1) {
          // 1. Aşama Bitti: Kategori Belirlendi
          sounds.playCorrect();
          this.triggerHaptic('correct');
          this.teamFortuneSelectedCategory = winningItem.categoryObj || this.categories[0];
          if (this.fortuneResultCategory) {
            this.fortuneResultCategory.textContent = `${winningItem.icon} ${winningItem.text}`;
          }

          // 2. Aşamaya geç
          this.teamFortuneStage = 2;
          if (this.fortuneStep1) this.fortuneStep1.className = 'fortune-step completed';
          if (this.fortuneStep2) this.fortuneStep2.className = 'fortune-step active';

          const activeTeam = (this.teams && this.teams[this.teamFortuneSpinTeamIndex]) || { name: 'Takım' };
          if (this.btnSpinTeamFortune) {
            const span = this.btnSpinTeamFortune.querySelector('span');
            if (span) span.textContent = `⏱️ ${activeTeam.name}: Süre & Kural Çarkını Çevir!`;
          }
          this.drawTeamFortuneWheel(0);
        } else {
          // 2. Aşama Bitti: Süre ve Şans Kuralı Belirlendi (Kısa 1.2s kutlama sesi)
          sounds.playWheelWin();
          confetti.celebrate();
          this.triggerHaptic('finish');
          this.teamFortuneSelectedModifier = winningItem;
          if (this.fortuneResultDuration) {
            this.fortuneResultDuration.textContent = `${winningItem.icon} ${winningItem.text}`;
          }
          if (this.fortuneStep2) this.fortuneStep2.className = 'fortune-step completed';

          const activeTeam = (this.teams && this.teams[this.teamFortuneSpinTeamIndex]) || { name: `Takım ${this.teamFortuneSpinTeamIndex + 1}`, color: '#FF2E93' };
          this.teamFortuneSelections[this.teamFortuneSpinTeamIndex] = {
            teamIndex: this.teamFortuneSpinTeamIndex,
            team: activeTeam,
            category: this.teamFortuneSelectedCategory,
            modifier: this.teamFortuneSelectedModifier
          };

          const totalTeams = (this.teams && this.teams.length) || 2;
          const hasMoreTeams = this.teamFortuneSpinTeamIndex < totalTeams - 1;

          if (hasMoreTeams) {
            const nextTeam = this.teams[this.teamFortuneSpinTeamIndex + 1] || { name: `${this.teamFortuneSpinTeamIndex + 2}. Takım` };
            if (this.btnSpinTeamFortune) this.btnSpinTeamFortune.style.display = 'none';
            if (this.btnNextTeamSpin) {
              const span = this.btnNextTeamSpin.querySelector('span');
              if (span) span.textContent = `👉 ${this.teamFortuneSpinTeamIndex + 2}. Takıma Geç: [${nextTeam.name}] Çarkını Çevirsin!`;
              this.btnNextTeamSpin.style.display = 'block';
            }
          } else {
            // Tüm takımlar çarklarını çevirdi!
            if (this.btnSpinTeamFortune) this.btnSpinTeamFortune.style.display = 'none';
            if (this.btnNextTeamSpin) this.btnNextTeamSpin.style.display = 'none';

            this.renderTeamFortuneMatchupSummary();

            if (this.btnLaunchFortuneRound) {
              const firstTeam = this.teams[0] || { name: '1. Takım' };
              const span = this.btnLaunchFortuneRound.querySelector('span');
              if (span) span.textContent = `🚀 [${firstTeam.name}] İle SAVAŞI BAŞLAT!`;
              this.btnLaunchFortuneRound.style.display = 'block';
            }
          }
        }
      }
    };

    requestAnimationFrame(animate);
  }

  renderTeamFortuneMatchupSummary() {
    if (!this.fortuneMatchupTeamsList) return;
    this.fortuneMatchupTeamsList.innerHTML = '';

    this.teamFortuneSelections.forEach((sel, idx) => {
      const item = document.createElement('div');
      item.className = 'fortune-matchup-team-item';
      item.innerHTML = `
        <div class="team-tag" style="background:${sel.team.color || '#7928CA'}; color:#FFF; font-weight:900; padding:6px 14px; border-radius:14px; display:inline-flex; align-items:center; gap:6px;">
          <span>${idx === 0 ? '🔴' : (idx === 1 ? '🔵' : '🟢')}</span>
          <span>${sel.team.name}</span>
        </div>
        <div class="team-choice-chips" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
          <span class="fortune-detail-chip cat-chip" style="background:rgba(0,245,212,0.15); border:1px solid #00F5D4; color:#00F5D4; padding:5px 12px; border-radius:12px; font-size:0.85rem; font-weight:800;">
            ${sel.category.icon || '🎯'} ${sel.category.title || sel.category.name}
          </span>
          <span class="fortune-detail-chip dur-chip" style="background:rgba(255,46,147,0.15); border:1px solid #FF2E93; color:#FF2E93; padding:5px 12px; border-radius:12px; font-size:0.85rem; font-weight:800;">
            ${sel.modifier.icon || '⏱️'} ${sel.modifier.text}
          </span>
        </div>
      `;
      this.fortuneMatchupTeamsList.appendChild(item);

      if (idx < this.teamFortuneSelections.length - 1) {
        const vsDiv = document.createElement('div');
        vsDiv.className = 'fortune-vs-divider';
        vsDiv.innerHTML = '<span style="font-family:var(--font-heading); font-size:1.15rem; font-weight:900; color:#FFE600; text-shadow:0 0 10px rgba(255,230,0,0.6);">⚡ VS ⚡</span>';
        this.fortuneMatchupTeamsList.appendChild(vsDiv);
      }
    });

    if (this.teamFortuneWheelStage) this.teamFortuneWheelStage.style.display = 'none';
    if (this.teamFortuneResultBox) this.teamFortuneResultBox.style.display = 'none';
    if (this.fortuneStep1 && this.fortuneStep1.parentElement) this.fortuneStep1.parentElement.style.display = 'none';
    if (this.teamFortuneMatchupSummary) {
      this.teamFortuneMatchupSummary.style.display = 'block';
    }
  }

  async launchTeamFortuneRound() {
    if (!this.teamFortuneSelections || this.teamFortuneSelections.length === 0) return;
    this.closeTeamFortuneWheel();
    this.isFortuneWheelMatch = true;
    this.currentTeamIndex = 0;
    this.currentRoundNumber = 1;

    const teamSel = this.teamFortuneSelections[0];
    this.currentCategory = teamSel.category;
    const modifier = teamSel.modifier || { duration: 60, multiplier: 1, rule: 'classic' };
    this.roundScoreMultiplier = modifier.multiplier || 1;
    this.fortuneWheelOverrideDuration = modifier.duration || 60;
    if (modifier.rule) {
      this.ruleMode = modifier.rule;
    }

    if (this.cameraEnabled) {
      await this.camera.initCamera(this.cameraPip).catch(() => {});
    }

    this.startCountdown();
  }

  // ==========================================
  // APK PAYLAŞIM & İNDİRME METOTLARI (7/24 Kesintisiz Bulut & Yerel Wi-Fi)
  // ==========================================
  getApkDownloadUrl(source = null) {
    const activeSource = source || this.currentApkSource || localStorage.getItem('kafanatak_apk_source') || 'cloud';
    const defaultCloudUrl = 'https://github.com/wmurat7/kafanatak-party/releases/latest/download/KafanaTak-v1.0.apk';
    const customCloudUrl = localStorage.getItem('kafanatak_custom_apk_url');

    if (activeSource === 'cloud') {
      return customCloudUrl || defaultCloudUrl;
    }

    // Yerel Wi-Fi Linki (Bilgisayar açıkken)
    const savedIp = localStorage.getItem('kafanatak_last_server_ip') || '192.168.1.159';
    let hostIp = (this.serverInfo && this.serverInfo.localIp && this.serverInfo.localIp !== 'localhost')
      ? this.serverInfo.localIp
      : savedIp;
    const port = (this.serverInfo && this.serverInfo.httpPort) ? this.serverInfo.httpPort : 3000;
    return `http://${hostIp}:${port}/KafanaTak-v1.0.apk`;
  }

  switchApkSource(source) {
    sounds.playClick();
    this.currentApkSource = source;
    try { localStorage.setItem('kafanatak_apk_source', source); } catch (e) {}
    this.renderApkQrModalContent();
  }

  async renderApkQrModalContent() {
    const isCloud = (this.currentApkSource !== 'local');
    const apkUrl = this.getApkDownloadUrl(this.currentApkSource);

    if (this.tabApkCloud) {
      if (isCloud) {
        this.tabApkCloud.style.background = 'linear-gradient(135deg, #00F5D4, #0072FF)';
        this.tabApkCloud.style.color = '#0B0E14';
      } else {
        this.tabApkCloud.style.background = 'transparent';
        this.tabApkCloud.style.color = 'var(--text-secondary)';
      }
    }

    if (this.tabApkLocal) {
      if (!isCloud) {
        this.tabApkLocal.style.background = 'linear-gradient(135deg, #FFB800, #FF2E93)';
        this.tabApkLocal.style.color = '#0B0E14';
      } else {
        this.tabApkLocal.style.background = 'transparent';
        this.tabApkLocal.style.color = 'var(--text-secondary)';
      }
    }

    if (this.apkStatusPill) {
      if (isCloud) {
        this.apkStatusPill.innerHTML = '🟢 7/24 Kesintisiz Aktif (PC Kapalıyken de İndirilebilir)';
        this.apkStatusPill.style.background = 'rgba(0,245,212,0.15)';
        this.apkStatusPill.style.color = '#00F5D4';
        this.apkStatusPill.style.borderColor = 'rgba(0,245,212,0.4)';
      } else {
        this.apkStatusPill.innerHTML = '💻 Ev/Ofis Ağı (Bilgisayar & Sunucu Açıkken)';
        this.apkStatusPill.style.background = 'rgba(255,184,0,0.15)';
        this.apkStatusPill.style.color = '#FFB800';
        this.apkStatusPill.style.borderColor = 'rgba(255,184,0,0.4)';
      }
    }

    if (this.apkModalDesc) {
      this.apkModalDesc.textContent = isCloud
        ? 'Arkadaşınız telefon kamerasını bu QR koda tutsun; bilgisayarınız kapalı olsa dahi APK anında insin!'
        : 'Aynı Wi-Fi ağına bağlı arkadaşınız kamerasıyla okutsun; yerel ağdan süper hızlı insin!';
    }

    if (this.apkDownloadUrlText) {
      this.apkDownloadUrlText.textContent = apkUrl;
    }

    if (this.qrApkDownloadCanvas) {
      try {
        await QRCode.toCanvas(this.qrApkDownloadCanvas, apkUrl, {
          width: 220,
          margin: 1,
          color: { dark: '#0B0E14', light: '#FFFFFF' }
        });
      } catch (e) {
        console.warn('APK QR canvas oluşturulamadı:', e);
      }
    }
  }

  async shareAppApk() {
    sounds.playClick();
    // Paylaşım için 7/24 çalışan kesintisiz bulut linkini kullan
    const apkUrl = this.getApkDownloadUrl('cloud');
    const shareData = {
      title: 'Kafana Tak! - Parti Oyunu APK',
      text: 'Kafana Tak! mobil parti oyununu doğrudan telefonuna indir ve oyna (7/24 Kesintisiz İndirme)! 📱🎉',
      url: apkUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.showToast('✅ Paylaşım penceresi açıldı!');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share başarısız, QR modalına geçiliyor:', err);
        }
      }
    }
    this.openApkQrModal();
  }

  async openApkQrModal() {
    sounds.playClick();
    if (!this.modalApkQrDownload) return;
    this.modalApkQrDownload.classList.add('active');
    await this.renderApkQrModalContent();
  }

  closeApkQrModal() {
    sounds.playClick();
    if (this.modalApkQrDownload) {
      this.modalApkQrDownload.classList.remove('active');
    }
  }

  async copyApkDownloadLink() {
    sounds.playClick();
    const apkUrl = this.getApkDownloadUrl(this.currentApkSource);
    try {
      await navigator.clipboard.writeText(apkUrl);
      this.showToast('📋 APK indirme bağlantısı panoya kopyalandı!');
    } catch (e) {
      prompt('APK indirme bağlantısını kopyalayın:', apkUrl);
    }
  }

  directDownloadApk() {
    sounds.playClick();
    const apkUrl = this.getApkDownloadUrl(this.currentApkSource);
    window.open(apkUrl, '_blank');
  }

  // ==========================================
  // PARTİ CEZA ÇARKI (DARE WHEEL) METOTLARI
  // ==========================================
  initPartyDareWheel() {
    this.partyDareSlices = [
      { title: 'Amigo', fullTitle: 'Amigo Dansı', icon: '💃', color: '#FF2E93', desc: '10 saniye boyunca çılgınca amigo dansı yap!' },
      { title: 'Limon', fullTitle: 'Limon Surat', icon: '🍋', color: '#FFB800', desc: 'Limon yemiş gibi en komik ekşi suratını yap ve 10s bekle!' },
      { title: 'Opera', fullTitle: 'Opera Söyle', icon: '🎤', color: '#00F5D4', desc: 'Bir çocuk şarkısını operacı gibi bağırarak söyle!' },
      { title: 'Robot', fullTitle: 'Robot Konuş', icon: '🤖', color: '#7928CA', desc: '1 tur boyunca mekanik robot gibi konuş!' },
      { title: 'İltifat', fullTitle: 'Rakibi Öv', icon: '👑', color: '#FF416C', desc: 'Kazanan tarafa veya rakibine 3 büyük samimi iltifat et!' },
      { title: 'Sır Anlat', fullTitle: 'Sırrını Aç', icon: '🤫', color: '#0072FF', desc: 'Gruptan birine en komik veya utanç verici anını anlat!' },
      { title: 'Kör Su', fullTitle: 'Körleme Su', icon: '🙈', color: '#05D554', desc: 'Gözlerin tamamen kapalı bir yudum su iç!' },
      { title: 'Taklit', fullTitle: 'Ünlü Taklidi', icon: '🥸', color: '#FF6B00', desc: 'Tanınan bir sanatçı veya dizi karakterini canlandır!' }
    ];
    this.drawPartyDareWheel(0);
  }

  drawPartyDareWheel(currentAngle = 0) {
    if (!this.partyDareCanvas) return;
    const canvas = this.partyDareCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    const rect = canvas.getBoundingClientRect();
    const cssSize = (rect && rect.width > 80) ? Math.round(rect.width) : 280;
    const targetPx = Math.round(cssSize * dpr);

    if (canvas.width !== targetPx || canvas.height !== targetPx) {
      canvas.width = targetPx;
      canvas.height = targetPx;
    }

    // DPR transformunu sıfırla ve yeniden kur
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const centerX = cssSize / 2;
    const centerY = cssSize / 2;
    const radius = cssSize / 2 - 8;

    if (!this.partyDareSlices || this.partyDareSlices.length === 0) {
      this.initPartyDareWheel();
    }
    const slices = this.partyDareSlices || [];
    const numSlices = slices.length;
    if (numSlices === 0) return;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    for (let i = 0; i < numSlices; i++) {
      const slice = slices[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Dilim gövdesi
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Dilim kenar çizgisi
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Dilim içeriği (İkon + Başlık)
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1. İkon (Dış halka yakınında, ferah alan)
      ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(slice.icon, radius - 24, 0);

      // 2. Kısa Başlık (Orta bant, merkez düğmeye ve ikona asla temas etmez)
      ctx.font = '900 11.5px "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 3;
      ctx.fillText(slice.title || slice.text, radius - 62, 0);

      ctx.restore();
    }

    // Dış çevre halkası (Neon beyaz çerçeve)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // İç dekoratif altın halka (Merkez buton çevresini estetik çerçeveler)
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    ctx.restore();
  }

  openPartyDareWheel() {
    sounds.unlockAudio();
    sounds.playClick();
    this.isDareWheelSpinning = false;
    if (this.modalPartyDare) {
      this.modalPartyDare.classList.add('active');
    }
    if (this.dareResultBox) this.dareResultBox.style.display = 'none';
    if (this.btnSpinDareWheel) this.btnSpinDareWheel.disabled = false;
    if (this.btnSpinDareCenter) this.btnSpinDareCenter.disabled = false;

    // DOM layoutunun tamamlanmasını bekle, sonra çiz
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.drawPartyDareWheel(this.dareWheelRotation || 0);
      });
    });
  }

  closePartyDareWheel() {
    try { sounds.stopAll(); } catch (e) {}
    try { announcer.stop(); } catch (e) {}
    sounds.playClick();
    if (this.modalPartyDare) {
      this.modalPartyDare.classList.remove('active');
    }
    if (this.dareResultBox) this.dareResultBox.style.display = 'none';
  }

  spinPartyDareWheel() {
    if (this.isDareWheelSpinning) return;
    sounds.unlockAudio();
    this.isDareWheelSpinning = true;

    if (this.btnSpinDareWheel) this.btnSpinDareWheel.disabled = true;
    if (this.btnSpinDareCenter) this.btnSpinDareCenter.disabled = true;
    if (this.dareResultBox) this.dareResultBox.style.display = 'none';

    const slices = this.partyDareSlices;
    const numSlices = slices.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const winningIndex = Math.floor(Math.random() * numSlices);
    const winningItem = slices[winningIndex];

    // İbre tam tepede: 3 * PI / 2 (270°)
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = (3 * Math.PI / 2) - targetSliceCenter;

    const extraRounds = 5 + Math.floor(Math.random() * 2);
    const currentRot = this.dareWheelRotation || 0;
    const normalizedCurrent = currentRot % (2 * Math.PI);
    let diff = targetAngle - normalizedCurrent;
    while (diff < 0) diff += 2 * Math.PI;

    const totalRotation = currentRot + (extraRounds * 2 * Math.PI) + diff;
    const startTime = performance.now();
    const duration = 3200;
    const initialRotation = currentRot;
    let lastTickAngle = initialRotation;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = initialRotation + (totalRotation - initialRotation) * easeOut;

      this.dareWheelRotation = current;
      this.drawPartyDareWheel(current);

      if (Math.abs(current - lastTickAngle) >= sliceAngle) {
        sounds.playWheelTick();
        this.triggerHaptic('tick');
        lastTickAngle = current;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isDareWheelSpinning = false;
        if (this.btnSpinDareWheel) this.btnSpinDareWheel.disabled = false;
        if (this.btnSpinDareCenter) this.btnSpinDareCenter.disabled = false;

        // Kısa, tatlı ve orantılı ses (1.2s)
        sounds.playWheelWin();
        confetti.celebrate();
        this.triggerHaptic('finish');

        if (this.dareResultBox && this.dareResultText) {
          const title = winningItem.fullTitle || winningItem.title || winningItem.text;
          this.dareResultText.innerHTML = `
            <div style="font-size:1.35rem; margin-bottom:4px;">${winningItem.icon} <span style="color:#FFB800;">${title}</span></div>
            <div style="font-size:0.92rem; font-weight:700; color:#FFFFFF; opacity:0.95;">"${winningItem.desc}"</div>
          `;
          this.dareResultBox.style.display = 'block';
        }

        try {
          const speakTitle = winningItem.fullTitle || winningItem.title || winningItem.text;
          announcer.speak(`Ceza görevi çıktı! ${speakTitle}!`);
        } catch(e) {}
      }
    };

    requestAnimationFrame(animate);
  }
}

// Global ses ve Web Audio kilit açıcı (Kullanıcı herhangi bir yere dokunduğunda Android WebView ses kilidini açar)
const unlockAllAudio = () => {
  try { sounds.unlockAudio(); } catch (e) {}
  try { announcer.unlockAudio(); } catch (e) {}
};
['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
  window.addEventListener(evt, unlockAllAudio, { passive: true });
});

document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  window.gameApp = new GameApp();
  window.game = window.gameApp;
  unlockAllAudio();
});
