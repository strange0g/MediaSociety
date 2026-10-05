/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - CORE PRESENTATION ENGINE
   Clicker Driven, Step-Reveal, Fullscreen, Speaker Notes & Responsive Handler
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
    this.notesBtn = null;
    this.helpBtn = null;

    this.isNotesOpen = false;
    this.isHelpOpen = false;

    this.touchStartX = 0;
    this.touchStartY = 0;

    // Tailored executive speaker talking points for all 13 slides
    this.speakerNotes = [
      {
        tag: "SLIDE 01 // MASTER SLATE",
        main: "Introduce ourselves (Raied Faisal, A2-B4 & Eshaal Waseem, A2-G5). Thank the Principal and Deputy Head for the privilege of presenting this proposal. State our central mission: establishing an official, permanent student media body for AY 2026-2027.",
        focus: "Direct accountability to school leadership; replacing informal ad-hoc groups with institutional discipline.",
        qa: "Q: Why now? A: Major events are coming up (MUN, Sports, Assemblies). A unified team prevents chaos before it starts."
      },
      {
        tag: "SLIDE 02 // FOUNDATIONAL FRAMEWORK",
        main: "Present our 4 core pillars: Responsible Representation, Equal Opportunity across high school grades, Institutional Support to all clubs/departments, and Absolute Integrity & Accountability.",
        focus: "Every photo, video, and design will reflect the high standards, Islamic values, and cultural prestige of PISJ-ES.",
        qa: "Q: Who ensures standards are maintained? A: The Co-Heads pre-screen every single asset before administrative submission."
      },
      {
        tag: "SLIDE 03 // VULNERABILITY AUDIT",
        main: "Respectfully analyze past event problems: Unregulated phone usage during class hours under the excuse of 'taking photos', inconsistent coverage quality, lost archival footage, and administrative friction.",
        focus: "The legacy model left the administration with high compliance risks and zero central oversight.",
        qa: "Q: How do we stop students wandering with phones? A: By introducing official, numbered Media Society Badges worn only during approved event times."
      },
      {
        tag: "SLIDE 04 // REFORM COMPARISON",
        main: "Walk through the before/after contrast: Fragmented teams -> 1 permanent body; Unregulated phones -> Official badges; Local lost files -> Central school OneDrive; Multiple contacts -> 1 direct line to Principal & Deputy Head.",
        focus: "Total simplification for the administration: one trusted entity to contact for all campus coverage.",
        qa: "Q: What happens if an event has multiple sessions? A: Roster rotations ensure balanced student coverage without academic fatigue."
      },
      {
        tag: "SLIDE 05 // SCOPE OF WORK",
        main: "Explain the 4 full-service capabilities: Professional Photography, Cinematic Videography (reels & full recordings), Graphic Design (posters, banners, displays), and Disciplined Post-Production.",
        focus: "Comprehensive in-house media agency for the school. No need to outsource or scramble for volunteer editors.",
        qa: "Q: Do we print posters? A: We design high-res print-ready graphics formatted for the school's existing display screens and bulletin boards."
      },
      {
        tag: "SLIDE 06 // TOOLCHAIN ECOSYSTEM",
        main: "Showcase the zero-cost software & hardware pipeline: Student-owned DSLR cameras and pro mobile phones, Canva & Photoshop for design, Premiere & CapCut for editing, and official OneDrive for archiving.",
        focus: "Zero budget strain on school administration. We leverage existing equipment and secure institutional cloud storage.",
        qa: "Q: Where are files stored permanently? A: On the school's official OneDrive cloud directory, strictly prohibiting local storage on personal devices."
      },
      {
        tag: "SLIDE 07 // HIERARCHY & GOVERNANCE",
        main: "Detail the clean 3-tier chain of command: Tier 1: Principal & Deputy Head (Executive Authority); Tier 2: Male Head & Female Head (Operational Leadership); Tier 3: Society Members.",
        focus: "No middle-tier bureaucracy. Direct communication, fast turnaround, and total administrative supremacy.",
        qa: "Q: Who has final say on contentious content? A: The Principal and Deputy Head hold absolute veto and approval authority."
      },
      {
        tag: "SLIDE 08 // INTER-SOCIETY SYNERGY",
        main: "Reassure school leadership on club harmony: Partner clubs (MUN, Debate, Sports) retain 100% creative autonomy over themes and storyboards; we act as their production team. Membership is non-exclusive.",
        focus: "We do not dictate other clubs' creative identity. We empower them with high-end cameras and editing.",
        qa: "Q: Can a member also compete in MUN or Sports? A: Yes! Flexible scheduling ensures zero conflict between media duties and active participation."
      },
      {
        tag: "SLIDE 09 // 6-STEP LIFECYCLE",
        main: "Demonstrate systematic discipline: Planning -> Coverage -> Central OneDrive Archiving -> Post-Production -> Admin Approval -> Release.",
        focus: "Rigorous SLA: Raw footage archived within 12 hours; edited deliverables submitted within 24-48 hours.",
        qa: "Q: What if an emergency release is needed? A: Fast-track protocol enables expedited Co-Head pre-screen and instant executive sign-off."
      },
      {
        tag: "SLIDE 10 // ZERO-DISRUPTION ACADEMICS",
        main: "Emphasize our uncompromising academic guarantee: Mandatory blackout during Mid-terms, Finals, and Mock exam periods. No coverage during class hours without advance written permission.",
        focus: "'Students first, creators second.' Active members must maintain satisfactory academic standing, or coverage privileges are suspended.",
        qa: "Q: How do we track student grades? A: Co-Heads cross-check term report cards and enforce automatic academic pause if needed."
      },
      {
        tag: "SLIDE 11 // TWO-TIER APPROVAL GATES",
        main: "Walk through the two mandatory security gates: Gate 01: Co-Head Quality & Decorum Audit. Gate 02: Principal & Deputy Head Executive Authorization.",
        focus: "ZERO content goes public without executive sign-off. Society members NEVER hold school social media login credentials.",
        qa: "Q: Who uploads to school social media? A: Approved media is handed over directly to the school's official PR coordinator / administrative channel."
      },
      {
        tag: "SLIDE 12 // MEMBERSHIP ROSTER",
        main: "Introduce our dedicated founding cohort of 8 A2 senior students (4 boys, 4 girls across classes A2-B4, A2-G5, A2-G4, A2-B7, A2-B6). Highlight our planned merit-based junior recruitment.",
        focus: "Balanced gender representation, high academic calibre, and proven multi-disciplinary skills in photography, editing, and graphic design.",
        qa: "Q: Why are they all A2? A: Initial founding cohort to set immediate professional standards; recruitment across younger grades starts next month."
      },
      {
        tag: "SLIDE 13 // CONCLUSION & AUTHORIZATION",
        main: "Summarize the transformation: From ad-hoc confusion to institutional excellence. Express complete openness to guidance, adjustments, and recommendations from the Deputy Head and Principal.",
        focus: "Invite the Principal and Deputy Head to review, suggest modifications, and formally ratify the charter.",
        qa: "Q: Next immediate step? A: Issue official student media badges, set up the shared OneDrive folder, and begin scheduled event coverage."
      }
    ];
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
    this.notesBtn = document.getElementById('notesToggleBtn');
    this.helpBtn = document.getElementById('helpBtn');

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

    if (this.notesBtn) {
      this.notesBtn.addEventListener('click', () => this.toggleNotes());
    }

    const closeNotesBtn = document.getElementById('closeNotesBtn');
    if (closeNotesBtn) {
      closeNotesBtn.addEventListener('click', () => this.closeNotes());
    }

    if (this.helpBtn) {
      this.helpBtn.addEventListener('click', () => this.toggleHelp());
    }

    const closeHelpBtn = document.getElementById('closeHelpBtn');
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener('click', () => this.closeHelp());
    }

    // Finale Action Buttons
    const replayBtn = document.getElementById('replayDeckBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (window.deckEffects) window.deckEffects.closeFinale();
        this.goToSlide(0);
      });
    }

    const overviewDeckBtn = document.getElementById('overviewDeckBtn');
    if (overviewDeckBtn) {
      overviewDeckBtn.addEventListener('click', () => {
        if (window.deckEffects) window.deckEffects.closeFinale();
        if (window.deckOverview) window.deckOverview.open();
      });
    }

    const closeFinaleBtn = document.getElementById('closeFinaleBtn');
    if (closeFinaleBtn) {
      closeFinaleBtn.addEventListener('click', () => {
        if (window.deckEffects) window.deckEffects.closeFinale();
      });
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
      this.progressBar.style.width = Math.min(100, Math.max(2, progressPercent)) + '%';
    }

    // 5. Update Slide Counters
    const slidePad = String(this.currentSlide + 1).padStart(2, '0');
    const totalPad = String(this.slides.length).padStart(2, '0');
    if (this.slideLabel) {
      this.slideLabel.textContent = 'SLIDE ' + slidePad + ' / ' + totalPad;
    }

    // 6. Update Action Buttons
    if (this.stepIndicator && this.nextBtnText && this.nextBtn) {
      if (totalSteps === 0 || this.currentStep >= totalSteps) {
        const isLastSlide = this.currentSlide === this.slides.length - 1;
        this.stepIndicator.textContent = isLastSlide ? "PRESENTATION CONCLUDED" : "READY FOR NEXT FRAME";
        this.nextBtnText.textContent = isLastSlide ? "FINISH" : "NEXT SLIDE";
        this.nextBtn.style.background = isLastSlide ? "var(--neon-green)" : "var(--neon-cyan)";
      } else {
        this.stepIndicator.textContent = 'POINT ' + (this.currentStep + 1) + ' OF ' + totalSteps;
        this.nextBtnText.textContent = "REVEAL POINT";
        this.nextBtn.style.background = "var(--neon-yellow)";
      }
    }

    if (this.prevBtn) {
      this.prevBtn.style.opacity = (this.currentSlide === 0 && this.currentStep === 0) ? "0.35" : "1";
    }

    // 7. Update Speaker Notes
    this.updateNotes();
  }

  advance() {
    const totalSteps = this.getMaxStepForSlide(this.currentSlide);

    // If at the very end of the presentation (Slide 13, all steps revealed), trigger finale!
    if (this.currentSlide === this.slides.length - 1 && this.currentStep >= totalSteps) {
      if (window.deckEffects) {
        window.deckEffects.triggerFinale();
      }
      return;
    }

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
    // If finale is currently open, close it first
    if (window.deckEffects && window.deckEffects.isFinaleOpen()) {
      window.deckEffects.closeFinale();
      return;
    }

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
    if (window.deckEffects && window.deckEffects.isFinaleOpen()) {
      window.deckEffects.closeFinale();
    }
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

  /* Speaker Notes HUD */
  toggleNotes() {
    if (this.isNotesOpen) this.closeNotes();
    else this.openNotes();
  }

  openNotes() {
    const drawer = document.getElementById('presenterDrawer');
    if (!drawer) return;
    this.isNotesOpen = true;
    drawer.classList.add('active');
    if (this.notesBtn) this.notesBtn.style.background = 'var(--neon-yellow)';
    if (window.deckAudio) window.deckAudio.playWhoosh();
    this.updateNotes();
  }

  closeNotes() {
    const drawer = document.getElementById('presenterDrawer');
    if (!drawer) return;
    this.isNotesOpen = false;
    drawer.classList.remove('active');
    if (this.notesBtn) this.notesBtn.style.background = 'white';
    if (window.deckAudio) window.deckAudio.playWhoosh();
  }

  updateNotes() {
    const note = this.speakerNotes[this.currentSlide];
    if (!note) return;

    const tagEl = document.getElementById('notesSlideTag');
    const mainEl = document.getElementById('notesMainPoint');
    const focusEl = document.getElementById('notesExecutiveFocus');
    const qaEl = document.getElementById('notesQA');

    if (tagEl) tagEl.textContent = note.tag;
    if (mainEl) mainEl.textContent = note.main;
    if (focusEl) focusEl.textContent = note.focus;
    if (qaEl) qaEl.innerHTML = note.qa;
  }

  /* Keyboard Shortcuts Help Modal */
  toggleHelp() {
    if (this.isHelpOpen) this.closeHelp();
    else this.openHelp();
  }

  openHelp() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    this.isHelpOpen = true;
    modal.classList.add('active');
    if (window.deckAudio) window.deckAudio.playWhoosh();
  }

  closeHelp() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    this.isHelpOpen = false;
    modal.classList.remove('active');
    if (window.deckAudio) window.deckAudio.playWhoosh();
  }

  handleKeyDown(e) {
    // If help modal is open
    if (this.isHelpOpen) {
      if (['Escape', 'h', 'H', '?'].includes(e.key)) {
        e.preventDefault();
        this.closeHelp();
      }
      return;
    }

    // If finale overlay is open
    if (window.deckEffects && window.deckEffects.isFinaleOpen()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.deckEffects.closeFinale();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        window.deckEffects.closeFinale();
        this.goToSlide(0);
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        window.deckEffects.closeFinale();
        if (window.deckOverview) window.deckOverview.open();
        return;
      }
    }

    // Ignore key events if overview modal is open (except Escape)
    if (window.deckOverview && window.deckOverview.isOpen) {
      if (e.key === 'Escape') {
        window.deckOverview.close();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (this.isNotesOpen) {
        this.closeNotes();
        return;
      }
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
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      this.toggleNotes();
    } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      this.toggleHelp();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      this.goToSlide(0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.goToSlide(this.slides.length - 1);
    }
  }
}

window.deckEngine = new DeckEngine();
