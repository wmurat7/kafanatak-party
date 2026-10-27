// Kafana Tak! - Profesyonel Stüdyo Audio Engine & Ses Yöneticisi
// Doğal stüdyo kayıtları (WAV/OGG) + Sıfır gecikmeli Web Audio Buffer Cache

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.compressor = null;
    this.masterGain = null;
    this.musicGain = null;
    this.muted = typeof localStorage !== 'undefined' ? (localStorage.getItem('kafanatak_muted') === 'true') : false;
    const validThemes = ['none', 'suspense', 'ticking_clock', 'noir_mystery', 'minimal_drone'];
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('kafanatak_music_theme') : null;
    this.musicTheme = validThemes.includes(savedTheme) ? savedTheme : 'none';
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;

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
  // 2.1. YANLIŞ / BUZZER / ÇARPI SESİ
  // =========================================================================
  playWrong() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([120, 60, 120]);

    if (!this.playBuffer('clown_horn', 0.85) && !this.playBuffer('pass', 0.95)) {
      this.fallbackBoing();
    }
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
  // 4. GERİ SAYIM & BİP (Dijital Sayaç Vurgusu & Çan)
  // =========================================================================
  playCountdownBeep(isFinal = false) {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(isFinal ? [80, 50, 140] : 40);

    if (isFinal) {
      this.playBuffer('triangle', 1.0) || this.playBuffer('bell', 0.85);
    } else {
      this.playBuffer('countdown', 0.95);
    }
  }

  // =========================================================================
  // 5. TUR BİTİŞİ & ŞAMPİYON KUTLAMASI (Kısa ve Orantılı Alkış & Davul)
  // =========================================================================
  playFinish() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([100, 60, 120, 60, 250]);

    this.playBuffer('drumroll', 0.85);
    const t = setTimeout(() => {
      // 1.8s sürer ve son 0.4 saniyede yumuşakça söner
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
  // 6. BOMBA SESLERİ
  // =========================================================================
  playBombTick(remainingSec = 30) {
    if (this.muted) return;
    const rate = Math.min(2.0, Math.max(1.0, 1 + (30 - remainingSec) / 18));
    this.playBuffer('tick', 0.9, rate);
    this.vibrate(remainingSec < 10 ? 40 : 20);
  }

  playBombExplosion() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([150, 50, 200, 50, 400]);

    this.playBuffer('drumroll', 1.0);
    this.playBuffer('clown_horn', 0.9);
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

  playClownHorn() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate(120);
    this.playBuffer('clown_horn', 1.0);
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
    } else {
      this.playApplause();
    }
  }

  playBuzzer() {
    if (this.muted) return;
    this.unlockAudio();
    this.vibrate([60, 40]);
    this.init();
    try {
      const ctx = this.ctx;
      if (!ctx) {
        this.playBuffer('bell', 0.85);
        return;
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.20);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      osc.connect(gain);
      gain.connect(this.masterGain || this.getOutputNode());

      osc.start(now);
      osc.stop(now + 0.22);

      this.activeOscillators.add(osc);
      setTimeout(() => {
        if (this.activeOscillators) this.activeOscillators.delete(osc);
      }, 250);
    } catch (e) {
      this.playBuffer('bell', 0.85);
    }
  }

  playWheelTick() {
    if (this.muted) return;
    this.unlockAudio();
    this.playBuffer('tick', 0.55, 1.35);
  }

  // =========================================================================
  // 8. ARKA PLAN PARTİ RİTMİ (Sakin & Gerilimli Temalar)
  // =========================================================================
  setMusicTheme(theme) {
    this.musicTheme = theme || 'none';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kafanatak_music_theme', this.musicTheme);
    }
    if (this.musicPlaying) {
      this.stopPartyBeat();
      this.startPartyBeat();
    }
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

    let bpm = 84;
    if (this.musicTheme === 'suspense') bpm = 84;
    else if (this.musicTheme === 'ticking_clock') bpm = 90;
    else if (this.musicTheme === 'noir_mystery') bpm = 76;
    else if (this.musicTheme === 'minimal_drone') bpm = 68;

    const stepMs = Math.round((60000 / bpm) / 4);

    // Gizemli Dedektif Bass Notaları (D minör)
    const noirNotes = [73.42, 0, 0, 0, 87.31, 0, 0, 0, 82.41, 0, 0, 0, 73.42, 0, 58.27, 55.00];

    this.musicTimer = setInterval(() => {
      if (!this.musicPlaying || this.muted) return;
      const step = this.musicStep % 16;
      const now = this.ctx ? this.ctx.currentTime : 0;
      const target = this.musicGain || this.getOutputNode();

      if (this.musicTheme === 'suspense') {
        // 💓 Kalp Atışı Nabzı (Sakin ama gerilimi hissettiren derin lub-dub nabzı)
        if (step === 0 || step === 2) {
          const isFirst = (step === 0);
          this.playBuffer('tick', isFirst ? 0.35 : 0.22, isFirst ? 0.65 : 0.60);
          if (this.ctx) {
            try {
              const subOsc = this.ctx.createOscillator();
              const subGain = this.ctx.createGain();
              subOsc.type = 'sine';
              subOsc.frequency.setValueAtTime(isFirst ? 52 : 46, now);
              subGain.gain.setValueAtTime(isFirst ? 0.25 : 0.16, now);
              subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
              subOsc.connect(subGain);
              subGain.connect(target);
              this.activeOscillators.add(subOsc);
              subOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(subOsc); };
              subOsc.start(now);
              subOsc.stop(now + 0.15);
            } catch (e) {}
          }
        } else if (step === 8) {
          this.playBuffer('tick', 0.18, 1.15);
        }
      } else if (this.musicTheme === 'ticking_clock') {
        // ⏱️ Yarışma Sayacı & Tansiyon (Minimalist organik tik-tak ve hafif tansiyon şişmesi)
        if (step % 4 === 0) {
          this.playBuffer('tick', 0.32, 1.1);
        } else if (step % 4 === 2) {
          this.playBuffer('tick', 0.18, 0.95);
        }
        if (step === 0 && (this.musicStep % 32 === 0) && this.ctx) {
          try {
            const padOsc = this.ctx.createOscillator();
            const padGain = this.ctx.createGain();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(65.41, now); // C2
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
        // 🕵️ Gizem & Tekinsiz (Ağır tempolu, sakin caz tınılı gerilim bası)
        const note = noirNotes[step];
        if (note && note > 0 && this.ctx) {
          try {
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'triangle';
            bOsc.frequency.setValueAtTime(note, now);
            bGain.gain.setValueAtTime(0.18, now);
            bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            bOsc.connect(bGain);
            bGain.connect(target);
            this.activeOscillators.add(bOsc);
            bOsc.onended = () => { if (this.activeOscillators) this.activeOscillators.delete(bOsc); };
            bOsc.start(now);
            bOsc.stop(now + 0.30);
          } catch (e) {}
        }
        if (step === 0 || step === 8) {
          this.playBuffer('tick', 0.2, 0.85);
        }
      } else if (this.musicTheme === 'minimal_drone') {
        // 🌌 Sinematik Odaklanma (Sakin, derin ve odaklayıcı ambiyans tansiyonu)
        if (step === 0 && this.ctx) {
          try {
            const dOsc = this.ctx.createOscillator();
            const dGain = this.ctx.createGain();
            dOsc.type = 'sine';
            dOsc.frequency.setValueAtTime(73.42, now); // D2
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
        if (step === 0 || step === 8) {
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

  // --- Güvenli Fallback Metotları ---
  fallbackChime() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [783.99, 987.77, 1318.51, 1567.98].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.getOutputNode());
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {}
  }

  fallbackBoing() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.getOutputNode());
      osc.start(now);
      osc.stop(now + 0.28);
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
