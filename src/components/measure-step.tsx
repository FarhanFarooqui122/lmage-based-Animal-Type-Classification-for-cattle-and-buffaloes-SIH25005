'use client'

import { Button } from '@/components/ui/button'
import { TRAITS, BREED_STANDARDS, type Measurements, type TraitKey } from '@/lib/atc-data'
import { AlertTriangle, ArrowLeft, Calculator, Info, MoveHorizontal, MoveVertical, Ruler, RotateCcw, TriangleRight } from 'lucide-react'

const TRAIT_ICONS: Record<TraitKey, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  bodyLength: Ruler,
  heightAtWithers: MoveVertical,
  chestWidth: MoveHorizontal,
  rumpAngle: TriangleRight,
}

interface MeasureStepProps {
  breed: string
  imageUrl: string
  isReliable: boolean
  measurements: Measurements
  onChange: (key: TraitKey, value: number) => void
  onReset: () => void
  onBack: () => void
  onCalculate: () => void
}

export function MeasureStep({ breed, imageUrl, isReliable, measurements, onChange, onReset, onBack, onCalculate }: MeasureStepProps) {
  const standard = BREED_STANDARDS[breed]

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Body Measurements</h2>
        <p className="text-muted-foreground leading-relaxed text-pretty">
          Enter the four standardized measurements for the classified <strong>{breed}</strong>.
          Ideal values shown are the breed standard reference.
        </p>
      </div>

      {!isReliable && (
        <div
          role="alert"
          className="bg-warning/15 border-warning/40 text-warning-foreground flex items-start gap-3 rounded-lg border p-4"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">
            The breed classification had low confidence. The <strong>{breed}</strong> standard is
            being applied, but the ATC score should be treated with caution.
          </p>
        </div>
      )}

      <div className="bg-secondary/60 border-primary/20 flex items-start gap-3 rounded-lg border p-4">
        <Info className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
        <p className="text-secondary-foreground text-sm leading-relaxed">
          Measure the animal while it stands squarely on level ground. Use a measuring tape for
          lengths and a protractor or inclinometer for the rump angle, following the standard BPA
          field protocol. {'माप लेते समय पशु समतल भूमि पर सीधा खड़ा होना चाहिए।'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="bg-card h-fit overflow-hidden rounded-xl border shadow-sm max-lg:hidden">
          <img src={imageUrl || '/placeholder.svg'} alt={`Classified ${breed}`} className="aspect-[4/3] w-full object-cover" />
          <p className="text-muted-foreground border-t px-4 py-2 text-xs">{breed} — under evaluation</p>
        </div>

        <div className="flex flex-col gap-4">
          {TRAITS.map((t) => {
            const Icon = TRAIT_ICONS[t.key]
            const value = measurements[t.key]
            const ideal = standard ? standard[t.key] : t.ideal
            const id = `slider-${t.key}`
            return (
              <div key={t.key} className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={id} className="flex items-center gap-2 font-semibold">
                    <span className="bg-secondary text-primary flex size-8 items-center justify-center rounded-md">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span>
                        {t.label}
                        <span className="text-muted-foreground ml-1 text-xs font-normal">({t.unit})</span>
                      </span>
                      <span className="text-muted-foreground/60 text-xs font-normal">{t.labelHi}</span>
                    </span>
                  </label>
                  <span className="text-primary text-xl font-bold tabular-nums">
                    {value}
                    <span className="text-muted-foreground ml-0.5 text-sm font-medium">{t.unit}</span>
                  </span>
                </div>
                <input
                  id={id}
                  type="range"
                  className="atc-slider"
                  min={t.min}
                  max={t.max}
                  step={1}
                  value={value}
                  onChange={(e) => onChange(t.key, Number(e.target.value))}
                  aria-describedby={`${id}-hint`}
                />
                <div id={`${id}-hint`} className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className="tabular-nums">{t.min}{t.unit}</span>
                  <span>
                    Ideal: <strong className="text-foreground tabular-nums">{ideal}{t.unit}</strong>
                  </span>
                  <span className="tabular-nums">{t.max}{t.unit}</span>
                </div>
              </div>
            )
          })}

          <Button variant="outline" onClick={onReset} className="w-full sm:w-fit bg-transparent">
            <RotateCcw className="size-4" aria-hidden />
            Reset to Breed Standard
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto bg-transparent">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
        <Button size="lg" onClick={onCalculate} className="w-full sm:w-auto">
          <Calculator className="size-4" aria-hidden />
          Calculate ATC Score
        </Button>
      </div>
    </div>
  )
}
