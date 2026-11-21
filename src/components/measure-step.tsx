'use client'

import { Button } from '@/components/ui/button'
import { TRAITS, BREED_STANDARDS, getBreedCategory, type Measurements, type TraitKey } from '@/lib/atc-data'
import { AlertTriangle, ArrowLeft, Calculator, Info, MoveHorizontal, MoveVertical, RotateCcw, Ruler, Tags, TriangleRight } from 'lucide-react'

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
  onBreedChange: (breed: string) => void
  onReset: () => void
  onBack: () => void
  onCalculate: () => void
}

export function MeasureStep({ breed, imageUrl, isReliable, measurements, onChange, onBreedChange, onReset, onBack, onCalculate }: MeasureStepProps) {
  const standard = BREED_STANDARDS[breed]
  const allBreeds = Object.keys(BREED_STANDARDS)
  const cattleBreeds = allBreeds.filter((b) => getBreedCategory(b) === 'Cattle')
  const buffaloBreeds = allBreeds.filter((b) => getBreedCategory(b) === 'Buffalo')

  return (
    <div className="animate-fade-up flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="kicker text-muted-foreground">Step 03 — Body data</span>
        <h2 className="headline text-4xl text-balance sm:text-5xl">Four numbers. One score.</h2>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty">
          Enter the four standardized measurements for the classified{' '}
          <strong className="text-foreground">{breed}</strong>. The ideal column is the breed
          standard reference.
        </p>
      </div>

      {!isReliable && (
        <div
          role="alert"
          className="bg-warning text-warning-foreground flex items-start gap-3 border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--foreground)]"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">
            The breed classification had low confidence. The <strong>{breed}</strong> standard is
            being applied, but the ATC score should be treated with caution.
          </p>
        </div>
      )}

      <div className="bg-accent text-accent-foreground flex items-start gap-3 border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--foreground)]">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="text-sm leading-relaxed">
          <p className="font-display font-black uppercase">Field protocol</p>
          <p className="mt-1">
            Measure the animal while it stands squarely on level ground. Use a measuring tape for
            lengths and a protractor or inclinometer for the rump angle, following the standard BPA
            protocol. {'माप लेते समय पशु समतल भूमि पर सीधा खड़ा होना चाहिए।'}
          </p>
        </div>
      </div>

      <div className="border-2 border-foreground bg-card p-4 shadow-[4px_4px_0_0_var(--foreground)] sm:p-5">
        <label htmlFor="breed-select" className="flex items-center gap-3">
          <span className="bg-foreground text-background flex size-9 items-center justify-center border-2 border-foreground">
            <Tags className="size-4" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-sm font-black uppercase">Breed standard</span>
            <span className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
              Override the AI prediction if the breed was misidentified
            </span>
          </span>
        </label>
        <select
          id="breed-select"
          value={breed}
          onChange={(e) => onBreedChange(e.target.value)}
          className="bg-card text-foreground mt-3 h-12 w-full border-2 border-foreground px-3 text-sm font-bold tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <optgroup label="Cattle">
            {cattleBreeds.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </optgroup>
          <optgroup label="Buffalo">
            {buffaloBreeds.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
        <div className="border-2 border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] max-lg:hidden">
          <img src={imageUrl || '/placeholder.svg'} alt={`Classified ${breed}`} className="aspect-[4/3] w-full border-b-2 border-foreground object-cover" />
          <p className="bg-foreground text-background kicker px-3 py-2">{breed} — under evaluation</p>
        </div>

        <div className="flex flex-col gap-4">
          {TRAITS.map((t) => {
            const Icon = TRAIT_ICONS[t.key]
            const value = measurements[t.key]
            const ideal = standard ? standard[t.key] : t.ideal
            const id = `slider-${t.key}`
            return (
              <div
                key={t.key}
                className="border-2 border-foreground bg-card p-4 shadow-[4px_4px_0_0_var(--foreground)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor={id} className="flex items-center gap-3">
                    <span className="bg-secondary flex size-9 shrink-0 items-center justify-center border-2 border-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-display text-base leading-none font-black uppercase">
                        {t.label}
                        <span className="text-muted-foreground ml-1.5 text-[0.65rem] font-bold tracking-widest">
                          {t.unit}
                        </span>
                      </span>
                      <span className="text-muted-foreground mt-1 text-[0.7rem] font-semibold">
                        {t.labelHi}
                      </span>
                    </span>
                  </label>
                  <span className="font-display text-3xl leading-none font-black tabular-nums">
                    {value}
                    <span className="text-muted-foreground ml-1 text-xs font-bold">{t.unit}</span>
                  </span>
                </div>
                <input
                  id={id}
                  type="range"
                  className="atc-slider mt-4"
                  min={t.min}
                  max={t.max}
                  step={1}
                  value={value}
                  onChange={(e) => onChange(t.key, Number(e.target.value))}
                  aria-describedby={`${id}-hint`}
                />
                <div
                  id={`${id}-hint`}
                  className="text-muted-foreground mt-3 flex items-center justify-between text-[0.65rem] font-bold tracking-widest uppercase"
                >
                  <span className="tabular-nums">{t.min}{t.unit}</span>
                  <span className="border-2 border-foreground bg-accent text-accent-foreground px-2 py-0.5">
                    Ideal {ideal}{t.unit}
                  </span>
                  <span className="tabular-nums">{t.max}{t.unit}</span>
                </div>
              </div>
            )
          })}

          <Button variant="outline" onClick={onReset} className="w-full sm:w-fit">
            <RotateCcw className="size-4" aria-hidden />
            Reset to breed standard
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t-2 border-foreground pt-5 sm:flex-row sm:justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
        <Button size="lg" onClick={onCalculate} className="w-full sm:w-auto">
          <Calculator className="size-4" aria-hidden />
          Calculate ATC score
        </Button>
      </div>
    </div>
  )
}
