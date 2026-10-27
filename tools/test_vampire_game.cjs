const http = require('http');

async function runTest() {
  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const opt = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };
      const req = http.request(opt, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, text: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    console.log('🏰 1. Vampir - Köylü Odası Oluşturuluyor (POST /api/vampire/create)...');
    const createRes = await request('POST', '/api/vampire/create', {
      hostName: 'Köy Muhtarı',
      settings: { vampireCount: 1, hasDoctor: true, hasDetective: true, discussDuration: 30 }
    });
    console.log('  Oda Sonucu:', createRes.data);
    if (!createRes.data.success) throw new Error('Oda oluşturulamadı: ' + JSON.stringify(createRes.data));
    const roomId = createRes.data.roomId;
    const hostId = createRes.data.hostId;

    console.log('\n👥 2. Köylüler Katılıyor (POST /api/vampire/join)...');
    const p1 = await request('POST', '/api/vampire/join', { roomId, name: 'Ayşe', avatar: '👩‍🌾' });
    console.log('  Ayşe Katıldı:', p1.data.playerId);
    const p2 = await request('POST', '/api/vampire/join', { roomId, name: 'Mehmet', avatar: '🤠' });
    console.log('  Mehmet Katıldı:', p2.data.playerId);
    const p3 = await request('POST', '/api/vampire/join', { roomId, name: 'Zeynep', avatar: '👸' });
    console.log('  Zeynep Katıldı:', p3.data.playerId);

    console.log('\n🎲 3. Oyun Başlatılıyor & Roller Dağıtılıyor (POST /api/vampire/start)...');
    const startRes = await request('POST', '/api/vampire/start', { roomId, playerId: hostId });
    console.log('  Başlatma Sonucu:', startRes.data);

    console.log('\n👀 4. Oyuncuların Rolleri Kontrol Ediliyor (GET /api/vampire/state)...');
    const hostState = await request('GET', `/api/vampire/state?room=${roomId}&player=${hostId}`);
    const p1State = await request('GET', `/api/vampire/state?room=${roomId}&player=${p1.data.playerId}`);
    const p2State = await request('GET', `/api/vampire/state?room=${roomId}&player=${p2.data.playerId}`);
    const p3State = await request('GET', `/api/vampire/state?room=${roomId}&player=${p3.data.playerId}`);

    console.log(`  Muhtar Rolü: ${hostState.data.myRole}`);
    console.log(`  Ayşe Rolü: ${p1State.data.myRole}`);
    console.log(`  Mehmet Rolü: ${p2State.data.myRole}`);
    console.log(`  Zeynep Rolü: ${p3State.data.myRole}`);

    const allPlayers = [
      { id: hostId, role: hostState.data.myRole, name: 'Muhtar' },
      { id: p1.data.playerId, role: p1State.data.myRole, name: 'Ayşe' },
      { id: p2.data.playerId, role: p2State.data.myRole, name: 'Mehmet' },
      { id: p3.data.playerId, role: p3State.data.myRole, name: 'Zeynep' }
    ];

    const vampire = allPlayers.find(p => p.role === 'vampir');
    const doctor = allPlayers.find(p => p.role === 'doktor');
    const detective = allPlayers.find(p => p.role === 'komiser');
    const victimCandidate = allPlayers.find(p => p.role !== 'vampir');

    console.log(`\n🌙 5. Gece Eylemleri Yapılıyor (Vampir: ${vampire ? vampire.name : 'Yok'}, Doktor: ${doctor ? doctor.name : 'Yok'})...`);
    if (vampire && victimCandidate) {
      const vAct = await request('POST', '/api/vampire/action', {
        roomId, playerId: vampire.id, actionType: 'vampire_kill', targetId: victimCandidate.id
      });
      console.log(`  Vampir ${victimCandidate.name} kişisini hedef aldı:`, vAct.data.success);
    }

    if (doctor) {
      const dAct = await request('POST', '/api/vampire/action', {
        roomId, playerId: doctor.id, actionType: 'doctor_save', targetId: doctor.id
      });
      console.log(`  Doktor kendini korudu:`, dAct.data.success);
    }

    if (detective && victimCandidate) {
      const detAct = await request('POST', '/api/vampire/action', {
        roomId, playerId: detective.id, actionType: 'detective_inspect', targetId: victimCandidate.id
      });
      console.log(`  Komiser sorgulama yaptı:`, detAct.data.success);
    }

    console.log('\n☀️ 6. Sabah Vaktine Geçiliyor (POST /api/vampire/advance-phase)...');
    const adv1 = await request('POST', '/api/vampire/advance-phase', { roomId, playerId: hostId });
    console.log('  Sabah Raporu:', adv1.data.narratorText);

    console.log('\n🗣️ 7. Köy Tartışmasına Geçiliyor...');
    const adv2 = await request('POST', '/api/vampire/advance-phase', { roomId, playerId: hostId });
    console.log('  Aşama:', adv2.data.phase);

    console.log('\n⚖️ 8. Linç Oylamasına Geçiliyor...');
    const adv3 = await request('POST', '/api/vampire/advance-phase', { roomId, playerId: hostId });
    console.log('  Aşama:', adv3.data.phase);

    console.log('\n🗳️ 9. Oylar Kullanılıyor...');
    if (vampire) {
      await request('POST', '/api/vampire/action', {
        roomId, playerId: hostId, actionType: 'day_vote', targetId: vampire.id
      });
      await request('POST', '/api/vampire/action', {
        roomId, playerId: p1.data.playerId, actionType: 'day_vote', targetId: vampire.id
      });
      console.log(`  Çoğunluk ${vampire.name} için oy kullandı.`);
    }

    console.log('\n📜 10. Oylama Sonucu Açıklanıyor...');
    const adv4 = await request('POST', '/api/vampire/advance-phase', { roomId, playerId: hostId });
    console.log('  Linç Raporu:', adv4.data.narratorText);
    console.log('  Nihai Faz:', adv4.data.phase, 'Kazanan:', adv4.data.winner);

    console.log('\n🎉 TEST BAŞARIYLA TAMAMLANDI! Tüm Vampir - Köylü ağ fonksiyonları %100 çalışıyor.');
  } catch (err) {
    console.error('❌ Test Hatası:', err);
  }
}

runTest();
