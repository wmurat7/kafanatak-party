// Kafana Tak! - Yerel Test Sunucusu (HTTP + HTTPS Destekli)
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.apk': 'application/vnd.android.package-archive'
};

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const rooms = new Map(); // roomId -> { state, lastUpdated, cheers: [] }
const vampireRooms = new Map(); // roomId -> Vampire Room Game State
const isimSehirRooms = new Map(); // roomId -> Isim Sehir Game State

function generateIsimSehirRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function turkishStartsWith(word, targetLetter) {
  if (!word || typeof word !== 'string') return false;
  const clean = word.trim().toLocaleLowerCase('tr-TR');
  const target = (targetLetter || '').trim().toLocaleLowerCase('tr-TR');
  if (!clean || !target) return false;
  return clean.startsWith(target);
}

const DEFAULT_ISIM_SEHIR_CATEGORIES = [
  { id: 'isim', name: '👤 İsim' },
  { id: 'sehir', name: '🏙️ Şehir / Ülke' },
  { id: 'hayvan', name: '🦁 Hayvan' },
  { id: 'bitki', name: '🌿 Bitki / Meyve' },
  { id: 'esya', name: '📦 Eşya' },
  { id: 'unlu', name: '⭐ Ünlü' }
];

function sanitizeIsimSehirState(room, playerId) {
  const isReviewOrOver = room.phase === 'review' || room.phase === 'round_over';
  const players = room.players.map(p => {
    const isMe = p.id === playerId;
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isHost: !!p.isHost,
      submitted: !!p.submitted,
      roundScore: p.roundScore || 0,
      totalScore: p.totalScore || 0,
      cheatWarnings: p.cheatWarnings || 0,
      hasLeftScreen: !!p.hasLeftScreen,
      isFirstFinisher: p.id === room.firstFinisherId,
      hasPenalty: p.id === room.firstFinisherId && !!room.firstFinisherPenalty,
      answers: (isMe || isReviewOrOver) ? (p.answers || {}) : (p.submitted ? { filled: true } : {})
    };
  });

  return {
    roomId: room.roomId,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    currentLetter: room.currentLetter,
    startedAt: room.startedAt || null,
    roundDuration: room.roundDuration || null,
    endsAt: room.endsAt,
    stoppedBy: room.stoppedBy,
    firstFinisherId: room.firstFinisherId || null,
    firstFinisherName: room.firstFinisherName || null,
    firstFinisherPenalty: !!room.firstFinisherPenalty,
    firstFinisherPenaltyReason: room.firstFinisherPenaltyReason || '',
    penaltyPoints: room.penaltyPoints || 20,
    categories: room.categories || DEFAULT_ISIM_SEHIR_CATEGORIES,
    players,
    lastUpdated: room.lastUpdated
  };
}

function generateVampireRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function assignVampireRoles(players, settings = {}) {
  const total = players.length;
  let vCount = Math.min(Math.max(1, settings.vampireCount || (total >= 7 ? 2 : 1)), Math.floor(total / 2));
  let pool = [];
  for (let i = 0; i < vCount; i++) pool.push('vampir');
  if (settings.hasDoctor !== false && total >= 4) pool.push('doktor');
  if (settings.hasDetective !== false && total >= 5) pool.push('komiser');
  while (pool.length < total) pool.push('koylu');

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return players.map((p, idx) => ({
    ...p,
    role: pool[idx],
    alive: true
  }));
}

function checkVampireWinCondition(room) {
  const aliveVampires = room.players.filter(p => p.alive && p.role === 'vampir').length;
  const aliveVillagers = room.players.filter(p => p.alive && p.role !== 'vampir').length;

  if (aliveVampires === 0) return 'koylu';
  if (aliveVampires >= aliveVillagers) return 'vampir';
  return null;
}

