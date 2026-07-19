'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Measurements } from '@/types'
import { getMeasurementRanges } from '@/lib/atc-scoring'
import { Ruler, Move, ArrowUp, Maximize, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MeasurementFormProps {
  breed: string
  onMeasurementsChange: (measurements: Measurements) => void
  disabled?: boolean
}

export default function MeasurementForm({
  breed,
  onMeasurementsChange,
  disabled
}: MeasurementFormProps) {
  const ranges = getMeasurementRanges(breed)

  const [measurements, setMeasurements] = useState<Measurements>({
    bodyLength: ranges?.bodyLength.default ?? 140,
    heightAtWithers: ranges?.heightAtWithers.default ?? 125,
    chestWidth: ranges?.chestWidth.default ?? 45,
    rumpAngle: ranges?.rumpAngle.default ?? 25,
  })

  useEffect(() => {
    if (ranges) {
      const defaults: Measurements = {
        bodyLength: ranges.bodyLength.default,
        heightAtWithers: ranges.heightAtWithers.default,
        chestWidth: ranges.chestWidth.default,
        rumpAngle: ranges.rumpAngle.default,
      }
      setMeasurements(defaults)
      onMeasurementsChange(defaults)
    }
  }, [breed])

  const update = (key: keyof Measurements, value: number) => {
    const updated = { ...measurements, [key]: value }
    setMeasurements(updated)
    onMeasurementsChange(updated)
  }

  if (!ranges) return null

  const sliders = [
    {
      key: 'bodyLength' as const,
      label: 'Body Length',
      unit: 'cm',
      icon: Move,
      min: ranges.bodyLength.min - 20,
      max: ranges.bodyLength.max + 20,
      ideal: ranges.bodyLength.default,
    },
    {
      key: 'heightAtWithers' as const,
      label: 'Height at Withers',
      unit: 'cm',
      icon: ArrowUp,
      min: ranges.heightAtWithers.min - 15,
      max: ranges.heightAtWithers.max + 15,
      ideal: ranges.heightAtWithers.default,
    },
    {
      key: 'chestWidth' as const,
      label: 'Chest Width',
      unit: 'cm',
      icon: Maximize,
      min: ranges.chestWidth.min - 10,
      max: ranges.chestWidth.max + 10,
      ideal: ranges.chestWidth.default,
    },
    {
      key: 'rumpAngle' as const,
      label: 'Rump Angle',
      unit: '°',
      icon: RotateCcw,
      min: ranges.rumpAngle.min,
      max: ranges.rumpAngle.max,
      ideal: ranges.rumpAngle.default,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Body Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sliders.map(({ key, label, unit, icon: Icon, min, max, ideal }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{measurements[key]}</span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>
            <Slider
              value={[measurements[key]]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val[0] : val
                update(key, v)
              }}
              min={min}
              max={max}
              step={1}
              disabled={disabled}
              className="mb-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}{unit}</span>
              <span>Ideal: {ideal}{unit}</span>
              <span>{max}{unit}</span>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            if (ranges) {
              const defaults: Measurements = {
                bodyLength: ranges.bodyLength.default,
                heightAtWithers: ranges.heightAtWithers.default,
                chestWidth: ranges.chestWidth.default,
                rumpAngle: ranges.rumpAngle.default,
              }
              setMeasurements(defaults)
              onMeasurementsChange(defaults)
            }
          }}
          disabled={disabled}
        >
          Reset to Breed Standard
        </Button>
      </CardContent>
    </Card>
  )
}
