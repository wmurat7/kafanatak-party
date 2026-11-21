import { PartyMultiDeviceHelper } from './party-multi-device.js';
// js/bomb-game.js
// Kafana Tak! - Saatli Bomba (Tick Tack Boom / Kelime Bombası) Parti Oyunu

import { sounds } from './audio.js';

export const BOMB_PROMPTS = [
  "İçinde 'KAP' geçen bir kelime söyle!",
  "A harfiyle başlayan bir meyve veya sebze!",
  "Son harfi 'K' olan bir hayvan söyle!",
  "3 heceli bir şehir veya ülke söyle!",
  "Mutfakta bulunan elektrikli bir alet!",
  "İçinde 'ŞEN' geçen bir kelime söyle!",
  "Yeşil renkli bir şey söyle!",
  "S ile başlayan 5 harfli bir kelime!",
  "Düğünde görülen bir şey veya kişi!",
  "Trafikte veya arabada olan bir şey!",
  "Okulda veya sınıfta bulunan bir eşya!",
  "İçinde 'BAŞ' geçen bir kelime veya deyim!",
  "Deniz veya plajla ilgili bir şey!",
  "Kış mevsimiyle ilgili bir kelime!",
  "T ile başlayan bir meslek söyle!",
  "İçinde 'KOR' geçen bir kelime!",
  "Yatak odasında bulunan bir eşya!",
  "Piknikte yanına alacağın bir şey!",
  "Kırmızı renkli bir nesne söyle!",
  "Son harfi 'T' olan bir yemek adı!",
  "İçinde 'YAZ' geçen bir kelime!",
  "Süpermarkette satılan bir ürün!",
  "Havalimanında veya uçakta olan bir şey!",
  "Bebeklerle ilgili bir eşya veya kelime!",
  "İçinde 'EL' geçen 4 harfli bir kelime!",
  "Ç ile başlayan bir hayvan veya bitki!",
  "Futbol veya stadyumla ilgili bir şey!",
  "Televizyonda yayınlanan bir program türü!",
  "İçinde 'TAŞ' geçen bir kelime söyle!",
  "Restoranda sipariş edilen bir içecek!",
  "İçinde 'BAL' geçen bir kelime söyle!",
  "M ile başlayan 4 harfli bir kelime!",
  "Son harfi 'R' olan bir meslek söyle!",
  "Sarı renkli yenebilen bir şey!",
  "Buzdolabında saklanan bir yiyecek!",
  "İçinde 'GÖZ' geçen bir kelime veya deyim!",
  "Denizde yaşayan bir canlı türü!",
  "K harfiyle başlayan bir ülke veya şehir!",
  "Düğünde çalınan bir enstrüman!",
  "İçinde 'TER' geçen bir kelime!",
  "Banyoda bulunan bir temizlik eşyası!",
  "Son harfi 'A' olan bir kadın veya erkek ismi!",
  "Sinemada veya tiyatroda olan bir şey!",
  "İçinde 'YOL' geçen bir kelime!",
  "P ile başlayan bir tatlı veya hamur işi!",
  "Uçabilen bir kuş veya böcek türü!",
  "Yaz mevsimini anlatan bir kelime!",
  "İçinde 'SU' geçen bir kelime söyle!",
  "Ayakkabıcıda veya giyim mağazasında satılan bir şey!",
  "Son harfi 'M' olan bir akraba veya kişi unvanı!",
  "İçinde 'GÜL' geçen bir kelime söyle!",
  "Hastanede veya sağlık ocağında görülen bir şey!",
  "B ile başlayan bir spor dalı!",
  "Çocukların çok sevdiği bir çizgi film veya oyuncak!",
  "İçinde 'SES' geçen bir kelime!",
  "Tatsız veya acı olan bir yiyecek/baharat!",
  "Son harfi 'N' olan bir başkent söyle!",
  "İçinde 'KÖK' geçen bir kelime!",
  "Evde salon veya oturma odasında bulunan bir mobilya!",
  "C ile başlayan bir müzik aleti veya alet!",
  "İçinde 'KAY' geçen bir kelime!",
  "Gözle görülemeyen mikroskobik veya minik bir şey!",
  "Kışın giyilen kalın bir kıyafet!",
  "İçinde 'DÜZ' geçen bir kelime!",
  "Kahvaltı sofrasında bulunan bir yiyecek!",
  "Son harfi 'Z' olan bir sayı veya matematik terimi!",
  "İçinde 'CAN' geçen bir kelime veya isim!",
  "Kırtasiyede satılan bir okul aracı!",
  "F ile başlayan bir film türü veya kelime!",
  "İçinde 'GÜN' geçen bir kelime!",
  "Gece gökyüzünde görülen bir gök cismi!",
  "Sıcak içilen bir içecek türü!",
  "İçinde 'DUR' geçen bir kelime!",
  "Hayvanat bahçesinde kafeste görülen vahşi bir hayvan!",
  "Son harfi 'E' olan bir çiçek adı!",
  "İçinde 'KOL' geçen bir kelime söyle!",
  "Trafikte ceza yemeye sebep olan bir kural ihlali!",
  "Ş ile başlayan bir şehir veya ilçe!",
  "İçinde 'PAR' geçen bir kelime!",
  "Gitar, bağlama gibi telli bir enstrüman!",
  "Yemek pişirirken tencereye atılan bir baharat!",
  "Son harfi 'K' olan bir giysi veya aksesuar!",
  "İçinde 'GEL' geçen bir kelime!",
  "Plajda kumda veya denizde yapılan bir aktivite!",
  "V ile başlayan bir sebze veya meyve!",
  "İçinde 'SÖZ' geçen bir kelime veya deyim!",
  "Bilgisayarda veya telefonda olan bir donanım/parça!",
  "Son harfi 'İ' olan bir Türk tatlısı!",
  "İçinde 'YÜZ' geçen bir kelime!",
  "Otobüste veya trende olan bir şey!",
  "L ile başlayan bir ülke veya şehir adı!",
  "İçinde 'KAZ' geçen bir kelime!",
  "Lunaparkta olan eğlenceli bir alet!",
  "Son harfi 'D' veya 'T' olan bir şehir!",
  "İçinde 'BİR' geçen bir kelime!",
  "Kedi veya köpek bakımında kullanılan bir eşya!",
  "Z ile başlayan bir hayvan veya bitki!",
  "İçinde 'AŞ' geçen bir kelime söyle!",
  "Piknik sepetinde mutlaka olan bir yiyecek!",
  "U ile başlayan 4 harfli bir kelime!"
];