function sanitizeVampireState(room, playerId) {
  const player = room.players.find(p => p.id === playerId);
  const myRole = player ? player.role : null;
  const isHost = player ? !!player.isHost : false;

  const publicPlayers = room.players.map(p => {
    const showRole = (room.phase === 'game_over') || (!p.alive) || (p.id === playerId) || (myRole === 'vampir' && p.role === 'vampir');
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      alive: p.alive,
      isHost: !!p.isHost,
      role: showRole ? p.role : null
    };
  });

  const state = {
    roomId: room.roomId,
    phase: room.phase,
    dayNumber: room.dayNumber,
    winner: room.winner,
    players: publicPlayers,
    myPlayerId: playerId,
    myRole: myRole,
    myAlive: player ? player.alive : false,
    isHost: isHost,
    settings: room.settings,
    lastNightVictim: room.lastNightVictim,
    lastNightSaved: room.lastNightSaved,
    lastEliminated: room.lastEliminated,
    narratorText: room.narratorText,
    votedPlayerIds: Object.keys(room.phase === 'voting' ? (room.dayVotes || {}) : (room.phase === 'night' ? (room.nightActions?.vampireVotes || {}) : {}))
  };

  if (myRole === 'komiser' && room.nightActions && room.nightActions.detectiveResult && room.nightActions.detectiveTargetPlayerId === playerId) {
    state.detectiveResult = room.nightActions.detectiveResult;
  }

  if (myRole === 'vampir') {
    state.vampirePartners = room.players.filter(p => p.alive && p.role === 'vampir' && p.id !== playerId).map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
    state.currentVampireVotes = room.nightActions ? room.nightActions.vampireVotes : {};
  }

  return state;
}

