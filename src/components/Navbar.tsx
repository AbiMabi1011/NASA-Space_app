import React from 'react';

export interface NavbarProps {
  onOpenTour: () => void;
}

export default function Navbar({ onOpenTour }: NavbarProps): React.JSX.Element {
  return (
    <nav className="main-nav-bar" id="mainNavBar">
      <div className="site-container nav-inner">
        <a className="nav-brand" href="#top" aria-label="FieldShift AgriVision">
          <div className="brand-leaf-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
            </svg>
          </div>
          <div className="brand-text-wrap">
            <span className="brand-name">field<span className="brand-accent">shift</span></span>
            <span className="brand-sub">AgriVision Decision AI</span>
          </div>
        </a>

        {/* Main Navigation Menu */}
        <div className="nav-links" role="navigation" aria-label="Main menu">
          <a className="nav-item active" href="#top" data-section="home">Home</a>
          <a className="nav-item" href="#overview" data-section="overview">Field Overview</a>
          <a className="nav-item" href="#monitoring" data-section="monitoring">Monitoring &amp; Zones</a>
          <a className="nav-item" href="#planner" data-section="planner">Rotation Planner</a>
          <a className="nav-item" href="#climate" data-section="climate">NASA Climate</a>
          <a className="nav-item" href="#services" data-section="services">Services</a>
        </div>

        {/* Header Action Buttons */}
        <div className="nav-actions">
          <button
            id="openTourBtn"
            type="button"
            className="tour-pill"
            aria-label="Open guided walkthrough"
            onClick={onOpenTour}
          >
            <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6m-4 4h2m-5-8.5a7 7 0 1 1 8 0c-.8 1-1.5 2-1.5 3.5h-5c0-1.5-.7-2.5-1.5-3.5z"/>
            </svg>
            <span>Interactive Tour</span>
          </button>
          <a href="#planner" className="btn-predict-pill" id="heroPredictBtn">
            <span>Predict Now</span>
            <span className="btn-dot-live"></span>
          </a>
        </div>
      </div>
    </nav>
  );
}
