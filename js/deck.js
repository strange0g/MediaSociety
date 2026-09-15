/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - CORE PRESENTATION ENGINE
   Clicker Driven, Step-Reveal, Fullscreen & Responsive Handler
   ========================================================================== */

class DeckEngine {
  constructor() {
    this.slides = [];
    this.currentSlide = 0;
    this.currentStep = 0;

    this.slideLabel = null;
    this.stepIndicator = null;
    this.nextBtn = null;
    this.nextBtnText = null;
    this.prevBtn = null;
    this.progressBar = null;
    this.soundBtn = null;
    this.fsBtn = null;

    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  init() {
    this.slides = document.querySelectorAll('.slide');
    this.slideLabel = document.getElementById('slideIndexLabel');
    this.stepIndicator = document.getElementById('stepIndicator');
    this.nextBtn = document.getElementById('nextBtn');
    this.nextBtnText = document.getElementById('nextBtnText');
    this.prevBtn = document.getElementById('prevBtn');
    this.progressBar = document.getElementById('deckProgressBar');
    this.soundBtn = document.getElementById('soundToggleBtn');
    this.fsBtn = document.getElementById('fullscreenBtn');

    // Attach button listeners
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.advance());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.stepBack());

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => this.toggleSound());
      this.updateSoundBtnUI();
    }

    if (this.fsBtn) {
      this.fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Touch controls (swipe left / right)
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].screenX - this.touchStartX;
      const diffY = e.changedTouches[0].screenY - this.touchStartY;
      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 100) {
        if (diffX < 0) {
          this.advance();
        } else {
          this.stepBack();
        }
      }
    }, { passive: true });

    // Initial render
    this.updateUI();
  }

  getStepsForSlide(slideIdx) {
    if (!this.slides[slideIdx]) return [];
    return this.slides[slideIdx].querySelectorAll('.step-reveal');
  }

  getMaxStepForSlide(slideIdx) {
    if (!this.slides[slideIdx]) return 0;
    const steps = this.getStepsForSlide(slideIdx);
    let max = 0;
    steps.forEach((el) => {
      const s = parseInt(el.getAttribute('data-step') || "1", 10);
      if (s > max) max = s;
    });
    return max;
  }

  updateUI() {
    // 1. Activate slide
    this.slides.forEach((slide, idx) => {
      const isActive = idx === this.currentSlide;
      slide.classList.toggle('active', isActive);
      if (isActive && this.currentStep === 0) {
        slide.scrollTop = 0;
      }
    });

    const steps = this.getStepsForSlide(this.currentSlide);
    const totalSteps = this.getMaxStepForSlide(this.currentSlide);

    // 2. Reveal sub-steps
    steps.forEach((el) => {
      const stepNum = parseInt(el.getAttribute('data-step') || "1", 10);
      if (stepNum <= this.currentStep) {
        el.classList.add('revealed');
      } else {
        el.classList.remove('revealed');
      }
    });

    // 3. Trigger signature & ratification on final slide
    if (this.currentSlide === 12 && this.currentStep >= 2) {
      if (window.deckEffects) window.deckEffects.triggerSignatureAnimation(true);
    } else {
      if (window.deckEffects) window.deckEffects.triggerSignatureAnimation(false);
    }

    // 4. Update Header Progress Bar
    if (this.progressBar) {
      const progressPercent = ((this.currentSlide + (totalSteps > 0 ? this.currentStep / (totalSteps + 1) : 0)) / (this.slides.length - 1)) * 100;
      this.progressBar.style.width = `${Math.min(100, Math.max(2, progressPercent))}%`;
    }

    // 5. Update Slide Counters
    const slidePad = String(this.currentSlide + 1).padStart(2, '0');
    const totalPad = String(this.slides.length).padStart(2, '0');
    if (this.slideLabel) {
      this.slideLabel.textContent = `SLIDE ${slidePad} / ${totalPad}`;
    }

    // 6. Update Action Buttons
    if (this.stepIndicator && this.nextBtnText && this.nextBtn) {
      if (totalSteps === 0 || this.currentStep >= totalSteps) {
        const isLastSlide = this.currentSlide === this.slides.length - 1;
        this.stepIndicator.textContent = isLastSlide ? "PRESENTATION CONCLUDED" : "READY FOR NEXT FRAME";
        this.nextBtnText.textContent = isLastSlide ? "FINISH" : "NEXT SLIDE";
        this.nextBtn.style.background = isLastSlide ? "var(--neon-green)" : "var(--neon-cyan)";
      } else {
        this.stepIndicator.textContent = `POINT ${this.currentStep + 1} OF ${totalSteps}`;
        this.nextBtnText.textContent = "REVEAL POINT";
        this.nextBtn.style.background = "var(--neon-yellow)";
      }
    }

    if (this.prevBtn) {
      this.prevBtn.style.opacity = (this.currentSlide === 0 && this.currentStep === 0) ? "0.35" : "1";
    }
  }

  advance() {
    const totalSteps = this.getMaxStepForSlide(this.currentSlide);

    // Advance point on current slide
    if (this.currentStep < totalSteps) {
      this.currentStep++;
      if (window.deckAudio) window.deckAudio.playStepClick();
      this.updateUI();
      return;
    }

    // Advance to next slide
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.currentStep = 0;
      if (this.slides[this.currentSlide]) {
        this.slides[this.currentSlide].scrollTop = 0;
      }
      if (window.deckAudio) window.deckAudio.playShutter();
      if (window.deckEffects) window.deckEffects.triggerShutterFlash();
      this.updateUI();
    }
  }

  stepBack() {
    // Un-reveal point on current slide
    if (this.currentStep > 0) {
      this.currentStep--;
      if (window.deckAudio) window.deckAudio.playStepClick();
      this.updateUI();
      return;
    }

    // Move to previous slide (fully revealed)
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.currentStep = this.getMaxStepForSlide(this.currentSlide);
      if (this.slides[this.currentSlide]) {
        this.slides[this.currentSlide].scrollTop = 0;
      }
      if (window.deckAudio) window.deckAudio.playShutter();
      if (window.deckEffects) window.deckEffects.triggerShutterFlash();
      this.updateUI();
    }
  }

  goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < this.slides.length) {
      this.currentSlide = slideIndex;
      this.currentStep = 0;
      if (window.deckAudio) window.deckAudio.playShutter();
      if (window.deckEffects) window.deckEffects.triggerShutterFlash();
      this.updateUI();
    }
  }

  toggleSound() {
    if (window.deckAudio) {
      window.deckAudio.toggleMute();
      this.updateSoundBtnUI();
    }
  }

  updateSoundBtnUI() {
    if (!this.soundBtn || !window.deckAudio) return;
    const isMuted = window.deckAudio.isMuted;
    this.soundBtn.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i> MUTE' : '<i class="fa-solid fa-volume-high"></i> SFX';
    this.soundBtn.style.color = isMuted ? 'var(--ink-muted)' : 'var(--ink)';
  }

  toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  handleKeyDown(e) {
    // Ignore key events if modal is open (except Escape)
    if (window.deckOverview && window.deckOverview.isOpen) {
      if (e.key === 'Escape') {
        window.deckOverview.close();
      }
      return;
    }

    if ([' ', 'ArrowRight', 'PageDown', 'Enter'].includes(e.key)) {
      e.preventDefault();
      this.advance();
    } else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) {
      e.preventDefault();
      this.stepBack();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      this.toggleFullscreen();
    } else if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      if (window.deckOverview) window.deckOverview.toggle();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      this.toggleSound();
    }
  }
}

window.deckEngine = new DeckEngine();