async function handleRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqUrl = urlObj.pathname;

  // Global CORS Headers & Preflight Handling (Capacitor & Wi-Fi Clientlar için)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Sistem Bilgisi (Yerel IP & Portlar)
  if (reqUrl === '/api/system/info') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({
      localIp: getLocalIp(),
      httpPort: HTTP_PORT,
      httpsPort: HTTPS_PORT
    }));
  }

  // API: Seyirci Odası Güncelleme (Host -> Sunucu)
  if (req.method === 'POST' && reqUrl === '/api/room/update') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const roomId = (payload.roomId || 'PARTI').toUpperCase();
        const existing = rooms.get(roomId) || { cheers: [] };
        rooms.set(roomId, {
          ...payload,
          roomId,
          lastUpdated: Date.now(),
          cheers: existing.cheers
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, roomId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Seyirci Odası Durumu Getir (Seyirci -> Sunucu)
  if (req.method === 'GET' && reqUrl === '/api/room/state') {
    const roomId = (urlObj.searchParams.get('room') || 'PARTI').toUpperCase();
    const data = rooms.get(roomId) || { status: 'idle', roomId };
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(data));
  }

  // API: Seyirci Tezahürat Gönder (Seyirci -> Host)
  if (req.method === 'POST' && reqUrl === '/api/room/cheer') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = 'PARTI', cheer = 'applause', sender = 'Seyirci' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase();
        const room = rooms.get(key) || { cheers: [] };
        if (!room.cheers) room.cheers = [];
        room.cheers.push({
          id: Date.now() + Math.random(),
          cheer,
          sender,
          time: Date.now()
        });
        // Sadece son 20 tezahüratı tut
        if (room.cheers.length > 20) room.cheers = room.cheers.slice(-20);
        rooms.set(key, room);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Host Tezahüratları Çekme (Host yeni sesleri çalar ve listeyi boşaltır)
  if (req.method === 'GET' && reqUrl === '/api/room/drain-cheers') {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const roomId = (urlObj.searchParams.get('room') || 'PARTI').toUpperCase();
    const room = rooms.get(roomId);
    const cheers = room && room.cheers ? room.cheers : [];
    if (room) room.cheers = [];
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ cheers }));
  }

  // =========================================
  // VAMPİR - KÖYLÜ OYUNU API ENDPOINT'LERİ
  // =========================================

  // 1. Oda Kurma (Host)
  if (req.method === 'POST' && reqUrl === '/api/vampire/create') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { hostName = 'Köy Muhtarı', avatar = '👑', settings = {} } = JSON.parse(body || '{}');
        const roomId = generateVampireRoomId();
        const hostId = 'host_' + Date.now();
        const room = {
          roomId,
          phase: 'lobby',
          dayNumber: 1,
          winner: null,
          hostId,
          lastUpdated: Date.now(),
          narratorText: 'Köy meydanına hoş geldiniz! Oyuncular bekleniyor...',
          settings: {
            vampireCount: Number(settings.vampireCount) || 2,
            hasDoctor: settings.hasDoctor !== false,
            hasDetective: settings.hasDetective !== false,
            discussDuration: Number(settings.discussDuration) || 60
          },
          players: [
            { id: hostId, name: hostName, avatar, role: null, alive: true, isHost: true }
          ],
          nightActions: {
            vampireVotes: {},
            doctorTarget: null,
            detectiveTargetPlayerId: null,
            detectiveResult: null
          },
          dayVotes: {},
          lastNightVictim: null,
          lastNightSaved: false,
          lastEliminated: null
        };
        vampireRooms.set(roomId, room);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, roomId, hostId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Odaya Katılma (Oyuncu)
  if (req.method === 'POST' && reqUrl === '/api/vampire/join') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', name = 'Köylü', avatar = '🧑‍🌾' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = vampireRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı! Lütfen kodu kontrol edin.' }));
        }
        if (room.phase !== 'lobby') {
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oyun çoktan başladı!' }));
        }
        // İsim benzerliği kontrolü
        let finalName = name.trim();
        const existingCount = room.players.filter(p => p.name === finalName).length;
        if (existingCount > 0) finalName += ` (${existingCount + 1})`;

        const playerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        room.players.push({
          id: playerId,
          name: finalName,
          avatar: avatar || '🧑‍🌾',
          role: null,
          alive: true,
          isHost: false
        });
        room.lastUpdated = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, roomId: key, playerId, name: finalName }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. Oyun Durumunu Çekme (Host & Oyuncu)
  if (req.method === 'GET' && reqUrl === '/api/vampire/state') {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const roomId = (urlObj.searchParams.get('room') || '').toUpperCase().trim();
    const playerId = urlObj.searchParams.get('player') || '';
    const room = vampireRooms.get(roomId);
    if (!room) {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
    }
    const sanitized = sanitizeVampireState(room, playerId);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(sanitized));
  }

  // 4. Oyunu Başlatma & Rolleri Dağıtma (Host)
  if (req.method === 'POST' && reqUrl === '/api/vampire/start') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = vampireRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }
        if (room.hostId !== playerId) {
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Sadece oda kurucu oyunu başlatabilir.' }));
        }
        if (room.players.length < 3) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'En az 3 oyuncu gereklidir!' }));
        }

        room.players = assignVampireRoles(room.players, room.settings);
        room.phase = 'night';
        room.dayNumber = 1;
        room.winner = null;
        room.nightActions = {
          vampireVotes: {},
          doctorTarget: null,
          detectiveTargetPlayerId: null,
          detectiveResult: null
        };
        room.dayVotes = {};
        room.narratorText = 'Gece oldu... Köy halkı derin bir uykuya daldı. Vampirler avlanıyor!';
        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, phase: 'night' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5. Gece veya Gündüz Hamlesi (Oyuncu)
  if (req.method === 'POST' && reqUrl === '/api/vampire/action') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '', actionType = '', targetId = '' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = vampireRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }
        const player = room.players.find(p => p.id === playerId);
        if (!player || !player.alive) {
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Ölü oyuncular hamle yapamaz.' }));
        }

        // Vampir Saldırısı
        if (actionType === 'vampire_kill' && room.phase === 'night' && player.role === 'vampir') {
          room.nightActions.vampireVotes[playerId] = targetId;
        }

        // Doktor Koruması
        if (actionType === 'doctor_save' && room.phase === 'night' && player.role === 'doktor') {
          room.nightActions.doctorTarget = targetId;
        }

        // Komiser Sorgulaması
        if (actionType === 'detective_inspect' && room.phase === 'night' && player.role === 'komiser') {
          const targetPlayer = room.players.find(p => p.id === targetId);
          if (targetPlayer) {
            room.nightActions.detectiveTargetPlayerId = playerId;
            room.nightActions.detectiveResult = {
              targetId: targetPlayer.id,
              targetName: targetPlayer.name,
              isVampire: targetPlayer.role === 'vampir'
            };
          }
        }

        // Gündüz Linç Oylaması
        if (actionType === 'day_vote' && room.phase === 'voting') {
          room.dayVotes[playerId] = targetId;
        }

        room.lastUpdated = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 6. Faz İlerletme (Host / Spiker)
  if (req.method === 'POST' && reqUrl === '/api/vampire/advance-phase') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '', nextPhase = '' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = vampireRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }
        if (room.hostId !== playerId) {
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Sadece host fazı ilerletebilir.' }));
        }

        // GECE -> SABAH RAPORU
        if (room.phase === 'night') {
          // Vampirlerin kurbanını belirle
          const votes = Object.values(room.nightActions.vampireVotes || {});
          let targetCounts = {};
          votes.forEach(tId => { targetCounts[tId] = (targetCounts[tId] || 0) + 1; });
          let chosenVictimId = null;
          let maxVotes = 0;
          for (const [tId, cnt] of Object.entries(targetCounts)) {
            if (cnt > maxVotes) {
              maxVotes = cnt;
              chosenVictimId = tId;
            }
          }

          // Doktor kurtardı mı?
          if (chosenVictimId && chosenVictimId === room.nightActions.doctorTarget) {
            room.lastNightVictim = null;
            room.lastNightSaved = true;
            room.narratorText = 'Güneş doğdu! Doktor bu gece harika bir iş çıkardı, kimse ölmedi!';
          } else if (chosenVictimId) {
            const victim = room.players.find(p => p.id === chosenVictimId);
            if (victim) {
              victim.alive = false;
              room.lastNightVictim = victim.name;
              room.lastNightSaved = false;
              room.narratorText = `Korkunç bir geceydi... Dün gece ${victim.name} vampirler tarafından ısırıldı ve hayatını kaybetti!`;
            }
          } else {
            room.lastNightVictim = null;
            room.lastNightSaved = false;
            room.narratorText = 'Köyde sakin bir gece geçti, kimse yaralanmadı.';
          }

          // Kazanma kontrolü
          const win = checkVampireWinCondition(room);
          if (win) {
            room.phase = 'game_over';
            room.winner = win;
            room.narratorText = win === 'vampir' ? '🧛‍♂️ VAMPİRLER KÖYÜ ELE GEÇİRDİ! VAMPİRLER KAZANDI!' : '🧑‍🌾 TÜM VAMPİRLER YAKALANDI! KÖYLÜLER KAZANDI!';
          } else {
            room.phase = 'day_reveal';
          }
        }
        // SABAH RAPORU -> TARTIŞMA
        else if (room.phase === 'day_reveal') {
          room.phase = 'day_discuss';
          room.narratorText = 'Köy halkı toplanın! Şüphelileri tartışma vakti. Aranızdaki vampirler kim?';
        }
        // TARTIŞMA -> OYLAMA
        else if (room.phase === 'day_discuss') {
          room.phase = 'voting';
          room.dayVotes = {};
          room.narratorText = 'Oylama başladı! Kimi köyden sürmek veya asmak istiyorsunuz? Oylarınızı verin.';
        }
        // OYLAMA -> OYLAMA SONUCU
        else if (room.phase === 'voting') {
          const votes = Object.values(room.dayVotes || {});
          let voteCounts = {};
          votes.forEach(tId => { voteCounts[tId] = (voteCounts[tId] || 0) + 1; });
          let eliminatedId = null;
          let maxVotes = 0;
          let tie = false;
          for (const [tId, cnt] of Object.entries(voteCounts)) {
            if (cnt > maxVotes) {
              maxVotes = cnt;
              eliminatedId = tId;
              tie = false;
            } else if (cnt === maxVotes) {
              tie = true;
            }
          }

          if (eliminatedId && !tie && maxVotes > 0) {
            const eliminated = room.players.find(p => p.id === eliminatedId);
            if (eliminated) {
              eliminated.alive = false;
              room.lastEliminated = { name: eliminated.name, role: eliminated.role };
              room.narratorText = `Köy halkının kararıyla ${eliminated.name} asıldı! Kendisi bir ${eliminated.role === 'vampir' ? 'VAMPİRDİ! 🧛‍♂️' : 'MASUM KÖYLÜYDÜ! 🧑‍🌾'}`;
            }
          } else {
            room.lastEliminated = null;
            room.narratorText = 'Oylar eşit çıktı veya çoğunluk sağlanamadı! Bu tur kimse asılmadı.';
          }

          const win = checkVampireWinCondition(room);
          if (win) {
            room.phase = 'game_over';
            room.winner = win;
            room.narratorText = win === 'vampir' ? '🧛‍♂️ VAMPİRLER KÖYÜ ELE GEÇİRDİ! VAMPİRLER KAZANDI!' : '🧑‍🌾 TÜM VAMPİRLER YAKALANDI! KÖYLÜLER KAZANDI!';
          } else {
            room.phase = 'vote_result';
          }
        }
        // OYLAMA SONUCU -> YENİ GECE
        else if (room.phase === 'vote_result') {
          room.dayNumber++;
          room.phase = 'night';
          room.nightActions = {
            vampireVotes: {},
            doctorTarget: null,
            detectiveTargetPlayerId: null,
            detectiveResult: null
          };
          room.dayVotes = {};
          room.narratorText = `${room.dayNumber}. Gece başladı... Köy halkı tekrar uyusun!`;
        }

        room.lastUpdated = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, phase: room.phase, winner: room.winner, narratorText: room.narratorText }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7. Oyunu Sıfırlama (Lobiye Dönüş)
  if (req.method === 'POST' && reqUrl === '/api/vampire/reset') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = vampireRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }
        if (room.hostId !== playerId) {
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Yetkisiz istek.' }));
        }
        room.phase = 'lobby';
        room.dayNumber = 1;
        room.winner = null;
        room.lastNightVictim = null;
        room.lastNightSaved = false;
        room.lastEliminated = null;
        room.narratorText = 'Köy meydanına hoş geldiniz! Yeni tur için oyuncular bekleniyor.';
        room.players.forEach(p => {
          p.alive = true;
          p.role = null;
        });
        room.lastUpdated = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ==========================================================================
  // İSİM ŞEHİR PARTİSİ (ÇARKLI & ÇOKLU TELEFON) API ENDPOINTS
  // ==========================================================================

  // 1. Oda Oluşturma (Host)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/create') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { hostName = 'Host', hostAvatar = '👑', categories = null } = JSON.parse(body || '{}');
        let roomId = generateIsimSehirRoomId();
        while (isimSehirRooms.has(roomId)) roomId = generateIsimSehirRoomId();

        const hostId = 'host_' + Math.random().toString(36).substring(2, 9);
        const hostPlayer = {
          id: hostId,
          name: hostName,
          avatar: hostAvatar,
          isHost: true,
          answers: {},
          submitted: false,
          roundScore: 0,
          totalScore: 0,
          cheatWarnings: 0,
          hasLeftScreen: false
        };

        const room = {
          roomId,
          hostId,
          phase: 'lobby',
          round: 1,
          currentLetter: '',
          roundDuration: 60,
          endsAt: null,
          stoppedBy: null,
          categories: (Array.isArray(categories) && categories.length >= 2) ? categories : DEFAULT_ISIM_SEHIR_CATEGORIES,
          players: [hostPlayer],
          lastUpdated: Date.now()
        };

        isimSehirRooms.set(roomId, room);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, roomId, hostId, room: sanitizeIsimSehirState(room, hostId) }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Odaya Katılma (Mobile Oyuncular)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/join') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerName = 'Oyuncu', playerAvatar = '🦁' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Bu kodla aktif bir İsim Şehir odası bulunamadı!' }));
        }

        const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
        const newPlayer = {
          id: playerId,
          name: playerName.trim() || 'Misafir',
          avatar: playerAvatar,
          isHost: false,
          answers: {},
          submitted: false,
          roundScore: 0,
          totalScore: 0,
          cheatWarnings: 0,
          hasLeftScreen: false
        };

        room.players.push(newPlayer);
        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, playerId, room: sanitizeIsimSehirState(room, playerId) }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2.1. Kopya / Ekran Terk Olayı Bildirimi (Anti-Cheat Event)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/cheat-event') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '', eventType = 'blur' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);
        if (room) {
          const player = room.players.find(p => p.id === playerId);
          if (player) {
            player.cheatWarnings = (player.cheatWarnings || 0) + 1;
            player.hasLeftScreen = true;
            player.lastCheatAt = Date.now();
            room.lastUpdated = Date.now();
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2.2. Kategori Listesini Güncelleme (Host)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/update-categories') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', hostId = '', categories = [] } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);
        if (room && (room.hostId === hostId || !hostId) && Array.isArray(categories) && categories.length >= 2) {
          room.categories = categories;
          room.lastUpdated = Date.now();
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, categories: room ? room.categories : [] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. Oda Durumunu Sorgulama (Polling)
  if (req.method === 'GET' && reqUrl.startsWith('/api/isim-sehir/state')) {
    const rId = (urlObj.searchParams.get('roomId') || '').toUpperCase().trim();
    const pId = urlObj.searchParams.get('playerId') || '';
    const room = isimSehirRooms.get(rId);

    if (!room) {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
    }

    // Zaman aşımı kontrolü: İlk bitiren sonrası 60 saniyelik son şans süresi dolmuşsa otomatik review fazına geçir
    if (room.phase === 'countdown_1min' && room.endsAt && Date.now() >= room.endsAt) {
      room.phase = 'review';
      room.lastUpdated = Date.now();
    }

    // Eğer geri sayım esnasında tüm oyuncular cevaplarını onayladıysa beklemeden incelemeye geç
    if (room.phase === 'countdown_1min' && room.players.length > 0 && room.players.every(p => p.submitted)) {
      room.phase = 'review';
      room.lastUpdated = Date.now();
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(sanitizeIsimSehirState(room, pId)));
    return;
  }

  // 4. Çarkı Çevir & Turu Başlat (Host - Başta süre YOK!)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/start-spin') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', hostId = '', letter = 'A' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }

        room.currentLetter = letter.toUpperCase().trim();
        room.phase = 'playing'; // BAŞTA SÜRE YOK! İlk bitiren basana kadar serbest yarış
        room.startedAt = Date.now();
        room.endsAt = null;
        room.stoppedBy = null;
        room.firstFinisherId = null;
        room.firstFinisherName = null;
        room.firstFinisherPenalty = false;
        room.firstFinisherPenaltyReason = '';

        // Oyuncuların cevaplarını sıfırla
        room.players.forEach(p => {
          p.answers = {};
          p.submitted = false;
          p.roundScore = 0;
        });

        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, phase: 'playing', currentLetter: room.currentLetter, endsAt: null }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5. Cevap Gönderme / Canlı Taslak Kaydetme (Player / Host)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/submit') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '', answers = {}, markSubmitted = false } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }

        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.answers = { ...answers };
          if (markSubmitted) player.submitted = true;
          room.lastUpdated = Date.now();

          // Geri sayım aşamasındaysa ve herkes submit ettiyse hemen review'e geç
          if (room.phase === 'countdown_1min' && room.players.length > 0 && room.players.every(p => p.submitted)) {
            room.phase = 'review';
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 6. BİTİRDİM! Butonu (İlk bitiren basınca 1 dakikalık son şans sayacı başlar!)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/stop') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerId = '', answers = {} } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }

        const player = room.players.find(p => p.id === playerId);
        if (!player) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oyuncu bulunamadı' }));
        }

        if (answers && typeof answers === 'object') {
          player.answers = { ...answers };
        }
        player.submitted = true;

        // Henüz ilk bitiren yoksa bu oyuncu İLK BİTİREN olur ve 60s başlar!
        if ((room.phase === 'playing' || room.phase === 'countdown_1min') && !room.firstFinisherId) {
          room.firstFinisherId = player.id;
          room.firstFinisherName = player.name;
          room.stoppedBy = player.name;
          room.phase = 'countdown_1min';
          room.endsAt = Date.now() + 60000; // 1 DAKİKA GERİ SAYIM BAŞLADI!

          // Hatalı bitirme kontrolü:
          // Belirlenen kategorilerin tamamı dolu olmalı ve turun harfiyle başlamalıdır!
          const catList = room.categories || DEFAULT_ISIM_SEHIR_CATEGORIES;
          const invalidCats = [];
          for (const catObj of catList) {
            const catKey = typeof catObj === 'string' ? catObj : catObj.id;
            const catLabel = typeof catObj === 'string' ? catObj : catObj.name;
            const val = ((player.answers && player.answers[catKey]) || '').trim();
            if (val.length < 2 || !turkishStartsWith(val, room.currentLetter)) {
              invalidCats.push(catLabel);
            }
          }

          if (invalidCats.length > 0) {
            room.firstFinisherPenalty = true;
            room.firstFinisherPenaltyReason = `Eksik veya "${room.currentLetter}" ile başlamayan kategori: ${invalidCats.join(', ')}`;
          } else {
            room.firstFinisherPenalty = false;
            room.firstFinisherPenaltyReason = '';
          }
        } else if (room.phase === 'countdown_1min') {
          // Geri sayım sürerken diğer bir oyuncu cevaplarını onayladı
          const allDone = room.players.every(p => p.submitted);
          if (allDone) {
            room.phase = 'review';
          }
        }

        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          phase: room.phase,
          stoppedBy: room.stoppedBy,
          firstFinisherName: room.firstFinisherName,
          firstFinisherPenalty: room.firstFinisherPenalty,
          firstFinisherPenaltyReason: room.firstFinisherPenaltyReason,
          endsAt: room.endsAt
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 6.1. Hatalı Bitirme Cezasını Aç / Kapat (Host Manuel Müdahale)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/toggle-penalty') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', penalty = true } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }
        room.firstFinisherPenalty = !!penalty;
        room.lastUpdated = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, firstFinisherPenalty: room.firstFinisherPenalty }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7. Puanları Kaydet & Turu Tamamla (Host)
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/evaluate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '', playerScores = {} } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }

        // Puanları uygula
        for (const [pId, pts] of Object.entries(playerScores)) {
          const p = room.players.find(pl => pl.id === pId);
          if (p) {
            let finalPts = Number(pts) || 0;
            // Eğer ilk bitiren hatalıysa ekstra -20 ceza puanı düş
            if (room.firstFinisherPenalty && p.id === room.firstFinisherId) {
              finalPts -= 20;
            }
            p.roundScore = finalPts;
            p.totalScore = (p.totalScore || 0) + p.roundScore;
          }
        }

        room.phase = 'round_over';
        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, phase: 'round_over' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 8. Sonraki Tura Geçiş
  if (req.method === 'POST' && reqUrl === '/api/isim-sehir/next-round') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { roomId = '' } = JSON.parse(body || '{}');
        const key = roomId.toUpperCase().trim();
        const room = isimSehirRooms.get(key);

        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Oda bulunamadı' }));
        }

        room.round++;
        room.phase = 'lobby';
        room.currentLetter = '';
        room.startedAt = null;
        room.endsAt = null;
        room.stoppedBy = null;
        room.firstFinisherId = null;
        room.firstFinisherName = null;
        room.firstFinisherPenalty = false;
        room.firstFinisherPenaltyReason = '';
        room.players.forEach(p => {
          p.answers = {};
          p.submitted = false;
          p.roundScore = 0;
          p.hasLeftScreen = false;
          p.cheatWarnings = 0;
        });
        room.lastUpdated = Date.now();

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, round: room.round }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Yapay Zeka ile Deste Üretici (Gemini + Ollama)
  if (req.method === 'POST' && reqUrl === '/api/generate-deck') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { theme, count = 30, isTaboo = false, apiKey = '' } = JSON.parse(body || '{}');
        if (!theme) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'Lütfen bir tema giriniz!' }));
        }

        const prompt = `Sen "Kafana Tak!" (Guess Up & Tabu) mobil parti oyunu için uzman bir oyun yazarısın.
Kullanıcı teması: "${theme}"
Bu temaya özel, arkadaş ortamında oynarken çok eğlendirecek, kahkaha attıracak ${count} adet popüler kelime üret.
${isTaboo ? 'ÖNEMLİ: Her kelime için söylenmesi YASAK 3 adet zorlayıcı ve komik kelime belirle. Format örneği: [{"word": "Kelime Adı", "taboo": ["Yasak1", "Yasak2", "Yasak3"]}]' : 'Format örneği: ["Kelime 1", "Kelime 2", "Kelime 3"]'}

SADECE geçerli bir JSON array döndür. Başka hiçbir markdown veya backtick ekleme.`;

        let generatedCards = null;

        // 1. Gemini API Anahtarı varsa doğrudan çağır
        if (apiKey) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const gRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.85, responseMimeType: 'application/json' }
              })
            });

            if (gRes.ok) {
              const data = await gRes.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                generatedCards = JSON.parse(clean);
              }
            }
          } catch (e) {
            console.warn('Gemini çağrı hatası:', e);
          }
        }

        // 2. Ollama Yerel Modelini dene (Ücretsiz & Yerel RTX 4070)
        if (!generatedCards) {
          try {
            const oRes = await fetch('http://127.0.0.1:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'qwen2.5-coder:7b',
                prompt: prompt + '\nReturn ONLY the JSON array.',
                stream: false,
                format: 'json'
              })
            });

            if (oRes.ok) {
              const data = await oRes.json();
              if (data?.response) {
                const clean = data.response.replace(/```json/gi, '').replace(/```/g, '').trim();
                generatedCards = JSON.parse(clean);
              }
            }
          } catch (e) {}
        }

        if (!generatedCards || !Array.isArray(generatedCards)) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'AI deste üretilemedi. Lütfen geçerli bir Gemini API Key girin.' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, theme, cards: generatedCards }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(__dirname, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Bulunamadı');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Sunucu Hatası: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
}

