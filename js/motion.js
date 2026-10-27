// Kafana Tak! - Gelişmiş Eğim (Tilt) Algılama & Canlı Donanım Kalibrasyon Motoru
// Çift Sensör Desteği: DeviceMotionEvent (İvmeölçer) + DeviceOrientationEvent (Jiroskop)

export class MotionDetector {
  constructor(options = {}) {
    this.onCorrect = options.onCorrect || (() => {});
    this.onPass = options.onPass || (() => {});
    this.onTiltStateChange = options.onTiltStateChange || (() => {});

    this.isActive = false;
    this.state = 'NEUTRAL'; // 'NEUTRAL', 'CORRECT', 'PASS', 'WAITING_RETURN', 'TOUCH_MODE'
    this.lastTriggerTime = 0;
    this.cooldownMs = 850;

    // Platform algılama
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Aktif sensör tipi: 'motion', 'orientation' veya 'none'
    this.sensorType = 'none';
    this.lastEventTime = 0;

    // Canlı okunan değerler
    this.currentRawZ = 0;
    this.currentDeltaZ = 0;
    this.currentDegrees = 0;

    // Kalıcı / Manuel Kalibrasyon
    const savedOffset = localStorage.getItem('kafanatak_neutral_z');
    this.manualNeutralZ = savedOffset !== null ? parseFloat(savedOffset) : null;
    this.calibratedNeutralZ = this.manualNeutralZ !== null ? this.manualNeutralZ : 0;
    this.isCalibrated = this.manualNeutralZ !== null;

    // Eşik açısı (Varsayılan 22 derece)
    const savedDegrees = localStorage.getItem('kafanatak_tilt_degrees');
    this.thresholdDegrees = savedDegrees !== null ? parseInt(savedDegrees, 10) : 22;
    this.returnDegrees = Math.round(this.thresholdDegrees * 0.45);

    // Eğim yönünü ters çevirme
    const savedInvert = localStorage.getItem('kafanatak_invert_tilt');
    this.invertTilt = savedInvert === 'true';

    // Dokunmatik mod
    const savedTouchOnly = localStorage.getItem('kafanatak_touch_only');
    this.touchOnlyMode = savedTouchOnly === 'true';

    this.handleMotion = this.handleMotion.bind(this);
    this.handleOrientation = this.handleOrientation.bind(this);
  }