export const BOMB_PENALTIES = [
  "Sonraki tura kadar konuşurken her cümlenin sonuna 'Miyav' ekle!",
  "Masadakilerden birinin taklidini 30 saniye boyunca yap!",
  "En son dinlediğin şarkının nakaratını canlı söyle!",
  "Tavuk gibi kanat çırparak masanın etrafında bir tur at!",
  "Masadaki herkes hakkında samimi bir itirafta bulun!",
  "Telefonundan en son çektiğin fotoğrafı masadakilere göster!",
  "10 saniye boyunca kahkahalarla gülüyormuş gibi yap!",
  "Sonraki tura kadar konuşurken sadece robot sesiyle konuş!",
  "Masadaki en sağındaki kişiye çok içten bir iltifatta bulun!",
  "Bir opera sanatçısı gibi yüksek perdeden 'Kafana Tak!' diye bağır!",
  "10 saniye boyunca hiç göz kırpmadan masadakilere bak!",
  "En sevdiğin çizgi film karakterinin sesini taklit et!",
  "Masadakilerden biri için komik bir şiir uydur ve oku!",
  "Sonraki tura kadar her sözünün başına 'Sayın Başkanım' ekle!",
  "Ayağa kalkıp 5 defa kendi etrafında fırıldak gibi dön!",
  "Masadakilerin seçtiği bir şarkıyı mırıldanarak tahmin ettir!",
  "En utandığın çocukluk anılarından birini 1 dakikada anlat!",
  "Telefonundan en son aradığın kişiyi söyle (gizli değilse)!",
  "Sonraki tura kadar gülerken burnunu çekerek gül!",
  "Masadaki birine komik bir lakap tak!",
  "15 saniye boyunca spiker gibi futbol maçı anlat!",
  "Görünmez bir keman çalıyormuş gibi dramatik rol yap!",
  "Sonraki tura kadar sorulan her soruya sadece 'Kesinlikle katılıyorum' de!",
  "Masadakilerden birinin boy aynası gibi hareketlerini taklit et!",
  "En son izlediğin filmi tek bir cümleyle özetle!",
  "Ayağa kalkıp sanki podyumda yürüyormuş gibi manken yürüyüşü yap!",
  "Dilini çıkarmadan 'Pazartesi sendromu' demeye çalış!"
];

