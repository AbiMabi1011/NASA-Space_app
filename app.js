/**
 * FieldShift — Farm rotation planner
 * Self-contained bundle compiled from modular architecture in src/
 * Compatible with both file:/// (double-click) and http:// / https:// protocols.
 */
(() => {

// --- src/core/cropCatalog.js ---
/**
 * Crop Rotation Catalog
 * Coarse, editable prototype assumptions (1–5 scale) for Jaffna dry-zone agriculture.
 * In a production setting, traits are validated with local agronomists and farmers.
 */

const ROTATIONS = [
  {
    id: 'groundnut-pulse-sesame',
    name: 'Groundnut → Green gram → Sesame',
    crops: ['Groundnut', 'Green gram', 'Sesame'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 3,
    cover: 3,
    legume: 1,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Three crop families with two pulse phases; check seed, market, and sowing windows locally.'
  },
  {
    id: 'pearlmillet-cowpea-cover',
    name: 'Pearl millet → Cowpea → Cover crop',
    crops: ['Pearl millet', 'Cowpea', 'Cover crop'],
    water: 1,
    dry: 5,
    soil: 4,
    market: 2,
    cover: 5,
    legume: 1,
    texture: { sandy: 4, clay: 4, silt: 4 },
    note: 'A lower-water cereal and pulse concept that includes a soil-cover phase.'
  },
  {
    id: 'chilli-mungbean-sesame',
    name: 'Chilli → Mung bean → Sesame',
    crops: ['Chilli', 'Mung bean', 'Sesame'],
    water: 3,
    dry: 3,
    soil: 3,
    market: 4,
    cover: 2,
    legume: 1,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'A cash-crop sequence with a pulse break; irrigation and local buyers matter.'
  },
  {
    id: 'maize-cowpea-greenmanure',
    name: 'Maize → Cowpea → Green manure',
    crops: ['Maize', 'Cowpea', 'Green manure'],
    water: 3,
    dry: 3,
    soil: 5,
    market: 3,
    cover: 5,
    legume: 1,
    texture: { sandy: 3, clay: 4, silt: 4 },
    note: 'A cereal, pulse, and cover phase to explore for soil inputs and crop diversity.'
  },
  {
    id: 'groundnut-sorghum-sunnhemp',
    name: 'Groundnut → Sorghum → Sunn hemp',
    crops: ['Groundnut', 'Sorghum', 'Sunn hemp'],
    water: 2,
    dry: 4,
    soil: 5,
    market: 3,
    cover: 4,
    legume: 1,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Alternates crop families and includes a green-manure phase; verify crop suitability locally.'
  },
  {
    id: 'rice-mungbean-sesbania',
    name: 'Rice → Mung bean → Sesbania',
    crops: ['Rice', 'Mung bean', 'Sesbania'],
    water: 5,
    dry: 2,
    soil: 4,
    market: 4,
    cover: 4,
    legume: 1,
    texture: { sandy: 2, clay: 4, silt: 4 },
    note: 'Keeps a rice option in the sequence; water control and field type are key constraints.'
  },
  {
    id: 'onion-greengram-chilli',
    name: 'Onion → Green gram → Chilli',
    crops: ['Onion', 'Green gram', 'Chilli'],
    water: 4,
    dry: 2,
    soil: 3,
    market: 5,
    cover: 2,
    legume: 1,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'Market-oriented concept with a pulse break; compare actual prices and irrigation needs.'
  },
  {
    id: 'sesame-mungbean-onion',
    name: 'Sesame → Mung bean → Onion',
    crops: ['Sesame', 'Mung bean', 'Onion'],
    water: 3,
    dry: 4,
    soil: 3,
    market: 4,
    cover: 2,
    legume: 1,
    texture: { sandy: 4, clay: 3, silt: 4 },
    note: 'Pairs a pulse with cash crops; local timing, soil, and buyer access need checking.'
  }
];



// --- src/core/seasons.js ---
/**
 * Seasonal Calculations and Climate Utilities
 * Sri Lanka agricultural calendar:
 *   - Yala: March to August
 *   - Maha: September to February (spans year transition)
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_KEYS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function median(values) {
  const sorted = [...values].sort((x, y) => x - y);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function coordinateText(value, positive, negative) {
  return `${Math.abs(value).toFixed(2)}° ${value < 0 ? negative : positive}`;
}

function seasonMonths(season) {
  return season === 'yala'
    ? [
        { month: 3, offset: 0 },
        { month: 4, offset: 0 },
        { month: 5, offset: 0 },
        { month: 6, offset: 0 },
        { month: 7, offset: 0 },
        { month: 8, offset: 0 }
      ]
    : [
        { month: 9, offset: 0 },
        { month: 10, offset: 0 },
        { month: 11, offset: 0 },
        { month: 12, offset: 0 },
        { month: 1, offset: 1 },
        { month: 2, offset: 1 }
      ];
}

/**
 * Calculates seasonal statistics across historical records:
 * - Total seasonal precipitation in mm
 * - Mean temperature in °C
 * - Season median baseline
 * - App-defined 75% median dry-season threshold
 * - Count of historical seasons below the threshold
 */
function buildSeasonStats(season, records) {
  if (!records || !records.length) {
    return { rows: [], baseline: 0, dryLimit: 0, dryCount: 0, dryRatio: 0, meanRain: 0, meanTemp: 0 };
  }

  const calendar = seasonMonths(season);
  const years = [...new Set(records.map(r => r.year))];
  const rows = [];

  for (const startYear of years) {
    const picked = calendar.map(({ month, offset }) =>
      records.find(r => r.year === startYear + offset && r.month === month)
    );
    if (picked.some(r => !r)) continue;

    const totalRain = picked.reduce((sum, r) => sum + r.rainDaily * daysInMonth(r.year, r.month), 0);
    const totalDays = picked.reduce((sum, r) => sum + daysInMonth(r.year, r.month), 0);
    const meanTemp = picked.reduce((sum, r) => sum + r.temp * daysInMonth(r.year, r.month), 0) / (totalDays || 1);

    rows.push({ year: startYear, rainMm: totalRain, temp: meanTemp });
  }

  const baseline = median(rows.map(r => r.rainMm));
  const dryLimit = baseline * 0.75;
  const dryCount = rows.filter(r => r.rainMm < dryLimit).length;

  return {
    rows,
    baseline,
    dryLimit,
    dryCount,
    dryRatio: rows.length ? dryCount / rows.length : 0,
    meanRain: average(rows.map(r => r.rainMm)),
    meanTemp: average(rows.map(r => r.temp))
  };
}



// --- src/core/rankingEngine.js ---
/**
 * Transparent Heuristic Crop Rotation Ranking Engine
 * Computes a deterministic 1–100 heuristic match score.
 * Weights adjust based on:
 *   - Farmer's chosen priority ('water', 'soil', 'income')
 *   - Water access constraints ('rainfed', 'limited', 'reliable')
 *   - Observed NASA dry-season frequency (ratio of seasons < 75% median)
 *   - Entered soil texture ('sandy', 'clay', 'silt')
 */

const PRIORITY_LABELS = {
  water: 'Save water',
  soil: 'Build soil',
  income: 'Steady income'
};

function scoreRotation(item, stats, texture, selectedPriority, waterAccessVal) {
  const dryYears = stats.dryRatio || 0;
  const waterAccessWeight = waterAccessVal === 'rainfed' ? 1.0 : waterAccessVal === 'limited' ? 0.72 : 0.42;

  const dimensions = {
    waterEfficiency: 6 - item.water,
    droughtFit: item.dry,
    soilBuilding: item.soil,
    marketOptions: item.market,
    soilMatch: item.texture[texture] || 3,
    cover: item.cover,
    legume: 5
  };

  const weights = selectedPriority === 'water'
    ? {
        waterEfficiency: 0.27 * waterAccessWeight,
        droughtFit: 0.12 + 0.28 * dryYears,
        soilBuilding: 0.10,
        marketOptions: 0.08,
        soilMatch: 0.15,
        cover: 0.10,
        legume: 0.10
      }
    : selectedPriority === 'soil'
      ? {
          waterEfficiency: 0.10,
          droughtFit: 0.08 + 0.14 * dryYears,
          soilBuilding: 0.26,
          marketOptions: 0.08,
          soilMatch: 0.20,
          cover: 0.14,
          legume: 0.12
        }
      : {
          waterEfficiency: 0.14 * waterAccessWeight,
          droughtFit: 0.08 + 0.10 * dryYears,
          soilBuilding: 0.10,
          marketOptions: 0.27,
          soilMatch: 0.16,
          cover: 0.08,
          legume: 0.19
        };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedSum = Object.entries(weights).reduce((sum, [key, weight]) => sum + dimensions[key] * weight, 0);
  const normalized = weightedSum / totalWeight;

  return Math.round(normalized * 20);
}

function rankRotations(rotations, stats, texture, selectedPriority, waterAccessVal, limit = 3) {
  return rotations
    .map(item => ({
      ...item,
      score: scoreRotation(item, stats, texture, selectedPriority, waterAccessVal)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}



// --- src/api/sampleData.js ---
/**
 * Labeled Offline Sample Climate Data
 * Used as a transparent fallback when the NASA POWER API is unreachable.
 */

const SAMPLE = {
  temp: [25.7, 26.3, 27.8, 29.5, 30.5, 30.2, 29.7, 29.3, 29.1, 28.2, 26.8, 25.9],
  rain: [2.6, 1.4, 1.4, 1.8, 0.8, 0.6, 1.1, 1.3, 2.9, 7.4, 11.7, 6.7]
};

function makeDemoHistory(startYear, endYear) {
  const records = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const i = month - 1;
      const cycle = Math.sin((year - startYear) * 2.1 + i * 0.47);
      records.push({
        year,
        month,
        temp: SAMPLE.temp[i] + cycle * 0.8,
        rainDaily: Math.max(0.05, SAMPLE.rain[i] * (1 + cycle * 0.25))
      });
    }
  }
  return {
    records,
    normals: SAMPLE.temp.map((temp, i) => ({
      temp,
      rainDaily: SAMPLE.rain[i]
    }))
  };
}



// --- src/api/nasaPowerClient.js ---
/**
 * NASA POWER API Client
 * Requests monthly Agroclimatology (T2M, PRECTOTCORR) and Hydrology (GPM IMERG) point data.
 */

function buildHistory(data, startYear, endYear) {
  const params = data?.properties?.parameter;
  if (!params?.T2M || !params?.PRECTOTCORR) {
    throw new Error('NASA POWER did not return both requested climate fields.');
  }

  const records = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const temp = Number(params.T2M[key]);
      const rain = Number(params.PRECTOTCORR[key]);
      if (Number.isFinite(temp) && Number.isFinite(rain)) {
        records.push({ year, month, temp, rainDaily: rain });
      }
    }
  }

  if (records.length < 96) {
    throw new Error('NASA POWER returned too few valid months for the selected decade.');
  }

  const normals = MONTH_KEYS.map((_, i) => {
    const month = i + 1;
    const rows = records.filter(r => r.month === month);
    return {
      temp: average(rows.map(r => r.temp)),
      rainDaily: average(rows.map(r => r.rainDaily))
    };
  });

  return { records, normals };
}

function buildGpmHistory(data, startYear, endYear) {
  const parameter = data?.properties?.parameter?.IMERG_PRECTOT;
  if (!parameter) {
    throw new Error('NASA POWER did not return IMERG precipitation.');
  }

  const rows = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const rainDaily = Number(parameter[key]);
      // NASA uses -999.0 for missing/uncalibrated data points
      if (Number.isFinite(rainDaily) && rainDaily >= 0) {
        rows.push({ year, month, rainDaily });
      }
    }
  }

  if (rows.length < 96) {
    throw new Error('NASA IMERG returned too few valid months for the comparison period.');
  }

  return rows;
}

