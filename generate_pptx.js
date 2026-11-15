import pptxgen from 'pptxgenjs';
import path from 'path';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

const assetsDir = 'A:\\NASA Competition\\NASA-Space_app\\public\\slides_assets';

// Theme Colors
const BG_DARK = '07150E';
const CARD_BG = '0E2217';
const ACCENT = '22C55E';
const ACCENT_LIGHT = '86EFAC';
const TEXT_MAIN = 'FFFFFF';
const TEXT_MUTED = '94A3B8';

// Slide 1: Hero
const s1 = pptx.addSlide();
s1.background = { color: BG_DARK };
s1.addText('NASA SPACE APPS CHALLENGE 2026 · PROJECT DEMO', {
  x: 0.8, y: 1.2, w: 11.5, h: 0.4,
  fontSize: 12, bold: true, color: ACCENT_LIGHT, fontFace: 'Arial'
});
s1.addText('FieldShift AgriVision', {
  x: 0.8, y: 1.8, w: 11.5, h: 1.0,
  fontSize: 44, bold: true, color: TEXT_MAIN, fontFace: 'Arial'
});
s1.addText('Crop Yield & Rotation Planning Tailored for Climate Resilience Powered by 10 Years of NASA Earth Observations', {
  x: 0.8, y: 2.9, w: 11.5, h: 0.8,
  fontSize: 18, color: ACCENT_LIGHT, fontFace: 'Arial'
});
s1.addText('Empowering smallholder farmers and agricultural extension officers with transparent, explainable seasonal crop rotation pathways grounded in real-world NASA satellite meteorology.', {
  x: 0.8, y: 3.9, w: 11.5, h: 0.8,
  fontSize: 14, color: TEXT_MUTED, fontFace: 'Arial'
});
s1.addText('Team: NASA Knights  |  Data: NASA POWER & GPM IMERG  |  Stack: React 18, TypeScript, Vite, Leaflet', {
  x: 0.8, y: 5.5, w: 11.5, h: 0.5,
  fontSize: 13, bold: true, color: TEXT_MAIN, fontFace: 'Arial'
});

// Helper for slides 2-7
function createContentSlide(title, badge, points, imagePath, windowLabel) {
  const s = pptx.addSlide();
  s.background = { color: BG_DARK };

  // Eyebrow
  s.addText(badge, {
    x: 0.8, y: 0.5, w: 8.0, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT_LIGHT, fontFace: 'Arial'
  });

  // Title
  s.addText(title, {
    x: 0.8, y: 0.8, w: 11.5, h: 0.7,
    fontSize: 26, bold: true, color: TEXT_MAIN, fontFace: 'Arial'
  });

  // Left Content Text
  const textRuns = points.map(p => ({
    text: p.title + '\n',
    options: { fontSize: 13, bold: true, color: TEXT_MAIN, breakLine: true }
  })).concat(points.map((p, idx) => ({
    text: p.desc + (idx < points.length - 1 ? '\n\n' : ''),
    options: { fontSize: 12, color: TEXT_MUTED }
  })));

  // Grouped Bullet Points
  let curY = 1.6;
  points.forEach(p => {
    s.addText([
      { text: '• ' + p.title + ': ', options: { bold: true, color: TEXT_MAIN, fontSize: 13 } },
      { text: p.desc, options: { color: TEXT_MUTED, fontSize: 12 } }
    ], {
      x: 0.8, y: curY, w: 4.8, h: 1.1,
      fontFace: 'Arial', lineSpacing: 18
    });
    curY += 1.3;
  });

  // Right Side Screenshot
  s.addImage({
    path: imagePath,
    x: 5.8, y: 1.6, w: 6.7, h: 4.8,
    sizing: { type: 'contain', w: 6.7, h: 4.8 }
  });

  // Footer
  s.addText('Team NASA Knights · FieldShift AgriVision', {
    x: 0.8, y: 6.8, w: 11.5, h: 0.3,
    fontSize: 10, color: TEXT_MUTED, fontFace: 'Arial'
  });
}

// Slide 2: Problem
createContentSlide(
  'The Problem: Agriculture in an Unpredictable Climate',
  'CHALLENGE & PROBLEM STATEMENT · 02/07',
  [
    { title: 'Monoculture Depletion', desc: 'Continuous single-crop cultivation (like paddy rice) exhausts soil nitrogen, drives pest cycles, and increases financial vulnerability.' },
    { title: 'The Satellite Data Gap', desc: 'NASA produces world-class agroclimatology, but it remains locked in complex gridded APIs out of reach for smallholder farmers.' },
    { title: 'Black-Box Distrust', desc: 'Opaque deep-learning yield forecasts lack scientific explainability and often recommend unviable rotations.' }
  ],
  path.join(assetsDir, 'shot1.png'),
  'Home & Overview'
);

