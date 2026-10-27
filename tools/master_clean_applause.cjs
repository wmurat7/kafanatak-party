const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratchDir = path.join(__dirname, '..', 'scratch', 'mixkit');
const samplesDir = path.join(__dirname, '..', 'assets', 'sounds', 'samples');

if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });

const list = [
  {
    id: 1,
    name: 'ornek1_net_hizli_studyo',
    source: path.join(scratchDir, 'clapping_fast.mp3'),
    title: '👏 1. Temiz & Hızlı Stüdyo Alkışı',
    tone: 'Sade & Net',
    desc: 'Tamamen stüdyo ortamı, sıfır oda yankısı. El şaklamaları tane tane, hızlı, son derece net ve pürüzsüz.',
    ss: '0.0',
    t: '2.8',
    vol: '2.0',
    eq: 'highpass=f=280,equalizer=f=3400:t=q:w=1.2:g=4,equalizer=f=6000:t=q:w=1.0:g=3'
  },
  {
    id: 2,
    name: 'ornek2_neseli_kucuk_grup',
    source: path.join(scratchDir, 'small_group_cheer.mp3'),
    title: '🎈 2. Neşeli Küçük Grup Kutlaması',
    tone: 'Sevimli & Neşeli',
    desc: 'Tatlı ve neşeli bir sevinç nidası ("Woo/Yay!") ile başlayan, çok sıcak, pozitif ve net el çırpışı.',
    ss: '0.0',
    t: '2.8',
    vol: '2.1',
    eq: 'highpass=f=250,equalizer=f=3200:t=q:w=1.2:g=3.5'
  },
  {
    id: 3,
    name: 'ornek3_kipir_kipir_parti',
    source: path.join(scratchDir, 'animated_small_group.mp3'),
    title: '🎉 3. Kıpır Kıpır Hareketli Parti',
    tone: 'Canlı & Dinamik',
    desc: 'Hızlı, dinamik ve neşeli küçük bir grubun enerjik alkışı. Gürültüden uzak, sade ama coşkulu.',
    ss: '0.2',
    t: '2.8',
    vol: '2.2',
    eq: 'highpass=f=260,equalizer=f=3500:t=q:w=1.2:g=4'
  },
  {
    id: 4,
    name: 'ornek4_ritmik_tempo',
    source: path.join(scratchDir, 'rhythmic_clapping.mp3'),
    title: '🥁 4. Ritmik Parti Temposu',
    tone: 'Ritmik & Eğlenceli',
    desc: 'Kutlama temposunda ritmik ("ta - ta - ta-ta-ta!") el çırpan stüdyo alkışı. Çok net ve oyuncuyu havaya sokan ritim.',
    ss: '0.1',
    t: '2.8',
    vol: '2.3',
    eq: 'highpass=f=280,equalizer=f=3200:t=q:w=1.2:g=4'
  },
  {
    id: 5,
    name: 'ornek5_genc_aydinlik',
    source: path.join(scratchDir, 'small_young_crowd.mp3'),
    title: '✨ 5. Genç & Aydınlık Kutlama',
    tone: 'Ferah & Berrak',
    desc: 'Genç, aydınlık ve pırıl pırıl bir alkış. Tizler canlı, orta frekanslar berrak, aşırı kalabalık uğultusu yok.',
    ss: '0.0',
    t: '2.8',
    vol: '2.0',
    eq: 'highpass=f=300,equalizer=f=3600:t=q:w=1.2:g=4.5'
  }
];

function process() {
  for (const s of list) {
    const outWav = path.join(samplesDir, s.name + '.wav');
    const outOgg = path.join(samplesDir, s.name + '.ogg');

    const filter = `${s.eq},afade=t=in:ss=0:d=0.04,afade=t=out:st=2.2:d=0.6,volume=${s.vol}`;
    console.log(`Processing ${s.name}...`);
    execSync(`ffmpeg -y -ss ${s.ss} -t ${s.t} -i "${s.source}" -af "${filter}" -ac 2 -ar 44100 "${outWav}"`, { stdio: 'ignore' });
    execSync(`ffmpeg -y -i "${outWav}" -c:a libvorbis -q:a 6 "${outOgg}"`, { stdio: 'ignore' });
    console.log(`✓ ${s.name} ready (WAV: ${fs.statSync(outWav).size} bytes)`);
  }

  // Sync to www and android public assets
  const targetDirs = [
    path.join(__dirname, '..', 'www', 'assets', 'sounds', 'samples'),
    path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'sounds', 'samples')
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    for (const s of list) {
      fs.copyFileSync(path.join(samplesDir, s.name + '.wav'), path.join(dir, s.name + '.wav'));
      fs.copyFileSync(path.join(samplesDir, s.name + '.ogg'), path.join(dir, s.name + '.ogg'));
    }
  }

  console.log('All 5 clean, joyful samples mastered and synchronized successfully!');
}

process();
