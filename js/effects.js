/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - VISUAL & INTERACTION EFFECTS
   ========================================================================== */

class DeckEffects {
  constructor() {
    this.shutterOverlay = null;
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.confettiParticles = [];
    this.confettiAnimationId = null;
    this.timerInterval = null;
    this.startTime = null;
  }

  init() {
    this.shutterOverlay = document.getElementById('shutterFlash');
    this.confettiCanvas = document.getElementById('confettiCanvas');
    if (this.confettiCanvas) {
      this.confettiCtx = this.confettiCanvas.getContext('2d');
    }
    this.initTypewriter();
    this.initPresentationTimer();
  }

  /* Shutter flash effect when changing slides */
  triggerShutterFlash() {
    if (!this.shutterOverlay) return;
    this.shutterOverlay.classList.add('flashing');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.shutterOverlay.classList.remove('flashing');
      });
    });
  }

  /* Cover Slide Typewriter */
  initTypewriter() {
    const el = document.getElementById('heroTypewriter');
    if (!el) return;
    const fullText = "A Centralized, Synchronized & Professional Student Media Body.";
    el.textContent = "";
    let idx = 0;
    
    function type() {
      if (idx < fullText.length) {
        el.textContent += fullText.charAt(idx);
        idx++;
        setTimeout(type, 26);
      }
    }
    setTimeout(type, 300);
  }

  /* Live Presentation Stopwatch Timer */
  initPresentationTimer() {
    const timerEl = document.getElementById('recTimer');
    if (!timerEl) return;
    this.startTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const secs = String(elapsedSec % 60).padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  /* Trigger Signature & Stamp on Slide 13 */
  triggerSignatureAnimation(draw) {
    const sigBox = document.getElementById('signatureBox');
    if (!sigBox) return;

    if (draw) {
      if (!sigBox.classList.contains('sig-drawn')) {
        sigBox.classList.add('sig-drawn');
        if (window.deckAudio) {
          setTimeout(() => {
            window.deckAudio.playStampSlam();
          }, 650);
        }
      }
    } else {
      sigBox.classList.remove('sig-drawn');
    }
  }

  /* Confetti Celebration Particle Burst */
  launchConfetti() {
    if (!this.confettiCanvas) {
      this.confettiCanvas = document.getElementById('confettiCanvas');
      if (this.confettiCanvas) this.confettiCtx = this.confettiCanvas.getContext('2d');
    }
    if (!this.confettiCanvas || !this.confettiCtx) return;

    const canvas = this.confettiCanvas;
    const ctx = this.confettiCtx;
    canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight || window.innerHeight;

    const colors = ['#FFE600', '#00F0FF', '#FF3388', '#22C55E', '#8B5CF6', '#FFFFFF', '#FF6600'];
    this.confettiParticles = [];

    for (let i = 0; i < 140; i++) {
      this.confettiParticles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 100,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 1.2) * 16,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        gravity: 0.38,
        drag: 0.96,
        opacity: 1
      });
    }

    if (this.confettiAnimationId) cancelAnimationFrame(this.confettiAnimationId);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      for (let p of this.confettiParticles) {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive > 0) {
        this.confettiAnimationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }

  /* Trigger Grand Finale Curtain with Sound and Confetti */
  triggerFinale() {
    const overlay = document.getElementById('closingFinaleOverlay');
    if (!overlay) return;
    overlay.classList.add('active');

    if (window.deckAudio) {
      window.deckAudio.playFanfare();
      setTimeout(() => {
        if (window.deckAudio) window.deckAudio.playStampSlam();
      }, 500);
    }

    setTimeout(() => {
      this.launchConfetti();
    }, 150);
  }

  closeFinale() {
    const overlay = document.getElementById('closingFinaleOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    if (this.confettiCanvas && this.confettiCtx) {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
  }

  isFinaleOpen() {
    const overlay = document.getElementById('closingFinaleOverlay');
    return overlay ? overlay.classList.contains('active') : false;
  }
}

window.deckEffects = new DeckEffects();