async function fetchNasaPowerClimate(latitude, longitude, startYear, endYear) {
  const query = new URLSearchParams({
    parameters: 'T2M,PRECTOTCORR',
    community: 'AG',
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: 'JSON'
  });
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?${query}`;

  const gpmQuery = new URLSearchParams({
    parameters: 'IMERG_PRECTOT',
    community: 'AG',
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: 'JSON'
  });
  const gpmUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?${gpmQuery}`;

  const [response, gpmResponse] = await Promise.all([
    fetch(url, { signal: AbortSignal.timeout(20000) }),
    fetch(gpmUrl, { signal: AbortSignal.timeout(20000) }).catch(() => null)
  ]);

  if (!response.ok) {
    throw new Error(`NASA POWER responded with ${response.status}`);
  }

  const raw = await response.json();
  const history = buildHistory(raw, startYear, endYear);

  let gpmHistory = [];
  if (gpmResponse?.ok) {
    try {
      gpmHistory = buildGpmHistory(await gpmResponse.json(), startYear, endYear);
    } catch {
      gpmHistory = [];
    }
  }

  return {
    records: history.records,
    normals: history.normals,
    gpmHistory
  };
}



// --- src/state/appState.js ---
/**
 * Central Reactive Application State Store
 */

const CURRENT_YEAR = new Date().getFullYear();
const END_YEAR = CURRENT_YEAR - 1;
const START_YEAR = END_YEAR - 9;

