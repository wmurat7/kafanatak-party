// Kafana Tak! - Hafif ve Yüksek Performanslı Konfeti Motoru

export class ConfettiCannon {
  constructor(canvasElement = null) {
    if (!canvasElement) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      document.body.appendChild(this.canvas);
    } else {
      this.canvas = canvasElement;
    }

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(options = {}) {
    const count = options.count || 80;
    const colors = ['#FF2E93', '#00F5D4', '#FFE600', '#00E676', '#FF9100', '#B388FF'];
    const originX = options.x !== undefined ? options.x : this.canvas.width / 2;
    const originY = options.y !== undefined ? options.y : this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  // Çift taraflı havai fişek kutlaması (Tur veya Maç sonu için)
  celebrate() {
    this.fire({ x: this.canvas.width * 0.2, y: this.canvas.height * 0.7, count: 70 });
    this.fire({ x: this.canvas.width * 0.8, y: this.canvas.height * 0.7, count: 70 });

    setTimeout(() => {
      this.fire({ x: this.canvas.width * 0.5, y: this.canvas.height * 0.4, count: 90 });
    }, 350);
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Yerçekimi
      p.vx *= 0.98; // Hava direnci
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const confetti = new ConfettiCannon();
