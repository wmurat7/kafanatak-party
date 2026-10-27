const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const samplesDir = path.join(__dirname, '..', 'assets', 'sounds', 'samples');
const scratchDir = path.join(__dirname, '..', 'scratch');
if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const list = [
  {
    id: 1,
    name: 'ornek1_parti_hurray',
    desc: '🎉 Genç & Enerjik Parti Alkışı (Tezahüratlı, sevinç çığlıklı, samimi arkadaş grubu havasında)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Clapping_hurray.ogg',
    ss: '0.0',
    t: '3.2',
    vol: '2.0'
  },
  {
    id: 2,
    name: 'ornek2_tiyatro_salonu',
    desc: '🏛️ Büyük Tiyatro & Salon Alkışı (Geniş kitle, homojen, tok ve sürekli el çırpışı)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Applause.ogg',
    ss: '2.0',
    t: '3.2',
    vol: '2.2'
  },
  {
    id: 3,
    name: 'ornek3_tv_yarismasi',
    desc: '📺 TV Yarışması & Stüdyo Seyircisi (Hızlı başlayan, tempolu ve ritmik stüdyo alkışı)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Applause_ii.ogg',
    ss: '0.5',
    t: '3.2',
    vol: '2.4'
  },
  {
    id: 4,
    name: 'ornek4_samimi_topluluk',
    desc: '👏 Samimi Oda & Küçük Grup Alkışı (Bireysel el şaklamaları belirgin, sıcak, doğal ve abartısız)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Applause-2.ogg',
    ss: '1.2',
    t: '3.2',
    vol: '2.5'
  },
  {
    id: 5,
    name: 'ornek5_zafer_islikli',
    desc: '🏆 Büyük Zafer & Islıklı Festival Coşkusu (Islıklar, bravo nidaları ve yüksek enerjili zafer alkışı)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Applaus_en_juichen_in_de_Kleine_Doelenzaal_-_SoundCloud_-_Beeld_en_Geluid.ogg',
    ss: '12.0',
    t: '3.2',
    vol: '2.2'
  }
];

async function processAll() {
  for (const s of list) {
    const rawDest = path.join(scratchDir, s.name + '_raw.ogg');
    const outWav = path.join(samplesDir, s.name + '.wav');
    const outOgg = path.join(samplesDir, s.name + '.ogg');

    if (!fs.existsSync(rawDest) || fs.statSync(rawDest).size < 1000) {
      console.log(`Downloading ${s.name} from Wikimedia Commons...`);
      const res = await fetch(s.url, { headers: { 'User-Agent': 'KafanaTak/1.0 (wmuraterbas@gmail.com)' } });
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(rawDest, buf);
      console.log(`Downloaded ${s.name}: ${buf.length} bytes`);
    }

    console.log(`Cutting and mastering ${s.name}...`);
    const filter = `afade=t=in:ss=0:d=0.06,afade=t=out:st=2.5:d=0.7,volume=${s.vol}`;
    execSync(`ffmpeg -y -ss ${s.ss} -t ${s.t} -i "${rawDest}" -af "${filter}" -ac 2 -ar 44100 "${outWav}"`, { stdio: 'ignore' });
    execSync(`ffmpeg -y -i "${outWav}" -c:a libvorbis -q:a 6 "${outOgg}"`, { stdio: 'ignore' });
    console.log(`✓ Generated ${s.name} (WAV: ${fs.statSync(outWav).size} bytes, OGG: ${fs.statSync(outOgg).size} bytes)`);
  }

  // Also sync to www/assets/sounds/samples/ and android assets
  const targetDirs = [
    path.join(__dirname, '..', 'www', 'assets', 'sounds', 'samples'),
    path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'sounds', 'samples')
  ];

  for (const targetDir of targetDirs) {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    for (const s of list) {
      fs.copyFileSync(path.join(samplesDir, s.name + '.wav'), path.join(targetDir, s.name + '.wav'));
      fs.copyFileSync(path.join(samplesDir, s.name + '.ogg'), path.join(targetDir, s.name + '.ogg'));
    }
  }

  console.log('All 5 samples successfully prepared and synchronized!');
}

processAll().catch(console.error);
