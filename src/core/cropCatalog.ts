/**
 * Global Crop Rotation Catalog
 * Curated biophysical rotation assumptions (1–5 scale) calibrated for:
 *   - Tropical Semi-Arid & Monsoon Agro-ecosystems (South Asia, Sub-Saharan Africa)
 *   - Temperate & Continental Agricultural Belts (US Midwest, Europe, Northern Asia)
 *   - Mediterranean & Subtropical Drylands (California, Spain, Australia, North India)
 */

import { CropRotation } from '../types/index.js';

// The 8 core tropical rotations (preserved for test suite compatibility & dry-zone baseline)
export const ROTATIONS: CropRotation[] = [
  {
    id: 1,
    name: 'Groundnut → Green gram → Sesame',
    crops: ['Groundnut', 'Green gram', 'Sesame'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 3,
    cover: 3,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Three crop families with two pulse phases; biological nitrogen fixing and low water requirement.',
    biome: 'tropical',
    minTemp: 22,
    optPhMin: 5.8,
    optPhMax: 7.2
  },
  {
    id: 2,
    name: 'Pearl millet → Cowpea → Cover crop',
    crops: ['Pearl millet', 'Cowpea', 'Cover crop'],
    water: 1,
    dry: 5,
    soil: 4,
    market: 2,
    cover: 5,
    texture: { sandy: 4, clay: 4, silt: 4 },
    note: 'Extreme drought-hardy cereal and pulse concept that includes a deep-root soil-cover phase.',
    biome: 'tropical',
    minTemp: 20,
    optPhMin: 5.5,
    optPhMax: 8.0
  },
  {
    id: 3,
    name: 'Chilli → Mung bean → Sesame',
    crops: ['Chilli', 'Mung bean', 'Sesame'],
    water: 3,
    dry: 3,
    soil: 3,
    market: 4,
    cover: 2,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'High-value cash-crop sequence with a pulse break; requires moderate moisture and local market access.',
    biome: 'tropical',
    minTemp: 21,
    optPhMin: 6.0,
    optPhMax: 7.5
  },
  {
    id: 4,
    name: 'Maize → Cowpea → Green manure',
    crops: ['Maize', 'Cowpea', 'Green manure'],
    water: 3,
    dry: 3,
    soil: 5,
    market: 3,
    cover: 5,
    texture: { sandy: 3, clay: 4, silt: 4 },
    note: 'Cereal grain, legume protein, and biomass cover phase to maximize soil organic matter.',
    biome: 'tropical',
    minTemp: 18,
    optPhMin: 5.8,
    optPhMax: 7.4
  },
  {
    id: 5,
    name: 'Groundnut → Sorghum → Sunn hemp',
    crops: ['Groundnut', 'Sorghum', 'Sunn hemp'],
    water: 2,
    dry: 4,
    soil: 5,
    market: 3,
    cover: 4,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Alternates crop families with a high-nitrogen green-manure phase for sandy drylands.',
    biome: 'tropical',
    minTemp: 20,
    optPhMin: 5.5,
    optPhMax: 7.8
  },
  {
    id: 6,
    name: 'Rice → Mung bean → Sesbania',
    crops: ['Rice', 'Mung bean', 'Sesbania'],
    water: 5,
    dry: 2,
    soil: 4,
    market: 4,
    cover: 4,
    texture: { sandy: 2, clay: 4, silt: 4 },
    note: 'Lowland paddy sequence with legume fallow; best suited for clay soils with reliable water.',
    biome: 'tropical',
    minTemp: 22,
    optPhMin: 5.5,
    optPhMax: 7.0
  },
  {
    id: 7,
    name: 'Onion → Green gram → Chilli',
    crops: ['Onion', 'Green gram', 'Chilli'],
    water: 4,
    dry: 2,
    soil: 3,
    market: 5,
    cover: 2,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'Intensive commercial vegetable and spice sequence with short pulse interlude.',
    biome: 'tropical',
    minTemp: 18,
    optPhMin: 6.0,
    optPhMax: 7.5
  },
  {
    id: 8,
    name: 'Sesame → Mung bean → Onion',
    crops: ['Sesame', 'Mung bean', 'Onion'],
    water: 3,
    dry: 3,
    soil: 3,
    market: 4,
    cover: 2,
    texture: { sandy: 4, clay: 3, silt: 4 },
    note: 'Oilseed and allium rotation with legume break to balance cash returns and soil fertility.',
    biome: 'tropical',
    minTemp: 21,
    optPhMin: 6.0,
    optPhMax: 7.8
  }
];

// Additional international rotations for Temperate, Cool, and Mediterranean climates
export const TEMPERATE_ROTATIONS: CropRotation[] = [
  {
    id: 101,
    name: 'Winter Wheat → Field Pea → Spring Canola',
    crops: ['Winter Wheat', 'Field Pea', 'Spring Canola'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 4,
    cover: 4,
    texture: { sandy: 3, clay: 4, silt: 5 },
    note: 'Classic cold-climate cereal and pulse cycle with deep taproot oilseed break. Highly frost tolerant.',
    biome: 'temperate',
    minTemp: 4,
    maxTemp: 24,
    optPhMin: 6.0,
    optPhMax: 7.5
  },
  {
    id: 102,
    name: 'Spring Barley → Red Clover → Oats',
    crops: ['Spring Barley', 'Red Clover', 'Oats'],
    water: 2,
    dry: 3,
    soil: 5,
    market: 3,
    cover: 5,
    texture: { sandy: 4, clay: 4, silt: 4 },
    note: 'Acid-tolerant northern rotation; red clover provides 120 kg/ha atmospheric nitrogen fixation.',
    biome: 'temperate',
    minTemp: 3,
    maxTemp: 22,
    optPhMin: 5.2,
    optPhMax: 7.0
  },
  {
    id: 103,
    name: 'Corn → Soybean → Winter Cereal Rye',
    crops: ['Corn', 'Soybean', 'Winter Cereal Rye'],
    water: 3,
    dry: 3,
    soil: 4,
    market: 5,
    cover: 5,
    texture: { sandy: 3, clay: 4, silt: 5 },
    note: 'Midwest grain belt sequence with winter rye cover crop to prevent nutrient leaching and erosion.',
    biome: 'temperate',
    minTemp: 10,
    maxTemp: 30,
    optPhMin: 6.0,
    optPhMax: 7.2
  },
  {
    id: 104,
    name: 'Potato → Alfalfa → Winter Rye',
    crops: ['Potato', 'Alfalfa', 'Winter Rye'],
    water: 3,
    dry: 3,
    soil: 5,
    market: 4,
    cover: 4,
    texture: { sandy: 5, clay: 2, silt: 4 },
    note: 'Root crop sequence paired with perennial legume and hardy winter rye to break nematode cycles.',
    biome: 'temperate',
    minTemp: 5,
    maxTemp: 22,
    optPhMin: 5.0,
    optPhMax: 6.8
  },
  {
    id: 105,
    name: 'Sunflower → Field Pea → Spring Wheat',
    crops: ['Sunflower', 'Field Pea', 'Spring Wheat'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 4,
    cover: 3,
    texture: { sandy: 4, clay: 3, silt: 4 },
    note: 'Deep-root drought-tolerant oilseed and cool-season legume for continental semi-arid plains.',
    biome: 'temperate',
    minTemp: 8,
    maxTemp: 26,
    optPhMin: 6.0,
    optPhMax: 7.8
  },
  {
    id: 106,
    name: 'Canola → Lentil → Malting Barley',
    crops: ['Canola', 'Lentil', 'Malting Barley'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 5,
    cover: 3,
    texture: { sandy: 3, clay: 4, silt: 5 },
    note: 'Premium grain and pulse rotation designed for dryland continental prairies with short growing seasons.',
    biome: 'temperate',
    minTemp: 5,
    maxTemp: 25,
    optPhMin: 6.2,
    optPhMax: 7.8
  }
];

export const MEDITERRANEAN_ROTATIONS: CropRotation[] = [
  {
    id: 201,
    name: 'Durum Wheat → Chickpea → Safflower',
    crops: ['Durum Wheat', 'Chickpea', 'Safflower'],
    water: 2,
    dry: 5,
    soil: 4,
    market: 4,
    cover: 3,
    texture: { sandy: 3, clay: 5, silt: 4 },
    note: 'Mediterranean semi-arid staple: deep-rooted safflower scavenges subsoil moisture after chickpea pulse.',
    biome: 'mediterranean',
    minTemp: 14,
    maxTemp: 32,
    optPhMin: 6.5,
    optPhMax: 8.4
  },
  {
    id: 202,
    name: 'Barley → Faba Bean → Vetch Cover',
    crops: ['Barley', 'Faba Bean', 'Vetch Cover'],
    water: 2,
    dry: 4,
    soil: 5,
    market: 3,
    cover: 5,
    texture: { sandy: 3, clay: 4, silt: 4 },
    note: 'Cool-season Mediterranean forage and grain rotation; builds high biomass in calcareous soils.',
    biome: 'mediterranean',
    minTemp: 10,
    maxTemp: 28,
    optPhMin: 6.2,
    optPhMax: 8.2
  },
  {
    id: 203,
    name: 'Cotton → Cowpea → Winter Wheat',
    crops: ['Cotton', 'Cowpea', 'Winter Wheat'],
    water: 3,
    dry: 4,
    soil: 4,
    market: 5,
    cover: 4,
    texture: { sandy: 3, clay: 4, silt: 5 },
    note: 'Commercial fiber and cereal sequence with warm-season legume break for subtropical irrigated plains.',
    biome: 'mediterranean',
    minTemp: 16,
    maxTemp: 35,
    optPhMin: 5.8,
    optPhMax: 7.8
  },
  {
    id: 204,
    name: 'Chickpea → Sunflower → Barley',
    crops: ['Chickpea', 'Sunflower', 'Barley'],
    water: 2,
    dry: 5,
    soil: 4,
    market: 4,
    cover: 3,
    texture: { sandy: 4, clay: 4, silt: 4 },
    note: 'Drought-hardy rotation for regions with hot dry summers and mild winters (Spain, California, Aus).',
    biome: 'mediterranean',
    minTemp: 12,
    maxTemp: 34,
    optPhMin: 6.2,
    optPhMax: 8.2
  }
];

export const GLOBAL_ROTATIONS: CropRotation[] = [
  ...ROTATIONS,
  ...TEMPERATE_ROTATIONS,
  ...MEDITERRANEAN_ROTATIONS
];

/**
 * Dynamically selects candidate rotations based on geographic latitude and NASA 2-meter air temperature.
 */
export function getCatalogForClimate(latitude: number, meanTemp: number): CropRotation[] {
  const absLat = Math.abs(latitude);

  // Cold / High-Latitude or Cool Temperate (e.g. Siberia 67°N, Canada, Northern Europe, Northern US)
  if (absLat >= 45 || meanTemp < 17) {
    return [...TEMPERATE_ROTATIONS, ...ROTATIONS.filter(r => r.crops.includes('Maize'))];
  }

  // Mediterranean / Subtropical Transition Zone (e.g. California 37°N, Spain, North India, Southern Aus)
  if (absLat >= 26 && absLat < 45) {
    if (meanTemp < 22) {
      return [...MEDITERRANEAN_ROTATIONS, ...TEMPERATE_ROTATIONS.slice(0, 3)];
    }
    return [...MEDITERRANEAN_ROTATIONS, ...ROTATIONS.slice(0, 4)];
  }

  // Tropical & Semi-Arid Zone (e.g. Sri Lanka, South India, Kenya, Senegal, Brazil)
  return ROTATIONS;
}
