import React, { useState } from 'react';

interface ZoneDetail {
  name: string;
  health: number;
  status: string;
  statusClass: string;
  desc: string;
  moisture: string;
  moistureVal: number;
  advice: string;
}

const ZONES_DATA: Record<string, ZoneDetail> = {
  A: {
    name: 'Zone A',
    health: 95,
    status: 'Healthy',
    statusClass: 'healthy',
    desc: 'Spinach & Groundnut — Optimal Nitrogen',
    moisture: '88% (Optimal)',
    moistureVal: 88,
    advice: 'Zone A is exhibiting peak vegetative vigor and optimal soil organic carbon reserves.'
  },
  B: {
    name: 'Zone B',
    health: 37,
    status: 'Needs Attention',
    statusClass: 'warning',
    desc: 'Lettuce & Cereal — Low Available Moisture / High Heat',
    moisture: '37% (Moderate Deficit)',
    moistureVal: 37,
    advice: 'NASA temperature data indicates elevated evapotranspiration. Consider scheduling early morning drip irrigation.'
  },
  C: {
    name: 'Zone C',
    health: 21,
    status: 'Action Required',
    statusClass: 'critical',
    desc: 'Pulse Fallow — Low Moisture & High Evaporation',
    moisture: '21% (Critical Deficit)',
    moistureVal: 21,
    advice: 'NASA historical climatology shows 30% frequency of dry Yala seasons. Rotating Zone C with drought-hardy cowpea or green gram can restore nitrogen balance and reduce water stress within 45 days.'
  }
};

