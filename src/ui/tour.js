/**
 * Interactive Onboarding Tour & Guidance
 * Provides step-by-step novice guidance and UI spotlights with clean SVG icons.
 */

export const TOUR_STEPS = [
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66"/></svg>`,
    badge: 'STEP 1 OF 5 · WELCOME',
    title: 'Welcome to FieldShift!',
    text: 'Think of this as your climate-smart farming companion. FieldShift helps farmers and advisors test crop rotation ideas using 10 years of NASA Earth observations, soil notes, and local priorities.',
    tip: '<b>Goal:</b> Find resilient 3-crop sequences tailored to water constraints and historical rainfall.',
    target: '#overview'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    badge: 'STEP 2 OF 5 · FIELD NOTES',
    title: 'Set Your Field Conditions',
    text: 'Check your coordinates (defaults to Jaffna Peninsula, Sri Lanka). You can enter field soil notes like soil texture (Sandy, Clay, or Silt loam), approximate pH, and current crop baseline.',
    tip: '<b>Tip:</b> Changing soil texture adjusts crop affinities—groundnut loves sandy soil, while rice prefers clay.',
    target: '.summary-grid'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    badge: 'STEP 3 OF 5 · YOUR STRATEGY',
    title: 'Pick What Matters Most',
    text: 'Choose your top farm priority: <b>Save water</b>, <b>Build soil</b>, or <b>Steady income</b>. Watch the 3 rotation pathways instantly re-rank with transparent 1–100 heuristic match scores.',
    tip: '<b>Interactive:</b> Click "Build soil" to see green manure crops like Sunn hemp and Cowpea jump to the top.',
    target: '#planner'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg>`,
    badge: 'STEP 4 OF 5 · NASA CLIMATE',
    title: 'Inspect NASA Climate History',
    text: 'Scroll down to inspect real NASA POWER climate data. The year-by-year bar chart highlights seasons receiving less than 75% of the median rainfall (drier seasons).',
    tip: '<b>Seasonal insight:</b> Sri Lanka has two seasons: <em>Yala</em> (dry season, Mar–Aug) and <em>Maha</em> (wet monsoon, Sep–Feb).',
    target: '#climate'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6m-6 4h4"/></svg>`,
    badge: 'STEP 5 OF 5 · ACTIONABLE OUTPUT',
    title: 'Export a Field Decision Card',
    text: 'Once you find a rotation idea to discuss, click <b>"Download a field decision card"</b>. It generates a clean, printable 1-page PDF/HTML guide to take into conversations with extension officers.',
    tip: '<b>Trust:</b> FieldShift is an explainable decision aid, not a black-box yield forecast.',
    target: '#recommendations'
  }
];

export class GuidedTour {
  constructor() {
    this.currentStep = 0;
    this.backdrop = document.getElementById('tourBackdrop');
    this.badge = document.getElementById('tourStepBadge');
    this.icon = document.getElementById('tourIcon');
    this.title = document.getElementById('tourTitle');
    this.text = document.getElementById('tourText');
    this.tip = document.getElementById('tourTip');
    this.dotsContainer = document.getElementById('tourDots');
    this.nextBtn = document.getElementById('tourNextBtn');
    this.skipBtn = document.getElementById('tourSkipBtn');
    this.closeBtn = document.getElementById('tourCloseBtn');
    this.openBtn = document.getElementById('openTourBtn');

    this.init();
  }

  init() {
    if (!this.backdrop) return;

    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
    if (this.skipBtn) this.skipBtn.addEventListener('click', () => this.close());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.openBtn) this.openBtn.addEventListener('click', () => this.start());

    // Close on backdrop click outside dialog
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop.style.display !== 'none') {
        this.close();
      }
    });

    // Auto-show for first-time visitors
    try {
      const seen = localStorage.getItem('fieldshift_tour_seen');
      if (!seen) {
        setTimeout(() => this.start(), 800);
      }
    } catch {
      // Local storage disabled or file:/// origin restriction fallback
    }
  }

  start() {
    this.currentStep = 0;
    this.render();
    this.backdrop.style.display = 'flex';
  }

  close() {
    this.backdrop.style.display = 'none';
    try {
      localStorage.setItem('fieldshift_tour_seen', 'true');
    } catch {}
  }

  next() {
    if (this.currentStep < TOUR_STEPS.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.close();
    }
  }

  render() {
    const step = TOUR_STEPS[this.currentStep];
    if (!step) return;

    this.badge.textContent = step.badge;
    this.icon.innerHTML = step.icon;
    this.title.textContent = step.title;
    this.text.innerHTML = step.text;
    this.tip.innerHTML = step.tip;

    // Update dots
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = TOUR_STEPS.map((_, i) =>
        `<span class="tour-dot ${i === this.currentStep ? 'active' : ''}"></span>`
      ).join('');
    }
  }
}
