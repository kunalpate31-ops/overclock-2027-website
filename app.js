/**
 * OVERCLOCK 2027 — APPLICATION LOGIC & BUREAU INTERACTIVITY
 * FCRIT × IEEE Student Branch
 * Features:
 * 1. Web Audio API sound synthesis (relay clicks, stamp thunk, flip-clock clicks).
 * 2. Session-cached fast boot sequence (max 2.5s).
 * 3. Scroll-linked Prime Timeline pulse runner & section rubber stamper.
 * 4. Hero clock animator with 60s overclock spin.
 * 5. 555 Timer "Sync the Clock" interactive mini puzzle solver.
 * 6. Dynamic Sponsors ("Authorized Partners") tier generator & card stamper.
 * 7. FAQ Manila folder typewriter expansion.
 * 8. Real-time live clock in Corner HUD.
 * 9. "Open a Case File" modal handler.
 */

class OverclockApp {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;
    this.hasBooted = sessionStorage.getItem('oc2027_booted') === 'true';
    
    // Puzzle state
    this.puzzleSwitches = { 1: false, 2: false, 3: false };
    this.puzzleSolved = false;

    // Sponsors state
    this.sponsorsStamped = false;

    this.init();
  }

  init() {
    this.setupAudio();
    this.setupBootSequence();
    this.setupHeroClock();
    this.setupPrimeTimeline();
    this.setupPuzzle();
    this.setupSponsorsSection();
    this.setupFAQ();
    this.setupLiveHUDClock();
    this.setupModals();
  }

  /* ==========================================================
     1. WEB AUDIO SYNTHESIZER
  ========================================================== */
  setupAudio() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.audioEnabled = !this.audioEnabled;
      audioBtn.style.color = this.audioEnabled ? '#7CFF9B' : '#D9A93A';
      audioBtn.style.borderColor = this.audioEnabled ? '#7CFF9B' : '#D9A93A';
      
      if (this.audioEnabled) {
        this.playRelayClick();
      }
    });
  }

  playRelayClick(freq = 1200) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  }

  playStampThunk() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.13);
    } catch (e) {}
  }

  /* ==========================================================
     2. FAST BOOTLOADER SEQUENCE (MAX 2.5S)
  ========================================================== */
  setupBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    const fill = document.getElementById('boot-progress-fill');
    const lines = document.querySelectorAll('.boot-line');
    
    if (!overlay) return;

    if (this.hasBooted) {
      overlay.classList.add('hidden');
      return;
    }

    const finishBoot = () => {
      overlay.classList.add('hidden');
      sessionStorage.setItem('oc2027_booted', 'true');
      this.playRelayClick(880);
    };

    overlay.addEventListener('click', finishBoot);
    window.addEventListener('keydown', finishBoot, { once: true });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= lines.length) {
        lines[step - 1].classList.add('active');
        if (fill) fill.style.width = `${(step / lines.length) * 100}%`;
        this.playRelayClick(600 + step * 150);
      } else {
        clearInterval(interval);
        setTimeout(finishBoot, 350);
      }
    }, 450);
  }

  /* ==========================================================
     3. HERO CLOCK ANIMATION WITH 60S OVERCLOCK SPIN
  ========================================================== */
  setupHeroClock() {
    const secHand = document.getElementById('hero-clock-sec');
    const minHand = document.getElementById('hero-clock-min');
    const hourHand = document.getElementById('hero-clock-hour');
    if (!secHand) return;

    let seconds = 0;
    let isOverclockSpin = false;

    setInterval(() => {
      seconds++;
      if (seconds % 60 === 0) {
        // Trigger fast 60s overclock spin
        isOverclockSpin = true;
        secHand.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        secHand.style.transform = `rotate(${seconds * 6 + 720}deg)`;
        this.playRelayClick(1800);
        setTimeout(() => {
          secHand.style.transition = 'none';
          isOverclockSpin = false;
        }, 850);
      } else if (!isOverclockSpin) {
        secHand.style.transform = `rotate(${seconds * 6}deg)`;
      }

      if (minHand) minHand.style.transform = `rotate(${seconds * 0.1}deg)`;
      if (hourHand) hourHand.style.transform = `rotate(${seconds * (0.1 / 12) + 45}deg)`;
    }, 1000);
  }

  /* ==========================================================
     4. PRIME TIMELINE (SCROLL TRACKER & SECTION STAMPING)
  ========================================================== */
  setupPrimeTimeline() {
    const sections = document.querySelectorAll('.bureau-section');
    const activeTrace = document.getElementById('active-timeline-trace');
    const pulseRunner = document.getElementById('timeline-pulse-runner');
    const hudSection = document.getElementById('hud-section-label');
    const navLinks = document.querySelectorAll('.nav-item-link');

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // 1. Update SVG Trace and Pulse
      const svgHeight = 1000;
      const currentY = progress * svgHeight;
      if (activeTrace) activeTrace.setAttribute('y2', currentY);
      if (pulseRunner) pulseRunner.setAttribute('cy', currentY);

      // 2. Check sections in view
      sections.forEach((sec, idx) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.7) {
          if (!sec.classList.contains('stamped')) {
            sec.classList.add('stamped');
            const stampBadge = sec.querySelector('.section-rubber-stamp');
            const secNum = sec.dataset.sectionNum || `0${idx + 1}`;
            if (stampBadge) stampBadge.textContent = `LOGGED #${secNum}`;
            this.playStampThunk();

            // Special trigger for sponsors section card cascade
            if (sec.id === 'sponsors') {
              this.animateSponsorCards();
            }
          }
        }

        // Active navigation indicator & HUD
        if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
          const secId = sec.getAttribute('id');
          if (hudSection) hudSection.textContent = `SECTION 0${idx + 1}/09`;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${secId}`) link.classList.add('active');
            else link.classList.remove('active');
          });
        }
      });
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
  }

  /* ==========================================================
     5. MINI PUZZLE: 555 TIMER "SYNC THE CLOCK"
  ========================================================== */
  setupPuzzle() {
    const sw1 = document.getElementById('puzzle-sw-1');
    const sw2 = document.getElementById('puzzle-sw-2');
    const sw3 = document.getElementById('puzzle-sw-3');
    const led = document.getElementById('puzzle-led-indicator');
    const clockHand = document.getElementById('sync-clock-hand');
    const statusText = document.getElementById('puzzle-status');
    const ctaBtn = document.getElementById('puzzle-unlocked-cta');
    const solutionBtn = document.getElementById('puzzle-solution-btn');

    if (!sw1 || !sw2 || !sw3) return;

    const checkPuzzleState = () => {
      // Correct solution combination: SW1: ON, SW2: OFF, SW3: ON
      const isSynced = this.puzzleSwitches[1] === true && 
                       this.puzzleSwitches[2] === false && 
                       this.puzzleSwitches[3] === true;

      this.playRelayClick(800 + Math.random() * 400);

      if (isSynced && !this.puzzleSolved) {
        this.puzzleSolved = true;
        if (led) {
          led.style.background = '#7CFF9B';
          led.style.boxShadow = '0 0 12px #7CFF9B';
        }
        if (clockHand) clockHand.style.transform = 'rotate(360deg)';
        if (statusText) {
          statusText.textContent = 'OUTPUT HIGH — CLOCK SYNCHRONIZED. CLEARED FOR BUILD!';
          statusText.classList.add('success');
        }
        if (ctaBtn) {
          ctaBtn.style.opacity = '1';
          ctaBtn.style.pointerEvents = 'auto';
          ctaBtn.textContent = 'Open a Case File';
          ctaBtn.style.boxShadow = '0 0 20px rgba(124, 255, 155, 0.6)';
        }
        this.playStampThunk();
      } else if (!isSynced) {
        this.puzzleSolved = false;
        if (led) {
          led.style.background = '#443';
          led.style.boxShadow = 'none';
        }
        const angle = (this.puzzleSwitches[1] ? 90 : 0) + 
                      (this.puzzleSwitches[2] ? 120 : 0) + 
                      (this.puzzleSwitches[3] ? 150 : 0);
        if (clockHand) clockHand.style.transform = `rotate(${angle}deg)`;
        if (statusText) {
          statusText.textContent = 'Status: Clock unsynchronized. Toggle switches to align frequency.';
          statusText.classList.remove('success');
        }
      }
    };

    const toggle = (swEl, num) => {
      this.puzzleSwitches[num] = !this.puzzleSwitches[num];
      swEl.classList.toggle('active', this.puzzleSwitches[num]);
      checkPuzzleState();
    };

    sw1.addEventListener('click', () => toggle(sw1, 1));
    sw2.addEventListener('click', () => toggle(sw2, 2));
    sw3.addEventListener('click', () => toggle(sw3, 3));

    if (solutionBtn) {
      solutionBtn.addEventListener('click', () => {
        this.puzzleSwitches[1] = true; sw1.classList.add('active');
        this.puzzleSwitches[2] = false; sw2.classList.remove('active');
        this.puzzleSwitches[3] = true; sw3.classList.add('active');
        checkPuzzleState();
      });
    }
  }

  /* ==========================================================
     6. SPONSORS ("AUTHORIZED PARTNERS") SECTION
  ========================================================== */
  setupSponsorsSection() {
    const container = document.getElementById('sponsors-tier-container');
    const contactBtn = document.getElementById('sponsor-contact-btn');
    const brochureBtn = document.getElementById('sponsor-brochure-btn');

    if (!container || typeof window.getSponsorsData !== 'function') return;

    const sponsors = window.getSponsorsData();
    const config = window.SPONSORS_CONFIG || {};

    // Setup action buttons
    if (contactBtn && config.sponsorContactEmail) {
      contactBtn.href = config.sponsorContactEmail;
    }
    if (brochureBtn) {
      if (config.brochureUrl) {
        brochureBtn.href = config.brochureUrl;
        brochureBtn.style.display = 'inline-flex';
      } else {
        brochureBtn.style.display = 'none';
      }
    }

    // Group sponsors by tiers
    container.innerHTML = '';
    const tiers = config.tiers || [];

    tiers.forEach(tierDef => {
      const tierSponsors = sponsors.filter(s => s.tier === tierDef.id);
      
      // Automatic rule: hide tier if 0 sponsors
      if (tierSponsors.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'tier-section-group';

      // Tier Divider Label
      const labelEl = document.createElement('div');
      labelEl.className = 'tier-divider-label';
      labelEl.textContent = tierDef.title;
      groupEl.appendChild(labelEl);

      // Grid Container based on Tier
      const gridEl = document.createElement('div');
      if (tierDef.id === 'TITLE') {
        gridEl.className = 'tier-title-container';
      } else if (tierDef.id === 'GOLD') {
        gridEl.className = 'tier-gold-grid';
      } else {
        gridEl.className = 'tier-silver-grid';
      }

      tierSponsors.forEach((sponsor, sIdx) => {
        const card = document.createElement('a');
        card.href = sponsor.url || '#';
        card.target = sponsor.url && sponsor.url !== '#' ? '_blank' : '_self';
        card.rel = 'noopener noreferrer';
        card.className = `auth-clearance-card ${tierDef.cardClass}`;
        card.dataset.sponsorIndex = sIdx;

        // Pushpin
        const pushpin = document.createElement('div');
        pushpin.className = 'card-pushpin-head';
        card.appendChild(pushpin);

        // Auth Clearance No
        const authNum = document.createElement('div');
        authNum.className = 'card-auth-number';
        authNum.textContent = `AUTH. NO. ${sponsor.id}`;
        card.appendChild(authNum);

        // Logo Container
        const logoBox = document.createElement('div');
        logoBox.className = 'card-logo-container';
        if (sponsor.logo) {
          const img = document.createElement('img');
          img.src = sponsor.logo;
          img.alt = `${sponsor.name} Logo`;
          img.style.maxHeight = '80%';
          img.style.maxWidth = '80%';
          img.style.objectFit = 'contain';
          logoBox.appendChild(img);
        } else {
          const placeholder = document.createElement('span');
          placeholder.className = 'card-logo-placeholder-text';
          placeholder.textContent = 'LOGO';
          logoBox.appendChild(placeholder);
        }
        card.appendChild(logoBox);

        // Sponsor Name
        const nameEl = document.createElement('div');
        nameEl.className = 'card-sponsor-name';
        nameEl.textContent = sponsor.name;
        card.appendChild(nameEl);

        // Tier Stamp Badge
        const tierBadge = document.createElement('div');
        tierBadge.className = `card-tier-stamp ${tierDef.badgeClass}`;
        tierBadge.textContent = tierDef.stampText;
        card.appendChild(tierBadge);

        // Approved Stamp Watermark
        const stampWatermark = document.createElement('div');
        stampWatermark.className = 'card-approved-stamp';
        stampWatermark.textContent = 'APPROVED';
        card.appendChild(stampWatermark);

        gridEl.appendChild(card);
      });

      groupEl.appendChild(gridEl);
      container.appendChild(groupEl);
    });
  }

  animateSponsorCards() {
    if (this.sponsorsStamped) return;
    this.sponsorsStamped = true;

    const cards = document.querySelectorAll('.auth-clearance-card');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      cards.forEach(c => {
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
      return;
    }

    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
        card.style.opacity = '1';
        const tilt = index % 2 === 0 ? '-1.2deg' : '1.2deg';
        card.style.transform = `translateY(0) rotate(${tilt})`;
        if (index < 3) this.playStampThunk();
      }, index * 95);
    });
  }

  /* ==========================================================
     7. FAQ MANILA FOLDER TYPEWRITER EXPANSION
  ========================================================== */
  setupFAQ() {
    const folders = document.querySelectorAll('.case-folder-unit');
    folders.forEach(folder => {
      const bar = folder.querySelector('.folder-tab-bar');
      if (!bar) return;

      bar.addEventListener('click', () => {
        const wasOpen = folder.classList.contains('open');
        folders.forEach(f => f.classList.remove('open'));
        if (!wasOpen) {
          folder.classList.add('open');
          this.playRelayClick(950);
        }
      });
    });
  }

  /* ==========================================================
     8. LIVE CORNER HUD CLOCK
  ========================================================== */
  setupLiveHUDClock() {
    const clockEl = document.getElementById('hud-live-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s}`;
    };

    setInterval(updateClock, 1000);
    updateClock();
  }

  /* ==========================================================
     9. "OPEN A CASE FILE" MODAL
  ========================================================== */
  setupModals() {
    const modal = document.getElementById('case-file-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const triggers = document.querySelectorAll('.open-case-file-trigger');
    const form = document.getElementById('case-intake-form');

    if (!modal) return;

    const openModal = () => {
      modal.classList.add('open');
      this.playRelayClick(1100);
    };

    const closeModal = () => {
      modal.classList.remove('open');
    };

    triggers.forEach(t => t.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = 'LOGGED TO ARCHIVE ✓';
          submitBtn.style.background = '#7CFF9B';
          submitBtn.style.color = '#14100C';
        }
        this.playStampThunk();
        setTimeout(() => {
          closeModal();
          if (submitBtn) {
            submitBtn.textContent = 'Submit to Bureau Archive';
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            form.reset();
          }
        }, 1200);
      });
    }
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.overclockApp = new OverclockApp();
});
