import React from 'react';
import { CropRotation } from '../types/index.js';

interface Preset {
  name: string;
  lat: number;
  lon: number;
}

const PRESETS: Preset[] = [
  { name: 'Jaffna Peninsula (9.66°N)', lat: 9.66, lon: 80.02 },
  { name: 'Anuradhapura (8.31°N)', lat: 8.31, lon: 80.40 },
  { name: 'Kilinochchi (9.38°N)', lat: 9.38, lon: 80.40 }
];

export interface HeroSectionProps {
  latitude: number;
  longitude: number;
  onSelectPreset: (lat: number, lon: number) => void;
  meanTemp?: number;
  seasonalRain?: number;
  dryCount?: number;
  dryTotal?: number;
  topRotation?: CropRotation;
}

export default function HeroSection({
  latitude,
  longitude,
  onSelectPreset,
  meanTemp = 28.5,
  seasonalRain = 326,
  dryCount = 1,
  dryTotal = 10,
  topRotation
}: HeroSectionProps): React.JSX.Element {
  const currentPresetIndex = PRESETS.findIndex(
    p => Math.abs(p.lat - latitude) < 0.05 && Math.abs(p.lon - longitude) < 0.05
  );

  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-overlay"></div>

      <div className="site-container hero-split-grid">
        {/* LEFT HERO COLUMN */}
        <div className="hero-left-content">
          <div className="hero-badge-pill">
            <span className="hero-badge-dot"></span>
            <span>NASA POWER &amp; GPM SATELLITE AGROCLIMATOLOGY</span>
          </div>

          <h1 className="hero-title">
            Crop Yield Predictions &amp;<br />
            Farm Rotation Planning<br />
            <span className="hero-subline">
              Tailored for <em className="hero-script-accent">Climate Resilience</em>
            </span>
          </h1>

          <p className="hero-subtitle">
            Connecting 10 complete years of NASA Earth observations with farmer field notes and regional priorities.
            Discover explainable, water-conscious crop sequences designed to protect yields and restore soil health.
          </p>

          {/* Live Location Quick-Select Strip */}
          <div className="hero-location-strip">
            <span className="strip-label">
              <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Quick Coordinates:
            </span>
            <div className="hero-preset-group">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset-btn ${idx === currentPresetIndex ? 'active' : ''}`}
                  onClick={() => onSelectPreset(p.lat, p.lon)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-cta-group">
            <a href="#planner" className="hero-btn-primary">
              <span>Predict &amp; Plan Now</span>
              <span className="btn-dot-white"></span>
            </a>
            <a href="#monitoring" className="hero-btn-secondary">
              <span>Live Field Monitoring</span>
              <span className="hero-btn-arrow">
                <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-badge-item">
              <span className="trust-icon">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>NASA POWER Monthly Point API</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-icon">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>NASA GPM IMERG Rainfall Cross-Check</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-icon">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>Explainable Heuristic AI</span>
            </div>
          </div>
        </div>

        {/* RIGHT HERO COLUMN: Interactive Glassmorphic Agro-Card */}
        <div className="hero-right-visual">
          <div className="hero-floating-card">
            <div className="hero-card-header">
              <div className="card-satellite-tag">
                <span className="live-dot-glow"></span>
                <b>LIVE NASA SATELLITE GRID</b>
              </div>
              <span className="card-coord-badge">
                {latitude.toFixed(2)}° N · {longitude.toFixed(2)}° E
              </span>
            </div>

            <div className="hero-card-location">
              <h3>
                {Math.abs(latitude - 9.66) < 0.05 && Math.abs(longitude - 80.02) < 0.05
                  ? 'Jaffna Peninsula Dry Zone'
                  : 'Selected Farm Location'}
              </h3>
              <p>Northern Province · Nearest NASA POWER 0.5° Climate Cell</p>
            </div>

            {/* Quick Telemetry Numbers */}
            <div className="hero-card-stats-grid">
              <div className="card-stat-box">
                <small>Mean Air Temp</small>
                <strong>{meanTemp.toFixed(1)}°C</strong>
                <span className="stat-trend">NASA T2M Historical</span>
              </div>
              <div className="card-stat-box">
                <small>Seasonal Rainfall</small>
                <strong>{Math.round(seasonalRain)} mm</strong>
                <span className="stat-trend">Observed Total</span>
              </div>
              <div className="card-stat-box">
                <small>Dry Season Risk</small>
                <strong className="risk-low">
                  {dryCount} / {dryTotal}
                </strong>
                <span className="stat-trend">&lt; 75% Median Rain</span>
              </div>
            </div>

            {/* Featured Rotation Preview */}
            {topRotation && (
              <div className="hero-card-rotation-preview">
                <div className="preview-head">
                  <span className="preview-tag">
                    <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    RECOMMENDED ROTATION
                  </span>
                  <span className="preview-score">{topRotation.score}/100 MATCH</span>
                </div>
                <div className="preview-title">{topRotation.name}</div>
                <div className="preview-flow">
                  {topRotation.crops.map((crop, idx) => (
                    <React.Fragment key={crop + idx}>
                      {idx > 0 && (
                        <span className="arrow-sm">
                          <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      )}
                      <span className="chip-sm">{crop}</span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="preview-reason">{topRotation.note}</div>
              </div>
            )}

            <a href="#planner" className="hero-card-action-btn">
              <span>Explore 3 Curated Pathways Below</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Organic Wave Divider */}
      <div className="hero-wave-divider">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0,25L48,32C96,39,192,53,288,58.7C384,64,480,61,576,48C672,35,768,11,864,13.3C960,16,1056,45,1152,53.3C1248,61,1344,48,1392,41.3L1440,35L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z" fill="#f6f8f5"></path>
        </svg>
      </div>
    </section>
  );
}