class AppState {
  constructor() {
    this.latitude = 9.66;
    this.longitude = 80.02;
    this.soilType = 'sandy';
    this.soilPh = 6.5;
    this.currentCrop = 'Rice';
    this.waterAccess = 'rainfed';
    this.selectedPriority = 'water';
    this.selectedSeason = 'yala';
    this.dataMode = 'sample'; // 'nasa' | 'sample'
    this.monthlyClimate = { temp: [...SAMPLE.temp], rain: [...SAMPLE.rain] };
    this.seasonHistory = [];
    this.gpmHistory = [];

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType) {
    for (const listener of this.listeners) {
      listener(this, changeType);
    }
  }

  set(updates, changeType = 'update') {
    Object.assign(this, updates);
    this.notify(changeType);
  }
}

const state = new AppState();



// --- src/ui/charts.js ---
/**
 * Climate and Historical Seasonal Chart Rendering
 */

function renderMonthlyChart(container, monthlyClimate) {
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

function renderSeasonHistoryChart(chartEl, titleEl, summaryEl, stats, seasonName) {
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



// --- src/ui/cardRenderer.js ---
/**
 * Rotation Card & Baseline UI Components
 */

function escapeHtml(value) {
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

function renderRotationCards(container, rankedItems, stats, seasonName, waterAccessVal) {
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

function renderBaseline(container, currentCrop, waterAccessLabel) {
  container.innerHTML = `
    <div class="baseline-header">
      <span class="baseline-badge"><svg class="inline-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> YOUR STARTING BASELINE</span>
      <span class="baseline-crop">${escapeHtml(currentCrop)}</span>
    </div>
    <div class="baseline-sub">Water Access: <strong>${escapeHtml(waterAccessLabel)}</strong> · Compare the suggestions below against your baseline.</div>
  `;
}

function renderGpmCrossCheck(container, dataMode, gpmHistory, powerStats, seasonName, selectedSeason) {
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


// --- src/ui/fieldCardExporter.js ---
/**
 * Field Decision Card Generator
 * Produces a portable, standalone HTML/PDF document for extension worker conversations.
 */

function generateFieldCardHtml({
  latitude,
  longitude,
  soilLabel,
  soilPh,
  currentCrop,
  waterAccessLabel,
  seasonName,
  priority,
  dataLabel,
  stats,
  rankedItems
}) {
  const location = `${Number(latitude).toFixed(2)}, ${Number(longitude).toFixed(2)}`;
  const cards = rankedItems
    .map(
      (item, index) =>
        `<article><h2>${index + 1}. ${escapeHtml(item.name)} <small>Rule score ${item.score}/100</small></h2><p>${escapeHtml(item.note)}</p></article>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FieldShift field decision card</title>
  <style>
    body { font: 16px/1.55 Arial, sans-serif; max-width: 850px; margin: 40px auto; padding: 0 24px; color: #203d2d; }
    h1 { font-size: 32px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin-top: 24px; }
    small, .muted { color: #607064; }
    article { border-top: 1px solid #d9ded1; padding: 8px 0; }
    button { padding: 10px 15px; background: #285c3d; color: white; border: 0; border-radius: 5px; cursor: pointer; }
    @media print { button { display: none; } body { margin: 0 auto; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / Save as PDF</button>
  <h1>FieldShift · field decision card</h1>
  <p class="muted">A discussion aid for a farmer and local agricultural advisor. Not a yield forecast.</p>
  
  <h2>Field context</h2>
  <p>
    Location: ${escapeHtml(location)} · Soil: ${escapeHtml(soilLabel)} · Approx. pH: ${Number(soilPh).toFixed(1)}<br>
    Current crop: ${escapeHtml(currentCrop)} · Water: ${escapeHtml(waterAccessLabel)}<br>
    Season: ${seasonName} · Priority: ${PRIORITY_LABELS[priority]}
  </p>
  
  <h2>NASA climate context</h2>
  <p>
    ${dataLabel}. Average ${seasonName} rainfall: ${Math.round(stats.meanRain)} mm; ${stats.dryCount} of ${stats.rows.length} complete seasons were below 75% of the season median (${Math.round(stats.baseline)} mm).
  </p>
  
  <h2>Rotation ideas to discuss</h2>
  ${cards}
  
  <p class="muted">Scores are transparent prototype heuristics built from illustrative crop traits and entered farm context. Crop suitability, local season timing, water access, soil conditions, and markets need confirmation with local farmers or agricultural officers.</p>
  <p class="muted">NASA POWER monthly API: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/ · NASA Knights · FieldShift</p>
</body>
</html>`;
}

function downloadFieldCardFile(context) {
  const html = generateFieldCardHtml(context);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fieldshift-field-decision-card.html';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}



// --- src/ui/tour.js ---
/**
 * Interactive Onboarding Tour & Guidance
 * Provides step-by-step novice guidance and UI spotlights with clean SVG icons.
 */

const TOUR_STEPS = [
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l10-10m-3-1a4 4 0 0 1 5.66-5.66M17 11a4 4 0 0 1 5.66-5.66M11 17a4 4 0 0 1 5.66-5.66M7 21a4 4 0 0 1 5.66-5.66"/></svg>`,
    badge: 'STEP 1 OF 5 · WELCOME',
    title: 'Welcome to FieldShift!',
    text: 'Think of this as your climate-smart farming companion. FieldShift helps farmers and advisors test crop rotation ideas using 10 years of NASA Earth observations, soil notes, and local priorities.',
    tip: '<b>Goal:</b> Find resilient 3-crop sequences tailored to water constraints and historical rainfall.',
    target: '#overview'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    badge: 'STEP 2 OF 5 · FIELD NOTES',
    title: 'Set Your Field Conditions',
    text: 'Check your coordinates (defaults to Jaffna Peninsula, Sri Lanka). You can enter field soil notes like soil texture (Sandy, Clay, or Silt loam), approximate pH, and current crop baseline.',
    tip: '<b>Tip:</b> Changing soil texture adjusts crop affinities—groundnut loves sandy soil, while rice prefers clay.',
    target: '.summary-grid'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    badge: 'STEP 3 OF 5 · YOUR STRATEGY',
    title: 'Pick What Matters Most',
    text: 'Choose your top farm priority: <b>Save water</b>, <b>Build soil</b>, or <b>Steady income</b>. Watch the 3 rotation pathways instantly re-rank with transparent 1–100 heuristic match scores.',
    tip: '<b>Interactive:</b> Click "Build soil" to see green manure crops like Sunn hemp and Cowpea jump to the top.',
    target: '#planner'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l6-6m-4 8l6-6m2 2l4-4 4 4-4 4m-4-4l-6 6m12-2l2 2m-8 4l2 2m-12 2a4 4 0 0 0 5.66 0l1.41-1.41L7.41 14.93l-1.41 1.41a4 4 0 0 0 0 5.66z"/></svg>`,
    badge: 'STEP 4 OF 5 · NASA CLIMATE',
    title: 'Inspect NASA Climate History',
    text: 'Scroll down to inspect real NASA POWER climate data. The year-by-year bar chart highlights seasons receiving less than 75% of the median rainfall (drier seasons).',
    tip: '<b>Seasonal insight:</b> Sri Lanka has two seasons: <em>Yala</em> (dry season, Mar–Aug) and <em>Maha</em> (wet monsoon, Sep–Feb).',
    target: '#climate'
  },
  {
    icon: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6m-6 4h4"/></svg>`,
    badge: 'STEP 5 OF 5 · ACTIONABLE OUTPUT',
    title: 'Export a Field Decision Card',
    text: 'Once you find a rotation idea to discuss, click <b>"Download a field decision card"</b>. It generates a clean, printable 1-page PDF/HTML guide to take into conversations with extension officers.',
    tip: '<b>Trust:</b> FieldShift is an explainable decision aid, not a black-box yield forecast.',
    target: '#recommendations'
  }
];

class GuidedTour {
  constructor() {
    this.currentStep = 0;
    this.backdrop = document.getElementById('tourBackdrop');
    this.badge = document.getElementById('tourStepBadge');
    this.icon = document.getElementById('tourIcon');
    this.title = document.getElementById('tourTitle');
    this.text = document.getElementById('tourText');
    this.tip = document.getElementById('tourTip');
    this.dotsContainer = document.getElementById('tourDots');
    this.nextBtn = document.getElementById('tourNextBtn');
    this.skipBtn = document.getElementById('tourSkipBtn');
    this.closeBtn = document.getElementById('tourCloseBtn');
    this.openBtn = document.getElementById('openTourBtn');

    this.init();
  }

  init() {
    if (!this.backdrop) return;

    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
    if (this.skipBtn) this.skipBtn.addEventListener('click', () => this.close());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.openBtn) this.openBtn.addEventListener('click', () => this.start());

    // Close on backdrop click outside dialog
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop.style.display !== 'none') {
        this.close();
      }
    });

    // Auto-show for first-time visitors
    try {
      const seen = localStorage.getItem('fieldshift_tour_seen');
      if (!seen) {
        setTimeout(() => this.start(), 800);
      }
    } catch {
      // Local storage disabled or file:/// origin restriction fallback
    }
  }

  start() {
    this.currentStep = 0;
    this.render();
    this.backdrop.style.display = 'flex';
  }

  close() {
    this.backdrop.style.display = 'none';
    try {
      localStorage.setItem('fieldshift_tour_seen', 'true');
    } catch {}
  }

  next() {
    if (this.currentStep < TOUR_STEPS.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.close();
    }
  }

  render() {
    const step = TOUR_STEPS[this.currentStep];
    if (!step) return;

    this.badge.textContent = step.badge;
    this.icon.innerHTML = step.icon;
    this.title.textContent = step.title;
    this.text.innerHTML = step.text;
    this.tip.innerHTML = step.tip;

    // Update dots
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = TOUR_STEPS.map((_, i) =>
        `<span class="tour-dot ${i === this.currentStep ? 'active' : ''}"></span>`
      ).join('');
    }
  }
}



// --- Application Bootstrap & Event Controller ---
const $ = (selector) => document.querySelector(selector);

const elements = {
  locationName: $('#locationName'),
  coordinateLabel: $('#coordinateLabel'),
  dataStatus: $('#dataStatus'),
  tempValue: $('#tempValue'),
  rainValue: $('#rainValue'),
  climateCaption: $('#climateCaption'),
  soilSummary: $('#soilSummary'),
  phSummary: $('#phSummary'),
  soilType: $('#soilType'),
  soilPh: $('#soilPh'),
  phValue: $('#phValue'),
  currentCrop: $('#currentCrop'),
  waterAccess: $('#waterAccess'),
  latitude: $('#latitude'),
  longitude: $('#longitude'),
  updateLocation: $('#updateLocation'),
  planButton: $('#planButton'),
  resultIntro: $('#resultIntro'),
  currentBaseline: $('#currentBaseline'),
  rotationList: $('#rotationList'),
  downloadFieldCard: $('#downloadFieldCard'),
  seasonRain: $('#seasonRain'),
  dryCount: $('#dryCount'),
  seasonTemp: $('#seasonTemp'),
  dryDefinition: $('#dryDefinition'),
  historyTitle: $('#historyTitle'),
  historySummary: $('#historySummary'),
  seasonHistoryChart: $('#seasonHistoryChart'),
  gpmCheck: $('#gpmCheck'),
  chartLocation: $('#chartLocation'),
  climateChart: $('#climateChart'),
  refreshData: $('#refreshData'),
  stepPill: document.querySelector('.step-pill')
};

function renderPlans() {
  const stats = buildSeasonStats(state.selectedSeason, state.seasonHistory);
  const ranked = rankRotations(
    ROTATIONS,
    stats,
    state.soilType,
    state.selectedPriority,
    state.waterAccess,
    3
  );

  const seasonName = state.selectedSeason === 'yala' ? 'Yala' : 'Maha';

  const introTexts = {
    water: `Ranked for ${PRIORITY_LABELS.water.toLowerCase()} in ${seasonName}, using this location’s observed NASA rainfall history and your water-access choice.`,
    soil: `Ranked for ${PRIORITY_LABELS.soil.toLowerCase()} in ${seasonName}, using your soil texture and NASA rainfall history.`,
    income: `Ranked for ${PRIORITY_LABELS.income.toLowerCase()} in ${seasonName}; market fit is a planning proxy, so check local prices.`
  };
  if (elements.resultIntro) elements.resultIntro.textContent = introTexts[state.selectedPriority];

  if (elements.currentBaseline && elements.waterAccess) {
    const waterAccessLabel = elements.waterAccess.options[elements.waterAccess.selectedIndex].text;
    renderBaseline(elements.currentBaseline, state.currentCrop, waterAccessLabel);
  }
  if (elements.rotationList) {
    renderRotationCards(elements.rotationList, ranked, stats, seasonName, state.waterAccess);
  }

  if (elements.dryDefinition) elements.dryDefinition.textContent = `of ${stats.rows.length} · <75% median`;
  if (elements.seasonRain) elements.seasonRain.textContent = stats.rows.length ? `${Math.round(stats.meanRain)} mm` : '—';
  if (elements.dryCount) {
    elements.dryCount.textContent = stats.rows.length ? `${stats.dryCount}/${stats.rows.length}` : '—';
    elements.dryCount.title = `Drier means seasonal total rainfall below 75% of the ${seasonName} 10-year median (${Math.round(stats.baseline)} mm).`;
  }
  if (elements.seasonTemp) elements.seasonTemp.textContent = stats.rows.length ? `${stats.meanTemp.toFixed(1)}°` : '—';

  if (elements.seasonHistoryChart && elements.historyTitle && elements.historySummary) {
    renderSeasonHistoryChart(elements.seasonHistoryChart, elements.historyTitle, elements.historySummary, stats, seasonName);
  }
  if (elements.gpmCheck) {
    renderGpmCrossCheck(elements.gpmCheck, state.dataMode, state.gpmHistory, stats, seasonName, state.selectedSeason);
  }
}

function renderClimate() {
  const { temp, rain } = state.monthlyClimate;
  if (elements.climateChart) renderMonthlyChart(elements.climateChart, state.monthlyClimate);

  if (elements.tempValue) elements.tempValue.textContent = average(temp).toFixed(1);
  if (elements.rainValue) elements.rainValue.textContent = average(rain).toFixed(1);

  const latText = coordinateText(state.latitude, 'N', 'S');
  const lonText = coordinateText(state.longitude, 'E', 'W');
  if (elements.chartLocation) elements.chartLocation.textContent = `${latText}, ${lonText} · ${START_YEAR}–${END_YEAR}`;
  if (elements.coordinateLabel) elements.coordinateLabel.innerHTML = `${latText} <span>·</span> ${lonText}`;

  const isJaffna = Math.abs(state.latitude - 9.66) < 0.02 && Math.abs(state.longitude - 80.02) < 0.02;
  if (elements.locationName) elements.locationName.textContent = isJaffna ? 'Jaffna peninsula' : 'Selected farm point';

  if (elements.climateCaption) {
    elements.climateCaption.textContent = state.dataMode === 'nasa'
      ? `NASA POWER monthly mean · ${START_YEAR}–${END_YEAR}`
      : `Illustrative sample · ${START_YEAR}–${END_YEAR} (not NASA observations)`;
  }

  if (elements.dataStatus) {
    elements.dataStatus.textContent = state.dataMode === 'nasa' ? 'NASA POWER' : 'SAMPLE DATA';
    elements.dataStatus.classList.toggle('connected', state.dataMode === 'nasa');
  }

  renderPlans();
}

async function loadClimate() {
  if (!elements.latitude || !elements.longitude) return;
  const lat = Number(elements.latitude.value);
  const lon = Number(elements.longitude.value);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    if (elements.climateCaption) elements.climateCaption.textContent = 'Enter valid latitude (−90 to 90) and longitude (−180 to 180).';
    return;
  }

  state.set({ latitude: lat, longitude: lon });
  if (elements.dataStatus) {
    elements.dataStatus.textContent = 'LOADING';
    elements.dataStatus.classList.remove('connected');
  }
  if (elements.climateCaption) elements.climateCaption.textContent = 'Fetching NASA POWER monthly history…';

  try {
    const { records, normals, gpmHistory } = await fetchNasaPowerClimate(lat, lon, START_YEAR, END_YEAR);
    state.set({
      seasonHistory: records,
      gpmHistory,
      monthlyClimate: {
        temp: normals.map(v => v.temp),
        rain: normals.map(v => v.rainDaily)
      },
      dataMode: 'nasa'
    });
  } catch (error) {
    console.warn('NASA POWER data unavailable; using labeled sample values.', error);
    const sample = makeDemoHistory(START_YEAR, END_YEAR);
    state.set({
      seasonHistory: sample.records,
      gpmHistory: [],
      monthlyClimate: {
        temp: sample.normals.map(v => v.temp),
        rain: sample.normals.map(v => v.rainDaily)
      },
      dataMode: 'sample'
    });
  }

  renderClimate();
}

