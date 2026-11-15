/**
 * Central Reactive Application State Store
 */

import { SAMPLE } from '../api/sampleData.js';
import { ClimateRecord, MonthlyClimate, SoilType, WaterAccess, Priority, Season, DataMode } from '../types/index.js';

const CURRENT_YEAR = new Date().getFullYear();
export const END_YEAR = CURRENT_YEAR - 1;
export const START_YEAR = END_YEAR - 9;

export type AppStateListener = (state: AppState, changeType: string) => void;

export class AppState {
  latitude: number;
  longitude: number;
  soilType: SoilType | string;
  soilPh: number;
  currentCrop: string;
  waterAccess: WaterAccess | string;
  selectedPriority: Priority | string;
  selectedSeason: Season | string;
  dataMode: DataMode;
  monthlyClimate: MonthlyClimate;
  seasonHistory: ClimateRecord[];
  gpmHistory: ClimateRecord[];
  private listeners: Set<AppStateListener>;

  constructor() {
    this.latitude = 9.66;
    this.longitude = 80.02;
    this.soilType = 'sandy';
    this.soilPh = 6.5;
    this.currentCrop = 'Rice';
    this.waterAccess = 'rainfed';
    this.selectedPriority = 'water';
    this.selectedSeason = 'yala';
    this.dataMode = 'sample';
    this.monthlyClimate = { temp: [...SAMPLE.temp], rain: [...SAMPLE.rain] };
    this.seasonHistory = [];
    this.gpmHistory = [];

    this.listeners = new Set();
  }

  subscribe(listener: AppStateListener): () => boolean {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType: string): void {
    for (const listener of this.listeners) {
      listener(this, changeType);
    }
  }

  set(updates: Partial<AppState>, changeType: string = 'update'): void {
    Object.assign(this, updates);
    this.notify(changeType);
  }
}

export const state = new AppState();