  // iOS 13+ ve modern tarayıcı izin isteği
  static async requestSensorPermission() {
    let granted = true;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') granted = false;
      }
    } catch (e) {
      console.warn('DeviceOrientationEvent izni:', e);
    }

    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== 'granted') granted = false;
      }
    } catch (e) {
      console.warn('DeviceMotionEvent izni:', e);
    }
    return granted;
  }

  start() {
    this.isActive = true;
    this.state = 'NEUTRAL';
    this.lastTriggerTime = 0;

    window.addEventListener('devicemotion', this.handleMotion, { passive: true });
    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    this.onTiltStateChange('NEUTRAL', 0, 0);
  }

  stop() {
    this.isActive = false;
    this.state = 'NEUTRAL';
    window.removeEventListener('devicemotion', this.handleMotion);
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }

  // Duruşu sıfırla (Nötr olarak kaydet)
  saveCurrentAsNeutral() {
    this.calibratedNeutralZ = this.currentRawZ;
    this.manualNeutralZ = this.currentRawZ;
    this.isCalibrated = true;
    try {
      localStorage.setItem('kafanatak_neutral_z', this.currentRawZ.toString());
    } catch (e) {}
    console.log('Nötr Duruş Kaydedildi:', this.calibratedNeutralZ.toFixed(2));
    return this.calibratedNeutralZ;
  }

  // Geri sayım sonunda otomatik kalibre et
  calibrateNow() {
    if (this.manualNeutralZ === null) {
      this.calibratedNeutralZ = this.currentRawZ;
      this.isCalibrated = true;
    }
  }

  // 1. Birincil Sensör: İvmeölçer (DeviceMotionEvent)
  handleMotion(event) {
    if (!this.isActive) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.z === null || acc.z === undefined) return;

    this.sensorType = 'motion';
    this.lastEventTime = performance.now();

    let rawZ = acc.z;
    if (this.isIOS) {
      rawZ = -rawZ;
    }

    this.currentRawZ = rawZ;

    // İlk okumada henüz kalibrasyon yoksa tek seferlik kilitle
    if (!this.isCalibrated && this.manualNeutralZ === null) {
      this.calibratedNeutralZ = rawZ;
      this.isCalibrated = true;
    }

    // Telefon alındayken öne eğilince (ekran yere doğru) W3C standardında Z negatife doğru gider.
    // Dolayısıyla öne eğilme miktarı = -(rawZ - calibratedNeutralZ).
    let deltaZ = -(rawZ - this.calibratedNeutralZ);

    if (this.invertTilt) {
      deltaZ = -deltaZ;
    }

    this.currentDeltaZ = deltaZ;

    // Derece hesabı: arcsin(clamp(deltaZ / 9.8, -1, 1))
    const ratio = Math.max(-1, Math.min(1, deltaZ / 9.8));
    const degrees = Math.round(Math.asin(ratio) * (180 / Math.PI));
    this.currentDegrees = degrees;

    this.processTiltAngle(degrees, deltaZ);
  }

  // 2. İkincil Sensör: Jiroskop (DeviceOrientationEvent - Güçlü Fallback)
  handleOrientation(event) {
    if (!this.isActive) return;
    // Eğer DeviceMotionEvent zaten aktif olarak veri akışı sağlıyorsa çakışmayı önle
    if (this.sensorType === 'motion' && (performance.now() - this.lastEventTime < 350)) {
      return;
    }

    if (event.beta === null && event.gamma === null) return;
    this.sensorType = 'orientation';

    // Telefonun yatay (landscape) veya dikey tutuluşuna göre eğim açısını belirle
    let pitch = 0;
    const orientationAngle = Math.abs(window.orientation || screen.orientation?.angle || 0);
    const isLandscape = orientationAngle === 90 || orientationAngle === 270;

    if (isLandscape) {
      // Yatay modda öne/arkaya kafa hareketi gamma eksenini döndürür
      const angle = window.orientation || screen.orientation?.angle || 90;
      pitch = (angle === 90) ? (event.gamma || 0) : -(event.gamma || 0);
    } else {
      // Dikey modda beta ekseni (dik duruş ~90 derecedir)
      pitch = (event.beta || 90) - 90;
    }

    if (this.invertTilt) {
      pitch = -pitch;
    }

    const degrees = Math.round(Math.max(-90, Math.min(90, pitch)));
    this.currentDegrees = degrees;
    const deltaZ = Math.sin((degrees * Math.PI) / 180) * 9.8;
    this.currentDeltaZ = deltaZ;

    this.processTiltAngle(degrees, deltaZ);
  }

  processTiltAngle(degrees, deltaZ) {
    // Dokunmatik mod aktifse aksiyon tetikleme
    if (this.touchOnlyMode) {
      this.onTiltStateChange('TOUCH_MODE', deltaZ, degrees);
      return;
    }

    const now = performance.now();

    // 1. Kilit durumu: Hareketi yaptıktan sonra tekrar dik konuma dönülmesini bekle
    if (this.state === 'WAITING_RETURN') {
      if (Math.abs(degrees) < this.returnDegrees && (now - this.lastTriggerTime > 400)) {
        this.state = 'NEUTRAL';
        this.onTiltStateChange('NEUTRAL', deltaZ, degrees);
      }
      return;
    }

    // 2. ÖNE EĞİLME (Baş öne eğilir -> Açı eşikten büyük) -> DOĞRU! (Yeşil)
    if (degrees > this.thresholdDegrees) {
      this.triggerAction('CORRECT', deltaZ, degrees);
      return;
    }

    // 3. ARKAYA EĞİLME (Baş arkaya kalkar -> Açı -eşikten küçük) -> PAS! (Turuncu)
    if (degrees < -this.thresholdDegrees) {
      this.triggerAction('PASS', deltaZ, degrees);
      return;
    }

    // Nötr bölge
    if (this.state !== 'NEUTRAL') {
      this.state = 'NEUTRAL';
    }
    this.onTiltStateChange('NEUTRAL', deltaZ, degrees);
  }

  triggerAction(actionType, deltaZ, degrees) {
    const now = performance.now();
    if (now - this.lastTriggerTime < this.cooldownMs) return;

    this.state = 'WAITING_RETURN';
    this.lastTriggerTime = now;

    if (actionType === 'CORRECT') {
      this.onTiltStateChange('CORRECT', deltaZ, degrees);
      this.onCorrect();
    } else if (actionType === 'PASS') {
      this.onTiltStateChange('PASS', deltaZ, degrees);
      this.onPass();
    }
  }

  setSensitivityDegrees(deg) {
    const clampedDeg = Math.max(12, Math.min(45, deg));
    this.thresholdDegrees = clampedDeg;
    this.returnDegrees = Math.round(clampedDeg * 0.45);
    try {
      localStorage.setItem('kafanatak_tilt_degrees', clampedDeg.toString());
    } catch (e) {}
  }

  setSensitivity(preset) {
    if (preset === 'high') {
      this.setSensitivityDegrees(16);
    } else if (preset === 'low') {
      this.setSensitivityDegrees(30);
    } else {
      this.setSensitivityDegrees(22);
    }
  }

  getThresholdDegrees() {
    return this.thresholdDegrees || 22;
  }

  setInvert(invert) {
    this.invertTilt = !!invert;
    try {
      localStorage.setItem('kafanatak_invert_tilt', this.invertTilt.toString());
    } catch (e) {}
  }

  setTouchOnly(enabled) {
    this.touchOnlyMode = !!enabled;
    try {
      localStorage.setItem('kafanatak_touch_only', this.touchOnlyMode.toString());
    } catch (e) {}
  }
}