// 1. HTTP Sunucusu (Bilgisayar içi testler için)
const httpServer = http.createServer(handleRequest);
httpServer.listen(HTTP_PORT, '0.0.0.0');

// 2. SSL Sertifikası Üret (Kamera ve mikrofon için HTTPS zorunludur)
const localIp = getLocalIp();
const certAttrs = [{ name: 'commonName', value: localIp }];
const pems = selfsigned.generate(certAttrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256'
});

const httpsServer = https.createServer({
  key: pems.private,
  cert: pems.cert
}, handleRequest);

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log('🎉 Kafana Tak! - Parti Oyunu Sunucusu Başlatıldı');
  console.log('================================================================');
  console.log(`💻 Bilgisayarda Oynamak İçin: http://localhost:${HTTP_PORT}`);
  console.log('');
  console.log(`📱 TELEFONDA OYNAMAK İÇİN (KAMERA & SENSÖR AÇIK):`);
  console.log(`👉 https://${localIp}:${HTTPS_PORT}`);
  console.log('');
  console.log('⚠️ ÖNEMLİ (Mobil Kamera İzni):');
  console.log('Mobil tarayıcılarda (Chrome/Safari) ön kamera ve sensörlerin');
  console.log('çalışabilmesi için HTTPS zorunludur.');
  console.log(`Telefonunuzdan https://${localIp}:${HTTPS_PORT} adresine girerken`);
  console.log('"Gelişmiş -> Siteye İlerle (Güvenli değil)" seçeneğine basınız.');
  console.log('================================================================\n');
});
