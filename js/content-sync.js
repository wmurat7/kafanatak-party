// js/content-sync.js
// Kafana Tak! & Parti Arenası - Canlı Soru Havuzu ve Dinamik İçerik Senkronizasyonu
// Firebase Realtime Database (/kafanatak/content.json) üzerinden yeni kategorileri,
// kelimeleri ve yarışma sorularını çevrimiçi çeker, çevrimdışı (offline-first) saklar.

import { DEFAULT_FIREBASE_CONFIG } from './firebase-network.js';
import { CATEGORIES } from './decks.js';
import { AILELER_YARISIYOR_QUESTIONS } from './aileler-yarisiyor-data.js';

const STORAGE_KEY_PACKS = 'kafanatak_dynamic_content_packs';
const STORAGE_KEY_VERSION = 'kafanatak_dynamic_content_version';
const STORAGE_KEY_LAST_CHECK = 'kafanatak_dynamic_content_last_check';

// Ters Ses için varsayılan zengin Türkçe kelime & replik havuzu
export const DEFAULT_TERS_SES_WORDS = [
  // Kolay / Komik Tek Kelimeler
  { word: "Pikachu", hint: "Efsanevi Çizgi Dizi Karakteri", difficulty: "kolay", category: "Çizgi Film" },
  { word: "Lahmacun", hint: "Çıtır Çıtır Geleneksel Lezzet", difficulty: "kolay", category: "Yemekler" },
  { word: "Dondurma", hint: "Yaz Aylarının Vazgeçilmezi", difficulty: "kolay", category: "Yemekler" },
  { word: "Timsah", hint: "Tehlikeli Bir Sürüngen", difficulty: "kolay", category: "Hayvanlar" },
  { word: "Karpuz", hint: "Çekirdekli Yaz Meyvesi", difficulty: "kolay", category: "Yemekler" },
  { word: "Örümcek", hint: "Sekiz Bacaklı Ağ Ören Canlı", difficulty: "kolay", category: "Hayvanlar" },
  { word: "Helikopter", hint: "Pervaneli Hava Aracı", difficulty: "orta", category: "Genel Kültür" },
  { word: "Şener Şen", hint: "Yeşilçam'ın Unutulmaz Ustası", difficulty: "orta", category: "Ünlüler" },
  { word: "Tost Makinesi", hint: "Mutfakta Kaşar Eriten Cihaz", difficulty: "orta", category: "Eşyalar" },
  { word: "Baklava", hint: "Şerbetli Bayram Tatlısı", difficulty: "kolay", category: "Yemekler" },
  { word: "Cem Yılmaz", hint: "Türkiye'nin En Çok Güldüren İsmi", difficulty: "kolay", category: "Ünlüler" },
  { word: "Astronot", hint: "Uzaya Giden Cesur İnsan", difficulty: "orta", category: "Meslekler" },
  { word: "Denizaltı", hint: "Okyanusun Derinliklerinde Gezen Araç", difficulty: "orta", category: "Genel Kültür" },
  { word: "Kemal Sunal", hint: "İnek Şaban ve Gülümsemesiyle Efsane", difficulty: "orta", category: "Ünlüler" },
  { word: "İskender Kebap", hint: "Üzerine Tereyağı Dökülen Ziyafet", difficulty: "orta", category: "Yemekler" },
  { word: "Süpermen", hint: "Pelerinli Kriptonlu Kahraman", difficulty: "kolay", category: "Karakterler" },
  { word: "Barış Manço", hint: "7'den 77'ye Şarkıların Ustası", difficulty: "orta", category: "Müzik" },
  { word: "Çöp Kamyonu", hint: "Sabahları Sokakları Dolaşan Büyük Araç", difficulty: "orta", category: "Şehir Yaşamı" },
  { word: "Gökkuşağı", hint: "Yağmurdan Sonra Gökyüzünde 7 Renk", difficulty: "orta", category: "Doğa" },
  { word: "Transformers", hint: "Arabaya Dönüşen Dev Robotlar", difficulty: "zor", category: "Sinema" },
  { word: "Tarkan", hint: "Megastar / Şıkıdım", difficulty: "kolay", category: "Müzik" },
  { word: "Menemen", hint: "Soğanlı mı Soğansız mı Tartışması", difficulty: "orta", category: "Yemekler" },
  { word: "Kaptan Amerika", hint: "Yıldızlı Kalkanıyla Tanınan Kahraman", difficulty: "zor", category: "Karakterler" },
  { word: "Sivrisinek", hint: "Yaz Gecelerinde Vızıldayıp Isıran Böcek", difficulty: "orta", category: "Doğa" },
  { word: "Harry Potter", hint: "Yıldırım Yaralı Genç Büyücü", difficulty: "orta", category: "Sinema" }
];

class ContentSyncManager {
  constructor() {
    this.localVersion = parseInt(localStorage.getItem(STORAGE_KEY_VERSION) || '0', 10);
    this.dynamicData = null;
    this.hasAppliedCached = false;
  }

