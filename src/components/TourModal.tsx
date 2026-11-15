import React, { useState } from 'react';

interface TourStep {
  icon: React.ReactNode;
  badge: string;
  title: string;
  text: string;
  tip: string;
  target: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66" />
      </svg>
    ),
    badge: 'STEP 1 OF 5 · WELCOME',
    title: 'Welcome to FieldShift!',
    text: 'Think of this as your climate-smart farming companion. FieldShift helps farmers and advisors test crop rotation ideas using 10 years of NASA Earth observations, soil notes, and local priorities.',
    tip: 'Find resilient 3-crop sequences tailored to water constraints and historical rainfall.',
    target: '#overview'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    badge: 'STEP 2 OF 5 · FIELD NOTES',
    title: 'Set Your Field Conditions',
    text: 'Check your coordinates (defaults to Jaffna Peninsula, Sri Lanka). You can enter field soil notes like soil texture (Sandy, Clay, or Silt loam), approximate pH, and current crop baseline.',
    tip: 'Changing soil texture adjusts crop affinities—groundnut loves sandy soil, while rice prefers clay.',
    target: '#overview'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    badge: 'STEP 3 OF 5 · YOUR STRATEGY',
    title: 'Pick What Matters Most',
    text: 'Choose your top farm priority: Save water, Build soil, or Steady income. Watch the 3 rotation pathways instantly re-rank with transparent 1–100 heuristic match scores.',
    tip: 'Click "Build soil" to see green manure crops like Sunn hemp and Cowpea jump to the top.',
    target: '#planner'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
      </svg>
    ),
    badge: 'STEP 4 OF 5 · NASA CLIMATE',
    title: 'Inspect NASA Climate History',
    text: 'Scroll down to inspect real NASA POWER climate data. The year-by-year bar chart highlights seasons receiving less than 75% of the median rainfall (drier seasons).',
    tip: 'Sri Lanka has two seasons: Yala (dry season, Mar–Aug) and Maha (wet monsoon, Sep–Feb).',
    target: '#climate'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 12h6m-6 4h4" />
      </svg>
    ),
    badge: 'STEP 5 OF 5 · ACTIONABLE OUTPUT',
    title: 'Export a Field Decision Card',
    text: 'Once you find a rotation idea to discuss, click "Download a field decision card". It generates a clean, printable 1-page PDF/HTML guide to take into conversations with extension officers.',
    tip: 'FieldShift is an explainable decision aid, not a black-box yield forecast.',
    target: '#recommendations'
  }
];

export interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TourModal({ isOpen, onClose }: TourModalProps): React.JSX.Element | null {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = (): void => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      const targetEl = document.querySelector(TOUR_STEPS[nextIdx].target);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onClose();
    }
  };

  const handlePrev = (): void => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      const targetEl = document.querySelector(TOUR_STEPS[prevIdx].target);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      className="tour-backdrop"
      id="tourBackdrop"
      style={{ display: 'flex' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tourTitle"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'tourBackdrop') onClose();
      }}
    >
      <div className="tour-modal">
        <div className="tour-header">
          <span className="tour-badge" id="tourStepBadge">{step.badge}</span>
          <button className="tour-close" id="tourCloseBtn" aria-label="Close tour" onClick={onClose}>
            <svg className="close-svg inline-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="tour-body">
          <div className="tour-icon" id="tourIcon">
            {step.icon}
          </div>
          <h2 id="tourTitle">{step.title}</h2>
          <p id="tourText">{step.text}</p>
          <div className="tour-tip" id="tourTip">
            <b>Tip:</b> {step.tip}
          </div>
        </div>
        <div className="tour-footer">
          <div className="tour-dots" id="tourDots">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`tour-dot ${i === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(i)}
              />
            ))}
          </div>
          <div className="tour-actions">
            {currentStep > 0 && (
              <button type="button" className="tour-btn-skip" onClick={handlePrev}>
                Back
              </button>
            )}
            <button type="button" className="tour-btn-skip" id="tourSkipBtn" onClick={onClose}>
              Skip Tour
            </button>
            <button type="button" className="tour-btn-next" id="tourNextBtn" onClick={handleNext}>
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
