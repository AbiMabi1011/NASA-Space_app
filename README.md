# FieldShift — NASA Knights

**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Event:** Jaffna Local Event, NASA Space Apps Challenge 2026

FieldShift is a mobile-friendly, explainable decision-support prototype for comparing crop-rotation ideas with a farmer’s field notes and local priorities. The NASA POWER monthly data request runs for the selected farm coordinates and uses the previous ten complete years of temperature and precipitation history.

## How to Run the App

FieldShift supports two convenient ways to run:

### Option 1: Direct Double-Click (`file:///`) — No Server Required
Simply double-click `index.html` from Windows Explorer or your file manager to open it in Chrome, Brave, Edge, or Firefox. 
*FieldShift's compiled bundle (`app.js`) is universally compatible with the `file:///` protocol and avoids browser module CORS restrictions.*

### Option 2: Local Web Server (Recommended for Live NASA API Calls)
Because some strict browser settings restrict cross-origin `fetch()` requests when running under `file:///`, serving the app over HTTP is recommended for live NASA POWER data:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in your web browser.

> **Note on Offline Resilience:** If NASA POWER cannot be reached (e.g. offline, rate-limited, or blocked by local browser permissions), the application immediately and transparently switches to clearly labeled illustrative sample data (`DEMO DATA`).

## Architecture & Project Structure

FieldShift is engineered with a **Modular, Highly-Maintainable Architecture** located in `src/` coupled with a zero-dependency compiler (`node build.js`) that outputs universal client code:

```
NASA-Space_app/
├── index.html                  # Semantic, accessible UI layout
├── styles.css                  # Custom responsive dark/earthy aesthetic
├── app.js                      # Universal standalone distribution bundle (file:/// & http)
├── build.js                    # Zero-dependency bundler (compiles src/ -> app.js)
├── src/
│   ├── api/
│   │   ├── nasaPowerClient.js  # NASA POWER Agroclimatology & GPM IMERG API client
│   │   └── sampleData.js       # Labeled offline fallback & synthetic series generator
│   ├── core/
│   │   ├── cropCatalog.js      # 8 curated crop rotations with 1–5 traits & soil affinity
│   │   ├── seasons.js          # Yala/Maha seasonal window math, day counts & 75% median
│   │   └── rankingEngine.js    # Deterministic heuristic scoring engine & constraint weights
│   ├── state/
│   │   └── appState.js         # Reactive central state store (subscriber pattern)
│   └── ui/
│       ├── charts.js           # Monthly climatology chart & year-by-year seasonal bars
│       ├── cardRenderer.js     # Rotation cards, baseline indicator & GPM cross-check
│       └── fieldCardExporter.js# Portable HTML/PDF Field Decision Card exporter
├── test_suite.js               # 19-test automated CLI verification suite (Node.js)
├── test-runner.html            # In-browser interactive visual test suite
├── SUBMISSION_KIT.md           # Space Apps submission copy, video script & checklist
└── README.md
```

### Developing & Modifying Code:
- Core business logic, APIs, and UI components are cleanly organized inside `src/`.
- If you make edits to files in `src/`, recompile the universal bundle anytime with:
  ```powershell
  node build.js
  ```

## Automated Verification & Testing

FieldShift includes both CLI and visual in-browser automated test suites to verify requirements, algorithms, and live NASA integrations:

1. **CLI Automated Test Suite (Node.js):**
   ```powershell
   node test_suite.js
   ```
   *Runs 19 automated checks across codebase structure, DOM element IDs, seasonal precipitation math, dynamic heuristic re-ranking, reactive state management, live NASA POWER Monthly API connectivity, fallback modes, decision card HTML generation, and the 30-second walkthrough plan.*

2. **Interactive Visual Test Runner (In-Browser):**
   Serve the directory and navigate to:
   `http://localhost:8000/test-runner.html`
   *Executes live simulated user interactions (priority switching, Maha season toggling, water-access updates, soil sliders) directly inside a sandboxed iframe with real-time pass/fail status.*

## What the prototype does

