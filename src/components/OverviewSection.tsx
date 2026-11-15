import React from 'react';
import { coordinateText, average } from '../core/seasons.js';
import { START_YEAR, END_YEAR } from '../state/appState.js';
import { SoilType, MonthlyClimate, DataMode } from '../types/index.js';

const SOIL_LABELS: Record<string, string> = {
  sandy: 'Sandy loam',
  clay: 'Clay loam',
  silt: 'Silty loam'
};

export interface OverviewSectionProps {
  latitude: number;
  longitude: number;
  soilType: SoilType | string;
  soilPh: number;
  monthlyClimate: MonthlyClimate;
  dataMode: DataMode;
  isLoading: boolean;
}

export default function OverviewSection({
  latitude,
  longitude,
  soilType,
  soilPh,
  monthlyClimate,
  dataMode,
  isLoading
}: OverviewSectionProps): React.JSX.Element {
  const isJaffna = Math.abs(latitude - 9.66) < 0.05 && Math.abs(longitude - 80.02) < 0.05;
  const latText = coordinateText(latitude, 'N', 'S');
  const lonText = coordinateText(longitude, 'E', 'W');

  const avgTemp = average(monthlyClimate.temp);
  const avgRain = average(monthlyClimate.rain);

  const soilName = SOIL_LABELS[soilType] || 'Sandy loam';

  return (
    <section className="site-container summary-section" id="overview">
      <div className="section-title-wrap">
        <div className="eyebrow">FIELD OVERVIEW · REAL-TIME AGROCLIMATIC STATE</div>
        <h2>Current Field &amp; Environmental Status</h2>
        <p className="section-intro">Continuously calibrated NASA POWER climate data and farmer-entered field notes.</p>
      </div>

      <div className="summary-grid" aria-label="Field summary">
        {/* Location Card */}
        <article className="summary-card location-card">
          <div className="card-top">
            <span className="card-label">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              YOUR FIELD LOCATION
            </span>
            <span className="tiny-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
              </svg>
            </span>
          </div>
          <div className="location-name" id="locationName">
            {isJaffna ? 'Jaffna peninsula' : 'Selected farm point'}
          </div>
          <div className="location-detail">NASA POWER nearest climate grid cell</div>
          <div className="coordinates" id="coordinateLabel">
            {latText} <span>·</span> {lonText}
          </div>
        </article>

        {/* Climate Snapshot Card */}
        <article className="summary-card climate-card">
          <div className="card-top">
            <span className="card-label">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
              </svg>
              CLIMATE SNAPSHOT (10-YR)
            </span>
            <span className={`data-tag ${dataMode === 'nasa' ? 'connected' : ''}`} id="dataStatus">
              {isLoading ? 'LOADING' : dataMode === 'nasa' ? 'NASA POWER' : 'DEMO DATA'}
            </span>
          </div>
          <div className="climate-numbers">
            <div>
              <strong id="tempValue">{avgTemp ? avgTemp.toFixed(1) : '—'}</strong>
              <small>°C avg temp</small>
            </div>
            <div className="metric-divider"></div>
            <div>
              <strong id="rainValue">{avgRain ? avgRain.toFixed(1) : '—'}</strong>
              <small>mm/day rain</small>
            </div>
          </div>
          <div className="climate-caption" id="climateCaption">
            {isLoading
              ? 'Fetching NASA POWER monthly history…'
              : dataMode === 'nasa'
              ? `NASA POWER monthly mean · ${START_YEAR}–${END_YEAR}`
              : `Illustrative sample · ${START_YEAR}–${END_YEAR} (not NASA observations)`}
          </div>
        </article>

        {/* Soil Profile Card */}
        <article className="summary-card soil-card">
          <div className="card-top">
            <span className="card-label">
              <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
              FIELD SOIL PROFILE
            </span>
            <span className="edit-label">EDIT BELOW ↓</span>
          </div>
          <div className="soil-name" id="soilSummary">{soilName}</div>
          <div className="soil-detail">
            <span className="soil-dot"></span>
            <span id="phSummary">pH {Number(soilPh).toFixed(1)} · farmer-entered estimate</span>
          </div>
          <div className="soil-hint">Recorded from your field notes</div>
        </article>
      </div>
    </section>
  );
}
