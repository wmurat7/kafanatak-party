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
    let url = localStorage.getItem(this.storageKeyDb) || DEFAULT_FIREBASE_CONFIG.dbUrl;
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
      if (typeof window !== 'undefined' && window.location && window.location.origin && 
          !window.location.origin.includes('localhost') && 
          !window.location.origin.includes('127.0.0.1') &&
          !window.location.origin.startsWith('capacitor:') &&
          !window.location.origin.startsWith('file:')) {
        url = window.location.origin;
      } else {
        url = DEFAULT_FIREBASE_CONFIG.webAppUrl;
      }
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
    const cleanRoom = encodeURIComponent(String(roomId).trim().toUpperCase());
    const sub = subPath ? `/${subPath}` : '';
    return `${base}/kafanatak/${namespace}/${cleanRoom}${sub}.json`;
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
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;

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
    try {
      const url = this.buildPath(namespace, roomId, `players/${player.id}`);
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] setPlayer hatası:`, err.message);
      return false;
    }
  }

  /**
   * Odadan oyuncuyu siler (Çıkış onayında)
   */
  async removePlayer(namespace, roomId, playerId) {
    if (!roomId || !playerId) return false;
    try {
      const url = this.buildPath(namespace, roomId, `players/${playerId}`);
      await fetch(url, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.warn(`[FirebaseNetwork] removePlayer hatası:`, err.message);
      return false;
    }
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
