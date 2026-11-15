# FieldShift (React.js + TypeScript) — NASA Knights

**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Event:** Jaffna Local Event, NASA Space Apps Challenge 2026

FieldShift is a modern **React.js + TypeScript** decision-support application for comparing crop-rotation sequences with a farmer’s field notes and local priorities. It requests 10 complete years of NASA POWER Agroclimatology monthly data (`T2M` and `PRECTOTCORR`) and independent NASA GPM IMERG satellite rainfall cross-checks.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server (Vite Hot-Reload)
```bash
npm run dev
```
Then open `http://localhost:3000` in your web browser.

### 3. Type Checking & Production Build
```bash
npm run typecheck   # Type-checks all TypeScript files
npm run build       # tsc && vite build
```
Creates an optimized, minified bundle inside `dist/`.

To preview the production build locally:
```bash
npm run preview
```

### 4. Run Automated Test Suite
```bash
npm test
# runs: tsx test_suite.ts
```
Runs 19 automated tests verifying React + TypeScript component structure, seasonal precipitation math, dynamic heuristic re-ranking, reactive state management, live NASA POWER connectivity, and field decision card generation.

---

## Architecture & Project Structure (React.js + TypeScript)

```
NASA-Space_app/
├── package.json                    # React 18, TypeScript, Vite & tsx runner
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.js                  # Vite bundler configuration
├── index.html                      # HTML entry with <div id="root"></div> & module loader
├── styles.css                      # Responsive dark/earthy aesthetic design system
├── src/
│   ├── vite-env.d.ts               # Vite client type references
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (CropRotation, SeasonStats, etc.)
│   ├── main.tsx                    # React 18 createRoot bootstrap (TypeScript)
│   ├── App.tsx                     # Central state orchestrator and workflow manager
│   ├── components/                 # Declarative React TypeScript components
│   │   ├── TopUtilityBar.tsx       # Header announcement & live sync status
│   │   ├── Navbar.tsx              # Brand, navigation links, and tour trigger
│   │   ├── HeroSection.tsx         # Hero banner with presets & telemetry preview card
│   │   ├── QuickRibbon.tsx         # Quick-navigation features ribbon
│   │   ├── OverviewSection.tsx     # Location, climate snapshot & soil summary cards
│   │   ├── MonitoringDashboard.tsx # AgriVision monitoring studio with interactive 3D zones
│   │   ├── PlannerSection.tsx      # Two-column workflow: Step 1 (Inputs) & Step 2 (Outputs)
│   │   ├── ClimateSection.tsx      # 10-Yr climate intelligence, history chart, GPM cross-check
│   │   ├── ServicesSection.tsx     # Professional agroclimatic expertise & community showcase
│   │   ├── NewsletterRibbon.tsx    # Seasonal advisory subscription form
│   │   ├── Footer.tsx              # Team identification, resources, contacts & disclaimers
│   │   └── TourModal.tsx           # 5-Step interactive novice guided walkthrough modal
│   ├── api/
│   │   ├── nasaPowerClient.ts      # NASA POWER Agroclimatology & GPM IMERG API client
│   │   └── sampleData.ts           # Labeled offline fallback & synthetic series generator
│   ├── core/
│   │   ├── cropCatalog.ts          # 8 curated crop rotations with 1–5 traits & soil affinity
│   │   ├── seasons.ts              # Yala/Maha seasonal window math & 75% median dry threshold
│   │   └── rankingEngine.ts        # Deterministic heuristic scoring engine & constraint weights
│   ├── state/
│   │   └── appState.ts             # Reactive central state store
│   └── ui/
│       └── fieldCardExporter.ts    # Portable HTML/PDF Field Decision Card exporter
├── test_suite.ts                   # 19-test automated CLI verification suite (TypeScript)
├── SUBMISSION_KIT.md               # Space Apps submission copy, video script & checklist
└── README.md
```
