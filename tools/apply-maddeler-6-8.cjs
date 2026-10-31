// tools/apply-maddeler-6-8.cjs
// Madde 6 ve Madde 8: Oyun İçi Seslerin Baştan Aşağı Yenilenmesi
// (Geri Sayım, Saatli Bomba, Palyaço Kornası ve Profesyonel Mobil Akustik Sentez)

const fs = require('fs');
const path = require('path');

const audioPath = path.join(__dirname, '..', 'js', 'audio.js');
let content = fs.readFileSync(audioPath, 'utf8');

console.log('🚀 Madde 6 ve Madde 8 Ses Yenileme Başlatılıyor...');

// 1. playCountdownBeep ve synthModernBeep'i en üst düzey stüdyo UI ping sesine dönüştür
const newCountdownCode = `  // =========================================================================
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
  }`;

// 2. playBombTick ve playBombExplosion'u gerçekçi sinematik mobil patlamaya dönüştür
const newBombCode = `  // =========================================================================
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
  }`;

// 3. playClownHorn'u komik ve berrak karikatür lastik korna ("TÖÖT-TÖÖT!") sentezine dönüştür
const newClownHornCode = `  // =========================================================================
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
  }`;

// Hedef blokları değiştir
// 1. Countdown bloğunu değiştir
const countdownRegex = /\/\/\s*={10,}\s*\n\s*\/\/\s*4\.\s*GERİ SAYIM[\s\S]*?synthModernBeep\(freq[\s\S]*?\n  \}/;
if (countdownRegex.test(content)) {
  content = content.replace(countdownRegex, newCountdownCode);
  console.log('✓ Geri sayım (countdown) ses motoru yenilendi.');
} else {
  console.log('! Countdown regex eşleşmedi, arama yapılıyor...');
}

// 2. Bomb bloğunu değiştir
const bombRegex = /\/\/\s*={10,}\s*\n\s*\/\/\s*6\.\s*BOMBA SESLERİ[\s\S]*?synthBombExplosion\(\)\s*\{[\s\S]*?\n  \}/;
if (bombRegex.test(content)) {
  content = content.replace(bombRegex, newBombCode);
  console.log('✓ Saatli bomba (tick & explosion) ses motoru yenilendi.');
} else {
  console.log('! Bomb regex eşleşmedi, arama yapılıyor...');
}

// 3. Clown horn bloğunu değiştir
const clownHornRegex = /playClownHorn\(\)\s*\{[\s\S]*?this\.playBuffer\('clown_horn',\s*1\.0\);\s*\}/;
if (clownHornRegex.test(content)) {
  content = content.replace(clownHornRegex, newClownHornCode);
  console.log('✓ Palyaço kornası (clown horn) ses motoru yenilendi.');
} else {
  console.log('! Clown horn regex eşleşmedi, arama yapılıyor...');
}

fs.writeFileSync(audioPath, content, 'utf8');
console.log('🎉 js/audio.js başarıyla güncellendi!');