export default function MonitoringDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('monitoring');
  const [activeZone, setActiveZone] = useState<string>('C');
  const [irrigationStatus, setIrrigationStatus] = useState<boolean>(false);
  const [waterValve, setWaterValve] = useState<number>(70);
  const [ventilation, setVentilation] = useState<number>(85);

  const zoneInfo = ZONES_DATA[activeZone] || ZONES_DATA['C'];

  const handleIrrigate = (): void => {
    setIrrigationStatus(true);
    alert(`Irrigation cycle initiated for ${zoneInfo.name}. Water flow rate configured to 4.2 L/m².`);
  };

  return (
    <section className="site-container agrivision-dashboard-section" id="monitoring">
      <div className="agrivision-dashboard-card">
        {/* Dashboard Top Navigation Bar */}
        <div className="dash-top-bar">
          <div className="dash-brand">
            <svg className="dash-leaf" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
            <span className="dash-brand-title">AgriVision</span>
            <span className="dash-badge">MONITORING STUDIO</span>
          </div>

          <div className="dash-tabs" role="tablist">
            {['overview', 'monitoring', 'crop-health', 'reports'].map(tab => (
              <button
                key={tab}
                type="button"
                className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview'
                  ? 'Overview'
                  : tab === 'monitoring'
                  ? 'Monitoring'
                  : tab === 'crop-health'
                  ? 'Crop Health'
                  : 'Reports'}
              </button>
            ))}
          </div>

          <div className="dash-actions">
            <button type="button" className="dash-icon-btn" title="Settings">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button type="button" className="dash-icon-btn" title="Search">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button
              type="button"
              className="dash-log-btn"
              id="dashLogActivityBtn"
              onClick={() => alert('Activity logger: field inspection recorded at ' + new Date().toLocaleTimeString())}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Log Activity</span>
            </button>
            <div className="dash-avatar" title="NASA Knights Officer">NK</div>
          </div>
        </div>

        {/* Dashboard 3-Column Studio Grid */}
        <div className="dash-studio-grid">
          {/* LEFT COLUMN: Zones List & AI Insights */}
          <div className="dash-col dash-col-left">
            <div className="dash-selector-box">
              <div className="dash-farm-name">
                <div className="dash-farm-header-row">
                  <svg className="dash-farm-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                  </svg>
                  <b>Riverbend / Jaffna Farm</b>
                </div>
                <small>Northern Dry Zone · Sri Lanka</small>
              </div>
              <div className="dash-zone-dropdown">
                <span>All Zones (A, B, C)</span>
                <small>▾</small>
              </div>
            </div>

            {/* Zone Status Cards */}
            <div className="zone-cards-list">
              {Object.entries(ZONES_DATA).map(([key, zone]) => (
                <div
                  key={key}
                  className={`zone-card ${activeZone === key ? 'active' : ''}`}
                  data-zone={key}
                  onClick={() => setActiveZone(key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="zone-card-head">
                    <div className="zone-title">
                      <b>{zone.name}</b>
                      <span className={`zone-status-dot ${zone.statusClass}`}></span>
                      <span className="zone-status-text">{zone.status}</span>
                    </div>
                    <span className={`zone-health-pill ${zone.statusClass}`}>{zone.health}%</span>
                  </div>
                  <div className="zone-crop-desc">{zone.desc}</div>
                  <div className="zone-progress-bar">
                    <div className={`zone-progress-fill ${zone.statusClass}`} style={{ width: `${zone.health}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight Card */}
            <div className="ai-insight-bubble-card">
              <div className="ai-insight-head">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                </svg>
                <b>AgriVision AI Insight</b>
              </div>
              <p className="ai-quote-text" id="aiInsightQuote">
                “{zoneInfo.advice}”
              </p>
              <a href="#planner" className="ai-insight-btn">
                <span>View Smart Recommendation</span>
                <span>
                  <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </div>

            {/* Total Farm Metrics Mini-Row */}
            <div className="farm-parcels-mini">
              <div>
                <small>Total Farm Parcels</small>
                <b>1,750 m²</b>
              </div>
              <div className="parcel-status-tag">
                <span className="live-dot"></span> Operations Validated
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Interactive 3D Farm Visual Plot Simulation */}
          <div className="dash-col dash-col-center">
            <div className="farm-plot-container">
              <div className="farm-plot-badge">
                <span>
                  <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
                  </svg>
                  SATELLITE FIELD SIMULATION
                </span>
                <small>Isometric Plot View</small>
              </div>

              {/* 3D Bed Graphic with Zone Overlays */}
              <div className="isometric-farm-stage" id="farmStage">
                {/* Zone A Bed Overlay */}
                <div
                  className={`plot-zone-slice slice-zone-a ${activeZone === 'A' ? 'selected' : ''}`}
                  data-zone="A"
                  onClick={() => setActiveZone('A')}
                >
                  <span className="slice-label">Zone A</span>
                  <div className="crop-texture-dots"></div>
                </div>

                {/* Zone B Bed Overlay */}
                <div
                  className={`plot-zone-slice slice-zone-b ${activeZone === 'B' ? 'selected' : ''}`}
                  data-zone="B"
                  onClick={() => setActiveZone('B')}
                >
                  <span className="slice-label">Zone B</span>
                  <div className="crop-texture-dots"></div>
                </div>

                {/* Zone C Bed Overlay */}
                <div
                  className={`plot-zone-slice slice-zone-c ${activeZone === 'C' ? 'selected' : ''}`}
                  data-zone="C"
                  onClick={() => setActiveZone('C')}
                >
                  <span className="slice-label">Zone C</span>
                  <div className="crop-texture-dots"></div>
                </div>

                {/* Floating Interactive Zone Tooltip Modal */}
                <div className="interactive-zone-tooltip" id="zoneTooltip">
                  <div className="tooltip-head">
                    <span className={`tooltip-dot ${zoneInfo.statusClass}`}></span>
                    <b>{zoneInfo.name} Status</b>
                    <span className="tooltip-score">{zoneInfo.health}%</span>
                  </div>
                  <div className="tooltip-body">
                    <div className="tooltip-metric">
                      <span>Soil Moisture:</span>
                      <strong>{zoneInfo.moisture}</strong>
                    </div>
                    <div className="tooltip-bar">
                      <div className="tooltip-bar-fill" style={{ width: `${zoneInfo.moistureVal}%` }}></div>
                    </div>
                  </div>
                  <div className="tooltip-buttons">
                    <button type="button" className="tooltip-btn-irrigate" id="simIrrigateBtn" onClick={handleIrrigate}>
                      <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                      {irrigationStatus ? 'Irrigation Active' : 'Start Irrigation'}
                    </button>
                    <button type="button" className="tooltip-btn-details" id="simDetailsBtn" onClick={() => alert(`Inspecting ${zoneInfo.name} agronomic profile.`)}>
                      View Details
                    </button>
                  </div>
                </div>

                <div className="surrounding-crop-rows"></div>
              </div>

              {/* Bottom Farm Controls & Overview Bar */}
              <div className="plot-controls-row">
                <div className="control-gauge-box">
                  <small>Overall Field Health</small>
                  <div className="gauge-inline">
                    <span className="badge-status-pill green">Good</span>
                    <div className="mini-arc-wrap">
                      <b className="gauge-number">92%</b>
                    </div>
                  </div>
                </div>

                <div className="control-sliders-box">
                  <div className="control-item">
                    <span>Manual Water Valve</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={waterValve}
                      onChange={e => setWaterValve(Number(e.target.value))}
                      className="mini-slider"
                    />
                    <span className="slider-val">{waterValve}%</span>
                  </div>
                  <div className="control-item">
                    <span>Ventilation / Canopy Cover</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ventilation}
                      onChange={e => setVentilation(Number(e.target.value))}
                      className="mini-slider"
                    />
                    <span className="slider-val">{ventilation}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Health Index Gauge & Environmental Vitals */}
          <div className="dash-col dash-col-right">
            <div className="dash-panel-heading">
              <b>Summary &amp; Vitals</b>
              <small>Live Agro-Telemetry</small>
            </div>

            {/* Semi-Circular Radial Health Index Gauge */}
            <div className="health-index-gauge-card">
              <div className="semi-radial-gauge-wrap">
                <svg viewBox="0 0 200 115" className="radial-gauge-svg">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2ece4" strokeWidth="18" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="25.1"
                    className="gauge-meter-path"
                  />
                </svg>
                <div className="radial-gauge-center">
                  <span className="radial-number">90%</span>
                  <span className="radial-label">Health Index</span>
                </div>
              </div>
            </div>

            {/* Environmental Telemetry Vitals List */}
            <div className="dash-vitals-list">
              <div className="vital-row">
                <div className="vital-left">
                  <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                  </svg>
                  <span>Nutrient / Soil NPK</span>
                </div>
                <strong className="vital-val">85%</strong>
              </div>

              <div className="vital-row">
                <div className="vital-left">
                  <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span>Relative Humidity</span>
                </div>
                <strong className="vital-val">67%</strong>
              </div>

              <div className="vital-row">
                <div className="vital-left">
                  <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                    <circle cx="11.5" cy="17.5" r="2" fill="currentColor" />
                  </svg>
                  <span>Mean Air Temp</span>
                </div>
                <strong className="vital-val">28.5°C</strong>
              </div>
            </div>

            {/* Water & Irrigation Status Box */}
            <div className="dash-water-status-box">
              <div className="water-box-title">
                <div className="water-title-left">
                  <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span>WATER &amp; SOIL STATUS</span>
                </div>
                <span className="water-sub-pill">AUTO ACTIVE</span>
              </div>
              <div className="water-metrics-grid">
                <div>
                  <small>Soil Moisture Avg</small>
                  <b>63%</b>
                </div>
                <div>
                  <small>Daily Irrigation</small>
                  <b>4.2 L/m²</b>
                </div>
              </div>
              <div className="irrigation-toggle-status">
                <span>Auto Irrigation Mode</span>
                <span className="toggle-pill-on">ON</span>
              </div>
            </div>

            {/* Yield Resilience Card */}
            <div className="yield-resilience-card">
              <div className="yield-resilience-title">
                <svg className="resilience-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66" />
                </svg>
                <div>
                  <small>Predicted Resilience</small>
                  <b>Yield Factor: 95%</b>
                </div>
              </div>
              <div className="yield-progress-strip">
                <div className="yield-progress-fill" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
