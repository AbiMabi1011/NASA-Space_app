import React from 'react';
import { PRIORITY_LABELS } from '../core/rankingEngine.js';
import { CropRotation, SeasonStats, SoilType, Priority, WaterAccess, Season } from '../types/index.js';

interface Preset {
  name: string;
  lat: number;
  lon: number;
}

const PRESETS: Preset[] = [
  { name: 'Jaffna Peninsula', lat: 9.66, lon: 80.02 },
  { name: 'Anuradhapura', lat: 8.31, lon: 80.40 },
  { name: 'Kilinochchi', lat: 9.38, lon: 80.40 }
];

const RANK_LABELS: string[] = [
  '#1 TOP RECOMMENDATION',
  '#2 STRONG ALTERNATIVE',
  '#3 DIVERSIFIED OPTION'
];

export interface PlannerSectionProps {
  latitude: number;
  setLatitude: (lat: number) => void;
  longitude: number;
  setLongitude: (lon: number) => void;
  onFetchClimate: (lat: number, lon: number) => void;
  soilType: SoilType | string;
  setSoilType: (type: SoilType | string) => void;
  soilPh: number;
  setSoilPh: (ph: number) => void;
  currentCrop: string;
  setCurrentCrop: (crop: string) => void;
  waterAccess: WaterAccess | string;
  setWaterAccess: (water: WaterAccess | string) => void;
  selectedPriority: Priority | string;
  setSelectedPriority: (priority: Priority) => void;
  selectedSeason: Season | string;
  setSelectedSeason: (season: Season) => void;
  rankedRotations: CropRotation[];
  stats: SeasonStats;
  onDownloadFieldCard: () => void;
  stepPillText?: string;
}

