import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const assetsDir = 'A:\\NASA Competition\\NASA-Space_app\\public\\slides_assets';

async function capture() {
  console.log('Launching Edge for crisp component captures...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 }); // Retina 2x scale for ultra crisp text

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Hero
  console.log('Capturing Hero...');
  const heroEl = await page.$('.hero-section');
  if (heroEl) {
    await heroEl.screenshot({ path: path.join(assetsDir, 'shot1.png') });
  } else {
    await page.screenshot({ path: path.join(assetsDir, 'shot1.png'), clip: { x: 0, y: 0, width: 1440, height: 750 } });
  }

  // 2. Monitoring Studio
  console.log('Capturing Monitoring Studio element...');
  const monEl = await page.$('#monitoring');
  if (monEl) {
    await monEl.screenshot({ path: path.join(assetsDir, 'shot_monitoring.png') });
  }

  // 3. Planner & Map
  console.log('Capturing Planner & Map element...');
  const planEl = await page.$('#planner');
  if (planEl) {
    await planEl.screenshot({ path: path.join(assetsDir, 'shot_planner.png') });
  }

  // 4. Recommendations
  console.log('Capturing Recommendations element...');
  const recEl = await page.$('#recommendations');
  if (recEl) {
    await recEl.screenshot({ path: path.join(assetsDir, 'shot_recommendations.png') });
  }

  // 5. Climate
  console.log('Capturing Climate element...');
  const climEl = await page.$('#climate');
  if (climEl) {
    await climEl.screenshot({ path: path.join(assetsDir, 'shot_climate.png') });
  }

  // 6. Services & Field Card
  console.log('Capturing Services element...');
  const servEl = await page.$('#services');
  if (servEl) {
    await servEl.screenshot({ path: path.join(assetsDir, 'shot_services.png') });
  }

  console.log('Generating slides PDF...');
  const slidesPage = await browser.newPage();
  await slidesPage.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.5 });
  await slidesPage.goto('http://localhost:3000/slides.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await slidesPage.emulateMediaType('print');

  await slidesPage.pdf({
    path: 'A:\\NASA Competition\\NASA-Space_app\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await slidesPage.pdf({
    path: 'A:\\NASA Competition\\NASA-Space_app\\public\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('Crisp screenshots and PDF successfully completed!');
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
