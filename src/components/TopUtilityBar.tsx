import React from 'react';

export default function TopUtilityBar(): React.JSX.Element {
  return (
    <header className="top-utility-bar">
      <div className="site-container utility-inner">
        <div className="utility-left">
          <span className="utility-badge">
            <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
            </svg>
            NASA SPACE APPS 2026
          </span>
          <span className="utility-text">Challenge: <b>Field Shift · Adapting Farms with NASA Data</b></span>
          <span className="utility-divider">|</span>
          <span className="utility-status">
            <span className="live-pulse"></span>
            NASA POWER Daily Agroclimatology Sync: <b>Active</b>
          </span>
        </div>
        <div className="utility-right">
          <a href="tel:+94212223276" className="utility-link">
            <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +94 (21) 222-FARM
          </a>
          <span className="utility-divider">|</span>
          <div className="utility-socials">
            <a href="#about" title="NASA Knights Team" className="social-icon">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
              </svg>
            </a>
            <a href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer" title="NASA POWER Portal" className="social-icon">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/>
              </svg>
            </a>
          </div>
          <span className="team-tag">NASA Knights · Jaffna</span>
        </div>
      </div>
    </header>
  );
}
