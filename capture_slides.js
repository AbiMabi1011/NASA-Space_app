import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const assetsDir = 'A:\\NASA Competition\\NASA-Space_app\\public\\slides_assets';

async function capture() {
  console.log('Launching Edge...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1.5 });

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Hero
  console.log('Capturing Hero...');
  await page.screenshot({ path: path.join(assetsDir, 'shot1.png') });

  // 2. Monitoring Studio
  console.log('Capturing Monitoring Studio...');
  await page.evaluate(() => {
    const el = document.getElementById('monitoring');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(assetsDir, 'shot_monitoring.png') });

  // 3. Planner & Map
  console.log('Capturing Planner & Map...');
  await page.evaluate(() => {
    const el = document.getElementById('planner');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'shot_planner.png') });

  // 4. Recommendations
  console.log('Capturing Recommendations...');
  await page.evaluate(() => {
    const el = document.getElementById('recommendations');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(assetsDir, 'shot_recommendations.png') });

  // 5. Climate
  console.log('Capturing Climate...');
  await page.evaluate(() => {
    const el = document.getElementById('climate');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(assetsDir, 'shot_climate.png') });

  // 6. Services & Field Card
  console.log('Capturing Services...');
  await page.evaluate(() => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(assetsDir, 'shot_services.png') });

  // Now generate PDF of slides.html
  console.log('Generating slides PDF...');
  const slidesPage = await browser.newPage();
  await slidesPage.setViewport({ width: 1440, height: 960 });
  await slidesPage.goto('http://localhost:3000/slides.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await slidesPage.emulateMediaType('print');

  await slidesPage.pdf({
    path: 'A:\\NASA Competition\\NASA-Space_app\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Also copy to public/
  await slidesPage.pdf({
    path: 'A:\\NASA Competition\\NASA-Space_app\\public\\FieldShift_AgriVision_NASA_Space_Apps_Slides.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('All screenshots and PDF successfully captured and generated!');
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
