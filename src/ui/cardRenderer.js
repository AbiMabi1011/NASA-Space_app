/**
 * Rotation Card & Baseline UI Components
 */

import { average } from '../core/seasons.js';
import { buildSeasonStats } from '../core/seasons.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

const RANK_LABELS = [
  '#1 TOP RECOMMENDATION',
  '#2 STRONG ALTERNATIVE',
  '#3 DIVERSIFIED OPTION'
];

export function renderRotationCards(container, rankedItems, stats, seasonName, waterAccessVal) {
  container.innerHTML = rankedItems.map((item, i) => {
    const nasaNote = stats.rows.length
      ? `NASA ${seasonName}: ${stats.dryCount}/${stats.rows.length} historical seasons were below 75% of that season’s median rainfall.`
      : 'NASA seasonal history is not available yet.';

    const waterNote = waterAccessVal === 'reliable'
      ? 'Reliable irrigation reduces the water-priority weight.'
      : waterAccessVal === 'limited'
        ? 'Limited irrigation keeps water demand in the ranking.'
        : 'Rainfed conditions give drought fit more weight.';

    const rankTag = RANK_LABELS[i] || `#${i + 1} OPTION`;

    return `
      <article class="rotation-card ${i === 0 ? 'top-pick' : ''}">
        <div class="card-rank-strip">
          <span class="rank-tag">${rankTag}</span>
          <span class="match-badge">RULE MATCH: <strong>${item.score}</strong>/100</span>
        </div>
        <div class="rotation-top">
          <div class="rotation-name">${escapeHtml(item.name)}</div>
        </div>
        <div class="crop-flow">
          ${item.crops.map((crop, j) => `
            ${j ? '<svg class="crop-arrow inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' : ''}
            <span class="crop-chip">${escapeHtml(crop)}</span>
          `).join('')}
        </div>
        <div class="rotation-reason">${escapeHtml(item.note)}</div>
        <div class="rotation-climate-signal">
          <span class="signal-tag"><svg class="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg> NASA Climate Signal:</span> ${nasaNote} ${waterNote}
        </div>
      </article>
    `;
  }).join('');
}

export function renderBaseline(container, currentCrop, waterAccessLabel) {
  container.innerHTML = `
    <div class="baseline-header">
      <span class="baseline-badge"><svg class="inline-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> YOUR STARTING BASELINE</span>
      <span class="baseline-crop">${escapeHtml(currentCrop)}</span>
    </div>
    <div class="baseline-sub">Water Access: <strong>${escapeHtml(waterAccessLabel)}</strong> · Compare the suggestions below against your baseline.</div>
  `;
}

export function renderGpmCrossCheck(container, dataMode, gpmHistory, powerStats, seasonName, selectedSeason) {
  if (dataMode !== 'nasa') {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title"><svg class="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg> NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
        <span class="gpm-badge offline">DEMO MODE</span>
      </div>
      <p>Running in sample fallback mode: no live satellite rainfall comparison is being shown.</p>
    `;
    return;
  }

  if (!gpmHistory.length) {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title"><svg class="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg> NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
        <span class="gpm-badge notice">UNAVAILABLE FOR GRID</span>
      </div>
      <p>The secondary satellite series is uncalibrated for this point. Ranking continues using the verified NASA POWER Agroclimatology series above.</p>
    `;
    return;
  }

  const gpmStats = buildSeasonStats(selectedSeason, gpmHistory);
  const common = powerStats.rows
    .map(row => ({
      power: row.rainMm,
      gpm: gpmStats.rows.find(other => other.year === row.year)?.rainMm
    }))
    .filter(pair => Number.isFinite(pair.gpm));

  if (!common.length) {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title"><svg class="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg> NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
        <span class="gpm-badge notice">NO OVERLAPPING YEARS</span>
      </div>
      <p>Could not match complete ${seasonName} seasons between POWER and GPM IMERG for this grid cell.</p>
    `;
    return;
  }

  const diffs = common.map(p => Math.abs(p.power - p.gpm));
  const meanDiff = Math.round(average(diffs));

  container.innerHTML = `
    <div class="gpm-header">
      <span class="gpm-check-title"><svg class="inline-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg> NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
      <span class="gpm-badge live">SATELLITE CROSS-CHECK ACTIVE</span>
    </div>
    <p>Compared across <strong>${common.length} complete ${seasonName} seasons</strong>: average seasonal difference between NASA POWER and GPM IMERG is <strong>${meanDiff} mm</strong>. FieldShift displays this independently and never blends the two precipitation estimates.</p>
  `;
}
