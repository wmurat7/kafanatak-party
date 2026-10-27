const fs = require('fs');
const path = require('path');

// Generates a 2.6-second realistic crowd applause stereo WAV file (44.1kHz 16-bit PCM)
function generateApplauseWav() {
  const sampleRate = 44100;
  const duration = 2.6;
  const numSamples = Math.floor(sampleRate * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // 1. Generate dense individual hand claps with stochastic timing & crescendo/decrescendo
  const numClaps = 160;
  for (let i = 0; i < numClaps; i++) {
    // Non-linear timing distribution (crescendo peak around 0.6s - 1.6s, then natural fade)
    const t = Math.random() * (duration - 0.25);
    
    // Overall envelope
    let env = 1.0;
    if (t < 0.5) env = 0.3 + 0.7 * (t / 0.5);
    else if (t > 1.6) env = Math.max(0, 1.0 - (t - 1.6) / 0.9);

    const pan = (Math.random() - 0.5) * 1.6; // Stereo panning
    const leftGain = Math.max(0, Math.min(1, 1 - pan)) * env;
    const rightGain = Math.max(0, Math.min(1, 1 + pan)) * env;

    const clapIntensity = (0.35 + Math.random() * 0.55);
    const startIdx = Math.floor(t * sampleRate);
    const clapLen = Math.floor((0.018 + Math.random() * 0.025) * sampleRate);

    // Resonant filtered noise pulse for each hand clap
    let lastNoise = 0;
    const filterFreq = 1100 + Math.random() * 900; // 1100Hz - 2000Hz resonant hand-pop
    const alpha = 2 * Math.PI * (filterFreq / sampleRate);

    for (let s = 0; s < clapLen && (startIdx + s) < numSamples; s++) {
      const decay = Math.exp(-s / (sampleRate * 0.006));
      const white = (Math.random() * 2 - 1);
      lastNoise += alpha * (white - lastNoise); // simple 1-pole bandpass
      const amp = lastNoise * decay * clapIntensity;

      left[startIdx + s] += amp * leftGain;
      right[startIdx + s] += amp * rightGain;
    }
  }

  // 2. Add subtle cheering ambience undertone (stadium / crowd roar)
  let roarL = 0, roarR = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let cheerEnv = 0;
    if (t < 0.7) cheerEnv = 0.2 * (t / 0.7);
    else if (t < 1.8) cheerEnv = 0.2;
    else cheerEnv = Math.max(0, 0.2 * (1 - (t - 1.8) / 0.8));

    const nL = (Math.random() * 2 - 1);
    const nR = (Math.random() * 2 - 1);
    roarL += 0.08 * (nL - roarL);
    roarR += 0.08 * (nR - roarR);

    left[i] += roarL * cheerEnv * 0.45;
    right[i] += roarR * cheerEnv * 0.45;
  }

  // 3. Peak normalization
  let maxPeak = 0;
  for (let i = 0; i < numSamples; i++) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > maxPeak) maxPeak = absL;
    if (absR > maxPeak) maxPeak = absR;
  }

  const normFactor = maxPeak > 0 ? (0.92 / maxPeak) : 1;

  // 4. Encode to 16-bit Stereo PCM WAV
  const byteRate = sampleRate * 2 * 2; // 44100 * 2 channels * 2 bytes
  const blockAlign = 4;
  const subChunk2Size = numSamples * 4;
  const chunkSize = 36 + subChunk2Size;

  const buffer = Buffer.alloc(44 + subChunk2Size);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(2, 22);  // NumChannels (2 = Stereo)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(subChunk2Size, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sampleL = Math.max(-1, Math.min(1, left[i] * normFactor));
    let intL = sampleL < 0 ? Math.floor(sampleL * 32768) : Math.floor(sampleL * 32767);
    buffer.writeInt16LE(intL, offset);
    offset += 2;

    // Right channel
    let sampleR = Math.max(-1, Math.min(1, right[i] * normFactor));
    let intR = sampleR < 0 ? Math.floor(sampleR * 32768) : Math.floor(sampleR * 32767);
    buffer.writeInt16LE(intR, offset);
    offset += 2;
  }

  return buffer;
}

const wavBuffer = generateApplauseWav();
const targets = [
  path.join(__dirname, '..', 'assets', 'sounds', 'applause.wav'),
  path.join(__dirname, '..', 'www', 'assets', 'sounds', 'applause.wav'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'sounds', 'applause.wav')
];

for (const target of targets) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, wavBuffer);
  console.log(`✓ Generated ${target} (${wavBuffer.length} bytes)`);
}
