import React from 'react';

export default function Footer(): React.JSX.Element {
  return (
    <footer className="site-footer" id="about">
      <div className="site-container footer-inner">
        {/* Brand & Mission Column */}
        <div className="footer-col footer-col-brand">
          <div className="footer-logo">
            <svg className="footer-leaf" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
            <span className="footer-brand-title">field<span className="brand-light">shift</span></span>
          </div>
          <p className="footer-desc">
            An explainable, climate-adaptive decision-support prototype developed for the NASA Space Apps Challenge 2026. 
            Connecting 10 years of NASA Earth observations with farmer priorities to champion sustainable agriculture.
          </p>
          <div className="footer-team-info">
            <b>NASA Knights · Jaffna Local Event</b>
            <small>Independent prototype · NASA does not endorse</small>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li><a href="#top">Home</a></li>
            <li><a href="#overview">Field Overview</a></li>
            <li><a href="#monitoring">Live Monitoring</a></li>
            <li><a href="#planner">Rotation Planner</a></li>
            <li><a href="#climate">NASA Climate Data</a></li>
            <li><a href="#services">Agricultural Services</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-col">
          <h4 className="footer-col-title">Resources</h4>
          <ul className="footer-links-list">
            <li><a href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer">NASA POWER Portal</a></li>
            <li><a href="https://gpm.nasa.gov/data/imerg" target="_blank" rel="noreferrer">NASA GPM IMERG</a></li>
            <li><a href="#climate">Agroclimatology Dictionary</a></li>
            <li><a href="#recommendations">Field Decision Card Export</a></li>
            <li><a href="https://www.spaceappschallenge.org" target="_blank" rel="noreferrer">Space Apps Challenge 2026</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-col">
          <h4 className="footer-col-title">Extension Contact</h4>
          <div className="footer-contact-info">
            <p>
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <strong>+94 (21) 222-FARM</strong>
            </p>
            <p>
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:info@fieldshift.agro">advisory@fieldshift.org</a>
            </p>
            <p>
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Jaffna Peninsula Dry Zone<br />Northern Province, Sri Lanka
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Sub-Bar */}
      <div className="footer-bottom-bar">
        <div className="site-container footer-bottom-inner">
          <span>© 2026 FieldShift AgriVision · Developed by <strong>NASA Knights</strong> for NASA Space Apps Challenge</span>
          <span>Empowering farmers with explainable open science and earth observations</span>
        </div>
      </div>
    </footer>
  );
}
