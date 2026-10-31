// Kafana Tak! - Profesyonel Stüdyo Audio Engine & Ses Yöneticisi
// Doğal stüdyo kayıtları (WAV/OGG) + Sıfır gecikmeli Web Audio Buffer Cache

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.compressor = null;
    this.masterGain = null;
    this.musicGain = null;
    this.muted = typeof localStorage !== 'undefined' ? (localStorage.getItem('kafanatak_muted') === 'true') : false;
    const validThemes = ['party_groove', 'tv_quiz', 'suspense', 'ticking_clock', 'noir_mystery', 'minimal_drone', 'none'];
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('kafanatak_music_theme') : null;
    this.musicTheme = validThemes.includes(savedTheme) ? savedTheme : 'party_groove';
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.isUrgent = false;

    // Aktif çalan ses kaynakları, osilatörler ve bekleyen zamanlayıcılar (Ekranda çıkınca anında durdurmak için)
    this.activeSources = new Set();
    this.activeOscillators = new Set();
    this.pendingTimeouts = [];

    // Stüdyo Ses Tamponları (Decoded AudioBuffer Cache)
    this.buffers = {};
    this.sampleUrls = {
      correct: 'assets/sounds/correct.ogg',
      pass: 'assets/sounds/pass.ogg',
      slide: 'assets/sounds/slide.ogg',
      tick: 'assets/sounds/tick.ogg',
      countdown: 'assets/sounds/countdown.ogg',
      bell: 'assets/sounds/bell.ogg',
      triangle: 'assets/sounds/triangle.ogg',
      applause: 'assets/sounds/applause.wav',
      cheer: 'assets/sounds/cheer.ogg',
      drumroll: 'assets/sounds/drumroll.ogg',
      horn: 'assets/sounds/horn.ogg',
      clown_horn: 'assets/sounds/clown_horn.ogg',
      ornek1_net_hizli_studyo: 'assets/sounds/samples/ornek1_net_hizli_studyo.wav',
      ornek2_neseli_kucuk_grup: 'assets/sounds/samples/ornek2_neseli_kucuk_grup.wav',
      ornek3_kipir_kipir_parti: 'assets/sounds/samples/ornek3_kipir_kipir_parti.wav',
      ornek4_ritmik_tempo: 'assets/sounds/samples/ornek4_ritmik_tempo.wav',
      ornek5_genc_aydinlik: 'assets/sounds/samples/ornek5_genc_aydinlik.wav'
    };
    this.activeApplauseSample = (typeof localStorage !== 'undefined')
      ? (localStorage.getItem('kafanatak_applause_sample') || 'ornek1_net_hizli_studyo')
      : 'ornek1_net_hizli_studyo';
    this.loadedSamples = false;

    // Arka planda ses dosyalarını anında önbelleğe al
    this.preloadSamples();
  }

  // Tüm Çalan Sesleri, Osilatörleri ve Kuyruktaki Efektleri Anında %100 Kapatma
  stopAll() {
    this.stopPartyBeat();

    // 1. Bekleyen tüm efekt zamanlayıcılarını sıfırla
    if (this.pendingTimeouts && this.pendingTimeouts.length > 0) {
      this.pendingTimeouts.forEach(t => clearTimeout(t));
      this.pendingTimeouts = [];
    }

    // 2. Aktif tüm AudioBuffer kaynaklarını anında sustur
    if (this.activeSources) {
      this.activeSources.forEach(src => {
        try {
          src.stop(0);
          src.disconnect();
        } catch (e) {}
      });
      this.activeSources.clear();
    }

    // 3. Aktif tüm osilatörleri anında durdur
    if (this.activeOscillators) {
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop(0);
          osc.disconnect();
        } catch (e) {}
      });
      this.activeOscillators.clear();
    }

    // 4. Donanım seviyesinde Master Gain'i 0'a çekerek mutlak sessizlik sağla
    if (this.ctx && this.masterGain && this.masterGain.gain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0, now);

        // 60ms sonra master gain'i normale döndür (sonraki tıklamalar hemen duyulabilsin)
        const tRestore = setTimeout(() => {
          if (this.ctx && this.masterGain && !this.muted) {
            try {
              const cur = this.ctx.currentTime;
              this.masterGain.gain.cancelScheduledValues(cur);
              this.masterGain.gain.setValueAtTime(1.0, cur);
            } catch (err) {}
          }
        }, 60);
        this.pendingTimeouts.push(tRestore);
      } catch (e) {}
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        try {
          // Master Dinamik Kompresör (Telefonda sesin bozulmadan berrak çıkması için)
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

          // Master Ses Seviyesi
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

          // Parti Ritmi Gain Düğümü
          this.musicGain = this.ctx.createGain();
          this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
          this.musicGain.connect(this.compressor);
        } catch (e) {}
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  getOutputNode() {
    return this.compressor || (this.ctx ? this.ctx.destination : null);
  }

  // Mobil Dokunma Kilidini Açma
  unlockAudio() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    try {
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
    } catch (e) {}

    // Henüz yüklenmemişse tamponları doldur
    if (!this.loadedSamples) {
      this.preloadSamples();
    }
  }

  async preloadSamples() {
    if (this.loadedSamples) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (!this.ctx) return;

      const promises = Object.entries(this.sampleUrls).map(async ([key, url]) => {
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const arr = await resp.arrayBuffer();
            const decoded = await this.ctx.decodeAudioData(arr);
            this.buffers[key] = decoded;
          }
        } catch (err) {
          // Konsola spam yapmadan sessizce fallbacke bırak
        }
      });

      await Promise.allSettled(promises);
      this.loadedSamples = true;
    } catch (e) {}
  }

  // Sıfır Gecikmeli Stüdyo Tampon Çalma (maxDurationSec ile otomatik orantılı fade-out)
  playBuffer(name, volume = 1.0, playbackRate = 1.0, maxDurationSec = null) {
    if (this.muted) return false;
    this.unlockAudio();
    if (!this.ctx) return false;

    const buffer = this.buffers[name];
    if (!buffer) return false;

    try {
      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.setValueAtTime(playbackRate, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, now);

      src.connect(gain);
      gain.connect(this.getOutputNode());

      if (maxDurationSec && maxDurationSec > 0) {
        const fadeDuration = 0.5;
        const fadeStart = Math.max(now, now + maxDurationSec - fadeDuration);
        gain.gain.setValueAtTime(volume, fadeStart);
        gain.gain.linearRampToValueAtTime(0.001, now + maxDurationSec);
        src.stop(now + maxDurationSec);
      }

      // Aktif ses listesine ekle
      this.activeSources.add(src);
      src.onended = () => {
        if (this.activeSources) {
          this.activeSources.delete(src);
        }
      };

      src.start(now);
      return true;
    } catch (e) {
      return false;
    }
  }

  vibrate(pattern) {
    // 1. Capacitor Native Haptics (Gerçek donanım taptik titreşim motoru)
    try {
      const haptics = window.Capacitor?.Plugins?.Haptics;
      if (haptics) {
        if (typeof pattern === 'number') {
          if (pattern <= 25) {
            haptics.impact({ style: 'LIGHT' }).catch(() => {});
          } else if (pattern <= 70) {
            haptics.impact({ style: 'MEDIUM' }).catch(() => {});
          } else {
            haptics.impact({ style: 'HEAVY' }).catch(() => {});
          }
        } else if (Array.isArray(pattern)) {
          haptics.notification({ type: 'SUCCESS' }).catch(() => {});
        }
      }
    } catch (e) {}

    // 2. Web API navigator.vibrate fallback
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // =========================================================================
  // 1. DOĞRU TAHMİN SESİ (Stüdyo Glockenspiel Sihir Çanı)
  // =========================================================================
  playCorrect() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([40, 30, 80]);

    if (!this.playBuffer('correct', 1.0)) {
      // Yedek osilatör
      this.fallbackChime();
    }
  }

  // =========================================================================
  // 2. PAS SESİ (Sevimli Karikatür Yay Sekmesi)
  // =========================================================================
  playPass() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(80);

    if (!this.playBuffer('pass', 0.95)) {
      this.fallbackBoing();
    }
  }

  // =========================================================================
  // 2.1. YANLIŞ SESİ & BUZZER (Otantik TV Stüdyo Yarışması "X" Buzzer)
  // =========================================================================
  playWrong() {
    if (this.muted) return;
    this.unlockAudio();
    this.playBuzzer();
  }

  synthModernWrong() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // =========================================================================
  // 3. SAYAC / TİK-TAK SESİ (Akustik Ahşap Blok Tıkı)
  // =========================================================================
  playTick(isUrgent = false) {
    if (this.muted) return;
    this.unlockAudio();

    if (isUrgent) {
      this.vibrate(25);
      this.playBuffer('tick', 0.95, 1.25);
    } else {
      this.playBuffer('tick', 0.65, 1.0);
    }
  }

    // =========================================================================
  // 4. GERİ SAYIM & BİP (Stüdyo Kalitesinde Kristal UI Ping & Zafer Akoru)
  // =========================================================================
  playCountdown(isFinal = false) {
    this.playCountdownBeep(isFinal);
  }

  playCountdownBeep(isFinal = false) {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(isFinal ? [70, 40, 160] : 35);
    this.synthModernBeep(isFinal ? 1046.5 : 880, isFinal ? 0.45 : 0.16, isFinal);
  }

  synthModernBeep(freq = 880, duration = 0.16, isFinal = false) {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const outNode = this.getOutputNode();

      if (isFinal) {
        // Final "BAŞLA / 0 / BİTTİ" Sesi: Parlak C Major Arpej Akoru (C6, E6, G6, C7)
        const notes = [1046.50, 1318.51, 1567.98, 2093.00];
        notes.forEach((f, idx) => {
          const t = now + idx * 0.035;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.exponentialRampToValueAtTime(f * 1.02, t + 0.35);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.45, t + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

          osc.connect(gain);
          gain.connect(outNode);
          osc.start(t);
          osc.stop(t + 0.5);
          this.activeOscillators.add(osc);
          setTimeout(() => this.activeOscillators?.delete(osc), 600);
        });
      } else {
        // Normal 3.. 2.. 1.. Geri Sayım: Çift Harmonikli Kristal Stüdyo Ping (960Hz + 1920Hz)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.frequency.exponentialRampToValueAtTime(freq * 0.98, now + duration);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now); // 1 oktav tiz ışıltı

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.55, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(outNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.05);
        osc2.stop(now + duration + 0.05);

        this.activeOscillators.add(osc1);
        this.activeOscillators.add(osc2);
        setTimeout(() => {
          this.activeOscillators?.delete(osc1);
          this.activeOscillators?.delete(osc2);
        }, 300);
      }
    } catch (e) {}
  }