  /**
   * Yerel hafızaya kaydedilmiş soruları anında yükler (Sıfır gecikme, offline-first)
   */
  loadCachedPacks() {
    if (this.hasAppliedCached) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PACKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.dynamicData = parsed;
          this.applyContentToRuntime(parsed, false);
          this.hasAppliedCached = true;
          console.log(`[ContentSync] Yerel önbellekten dinamik soru paketi (v${this.localVersion}) yüklendi.`);
        }
      }
    } catch (e) {
      console.warn('[ContentSync] Önbellek okuma hatası:', e);
    }
  }

  /**
   * Firebase Realtime Database üzerinden yeni soruları arka planda kontrol eder
   */
  async checkAndSync(force = false) {
    // Önce yerel önbelleği hafızaya al
    this.loadCachedPacks();

    // Sık sorguyu sınırla (Zorunlu değilse en az 30 saniye arayla bak)
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(STORAGE_KEY_LAST_CHECK) || '0', 10);
    if (!force && (now - lastCheck < 30000)) {
      return { status: 'skipped_throttled', version: this.localVersion };
    }
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, String(now));

    try {
      const baseUrl = DEFAULT_FIREBASE_CONFIG.dbUrl;
      const url = `${baseUrl}/kafanatak/content.json`;

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;

      const res = await fetch(url, {
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (!res.ok) {
        return { status: 'http_error', code: res.status };
      }

      const remotePack = await res.json();
      if (!remotePack || typeof remotePack !== 'object') {
        return { status: 'empty' };
      }

      const remoteVersion = parseInt(remotePack.version || '1', 10);
      if (remoteVersion > this.localVersion || force) {
        console.log(`[ContentSync] Yeni soru paketi bulundu! v${this.localVersion} -> v${remoteVersion}`);
        
        this.dynamicData = remotePack;
        this.localVersion = remoteVersion;
        localStorage.setItem(STORAGE_KEY_VERSION, String(remoteVersion));
        localStorage.setItem(STORAGE_KEY_PACKS, JSON.stringify(remotePack));

        const stats = this.applyContentToRuntime(remotePack, true);

        // Bildirim ver
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kafanatak-content-updated', {
            detail: { version: remoteVersion, stats, notice: remotePack.notice }
          }));
          this.showUpdateToast(remotePack.notice || `🎉 Canlı Soru Havuzu Güncellendi! (+${stats.totalNewItems} Yeni İçerik)`);
        }

        return { status: 'updated', version: remoteVersion, stats };
      }

      return { status: 'up_to_date', version: this.localVersion };
    } catch (err) {
      // Çevrimdışı / zayıf ağ durumunda sessizce yereldekiyle devam et
      console.log('[ContentSync] Ağ kontrolü atlandı (çevrimdışı veya yanıt yok):', err.message);
      return { status: 'offline', error: err.message };
    }
  }

  /**
   * İndirilen yeni içerikleri oyun içi dinamik belleğe birleştirir
   */
  applyContentToRuntime(pack, notify = false) {
    let newDecksCount = 0;
    let extraWordsCount = 0;
    let newAyCount = 0;

    // 1. Yeni Kafana Tak kategorileri
    if (Array.isArray(pack.decks)) {
      for (const newDeck of pack.decks) {
        if (!newDeck || !newDeck.id) continue;
        const exists = CATEGORIES.some(c => c.id === newDeck.id);
        if (!exists) {
          CATEGORIES.unshift(newDeck);
          newDecksCount++;
        }
      }
    }

    // 2. Mevcut kategorilere yeni kelimeler enjekte et
    if (pack.extraWords && typeof pack.extraWords === 'object') {
      for (const [catId, words] of Object.entries(pack.extraWords)) {
        if (!Array.isArray(words)) continue;
        const target = CATEGORIES.find(c => c.id === catId);
        if (target && Array.isArray(target.words)) {
          for (const w of words) {
            if (w && !target.words.includes(w)) {
              target.words.push(w);
              extraWordsCount++;
            }
          }
        }
      }
    }

    // 3. Aileler Yarışıyor yeni anket soruları
    if (Array.isArray(pack.ailelerYarisiyor)) {
      for (const newQ of pack.ailelerYarisiyor) {
        if (!newQ || !newQ.question) continue;
        const exists = AILELER_YARISIYOR_QUESTIONS.some(q => q.question === newQ.question);
        if (!exists) {
          AILELER_YARISIYOR_QUESTIONS.push(newQ);
          newAyCount++;
        }
      }
    }

    return {
      newDecksCount,
      extraWordsCount,
      newAyCount,
      totalNewItems: newDecksCount + extraWordsCount + newAyCount
    };
  }

  /**
   * Ters Ses oyunu için kelime listesi döner (Yerel + Dinamik havuz birleşimi)
   */
  getTersSesWords() {
    this.loadCachedPacks();
    const list = [...DEFAULT_TERS_SES_WORDS];

    if (this.dynamicData && Array.isArray(this.dynamicData.tersSesWords)) {
      for (const item of this.dynamicData.tersSesWords) {
        if (item && item.word && !list.some(w => w.word.toLowerCase() === item.word.toLowerCase())) {
          list.push(item);
        }
      }
    }
    return list;
  }

  showUpdateToast(message) {
    if (typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.className = 'party-toast-floating';
    toast.style.cssText = `
      position: fixed;
      bottom: calc(env(safe-area-inset-bottom, 16px) + 84px);
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10B981, #059669);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.88rem;
      padding: 10px 18px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px rgba(16,185,129,0.4);
      z-index: 10000;
      pointer-events: none;
      animation: fadeInToast 0.3s ease;
      max-width: min(88vw, 420px);
      text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }
}

export const contentSync = new ContentSyncManager();
