import React, { useState, useEffect } from 'react';
import { SeasonStats } from '../types/index.js';

export interface MonitoringDashboardProps {
  latitude?: number;
  longitude?: number;
  currentCrop?: string;
  soilType?: string;
  soilPh?: number;
  stats?: SeasonStats;
  dataMode?: string;
}

export interface ZoneData {
  id: string;
  name: string;
  crop: string;
  health: number;
  status: 'Healthy' | 'Needs Attention' | 'Action Required' | 'Optimal';
  statusClass: 'healthy' | 'warning' | 'critical' | 'optimal';
  desc: string;
  moisture: number; // percentage
  moistureLabel: string;
  npk: number;
  humidity: number;
  temp: number;
  yieldResilience: number;
  advice: string;
  soilEc: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
}

const INITIAL_ZONES: Record<string, ZoneData> = {
  A: {
    id: 'A',
    name: 'Zone A',
    crop: 'Spinach & Groundnut',
    health: 95,
    status: 'Healthy',
    statusClass: 'healthy',
    desc: 'Spinach & Groundnut — Optimal Nitrogen',
    moisture: 88,
    moistureLabel: '88% (Optimal)',
    npk: 92,
    humidity: 72,
    temp: 26.8,
    yieldResilience: 98,
    advice: 'Zone A is exhibiting peak vegetative vigor and optimal soil organic carbon reserves. Maintain standard schedule.',
    soilEc: '1.2 dS/m (Normal)',
    nitrogen: '142 mg/kg (High)',
    phosphorus: '38 mg/kg (Optimal)',
    potassium: '215 mg/kg (Optimal)'
  },
  B: {
    id: 'B',
    name: 'Zone B',
    crop: 'Lettuce & Cereal',
    health: 37,
    status: 'Needs Attention',
    statusClass: 'warning',
    desc: 'Lettuce & Cereal — Low Available Moisture / High Heat',
    moisture: 37,
    moistureLabel: '37% (Moderate Deficit)',
    npk: 74,
    humidity: 64,
    temp: 31.2,
    yieldResilience: 68,
    advice: 'NASA temperature data indicates elevated evapotranspiration. Consider scheduling early morning drip irrigation.',
    soilEc: '1.6 dS/m (Elevated)',
    nitrogen: '98 mg/kg (Moderate)',
    phosphorus: '22 mg/kg (Low)',
    potassium: '160 mg/kg (Normal)'
  },
  C: {
    id: 'C',
    name: 'Zone C',
    crop: 'Pulse Fallow',
    health: 21,
    status: 'Action Required',
    statusClass: 'critical',
    desc: 'Pulse Fallow — Low Moisture & High Evaporation',
    moisture: 21,
    moistureLabel: '21% (Critical Deficit)',
    npk: 62,
    humidity: 56,
    temp: 33.6,
    yieldResilience: 42,
    advice: 'NASA historical climatology shows 30% frequency of dry Yala seasons. Rotating Zone C with drought-hardy cowpea or green gram can restore nitrogen balance and reduce water stress within 45 days.',
    soilEc: '2.1 dS/m (High Stress)',
    nitrogen: '64 mg/kg (Deficient)',
    phosphorus: '14 mg/kg (Deficient)',
    potassium: '110 mg/kg (Low)'
  }
};

interface ActivityLog {
  id: string;
  time: string;
  zone: string;
  action: string;
  notes: string;
}

