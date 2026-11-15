/**
 * Field Decision Card Generator
 * Produces a portable, standalone HTML/PDF document for extension worker conversations.
 */

import { PRIORITY_LABELS } from '../core/rankingEngine.js';
import { FieldCardExportOptions } from '../types/index.js';

export function escapeHtml(value: any): string {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char] || char));
}

export function generateFieldCardHtml({
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
}: FieldCardExportOptions): string {
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

export function downloadFieldCardFile(context: FieldCardExportOptions): void {
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
