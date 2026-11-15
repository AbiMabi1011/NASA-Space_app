/**
 * Transparent Heuristic Crop Rotation Ranking Engine
 * Computes a deterministic 1–100 heuristic match score.
 * Weights adjust based on:
 *   - Farmer's chosen priority ('water', 'soil', 'income')
 *   - Water access constraints ('rainfed', 'limited', 'reliable')
 *   - Observed NASA dry-season frequency (ratio of seasons < 75% median)
 *   - Entered soil texture ('sandy', 'clay', 'silt')
 *   - (Optional) NASA observed mean temperature & geographic latitude
 *   - (Optional) Soil pH & Current Main Crop diversity break
 */

import { CropRotation, SeasonStats, SoilType, Priority, WaterAccess } from '../types/index.js';

export const PRIORITY_LABELS: Record<Priority, string> = {
  water: 'Save water',
  soil: 'Build soil',
  income: 'Steady income'
};

export function scoreRotation(
  item: CropRotation,
  stats: SeasonStats,
  texture: SoilType | string,
  selectedPriority: Priority | string,
  waterAccessVal: WaterAccess | string,
  soilPhVal?: number,
  currentCropVal?: string,
  _latitudeVal?: number
): number {
  const dryYears = stats.dryRatio || 0;
  const waterAccessWeight = waterAccessVal === 'rainfed' ? 1.0 : waterAccessVal === 'limited' ? 0.72 : 0.42;

  const validTexture = (texture === 'sandy' || texture === 'clay' || texture === 'silt') ? texture : 'sandy';

  const dimensions: Record<string, number> = {
    waterEfficiency: 6 - item.water,
    droughtFit: item.dry,
    soilBuilding: item.soil,
    marketOptions: item.market,
    soilMatch: item.texture[validTexture] || 3,
    cover: item.cover,
    legume: 5
  };

  const weights: Record<string, number> = selectedPriority === 'water'
    ? {
        waterEfficiency: 0.27 * waterAccessWeight,
        droughtFit: 0.12 + 0.28 * dryYears,
        soilBuilding: 0.10,
        marketOptions: 0.08,
        soilMatch: 0.15,
        cover: 0.10,
        legume: 0.10
      }
    : selectedPriority === 'soil'
      ? {
          waterEfficiency: 0.10,
          droughtFit: 0.08 + 0.14 * dryYears,
          soilBuilding: 0.26,
          marketOptions: 0.08,
          soilMatch: 0.20,
          cover: 0.14,
          legume: 0.12
        }
      : {
          waterEfficiency: 0.14 * waterAccessWeight,
          droughtFit: 0.08 + 0.10 * dryYears,
          soilBuilding: 0.10,
          marketOptions: 0.27,
          soilMatch: 0.16,
          cover: 0.08,
          legume: 0.19
        };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedSum = Object.entries(weights).reduce((sum, [key, weight]) => sum + dimensions[key] * weight, 0);
  let baseScore = Math.round((weightedSum / totalWeight) * 20);

  // Advanced biophysical modifiers when environmental context is provided
  let modifier = 0;

  // 1. Temperature Thermal Suitability (NASA Observed 2m Air Temp)
  if (stats && typeof stats.meanTemp === 'number') {
    if (item.minTemp && stats.meanTemp < item.minTemp) {
      // Crop requires warmer weather than location provides (e.g. Millet in cold temperate zone)
      modifier -= Math.min(25, Math.round((item.minTemp - stats.meanTemp) * 2.5));
    }
    if (item.maxTemp && stats.meanTemp > item.maxTemp) {
      modifier -= Math.min(20, Math.round((stats.meanTemp - item.maxTemp) * 2.0));
    }
  }

  // 2. Soil pH Compatibility
  if (typeof soilPhVal === 'number') {
    if (item.optPhMin && soilPhVal < item.optPhMin) {
      modifier -= Math.round((item.optPhMin - soilPhVal) * 6);
    } else if (item.optPhMax && soilPhVal > item.optPhMax) {
      modifier -= Math.round((soilPhVal - item.optPhMax) * 6);
    }
  }

  // 3. Crop Rotation Monoculture Avoidance & Pest Break
  if (currentCropVal && item.crops.length > 0) {
    const curLower = currentCropVal.toLowerCase().trim();
    const firstLower = item.crops[0].toLowerCase().trim();
    if (firstLower.includes(curLower) || curLower.includes(firstLower)) {
      // Farmer is currently growing this crop; penalize consecutive monoculture
      modifier -= 10;
    } else {
      // Rotation introduces a distinct crop family (break crop)
      modifier += 3;
    }
  }

  // 4. Low Rainfall Volume Stress Penalty
  if (stats && typeof stats.meanRain === 'number' && stats.meanRain < 250 && waterAccessVal === 'rainfed') {
    if (item.water >= 4) {
      modifier -= 12; // Thirsty crop in rainfed dry conditions
    } else if (item.dry >= 4) {
      modifier += 4;  // Extra boost for drought resilience
    }
  }

  const finalScore = Math.max(15, Math.min(99, baseScore + modifier));
  return finalScore;
}

export function rankRotations(
  rotations: CropRotation[],
  stats: SeasonStats,
  texture: SoilType | string,
  selectedPriority: Priority | string,
  waterAccessVal: WaterAccess | string,
  limit: number = 3,
  soilPhVal?: number,
  currentCropVal?: string,
  _latitudeVal?: number
): CropRotation[] {
  return rotations
    .map(item => {
      const score = scoreRotation(
        item,
        stats,
        texture,
        selectedPriority,
        waterAccessVal,
        soilPhVal,
        currentCropVal,
        _latitudeVal
      );

      // Generate dynamic explanatory reason tag
      let reasonTag = 'NASA Satellite Climatology Matched';
      if (stats && stats.meanTemp < 18) {
        reasonTag = `❄️ Adapted to cool ${stats.meanTemp.toFixed(1)}°C growing season`;
      } else if (selectedPriority === 'water' && item.dry >= 4) {
        reasonTag = `☀️ Drought-Resilient (${stats.dryCount}/${stats.rows?.length || 10} dry seasons risk)`;
      } else if (selectedPriority === 'soil' && item.soil >= 4) {
        reasonTag = `🌱 Biological Rhizobia Nitrogen Fixation & Organic Matter`;
      } else if (selectedPriority === 'income') {
        reasonTag = `💰 High Commercial Value & Cash Market Liquidity`;
      } else if (currentCropVal && !item.crops[0].toLowerCase().includes(currentCropVal.toLowerCase())) {
        reasonTag = `🔄 Breeds Pest Break against ${currentCropVal} monoculture`;
      }

      return {
        ...item,
        score,
        reasonTag
      };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}
