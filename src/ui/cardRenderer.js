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
  '⭐ #1 TOP RECOMMENDATION',
  '🌱 #2 STRONG ALTERNATIVE',
  '🌾 #3 DIVERSIFIED OPTION'
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
            ${j ? '<span class="crop-arrow">➔</span>' : ''}
            <span class="crop-chip">${escapeHtml(crop)}</span>
          `).join('')}
        </div>
        <div class="rotation-reason">${escapeHtml(item.note)}</div>
        <div class="rotation-climate-signal">
          <span class="signal-tag">🛰️ NASA Climate Signal:</span> ${nasaNote} ${waterNote}
        </div>
      </article>
    `;
  }).join('');
}

export function renderBaseline(container, currentCrop, waterAccessLabel) {
  container.innerHTML = `
    <div class="baseline-header">
      <span class="baseline-badge">📍 YOUR STARTING BASELINE</span>
      <span class="baseline-crop">${escapeHtml(currentCrop)}</span>
    </div>
    <div class="baseline-sub">Water Access: <strong>${escapeHtml(waterAccessLabel)}</strong> · Compare the suggestions below against your baseline.</div>
  `;
}

export function renderGpmCrossCheck(container, dataMode, gpmHistory, powerStats, seasonName, selectedSeason) {
  if (dataMode !== 'nasa') {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title">🛰️ NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
        <span class="gpm-badge offline">DEMO MODE</span>
      </div>
      <p>Running in sample fallback mode: no live satellite rainfall comparison is being shown.</p>
    `;
    return;
  }

  if (!gpmHistory.length) {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title">🛰️ NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
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
    .filter(x => Number.isFinite(x.gpm));

  if (!common.length) {
    container.innerHTML = `
      <div class="gpm-header">
        <span class="gpm-check-title">🛰️ NASA GPM IMERG INDEPENDENT SATELLITE CROSS-CHECK</span>
        <span class="gpm-badge notice">NOT ENOUGH MATCHES</span>
      </div>
      <p>There are not enough matching seasons to compare these two independent products.</p>
    `;
    return;
  }

  const powerMean = average(common.map(x => x.power));
  const gpmMean = average(common.map(x => x.gpm));
  const difference = powerMean ? (Math.abs(gpmMean - powerMean) / powerMean) * 100 : 0;

  container.innerHTML = `
    <div class="gpm-header">
      <span class="gpm-check-title">🛰️ NASA GPM IMERG SATELLITE CROSS-CHECK · ${common.length} MATCHED ${seasonName.toUpperCase()} SEASONS</span>
      <span class="gpm-badge verified">INDEPENDENT VERIFICATION</span>
    </div>
    <p>
      Mean seasonal rainfall: <strong>POWER Agroclimatology: ${Math.round(powerMean)} mm</strong> vs. <strong>GPM IMERG Satellite: ${Math.round(gpmMean)} mm</strong> (differs by ${Math.round(difference)}%). FieldShift displays both transparently rather than silently blending models.
    </p>
  `;
}
