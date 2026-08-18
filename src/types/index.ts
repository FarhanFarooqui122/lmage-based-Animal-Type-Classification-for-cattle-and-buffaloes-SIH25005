export interface BreedStandard {
  breed: string
  category: 'Cattle' | 'Buffalo'
  idealBodyLength: number
  idealHeightAtWithers: number
  idealChestWidth: number
  idealRumpAngle: number
  tolerancePercent: number
  description: string
}

export interface ClassificationResult {
  breed: string
  category: 'Cattle' | 'Buffalo'
  confidence: number
  topPredictions: Array<{ breed: string; confidence: number }>
  isReliable: boolean
}

export interface Measurements {
  bodyLength: number
  heightAtWithers: number
  chestWidth: number
  rumpAngle: number
}

export interface TraitScore {
  trait: string
  value: number
  score: number
  ideal: number
  status: 'excellent' | 'good' | 'average' | 'poor'
}

export interface ATCScoreResult {
  overallScore: number
  grade: string
  traits: TraitScore[]
  breed: string
  category: string
  classificationConfidence: number
}
