import React from 'react';

export default function ServicesSection(): React.JSX.Element {
  return (
    <section className="site-container services-showcase-section" id="services">
      <div className="section-title-wrap">
        <div className="eyebrow">WHAT WE OFFER · AGROCLIMATIC EXPERTISE</div>
        <h2>Professional Climate &amp; Farm Services</h2>
        <p className="section-intro">Tailored solutions that combine satellite earth observations with field agro-ecology.</p>
      </div>

      <div className="services-cards-grid">
        {/* Service Card 1 */}
        <article className="service-card">
          <div className="service-img-wrap garden-design-bg">
            <div className="service-icon-badge">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
            </div>
          </div>
          <div className="service-card-body">
            <h3>Crop Rotation Planning</h3>
            <p>Heuristic sequence modeling for pulses, cereals, and cash crops tailored to regional dry-zone seasonal windows.</p>
            <a href="#planner" className="service-link">
              Launch Planner{' '}
              <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>

        {/* Service Card 2 */}
        <article className="service-card">
          <div className="service-img-wrap lawn-care-bg">
            <div className="service-icon-badge">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66" />
              </svg>
            </div>
          </div>
          <div className="service-card-body">
            <h3>Soil &amp; Texture Profiling</h3>
            <p>Texture-adaptive soil management: matching crop root structures to sandy loam, clay loam, and silty loam fields.</p>
            <a href="#planner" className="service-link">
              Check Texture{' '}
              <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>

        {/* Service Card 3 */}
        <article className="service-card">
          <div className="service-img-wrap plant-care-bg">
            <div className="service-icon-badge">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22v-9m0 0a5 5 0 0 1 5-5h2a5 5 0 0 1-5 5h-2zm0 0a5 5 0 0 0-5-5H5a5 5 0 0 0 5 5h2z" />
              </svg>
            </div>
          </div>
          <div className="service-card-body">
            <h3>Legume Nitrogen Fixation</h3>
            <p>Biological soil restoration strategies leveraging root rhizobia symbiosis to cut synthetic fertilizer dependency.</p>
            <a href="#recommendations" className="service-link">
              Explore Pulses{' '}
              <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>

        {/* Service Card 4 */}
        <article className="service-card">
          <div className="service-img-wrap satellite-care-bg">
            <div className="service-icon-badge">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
              </svg>
            </div>
          </div>
          <div className="service-card-body">
            <h3>NASA Satellite Analytics</h3>
            <p>Continuous 10-year monthly precipitation and temperature monitoring with independent GPM IMERG cross-checking.</p>
            <a href="#climate" className="service-link">
              View Climatology{' '}
              <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>
      </div>

      {/* "Your Community, Your Farm" Split Showcase */}
      <div className="community-showcase-card">
        <div className="community-left">
          <div className="community-eyebrow">
            <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
            Grow Together
          </div>
          <h3>Your Community, Your Farm</h3>
          <p>Connect scientific satellite data with local farmer knowledge to build resilient, flourishing agricultural communities across dry zones.</p>

          <div className="community-feature-list">
            <div className="comm-feature-item">
              <div className="comm-feat-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <b>Stronger Together</b>
                <small>Join local farmer field networks advancing soil conservation and climate resilience.</small>
              </div>
            </div>
            <div className="comm-feature-item">
              <div className="comm-feat-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
              </div>
              <div>
                <b>Share &amp; Learn</b>
                <small>Exchange crop performance data, pest break observations, and soil moisture tips.</small>
              </div>
            </div>
          </div>

          <a href="#planner" className="comm-action-btn">
            Start Planning Now{' '}
            <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="community-right">
          <div className="community-photo-card">
            <div className="comm-photo-overlay">
              <span className="comm-photo-tag">
                <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66" />
                </svg>
                Sustainable Future
              </span>
              <h4>Create a Greener Tomorrow</h4>
              <p>Every pulse crop planted restores organic carbon and nitrogen to tomorrow’s harvest.</p>
              <div className="comm-mini-action">
                <span>Start Your Climate Rotation</span>
                <span className="mini-arrow">
                  <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
