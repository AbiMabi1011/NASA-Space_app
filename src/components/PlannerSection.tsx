import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { PRIORITY_LABELS } from '../core/rankingEngine.js';
import { CropRotation, SeasonStats, SoilType, Priority, WaterAccess, Season } from '../types/index.js';

interface Preset {
  name: string;
  country: string;
  region: 'south-asia' | 'africa' | 'americas' | 'australia-med';
  lat: number;
  lon: number;
}

const GLOBAL_PRESETS: Preset[] = [
  // South Asia (Dry Zone & Major Agricultural Hubs)
  { name: 'Jaffna Peninsula', country: 'Sri Lanka', region: 'south-asia', lat: 9.66, lon: 80.02 },
  { name: 'Anuradhapura', country: 'Sri Lanka', region: 'south-asia', lat: 8.31, lon: 80.40 },
  { name: 'Kilinochchi', country: 'Sri Lanka', region: 'south-asia', lat: 9.38, lon: 80.40 },
  { name: 'Tamil Nadu (Cauvery Delta)', country: 'India', region: 'south-asia', lat: 10.78, lon: 79.13 },
  { name: 'Maharashtra (Vidarbha Drylands)', country: 'India', region: 'south-asia', lat: 20.93, lon: 77.75 },
  { name: 'Punjab (Wheat-Rice Belt)', country: 'India', region: 'south-asia', lat: 30.90, lon: 75.85 },

  // Sub-Saharan Africa
  { name: 'Rift Valley (Nakuru)', country: 'Kenya', region: 'africa', lat: -0.30, lon: 36.08 },
  { name: 'Sahel Savannah (Dakar East)', country: 'Senegal', region: 'africa', lat: 14.71, lon: -17.46 },
  { name: 'Oromia Highlands', country: 'Ethiopia', region: 'africa', lat: 7.55, lon: 39.28 },

  // Americas
  { name: 'Central Valley (Fresno)', country: 'United States', region: 'americas', lat: 36.75, lon: -119.77 },
  { name: 'Corn Belt (Ames, Iowa)', country: 'United States', region: 'americas', lat: 42.03, lon: -93.63 },
  { name: 'Cerrado Grain Plateau', country: 'Brazil', region: 'americas', lat: -15.78, lon: -47.92 },

  // Australia & Mediterranean
  { name: 'Murray-Darling Basin', country: 'Australia', region: 'australia-med', lat: -34.18, lon: 142.16 },
  { name: 'Andalusia Olive Plains', country: 'Spain', region: 'australia-med', lat: 37.38, lon: -5.98 }
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
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');
  const [activeRotationIdx, setActiveRotationIdx] = useState<number>(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

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

  const handlePresetClick = (lat: number, lon: number, name: string): void => {
    setLatitude(lat);
    setLongitude(lon);
    onFetchClimate(lat, lon);
    setMapNotice(`Jumped to ${name}. NASA climate data queried.`);
    setTimeout(() => setMapNotice(null), 3000);
  };

  const scrollToRecommendations = (): void => {
    const el = document.getElementById('recommendations');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Clean inline SVG pin marker
    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="pin-marker-wrapper">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#047857" stroke="#ffffff" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="pin-glow"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    const satTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Esri World Imagery'
    });

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 8,
      layers: [mapLayer === 'satellite' ? satTiles : streetTiles],
      scrollWheelZoom: true
    });

    const marker = L.marker([latitude, longitude], { icon: pinIcon, draggable: true }).addTo(map);
    marker.bindPopup(`<b>Selected Farm Coordinates</b><br/>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E<br/><small>Drag or click anywhere to update</small>`);

    // On marker drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const lat = Number(pos.lat.toFixed(4));
      const lon = Number(pos.lng.toFixed(4));
      setLatitude(lat);
      setLongitude(lon);
      marker.setPopupContent(`<b>Selected Farm Coordinates</b><br/>${lat}°N, ${lon}°E<br/><small>NASA POWER query triggered</small>`).openPopup();
      onFetchClimate(lat, lon);
      setMapNotice(`Pin dragged to ${lat}°N, ${lon}°E. Fetching NASA climate...`);
      setTimeout(() => setMapNotice(null), 3000);
    });

    // On map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lon = Number(e.latlng.lng.toFixed(4));
      setLatitude(lat);
      setLongitude(lon);
      marker.setLatLng([lat, lon]);
      marker.setPopupContent(`<b>Selected Farm Coordinates</b><br/>${lat}°N, ${lon}°E<br/><small>NASA POWER query triggered</small>`).openPopup();
      map.panTo([lat, lon]);
      onFetchClimate(lat, lon);
      setMapNotice(`Point selected: ${lat}°N, ${lon}°E. Fetching NASA climate...`);
      setTimeout(() => setMapNotice(null), 3000);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker and pan map when latitude or longitude changes outside the map
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - latitude) > 0.005 || Math.abs(cur.lng - longitude) > 0.005) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setPopupContent(`<b>Selected Farm Coordinates</b><br/>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`).openPopup();
        mapInstanceRef.current.flyTo([latitude, longitude], 8, { duration: 1.0 });
      }
    }
  }, [latitude, longitude]);

  // Switch between Standard Street and Satellite Imagery layers
  const switchLayer = (layerType: 'streets' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    setMapLayer(layerType);
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    if (layerType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Esri World Imagery'
      }).addTo(mapInstanceRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapInstanceRef.current);
    }
  };

  // Center map on current coordinates
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 9, { duration: 0.8 });
    }
  };

  const filteredPresets = selectedRegion === 'all'
    ? GLOBAL_PRESETS
    : GLOBAL_PRESETS.filter(p => p.region === selectedRegion);

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

          {/* PROMINENT COORDINATES & GLOBAL LOCATION SELECTOR WITH INTERACTIVE MAP */}
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
              <small>Click map, select a global preset, or type exact coordinates</small>
            </div>

            {/* INTERACTIVE POINT-AND-CLICK MAP WIDGET */}
            <div className="interactive-farm-map-card">
              <div className="map-toolbar">
                <div className="map-layer-switch">
                  <button
                    type="button"
                    className={`map-tool-btn ${mapLayer === 'streets' ? 'active' : ''}`}
                    onClick={() => switchLayer('streets')}
                  >
                    🗺️ Street Map
                  </button>
                  <button
                    type="button"
                    className={`map-tool-btn ${mapLayer === 'satellite' ? 'active' : ''}`}
                    onClick={() => switchLayer('satellite')}
                  >
                    🛰️ Satellite Imagery
                  </button>
                </div>
                <button
                  type="button"
                  className="map-recenter-btn"
                  onClick={handleRecenter}
                  title="Recenter on current marker"
                >
                  🎯 Center Pin
                </button>
              </div>

              {/* Leaflet Map Canvas */}
              <div
                ref={mapContainerRef}
                id="farmLeafletMap"
                className="farm-leaflet-map-canvas"
                style={{ height: '240px', width: '100%', borderRadius: '8px' }}
              ></div>

              <div className="map-instruction-bar">
                <span>💡 <strong>Click or drag the pin anywhere on Earth</strong> to fetch NASA POWER satellite climate data for that spot.</span>
                {mapNotice && <span className="map-toast-pill">{mapNotice}</span>}
              </div>
            </div>

            {/* Global Region Selector Filter */}
            <div className="global-region-filter">
              <span className="region-filter-label">Global Agricultural Presets:</span>
              <div className="region-tabs-row">
                {[
                  { key: 'all', label: 'All Presets' },
                  { key: 'south-asia', label: 'South Asia' },
                  { key: 'africa', label: 'Africa' },
                  { key: 'americas', label: 'Americas' },
                  { key: 'australia-med', label: 'Aus & Med' }
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    className={`region-tab-pill ${selectedRegion === r.key ? 'active' : ''}`}
                    onClick={() => setSelectedRegion(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Buttons Grid */}
            <div className="preset-buttons" role="group" aria-label="Location presets">
              {filteredPresets.map(p => {
                const isActive = Math.abs(p.lat - latitude) < 0.08 && Math.abs(p.lon - longitude) < 0.08;
                return (
                  <button
                    key={p.name}
                    type="button"
                    className={`preset-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handlePresetClick(p.lat, p.lon, p.name)}
                    title={`${p.name}, ${p.country} (${p.lat}°N, ${p.lon}°E)`}
                  >
                    <span className="preset-btn-name">{p.name}</span>
                    <small className="preset-btn-country">{p.country}</small>
                  </button>
                );
              })}
            </div>

            {/* Latitude & Longitude Inputs + Update Button */}
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
                <option value="sandy">Sandy loam (Dry zone typical / fast draining)</option>
                <option value="clay">Clay loam (Moisture retaining / high plasticity)</option>
                <option value="silt">Silty loam (Nutrient rich / high water capacity)</option>
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
                <option>Maize / Corn</option>
                <option>Sorghum</option>
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
                <option value="limited">Limited irrigation (Agro-well / tank / supplementary)</option>
                <option value="reliable">Reliable irrigation (Canal / deep well / drip system)</option>
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
                  <b>Planning Season &amp; Growing Window</b>
                  <small>Select your target cropping cycle (works globally)</small>
                </div>
                <div className="season-switch" role="group" aria-label="Planning season">
                  <button
                    type="button"
                    className={`season-btn ${selectedSeason === 'yala' ? 'selected' : ''}`}
                    data-season="yala"
                    onClick={() => setSelectedSeason('yala')}
                  >
                    Yala (Dry Cycle)
                  </button>
                  <button
                    type="button"
                    className={`season-btn ${selectedSeason === 'maha' ? 'selected' : ''}`}
                    data-season="maha"
                    onClick={() => setSelectedSeason('maha')}
                  >
                    Maha (Monsoon Cycle)
                  </button>
                </div>
              </div>
              <div className="hint-pill season-hint">
                <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6m-4 4h2m-5-8.5a7 7 0 1 1 8 0c-.8 1-1.5 2-1.5 3.5h-5c0-1.5-.7-2.5-1.5-3.5z" />
                </svg>
                <b>Global Agro-Calendar Guide:</b> <em>Yala / Dry Cycle</em> = March–August window (minor dry period in tropical monsoon climates, or summer in temperate zones). <em>Maha / Monsoon Cycle</em> = September–February window (major monsoon rains in tropics, or autumn-winter in temperate zones). Matches NASA POWER solar &amp; rain data worldwide.
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
              <div className="eyebrow-step output-eyebrow">
                <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                STEP 2 · RECOMMENDED ROTATIONS (OUTPUT)
              </div>
              <h2>Suggested Pathways to Explore</h2>
            </div>
            <div className="results-heading-actions">
              <button
                type="button"
                className="view-mode-toggle-btn"
                onClick={() => setViewMode(viewMode === 'stepper' ? 'all' : 'stepper')}
                title="Toggle between one-by-one presentation and full grid view"
              >
                {viewMode === 'stepper' ? '📑 Show All 3' : '🗂️ One by One'}
              </button>
              <span className="results-count-pill">{rankedRotations.length} TOP IDEAS</span>
            </div>
          </div>

          <p className="panel-intro" id="resultIntro">
            {introTexts[selectedPriority] || introTexts.water}
          </p>

          <div className="baseline-banner" id="currentBaseline">
            <div className="baseline-badge">YOUR STARTING BASELINE</div>
            <strong>{currentCrop}</strong>
            <span>Water Access: {waterAccessLabel} · Compare the suggestions below against your baseline.</span>
          </div>

          {/* Stepper Tabs (Shown in One-by-One Mode) */}
          {viewMode === 'stepper' && (
            <div className="rotation-stepper-tabs" role="tablist">
              {rankedRotations.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeRotationIdx === idx}
                  className={`rotation-tab-btn ${activeRotationIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveRotationIdx(idx)}
                >
                  <span className="tab-rank-num">#{idx + 1}</span>
                  <span className="tab-title-text">{RANK_LABELS[idx]?.split(' ')[1] || `Option ${idx + 1}`}</span>
                  <span className="tab-score-chip">{item.score}/100</span>
                </button>
              ))}
            </div>
          )}

          <div className="rotations-list" id="rotationList">
            {(viewMode === 'stepper'
              ? [rankedRotations[Math.min(activeRotationIdx, rankedRotations.length - 1)] || rankedRotations[0]].filter(Boolean)
              : rankedRotations
            ).map((item, i) => {
              const currentIdx = viewMode === 'stepper' ? activeRotationIdx : i;
              const rankLabel = RANK_LABELS[currentIdx] || `#${currentIdx + 1} OPTION`;
              return (
                <article key={item.id} className="rotation-card active-step-card">
                  <div className="card-rank-strip">
                    <span className="rank-tag">{rankLabel}</span>
                    <span className="match-badge">RULE MATCH: <strong>{item.score}</strong>/100</span>
                  </div>
                  <div className="rotation-top">
                    <div className="rotation-name">{item.name}</div>
                  </div>
                  <div className="crop-flow">
                    {item.crops.map((crop, j) => (
                      <React.Fragment key={crop}>
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
                  {item.reasonTag && (
                    <div className="card-reason-tag">
                      <span className="reason-tag-pill">{item.reasonTag}</span>
                    </div>
                  )}
                  <div className="rotation-climate-signal">
                    <span className="signal-tag">
                      <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
                      </svg>
                      NASA Climate Signal:
                    </span>
                    {' '}
                    {nasaNote} {waterNote}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Stepper Prev / Next Footer Controls */}
          {viewMode === 'stepper' && rankedRotations.length > 1 && (
            <div className="stepper-nav-bar">
              <button
                type="button"
                className="stepper-nav-btn prev"
                disabled={activeRotationIdx === 0}
                onClick={() => setActiveRotationIdx(Math.max(0, activeRotationIdx - 1))}
              >
                ‹ Previous Idea
              </button>
              <div className="stepper-dots">
                {rankedRotations.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    aria-label={`Go to idea ${dotIdx + 1}`}
                    className={`stepper-dot ${activeRotationIdx === dotIdx ? 'active' : ''}`}
                    onClick={() => setActiveRotationIdx(dotIdx)}
                  ></button>
                ))}
                <span className="stepper-counter-text">Idea {activeRotationIdx + 1} of {rankedRotations.length}</span>
              </div>
              <button
                type="button"
                className="stepper-nav-btn next"
                disabled={activeRotationIdx >= rankedRotations.length - 1}
                onClick={() => setActiveRotationIdx(Math.min(rankedRotations.length - 1, activeRotationIdx + 1))}
              >
                Next Idea ›
              </button>
            </div>
          )}

          <div className="decision-card-action">
            <button
              type="button"
              id="downloadFieldCard"
              className="export-card-button"
              onClick={onDownloadFieldCard}
            >
              <svg className="ui-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" />
              </svg>
              <span>Download Portable Field Decision Card</span>
            </button>
            <small>Printable 1-page HTML/PDF discussion aid for farmers &amp; extension officers</small>
          </div>

          <div className="why-box">
            <b>Why rotate with a pulse or legume?</b>
            <p>Legumes form symbiotic root partnerships with rhizobia to biologically fix atmospheric nitrogen into the soil, reducing synthetic fertilizer costs and breaking pest cycles.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
