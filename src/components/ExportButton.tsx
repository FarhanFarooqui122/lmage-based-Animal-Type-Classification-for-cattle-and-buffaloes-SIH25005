'use client'

import { Button } from '@/components/ui/button'
import { ATCScoreResult, Measurements } from '@/types'
import { generateATCExcel, downloadExcel } from '@/lib/excel-export'
import { FileSpreadsheet } from 'lucide-react'

interface ExportButtonProps {
  result: ATCScoreResult
  measurements: Measurements
  disabled?: boolean
}

export default function ExportButton({ result, measurements, disabled }: ExportButtonProps) {
  const handleExport = () => {
    const blob = generateATCExcel(result, measurements)
    downloadExcel(blob, `atc-${result.breed}-${Date.now()}.xlsx`)
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      className="w-full"
      variant="default"
    >
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Export ATC Report to Excel
    </Button>
  )
}
