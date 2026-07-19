import { ATCScoreResult, BreedStandard, Measurements, TraitScore } from '@/types'
import { getBreed } from './breed-standards'

function computeTraitScore(
  measured: number,
  ideal: number,
  tolerancePercent: number,
  trait: string
): TraitScore {
  const maxDeviation = ideal * (tolerancePercent / 100)
  const deviation = Math.abs(measured - ideal)
  const rawScore = Math.max(0, 100 - (deviation / maxDeviation) * 100)
  const score = Math.round(Math.min(100, rawScore))

  let status: TraitScore['status'] = 'poor'
  if (score >= 85) status = 'excellent'
  else if (score >= 70) status = 'good'
  else if (score >= 50) status = 'average'

  return {
    trait,
    value: measured,
    score,
    ideal,
    status,
  }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+ (Excellent)'
  if (score >= 80) return 'A (Very Good)'
  if (score >= 70) return 'B+ (Good)'
  if (score >= 60) return 'B (Fair)'
  if (score >= 50) return 'C (Average)'
  return 'D (Poor)'
}

export function calculateATCScore(
  breedName: string,
  measurements: Measurements,
  classificationConfidence: number
): ATCScoreResult | null {
  const standard = getBreed(breedName)
  if (!standard) return null

  const traits: TraitScore[] = [
    computeTraitScore(
      measurements.bodyLength, standard.idealBodyLength,
      standard.tolerancePercent, 'Body Length'
    ),
    computeTraitScore(
      measurements.heightAtWithers, standard.idealHeightAtWithers,
      standard.tolerancePercent, 'Height at Withers'
    ),
    computeTraitScore(
      measurements.chestWidth, standard.idealChestWidth,
      standard.tolerancePercent, 'Chest Width'
    ),
    computeTraitScore(
      measurements.rumpAngle, standard.idealRumpAngle,
      standard.tolerancePercent, 'Rump Angle'
    ),
  ]

  const weights = [0.30, 0.25, 0.25, 0.20]
  const overallScore = Math.round(
    traits.reduce((sum, t, i) => sum + t.score * weights[i], 0)
  )

  return {
    overallScore,
    grade: getGrade(overallScore),
    traits,
    breed: breedName,
    category: standard.category,
    classificationConfidence,
  }
}

export function getMeasurementRanges(breedName: string) {
  const standard = getBreed(breedName)
  if (!standard) return null

  const tolerance = standard.tolerancePercent / 100
  return {
    bodyLength: {
      min: Math.round(standard.idealBodyLength * (1 - tolerance)),
      max: Math.round(standard.idealBodyLength * (1 + tolerance)),
      default: standard.idealBodyLength,
    },
    heightAtWithers: {
      min: Math.round(standard.idealHeightAtWithers * (1 - tolerance)),
      max: Math.round(standard.idealHeightAtWithers * (1 + tolerance)),
      default: standard.idealHeightAtWithers,
    },
    chestWidth: {
      min: Math.round(standard.idealChestWidth * (1 - tolerance)),
      max: Math.round(standard.idealChestWidth * (1 + tolerance)),
      default: standard.idealChestWidth,
    },
    rumpAngle: {
      min: 15,
      max: 40,
      default: standard.idealRumpAngle,
    },
  }
}
