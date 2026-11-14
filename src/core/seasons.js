/**
 * Seasonal Calculations and Climate Utilities
 * Sri Lanka agricultural calendar:
 *   - Yala: March to August
 *   - Maha: September to February (spans year transition)
 */

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_KEYS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function median(values) {
  const sorted = [...values].sort((x, y) => x - y);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function coordinateText(value, positive, negative) {
  return `${Math.abs(value).toFixed(2)}° ${value < 0 ? negative : positive}`;
}

export function seasonMonths(season) {
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
export function buildSeasonStats(season, records) {
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

