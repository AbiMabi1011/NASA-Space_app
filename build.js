/**
 * Zero-Dependency Standalone Bundler for FieldShift
 * Combines modular files from src/ into a standalone app.js
 * that works across BOTH:
 *   1. file:/// protocol (direct double-click in Explorer/Finder without CORS errors)
 *   2. http:// / https:// protocols (local server and GitHub Pages/Netlify/Vercel)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function stripImportsExports(code) {
  return code
    // Remove import statements (single-line and multi-line)
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, '')
    // Remove named export lists e.g. export { a, b };
    .replace(/^export\s*\{[\s\S]*?\};?\s*/gm, '')
    // Strip export / export default from declarations (including async function)
    .replace(/^export\s+(default\s+)?/gm, '');
}

const files = [
  'src/core/cropCatalog.js',
  'src/core/seasons.js',
  'src/core/rankingEngine.js',
  'src/api/sampleData.js',
  'src/api/nasaPowerClient.js',
  'src/state/appState.js',
  'src/ui/charts.js',
  'src/ui/cardRenderer.js',
  'src/ui/fieldCardExporter.js',
  'src/ui/tour.js'
];

let bundleBody = '';
for (const file of files) {
  const fullPath = path.join(__dirname, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  bundleBody += `\n// --- ${file} ---\n` + stripImportsExports(content) + '\n';
}

const mainController = `
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
    water: \`Ranked for \${PRIORITY_LABELS.water.toLowerCase()} in \${seasonName}, using this location’s observed NASA rainfall history and your water-access choice.\`,
    soil: \`Ranked for \${PRIORITY_LABELS.soil.toLowerCase()} in \${seasonName}, using your soil texture and NASA rainfall history.\`,
    income: \`Ranked for \${PRIORITY_LABELS.income.toLowerCase()} in \${seasonName}; market fit is a planning proxy, so check local prices.\`
  };
  if (elements.resultIntro) elements.resultIntro.textContent = introTexts[state.selectedPriority];

  if (elements.currentBaseline && elements.waterAccess) {
    const waterAccessLabel = elements.waterAccess.options[elements.waterAccess.selectedIndex].text;
    renderBaseline(elements.currentBaseline, state.currentCrop, waterAccessLabel);
  }
  if (elements.rotationList) {
    renderRotationCards(elements.rotationList, ranked, stats, seasonName, state.waterAccess);
  }

  if (elements.dryDefinition) elements.dryDefinition.textContent = \`of \${stats.rows.length} · <75% median\`;
  if (elements.seasonRain) elements.seasonRain.textContent = stats.rows.length ? \`\${Math.round(stats.meanRain)} mm\` : '—';
  if (elements.dryCount) {
    elements.dryCount.textContent = stats.rows.length ? \`\${stats.dryCount}/\${stats.rows.length}\` : '—';
    elements.dryCount.title = \`Drier means seasonal total rainfall below 75% of the \${seasonName} 10-year median (\${Math.round(stats.baseline)} mm).\`;
  }
  if (elements.seasonTemp) elements.seasonTemp.textContent = stats.rows.length ? \`\${stats.meanTemp.toFixed(1)}°\` : '—';

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
  if (elements.chartLocation) elements.chartLocation.textContent = \`\${latText}, \${lonText} · \${START_YEAR}–\${END_YEAR}\`;
  if (elements.coordinateLabel) elements.coordinateLabel.innerHTML = \`\${latText} <span>·</span> \${lonText}\`;

  const isJaffna = Math.abs(state.latitude - 9.66) < 0.02 && Math.abs(state.longitude - 80.02) < 0.02;
  if (elements.locationName) elements.locationName.textContent = isJaffna ? 'Jaffna peninsula' : 'Selected farm point';

  if (elements.climateCaption) {
    elements.climateCaption.textContent = state.dataMode === 'nasa'
      ? \`NASA POWER monthly mean · \${START_YEAR}–\${END_YEAR}\`
      : \`Illustrative sample · \${START_YEAR}–\${END_YEAR} (not NASA observations)\`;
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
    ? \`NASA POWER \${START_YEAR}–\${END_YEAR}\`
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
      if (elements.phSummary) elements.phSummary.textContent = \`pH \${value} · farmer-entered estimate\`;
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
  if (elements.dryDefinition) elements.dryDefinition.textContent = \`of 10 · <75% median\`;
  if (elements.climateCaption) elements.climateCaption.textContent = \`Preparing \${START_YEAR}–\${END_YEAR} NASA POWER history…\`;
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
`;

const finalBundle = `/**
 * FieldShift — Farm rotation planner
 * Self-contained bundle compiled from modular architecture in src/
 * Compatible with both file:/// (double-click) and http:// / https:// protocols.
 */
(() => {
${bundleBody}
${mainController}
})();
`;

fs.writeFileSync(path.join(__dirname, 'app.js'), finalBundle, 'utf-8');
console.log('✓ Successfully compiled src/ modules into standalone app.js (works with file:/// and http://)');

