/**
 * Transparent Heuristic Crop Rotation Ranking Engine
 * Computes a deterministic 1–100 heuristic match score.
 * Weights adjust based on:
 *   - Farmer's chosen priority ('water', 'soil', 'income')
 *   - Water access constraints ('rainfed', 'limited', 'reliable')
 *   - Observed NASA dry-season frequency (ratio of seasons < 75% median)
 *   - Entered soil texture ('sandy', 'clay', 'silt')
 */

export const PRIORITY_LABELS = {
  water: 'Save water',
  soil: 'Build soil',
  income: 'Steady income'
};

export function scoreRotation(item, stats, texture, selectedPriority, waterAccessVal) {
  const dryYears = stats.dryRatio || 0;
  const waterAccessWeight = waterAccessVal === 'rainfed' ? 1.0 : waterAccessVal === 'limited' ? 0.72 : 0.42;

  const dimensions = {
    waterEfficiency: 6 - item.water,
    droughtFit: item.dry,
    soilBuilding: item.soil,
    marketOptions: item.market,
    soilMatch: item.texture[texture] || 3,
    cover: item.cover,
    legume: 5
  };

  const weights = selectedPriority === 'water'
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
  const normalized = weightedSum / totalWeight;

  return Math.round(normalized * 20);
}

export function rankRotations(rotations, stats, texture, selectedPriority, waterAccessVal, limit = 3) {
  return rotations
    .map(item => ({
      ...item,
      score: scoreRotation(item, stats, texture, selectedPriority, waterAccessVal)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

