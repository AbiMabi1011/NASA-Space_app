/**
 * Central Reactive Application State Store
 */

import { SAMPLE } from '../api/sampleData.js';

const CURRENT_YEAR = new Date().getFullYear();
export const END_YEAR = CURRENT_YEAR - 1;
export const START_YEAR = END_YEAR - 9;

export class AppState {
  constructor() {
    this.latitude = 9.66;
    this.longitude = 80.02;
    this.soilType = 'sandy';
    this.soilPh = 6.5;
    this.currentCrop = 'Rice';
    this.waterAccess = 'rainfed';
    this.selectedPriority = 'water';
    this.selectedSeason = 'yala';
    this.dataMode = 'sample'; // 'nasa' | 'sample'
    this.monthlyClimate = { temp: [...SAMPLE.temp], rain: [...SAMPLE.rain] };
    this.seasonHistory = [];
    this.gpmHistory = [];

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType) {
    for (const listener of this.listeners) {
      listener(this, changeType);
    }
  }

  set(updates, changeType = 'update') {
    Object.assign(this, updates);
    this.notify(changeType);
  }
}

export const state = new AppState();

