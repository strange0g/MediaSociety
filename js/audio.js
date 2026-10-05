/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - PROCEDURAL AUDIO ENGINE (WEB AUDIO API)
   Zero External Assets / High-Fidelity Synthesized Tactile Feedback
   ========================================================================== */

class DeckAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('deck_muted') === 'true';
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('deck_muted', String(this.isMuted));
    } catch (e) {}
    return this.isMuted;
  }

  /* Camera Shutter Click (Slide Advance) */
  playShutter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
    
    // Blade click 1 (mirror up)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.035);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.035);

    // Blade click 2 (shutter curtain)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.09);
    gain2.gain.setValueAtTime(0.18, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.09);
    } catch (e) {}
  }

  /* Tactile Mechanical Step Click (Point Reveal) */
  playStepClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.025);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
    } catch (e) {}
  }

  /* Deep Rubber Stamp Slam (Ratification) */
  playStampSlam() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
    } catch (e) {}
  }

  /* Celebratory Fanfare Arpeggio (Grand Finale Celebration) */
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === notes.length - 1 ? 0.6 : 0.22));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + (idx === notes.length - 1 ? 0.6 : 0.22));
      });
    } catch (e) {}
  }

  /* Smooth Air Whoosh (Transitions / Modals) */
  playWhoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
    } catch (e) {}
  }
}

window.deckAudio = new DeckAudioEngine();


// Add user gesture listeners to initialize audio context
const initAudioOnInteraction = () => {
  if (window.deckAudio) {
    window.deckAudio.init();
    // Once initialized, remove the listeners
    if (window.deckAudio.ctx && window.deckAudio.ctx.state === 'running') {
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('keydown', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
    }
  }
};

document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('keydown', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);