export default function MonitoringDashboard({
  latitude = 9.66,
  longitude = 80.02,
  currentCrop = 'Rice',
  soilType = 'sandy',
  soilPh = 6.5,
  stats,
  dataMode = 'nasa'
}: MonitoringDashboardProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'overview' | 'crop-health' | 'reports'>('monitoring');
  const [activeZone, setActiveZone] = useState<string>('C');
  const [zones, setZones] = useState<Record<string, ZoneData>>(INITIAL_ZONES);
  const [irrigatingZone, setIrrigatingZone] = useState<string | null>(null);
  const [autoIrrigation, setAutoIrrigation] = useState<boolean>(true);
  const [waterValve, setWaterValve] = useState<number>(70);
  const [ventilation, setVentilation] = useState<number>(85);
  const [toast, setToast] = useState<string | null>(null);
  const [detailsModalZone, setDetailsModalZone] = useState<ZoneData | null>(null);
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [logActivityType, setLogActivityType] = useState<string>('Irrigation Check');
  const [logNotes, setLogNotes] = useState<string>('');
  const [spectralLayer, setSpectralLayer] = useState<'ndvi' | 'thermal' | 'natural'>('ndvi');
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState<boolean>(false);

  // Dynamic farm identity linked to active GPS coordinates
  const getFarmProfile = (lat: number, lon: number) => {
    if (Math.abs(lat - 9.66) < 0.25 && Math.abs(lon - 80.02) < 0.25) {
      return { name: 'Jaffna Peninsula Farm', zone: 'Northern Dry Zone · Sri Lanka' };
    }
    if (Math.abs(lat - 8.31) < 0.25 && Math.abs(lon - 80.40) < 0.25) {
      return { name: 'Anuradhapura Agro-Station', zone: 'North Central Dry Zone · Sri Lanka' };
    }
    if (Math.abs(lat - 9.38) < 0.25 && Math.abs(lon - 80.40) < 0.25) {
      return { name: 'Kilinochchi Demonstration Farm', zone: 'Northern Province · Sri Lanka' };
    }
    if (lat >= 8 && lat <= 36 && lon >= 68 && lon <= 97) {
      return {
        name: `South Asia Field Parcel (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        zone: 'Monsoon Agro-Climatic Belt · Indian Subcontinent'
      };
    }
    if (lat >= -35 && lat <= 38 && lon >= -18 && lon <= 52) {
      return {
        name: `African Agricultural Parcel (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        zone: 'Sub-Saharan Agro-Climatology Zone'
      };
    }
    if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -65) {
      return {
        name: `North American Farmland (${lat.toFixed(2)}°N, ${Math.abs(lon).toFixed(2)}°W)`,
        zone: 'Continental Temperate Farming Belt'
      };
    }
    return {
      name: `Field Parcel (${lat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'})`,
      zone: 'NASA POWER Satellite Telemetry Grid (0.5° × 0.5°)'
    };
  };

  const farmProfile = getFarmProfile(latitude, longitude);

  // Synchronize Zone A with the user's selected currentCrop
  useEffect(() => {
    setZones(prev => ({
      ...prev,
      A: {
        ...prev.A,
        crop: `${currentCrop} & Companion Pulse`,
        desc: `${currentCrop} Main Crop — Monitored via NASA Agroclimatology`
      }
    }));
  }, [currentCrop]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      time: '10:45 AM Today',
      zone: 'Zone A',
      action: 'Leaf Nitrogen Check',
      notes: 'Optimal green canopy coverage, no chlorosis detected.'
    },
    {
      id: '2',
      time: '08:15 AM Today',
      zone: 'Zone B',
      action: 'Moisture Calibration',
      notes: 'Calibrated capacitive sensor against NASA POWER surface ET.'
    }
  ]);

  // Auto-clear toast after 3.5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Active zone data (fallback to Zone C if 'all' or missing)
  const currentZone: ZoneData = zones[activeZone] || zones['C'];

  // Calculated overall telemetry values dynamically computed from active zone or average
  const isAll = activeZone === 'all';
  const computedHealth = isAll
    ? Math.round((zones.A.health + zones.B.health + zones.C.health) / 3)
    : currentZone.health;
  const computedMoisture = isAll
    ? Math.round((zones.A.moisture + zones.B.moisture + zones.C.moisture) / 3)
    : currentZone.moisture;
  const computedNpk = isAll
    ? Math.round((zones.A.npk + zones.B.npk + zones.C.npk) / 3)
    : currentZone.npk;
  const computedHumidity = isAll
    ? Math.round((zones.A.humidity + zones.B.humidity + zones.C.humidity) / 3)
    : currentZone.humidity;
  const rawBaseTemp = stats && typeof stats.meanTemp === 'number' ? stats.meanTemp : currentZone.temp;
  const computedTemp = isAll
    ? (stats && typeof stats.meanTemp === 'number' ? Number(stats.meanTemp.toFixed(1)) : Number(((zones.A.temp + zones.B.temp + zones.C.temp) / 3).toFixed(1)))
    : Number((rawBaseTemp + (ventilation < 50 ? (50 - ventilation) * 0.05 : -(ventilation - 50) * 0.03)).toFixed(1));
  const computedResilience = isAll
    ? Math.round((zones.A.yieldResilience + zones.B.yieldResilience + zones.C.yieldResilience) / 3)
    : currentZone.yieldResilience;

  // Compute daily irrigation flow rate according to manual valve slider
  const dailyIrrigation = ((waterValve / 100) * 6.0).toFixed(1);

  // Trigger irrigation cycle for the active zone
  const handleIrrigate = (targetZoneId: string = activeZone): void => {
    const targetKey = targetZoneId === 'all' ? 'C' : targetZoneId;
    setIrrigatingZone(targetKey);
    setToast(`Drip irrigation initiated for ${zones[targetKey].name}. Applying ${dailyIrrigation} L/m²...`);

    // Simulate real soil water uptake
    setTimeout(() => {
      setZones(prev => {
        const updated = { ...prev };
        const old = updated[targetKey];
        const newMoisture = Math.min(88, old.moisture + 45);
        const newHealth = Math.min(92, old.health + 35);
        updated[targetKey] = {
          ...old,
          moisture: newMoisture,
          moistureLabel: `${newMoisture}% (Replenished)`,
          health: newHealth,
          status: newHealth > 75 ? 'Healthy' : 'Needs Attention',
          statusClass: newHealth > 75 ? 'healthy' : 'warning',
          yieldResilience: Math.min(95, old.yieldResilience + 30)
        };
        return updated;
      });
      setIrrigatingZone(null);
      setToast(`Irrigation cycle complete for ${zones[targetKey].name}. Soil moisture reached optimal range!`);
    }, 1800);
  };

  // Add new activity log
  const handleSaveActivity = (e: React.FormEvent): void => {
    e.preventDefault();
    const newEntry: ActivityLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      zone: currentZone.name,
      action: logActivityType,
      notes: logNotes || 'Manual inspection completed.'
    };
    setActivityLogs([newEntry, ...activityLogs]);
    setLogNotes('');
    setLogModalOpen(false);
    setToast(`Logged: ${logActivityType} recorded for ${currentZone.name}.`);
  };

  // Radial gauge dash offset calculation (circumference is 251.2 for r=80 half-arc)
  const gaugePercent = Math.min(100, Math.max(0, computedHealth));
  const gaugeOffset = (251.2 * (100 - gaugePercent)) / 100;

  return (
    <section className="site-container agrivision-dashboard-section" id="monitoring">
      <div className="agrivision-dashboard-card">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="dash-floating-toast" role="status">
            <span className="toast-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="toast-text">{toast}</span>
            <button type="button" className="toast-dismiss" onClick={() => setToast(null)}>×</button>
          </div>
        )}

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
            {(['monitoring', 'overview', 'crop-health', 'reports'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'monitoring' && 'Monitoring'}
                {tab === 'overview' && 'Overview'}
                {tab === 'crop-health' && 'Crop Health'}
                {tab === 'reports' && 'Reports'}
              </button>
            ))}
          </div>

          <div className="dash-actions">
            <button
              type="button"
              className="dash-icon-btn"
              title="Reset Simulated Field"
              onClick={() => {
                setZones(INITIAL_ZONES);
                setToast('Field simulation telemetry reset to NASA baseline values.');
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
            <button
              type="button"
              className="dash-log-btn"
              id="dashLogActivityBtn"
              onClick={() => setLogModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Log Activity</span>
            </button>
            <div className="dash-user-profile-badge" title={`Telemetry profile for active coordinates: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`}>
              <div className="dash-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="dash-user-meta">
                <b className="dash-user-name">Field Officer</b>
                <small className="dash-user-coord">{latitude.toFixed(2)}°, {longitude.toFixed(2)}°</small>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: LIVE MONITORING (3-Column Studio Grid) */}
        {activeTab === 'monitoring' && (
          <div className="dash-studio-grid">
            {/* LEFT COLUMN: Zones List & AI Insights */}
            <div className="dash-col dash-col-left">
              <div className="dash-selector-box">
                <div className="dash-farm-name">
                  <div className="dash-farm-header-row">
                    <svg className="dash-farm-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                    </svg>
                    <b>{farmProfile.name}</b>
                  </div>
                  <small>{farmProfile.zone}</small>
                </div>

                {/* Interactive Zone Filter Dropdown */}
                <div className="dash-dropdown-container">
                  <button
                    type="button"
                    className="dash-zone-dropdown"
                    onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
                    aria-expanded={zoneDropdownOpen}
                  >
                    <span>
                      {activeZone === 'all'
                        ? 'All Zones (A, B, C)'
                        : `${zones[activeZone]?.name} — ${zones[activeZone]?.crop}`}
                    </span>
                    <small>{zoneDropdownOpen ? '▴' : '▾'}</small>
                  </button>

                  {zoneDropdownOpen && (
                    <div className="dash-dropdown-menu">
                      <button
                        type="button"
                        className={`dropdown-item ${activeZone === 'all' ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveZone('all');
                          setZoneDropdownOpen(false);
                          setToast('Viewing aggregate farm-wide telemetry.');
                        }}
                      >
                        <b>All Zones (A, B, C)</b>
                        <small>Aggregate overview</small>
                      </button>
                      {Object.values(zones).map(z => (
                        <button
                          key={z.id}
                          type="button"
                          className={`dropdown-item ${activeZone === z.id ? 'selected' : ''}`}
                          onClick={() => {
                            setActiveZone(z.id);
                            setZoneDropdownOpen(false);
                            setToast(`Switched focus to ${z.name}.`);
                          }}
                        >
                          <div className="item-title-row">
                            <b>{z.name}</b>
                            <span className={`zone-status-dot ${z.statusClass}`}></span>
                          </div>
                          <small>{z.crop} ({z.health}% health)</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Zone Status Cards */}
              <div className="zone-cards-list">
                {Object.entries(zones).map(([key, zone]) => (
                  <div
                    key={key}
                    className={`zone-card ${activeZone === key ? 'active' : ''}`}
                    data-zone={key}
                    onClick={() => {
                      setActiveZone(key);
                      setToast(`Focused on ${zone.name} (${zone.status}).`);
                    }}
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
                      <div
                        className={`zone-progress-fill ${zone.statusClass}`}
                        style={{ width: `${zone.health}%` }}
                      ></div>
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
                  “{currentZone.advice}”
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
                  <small>Soil Profile &amp; Texture</small>
                  <b>{soilType} (pH {Number(soilPh).toFixed(1)})</b>
                </div>
                <div className="parcel-status-tag">
                  <span className="live-dot"></span> {dataMode === 'nasa' ? 'NASA POWER Live' : 'Calibrated Telemetry'}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Realistic 3D Raised Planter Bed Field Simulation */}
            <div className="dash-col dash-col-center">
              <div className="farm-plot-container">
                <div className="farm-plot-badge">
                  <span>
                    <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
                    </svg>
                    SATELLITE FIELD SIMULATION
                  </span>
                  <div className="view-mode-pill">
                    <span className="pulse-indicator"></span> Live 3D Bed View
                  </div>
                </div>

                {/* Realistic 3D Raised Agricultural Bed */}
                <div className="isometric-farm-stage" id="farmStage">
                  {/* Surrounding field soil furrows */}
                  <div className="field-backdrop-ground">
                    <div className="ground-furrows"></div>
                  </div>

                  {/* 3D Elevated Planter Bed Body */}
                  <div className="raised-bed-3d-box">
                    {/* Top Soil Surface with 3 Distinct Crop Plantings */}
                    <div className="bed-top-soil">
                      {/* Zone A Section: Lush dark green crops */}
                      <div
                        className={`bed-zone-plot plot-zone-a ${activeZone === 'A' ? 'active-zone' : ''}`}
                        onClick={() => {
                          setActiveZone('A');
                          setToast('Inspecting Zone A (Spinach & Groundnut).');
                        }}
                        title="Click to inspect Zone A"
                      >
                        <div className="crop-canopy-layer canopy-a"></div>
                        <div className="zone-hud-tag">
                          <span className="hud-badge green">Zone A · {zones.A.health}%</span>
                        </div>
                        {irrigatingZone === 'A' && (
                          <div className="irrigation-spray-overlay">
                            <div className="spray-mist"></div>
                            <span className="spray-label">Drip Active...</span>
                          </div>
                        )}
                      </div>

                      {/* Zone B Section: Amber/Yellow crops */}
                      <div
                        className={`bed-zone-plot plot-zone-b ${activeZone === 'B' ? 'active-zone' : ''}`}
                        onClick={() => {
                          setActiveZone('B');
                          setToast('Inspecting Zone B (Lettuce & Cereal).');
                        }}
                        title="Click to inspect Zone B"
                      >
                        <div className="crop-canopy-layer canopy-b"></div>
                        <div className="zone-hud-tag">
                          <span className="hud-badge yellow">Zone B · {zones.B.health}%</span>
                        </div>
                        {irrigatingZone === 'B' && (
                          <div className="irrigation-spray-overlay">
                            <div className="spray-mist"></div>
                            <span className="spray-label">Drip Active...</span>
                          </div>
                        )}
                      </div>

                      {/* Zone C Section: Red/Terracotta moisture deficit */}
                      <div
                        className={`bed-zone-plot plot-zone-c ${activeZone === 'C' ? 'active-zone' : ''}`}
                        onClick={() => {
                          setActiveZone('C');
                          setToast('Inspecting Zone C (Pulse Fallow - Low Moisture).');
                        }}
                        title="Click to inspect Zone C"
                      >
                        <div className="crop-canopy-layer canopy-c"></div>
                        <div className="zone-hud-tag">
                          <span className="hud-badge red">Zone C · {zones.C.health}%</span>
                        </div>
                        {irrigatingZone === 'C' && (
                          <div className="irrigation-spray-overlay">
                            <div className="spray-mist"></div>
                            <span className="spray-label">Drip Active...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3D Planter Timber/Earth Walls */}
                    <div className="bed-front-wall">
                      <div className="soil-layer-strata">
                        <span>Root Horizon (0-30cm)</span>
                        <small>NASA POWER Agroclimatology Monitored</small>
                      </div>
                    </div>
                    <div className="bed-side-wall"></div>
                  </div>

                  {/* Frosted Glass HUD Tooltip over selected Zone */}
                  <div className="interactive-zone-tooltip" id="zoneTooltip">
                    <div className="tooltip-head">
                      <div className="tooltip-title-wrap">
                        <span className={`tooltip-dot ${currentZone.statusClass}`}></span>
                        <b>{currentZone.name}</b>
                        <small className="tooltip-crop-label">({currentZone.crop})</small>
                      </div>
                      <span className={`tooltip-score ${currentZone.statusClass}`}>{currentZone.health}%</span>
                    </div>

                    <div className="tooltip-body">
                      <div className="tooltip-metric">
                        <span>Soil Moisture:</span>
                        <strong>{currentZone.moistureLabel}</strong>
                      </div>
                      <div className="tooltip-bar">
                        <div
                          className={`tooltip-bar-fill ${currentZone.statusClass}`}
                          style={{ width: `${currentZone.moisture}%` }}
                        ></div>
                      </div>

                      <div className="tooltip-micro-metrics">
                        <span>NPK: <strong>{currentZone.npk}%</strong></span>
                        <span>Temp: <strong>{currentZone.temp}°C</strong></span>
                      </div>
                    </div>

                    <div className="tooltip-buttons">
                      <button
                        type="button"
                        className={`tooltip-btn-irrigate ${irrigatingZone === currentZone.id ? 'is-busy' : ''}`}
                        id="simIrrigateBtn"
                        onClick={() => handleIrrigate(currentZone.id)}
                        disabled={irrigatingZone !== null}
                      >
                        <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                        {irrigatingZone === currentZone.id ? 'Irrigating...' : 'Start Irrigation'}
                      </button>
                      <button
                        type="button"
                        className="tooltip-btn-details"
                        id="simDetailsBtn"
                        onClick={() => setDetailsModalZone(currentZone)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Farm Controls & Overview Bar */}
                <div className="plot-controls-row">
                  <div className="control-gauge-box">
                    <small>Overall Field Health</small>
                    <div className="gauge-inline">
                      <span className={`badge-status-pill ${computedHealth > 75 ? 'green' : computedHealth > 50 ? 'yellow' : 'red'}`}>
                        {computedHealth > 75 ? 'Good' : computedHealth > 50 ? 'Moderate' : 'Stress'}
                      </span>
                      <div className="mini-arc-wrap">
                        <b className="gauge-number">{computedHealth}%</b>
                      </div>
                    </div>
                  </div>

                  <div className="control-sliders-box">
                    <div className="control-item">
                      <div className="control-label-row">
                        <span>Manual Water Valve</span>
                        <b className="slider-val">{waterValve}% ({dailyIrrigation} L/m²)</b>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={waterValve}
                        onChange={e => {
                          const v = Number(e.target.value);
                          setWaterValve(v);
                        }}
                        className="mini-slider"
                      />
                    </div>

                    <div className="control-item">
                      <div className="control-label-row">
                        <span>Ventilation / Canopy Cover</span>
                        <b className="slider-val">{ventilation}%</b>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={ventilation}
                        onChange={e => setVentilation(Number(e.target.value))}
                        className="mini-slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dynamic Health Index Gauge & Environmental Vitals */}
            <div className="dash-col dash-col-right">
              <div className="dash-panel-heading">
                <b>Summary &amp; Vitals</b>
                <small>Live Agro-Telemetry · {isAll ? 'Farm Average' : currentZone.name}</small>
              </div>

              {/* Semi-Circular Radial Health Index Gauge */}
              <div className="health-index-gauge-card">
                <div className="semi-radial-gauge-wrap">
                  <svg viewBox="0 0 200 115" className="radial-gauge-svg">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#e2ece4"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
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
                      strokeDashoffset={gaugeOffset}
                      className="gauge-meter-path"
                    />
                  </svg>
                  <div className="radial-gauge-center">
                    <span className="radial-number">{computedHealth}%</span>
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
                  <strong className="vital-val">{computedNpk}%</strong>
                </div>

                <div className="vital-row">
                  <div className="vital-left">
                    <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    <span>Relative Humidity</span>
                  </div>
                  <strong className="vital-val">{computedHumidity}%</strong>
                </div>

                <div className="vital-row">
                  <div className="vital-left">
                    <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                      <circle cx="11.5" cy="17.5" r="2" fill="currentColor" />
                    </svg>
                    <span>Mean Air Temp</span>
                  </div>
                  <strong className="vital-val">{computedTemp}°C</strong>
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
                  <span className={`water-sub-pill ${autoIrrigation ? 'active' : 'inactive'}`}>
                    {autoIrrigation ? 'AUTO ACTIVE' : 'MANUAL'}
                  </span>
                </div>
                <div className="water-metrics-grid">
                  <div>
                    <small>Soil Moisture Avg</small>
                    <b>{computedMoisture}%</b>
                  </div>
                  <div>
                    <small>Daily Irrigation</small>
                    <b>{dailyIrrigation} L/m²</b>
                  </div>
                </div>

                {/* Clickable Auto Irrigation Mode Toggle */}
                <div className="irrigation-toggle-status">
                  <span>Auto Irrigation Mode</span>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${autoIrrigation ? 'on' : 'off'}`}
                    onClick={() => {
                      const next = !autoIrrigation;
                      setAutoIrrigation(next);
                      setToast(`Auto Irrigation Mode switched ${next ? 'ON (autonomous threshold trigger)' : 'OFF (manual valve control)'}.`);
                    }}
                    title="Click to toggle auto irrigation"
                  >
                    <span className="toggle-handle"></span>
                    <span className="toggle-label">{autoIrrigation ? 'ON' : 'OFF'}</span>
                  </button>
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
                    <b>Yield Factor: {computedResilience}%</b>
                  </div>
                </div>
                <div className="yield-progress-strip">
                  <div className="yield-progress-fill" style={{ width: `${computedResilience}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="dash-tab-panel overview-panel">
            <div className="panel-header-block">
              <div>
                <h3>Farm Parcel Matrix &amp; Irrigation Efficiency</h3>
                <p>Multi-zone health diagnostics calibrated with NASA POWER daily solar irradiance and 10-year Yala drought return period.</p>
              </div>
              <button
                type="button"
                className="btn-action-sm"
                onClick={() => handleIrrigate('all')}
              >
                💧 Irrigate All Deficit Zones
              </button>
            </div>

            <div className="overview-matrix-grid">
              {Object.values(zones).map(z => (
                <div key={z.id} className="matrix-zone-card">
                  <div className="matrix-zone-top">
                    <div>
                      <span className="matrix-badge">{z.name}</span>
                      <h4>{z.crop}</h4>
                    </div>
                    <span className={`zone-health-pill ${z.statusClass}`}>{z.health}% Vigor</span>
                  </div>

                  <div className="matrix-stats-grid">
                    <div className="stat-cell">
                      <small>Soil Moisture</small>
                      <b>{z.moisture}%</b>
                    </div>
                    <div className="stat-cell">
                      <small>NPK Balance</small>
                      <b>{z.npk}%</b>
                    </div>
                    <div className="stat-cell">
                      <small>Canopy Temp</small>
                      <b>{z.temp}°C</b>
                    </div>
                    <div className="stat-cell">
                      <small>EC Salinity</small>
                      <b>{z.soilEc}</b>
                    </div>
                  </div>

                  <p className="matrix-advice">{z.advice}</p>

                  <div className="matrix-actions">
                    <button
                      type="button"
                      className="matrix-btn-irrigate"
                      onClick={() => handleIrrigate(z.id)}
                    >
                      Irrigate {z.name}
                    </button>
                    <button
                      type="button"
                      className="matrix-btn-details"
                      onClick={() => setDetailsModalZone(z)}
                    >
                      Telemetry Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="water-savings-banner">
              <div className="banner-left">
                <span className="banner-icon">🌿</span>
                <div>
                  <b>FieldShift NASA Precision Water Conservation Impact</b>
                  <p>By scheduling targeted pulses matching NASA POWER evapotranspiration deficits, Riverbend Farm reduces water waste by 38% compared to traditional blanket flood irrigation.</p>
                </div>
              </div>
              <div className="banner-metric">
                <b>48,200 L</b>
                <small>Estimated Season Savings</small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CROP HEALTH & SPECTRAL VIGOR */}
        {activeTab === 'crop-health' && (
          <div className="dash-tab-panel crop-health-panel">
            <div className="panel-header-block">
              <div>
                <h3>Spectral Canopy Vigor &amp; Vegetation Index (NDVI)</h3>
                <p>Simulating remote multispectral sensing from NASA Landsat-8 and Sentinel-2 surface reflectance bands.</p>
              </div>
              <div className="spectral-layer-switch">
                <button
                  type="button"
                  className={`layer-btn ${spectralLayer === 'ndvi' ? 'active' : ''}`}
                  onClick={() => setSpectralLayer('ndvi')}
                >
                  NDVI Vegetation Index
                </button>
                <button
                  type="button"
                  className={`layer-btn ${spectralLayer === 'thermal' ? 'active' : ''}`}
                  onClick={() => setSpectralLayer('thermal')}
                >
                  Thermal Water Stress
                </button>
                <button
                  type="button"
                  className={`layer-btn ${spectralLayer === 'natural' ? 'active' : ''}`}
                  onClick={() => setSpectralLayer('natural')}
                >
                  Natural Color (RGB)
                </button>
              </div>
            </div>

            <div className="spectral-visual-stage">
              <div className={`spectral-bed-view layer-${spectralLayer}`}>
                <div className="spectral-zone zone-a">
                  <span className="spectral-label">Zone A (NDVI: 0.84)</span>
                  <div className="heat-shimmer"></div>
                </div>
                <div className="spectral-zone zone-b">
                  <span className="spectral-label">Zone B (NDVI: 0.52)</span>
                  <div className="heat-shimmer"></div>
                </div>
                <div className="spectral-zone zone-c">
                  <span className="spectral-label">Zone C (NDVI: 0.28)</span>
                  <div className="heat-shimmer"></div>
                </div>
              </div>

              {/* NDVI Heatmap Legend */}
              <div className="spectral-legend-bar">
                <span className="legend-label">NDVI Scale:</span>
                <div className="legend-gradient"></div>
                <div className="legend-stops">
                  <span>0.0 (Bare Soil)</span>
                  <span>0.3 (Water Deficit)</span>
                  <span>0.6 (Moderate Vigor)</span>
                  <span>0.9+ (Peak Biomass)</span>
                </div>
              </div>
            </div>

            <div className="spectral-insight-footer">
              <div className="insight-pill">
                <b>Diagnostic Summary:</b> Zone A displays dense chlorophyll absorption in the red band. Zone C requires immediate organic mulching and rotation with drought-tolerant legumes to prevent bare soil thermal erosion.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIAGNOSTIC REPORTS & TELEMETRY LOGS */}
        {activeTab === 'reports' && (
          <div className="dash-tab-panel reports-panel">
            <div className="panel-header-block">
              <div>
                <h3>Field Agro-Telemetry &amp; Audit Logs</h3>
                <p>Complete record of NASA POWER climatology matching, field moisture telemetry, and farm management actions.</p>
              </div>
              <button
                type="button"
                className="btn-action-sm"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print / Export Diagnostic Log
              </button>
            </div>

            <div className="reports-layout-grid">
              {/* Activity History Table */}
              <div className="report-card">
                <h4>Recent Farm Field Log Entries</h4>
                <div className="log-table-wrap">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Zone</th>
                        <th>Action</th>
                        <th>Technician Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map(log => (
                        <tr key={log.id}>
                          <td><b>{log.time}</b></td>
                          <td><span className="tag-zone">{log.zone}</span></td>
                          <td><strong>{log.action}</strong></td>
                          <td>{log.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NASA POWER Verification Card */}
              <div className="report-card nasa-summary-card">
                <h4>NASA POWER Satellite Verification</h4>
                <div className="nasa-specs-list">
                  <div className="spec-row">
                    <span>Coordinates</span>
                    <b>9.66° N, 80.02° E (Jaffna Peninsula)</b>
                  </div>
                  <div className="spec-row">
                    <span>Solar Irradiance (ALLSKY_SFC_SW_DWN)</span>
                    <b>21.4 MJ/m²/day</b>
                  </div>
                  <div className="spec-row">
                    <span>Mean 2-Meter Temp (T2M)</span>
                    <b>28.5 °C</b>
                  </div>
                  <div className="spec-row">
                    <span>Drier Season Risk (Below 75% Median)</span>
                    <b>1 in 10 Yala Seasons</b>
                  </div>
                  <div className="spec-row">
                    <span>Validation Engine</span>
                    <b>FieldShift CARE (Rule-Based Constraint Satisfaction)</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP MODAL: Zone Details & Telemetry Inspection */}
        {detailsModalZone && (
          <div className="dash-modal-backdrop" onClick={() => setDetailsModalZone(null)}>
            <div className="dash-modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="modal-title-wrap">
                  <span className={`modal-status-dot ${detailsModalZone.statusClass}`}></span>
                  <h3>{detailsModalZone.name} Agronomic Diagnostics</h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setDetailsModalZone(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-meta-row">
                  <div>
                    <small>Target Crop</small>
                    <b>{detailsModalZone.crop}</b>
                  </div>
                  <div>
                    <small>Vegetative Health</small>
                    <b className={`text-${detailsModalZone.statusClass}`}>{detailsModalZone.health}%</b>
                  </div>
                  <div>
                    <small>Soil Salinity EC</small>
                    <b>{detailsModalZone.soilEc}</b>
                  </div>
                </div>

                <div className="modal-npk-grid">
                  <div className="npk-box">
                    <span>Nitrogen (N)</span>
                    <b>{detailsModalZone.nitrogen}</b>
                  </div>
                  <div className="npk-box">
                    <span>Phosphorus (P)</span>
                    <b>{detailsModalZone.phosphorus}</b>
                  </div>
                  <div className="npk-box">
                    <span>Potassium (K)</span>
                    <b>{detailsModalZone.potassium}</b>
                  </div>
                </div>

                <div className="modal-advice-box">
                  <b>NASA Climate-Adaptive Advisory:</b>
                  <p>{detailsModalZone.advice}</p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-irrigate"
                  onClick={() => {
                    handleIrrigate(detailsModalZone.id);
                    setDetailsModalZone(null);
                  }}
                >
                  💧 Start Pulse Irrigation for {detailsModalZone.name}
                </button>
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setDetailsModalZone(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP MODAL: Field Activity Logger */}
        {logModalOpen && (
          <div className="dash-modal-backdrop" onClick={() => setLogModalOpen(false)}>
            <div className="dash-modal-dialog" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSaveActivity}>
                <div className="modal-head">
                  <h3>Log Field Activity</h3>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setLogModalOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group-field">
                    <label htmlFor="logZoneSelect">Target Zone</label>
                    <select
                      id="logZoneSelect"
                      value={activeZone === 'all' ? 'C' : activeZone}
                      onChange={e => setActiveZone(e.target.value)}
                    >
                      <option value="A">Zone A (Spinach &amp; Groundnut)</option>
                      <option value="B">Zone B (Lettuce &amp; Cereal)</option>
                      <option value="C">Zone C (Pulse Fallow)</option>
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="logActionType">Activity Category</label>
                    <select
                      id="logActionType"
                      value={logActivityType}
                      onChange={e => setLogActivityType(e.target.value)}
                    >
                      <option value="Irrigation Check">💧 Irrigation &amp; Soil Moisture Check</option>
                      <option value="Fertigation / Organic NPK">🌱 Fertigation / Organic NPK Application</option>
                      <option value="Cover Crop Seeding">🌾 Cover Crop Seeding</option>
                      <option value="Soil Compaction Scout">🔍 Soil Compaction &amp; Salinity Scout</option>
                      <option value="Harvest &amp; Rotation Prep">🚜 Harvest &amp; Rotation Prep</option>
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="logNotesInput">Technician Observations &amp; Sensor Calibration</label>
                    <textarea
                      id="logNotesInput"
                      rows={3}
                      placeholder="e.g. Applied 25kg/ha organic compost; surface moisture matches NASA POWER forecast."
                      value={logNotes}
                      onChange={e => setLogNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn-modal-save">
                    Save Field Activity
                  </button>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setLogModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
