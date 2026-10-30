// js/firebase-network.js
// Kafana Tak! - Firebase Realtime Database (Bulut Oda & Çevrimiçi Multiplayer Altyapısı)
// Wi-Fi hotspot veya yerel sunucuya ihtiyaç duymadan, internet üzerinden 4 haneli oda kodlarıyla çalışır.

export const DEFAULT_FIREBASE_CONFIG = {
  // Varsayılan Firebase Realtime Database Endpoint'i (Kafana Tak Party Resmi RTDB)
  dbUrl: 'https://kafanatak-party-default-rtdb.europe-west1.firebasedatabase.app',
  // İkinci telefonların internet üzerinden açacağı web sayfası adresi
  webAppUrl: 'https://wmurat7.github.io/kafanatak-party'
};

class FirebaseNetworkManager {
  constructor() {
    this.storageKeyDb = 'kafanatak_firebase_db_url';
    this.storageKeyWeb = 'kafanatak_firebase_web_url';
    this.storageKeyMode = 'kafanatak_network_mode'; // 'firebase' | 'local_wifi'
    
    // Eski veya geçersiz kayıtları temizle
    if (typeof localStorage !== 'undefined') {
      const savedWeb = localStorage.getItem(this.storageKeyWeb);
      if (savedWeb && savedWeb.includes('pluswalnut')) {
        localStorage.removeItem(this.storageKeyWeb);
      }
      const savedDb = localStorage.getItem(this.storageKeyDb);
      if (savedDb && savedDb.includes('.firebaseio.com')) {
        localStorage.removeItem(this.storageKeyDb);
      }
    }

    this.dbUrl = this.getDbUrl();
    this.webAppUrl = this.getWebAppUrl();
    this.networkMode = localStorage.getItem(this.storageKeyMode) || 'firebase';

    this.activeListeners = new Map(); // key: `${namespace}/${roomId}` -> EventSource / interval
  }

  getDbUrl() {
    let url = null;
    try {
      url = localStorage.getItem(this.storageKeyDb);
    } catch (e) {}
    if (!url || !url.startsWith('https://') || !url.includes('firebasedatabase.app')) {
      url = DEFAULT_FIREBASE_CONFIG.dbUrl;
    }
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
  }

  setDbUrl(url) {
    if (!url) return;
    let clean = url.trim();
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    this.dbUrl = clean;
    localStorage.setItem(this.storageKeyDb, clean);
  }

