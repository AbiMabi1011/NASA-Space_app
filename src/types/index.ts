export type SoilType = 'sandy' | 'clay' | 'silt';
export type WaterAccess = 'rainfed' | 'limited' | 'reliable';
export type Priority = 'water' | 'soil' | 'income';
export type Season = 'yala' | 'maha';
export type DataMode = 'nasa' | 'sample';

export interface TextureScores {
  sandy: number;
  clay: number;
  silt: number;
}

export interface CropRotation {
  id: number;
  name: string;
  crops: string[];
  texture: TextureScores;
  water: number;
  dry: number;
  soil: number;
  market: number;
  cover: number;
  note: string;
  score?: number;
  biome?: 'tropical' | 'temperate' | 'mediterranean' | 'universal';
  minTemp?: number;
  maxTemp?: number;
  optPhMin?: number;
  optPhMax?: number;
  reasonTag?: string;
}

export interface SeasonRow {
  year: number;
  rainMm: number;
  meanTemp: number;
}

export interface SeasonStats {
  season: Season;
  rows: SeasonRow[];
  baseline: number;
  dryLimit: number;
  dryCount: number;
  dryRatio: number;
  meanRain: number;
  meanTemp: number;
}

export interface ClimateRecord {
  year: number;
  month: number;
  temp: number;
  rainDaily: number;
}

export interface ClimateNormal {
  month: number;
  temp: number;
  rainDaily: number;
}

export interface MonthlyClimate {
  temp: number[];
  rain: number[];
}

export interface FieldCardExportOptions {
  latitude: number;
  longitude: number;
  soilLabel: string;
  soilPh: number;
  currentCrop: string;
  waterAccessLabel: string;
  seasonName: string;
  priority: Priority;
  dataLabel: string;
  stats: SeasonStats;
  rankedItems: CropRotation[];
}
