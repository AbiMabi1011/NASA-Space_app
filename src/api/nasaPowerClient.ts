/**
 * NASA POWER API Client
 * Requests monthly Agroclimatology (T2M, PRECTOTCORR) and Hydrology (GPM IMERG) point data.
 */

import { average, MONTH_KEYS } from '../core/seasons.js';
import { ClimateRecord, ClimateNormal } from '../types/index.js';

export interface NasaPowerHistory {
  records: ClimateRecord[];
  normals: ClimateNormal[];
}

export function buildHistory(data: any, startYear: number, endYear: number): NasaPowerHistory {
  const params = data?.properties?.parameter;
  if (!params?.T2M || !params?.PRECTOTCORR) {
    throw new Error('NASA POWER did not return both requested climate fields.');
  }

  const records: ClimateRecord[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const temp = Number(params.T2M[key]);
      const rain = Number(params.PRECTOTCORR[key]);
      if (Number.isFinite(temp) && Number.isFinite(rain)) {
        records.push({ year, month, temp, rainDaily: rain });
      }
    }
  }

  if (records.length < 96) {
    throw new Error('NASA POWER returned too few valid months for the selected decade.');
  }

  const normals: ClimateNormal[] = MONTH_KEYS.map((_, i) => {
    const month = i + 1;
    const rows = records.filter(r => r.month === month);
    return {
      month,
      temp: average(rows.map(r => r.temp)),
      rainDaily: average(rows.map(r => r.rainDaily))
    };
  });

  return { records, normals };
}

export function buildGpmHistory(data: any, startYear: number, endYear: number): ClimateRecord[] {
  const parameter = data?.properties?.parameter?.IMERG_PRECTOT;
  if (!parameter) {
    throw new Error('NASA POWER did not return IMERG precipitation.');
  }

  const rows: ClimateRecord[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const rainDaily = Number(parameter[key]);
      // NASA uses -999.0 for missing/uncalibrated data points
      if (Number.isFinite(rainDaily) && rainDaily >= 0) {
        rows.push({ year, month, temp: 0, rainDaily });
      }
    }
  }

  if (rows.length < 96) {
    throw new Error('NASA IMERG returned too few valid months for the comparison period.');
  }

  return rows;
}

export interface FetchClimateResult {
  records: ClimateRecord[];
  normals: ClimateNormal[];
  gpmHistory: ClimateRecord[];
}

export async function fetchNasaPowerClimate(
  latitude: number,
  longitude: number,
  startYear: number,
  endYear: number
): Promise<FetchClimateResult> {
  const query = new URLSearchParams({
    parameters: 'T2M,PRECTOTCORR',
    community: 'AG',
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: 'JSON'
  });
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?${query}`;

  const gpmQuery = new URLSearchParams({
    parameters: 'IMERG_PRECTOT',
    community: 'AG',
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: 'JSON'
  });
  const gpmUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?${gpmQuery}`;

  const [response, gpmResponse] = await Promise.all([
    fetch(url, { signal: AbortSignal.timeout(20000) }),
    fetch(gpmUrl, { signal: AbortSignal.timeout(20000) }).catch(() => null)
  ]);

  if (!response.ok) {
    throw new Error(`NASA POWER responded with ${response.status}`);
  }

  const raw = await response.json();
  const history = buildHistory(raw, startYear, endYear);

  let gpmHistory: ClimateRecord[] = [];
  if (gpmResponse && gpmResponse.ok) {
    try {
      const gpmRaw = await gpmResponse.json();
      gpmHistory = buildGpmHistory(gpmRaw, startYear, endYear);
    } catch (err) {
      console.warn('Could not parse NASA GPM IMERG series; cross-check unavailable.', err);
    }
  }

  return {
    records: history.records,
    normals: history.normals,
    gpmHistory
  };
}