  getWebAppUrl() {
    let url = localStorage.getItem(this.storageKeyWeb);
    if (url && url.includes('pluswalnut')) {
      localStorage.removeItem(this.storageKeyWeb);
      url = null;
    }
    if (!url) {
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        const origin = window.location.origin.toLowerCase();
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('capacitor:') || origin.startsWith('file:');
        if (!isLocal) {
          url = window.location.origin;
        }
      }
    }
    if (!url) {
      url = DEFAULT_FIREBASE_CONFIG.webAppUrl;
    }
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
  }

  setWebAppUrl(url) {
    if (!url) return;
    let clean = url.trim();
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    this.webAppUrl = clean;
    localStorage.setItem(this.storageKeyWeb, clean);
  }

  getNetworkMode() {
    return localStorage.getItem(this.storageKeyMode) || 'firebase';
  }

  setNetworkMode(mode) {
    this.networkMode = mode;
    localStorage.setItem(this.storageKeyMode, mode);
  }

  /**
   * 4 Karakterlik benzersiz, kolay okunur oda kodu üretir (Örn: '7482', 'KAF9')
   */
  generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Firebase Realtime Database REST URL oluşturur
   */
  buildPath(namespace, roomId, subPath = '') {
    const base = this.getDbUrl();
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = encodeURIComponent(String(roomId || '').trim().toUpperCase());
    const sub = subPath ? `/${subPath}` : '';
    return `${base}/kafanatak/${cleanNs}/${cleanRoom}${sub}.json`;
  }

  /**
   * Yeni bir oda oluşturur ve başlangıç durumunu Firebase'e yazar
   */
  async createRoom(namespace, initialData = {}) {
    const roomId = initialData.roomId || this.generateRoomCode();
    const payload = {
      ...initialData,
      roomId,
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    try {
      const url = this.buildPath(namespace, roomId);
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`);
      return { success: true, roomId, data: payload };
    } catch (err) {
      console.warn(`[FirebaseNetwork] createRoom (${namespace}/${roomId}) hata:`, err.message);
      // Fallback: Yerel depolamaya da yaz
      try {
        localStorage.setItem(`kafanatak_local_room_${namespace}_${roomId}`, JSON.stringify(payload));
      } catch (e) {}
      return { success: false, roomId, fallback: true, error: err.message };
    }
  }

  /**
   * Oda verisini kısmi olarak günceller (PATCH)
   */
  async updateRoom(namespace, roomId, partialData) {
    if (!roomId) return false;
    const payload = {
      ...partialData,
      lastActive: Date.now()
    };

    try {
      const url = this.buildPath(namespace, roomId);
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;
      
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] updateRoom hatası (${namespace}/${roomId}):`, err.message);
      return false;
    }
  }

  /**
   * Oda verisini tek seferlik okur (GET)
   */
  async getRoom(namespace, roomId) {
    if (!roomId) return null;
    try {
      const url = this.buildPath(namespace, roomId);
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

      const res = await fetch(url, {
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[FirebaseNetwork] getRoom hatası (${namespace}/${roomId}):`, err.message);
      return null;
    }
  }

  /**
   * Odaya bir aksiyon (tezahürat, bitti çağrısı, oy vb.) ekler
   * Odaya bir aksiyon (tezahürat, bitti çağrısı, oy vb.) ekler (Mükerrer gönderim korumalı)
   */
  async sendAction(namespace, roomId, actionType, payload = {}) {
    if (!roomId) return false;

    // 350ms içinde aynı tür mükerrer tıklamayı önle
    if (!this.lastActionTimes) this.lastActionTimes = new Map();
    const dedupKey = `${namespace}_${roomId}_${actionType}_${payload.sender || payload.playerId || ''}_${payload.cheer || ''}`;
    const now = Date.now();
    if (this.lastActionTimes.has(dedupKey) && (now - this.lastActionTimes.get(dedupKey) < 350)) {
      return false;
    }
    this.lastActionTimes.set(dedupKey, now);

    const actionObj = {
      type: actionType,
      ...payload,
      timestamp: Date.now(),
      id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
    };

    try {
      const url = this.buildPath(namespace, roomId, 'actions');
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionObj),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] sendAction hatası:`, err.message);
      return false;
    }
  }

  /**
   * Oyuncu ID'sini yerel depolamadan alır veya tekil olarak oluşturur (Mükerrer bağlantıyı önler)
   * playerName opsiyoneldir; verilirse ada göre eşleşme de korunur.
   */
  getOrCreatePlayerId(namespace, roomId, playerName = '') {
    if (typeof localStorage === 'undefined') return 'p_' + Date.now();
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();
    const cleanName = playerName ? String(playerName).trim().toLowerCase().replace(/[^a-z0-9]/gi, '') : '';

    const nameKey = cleanName ? `kafanatak_pid_${cleanNs}_${cleanRoom}_${cleanName}` : null;
    const roomKey = `kafanatak_pid_${cleanNs}_${cleanRoom}`;

    let pid = nameKey ? localStorage.getItem(nameKey) : null;
    if (!pid) pid = localStorage.getItem(roomKey);

    if (!pid) {
      pid = 'p_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36);
    }

    try {
      localStorage.setItem(roomKey, pid);
      if (nameKey) localStorage.setItem(nameKey, pid);
    } catch (e) {}

    return pid;
  }

  /**
   * Odaya oyuncu ekler / günceller
   */
  async setPlayer(namespace, roomId, player) {
    if (!roomId || !player || !player.id) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();
    try {
      const url = this.buildPath(cleanNs, cleanRoom, `players/${player.id}`);
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      // Güvenlik günlüğüne giriş kaydı ekle (oturum süresince tekil)
      try {
        const joinSessionKey = `joined_${cleanNs}_${cleanRoom}_${player.id}`;
        if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(joinSessionKey)) {
          sessionStorage.setItem(joinSessionKey, '1');
          this.logSecurityEvent(cleanNs, cleanRoom, `👤 ${player.name || 'Oyuncu'} odaya katıldı.`, 'join');
        }
      } catch (e) {}

      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] setPlayer hatası:`, err.message);
      return false;
    }
  }

  /**
   * Odadan oyuncuyu siler (Çıkış onayında)
   */
  async removePlayer(namespace, roomId, playerId, playerName = '') {
    if (!roomId || !playerId) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();
    try {
      const url = this.buildPath(cleanNs, cleanRoom, `players/${playerId}`);
      await fetch(url, { method: 'DELETE' });
      this.logSecurityEvent(cleanNs, cleanRoom, `🚪 ${playerName || 'Bir oyuncu'} odadan ayrıldı.`, 'leave');
      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] removePlayer hatası:`, err.message);
      return false;
    }
  }

  /**
   * Ana telefon (Host / Yönetici) yetkisiyle bir oyuncuya ikaz gönderir
   */
  async warnPlayer(namespace, roomId, playerId, message = 'Lütfen kurallara uyun ve ekrandan ayrılmayın!') {
    if (!roomId || !playerId) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    // 1. Oyuncunun alt kaydına son ikazı yaz
    try {
      const url = this.buildPath(cleanNs, cleanRoom, `players/${playerId}/lastWarning`);
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, timestamp: Date.now() })
      });
    } catch (e) {}

    // 2. Anlık aksiyon olarak da ilet
    await this.sendAction(cleanNs, cleanRoom, 'player_warning', {
      targetPlayerId: playerId,
      message: message,
      timestamp: Date.now()
    });

    // 3. Güvenlik günlüğüne kaydet
    await this.logSecurityEvent(cleanNs, cleanRoom, `⚠️ Oyuncuya (${playerId}) ikaz iletildi: "${message}"`, 'warning');
    return true;
  }

  /**
   * Ana telefon (Host / Yönetici) yetkisiyle bir oyuncuyu odadan atar (Kick)
   */
  async kickPlayer(namespace, roomId, playerId, reason = 'Oda yöneticisi tarafından odadan çıkarıldınız.') {
    if (!roomId || !playerId) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    // 1. Oyuncuyu players altından sil
    await this.removePlayer(cleanNs, cleanRoom, playerId);

    // 2. Kicked listesine kaydet
    try {
      const url = this.buildPath(cleanNs, cleanRoom, `kicked/${playerId}`);
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, reason, timestamp: Date.now() })
      });
    } catch (e) {}

    // 3. Anlık kick aksiyonu yayınla
    await this.sendAction(cleanNs, cleanRoom, 'player_kicked', {
      targetPlayerId: playerId,
      reason: reason,
      timestamp: Date.now()
    });

    // 4. Güvenlik günlüğüne kaydet
    await this.logSecurityEvent(cleanNs, cleanRoom, `🚫 Oyuncu (${playerId}) odadan atıldı. Sebep: ${reason}`, 'kick');
    return true;
  }

  /**
   * Ana telefon yetkisiyle tüm bağlı cihazlara genel ikaz / anons yayınlar
   */
  async broadcastAnnouncement(namespace, roomId, message) {
    if (!roomId || !message) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    try {
      const url = this.buildPath(cleanNs, cleanRoom, 'announcement');
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, timestamp: Date.now() })
      });
    } catch (e) {}

    await this.logSecurityEvent(cleanNs, cleanRoom, `📣 Herkese İkaz/Duyuru: "${message}"`, 'broadcast');

    return await this.sendAction(cleanNs, cleanRoom, 'room_announcement', {
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Odayı yeni katılımlara kilitler veya kilidi açar
   */
  async toggleRoomLock(namespace, roomId, isLocked = true) {
    if (!roomId) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    try {
      const url = this.buildPath(cleanNs, cleanRoom, 'isLocked');
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Boolean(isLocked))
      });
    } catch (e) {}

    await this.logSecurityEvent(cleanNs, cleanRoom, isLocked ? '🔒 Oda yeni katılımcılara kilitlendi.' : '🔓 Oda yeni katılımcılara açıldı.', 'lock');

    return await this.sendAction(cleanNs, cleanRoom, 'room_lock_changed', {
      isLocked: Boolean(isLocked),
      timestamp: Date.now()
    });
  }

  /**
   * Odayı güvenle dağıtır ve kapatır
   */
  async closeRoom(namespace, roomId) {
    if (!roomId) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    try {
      const url = this.buildPath(cleanNs, cleanRoom, 'isClosed');
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(true)
      });
    } catch (e) {}

    await this.logSecurityEvent(cleanNs, cleanRoom, '🛑 Oda yönetici tarafından kapatıldı.', 'close');

    return await this.sendAction(cleanNs, cleanRoom, 'room_closed', {
      reason: 'Oda yöneticisi tarafından oturum sonlandırıldı.',
      timestamp: Date.now()
    });
  }

  /**
   * Odaya güvenlik günlüğü kaydı ekler
   */
  async logSecurityEvent(namespace, roomId, text, type = 'info') {
    if (!roomId || !text) return false;
    const cleanNs = String(namespace || '').trim().toLowerCase();
    const cleanRoom = String(roomId || '').trim().toUpperCase();

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      text,
      type,
      timestamp: Date.now(),
      timeStr: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    try {
      const url = this.buildPath(cleanNs, cleanRoom, 'auditLog');
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Katılımcının odaya girip giremeyeceğini denetler (Kilit, Ban, Kapatılma kontrolü)
   */
  async verifyJoinEligibility(namespace, roomId, playerId) {
    if (!roomId) return { allowed: false, reason: 'Geçersiz oda kodu!' };
    const room = await this.getRoom(namespace, roomId);
    if (!room) return { allowed: false, reason: 'Oda bulunamadı veya henüz açılmamış!' };

    if (room.isClosed) {
      return { allowed: false, reason: 'Bu oda yönetici tarafından kapatılmıştır!' };
    }
    if (room.isLocked) {
      return { allowed: false, reason: 'Oda yeni katılımcılara kilitlenmiştir!' };
    }
    if (room.kicked && playerId && room.kicked[playerId]) {
      return { allowed: false, reason: 'Bu odadan çıkarıldınız, tekrar katılamazsınız!' };
    }

    return { allowed: true, room };
  }

  /**
   * İstemci tarafında güvenlik denetimlerini (Oda kapatıldı mı, oyuncu atıldı mı, ikaz veya duyuru var mı) tek noktadan yürütür.
   * Tüm oyunların istemci ekranları bu fonksiyonu çağırarak kod tekrarı olmadan tam güvenlik sağlar.
   */
  handleClientSecurity(roomData, playerId, callbacks = {}) {
    if (!roomData) return false;

    // 1. Oda Kapatıldı mı?
    if (roomData.isClosed) {
      if (callbacks.onRoomClosed) {
        callbacks.onRoomClosed(roomData.closeReason || 'Oda yöneticisi tarafından oturum sonlandırıldı.');
      } else {
        alert('🛑 Bu oda oda yöneticisi tarafından kapatılmıştır.');
        window.location.reload();
      }
      return true;
    }

    // 2. Oyuncu Kicklendi mi? (Kalıcı Ban Listesi)
    const kickInfo = (roomData.kicked && playerId && roomData.kicked[playerId]) || 
                     (roomData.kickedPlayers && playerId && roomData.kickedPlayers[playerId]);
    if (kickInfo) {
      if (callbacks.onKicked) {
        callbacks.onKicked(kickInfo.reason || 'Oda yöneticisi tarafından odadan çıkarıldınız.');
      }
      return true;
    }

    // 3. Hakem Aksiyonları (İkaz & Kick & Duyuru)
    if (roomData.actions) {
      const actList = Array.isArray(roomData.actions) ? roomData.actions : Object.values(roomData.actions);
      actList.forEach(a => {
        if (!a) return;
        const actId = a.id || (a.timestamp + '_' + a.type);
        if (!this._processedClientActionIds) this._processedClientActionIds = new Set();
        if (this._processedClientActionIds.has(actId)) return;
        this._processedClientActionIds.add(actId);

        if (a.targetPlayerId && a.targetPlayerId === playerId) {
          if (a.type === 'player_kicked' && callbacks.onKicked) {
            callbacks.onKicked(a.reason || 'Oda yöneticisi tarafından odadan çıkarıldınız.');
          } else if (a.type === 'player_warning' && callbacks.onWarning) {
            callbacks.onWarning(a.message || 'Lütfen kurallara uyun ve ekrandan ayrılmayın!');
          }
        } else if (a.type === 'room_announcement') {
          if (callbacks.onAnnouncement) {
            callbacks.onAnnouncement(a.message || '');
          } else {
            this.showAnnouncementToast(a.message || '');
          }
        } else if (a.type === 'room_closed' && callbacks.onRoomClosed) {
          callbacks.onRoomClosed(a.reason || 'Oda yöneticisi tarafından kapatıldı.');
        }
      });
    }

    // 4. Doğrudan Oda Duyurusu
    if (roomData.announcement && roomData.announcement.message) {
      const annId = roomData.announcement.id || (roomData.announcement.timestamp + '_' + roomData.announcement.message);
      if (!this._processedClientActionIds) this._processedClientActionIds = new Set();
      if (!this._processedClientActionIds.has(annId)) {
        this._processedClientActionIds.add(annId);
        if (callbacks.onAnnouncement) {
          callbacks.onAnnouncement(roomData.announcement.message);
        } else {
          this.showAnnouncementToast(roomData.announcement.message);
        }
      }
    }

    return false;
  }

  /**
   * İstemci ekranında şık, glassmorphic yönetici duyuru bildirimini gösterir
   */
  showAnnouncementToast(message) {
    if (!message || typeof document === 'undefined') return;
    let toast = document.getElementById('fb-announcement-banner');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fb-announcement-banner';
      toast.style.cssText = `
        position: fixed;
        top: max(20px, calc(env(safe-area-inset-top, 24px) + 16px));
        left: 50%;
        transform: translateX(-50%) translateY(-30px);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.96), rgba(217, 119, 6, 0.96));
        color: #FFFFFF;
        padding: 12px 20px;
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(245, 158, 11, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.25);
        z-index: 99999999;
        font-family: inherit;
        font-weight: 800;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 90vw;
        backdrop-filter: blur(12px);
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0;
        pointer-events: auto;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <span style="font-size: 1.5rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));">📢</span>
      <div style="flex:1;">
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #FEF3C7; font-weight: 900;">YÖNETİCİ DUYURUSU</div>
        <div style="margin-top: 2px; font-size: 0.92rem; font-weight: 700; line-height: 1.35;">${message}</div>
      </div>
      <button type="button" onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateX(-50%) translateY(-30px)';" style="background: rgba(0,0,0,0.2); border: none; color: #FFF; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; font-weight: 900;">✕</button>
    `;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    if (this._announcementTimer) clearTimeout(this._announcementTimer);
    this._announcementTimer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-30px)';
      }
    }, 6000);
  }

  /**
   * Odayı gerçek zamanlı (SSE / EventSource) dinler.
   * Bağlantı zaman aşımına uğramaz; SSE koparsa otomatik yeniden bağlanır ve dual polling kesintisiz sürer.
   * Mükerrer dinleyici (duplicate listener) ve sızıntı korumalıdır.
   */
  listenRoom(namespace, roomId, onStateChange, onAction = null) {
    if (!roomId) return () => {};
    const cleanRoom = String(roomId).trim().toUpperCase();
    const cleanNs = String(namespace).trim().toLowerCase();
    const key = `${cleanNs}/${cleanRoom}`;
    this.stopListening(key);

    const url = this.buildPath(cleanNs, cleanRoom);
    let eventSource = null;
    let fallbackPollTimer = null;
    let isSseActive = false;
    let isDisposed = false;
    let isPolling = false;
    let lastEventTime = 0;
    let reconnectTimeout = null;

    const startEventSource = () => {
      if (isDisposed) return;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      try {
        if (typeof EventSource !== 'undefined') {
          if (eventSource) {
            try { eventSource.close(); } catch(e) {}
          }
          eventSource = new EventSource(url);
          
          eventSource.addEventListener('put', (e) => {
            isSseActive = true;
            lastEventTime = Date.now();
            try {
              const parsed = JSON.parse(e.data);
              if (parsed && parsed.data !== undefined) {
                if (parsed.path === '/' || parsed.path === '') {
                  if (onStateChange) onStateChange(parsed.data);
                } else {
                  this.getRoom(cleanNs, cleanRoom).then(full => {
                    if (full && onStateChange && !isDisposed) onStateChange(full);
                  });
                }
              }
            } catch (err) {}
          });

          eventSource.addEventListener('patch', (e) => {
            isSseActive = true;
            lastEventTime = Date.now();
            try {
              const parsed = JSON.parse(e.data);
              if (parsed && parsed.data) {
                this.getRoom(cleanNs, cleanRoom).then(full => {
                  if (full && onStateChange && !isDisposed) onStateChange(full);
                });
              }
            } catch (err) {}
          });

          eventSource.onerror = () => {
            isSseActive = false;
            try { eventSource.close(); } catch (e) {}
            // Zaman aşımına uğramaması için 2 saniye sonra otomatik yeniden bağlan
            if (!isDisposed && !reconnectTimeout) {
              reconnectTimeout = setTimeout(() => {
                reconnectTimeout = null;
                if (!isDisposed) startEventSource();
              }, 2200);
            }
          };
        }
      } catch (err) {
        console.warn('[FirebaseNetwork] SSE başlatılamadı, dual-polling devrede:', err);
      }
    };

    startEventSource();

    // Dual-Layer Kesintisiz Polling (1.2 saniyede bir; SSE 3 saniyeden uzun sessizse anında yoklar)
    fallbackPollTimer = setInterval(async () => {
      if (isDisposed || isPolling) return;
      const now = Date.now();
      if (isSseActive && (now - lastEventTime) < 3200) {
        return; // SSE zaten çok taze veri akıtıyor
      }
      isPolling = true;
      try {
        const room = await this.getRoom(cleanNs, cleanRoom);
        if (room && onStateChange && !isDisposed) {
          onStateChange(room);
        }
      } finally {
        isPolling = false;
      }
    }, 1200);

    // Mobil cihaz arka plandan döndüğünde veya internet geri geldiğinde anında tetikle
    const handleReactivation = () => {
      if (isDisposed) return;
      this.getRoom(cleanNs, cleanRoom).then(r => {
        if (r && onStateChange && !isDisposed) onStateChange(r);
      });
      if (!isSseActive) {
        startEventSource();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleReactivation();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleReactivation);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    // İlk durumu hemen al
    this.getRoom(cleanNs, cleanRoom).then(r => {
      if (r && onStateChange && !isDisposed) onStateChange(r);
    });

    const cleanup = () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        try { eventSource.close(); } catch (e) {}
        eventSource = null;
      }
      if (fallbackPollTimer) {
        clearInterval(fallbackPollTimer);
        fallbackPollTimer = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleReactivation);
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      this.activeListeners.delete(key);
    };

    this.activeListeners.set(key, cleanup);
    return cleanup;
  }

  stopListening(key) {
    if (!key) return;
    const cleanKey = String(key).includes('/')
      ? `${String(key).split('/')[0].trim().toLowerCase()}/${String(key).split('/')[1].trim().toUpperCase()}`
      : String(key).trim();

    if (this.activeListeners.has(cleanKey)) {
      const cleanup = this.activeListeners.get(cleanKey);
      try { cleanup(); } catch (e) {}
      this.activeListeners.delete(cleanKey);
    }
    if (this.activeListeners.has(key)) {
      const cleanup = this.activeListeners.get(key);
      try { cleanup(); } catch (e) {}
      this.activeListeners.delete(key);
    }
  }

  /**
   * İkinci telefonların açabileceği canlı Seyirci URL'sini üretir
   */
  getSpectatorUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/spectator.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği İsim Şehir URL'sini üretir
   */
  getIsimSehirUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/isim-sehir.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Vampir - Köylü URL'sini üretir
   */
  getKoyUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/koy.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Passaparola Oyuncu/Seyirci URL'sini üretir
   */
  getPassaparolaUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/passaparola.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Çarkıfelek Oyuncu/Seyirci URL'sini üretir
   */
  getCarkifelekUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/carkifelek.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Şarkıyı Devam Ettir (Melodi Düellosu) URL'sini üretir
   */
  getSarkiDuelloUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/sarki-duello.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Bir Kelime Bir İşlem Oyuncu/Seyirci URL'sini üretir
   */
  getKelimeIslemUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/kelime-islem.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }

  /**
   * İkinci telefonların açabileceği Aileler Yarışıyor (Buzzer & Pano) URL'sini üretir
   */
  getAilelerYarisiyorUrl(roomId) {
    const webBase = this.getWebAppUrl();
    return `${webBase}/aileler-yarisiyor.html?room=${encodeURIComponent(roomId)}&cloud=1`;
  }
}

export const firebaseNetwork = new FirebaseNetworkManager();
if (typeof window !== 'undefined') {
  window.firebaseNetwork = firebaseNetwork;
}
