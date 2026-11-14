/**
 * Crop Rotation Catalog
 * Coarse, editable prototype assumptions (1–5 scale) for Jaffna dry-zone agriculture.
 * In a production setting, traits are validated with local agronomists and farmers.
 */

export const ROTATIONS = [
  {
    id: 'groundnut-pulse-sesame',
    name: 'Groundnut → Green gram → Sesame',
    crops: ['Groundnut', 'Green gram', 'Sesame'],
    water: 2,
    dry: 4,
    soil: 4,
    market: 3,
    cover: 3,
    legume: 1,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Three crop families with two pulse phases; check seed, market, and sowing windows locally.'
  },
  {
    id: 'pearlmillet-cowpea-cover',
    name: 'Pearl millet → Cowpea → Cover crop',
    crops: ['Pearl millet', 'Cowpea', 'Cover crop'],
    water: 1,
    dry: 5,
    soil: 4,
    market: 2,
    cover: 5,
    legume: 1,
    texture: { sandy: 4, clay: 4, silt: 4 },
    note: 'A lower-water cereal and pulse concept that includes a soil-cover phase.'
  },
  {
    id: 'chilli-mungbean-sesame',
    name: 'Chilli → Mung bean → Sesame',
    crops: ['Chilli', 'Mung bean', 'Sesame'],
    water: 3,
    dry: 3,
    soil: 3,
    market: 4,
    cover: 2,
    legume: 1,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'A cash-crop sequence with a pulse break; irrigation and local buyers matter.'
  },
  {
    id: 'maize-cowpea-greenmanure',
    name: 'Maize → Cowpea → Green manure',
    crops: ['Maize', 'Cowpea', 'Green manure'],
    water: 3,
    dry: 3,
    soil: 5,
    market: 3,
    cover: 5,
    legume: 1,
    texture: { sandy: 3, clay: 4, silt: 4 },
    note: 'A cereal, pulse, and cover phase to explore for soil inputs and crop diversity.'
  },
  {
    id: 'groundnut-sorghum-sunnhemp',
    name: 'Groundnut → Sorghum → Sunn hemp',
    crops: ['Groundnut', 'Sorghum', 'Sunn hemp'],
    water: 2,
    dry: 4,
    soil: 5,
    market: 3,
    cover: 4,
    legume: 1,
    texture: { sandy: 5, clay: 3, silt: 4 },
    note: 'Alternates crop families and includes a green-manure phase; verify crop suitability locally.'
  },
  {
    id: 'rice-mungbean-sesbania',
    name: 'Rice → Mung bean → Sesbania',
    crops: ['Rice', 'Mung bean', 'Sesbania'],
    water: 5,
    dry: 2,
    soil: 4,
    market: 4,
    cover: 4,
    legume: 1,
    texture: { sandy: 2, clay: 4, silt: 4 },
    note: 'Keeps a rice option in the sequence; water control and field type are key constraints.'
  },
  {
    id: 'onion-greengram-chilli',
    name: 'Onion → Green gram → Chilli',
    crops: ['Onion', 'Green gram', 'Chilli'],
    water: 4,
    dry: 2,
    soil: 3,
    market: 5,
    cover: 2,
    legume: 1,
    texture: { sandy: 3, clay: 3, silt: 4 },
    note: 'Market-oriented concept with a pulse break; compare actual prices and irrigation needs.'
  },
  {
    id: 'sesame-mungbean-onion',
    name: 'Sesame → Mung bean → Onion',
    crops: ['Sesame', 'Mung bean', 'Onion'],
    water: 3,
    dry: 4,
    soil: 3,
    market: 4,
    cover: 2,
    legume: 1,
    texture: { sandy: 4, clay: 3, silt: 4 },
    note: 'Pairs a pulse with cash crops; local timing, soil, and buyer access need checking.'
  }
];