// Slide 3: Map
createContentSlide(
  'Global Reach: Interactive Point-and-Click Map',
  'SOLUTION ARCHITECTURE · STEP 1 · 03/07',
  [
    { title: 'Point-and-Click Leaflet Map', desc: 'Drop a pin anywhere on Earth or select curated presets (India, Africa, Americas, Europe, Australia) with zero borders.' },
    { title: 'Soil & Field Profile', desc: 'Captures soil texture (sandy, clay, silty), estimated pH (4.5–8.5), current main crop, and water access tier.' },
    { title: 'Live NASA POWER Query', desc: 'Dropping a pin instantly queries NASA POWER global 0.5°x0.5° grid for 10 years of satellite data.' }
  ],
  path.join(assetsDir, 'shot_planner.png'),
  'Step 1A Farm Coordinates'
);

// Slide 4: Climate
createContentSlide(
  '10-Year Climatology & Satellite Cross-Check',
  'NASA DATA & SCIENTIFIC RIGOR · 04/07',
  [
    { title: 'NASA POWER Agroclimatology', desc: '10 complete years (120 months) of 2-meter air temperature (T2M) and precipitation (PRECTOTCORR).' },
    { title: 'Drought Risk Ratio', desc: 'Computes median rainfall and quantifies frequency of drier seasons (<75% of median) to tune risk weighting.' },
    { title: 'GPM IMERG Cross-Check', desc: 'Validates rainfall against NASA GPM IMERG satellite precipitation independently without silent data blending.' }
  ],
  path.join(assetsDir, 'shot_climate.png'),
  'NASA Climate Observations'
);

// Slide 5: Recommendations
createContentSlide(
  'Explainable One-by-One Rotation Pathways',
  'BIOPHYSICAL ENGINE · STEP 2 · 05/07',
  [
    { title: 'One-by-One Stepper', desc: 'Walks through #1 Top Recommendation, #2 Strong Alternative, and #3 Diversified Option with plain-language rationales.' },
    { title: 'Rhizobia Nitrogen Fixation', desc: 'Highlights legume and pulse phases (cowpea, sunn hemp) that biologically fix nitrogen and cut chemical fertilizer costs.' },
    { title: 'Dynamic Priority Re-Ranking', desc: 'Re-scores live when toggling between Save Water, Build Soil, or Steady Income.' }
  ],
  path.join(assetsDir, 'shot_recommendations.png'),
  'Step 2 Rotation Pathways'
);

// Slide 6: Monitoring Studio
createContentSlide(
  'Field Monitoring & Printable Decision Card',
  'MONITORING STUDIO & PORTABILITY · 06/07',
  [
    { title: 'Satellite Field Simulation', desc: '3D isometric zone dashboard tracking Zone A, B, C health indices and auto-irrigation moisture thresholds.' },
    { title: 'GPS-Linked Console', desc: 'Displays live field coordinates, mean air temp, and agro-telemetry dynamically linked to your selected farm.' },
    { title: 'One-Click Decision Card', desc: 'Exports a printable 1-page HTML/PDF card with NASA climate signals, rotation steps, and extension officer sign-offs.' }
  ],
  path.join(assetsDir, 'shot_monitoring.png'),
  'Monitoring Studio'
);

// Slide 7: Impact & Roadmap
createContentSlide(
  'Impact, Scalability & Future Roadmap',
  'IMPACT & ROADMAP · CONCLUSION · 07/07',
  [
    { title: 'Global Planetary Scale', desc: 'Requires zero on-field hardware; functions worldwide through NASA open-access satellite APIs.' },
    { title: 'Economic & Soil ROI', desc: 'Cuts fertilizer bills through biological legume rotation while building resilience against shifting monsoon dry spells.' },
    { title: 'Roadmap', desc: 'NASA SMAP soil moisture radar integration, local vernacular audio readouts, and SMS advisory integration.' }
  ],
  path.join(assetsDir, 'shot_services.png'),
  'Services & Impact'
);

// Save PPTX
const outputPath = 'A:\\NASA Competition\\NASA-Space_app\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pptx';
const publicOutputPath = 'A:\\NASA Competition\\NASA-Space_app\\public\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pptx';

pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log('PPTX created at ' + outputPath);
  pptx.writeFile({ fileName: publicOutputPath }).then(() => {
    console.log('Public PPTX created at ' + publicOutputPath);
  });
}).catch(err => {
  console.error(err);
});
