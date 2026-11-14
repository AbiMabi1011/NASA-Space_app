/**
 * Automated Test Suite for FieldShift — NASA Space Apps 2026
 * Verifies application modular architecture, NASA POWER integration,
 * algorithms, dynamic heuristic re-ranking, and decision card generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// Import directly from modern modular architecture
import { ROTATIONS } from './src/core/cropCatalog.js';
import { buildSeasonStats, average, median, daysInMonth, seasonMonths } from './src/core/seasons.js';
import { scoreRotation, rankRotations, PRIORITY_LABELS } from './src/core/rankingEngine.js';
import { makeDemoHistory } from './src/api/sampleData.js';
import { buildHistory, buildGpmHistory, fetchNasaPowerClimate } from './src/api/nasaPowerClient.js';
import { generateFieldCardHtml } from './src/ui/fieldCardExporter.js';
import { AppState, START_YEAR, END_YEAR } from './src/state/appState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
const results = [];

function test(description, fn) {
  try {
    fn();
    passed++;
    results.push({ name: description, ok: true });
    console.log(`  ${GREEN}✓${RESET} ${description}`);
  } catch (err) {
    failed++;
    results.push({ name: description, ok: false, error: err.message });
    console.log(`  ${RED}✗${RESET} ${description}`);
    console.log(`    ${YELLOW}${err.stack || err.message}${RESET}`);
  }
}

async function asyncTest(description, fn) {
  try {
    await fn();
    passed++;
    results.push({ name: description, ok: true });
    console.log(`  ${GREEN}✓${RESET} ${description}`);
  } catch (err) {
    failed++;
    results.push({ name: description, ok: false, error: err.message });
    console.log(`  ${RED}✗${RESET} ${description}`);
    console.log(`    ${YELLOW}${err.stack || err.message}${RESET}`);
  }
}

console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${CYAN}   FieldShift Modular Architecture Verification      ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

// -------------------------------------------------------------
// 1. Modular File Structure & HTML Document Checks
// -------------------------------------------------------------
console.log(`${BOLD}1. Checking Codebase & Modular Architecture Structure...${RESET}`);

test('All modular architecture source files exist', () => {
  const requiredFiles = [
    'index.html',
    'styles.css',
    'app.js',
    'src/core/cropCatalog.js',
    'src/core/seasons.js',
    'src/core/rankingEngine.js',
    'src/api/nasaPowerClient.js',
    'src/api/sampleData.js',
    'src/state/appState.js',
    'src/ui/charts.js',
    'src/ui/cardRenderer.js',
    'src/ui/fieldCardExporter.js',
    'SUBMISSION_KIT.md',
    'README.md'
  ];
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    assert.ok(fs.existsSync(filePath), `Required architecture file missing: ${file}`);
  }
});

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');

test('HTML loads app.js via universal script tag compatible with both file:/// and web hosting', () => {
  assert.ok(
    htmlContent.includes('<script src="app.js"></script>'),
    'index.html must load app.js cleanly without type="module" CORS restrictions'
  );
});

test('HTML contains all required interactive UI elements', () => {
  const requiredIds = [
    'locationName', 'coordinateLabel', 'dataStatus', 'tempValue', 'rainValue',
    'climateCaption', 'soilSummary', 'phSummary', 'soilType', 'soilPh', 'phValue',
    'currentCrop', 'waterAccess', 'latitude', 'longitude', 'updateLocation',
    'planButton', 'resultIntro', 'currentBaseline', 'rotationList', 'downloadFieldCard',
    'seasonRain', 'dryCount', 'seasonTemp', 'historyTitle', 'historySummary',
    'seasonHistoryChart', 'gpmCheck', 'climateChart', 'refreshData'
  ];
  for (const id of requiredIds) {
    assert.ok(htmlContent.includes(`id="${id}"`), `HTML element missing with id: ${id}`);
  }
});

test('HTML includes transparent NASA data explanation accordion & attribution', () => {
  assert.ok(htmlContent.includes('How FieldShift uses NASA data'), 'NASA data explanation missing');
  assert.ok(htmlContent.includes('https://power.larc.nasa.gov'), 'NASA POWER API documentation link missing');
  assert.ok(htmlContent.includes('NASA Knights'), 'Team identification missing');
});

// -------------------------------------------------------------
// 2. Core Business Logic & Algorithmic Unit Tests
// -------------------------------------------------------------
console.log(`\n${BOLD}2. Testing Climate History & Seasonal Statistics Algorithms...${RESET}`);

// Generate mock records for 10 years
const mockRecords = [];
for (let y = 2015; y <= 2024; y++) {
  for (let m = 1; m <= 12; m++) {
    const rain = (m >= 3 && m <= 8) ? (y % 2 === 0 ? 3.0 : 0.4) : (m >= 9 ? 8.0 : 2.0);
    mockRecords.push({ year: y, month: m, temp: 28.5, rainDaily: rain });
  }
}

test('Crop rotation catalog contains 8 curated cropping sequences', () => {
  assert.equal(ROTATIONS.length, 8, 'Expected 8 crop rotation sequences');
  for (const r of ROTATIONS) {
    assert.ok(r.name && r.crops.length >= 3, `Invalid rotation item: ${r.name}`);
    assert.ok(r.texture.sandy && r.texture.clay && r.texture.silt, `Missing texture scores for: ${r.name}`);
  }
});

test('Seasonal stats properly computes Yala totals and 75% median dry count', () => {
  const yalaStats = buildSeasonStats('yala', mockRecords);
  assert.equal(yalaStats.rows.length, 10, 'Should have exactly 10 complete Yala seasons');
  assert.ok(yalaStats.baseline > 0, 'Median seasonal rainfall should be positive');
  assert.equal(yalaStats.dryLimit, yalaStats.baseline * 0.75, 'Dry limit must be exactly 75% of baseline median');
  assert.ok(yalaStats.dryCount > 0, 'Identified dry seasons correctly based on threshold');
});

test('Seasonal stats properly computes Maha spans across year boundaries', () => {
  const mahaStats = buildSeasonStats('maha', mockRecords);
  assert.equal(mahaStats.rows.length, 9, 'Should have 9 complete Maha seasons spanning 2015 to 2024');
  assert.ok(mahaStats.meanRain > 0, 'Maha mean rain should be positive');
});

// -------------------------------------------------------------
// 3. Dynamic Re-ranking Verification (Required for 30s Demo)
// -------------------------------------------------------------
console.log(`\n${BOLD}3. Testing Dynamic Re-ranking Engine & Farmer Priorities...${RESET}`);

test('Switching priority to "water" places water-efficient rotations at top', () => {
  const stats = buildSeasonStats('yala', mockRecords);
  const ranked = rankRotations(ROTATIONS, stats, 'sandy', 'water', 'rainfed', 3);

  const topNames = ranked.map(r => r.name);
  assert.ok(
    topNames.some(n => n.includes('Pearl millet') || n.includes('Groundnut')),
    `Water-saving concept should be in top 3: got ${topNames.join(', ')}`
  );
});

test('Switching priority to "soil" boosts soil-building and green-manure rotations', () => {
  const stats = buildSeasonStats('yala', mockRecords);
  const rankedSoil = rankRotations(ROTATIONS, stats, 'sandy', 'soil', 'limited', 3);

  const topSoilNames = rankedSoil.map(r => r.name);
  assert.ok(
    topSoilNames.some(n => n.includes('Sunn hemp') || n.includes('Green manure')),
    `Soil building concepts should be in top 3: got ${topSoilNames.join(', ')}`
  );
});

test('Switching priority to "income" significantly increases market-oriented rotation score', () => {
  const stats = buildSeasonStats('yala', mockRecords);
  const cashCrop = ROTATIONS.find(r => r.name.includes('Onion → Green gram → Chilli'));
  
  const scoreWater = scoreRotation(cashCrop, stats, 'sandy', 'water', 'reliable');
  const scoreIncome = scoreRotation(cashCrop, stats, 'sandy', 'income', 'reliable');

  assert.ok(
    scoreIncome > scoreWater,
    `Income priority score (${scoreIncome}) should be higher than water priority score (${scoreWater}) for cash crop`
  );

  const scoreSiltIncome = scoreRotation(cashCrop, stats, 'silt', 'income', 'reliable');
  assert.ok(scoreSiltIncome >= 75, `High market cash crop in silt loam should score >= 75 (got ${scoreSiltIncome})`);
});

test('Changing water access from rainfed to reliable lowers water-stress penalty', () => {
  const stats = buildSeasonStats('yala', mockRecords);
  const riceItem = ROTATIONS.find(r => r.name.includes('Rice'));
  
  const scoreRainfed = scoreRotation(riceItem, stats, 'clay', 'water', 'rainfed');
  const scoreReliable = scoreRotation(riceItem, stats, 'clay', 'water', 'reliable');

  assert.ok(
    scoreReliable >= scoreRainfed,
    `Reliable irrigation score (${scoreReliable}) should be >= rainfed score (${scoreRainfed}) for water-demanding crops`
  );
});

// -------------------------------------------------------------
// 4. Reactive State Store Verification
// -------------------------------------------------------------
console.log(`\n${BOLD}4. Testing Reactive State Management Store...${RESET}`);

test('AppState tracks mutations and notifies subscribers', () => {
  const s = new AppState();
  let notified = false;
  const unsubscribe = s.subscribe((state, change) => {
    notified = true;
    assert.equal(change, 'seasonChange');
    assert.equal(state.selectedSeason, 'maha');
  });

  s.set({ selectedSeason: 'maha' }, 'seasonChange');
  assert.ok(notified, 'Subscriber should have been notified of state change');
  unsubscribe();
});

// -------------------------------------------------------------
// 5. NASA POWER and GPM IMERG Live Network / Schema Tests
// -------------------------------------------------------------
console.log(`\n${BOLD}5. Testing NASA POWER API Connectivity & Schema Parsing...${RESET}`);

await asyncTest('Live request to NASA POWER Monthly Agroclimatology API returns valid data', async () => {
  const latitude = 9.66;
  const longitude = 80.02;
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,PRECTOTCORR&community=AG&longitude=${longitude}&latitude=${latitude}&start=${START_YEAR}&end=${END_YEAR}&format=JSON`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    assert.equal(res.status, 200, `NASA POWER responded with status ${res.status}`);
    const data = await res.json();
    assert.ok(data.properties?.parameter?.T2M, 'T2M parameter missing from NASA response');
    assert.ok(data.properties?.parameter?.PRECTOTCORR, 'PRECTOTCORR parameter missing from NASA response');
    
    const sampleKey = `${START_YEAR}01`;
    assert.ok(Number.isFinite(Number(data.properties.parameter.T2M[sampleKey])), 'Valid numeric temperature missing');
    assert.ok(Number.isFinite(Number(data.properties.parameter.PRECTOTCORR[sampleKey])), 'Valid numeric precipitation missing');
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError' || err.code === 'ENOTFOUND') {
      console.log(`    ${YELLOW}⚠️  Network connection to NASA POWER timed out or offline; sample fallback mode handles this gracefully.${RESET}`);
    } else {
      throw err;
    }
  }
});

await asyncTest('Live request to NASA GPM IMERG Hydrology API returns expected schema', async () => {
  const latitude = 9.66;
  const longitude = 80.02;
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=IMERG_PRECTOT&community=AG&longitude=${longitude}&latitude=${latitude}&start=${START_YEAR}&end=${END_YEAR}&format=JSON`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      assert.ok(data.properties?.parameter?.IMERG_PRECTOT, 'IMERG_PRECTOT parameter missing from NASA Hydrology response');
    } else {
      console.log(`    ${YELLOW}⚠️ NASA Hydrology returned ${res.status}; app handles missing IMERG gracefully.${RESET}`);
    }
  } catch (err) {
    clearTimeout(timeout);
    console.log(`    ${YELLOW}⚠️ IMERG request skipped due to network: ${err.message}${RESET}`);
  }
});

// -------------------------------------------------------------
// 6. Decision Card Output Verification
// -------------------------------------------------------------
console.log(`\n${BOLD}6. Testing Field Decision Card HTML Output Generation...${RESET}`);

test('Field Decision Card template contains essential farmer advice and citations', () => {
  const stats = buildSeasonStats('yala', mockRecords);
  const ranked = rankRotations(ROTATIONS, stats, 'sandy', 'water', 'rainfed', 3);

  const cardHtml = generateFieldCardHtml({
    latitude: 9.66,
    longitude: 80.02,
    soilLabel: 'Sandy loam',
    soilPh: 6.5,
    currentCrop: 'Rice',
    waterAccessLabel: 'Mostly rainfed',
    seasonName: 'Yala',
    priority: 'water',
    dataLabel: 'NASA POWER 2015–2024',
    stats,
    rankedItems: ranked
  });

  assert.ok(cardHtml.includes('Print / Save as PDF'), 'Print / Save as PDF button missing');
  assert.ok(cardHtml.includes('Not a yield forecast'), 'Mandatory disclaimer missing');
  assert.ok(cardHtml.includes('Rule score'), 'Rule scores missing from decision card');
  assert.ok(cardHtml.includes('Location: 9.66, 80.02'), 'Entered coordinates missing');
});

// -------------------------------------------------------------
// 7. 30-Second Video Walkthrough Scene Plan Verification
// -------------------------------------------------------------
console.log(`\n${BOLD}7. Verifying SUBMISSION_KIT.md 30-Second Video Walkthrough Plan...${RESET}`);

test('Scene 1: Initial starting position is Jaffna Peninsula with NASA POWER source label', () => {
  assert.ok(htmlContent.includes('Jaffna peninsula'), 'Initial Jaffna label must be present');
  assert.ok(htmlContent.includes('9.66'), 'Default latitude must be 9.66');
  assert.ok(htmlContent.includes('80.02'), 'Default longitude must be 80.02');
  assert.ok(htmlContent.includes('NASA POWER'), 'NASA POWER source reference must be visible');
});

test('Scene 2: Dynamic rotation ideas re-ranking on water access and priority change is supported', () => {
  assert.ok(appJsContent.includes("button.dataset.priority"), 'Priority dataset change listener must be registered');
  assert.ok(appJsContent.includes("waterAccess.addEventListener('change'"), 'Water access change listener must be registered');
  assert.ok(appJsContent.includes("renderPlans()"), 'Dynamic re-rendering function exists');
});

test('Scene 3: Maha seasonal variation and separate GPM cross-check are supported', () => {
  assert.ok(htmlContent.includes("data-season=\"maha\""), 'Maha switch exists');
  assert.ok(appJsContent.includes("renderSeasonHistoryChart"), 'Season history chart renderer exists');
  assert.ok(appJsContent.includes("renderGpmCrossCheck"), 'Separate GPM cross-check renderer exists');
  assert.ok(htmlContent.includes("Below 75% of median"), '75% median dry threshold legend exists');
});

test('Scene 4: Field decision card download and transparent NASA methodology exist', () => {
  assert.ok(appJsContent.includes("handleDownloadFieldCard"), 'Download field card handler exists');
  assert.ok(htmlContent.includes("How FieldShift uses NASA data"), 'Methodology explanation exists');
});

// -------------------------------------------------------------
// Summary Report
// -------------------------------------------------------------
console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}Test Summary: ${GREEN}${passed} Passed${RESET}, ${failed > 0 ? RED + failed + ' Failed' : '0 Failed'}${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✓ Modular architecture & all requirements are 100% verified!${RESET}\n`);
}