export class BombGameEngine {
  constructor(game) {
    this.game = game;
    this.state = 'idle'; // idle, running, exploded
    this.currentPrompt = '';
    this.remainingTime = 0;
    this.totalDuration = 0;
    this.tickInterval = null;
    this.roundCount = 1;
    this.passCount = 0;
    this.currentHolderIndex = 0;
    this.currentHolder = { id: 'host', name: 'Masa (Host)', avatar: '👑' };

    this.multiHelper = new PartyMultiDeviceHelper({
      namespace: 'bomb',
      title: 'Saatli Bomba Masası',
      subtitle: '☁️ Bomba telefonlar arasında canlı elden ele geçer, patlayan elenir!',
      prefix: 'bomb',
      onAction: (act, room) => this.handlePlayerAction(act, room)
    });
  }

  bindSetup() {
    if (this.multiHelper) {
      this.multiHelper.bindEvents((mode) => {
        console.log('[BombGame] Mod değişti:', mode);
        if (mode === 'wifi') {
          this.syncWithCloud();
        }
      });
    }
  }

  getParticipants() {
    const list = [];
    // 1. Ana telefon (Host)
    list.push({ id: 'host', name: 'Masa (Host)', avatar: '👑' });
    // 2. Bağlı diğer telefonlar
    if (this.multiHelper && this.multiHelper.connectedPlayers) {
      this.multiHelper.connectedPlayers.forEach(p => {
        if (p && p.id && p.id !== 'host') {
          list.push({ id: p.id, name: p.name || 'Oyuncu', avatar: p.avatar || '💣' });
        }
      });
    }
    return list;
  }

  handlePlayerAction(act, room) {
    if (!act || this.state !== 'running') return;
    if (act.type === 'pass_bomb' || act.type === 'buzz_word' || act.type === 'buzzer') {
      const pId = act.fromPlayerId || act.playerId;
      const pName = act.playerName || (pId && room && room.players && room.players[pId] ? room.players[pId].name : 'Bir oyuncu');
      this.passTurn(pName);
    }
  }