// =========================================================================
  // 5. TUR BİTİŞI & ŞAMPİYON KUTLAMASI (Kısa ve Orantılı Alkış & Davul)
// =========================================================================
  playFinish() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([100, 60, 120, 60, 250]);

    this.playBuffer('drumroll', 0.85);
    const t = setTimeout(() => {
      // 1.8s sürer ve son 0.4 saniyede yumuşaca söner
      this.playBuffer('applause', 0.9, 1.05, 1.8);
    }, 250);
    this.pendingTimeouts.push(t);
  }

  // =========================================================================
  // 5.1. ÇARK SESLERİ (Dönme Tıkırtısı ve Bitiş Kutlaması)
  // =========================================================================
  playWheelTick() {
    if (this.muted) return;
    this.playBuffer('tick', 0.4, 1.45);
  }

  playSpin() {
    if (this.muted) return;
    this.playBuffer('slide', 0.55) || this.playWheelTick();
  }

  playWheelWin() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([80, 50, 140]);

    // Hafif çan/zil
    this.playBuffer('triangle', 0.85) || this.playBuffer('bell', 0.85);

    // Kısa ve orantılı alkış (Sadece 1.2 saniye sürer ve 0.3s söner)
    const t = setTimeout(() => {
      this.playBuffer('applause', 0.75, 1.15, 1.2);
    }, 120);
    this.pendingTimeouts.push(t);
  }

    // =========================================================================
  // 6. SAATLİ BOMBA SESLERİ (Gerilimli Çift Mekanizma & Mobil Sinematik Patlama)
  // =========================================================================
  playBombTick(remainingSec = 30, totalSec = 30) {
    if (this.muted) return;
    this.unlockAudio();
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const outNode = this.getOutputNode();
      const progress = Math.max(0, Math.min(1, 1 - (remainingSec / (totalSec || 30))));
      
      // Süre azaldıkça ton tizleşir ve daha gerilimli hale gelir
      const isTick = Math.floor(remainingSec) % 2 === 0;
      const baseFreq = isTick ? (900 + progress * 600) : (650 + progress * 500);
      const duration = Math.max(0.04, 0.08 - progress * 0.04);

      // Metalik Saat Tıkırtısı
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.2, now);
      filter.Q.setValueAtTime(4.0, now);

      osc.type = isTick ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + duration);

      gain.gain.setValueAtTime(0.4 + progress * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(outNode);

      osc.start(now);
      osc.stop(now + duration + 0.02);
      this.vibrate(progress > 0.7 ? 40 : 20);
    } catch (e) {}
  }

  playBombExplosion() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([160, 40, 240, 40, 450]);
    this.synthBombExplosion();
  }

  synthBombExplosion() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const outNode = this.getOutputNode();

      // 1. Mobil Hoparlör Tok Darbesi (Punch Kick Transient: 650Hz -> 85Hz in 35ms)
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'triangle';
      kickOsc.frequency.setValueAtTime(650, now);
      kickOsc.frequency.exponentialRampToValueAtTime(85, now + 0.045);
      kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      kickGain.gain.setValueAtTime(1.0, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      kickOsc.connect(kickGain);
      kickGain.connect(outNode);
      kickOsc.start(now);
      kickOsc.stop(now + 0.6);

      // 2. Doygun Gövde Sarsıntısı (Saturated Sub-Rumble)
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sawtooth';
      boomOsc.frequency.setValueAtTime(140, now);
      boomOsc.frequency.exponentialRampToValueAtTime(45, now + 0.9);

      boomGain.gain.setValueAtTime(0.7, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      boomOsc.connect(boomGain);
      boomGain.connect(outNode);
      boomOsc.start(now);
      boomOsc.stop(now + 1.0);

      // 3. Patlama & Şok Dalgası Gürültüsü (Swept Noise Blast)
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.45));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 1.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(outNode);
      noiseSource.start(now);
      noiseSource.stop(now + 1.5);
    } catch (e) {}
  }

  // =========================================================================
  // 7. TEZAHÜRAT & SEYİRCİ EFEKTLERİ (Korna, Zil, Alkış)
  // =========================================================================
  playAirhorn() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([80, 40, 80, 40, 200]);
    this.playBuffer('horn', 1.0);
  }

  playVuvuzela() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([100, 30, 100]);
    this.init();
    if (!this.ctx) {
      this.playBuffer('horn', 1.0);
      return;
    }
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(233.08, now); // B-flat 3 stadyum tonu
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(466.16, now); // Armonik rezonans

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 0.05);
      gain.gain.setValueAtTime(0.7, now + 0.55);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.getOutputNode());

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);

      this.activeOscillators.add(osc1);
      this.activeOscillators.add(osc2);
      setTimeout(() => {
        if (this.activeOscillators) {
          this.activeOscillators.delete(osc1);
          this.activeOscillators.delete(osc2);
        }
      }, 950);
    } catch (e) {
      this.playBuffer('horn', 1.0);
    }
  }

    // =========================================================================
  // 7. PALYAÇO KORNASI (Komik Lastik Balon Korna "TÖÖT-TÖÖT!")
  // =========================================================================
  playClownHorn() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([70, 40, 110]);
    this.synthCartoonClownHorn();
  }

  synthCartoonClownHorn() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const outNode = this.getOutputNode();

      // İki ardışık komik korna sıkışı: Birinci "Tööt", hemen ardından daha tiz "Tööt!"
      const squeaks = [
        { start: now, freq: 520, targetFreq: 720, dur: 0.12, gain: 0.65 },
        { start: now + 0.13, freq: 620, targetFreq: 850, dur: 0.16, gain: 0.8 }
      ];

      squeaks.forEach(sq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Karikatür rezonansı (Pirinç/lastik tınısı)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(sq.freq * 1.8, sq.start);
        filter.Q.setValueAtTime(4.5, sq.start);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(sq.freq, sq.start);
        osc.frequency.exponentialRampToValueAtTime(sq.targetFreq, sq.start + sq.dur * 0.6);
        osc.frequency.exponentialRampToValueAtTime(sq.freq * 0.9, sq.start + sq.dur);

        gain.gain.setValueAtTime(0, sq.start);
        gain.gain.linearRampToValueAtTime(sq.gain, sq.start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, sq.start + sq.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(outNode);

        osc.start(sq.start);
        osc.stop(sq.start + sq.dur + 0.02);

        this.activeOscillators.add(osc);
        setTimeout(() => this.activeOscillators?.delete(osc), (sq.dur + 0.3) * 1000);
      });
    } catch (e) {
      this.playBuffer('clown_horn', 1.0);
    }
  }

  playDrumroll() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([60, 30, 120]);
    this.playBuffer('drumroll', 0.95);
  }

  playCheer() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([80, 50, 140]);
    this.playBuffer('cheer', 1.0, 1.0, 3.0);
  }

  playBell() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([60, 40, 60]);
    this.playBuffer('bell', 0.95);
  }

  playApplause() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([80, 40, 120]);
    const chosen = this.activeApplauseSample || 'ornek1_parti_hurray';
    if (!this.playBuffer(chosen, 1.0, 1.0, 3.2)) {
      if (!this.playBuffer('applause', 1.0, 1.0, 3.1)) {
        this.fallbackApplause(chosen);
      }
    }
  }

  playApplauseSample(sampleKey) {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([60, 30, 90]);
    if (!this.playBuffer(sampleKey, 1.0, 1.0, 3.2)) {
      try {
        const audio = new Audio(`assets/sounds/samples/${sampleKey}.wav`);
        audio.volume = 1.0;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }

  playCheerSound(type = 'horn') {
    if (type === 'buzzer') {
      this.playBuzzer();
    } else if (type === 'horn' || type === 'airhorn') {
      this.playAirhorn();
    } else if (type === 'bell') {
      this.playBell();
    } else if (type === 'vuvuzela') {
      this.playVuvuzela();
    } else if (type === 'boo') {
      this.playClownHorn();
    } else if (type === 'party' || type === 'cheer') {
      this.playCheer();
    } else {
      this.playApplause();
    }
  }

  playPop() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(30);
    this.init();
    try {
      const ctx = this.ctx;
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.getOutputNode());
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playDing() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([40, 30]);
    if (!this.playBuffer('triangle', 0.95)) {
      if (!this.playBuffer('bell', 0.85)) {
        this.fallbackChime();
      }
    }
  }

  playBuzzer() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([100, 40, 160]);
    this.init();
    try {
      const ctx = this.ctx;
      if (!ctx) {
        this.playBuffer('pass', 0.95);
        return;
      }
      const now = ctx.currentTime;
      const outNode = this.getOutputNode();

      // Otantik TV Stüdyosu "X" Buzzer (Dissonant Çift Testere & Kare Osilatör: 130Hz + 185Hz Gerilimli Tritone)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130.81, now); // C3
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(185.00, now); // F#3 (Dramatik gerilim aralığı)

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.70, now + 0.012);
      gain.gain.setValueAtTime(0.70, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(outNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.32);
      osc2.stop(now + 0.32);

      this.activeOscillators.add(osc1);
      this.activeOscillators.add(osc2);
      setTimeout(() => {
        if (this.activeOscillators) {
          this.activeOscillators.delete(osc1);
          this.activeOscillators.delete(osc2);
        }
      }, 380);
    } catch (e) {
      this.playBuffer('pass', 0.95);
    }
  }

  // =========================================================================
  // 8. ARKA PLAN PARTİ RİTMİ & OYUN MÜZİĞİ MOTORU
  // =========================================================================
  setMusicTheme(theme) {
    this.musicTheme = theme || 'party_groove';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kafanatak_music_theme', this.musicTheme);
    }
    if (this.musicPlaying) {
      this.stopPartyBeat();
      this.startPartyBeat();
    }
  }

  setMusicUrgent(isUrgent = true) {
    this.isUrgent = !!isUrgent;
  }

  // --- Sentetik Parti Enstrümanları (Sıfır gecikmeli dinamik sentez) ---
  synthDrumKick(time, punch = 1.0) {
    if (!this.ctx) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.065);
      gain.gain.setValueAtTime(0.55 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.075);
      osc.connect(gain);
      gain.connect(target);
      osc.start(time);
      osc.stop(time + 0.08);
      this.activeOscillators.add(osc);
      setTimeout(() => { if (this.activeOscillators) this.activeOscillators.delete(osc); }, 120);
    } catch (e) {}
  }

  synthDrumSnare(time, punch = 0.8) {
    if (!this.ctx) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(90, time + 0.06);
      oscGain.gain.setValueAtTime(0.35 * punch, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      osc.connect(oscGain);
      oscGain.connect(target);
      osc.start(time);
      osc.stop(time + 0.08);

      const bufSize = Math.floor(this.ctx.sampleRate * 0.08);
      const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.022));
      }
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900, time);
      filter.Q.setValueAtTime(2.2, time);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38 * punch, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      noiseSrc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(target);
      noiseSrc.start(time);
      noiseSrc.stop(time + 0.09);

      this.activeOscillators.add(osc);
      this.activeSources.add(noiseSrc);
      setTimeout(() => {
        if (this.activeOscillators) this.activeOscillators.delete(osc);
        if (this.activeSources) this.activeSources.delete(noiseSrc);
      }, 150);
    } catch (e) {}
  }

  synthHiHat(time, open = false, volume = 0.20) {
    if (!this.ctx) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, time);
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, time);
      const dur = open ? 0.07 : 0.022;
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(target);
      osc.start(time);
      osc.stop(time + dur + 0.005);
      this.activeOscillators.add(osc);
      setTimeout(() => { if (this.activeOscillators) this.activeOscillators.delete(osc); }, 100);
    } catch (e) {}
  }

  synthBassNote(freq, time, dur = 0.13, volume = 0.30) {
    if (!this.ctx || !freq || freq <= 0) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + dur);
      filter.Q.setValueAtTime(3.2, time);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(target);
      osc.start(time);
      osc.stop(time + dur + 0.02);
      this.activeOscillators.add(osc);
      setTimeout(() => { if (this.activeOscillators) this.activeOscillators.delete(osc); }, 250);
    } catch (e) {}
  }

  synthLeadPip(freq, time, dur = 0.07, volume = 0.12) {
    if (!this.ctx || !freq || freq <= 0) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(gain);
      gain.connect(target);
      osc.start(time);
      osc.stop(time + dur + 0.01);
      this.activeOscillators.add(osc);
      setTimeout(() => { if (this.activeOscillators) this.activeOscillators.delete(osc); }, 150);
    } catch (e) {}
  }

  synthMarimba(freq, time, dur = 0.18, volume = 0.24) {
    if (!this.ctx || !freq || freq <= 0) return;
    try {
      const target = this.musicGain || this.getOutputNode();
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 3.8, time); // Karakteristik ahşap çekiç harmonik

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(target);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + dur + 0.02);
      osc2.stop(time + dur + 0.02);

      this.activeOscillators.add(osc1);
      this.activeOscillators.add(osc2);
      setTimeout(() => {
        if (this.activeOscillators) {
          this.activeOscillators.delete(osc1);
          this.activeOscillators.delete(osc2);
        }
      }, 250);
    } catch (e) {}
  }

  startPartyBeat() {
    if (this.muted) return;
    if (this.musicTheme === 'none') {
      this.stopPartyBeat();
      return;
    }
    this.stopPartyBeat();
    this.unlockAudio();

    this.musicPlaying = true;
    this.musicStep = 0;

    let bpm = 122;
    if (this.musicTheme === 'party_groove') bpm = this.isUrgent ? 134 : 122;
    else if (this.musicTheme === 'tv_quiz') bpm = this.isUrgent ? 124 : 110;
    else if (this.musicTheme === 'suspense') bpm = 84;
    else if (this.musicTheme === 'ticking_clock') bpm = 90;
    else if (this.musicTheme === 'noir_mystery') bpm = 76;
    else if (this.musicTheme === 'minimal_drone') bpm = 68;

    const stepMs = Math.round((60000 / bpm) / 4);

    // Kıpır Kıpır Parti Bas Dizisi (A Minör Funk Akışı - 32 adım / 2 bar)
    const partyBass = [
      55.00, 0, 0, 55.00, 0, 0, 65.41, 0, 73.42, 0, 0, 73.42, 0, 0, 82.41, 0,
      55.00, 0, 0, 55.00, 0, 0, 98.00, 0, 82.41, 0, 73.42, 0, 65.41, 0, 61.74, 0
    ];
    // Parti Melodi Çalımı (Off-beat Akor/Puan Işıltısı)
    const partyLead = [
      0, 0, 523.25, 0, 0, 0, 659.25, 0, 0, 0, 587.33, 0, 0, 0, 783.99, 0,
      0, 0, 659.25, 0, 0, 0, 783.99, 0, 0, 0, 880.00, 0, 0, 0, 659.25, 0
    ];

    // TV Yarışması Marimba Tansiyon Motifi (16 adım döngü)
    const tvMarimba = [
      293.66, 0, 349.23, 0, 415.30, 0, 392.00, 0,
      293.66, 0, 349.23, 0, 466.16, 0, 440.00, 0
    ];

    // Dedektif Noir Bas
    const noirNotes = [73.42, 0, 0, 0, 87.31, 0, 0, 0, 82.41, 0, 0, 0, 73.42, 0, 58.27, 55.00];

    this.musicTimer = setInterval(() => {
      if (!this.musicPlaying || this.muted) return;
      const step16 = this.musicStep % 16;
      const step32 = this.musicStep % 32;
      const now = this.ctx ? this.ctx.currentTime : 0;
      const target = this.musicGain || this.getOutputNode();

      if (this.musicTheme === 'party_groove') {
        // 🎉 1. KIPIR KIPIR PARTİ (Canlı Davul, Akıcı Bas & Eğlenceli Disco Synth)
        // Dört Dörtlük Kick
        if (step16 === 0 || step16 === 4 || step16 === 8 || step16 === 12) {
          this.synthDrumKick(now, (step16 === 0 || step16 === 8) ? 1.05 : 0.9);
        }
        // Snare / Alkış
        if (step16 === 4 || step16 === 12) {
          this.synthDrumSnare(now, 0.95);
        }
        // Hi-Hat (Normalde 2, 6, 10, 14; Panikte her tekli adımda coşar)
        if (step16 === 2 || step16 === 6 || step16 === 10 || step16 === 14) {
          this.synthHiHat(now, false, 0.22);
        } else if (this.isUrgent && (step16 % 2 === 1)) {
          this.synthHiHat(now, false, 0.16);
        }

        // Bas Groove
        const bFreq = partyBass[step32];
        if (bFreq && bFreq > 0) {
          this.synthBassNote(bFreq, now, this.isUrgent ? 0.09 : 0.13, this.isUrgent ? 0.36 : 0.30);
        }
        // Melodi İğnesi
        const lFreq = partyLead[step32];
        if (lFreq && lFreq > 0) {
          this.synthLeadPip(lFreq, now, 0.065, 0.10);
        }

      } else if (this.musicTheme === 'tv_quiz') {
        // 📺 2. TV STÜDYO & YARIŞMA (Gerilimli Marimba & Stüdyo Nabzı)
        // Stüdyo Saati Tıkı
        if (step16 % 4 === 0) {
          this.synthHiHat(now, false, 0.18);
        }
        // Kalp Nabzı
        if (step16 === 0 || step16 === 8) {
          this.synthDrumKick(now, 0.7);
        }
        // Marimba Tansiyon Motifi
        const mFreq = tvMarimba[step16];
        if (mFreq && mFreq > 0) {
          this.synthMarimba(this.isUrgent ? mFreq * 1.5 : mFreq, now, 0.15, this.isUrgent ? 0.28 : 0.22);
        }

      } else if (this.musicTheme === 'suspense') {
        // 💓 3. KALP ATIŞI NABZI (Derin Lub-Dub Nabzı)
        if (step16 === 0 || step16 === 2) {
          const isFirst = (step16 === 0);
          this.playBuffer('tick', isFirst ? 0.35 : 0.22, isFirst ? 0.65 : 0.60);
          if (this.ctx) {
            try {
              const subOsc = this.ctx.createOscillator();
              const subGain = this.ctx.createGain();
              subOsc.type = 'sine';
              subOsc.frequency.setValueAtTime(isFirst ? 52 : 46, now);
              subGain.gain.setValueAtTime(isFirst ? 0.28 : 0.18, now);
              subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
              subOsc.connect(subGain);
              subGain.connect(target);
              this.activeOscillators.add(subOsc);
              subOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(subOsc); };
              subOsc.start(now);
              subOsc.stop(now + 0.15);
            } catch (e) {}
          }
        } else if (step16 === 8) {
          this.playBuffer('tick', 0.18, 1.15);
        }

      } else if (this.musicTheme === 'ticking_clock') {
        // ⏱️ 4. YARIŞMA SAYACI (Tik-Tak Tansiyon)
        if (step16 % 4 === 0) {
          this.playBuffer('tick', 0.32, 1.1);
        } else if (step16 % 4 === 2) {
          this.playBuffer('tick', 0.18, 0.95);
        }
        if (step16 === 0 && (this.musicStep % 32 === 0) && this.ctx) {
          try {
            const padOsc = this.ctx.createOscillator();
            const padGain = this.ctx.createGain();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(65.41, now);
            padGain.gain.setValueAtTime(0.001, now);
            padGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            padOsc.connect(padGain);
            padGain.connect(target);
            this.activeOscillators.add(padOsc);
            padOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(padOsc); };
            padOsc.start(now);
            padOsc.stop(now + 0.95);
          } catch (e) {}
        }

      } else if (this.musicTheme === 'noir_mystery') {
        // 🕵️ 5. GİZEM & DEDEKTİF (Ağır Caz Bası)
        const note = noirNotes[step16];
        if (note && note > 0 && this.ctx) {
          try {
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'triangle';
            bOsc.frequency.setValueAtTime(note, now);
            bGain.gain.setValueAtTime(0.20, now);
            bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            bOsc.connect(bGain);
            bGain.connect(target);
            this.activeOscillators.add(bOsc);
            bOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(bOsc); };
            bOsc.start(now);
            bOsc.stop(now + 0.30);
          } catch (e) {}
        }
        if (step16 === 0 || step16 === 8) {
          this.playBuffer('tick', 0.2, 0.85);
        }

      } else if (this.musicTheme === 'minimal_drone') {
        // 🌌 6. SİNEMATİK ODAKLANMA (Derin Drone)
        if (step16 === 0 && this.ctx) {
          try {
            const dOsc = this.ctx.createOscillator();
            const dGain = this.ctx.createGain();
            dOsc.type = 'sine';
            dOsc.frequency.setValueAtTime(73.42, now);
            dGain.gain.setValueAtTime(0.001, now);
            dGain.gain.linearRampToValueAtTime(0.09, now + 0.4);
            dGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            dOsc.connect(dGain);
            dGain.connect(target);
            this.activeOscillators.add(dOsc);
            dOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(dOsc); };
            dOsc.start(now);
            dOsc.stop(now + 1.25);
          } catch (e) {}
        }
        if (step16 === 0 || step16 === 8) {
          this.playBuffer('tick', 0.15, 1.2);
        }
      }

      this.musicStep++;
    }, stepMs);
  }

  stopPartyBeat() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.activeOscillators) {
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop(0);
          osc.disconnect();
        } catch (e) {}
      });
      this.activeOscillators.clear();
    }
  }

  stopMusic() {
    this.stopPartyBeat();
  }

  startMusic() {
    this.startPartyBeat();
  }

  playClick(soft = false) {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(12);

    // 1. Sıfır Gecikmeli Web Audio Profesyonel Doğal Haptic Klik Sentezi (Tok & Organik Tap)
    if (this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const target = this.getOutputNode();

        // Bileşen 1: Yüksek Frekanslı Geçici Vuruş (Mekanik Transient Click: 1600-2400Hz)
        const oscHigh = this.ctx.createOscillator();
        const gainHigh = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.Q.setValueAtTime(3.0, now);

        oscHigh.type = 'triangle';
        oscHigh.frequency.setValueAtTime(soft ? 1400 : 1850, now);
        oscHigh.frequency.exponentialRampToValueAtTime(300, now + 0.015);

        gainHigh.gain.setValueAtTime(soft ? 0.20 : 0.30, now);
        gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

        oscHigh.connect(filter);
        filter.connect(gainHigh);
        gainHigh.connect(target);

        // Bileşen 2: Tok ve Sıcak Ahşap/Gövde Rezonansı (Tok Alt Rezonans: 550Hz -> 180Hz)
        const oscBody = this.ctx.createOscillator();
        const gainBody = this.ctx.createGain();

        oscBody.type = 'sine';
        oscBody.frequency.setValueAtTime(soft ? 420 : 540, now);
        oscBody.frequency.exponentialRampToValueAtTime(160, now + 0.022);

        gainBody.gain.setValueAtTime(soft ? 0.22 : 0.35, now);
        gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

        oscBody.connect(gainBody);
        gainBody.connect(target);

        oscHigh.start(now);
        oscBody.start(now);
        oscHigh.stop(now + 0.02);
        oscBody.stop(now + 0.03);

        this.activeOscillators.add(oscHigh);
        this.activeOscillators.add(oscBody);
        setTimeout(() => {
          if (this.activeOscillators) {
            this.activeOscillators.delete(oscHigh);
            this.activeOscillators.delete(oscBody);
          }
        }, 50);
        return;
      } catch (e) {}
    }

    // Yedek Tampon
    this.playBuffer('tick', 0.45, 1.5);
  }

  playSwipe() {
    this.playBuffer('slide', 0.5, 1.3);
    this.vibrate(20);
  }

  playSpin() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([30, 20, 30, 20, 40]);
    this.playBuffer('drumroll', 0.7, 1.4);
  }

  playFanfare() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([50, 40, 100, 40, 200]);
    if (!this.playBuffer('triangle', 0.95)) {
      this.playBuffer('bell', 0.9);
    }
    const t = setTimeout(() => {
      this.playBuffer('cheer', 0.85, 1.0, 2.0);
    }, 200);
    this.pendingTimeouts.push(t);
  }

  playExplosion() {
    this.playBombExplosion();
  }

  playChime() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(20);
    // Kısa, tatlı ve uzamayan 0.45s çan sesi (uzun tınlama yok)
    if (!this.playBuffer('bell', 0.65, 1.35, 0.45)) {
      this.playBuffer('triangle', 0.65, 1.2, 0.4);
    }
  }

  playError() {
    this.playPass();
  }

  testAllSounds(onStepChange = null, onFinish = null) {
    this.stopAll();
    this.unlockAudio();

    const sequence = [
      { name: '🟢 Doğru', fn: () => this.playCorrect(), delay: 0 },
      { name: '🔴 Pas', fn: () => this.playPass(), delay: 700 },
      { name: '⏱️ Tik-Tak', fn: () => this.playTick(true), delay: 1400 },
      { name: '⏳ Geri Sayım', fn: () => this.playCountdownBeep(true), delay: 2100 },
      { name: '🔔 Boks Zili', fn: () => this.playBell(), delay: 2800 },
      { name: '👏 Coşkulu Alkış', fn: () => this.playApplause(), delay: 3500 }
    ];

    sequence.forEach((item, index) => {
      const t = setTimeout(() => {
        item.fn();
        if (typeof onStepChange === 'function') {
          onStepChange(item.name, index, sequence.length);
        }
        if (index === sequence.length - 1) {
          const tEnd = setTimeout(() => {
            if (typeof onFinish === 'function') onFinish();
          }, 3100);
          this.pendingTimeouts.push(tEnd);
        }
      }, item.delay);
      this.pendingTimeouts.push(t);
    });
  }

  // --- Güvenli & Zengin Sentez Fallback Metotları ---
  fallbackChime() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const target = this.getOutputNode();
      // Kristal Sihirli Zil / Glockenspiel (C6, E6, G6, C7 yükselen kutlama akoru)
      const freqs = [1046.50, 1318.51, 1567.98, 2093.00];
      freqs.forEach((f, i) => {
        const t = now + i * 0.045;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(f, t);

        // Kristal parıltı için 2x harmonik
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(f * 2, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.55, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(target);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.40);
        osc2.stop(t + 0.40);

        this.activeOscillators.add(osc1);
        this.activeOscillators.add(osc2);
        setTimeout(() => {
          if (this.activeOscillators) {
            this.activeOscillators.delete(osc1);
            this.activeOscillators.delete(osc2);
          }
        }, 500);
      });
    } catch (e) {}
  }

  fallbackBoing() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const target = this.getOutputNode();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.60, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(target);

      osc.start(now);
      osc.stop(now + 0.24);

      this.activeOscillators.add(osc);
      setTimeout(() => {
        if (this.activeOscillators) this.activeOscillators.delete(osc);
      }, 300);
    } catch (e) {}
  }

  fallbackApplause(sampleKey = 'applause') {
    try {
      const src = sampleKey && sampleKey.startsWith('ornek')
        ? `assets/sounds/samples/${sampleKey}.wav`
        : 'assets/sounds/applause.wav';
      const audio = new Audio(src);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}
  }
}

// =========================================================================
// Türkçe Komik Spiker Motoru (Kullanıcı İsteğiyle Tamamen Devre Dışı)
// =========================================================================
class AnnouncerEngine {
  constructor() {
    this.enabled = false;
  }
  initVoice() {}
  setEnabled() { this.enabled = false; }
  unlockAudio() {}
  stop() {}
  async speak() {}
  cheerCorrect() {}
  cheerPass() {}
  announceRemainingSeconds() {}
}

export const sounds = new SoundEngine();
export const announcer = new AnnouncerEngine();
