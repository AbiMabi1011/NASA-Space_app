import React from 'react';

export default function QuickRibbon(): React.JSX.Element {
  return (
    <section className="quick-action-ribbon" aria-label="Quick Agricultural Features">
      <div className="site-container ribbon-inner">
        <a href="#planner" className="ribbon-card">
          <div className="ribbon-icon-circle">
            <svg className="ui-icon-lg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="ribbon-text">
            <b>GPS Field Coordinates</b>
            <small>Precision 0.5° NASA climate grid</small>
          </div>
        </a>

        <a href="#recommendations" className="ribbon-card">
          <div className="ribbon-icon-circle">
            <svg className="ui-icon-lg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 12h6m-6 4h4" />
            </svg>
          </div>
          <div className="ribbon-text">
            <b>Field Decision Card</b>
            <small>Printable 1-page extension PDF</small>
          </div>
        </a>

        <a href="#climate" className="ribbon-card">
          <div className="ribbon-icon-circle">
            <svg className="ui-icon-lg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
            </svg>
          </div>
          <div className="ribbon-text">
            <b>NASA Agroclimatology</b>
            <small>10-Yr historical weather signals</small>
          </div>
        </a>

        <a href="#monitoring" className="ribbon-card">
          <div className="ribbon-icon-circle">
            <svg className="ui-icon-lg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
          <div className="ribbon-text">
            <b>Agro-Ecological Advisory</b>
            <small>Legumes, nitrogen &amp; drought fit</small>
          </div>
        </a>
      </div>
    </section>
  );
}