function handleDownloadFieldCard() {
  const stats = buildSeasonStats(state.selectedSeason, state.seasonHistory);
  const seasonName = state.selectedSeason === 'yala' ? 'Yala' : 'Maha';
  const ranked = rankRotations(
    ROTATIONS,
    stats,
    state.soilType,
    state.selectedPriority,
    state.waterAccess,
    3
  );

  const soilLabel = elements.soilType ? elements.soilType.options[elements.soilType.selectedIndex].text : 'Sandy loam';
  const waterAccessLabel = elements.waterAccess ? elements.waterAccess.options[elements.waterAccess.selectedIndex].text : 'Mostly rainfed';
  const dataLabel = state.dataMode === 'nasa'
    ? `NASA POWER ${START_YEAR}–${END_YEAR}`
    : 'Illustrative sample data; NASA unavailable';

  downloadFieldCardFile({
    latitude: state.latitude,
    longitude: state.longitude,
    soilLabel,
    soilPh: state.soilPh,
    currentCrop: state.currentCrop,
    waterAccessLabel,
    seasonName,
    priority: state.selectedPriority,
    dataLabel,
    stats,
    rankedItems: ranked
  });
}

function setupEventListeners() {
  document.querySelectorAll('.priority-option').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.priority-option').forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
      state.set({ selectedPriority: button.dataset.priority });
      renderPlans();
    });
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (elements.latitude) elements.latitude.value = btn.dataset.lat;
      if (elements.longitude) elements.longitude.value = btn.dataset.lon;
      loadClimate();
    });
  });

  document.querySelectorAll('.season-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
      state.set({ selectedSeason: button.dataset.season });
      if (elements.stepPill) elements.stepPill.innerHTML = '02 <span>OF</span> 02';
      renderPlans();
    });
  });

  if (elements.soilType) {
    elements.soilType.addEventListener('change', () => {
      state.set({ soilType: elements.soilType.value });
      if (elements.soilSummary) elements.soilSummary.textContent = elements.soilType.options[elements.soilType.selectedIndex].text;
      renderPlans();
    });
  }

  if (elements.soilPh) {
    elements.soilPh.addEventListener('input', () => {
      const value = Number(elements.soilPh.value).toFixed(1);
      state.set({ soilPh: Number(elements.soilPh.value) });
      if (elements.phValue) elements.phValue.textContent = value;
      if (elements.phSummary) elements.phSummary.textContent = `pH ${value} · farmer-entered estimate`;
    });
  }

  if (elements.currentCrop) {
    elements.currentCrop.addEventListener('change', () => {
      state.set({ currentCrop: elements.currentCrop.value });
      renderPlans();
    });
  }

  if (elements.waterAccess) {
    elements.waterAccess.addEventListener('change', () => {
      state.set({ waterAccess: elements.waterAccess.value });
      renderPlans();
    });
  }

  if (elements.updateLocation) elements.updateLocation.addEventListener('click', loadClimate);
  if (elements.refreshData) elements.refreshData.addEventListener('click', loadClimate);

  if (elements.planButton) {
    elements.planButton.addEventListener('click', () => {
      const rec = $('#recommendations');
      if (rec) rec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (elements.stepPill) elements.stepPill.innerHTML = '02 <span>OF</span> 02';
    });
  }

  if (elements.downloadFieldCard) elements.downloadFieldCard.addEventListener('click', handleDownloadFieldCard);
}

function init() {
  setupEventListeners();
  if (elements.dryDefinition) elements.dryDefinition.textContent = `of 10 · <75% median`;
  if (elements.climateCaption) elements.climateCaption.textContent = `Preparing ${START_YEAR}–${END_YEAR} NASA POWER history…`;
  renderClimate();
  loadClimate();
  if (typeof GuidedTour !== 'undefined') {
    new GuidedTour();
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

})();
