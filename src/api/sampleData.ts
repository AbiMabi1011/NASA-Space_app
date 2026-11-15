/**
 * Labeled Offline Sample Climate Data
 * Used as a transparent fallback when the NASA POWER API is unreachable.
 */

import { ClimateRecord, ClimateNormal, MonthlyClimate } from '../types/index.js';

export const SAMPLE: MonthlyClimate = {
  temp: [25.7, 26.3, 27.8, 29.5, 30.5, 30.2, 29.7, 29.3, 29.1, 28.2, 26.8, 25.9],
  rain: [2.6, 1.4, 1.4, 1.8, 0.8, 0.6, 1.1, 1.3, 2.9, 7.4, 11.7, 6.7]
};

export interface DemoHistoryResult {
  records: ClimateRecord[];
  normals: ClimateNormal[];
}

export function makeDemoHistory(startYear: number, endYear: number, latitude?: number): DemoHistoryResult {
  const records: ClimateRecord[] = [];
  const latOffset = typeof latitude === 'number'
    ? Math.abs(latitude) > 45
      ? -Math.min(26, (Math.abs(latitude) - 25) * 0.7)
      : Math.abs(latitude) > 28
      ? -6
      : 0
    : 0;

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const i = month - 1;
      const cycle = Math.sin((year - startYear) * 2.1 + i * 0.47);
      records.push({
        year,
        month,
        temp: Math.max(-15, SAMPLE.temp[i] + latOffset + cycle * 0.8),
        rainDaily: Math.max(0.05, SAMPLE.rain[i] * (1 + cycle * 0.25))
      });
    }
  }
  return {
    records,
    normals: SAMPLE.temp.map((temp, i) => ({
      month: i + 1,
      temp: Math.max(-15, temp + latOffset),
      rainDaily: SAMPLE.rain[i]
    }))
  };
}
