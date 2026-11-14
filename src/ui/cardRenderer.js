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

    return `
      <article class="rotation-card">
        <div class="rotation-top">
          <div class="rotation-name">0${i + 1} &nbsp; ${escapeHtml(item.name)}</div>
          <span class="match-badge">RULE SCORE ${item.score}/100</span>
        </div>
        <div class="crop-flow">
          ${item.crops.map((crop, j) => `
            ${j ? '<span class="crop-arrow">→</span>' : ''}
            <span class="crop-chip">${escapeHtml(crop)}</span>
          `).join('')}
        </div>
        <div class="rotation-reason">${escapeHtml(item.note)}</div>
        <div class="rotation-reason">
          <strong>NASA climate signal:</strong> ${nasaNote} ${waterNote}
        </div>
      </article>
    `;
  }).join('');
}

export function renderBaseline(container, currentCrop, waterAccessLabel) {
  container.innerHTML = `
    <div class="baseline-label">YOUR CURRENT BASELINE</div>
    <div class="baseline-main">${escapeHtml(currentCrop)} · ${escapeHtml(waterAccessLabel)}</div>
    <div class="baseline-note">Use this as the comparison point; the app does not assume a yield or profit.</div>
  `;
}

export function renderGpmCrossCheck(container, dataMode, gpmHistory, powerStats, seasonName, selectedSeason) {
  if (dataMode !== 'nasa') {
    container.innerHTML = `
      <span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span>
      <p>Sample mode: no NASA rainfall comparison is being shown.</p>
    `;
    return;
  }

  if (!gpmHistory.length) {
    container.innerHTML = `
      <span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span>
      <p>The independent satellite rainfall series is unavailable. Rankings still use the NASA POWER Agroclimatology series shown above.</p>
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
      <span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span>
      <p>There are not enough matching seasons to compare these products.</p>
    `;
    return;
  }

  const powerMean = average(common.map(x => x.power));
  const gpmMean = average(common.map(x => x.gpm));
  const difference = powerMean ? (Math.abs(gpmMean - powerMean) / powerMean) * 100 : 0;

  container.innerHTML = `
    <span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK · ${common.length} MATCHED ${seasonName.toUpperCase()} SEASONS</span>
    <p>Mean seasonal rainfall: POWER Agroclimatology ${Math.round(powerMean)} mm · GPM IMERG satellite estimate ${Math.round(gpmMean)} mm. The two products differ by ${Math.round(difference)}% in this period; FieldShift keeps them separate instead of blending them.</p>
  `;
}

