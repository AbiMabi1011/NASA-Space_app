/**
 * Labeled Offline Sample Climate Data
 * Used as a transparent fallback when the NASA POWER API is unreachable.
 */

export const SAMPLE = {
  temp: [25.7, 26.3, 27.8, 29.5, 30.5, 30.2, 29.7, 29.3, 29.1, 28.2, 26.8, 25.9],
  rain: [2.6, 1.4, 1.4, 1.8, 0.8, 0.6, 1.1, 1.3, 2.9, 7.4, 11.7, 6.7]
};

export function makeDemoHistory(startYear, endYear) {
  const records = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const i = month - 1;
      const cycle = Math.sin((year - startYear) * 2.1 + i * 0.47);
      records.push({
        year,
        month,
        temp: SAMPLE.temp[i] + cycle * 0.8,
        rainDaily: Math.max(0.05, SAMPLE.rain[i] * (1 + cycle * 0.25))
      });
    }
  }
  return {
    records,
    normals: SAMPLE.temp.map((temp, i) => ({
      temp,
      rainDaily: SAMPLE.rain[i]
    }))
  };
}

