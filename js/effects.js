/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - VISUAL & INTERACTION EFFECTS
   ========================================================================== */

class DeckEffects {
  constructor() {
    this.shutterOverlay = null;
  }

  init() {
    this.shutterOverlay = document.getElementById('shutterFlash');
    this.initTypewriter();
  }

  /* Shutter flash effect when changing slides */
  triggerShutterFlash() {
    if (!this.shutterOverlay) return;
    this.shutterOverlay.classList.add('flashing');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.shutterOverlay.classList.remove('flashing');
        }, 120);
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
        setTimeout(type, 28);
      }
    }
    setTimeout(type, 300);
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
          }, 600);
        }
      }
    } else {
      sigBox.classList.remove('sig-drawn');
    }
  }
}

window.deckEffects = new DeckEffects();
