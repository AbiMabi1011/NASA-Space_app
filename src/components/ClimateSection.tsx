import React from 'react';
import { MONTHS, coordinateText, average, buildSeasonStats } from '../core/seasons.js';
import { START_YEAR, END_YEAR } from '../state/appState.js';
import { SeasonStats, MonthlyClimate, DataMode, ClimateRecord, Season } from '../types/index.js';

export interface ClimateSectionProps {
  latitude: number;
  longitude: number;
  stats: SeasonStats;
  monthlyClimate: MonthlyClimate;
  dataMode: DataMode;
  gpmHistory: ClimateRecord[];
  selectedSeason: Season | string;
  onRefreshData: () => void;
}

export default function ClimateSection({
  latitude,
  longitude,
  stats,
  monthlyClimate,
  dataMode,
  gpmHistory,
  selectedSeason,
  onRefreshData
}: ClimateSectionProps): React.JSX.Element {
  const seasonName = selectedSeason === 'yala' ? 'Yala' : 'Maha';

  const latText = coordinateText(latitude, 'N', 'S');
  const lonText = coordinateText(longitude, 'E', 'W');

  // 12-Month Climatology chart calculations
  const { temp, rain } = monthlyClimate;
  const rainMax = Math.max(...rain, 0.1);
  const tempMin = Math.min(...temp) - 1;
  const tempMax = Math.max(...temp) + 1;

  // Season history calculations
  const hasRows = stats && stats.rows && stats.rows.length > 0;
  const maxRain = hasRows
    ? Math.max(...stats.rows.map(row => row.rainMm), stats.baseline, 1)
    : 1;
  const thresholdBottom = hasRows ? 22 + (stats.dryLimit / maxRain) * 90 : 0;

  // GPM Cross check
  let gpmContent: React.ReactNode = null;
  if (dataMode !== 'nasa') {
    gpmContent = (
      <>
        <div className="gpm-header">
          <span className="gpm-check-title">
            <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
            </svg>{' '}
            NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK
          </span>
          <span className="gpm-badge offline">DEMO MODE</span>
        </div>
        <p>Running in sample fallback mode: no live satellite rainfall comparison is being shown.</p>
      </>
    );
  } else if (!gpmHistory || !gpmHistory.length) {
    gpmContent = (
      <>
        <div className="gpm-header">
          <span className="gpm-check-title">
            <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
            </svg>{' '}
            NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK
          </span>
          <span className="gpm-badge notice">UNAVAILABLE FOR GRID</span>
        </div>
        <p>The secondary satellite series is uncalibrated for this point. Ranking continues using the verified NASA POWER Agroclimatology series above.</p>
      </>
    );
  } else {
    const gpmStats = buildSeasonStats(selectedSeason, gpmHistory);
    const common = stats.rows
      .map(row => ({
        power: row.rainMm,
        gpm: gpmStats.rows.find(other => other.year === row.year)?.rainMm
      }))
      .filter((pair): pair is { power: number; gpm: number } => pair.gpm !== undefined && Number.isFinite(pair.gpm));

    if (!common.length) {
      gpmContent = (
        <>
          <div className="gpm-header">
            <span className="gpm-check-title">
              <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
              </svg>{' '}
              NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK
            </span>
            <span className="gpm-badge notice">NO OVERLAPPING YEARS</span>
          </div>
          <p>Could not match complete {seasonName} seasons between POWER and GPM IMERG for this grid cell.</p>
        </>
      );
    } else {
      const diffs = common.map(p => Math.abs(p.power - p.gpm));
      const meanDiff = Math.round(average(diffs));
      gpmContent = (
        <>
          <div className="gpm-header">
            <span className="gpm-check-title">
              <svg className="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
              </svg>{' '}
              NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK
            </span>
            <span className="gpm-badge live">SATELLITE CROSS-CHECK ACTIVE</span>
          </div>
          <p>
            Compared across <strong>{common.length} complete {seasonName} seasons</strong>: average seasonal difference between NASA POWER and GPM IMERG is <strong>{meanDiff} mm</strong>. FieldShift displays this independently and never blends the two precipitation estimates.
          </p>
        </>
      );
    }
  }

  return (
    <section className="site-container climate-section" id="climate">
      <div className="climate-section-head">
        <div>
          <div className="eyebrow climate-eyebrow">
            <svg className="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z" />
            </svg>
            NASA EARTH OBSERVATIONS · AGROCLIMATOLOGY
          </div>
          <h2>Climate, in Context.</h2>
          <p>Ten complete years of monthly NASA POWER satellite and reanalysis data frame seasonal planning. This is not a short-term forecast.</p>
        </div>
        <div className="period-label">
          <span className="live-dot"></span> 10-YEAR HISTORICAL CLIMATOLOGY
        </div>
      </div>

      <div className="signal-grid" aria-label="NASA climate indicators">
        <article className="signal-card">
          <span>MEAN SEASONAL RAINFALL</span>
          <strong id="seasonRain">{hasRows ? `${Math.round(stats.meanRain)} mm` : '—'}</strong>
          <small>total seasonal mm</small>
        </article>
        <article className="signal-card highlight-card">
          <span>DRIER SEASONS RISK</span>
          <strong
            id="dryCount"
            title={hasRows ? `Drier means seasonal total rainfall below 75% of the ${seasonName} 10-year median (${Math.round(stats.baseline)} mm).` : ''}
          >
            {hasRows ? `${stats.dryCount}/${stats.rows.length}` : '—'}
          </strong>
          <small id="dryDefinition">
            {hasRows ? `of ${stats.rows.length} · <75% median` : 'of historical seasons'}
          </small>
        </article>
        <article className="signal-card">
          <span>MEAN AIR TEMPERATURE</span>
          <strong id="seasonTemp">{hasRows ? `${stats.meanTemp.toFixed(1)}°` : '—'}</strong>
          <small>mean 2-meter °C</small>
        </article>
      </div>

      {/* Year by Year Seasonal Variation Chart */}
      <div className="history-card">
        <div className="history-heading">
          <div>
            <b id="historyTitle">{seasonName} rainfall · year by year</b>
            <small id="historySummary">
              {hasRows
                ? `${stats.rows.length} complete ${seasonName} seasons · median ${Math.round(stats.baseline)} mm · ${stats.dryCount} below the 75% threshold`
                : 'No complete seasons returned'}
            </small>
          </div>
          <span className="history-legend"><i></i> Below 75% of median (Drier Season)</span>
        </div>
        <div id="seasonHistoryChart" className="season-history-chart" role="img" aria-label="Seasonal rainfall totals by year">
          {!hasRows ? (
            <p className="history-empty">Historical seasonal totals are not available.</p>
          ) : (
            <>
              <div className="history-threshold" style={{ bottom: `${thresholdBottom}px` }}>
                <span>75% threshold · {Math.round(stats.dryLimit)} mm</span>
              </div>
              <div className="history-bars">
                {stats.rows.map(row => {
                  const dry = row.rainMm < stats.dryLimit;
                  const barHeight = Math.max(3, (row.rainMm / maxRain) * 100);
                  return (
                    <div
                      key={row.year}
                      className="history-bar"
                      title={`${row.year}: ${Math.round(row.rainMm)} mm${dry ? ' · below threshold' : ''}`}
                    >
                      <i className={dry ? 'is-dry' : ''} style={{ height: `${barHeight}%` }}></i>
                      <small>{String(row.year).slice(-2)}</small>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Independent GPM IMERG satellite cross check */}
      <div className="gpm-check" id="gpmCheck">
        {gpmContent}
      </div>

      {/* 12-Month Climatology Chart */}
      <div className="chart-card">
        <div className="chart-legend">
          <span><i className="legend-rain"></i> Precipitation (mm/day)</span>
          <span><i className="legend-temp"></i> Temperature (°C)</span>
          <span className="chart-unit" id="chartLocation">
            {latText}, {lonText} · {START_YEAR}–{END_YEAR}
          </span>
        </div>
        <div className="chart" id="climateChart" role="img" aria-label="Monthly precipitation and temperature chart">
          {MONTHS.map((month, i) => {
            const rainHeight = Math.max(3, (rain[i] / rainMax) * 76);
            const tempPosition = 12 + ((temp[i] - tempMin) / (tempMax - tempMin)) * 74;
            return (
              <div key={month} className="month-col">
                <div className="bar-wrap">
                  <div
                    className="rain-bar"
                    style={{ height: `${rainHeight}%` }}
                    title={`${month}: ${rain[i].toFixed(1)} mm/day mean`}
                  ></div>
                  <span
                    className="temp-dot"
                    style={{ bottom: `${tempPosition}%` }}
                    title={`${month}: ${temp[i].toFixed(1)} °C`}
                  ></span>
                </div>
                <span className="month-label">{month}</span>
              </div>
            );
          })}
        </div>
        <div className="chart-footer">
          <span>
            Source: <a href="https://power.larc.nasa.gov/docs/services/api/temporal/monthly/" target="_blank" rel="noreferrer">NASA POWER Monthly Point API</a> · Agroclimatology
          </span>
          <button id="refreshData" type="button" className="text-button" onClick={onRefreshData}>
            <svg className="ui-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh NASA Data
          </button>
        </div>
      </div>

      <details className="method-details">
        <summary>How FieldShift uses NASA data (Transparent Methodology)</summary>
        <p>We compare the selected season's NASA POWER rainfall totals with that season's median in the available decade. A season below 75% of that median is counted as "drier." The ranking uses seven 1–5 prototype traits: water efficiency, dry-condition fit, soil-building potential, market options, soil-texture fit, ground cover, and legume inclusion. Your priority sets the relative weights; water access adjusts the water-efficiency weight, and a higher frequency of drier seasons raises the dry-condition weight. We normalize the weighted average and multiply by 20 for a score out of 100. Yala (March–August) and Maha (September–February) are broad dry-zone planning windows; local crop calendars differ. NASA POWER meteorological variables are gridded, model-based climate data, not measurements from this field. The ranking is not a crop-yield or drought forecast.</p>
      </details>
    </section>
  );
}
