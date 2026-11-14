/**
 * NASA POWER API Client
 * Requests monthly Agroclimatology (T2M, PRECTOTCORR) and Hydrology (GPM IMERG) point data.
 */

import { average, MONTH_KEYS } from '../core/seasons.js';

export function buildHistory(data, startYear, endYear) {
  const params = data?.properties?.parameter;
  if (!params?.T2M || !params?.PRECTOTCORR) {
    throw new Error('NASA POWER did not return both requested climate fields.');
  }

  const records = [];
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

  const normals = MONTH_KEYS.map((_, i) => {
    const month = i + 1;
    const rows = records.filter(r => r.month === month);
    return {
      temp: average(rows.map(r => r.temp)),
      rainDaily: average(rows.map(r => r.rainDaily))
    };
  });

  return { records, normals };
}

export function buildGpmHistory(data, startYear, endYear) {
  const parameter = data?.properties?.parameter?.IMERG_PRECTOT;
  if (!parameter) {
    throw new Error('NASA POWER did not return IMERG precipitation.');
  }

  const rows = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const rainDaily = Number(parameter[key]);
      // NASA uses -999.0 for missing/uncalibrated data points
      if (Number.isFinite(rainDaily) && rainDaily >= 0) {
        rows.push({ year, month, rainDaily });
      }
    }
  }

  if (rows.length < 96) {
    throw new Error('NASA IMERG returned too few valid months for the comparison period.');
  }

  return rows;
}

export async function fetchNasaPowerClimate(latitude, longitude, startYear, endYear) {
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

  let gpmHistory = [];
  if (gpmResponse?.ok) {
    try {
      gpmHistory = buildGpmHistory(await gpmResponse.json(), startYear, endYear);
    } catch {
      gpmHistory = [];
    }
  }

  return {
    records: history.records,
    normals: history.normals,
    gpmHistory
  };
}

