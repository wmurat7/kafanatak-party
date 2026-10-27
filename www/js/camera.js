// Kafana Tak! - Kamera, Canlı Canvas HUD Baskısı ve Görüntü Kalibrasyonu

export class CameraRecorder {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.videoBlob = null;
    this.videoUrl = null;
    this.isRecording = false;
    this.hasPermission = false;
    this.permissionState = 'prompt'; // 'granted', 'denied', 'prompt', 'insecure'
    this.facingMode = 'user'; // 'user' (ön) veya 'environment' (arka)

    // Canvas Video HUD Sistemi (16:9 HD Formatı)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.hiddenVideo = document.createElement('video');
    this.hiddenVideo.autoplay = true;
    this.hiddenVideo.muted = true;
    this.hiddenVideo.playsInline = true;
    this.hiddenVideo.setAttribute('playsinline', 'true');
    this.hiddenVideo.setAttribute('webkit-playsinline', 'true');

    this.preferredFormat = localStorage.getItem('kafanatak_camera_format') || 'webm';

    this.hudState = {
      category: '',
      word: '',
      tabooWords: [],
      remainingTime: 60,
      scoreCorrect: 0,
      scorePassed: 0,
      stamp: null
    };

    this.renderLoopId = null;
  }

  // Güvenli Bağlam (Secure Context) ve Donanım Desteği Kontrolü
  static checkSupport() {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isSecure = window.isSecureContext || isLocal;
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    return {
      isSecure,
      hasMediaDevices,
      httpsUrl: `https://${location.hostname}:3443`
    };
  }

  // Kamerayı başlatır
  async initCamera(previewElement = null) {
    this.previewElement = previewElement;
    const support = CameraRecorder.checkSupport();
    if (!support.isSecure) {
      this.permissionState = 'insecure';
      this.hasPermission = false;
      return false;
    }

    if (!support.hasMediaDevices) {
      this.permissionState = 'denied';
      this.hasPermission = false;
      return false;
    }

    // Android WebView'in video karelerini donanımda işlemesi için hiddenVideo DOM'a eklenmelidir
    if (!this.hiddenVideo.parentElement && document.body) {
      this.hiddenVideo.style.cssText = 'position:fixed; top:-9999px; left:-9999px; width:320px; height:240px; opacity:0; pointer-events:none; z-index:-999;';
      document.body.appendChild(this.hiddenVideo);
    }

    try {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
      }

      // Seçilen kamerayı kademeli fallback ile başlat (Android donanım garantisi)
      let gotStream = null;
      const facing = this.facingMode;

      const attempts = [
        { video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
        { video: { facingMode: facing }, audio: true },
        { video: true, audio: true },
        { video: { facingMode: facing }, audio: false },
        { video: true, audio: false }
      ];

      for (const constraints of attempts) {
        try {
          gotStream = await navigator.mediaDevices.getUserMedia(constraints);
          if (gotStream) break;
        } catch (e) {
          console.warn('getUserMedia denemesi:', constraints, e.name || e);
        }
      }

      if (!gotStream) {
        throw new Error('Cihaz kamerasından akış alınamadı.');
      }

      this.stream = gotStream;
      this.hasPermission = true;
      this.permissionState = 'granted';

      this.hiddenVideo.srcObject = this.stream;
      await this.hiddenVideo.play().catch(e => console.warn('Hidden video play error:', e));

      // 1. Mini PiP veya özel önizleme elemanı
      if (previewElement) {
        previewElement.srcObject = this.stream;
        previewElement.muted = true;
        await previewElement.play().catch(e => console.warn('Preview play error:', e));
      }

      // 2. Canlı Tam Ekran Oyun İçi Kamera Arka Planı (Portrait & Landscape Canlı Vizör)
      const bgVideo = document.getElementById('round-fullscreen-camera-video');
      if (bgVideo) {
        this.bgVideo = bgVideo;
        bgVideo.srcObject = this.stream;
        bgVideo.muted = true;
        await bgVideo.play().catch(e => console.warn('Background video play error:', e));
      }

      return true;
    } catch (err) {
      console.error('Kamera başlatılamadı:', err);
      this.hasPermission = false;
      this.permissionState = 'denied';
      return false;
    }
  }

  // Ön ve Arka kamera arası geçiş
  async switchCamera(previewElement = null) {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return await this.initCamera(previewElement || this.previewElement);
  }

  updateHUD(state = {}) {
    Object.assign(this.hudState, state);
  }

  triggerStamp(type) {
    const isCorrect = type === 'correct';
    this.hudState.stamp = {
      text: isCorrect ? 'DOĞRU! ✅' : 'PAS ⏭️',
      color: isCorrect ? '#00E676' : '#FF9100',
      startTime: performance.now(),
      duration: 750
    };
  }

  // Görüntü Kalibrasyonu: Aspect Ratio koruyarak ortalama (Object-fit: Cover)
  drawCalibratedVideo(ctx, width, height) {
    // Aktif ve hazır olan video kaynağını belirle (DOM'daki previewElement veya hiddenVideo)
    let vSource = null;
    if (this.previewElement && this.previewElement.videoWidth > 0 && this.previewElement.readyState >= 2) {
      vSource = this.previewElement;
    } else if (this.hiddenVideo && this.hiddenVideo.videoWidth > 0 && this.hiddenVideo.readyState >= 2) {
      vSource = this.hiddenVideo;
    } else if (this.previewElement && this.previewElement.readyState >= 2) {
      vSource = this.previewElement;
    } else {
      vSource = this.hiddenVideo;
    }

    if (!vSource || vSource.readyState < 2 || !vSource.videoWidth) {
      ctx.fillStyle = '#0B0E14';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const vWidth = vSource.videoWidth || width;
    const vHeight = vSource.videoHeight || height;

    const hRatio = width / vWidth;
    const vRatio = height / vHeight;
    const scale = Math.max(hRatio, vRatio);

    const drawW = vWidth * scale;
    const drawH = vHeight * scale;
    const offsetX = (width - drawW) / 2;
    const offsetY = (height - drawH) / 2;

    ctx.save();
    // Sadece ön kamerada ayna efekti yap
    if (this.facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(vSource, -offsetX - drawW, offsetY, drawW, drawH);
    } else {
      ctx.drawImage(vSource, offsetX, offsetY, drawW, drawH);
    }
    ctx.restore();
  }

  renderHUDFrame() {
    if (!this.isRecording && !this.stream) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Kalibre edilmiş kamera görüntüsü
    this.drawCalibratedVideo(ctx, width, height);

    // 2. Sinematik gölgeler
    const topGrad = ctx.createLinearGradient(0, 0, 0, 130);
    topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, 130);

    const bottomGrad = ctx.createLinearGradient(0, height - 160, 0, height);
    bottomGrad.addColorStop(0, 'transparent');
    bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height - 160, width, 160);

    // 3. Üst Bar: Kategori & Sayaç & Canlı Skor
    ctx.save();
    ctx.fillStyle = 'rgba(255, 46, 147, 0.9)';
    ctx.beginPath();
    ctx.roundRect(28, 22, 290, 48, 14);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 21px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎉 Kafana Tak! • ${this.hudState.category || 'Oyun'}`, 42, 54);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width - 320, 22, 292, 48, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 21px "Outfit", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`⏱️ ${this.hudState.remainingTime}s  |  ✅ ${this.hudState.scoreCorrect}  ⏭️ ${this.hudState.scorePassed}`, width - 42, 54);
    ctx.restore();

    // 4. Alt Banner: O An Anlatılan Kelime
    if (this.hudState.word) {
      ctx.save();
      const rawText = this.hudState.word.toUpperCase();
      let fontSize = 46;
      if (rawText.length > 25) fontSize = 28;
      else if (rawText.length > 18) fontSize = 34;
      else if (rawText.length > 12) fontSize = 40;

      ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
      const textWidth = ctx.measureText(rawText).width;
      const bannerWidth = Math.min(Math.max(textWidth + 80, 420), width - 80);
      const bannerHeight = 72;
      const bannerX = (width - bannerWidth) / 2;
      const bannerY = height - 105;

      ctx.fillStyle = 'rgba(11, 14, 20, 0.88)';
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rawText, width / 2, bannerY + bannerHeight / 2 + 2);
      ctx.restore();
    }

    // 5. Damga Efekti
    if (this.hudState.stamp) {
      const stamp = this.hudState.stamp;
      const elapsed = performance.now() - stamp.startTime;

      if (elapsed < stamp.duration) {
        const progress = elapsed / stamp.duration;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.28;
        const alpha = 1 - Math.pow(progress, 2);

        ctx.save();
        ctx.translate(width / 2, height / 2 - 20);
        ctx.scale(scale, scale);
        ctx.rotate(-0.06);
        ctx.globalAlpha = Math.max(alpha, 0);

        ctx.fillStyle = stamp.color;
        ctx.beginPath();
        ctx.roundRect(-220, -55, 440, 110, 26);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = '900 52px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stamp.text, 0, 4);

        ctx.restore();
      } else {
        this.hudState.stamp = null;
      }
    }

    if (this.isRecording) {
      this.renderLoopId = requestAnimationFrame(() => this.renderHUDFrame());
    }
  }

  getSupportedMimeType(preferred = null) {
    const fmt = preferred || this.preferredFormat || 'webm';
    let types = [];
    if (fmt === 'mp4') {
      types = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm'
      ];
    } else {
      // Android WebView'da WebM (VP8/Opus) varsayılan ve en stabil format
      types = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4'
      ];
    }

    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  startRecording() {
    if (!this.stream) {
      console.warn('[CameraRecorder] Kayıt için aktif kamera akışı bulunamadı.');
      return false;
    }

    const videoTracks = this.stream.getVideoTracks();
    const audioTracks = this.stream.getAudioTracks();

    console.log(`[CameraRecorder] Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`);
    if (videoTracks.length === 0) {
      console.error('[CameraRecorder] Akışta video track yok!');
      return false;
    }

    // Video ve ses track'lerinin canlı olduğundan emin ol
    videoTracks.forEach(t => { t.enabled = true; });
    audioTracks.forEach(t => { t.enabled = true; });

    this.recordedChunks = [];
    this.videoBlob = null;
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = null;
    }

    try {
      this.isRecording = true;

      // DOĞRUDAN CİHAZ KAMERA VE MİKROFON AKIŞINI KAYDET (Donanım Seviyesinde Garantili Görüntü)
      const recordStream = this.stream;
      const mimeType = this.getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};

      try {
        this.mediaRecorder = new MediaRecorder(recordStream, options);
      } catch (recErr) {
        console.warn('[CameraRecorder] Belirtilen mimeType ile başlatılamadı, varsayılan deneniyor:', recErr);
        this.mediaRecorder = new MediaRecorder(recordStream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log(`[CameraRecorder] Chunk: ${event.data.size}b, Toplam: ${this.recordedChunks.length}`);
        }
      };

      this.mediaRecorder.onerror = (e) => {
        console.error('[CameraRecorder] MediaRecorder hata verdi:', e);
      };

      this.mediaRecorder.start(1000);
      console.log(`[CameraRecorder] Kamera ve mikrofon kaydı BAŞLADI. Mime: ${this.mediaRecorder.mimeType}`);
      return true;
    } catch (err) {
      console.error('[CameraRecorder] MediaRecorder başlatılamadı:', err);
      this.isRecording = false;
      return false;
    }
  }

  async stopRecording() {
    this.isRecording = false;
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }

    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      console.warn('[CameraRecorder] MediaRecorder bulunamadı veya pasif.');
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        console.log(`[CameraRecorder] Kayıt durdu. Toplam chunk sayısı: ${this.recordedChunks.length}`);
        if (this.recordedChunks.length === 0) {
          console.warn('[CameraRecorder] Chunk listesi boş!');
          resolve(null);
          return;
        }
        const mimeType = this.mediaRecorder.mimeType || 'video/webm';
        this.videoBlob = new Blob(this.recordedChunks, { type: mimeType });
        this.videoUrl = URL.createObjectURL(this.videoBlob);
        console.log(`[CameraRecorder] Video hazır: ${(this.videoBlob.size / 1024).toFixed(1)} KB`);
        resolve({
          blob: this.videoBlob,
          url: this.videoUrl,
          mimeType: mimeType
        });
      };

      try {
        if (this.mediaRecorder.state === 'recording') {
          try { this.mediaRecorder.requestData(); } catch (e) {}
        }
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('[CameraRecorder] MediaRecorder stop hatası:', e);
        resolve(null);
      }
    });
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async saveVideoToNativeCache(filename) {
    if (!this.videoBlob) return null;
    const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const Filesystem = window.Capacitor?.Plugins?.Filesystem;
    if (!isCapacitor || !Filesystem) return null;

    try {
      const ext = (this.videoBlob.type && this.videoBlob.type.includes('mp4')) ? 'mp4' : 'webm';
      const cleanName = (filename || 'kafanatak-parti-videosu').replace(/\.(webm|mp4)$/, '') + '.' + ext;
      const base64Data = await this.blobToBase64(this.videoBlob);

      const writeResult = await Filesystem.writeFile({
        path: cleanName,
        data: base64Data,
        directory: 'CACHE',
        recursive: true
      });
      console.log('[CameraRecorder] Video yerel önbelleğe kaydedildi:', writeResult.uri);
      return { uri: writeResult.uri, filename: cleanName };
    } catch (err) {
      console.error('[CameraRecorder] Yerel dosyaya yazma hatası:', err);
      return null;
    }
  }

  async downloadVideo(filename = 'kafanatak-komik-anlar.webm') {
    if (!this.videoBlob && !this.videoUrl) return { success: false, reason: 'no_video' };

    const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const Filesystem = window.Capacitor?.Plugins?.Filesystem;
    const Share = window.Capacitor?.Plugins?.Share;

    // 1. Android / Native Capacitor: Yerel belleğe kaydet ve sistem paylaşım/kaydet menüsünü aç
    if (isCapacitor && Filesystem) {
      try {
        const saved = await this.saveVideoToNativeCache(filename);
        if (saved && saved.uri) {
          if (Share) {
            try {
              await Share.share({
                title: 'Parti Videosunu Kaydet 💾',
                text: 'Kafana Tak! parti videosu hazır. Cihazına kaydet veya paylaş!',
                url: saved.uri,
                dialogTitle: 'Videoyu Kaydet veya Paylaş'
              });
              return { success: true, native: true, uri: saved.uri };
            } catch (shareErr) {
              console.warn('[CameraRecorder] Share penceresi kapatıldı veya hata:', shareErr);
              return { success: true, native: true, uri: saved.uri };
            }
          }
          return { success: true, native: true, uri: saved.uri };
        }
      } catch (nativeErr) {
        console.warn('[CameraRecorder] Native kaydetme başarısız, web fallback deneniyor:', nativeErr);
      }
    }

    // 2. Tarayıcı / Web Fallback: Blob URL üzerinden <a download>
    if (this.videoUrl) {
      try {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this.videoUrl;
        const ext = this.videoBlob && this.videoBlob.type.includes('mp4') ? '.mp4' : '.webm';
        a.download = (filename || 'kafanatak-komik-anlar').replace(/\.(webm|mp4)$/, '') + ext;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) document.body.removeChild(a);
        }, 150);
        return { success: true, native: false };
      } catch (webErr) {
        console.error('[CameraRecorder] Web indirme hatası:', webErr);
        return { success: false, reason: webErr.message };
      }
    }
    return { success: false, reason: 'unknown' };
  }

  async shareVideo() {
    if (!this.videoBlob && !this.videoUrl) return { success: false, reason: 'no_video' };

    const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const Share = window.Capacitor?.Plugins?.Share;

    // 1. Native Capacitor Paylaşımı
    if (isCapacitor && Share) {
      try {
        const saved = await this.saveVideoToNativeCache(`kafanatak-parti-${Date.now()}`);
        if (saved && saved.uri) {
          await Share.share({
            title: 'Kafana Tak! Komik Parti Kaydımız 😂',
            text: 'Kafana Tak! oynarken çektiğimiz komik anlar 🎬🎉',
            url: saved.uri,
            dialogTitle: 'Parti Videosunu Paylaş'
          });
          return { success: true, native: true };
        }
      } catch (err) {
        console.warn('[CameraRecorder] Native share hatası veya iptal:', err);
        return { success: false, error: err };
      }
    }

    // 2. Web Share API Fallback
    if (navigator.share && this.videoBlob) {
      try {
        const ext = this.videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([this.videoBlob], `kafanatak-parti-videosu.${ext}`, {
          type: this.videoBlob.type
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Kafana Tak! Komik Parti Kaydımız 😂',
            text: 'Kafana Tak! oynarken çektiğimiz komik anlar 🎬🎉'
          });
          return { success: true, native: false };
        }
      } catch (err) {
        console.warn('[CameraRecorder] Web Share iptal edildi veya desteklenmiyor:', err);
        return { success: false, error: err };
      }
    }

    return { success: false, reason: 'unsupported' };
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.hasPermission = false;
    }
    if (this.hiddenVideo) {
      this.hiddenVideo.srcObject = null;
    }
    if (this.previewElement) {
      this.previewElement.srcObject = null;
    }
    if (this.bgVideo) {
      this.bgVideo.srcObject = null;
    }
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }
}
