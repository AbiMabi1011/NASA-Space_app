/**
 * Climate and Historical Seasonal Chart Rendering
 */

import { MONTHS, coordinateText } from '../core/seasons.js';

export function renderMonthlyChart(container, monthlyClimate) {
  const { temp, rain } = monthlyClimate;
  const rainMax = Math.max(...rain, 0.1);
  const tempMin = Math.min(...temp) - 1;
  const tempMax = Math.max(...temp) + 1;

  container.innerHTML = MONTHS.map((month, i) => {
    const rainHeight = Math.max(3, (rain[i] / rainMax) * 76);
    const tempPosition = 12 + ((temp[i] - tempMin) / (tempMax - tempMin)) * 74;
    return `
      <div class="month-col">
        <div class="bar-wrap">
          <div class="rain-bar" style="height:${rainHeight}%" title="${month}: ${rain[i].toFixed(1)} mm/day mean"></div>
          <span class="temp-dot" style="bottom:${tempPosition}%" title="${month}: ${temp[i].toFixed(1)} °C"></span>
        </div>
        <span class="month-label">${month}</span>
      </div>
    `;
  }).join('');
}

export function renderSeasonHistoryChart(chartEl, titleEl, summaryEl, stats, seasonName) {
  titleEl.textContent = `${seasonName} rainfall · year by year`;

  if (!stats.rows.length) {
    chartEl.innerHTML = '<p class="history-empty">Historical seasonal totals are not available.</p>';
    summaryEl.textContent = 'No complete seasons returned';
    return;
  }

  const maxRain = Math.max(...stats.rows.map(row => row.rainMm), stats.baseline, 1);
  const thresholdBottom = 22 + (stats.dryLimit / maxRain) * 90;

  chartEl.innerHTML = `
    <div class="history-threshold" style="bottom:${thresholdBottom}px">
      <span>75% threshold · ${Math.round(stats.dryLimit)} mm</span>
    </div>
    <div class="history-bars">
      ${stats.rows.map(row => {
        const dry = row.rainMm < stats.dryLimit;
        return `
          <div class="history-bar" title="${row.year}: ${Math.round(row.rainMm)} mm${dry ? ' · below threshold' : ''}">
            <i class="${dry ? 'is-dry' : ''}" style="height:${Math.max(3, (row.rainMm / maxRain) * 100)}%"></i>
            <small>${String(row.year).slice(-2)}</small>
          </div>
        `;
      }).join('')}
    </div>
  `;

  summaryEl.textContent = `${stats.rows.length} complete ${seasonName} seasons · median ${Math.round(stats.baseline)} mm · ${stats.dryCount} below the 75% threshold`;
}

