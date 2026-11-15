/**
 * Crop Rotation Catalog
 * Coarse, editable prototype assumptions (1–5 scale) for Jaffna dry-zone agriculture.
 * In a production setting, traits are validated with local agronomists and farmers.
 */

import { CropRotation } from '../types/index.js';

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
    note: 'Three crop families with two pulse phases; check seed, market, and sowing windows locally.'
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
    note: 'A lower-water cereal and pulse concept that includes a soil-cover phase.'
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
    note: 'A cash-crop sequence with a pulse break; irrigation and local buyers matter.'
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
    note: 'A cereal, pulse, and cover phase to explore for soil inputs and crop diversity.'
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
    note: 'Alternates crop families and includes a green-manure phase; verify crop suitability locally.'
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
    note: 'Keeps a rice option in the sequence; water control and field type are key constraints.'
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
    note: 'Market-oriented concept with a pulse break; compare actual prices and irrigation needs.'
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
    note: 'Blends cash return and an edible oil seed with a short pulse window.'
  }
];