export default function PlannerSection({
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  onFetchClimate,
  soilType,
  setSoilType,
  soilPh,
  setSoilPh,
  currentCrop,
  setCurrentCrop,
  waterAccess,
  setWaterAccess,
  selectedPriority,
  setSelectedPriority,
  selectedSeason,
  setSelectedSeason,
  rankedRotations,
  stats,
  onDownloadFieldCard
}: PlannerSectionProps): React.JSX.Element {
  const seasonName = selectedSeason === 'yala' ? 'Yala' : 'Maha';

  const introTexts: Record<string, string> = {
    water: `Ranked for ${PRIORITY_LABELS.water.toLowerCase()} in ${seasonName}, using this location’s observed NASA rainfall history and your water-access choice.`,
    soil: `Ranked for ${PRIORITY_LABELS.soil.toLowerCase()} in ${seasonName}, using your soil texture and NASA rainfall history.`,
    income: `Ranked for ${PRIORITY_LABELS.income.toLowerCase()} in ${seasonName}; market fit is a planning proxy, so check local prices.`
  };

  const waterAccessOptions: Record<string, string> = {
    rainfed: 'Mostly rainfed (High drought exposure)',
    limited: 'Limited irrigation (Agro-well / tank)',
    reliable: 'Reliable irrigation (Canal / deep well)'
  };
  const waterAccessLabel = waterAccessOptions[waterAccess] || waterAccess;

  const currentPresetIndex = PRESETS.findIndex(
    p => Math.abs(p.lat - latitude) < 0.05 && Math.abs(p.lon - longitude) < 0.05
  );

  const handlePresetClick = (lat: number, lon: number): void => {
    setLatitude(lat);
    setLongitude(lon);
    onFetchClimate(lat, lon);
  };

  const scrollToRecommendations = (): void => {
    const el = document.getElementById('recommendations');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const nasaNote = stats && stats.rows && stats.rows.length
    ? `NASA ${seasonName}: ${stats.dryCount}/${stats.rows.length} historical seasons were below 75% of that season’s median rainfall.`
    : 'NASA seasonal history is not available yet.';

  const waterNote = waterAccess === 'reliable'
    ? 'Reliable irrigation reduces the water-priority weight.'
    : waterAccess === 'limited'
    ? 'Limited irrigation keeps water demand in the ranking.'
    : 'Rainfed conditions give drought fit more weight.';

  return (
    <div className="site-container">
      {/* INPUT → OUTPUT Visual Flow Indicator */}
      <div className="flow-indicator" aria-hidden="true">
        <div className="flow-step flow-step-input">
          <span className="flow-num">1</span>
          <span className="flow-label">Enter Farm Conditions</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step flow-step-output">
          <span className="flow-num">2</span>
          <span className="flow-label">Get Rotation Recommendations</span>
        </div>
      </div>

      <div className="content-grid">
        {/* LEFT COLUMN: INPUTS */}
        <section className="panel planner-panel" id="planner">
          <div className="panel-heading">
            <div>
              <div className="eyebrow-step input-eyebrow">
                <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" />
                </svg>
                STEP 1 · ENTER FARM CONDITIONS (INPUT)
              </div>
              <h2>What are your field notes?</h2>
            </div>
            <span className="step-pill">01 <span>OF</span> 02</span>
          </div>
          <p className="panel-intro">Configure your field's location, soil, water access, and seasonal goal below.</p>

          {/* PROMINENT COORDINATES & LOCATION SELECTOR */}
          <div className="form-section-block coord-box-highlight">
            <div className="coord-highlight-label">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4.93 4.93a10 10 0 0 1 14.14 0m-11.31 2.83a6 6 0 0 1 8.48 0M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 0v8" />
              </svg>
              Enter Your Farm's GPS Coordinates Here
            </div>
            <div className="section-block-title">
              <span>
                <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Step 1A: Farm Coordinates
              </span>
              <small>Select a preset or enter exact point</small>
            </div>
            <div className="preset-buttons" role="group" aria-label="Location presets">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset-btn ${idx === currentPresetIndex ? 'active' : ''}`}
                  onClick={() => handlePresetClick(p.lat, p.lon)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="coordinate-inputs-box">
              <div className="coord-field">
                <label htmlFor="latitude">Latitude (°N/S)</label>
                <input
                  id="latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="0.01"
                  value={latitude}
                  onChange={e => setLatitude(Number(e.target.value))}
                  aria-label="Latitude"
                />
              </div>
              <div className="coord-field">
                <label htmlFor="longitude">Longitude (°E/W)</label>
                <input
                  id="longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="0.01"
                  value={longitude}
                  onChange={e => setLongitude(Number(e.target.value))}
                  aria-label="Longitude"
                />
              </div>
              <button
                id="updateLocation"
                type="button"
                className="coord-update-button"
                title="Fetch NASA POWER climate data for these coordinates"
                onClick={() => onFetchClimate(latitude, longitude)}
              >
                <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.93 4.93a10 10 0 0 1 14.14 0m-11.31 2.83a6 6 0 0 1 8.48 0M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 0v8" />
                </svg>
                Fetch NASA Data
              </button>
            </div>
          </div>

          {/* SOIL & CROP SETTINGS */}
          <div className="form-section-block">
            <div className="section-block-title">
              <span>
                <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
                Step 1B: Soil &amp; Current Crop Profile
              </span>
            </div>

            <div className="form-row">
              <label htmlFor="soilType">Soil Texture</label>
              <select
                id="soilType"
                value={soilType}
                onChange={e => setSoilType(e.target.value as SoilType)}
              >
                <option value="sandy">Sandy loam (Dry zone typical)</option>
                <option value="clay">Clay loam (Moisture retaining)</option>
                <option value="silt">Silty loam (Nutrient rich)</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="soilPh">
                Estimated Soil pH: <span className="field-value" id="phValue">{Number(soilPh).toFixed(1)}</span>
              </label>
              <input
                id="soilPh"
                type="range"
                min="4.5"
                max="8.5"
                step="0.1"
                value={soilPh}
                onChange={e => setSoilPh(Number(e.target.value))}
                aria-label="Soil pH"
              />
            </div>

            <div className="form-row">
              <label htmlFor="currentCrop">Current Main Crop</label>
              <select
                id="currentCrop"
                value={currentCrop}
                onChange={e => setCurrentCrop(e.target.value)}
              >
                <option>Rice</option>
                <option>Groundnut</option>
                <option>Onion</option>
                <option>Chilli</option>
                <option>Green gram</option>
                <option>Other / mixed</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="waterAccess">Water Access Level</label>
              <select
                id="waterAccess"
                value={waterAccess}
                onChange={e => setWaterAccess(e.target.value as WaterAccess)}
              >
                <option value="rainfed">Mostly rainfed (High drought exposure)</option>
                <option value="limited">Limited irrigation (Agro-well / tank)</option>
                <option value="reliable">Reliable irrigation (Canal / deep well)</option>
              </select>
            </div>
          </div>

          {/* STRATEGY & PLANNING SEASON */}
          <div className="form-section-block">
            <div className="section-block-title">
              <span>
                <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Step 1C: Strategy &amp; Planning Season
              </span>
            </div>

            <div className="priority-block">
              <label className="block-label">
                Your Top Priority: <small>What matters most this season?</small>
              </label>
              <div className="hint-pill">
                <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6m-4 4h2m-5-8.5a7 7 0 1 1 8 0c-.8 1-1.5 2-1.5 3.5h-5c0-1.5-.7-2.5-1.5-3.5z" />
                </svg>
                <b>Interactive Tip:</b> Click <em>Build soil</em> or <em>Steady income</em> to see crop ideas re-rank live!
              </div>
              <div className="priority-options" role="group" aria-label="Top priority">
                <button
                  type="button"
                  className={`priority-option ${selectedPriority === 'water' ? 'selected' : ''}`}
                  data-priority="water"
                  onClick={() => setSelectedPriority('water')}
                >
                  <span className="pri-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </span>
                  <b>Save water</b>
                  <small>Drought resilience</small>
                </button>
                <button
                  type="button"
                  className={`priority-option ${selectedPriority === 'soil' ? 'selected' : ''}`}
                  data-priority="soil"
                  onClick={() => setSelectedPriority('soil')}
                >
                  <span className="pri-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                    </svg>
                  </span>
                  <b>Build soil</b>
                  <small>Nitrogen &amp; biomass</small>
                </button>
                <button
                  type="button"
                  className={`priority-option ${selectedPriority === 'income' ? 'selected' : ''}`}
                  data-priority="income"
                  onClick={() => setSelectedPriority('income')}
                >
                  <span className="pri-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8m4-10v2m0 8v2" />
                    </svg>
                  </span>
                  <b>Steady income</b>
                  <small>Cash crop market</small>
                </button>
              </div>
            </div>

            <div className="season-block">
              <div className="season-header">
                <div>
                  <b>Planning Season</b>
                  <small>Select your target growing window</small>
                </div>
                <div className="season-switch" role="group" aria-label="Planning season">
                  <button
                    type="button"
                    className={`season-btn ${selectedSeason === 'yala' ? 'selected' : ''}`}
                    data-season="yala"
                    onClick={() => setSelectedSeason('yala')}
                  >
                    Yala
                  </button>
                  <button
                    type="button"
                    className={`season-btn ${selectedSeason === 'maha' ? 'selected' : ''}`}
                    data-season="maha"
                    onClick={() => setSelectedSeason('maha')}
                  >
                    Maha
                  </button>
                </div>
              </div>
              <div className="hint-pill season-hint">
                <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6m-4 4h2m-5-8.5a7 7 0 1 1 8 0c-.8 1-1.5 2-1.5 3.5h-5c0-1.5-.7-2.5-1.5-3.5z" />
                </svg>
                <b>Sri Lanka Season Guide:</b> <em>Yala</em> = minor dry season (Mar–Aug) · <em>Maha</em> = major monsoon season (Sep–Feb)
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-button"
            id="planButton"
            onClick={scrollToRecommendations}
          >
            <span>Explore Rotation Recommendations</span>
            <span>
              <svg className="arrow-svg inline-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>

          <a href="#recommendations" className="see-results-arrow" id="seeResultsArrow" aria-label="See rotation results">
            ↓ See Results
          </a>

          <p className="disclaimer">Decision-support prototype only. Always confirm sowing windows and inputs with local agricultural extension officers.</p>
        </section>

        {/* RIGHT COLUMN: OUTPUTS */}
        <section className="panel results-panel" id="recommendations">
          <div className="panel-heading results-heading">
            <div>
              <div className="eyebrow-step green output-eyebrow">
                <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7l-5-5-5 5m5-5v12" />
                </svg>
                STEP 2 · RECOMMENDED ROTATIONS (OUTPUT)
              </div>
              <h2 className="results-h2">Suggested Pathways to Explore</h2>
            </div>
            <span className="results-count">3 TOP IDEAS</span>
          </div>
          <p className="panel-intro" id="resultIntro">
            {introTexts[selectedPriority] || introTexts['water']}
          </p>

          {/* Current baseline indicator */}
          <div className="current-baseline" id="currentBaseline">
            <div className="baseline-header">
              <span className="baseline-badge">
                <svg className="inline-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                YOUR STARTING BASELINE
              </span>
              <span className="baseline-crop">{currentCrop}</span>
            </div>
            <div className="baseline-sub">
              Water Access: <strong>{waterAccessLabel}</strong> · Compare the suggestions below against your baseline.
            </div>
          </div>

          {/* Dynamic 3 rotation cards */}
          <div className="rotation-list" id="rotationList">
            {rankedRotations.map((item, i) => {
              const rankTag = RANK_LABELS[i] || `#${i + 1} OPTION`;
              return (
                <article key={item.name} className={`rotation-card ${i === 0 ? 'top-pick' : ''}`}>
                  <div className="card-rank-strip">
                    <span className="rank-tag">{rankTag}</span>
                    <span className="match-badge">RULE MATCH: <strong>{item.score}</strong>/100</span>
                  </div>
                  <div className="rotation-top">
                    <div className="rotation-name">{item.name}</div>
                  </div>
                  <div className="crop-flow">
                    {item.crops.map((crop, j) => (
                      <React.Fragment key={crop + j}>
                        {j > 0 && (
                          <svg className="crop-arrow inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        )}
                        <span className="crop-chip">{crop}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="rotation-reason">{item.note}</div>
                  <div className="rotation-climate-signal">
                    <span className="signal-tag">
                      <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
                      </svg>
                      NASA Climate Signal:
                    </span>{' '}
                    {nasaNote} {waterNote}
                  </div>
                </article>
              );
            })}
          </div>

          {/* One-click decision card export */}
          <div className="export-box">
            <button
              type="button"
              className="field-card-button"
              id="downloadFieldCard"
              onClick={onDownloadFieldCard}
            >
              <span>
                <svg className="ui-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" />
                </svg>
                Download Portable Field Decision Card
              </span>
              <small>Printable 1-page HTML/PDF discussion aid for farmers &amp; extension officers</small>
            </button>
          </div>

          <div className="why-box">
            <div className="why-mark">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
              </svg>
            </div>
            <div>
              <b>Why rotate with a pulse or legume?</b>
              <p>Legumes form symbiotic root partnerships with rhizobia to biologically fix atmospheric nitrogen into the soil, reducing synthetic fertilizer costs and breaking pest cycles.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
