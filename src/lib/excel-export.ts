import * as XLSX from 'xlsx'
import { ATCScoreResult, Measurements } from '@/types'

interface ExportData {
  timestamp: string
  breed: string
  category: string
  classificationConfidence: number
  bodyLength: number
  bodyLengthScore: number
  heightAtWithers: number
  heightAtWithersScore: number
  chestWidth: number
  chestWidthScore: number
  rumpAngle: number
  rumpAngleScore: number
  overallScore: number
  grade: string
}

export function generateATCExcel(
  result: ATCScoreResult,
  measurements: Measurements,
  animalId?: string
): Blob {
  const now = new Date()
  const row: ExportData = {
    timestamp: now.toISOString(),
    breed: result.breed,
    category: result.category,
    classificationConfidence: result.classificationConfidence,
    bodyLength: measurements.bodyLength,
    bodyLengthScore: result.traits[0].score,
    heightAtWithers: measurements.heightAtWithers,
    heightAtWithersScore: result.traits[1].score,
    chestWidth: measurements.chestWidth,
    chestWidthScore: result.traits[2].score,
    rumpAngle: measurements.rumpAngle,
    rumpAngleScore: result.traits[3].score,
    overallScore: result.overallScore,
    grade: result.grade,
  }

  const wb = XLSX.utils.book_new()

  const wsData: (string | number)[][] = [
    ['Bharat Pashudhan App - ATC Report'],
    ['Generated', now.toLocaleString('en-IN')],
    [],
    ['Animal ID', animalId || 'N/A'],
    ['Breed', row.breed],
    ['Category', row.category],
    ['Classification Confidence', `${row.classificationConfidence}%`],
    [],
    ['Trait', 'Measured Value', 'Ideal Value', 'Score (0-100)', 'Status'],
    [
      'Body Length (cm)',
      row.bodyLength,
      result.traits[0].ideal,
      row.bodyLengthScore,
      result.traits[0].status,
    ],
    [
      'Height at Withers (cm)',
      row.heightAtWithers,
      result.traits[1].ideal,
      row.heightAtWithersScore,
      result.traits[1].status,
    ],
    [
      'Chest Width (cm)',
      row.chestWidth,
      result.traits[2].ideal,
      row.chestWidthScore,
      result.traits[2].status,
    ],
    [
      'Rump Angle (deg)',
      row.rumpAngle,
      result.traits[3].ideal,
      row.rumpAngleScore,
      result.traits[3].status,
    ],
    [],
    ['Overall ATC Score', row.overallScore],
    ['Grade', row.grade],
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'ATC Report')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([wbout], { type: 'application/octet-stream' })
}

export function downloadExcel(blob: Blob, filename?: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `atc-report-${Date.now()}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
