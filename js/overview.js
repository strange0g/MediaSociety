/* ==========================================================================
   PISJ-ES MEDIA SOCIETY - OVERVIEW MODAL (FILMSTRIP / CONTACT SHEET)
   ========================================================================== */

class DeckOverview {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.slideTitles = [
      { num: "01", title: "Master Slate // Cover", icon: "fa-camera-retro", section: "COVER" },
      { num: "02", title: "Executive Summary & Pillars", icon: "fa-compass", section: "FOUNDATION" },
      { num: "03", title: "Legacy System Vulnerabilities", icon: "fa-triangle-exclamation", section: "AUDIT" },
      { num: "04", title: "Legacy Chaos vs Central Order", icon: "fa-check-double", section: "REFORM" },
      { num: "05", title: "Scope of Work & Deliverables", icon: "fa-layer-group", section: "SERVICES" },
      { num: "06", title: "Tools & Software Ecosystem", icon: "fa-terminal", section: "TOOLCHAIN" },
      { num: "07", title: "Governance & Chain of Command", icon: "fa-sitemap", section: "HIERARCHY" },
      { num: "08", title: "Inter-Society Collaboration", icon: "fa-handshake", section: "SYNERGY" },
      { num: "09", title: "6-Step Operational Lifecycle", icon: "fa-arrows-split-up-and-left", section: "LIFECYCLE" },
      { num: "10", title: "Zero-Disruption Academic Policy", icon: "fa-graduation-cap", section: "ACADEMICS" },
      { num: "11", title: "2-Tier Approval Pipeline", icon: "fa-lock", section: "SECURITY" },
      { num: "12", title: "Current Membership Roster", icon: "fa-users", section: "THE TEAM" },
      { num: "13", title: "Conclusion & Authorization", icon: "fa-signature", section: "RATIFY" }
    ];
  }

  init() {
    this.createModalDOM();
    const btn = document.getElementById('overviewBtn');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }

    const closeBtn = document.getElementById('overviewCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  createModalDOM() {
    let modal = document.getElementById('overviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'overviewModal';
      modal.className = 'overview-modal';
      modal.innerHTML = `
        <div class="overview-header">
          <div style="display:flex; align-items:center; gap: 12px;">
            <span class="tag-pill" style="background: var(--neon-yellow); color: var(--ink);">CONTACT SHEET // 13 SLIDES</span>
            <span style="font-size: 0.9rem; font-weight:800;">CLICK ANY FRAME TO NAVIGATE</span>
          </div>
          <button class="icon-control-btn" id="overviewCloseBtn" style="padding: 6px 14px; background: var(--neon-pink); color:white; border-color:white;">
            <i class="fa-solid fa-xmark"></i> CLOSE [ESC]
          </button>
        </div>
        <div class="overview-grid" id="overviewGrid"></div>
      `;
      document.body.appendChild(modal);
      this.modal = modal;
    }

    const grid = document.getElementById('overviewGrid');
    if (!grid) return;

    grid.innerHTML = '';
    this.slideTitles.forEach((item, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'overview-thumb';
      thumb.dataset.slideIdx = idx;
      thumb.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="tag-pill" style="font-size: 0.64rem; background: var(--neon-yellow);">${item.num} // ${item.section}</span>
          <i class="fa-solid ${item.icon}" style="font-size: 0.9rem; color: var(--ink-secondary);"></i>
        </div>
        <div style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 800; line-height: 1.15; margin: 8px 0;">
          ${item.title}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--ink-muted);">
          SLIDE ${idx + 1} OF 13
        </div>
      `;

      thumb.addEventListener('click', () => {
        if (window.deckEngine) {
          window.deckEngine.goToSlide(idx);
        }
        this.close();
      });

      grid.appendChild(thumb);
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.modal) {
      this.modal.classList.add('active');
      // Highlight current slide
      const currentIdx = window.deckEngine ? window.deckEngine.currentSlide : 0;
      const thumbs = this.modal.querySelectorAll('.overview-thumb');
      thumbs.forEach((t, idx) => {
        t.classList.toggle('current', idx === currentIdx);
      });
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }
}

window.deckOverview = new DeckOverview();