- Lets a user enter farm coordinates, soil texture, an approximate pH, current main crop, water access, planning season, and top priority.
- Requests monthly `T2M` and `PRECTOTCORR` through NASA POWER’s Agroclimatology point API for the previous ten complete years.
- Requests NASA GPM IMERG precipitation through NASA POWER’s Hydrology community API as a separate rainfall cross-check when available.
- Calculates monthly temperature and rainfall averages, then seasonal rainfall totals. It counts seasons below 75% of that season’s median rainfall.
- Shows every complete Yala or Maha season as a year-by-year rainfall bar, highlighting seasons below the app’s threshold so users can inspect the variation behind the summary.
- Ranks three crop-rotation concepts with a deterministic, visible 1–100 heuristic. NASA’s dry-season frequency, water access, farmer priority, soil texture, and hand-entered rotation traits affect the ordering.
- Shows the current crop and water access as the comparison baseline, with a plain-language reason for each rotation.
- Downloads a portable field decision card with the farmer-entered context, NASA climate summary, top rotation ideas, and a print-to-PDF option for extension conversations.
- Offers a labeled sample fallback when the NASA service is unreachable.

## NASA data and method

- **NASA POWER Agroclimatology API, Monthly Point:** [API documentation](https://power.larc.nasa.gov/docs/services/api/temporal/monthly/) · [Parameter dictionary](https://power.larc.nasa.gov/parameters/)
- **Parameters:** `T2M` (2-meter air temperature, °C) and `PRECTOTCORR` (corrected precipitation, mm/day).
- **Independent satellite rainfall cross-check:** `IMERG_PRECTOT` through the NASA POWER Hydrology community. This product is associated with NASA’s GPM IMERG precipitation data; FieldShift displays it separately and never silently blends the two rainfall estimates. See [NASA POWER hydrology data sources](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/) and [NASA GPM IMERG](https://gpm.nasa.gov/data/imerg).
- **Area:** farmer-selected latitude/longitude; the starter values point to Jaffna Peninsula, Sri Lanka (9.66° N, 80.02° E).
- **Period:** rolling previous ten complete calendar years. Monthly precipitation is converted from mm/day to monthly/seasonal totals by multiplying by the number of days in each month.
- **Season windows in this prototype:** Yala March–August; Maha September–February (Maha spans two calendar years). These are broad dry-zone windows; crop-specific local calendars vary.
- **Dry-season indicator:** seasonal precipitation total below 75% of the selected season’s median across the available historical seasons. This is an app-defined comparison threshold, not an official NASA drought classification.
- NASA POWER’s meteorological parameters are gridded climate/reanalysis products; they are not measurements from the farmer’s individual field or a short-term forecast. See [NASA POWER data sources](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/).

## How to read the ranking

The rotation catalogue uses AI-assisted, illustrative prototype traits on 1–5 scales: relative water demand, dry-condition fit, soil-building potential, market options, and texture fit. The selected farmer priority sets the weights. A higher frequency of historically dry seasons increases the weight given to water efficiency and dry-condition fit. These scores are comparison aids only; they are not calibrated against yields, profits, or field trials.

Crop traits and crop sequences need local review before agricultural use. The interface deliberately asks users to validate ideas with Jaffna farmers and agricultural extension officers. Soil pH is recorded as a farmer-entered estimate and is not currently used to make crop suitability claims.

## Sources

- [Official Field Shift challenge statement](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/)
- [NASA POWER Monthly API](https://power.larc.nasa.gov/docs/services/api/temporal/monthly/)
- [NASA POWER meteorological data sources](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/)
- [Sri Lanka Department of Agriculture rice season reference](https://doa.gov.lk/wp-content/uploads/2020/05/Rice-Congress-2010.pdf) — the prototype uses this broad Yala/Maha framing, not a crop-by-crop planting recommendation.

## AI and NASA branding disclosure

OpenAI Codex was used to help write and edit app code, research documentation, rotation-catalogue assumptions, scoring logic, and submission text. NASA datasets are fetched directly from NASA POWER; AI did not create or alter the NASA data. The rotation traits are illustrative and need review by local farmers and agronomists. No AI-generated images, NASA logos, flags, or mission identifiers are used.

## Limits

This is a hackathon prototype, not a farm advisory service. NASA POWER grid data may not reflect field-scale variation. Crop traits, the 75% dry-season threshold, score weights, and suggested rotations require validation with local agronomists and farmers. There is no yield, profit, soil-health, or future-weather prediction.