  startRound() {
    this.state = 'running';
    this.passCount = 0;
    // 18 ile 38 saniye arası sürpriz gizli patlama süresi
    this.totalDuration = Math.floor(18 + Math.random() * 20);
    this.remainingTime = this.totalDuration;
    this.currentPrompt = BOMB_PROMPTS[Math.floor(Math.random() * BOMB_PROMPTS.length)];

    const participants = this.getParticipants();
    this.currentHolderIndex = participants.length > 1 ? 1 : 0;
    this.currentHolder = participants[this.currentHolderIndex] || participants[0];

    sounds.startBombTicking();
    this.renderBombScreen();
    this.syncWithCloud();

    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      this.remainingTime--;

      // Hızlanan saat bekleme efekti
      sounds.playBombTick(this.remainingTime, this.totalDuration);

      if (this.remainingTime <= 0) {
        clearInterval(this.tickInterval);
        this.explodeBomb();
      } else {
        this.updateBombDisplay();
      }
    }, 1000);
  }

  passTurn(passedByName = null) {
    if (this.state !== 'running') return;
    this.passCount++;
    sounds.playCorrect();

    // Yeni kural/soru seç
    this.currentPrompt = BOMB_PROMPTS[Math.floor(Math.random() * BOMB_PROMPTS.length)];

    // Katılımcılar arasında bombayı sıradakine devret
    const participants = this.getParticipants();
    if (participants.length > 1) {
      this.currentHolderIndex = (this.currentHolderIndex + 1) % participants.length;
      this.currentHolder = participants[this.currentHolderIndex];
    } else if (participants.length === 1) {
      this.currentHolder = participants[0];
    }

    this.updateBombDisplay();
    this.syncWithCloud();
  }

  syncWithCloud() {
    if (!this.multiHelper || this.multiHelper.mode !== 'wifi') return;
    this.multiHelper.updateRoomState({
      phase: this.state,
      prompt: this.currentPrompt,
      currentHolderId: this.currentHolder ? this.currentHolder.id : 'host',
      currentHolderName: this.currentHolder ? this.currentHolder.name : 'Masa',
      currentHolderAvatar: this.currentHolder ? this.currentHolder.avatar : '💣',
      passCount: this.passCount,
      remainingTime: this.remainingTime,
      exploded: (this.state === 'exploded'),
      lastActive: Date.now()
    }).catch(err => console.warn('[BombGame] sync error:', err));
  }

  explodeBomb() {
    this.state = 'exploded';
    sounds.stopAll();
    sounds.playBombExplosion();

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 400]);
    }

    const penalty = BOMB_PENALTIES[Math.floor(Math.random() * BOMB_PENALTIES.length)];
    const loserName = this.currentHolder ? this.currentHolder.name : 'Elinde tutan kişi';

    if (this.multiHelper && this.multiHelper.mode === 'wifi') {
      this.multiHelper.updateRoomState({
        phase: 'exploded',
        exploded: true,
        explodedPlayerId: this.currentHolder ? this.currentHolder.id : 'host',
        explodedPlayerName: loserName,
        penalty: penalty,
        lastActive: Date.now()
      }).catch(() => {});
    }

    const container = document.getElementById('bomb-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:24px; border:2px solid #EF4444; box-shadow:0 0 40px rgba(239,68,68,0.5); animation:pulse 0.5s infinite;">
        <div style="font-size:4.5rem; margin-bottom:8px; animation:bounce 0.4s ease infinite alternate;">💥</div>
        <h2 style="font-size:2rem; font-weight:900; color:#EF4444; margin-bottom:6px;">BOOOOOM!</h2>
        <div style="font-size:1.15rem; font-weight:900; color:#FFF; margin-bottom:12px;">
          BOMBA ${loserName.toUpperCase()} ELİNDE PATLADI!
        </div>
        <p style="font-size:0.86rem; color:#FDA4AF; line-height:1.4; margin-bottom:16px;">
          <strong>${loserName}</strong> bu turu kaybetti! Ceza görevini yerine getirmek zorunda:
        </p>

        <div style="background:rgba(239,68,68,0.15); border:1.5px solid #EF4444; border-radius:16px; padding:16px; margin-bottom:20px; text-align:left;">
          <div style="font-size:0.8rem; font-weight:800; color:#F87171; text-transform:uppercase; margin-bottom:4px;">🎭 CEZA GÖREVİ:</div>
          <div style="font-size:1.05rem; font-weight:900; color:#FFF; line-height:1.4;">${penalty}</div>
        </div>

        <button type="button" id="btn-bomb-restart" class="btn-main primary" style="font-size:1.1rem; padding:14px; cursor:pointer;">
          💣 Sıradaki Turu Başlat (Tur ${this.roundCount + 1})
        </button>
      </div>
    `;

    document.getElementById('btn-bomb-restart')?.addEventListener('click', () => {
      this.roundCount++;
      this.startRound();
    });
  }

  renderBombScreen() {
    const container = document.getElementById('bomb-game-content');
    if (!container) return;

    const holderText = this.currentHolder ? this.currentHolder.name : 'Masa (Host)';

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:440px; margin:0 auto; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="background:rgba(239,68,68,0.2); color:#EF4444; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:999px;">
            TUR ${this.roundCount}
          </span>
          <span style="font-size:0.8rem; color:#A78BFA; font-weight:800;">
            Paslaşma: <span id="bomb-pass-num">${this.passCount}</span>
          </span>
        </div>

        <!-- Bomba Kimde Rozeti -->
        <div id="bomb-holder-badge" style="display:inline-block; font-size:0.85rem; font-weight:800; color:#EF4444; background:rgba(239,68,68,0.15); border:1px solid #EF4444; padding:4px 14px; border-radius:999px; margin-bottom:6px;">
          💣 Bomba: ${holderText}
        </div>

        <!-- Nabız Gibi Atan Bomba -->
        <div id="bomb-visual" style="font-size:5rem; margin:10px 0 6px; transition:transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); filter:drop-shadow(0 0 25px rgba(239,68,68,0.6));">
          💣
        </div>

        <div style="font-size:0.8rem; font-weight:800; color:#EF4444; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">
          TİK-TAK... TİK-TAK!
        </div>

        <!-- Kural / Görev Kutusu -->
        <div style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(255,46,147,0.4); border-radius:18px; padding:18px; margin-bottom:16px; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="font-size:0.78rem; font-weight:800; color:#00F5D4; text-transform:uppercase; margin-bottom:6px;">KELİME GÖREVİ:</div>
          <div id="bomb-prompt-text" style="font-size:1.3rem; font-weight:900; color:#FFF; line-height:1.35;">
            ${this.currentPrompt}
          </div>
        </div>

        <!-- DEV SAATLİ BOMBA PASLA BUTONU -->
        <button type="button" id="btn-bomb-pass" class="btn-main" style="width:100%; min-height:115px; background:linear-gradient(135deg, #FF0844, #FF4E50); color:#FFFFFF; font-size:1.85rem; font-weight:900; padding:18px 16px; box-shadow:0 0 35px rgba(255,8,68,0.7), inset 0 2px 10px rgba(255,255,255,0.5); border:3.5px solid #FFFFFF; border-radius:26px; letter-spacing:1px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; touch-action:manipulation; user-select:none; -webkit-user-select:none; -webkit-tap-highlight-color:transparent; transition:transform 0.1s, box-shadow 0.1s; margin-bottom:12px;">
          <span style="font-size:2.2rem; line-height:1; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4));">💥 SÖYLEDİM!</span>
          <span style="font-size:1.25rem; color:#FFE4E6; font-weight:900; letter-spacing:1.5px;">👉 SIRADAKİNE PASLA! ➔</span>
        </button>

        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:12px; line-height:1.4;">
          Kelimeyi yüksek sesle söyle, hemen <strong>PASLA</strong>'ya bas ve bomba sıradakine geçsin!
        </p>
      </div>
    `;

    const btnPass = document.getElementById('btn-bomb-pass');
    if (btnPass) {
      btnPass.onclick = () => {
        sounds.playClick();
        try { navigator.vibrate?.([60, 40, 60]); } catch (err) {}
        btnPass.style.transform = 'scale(0.93)';
        setTimeout(() => { if (btnPass) btnPass.style.transform = 'scale(1)'; }, 140);
        this.passTurn();
      };
    }
  }

  updateBombDisplay() {
    const promptEl = document.getElementById('bomb-prompt-text');
    const passNum = document.getElementById('bomb-pass-num');
    const bombVis = document.getElementById('bomb-visual');
    const holderBadge = document.getElementById('bomb-holder-badge');

    if (promptEl) promptEl.textContent = this.currentPrompt;
    if (passNum) passNum.textContent = this.passCount;
    if (holderBadge && this.currentHolder) {
      holderBadge.textContent = `💣 Bomba: ${this.currentHolder.name}`;
    }
    if (bombVis) {
      // Bomba süre azaldıkça büyür ve kızarır
      const scale = 1 + (1 - (this.remainingTime / this.totalDuration)) * 0.45;
      bombVis.style.transform = `scale(${scale})`;
    }
  }
}
