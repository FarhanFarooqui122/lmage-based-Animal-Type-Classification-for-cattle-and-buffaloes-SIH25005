import { BreedStandard } from '@/types'

export const breedStandards: Record<string, BreedStandard> = {
  // Cattle Breeds
  'Gir': {
    breed: 'Gir', category: 'Cattle',
    idealBodyLength: 155, idealHeightAtWithers: 135, idealChestWidth: 48, idealRumpAngle: 25,
    tolerancePercent: 10,
    description: 'Originating from Gir forest of Gujarat. Known for high milk yield and disease resistance.'
  },
  'Sahiwal': {
    breed: 'Sahiwal', category: 'Cattle',
    idealBodyLength: 140, idealHeightAtWithers: 125, idealChestWidth: 45, idealRumpAngle: 24,
    tolerancePercent: 10,
    description: 'One of the best dairy breeds from Punjab. Excellent heat tolerance.'
  },
  'Tharparkar': {
    breed: 'Tharparkar', category: 'Cattle',
    idealBodyLength: 135, idealHeightAtWithers: 120, idealChestWidth: 43, idealRumpAngle: 23,
    tolerancePercent: 10,
    description: 'Dual-purpose breed from Rajasthan. Known for drought resistance.'
  },
  'Red Sindhi': {
    breed: 'Red Sindhi', category: 'Cattle',
    idealBodyLength: 130, idealHeightAtWithers: 118, idealChestWidth: 42, idealRumpAngle: 24,
    tolerancePercent: 10,
    description: 'Popular dairy breed from Sindh region. Adapts well to tropical climate.'
  },
  'Ongole': {
    breed: 'Ongole', category: 'Cattle',
    idealBodyLength: 160, idealHeightAtWithers: 145, idealChestWidth: 50, idealRumpAngle: 26,
    tolerancePercent: 10,
    description: 'Magnificent draught breed from Andhra Pradesh. Known for massive size.'
  },
  'Kankrej': {
    breed: 'Kankrej', category: 'Cattle',
    idealBodyLength: 150, idealHeightAtWithers: 140, idealChestWidth: 47, idealRumpAngle: 25,
    tolerancePercent: 10,
    description: 'Dual-purpose breed from Gujarat. Known for its majestic appearance.'
  },
  'Hariana': {
    breed: 'Hariana', category: 'Cattle',
    idealBodyLength: 145, idealHeightAtWithers: 130, idealChestWidth: 44, idealRumpAngle: 24,
    tolerancePercent: 10,
    description: 'Dual-purpose breed from Haryana. Good for both milk and draught.'
  },
  'Rathi': {
    breed: 'Rathi', category: 'Cattle',
    idealBodyLength: 125, idealHeightAtWithers: 115, idealChestWidth: 40, idealRumpAngle: 23,
    tolerancePercent: 10,
    description: 'Dairy breed from Rajasthan. Known for its hardiness in arid regions.'
  },
  'Khillari': {
    breed: 'Khillari', category: 'Cattle',
    idealBodyLength: 140, idealHeightAtWithers: 132, idealChestWidth: 42, idealRumpAngle: 25,
    tolerancePercent: 10,
    description: 'Draught breed from Maharashtra. Known for speed and endurance.'
  },
  'Deoni': {
    breed: 'Deoni', category: 'Cattle',
    idealBodyLength: 135, idealHeightAtWithers: 125, idealChestWidth: 43, idealRumpAngle: 24,
    tolerancePercent: 10,
    description: 'Dual-purpose breed from Maharashtra and Karnataka.'
  },
  // Buffalo Breeds
  'Murrah': {
    breed: 'Murrah', category: 'Buffalo',
    idealBodyLength: 150, idealHeightAtWithers: 135, idealChestWidth: 52, idealRumpAngle: 28,
    tolerancePercent: 10,
    description: 'Premier dairy buffalo breed from Haryana. World\'s best milk producer among buffaloes.'
  },
  'Surti': {
    breed: 'Surti', category: 'Buffalo',
    idealBodyLength: 140, idealHeightAtWithers: 128, idealChestWidth: 48, idealRumpAngle: 27,
    tolerancePercent: 10,
    description: 'Dairy buffalo breed from Gujarat. Known for high butterfat content.'
  },
  'Banni': {
    breed: 'Banni', category: 'Buffalo',
    idealBodyLength: 145, idealHeightAtWithers: 132, idealChestWidth: 50, idealRumpAngle: 28,
    tolerancePercent: 10,
    description: 'Superior dairy breed from Kutch, Gujarat. High milk yield in harsh conditions.'
  },
  'Jaffarabadi': {
    breed: 'Jaffarabadi', category: 'Buffalo',
    idealBodyLength: 155, idealHeightAtWithers: 140, idealChestWidth: 55, idealRumpAngle: 29,
    tolerancePercent: 10,
    description: 'Massive buffalo breed from Gujarat. Known for enormous size and strength.'
  },
  'Bhadawari': {
    breed: 'Bhadawari', category: 'Buffalo',
    idealBodyLength: 130, idealHeightAtWithers: 120, idealChestWidth: 44, idealRumpAngle: 26,
    tolerancePercent: 10,
    description: 'Dual-purpose breed from Uttar Pradesh. Known for high butterfat (up to 13%).'
  },
  'Mehsana': {
    breed: 'Mehsana', category: 'Buffalo',
    idealBodyLength: 142, idealHeightAtWithers: 130, idealChestWidth: 49, idealRumpAngle: 27,
    tolerancePercent: 10,
    description: 'Dairy buffalo breed from North Gujarat. Good milk yield.'
  },
  'Nagpuri': {
    breed: 'Nagpuri', category: 'Buffalo',
    idealBodyLength: 138, idealHeightAtWithers: 125, idealChestWidth: 46, idealRumpAngle: 26,
    tolerancePercent: 10,
    description: 'Draught and dairy breed from Maharashtra.'
  },
  'Pandharpuri': {
    breed: 'Pandharpuri', category: 'Buffalo',
    idealBodyLength: 148, idealHeightAtWithers: 134, idealChestWidth: 51, idealRumpAngle: 28,
    tolerancePercent: 10,
    description: 'Dairy buffalo breed from Maharashtra. Known for long lactation period.'
  },
}

export function getBreedsByCategory(category: 'Cattle' | 'Buffalo'): BreedStandard[] {
  return Object.values(breedStandards).filter(b => b.category === category)
}

export function getBreed(breedName: string): BreedStandard | undefined {
  return breedStandards[breedName]
}

export const mockBreedPredictions = [
  { breed: 'Gir', confidence: 92 },
  { breed: 'Kankrej', confidence: 4 },
  { breed: 'Sahiwal', confidence: 2 },
  { breed: 'Tharparkar', confidence: 1 },
  { breed: 'Red Sindhi', confidence: 1 },
]
