'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ClassificationResult } from '@/lib/atc-data'
import { getBreedCategory } from '@/lib/atc-data'
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react'

function confidenceColor(c: number) {
  if (c >= 80) return 'bg-success'
  if (c >= 60) return 'bg-warning'
  return 'bg-destructive'
}

function confidenceText(c: number) {
  if (c >= 80) return 'text-success'
  if (c >= 60) return 'text-warning-foreground'
  return 'text-destructive'
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 42
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - value / 100)
  return (
    <div
      className="relative size-28 shrink-0 border-2 border-foreground bg-card shadow-[3px_3px_0_0_var(--foreground)]"
      role="img"
      aria-label={`Confidence ${value} percent`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-secondary" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-out',
            value >= 80 ? 'stroke-success' : value >= 60 ? 'stroke-warning' : 'stroke-destructive',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none font-black tabular-nums">{value}<span className="text-sm">%</span></span>
        <span className="mt-1 text-[0.55rem] font-bold tracking-widest uppercase">confidence</span>
      </div>
    </div>
  )
}

interface ClassifyStepProps {
  loading: boolean
  imageUrl: string
  result: ClassificationResult | null
  onBack: () => void
  onNext: () => void
}

export function ClassifyStep({ loading, imageUrl, result, onBack, onNext }: ClassifyStepProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="kicker text-muted-foreground">Step 02 — Breed match</span>
        <h2 className="headline text-4xl text-balance sm:text-5xl">
          {loading ? 'Reading the photo…' : 'The model has a call.'}
        </h2>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          {loading
            ? 'Running the on-device classifier — this usually takes a few seconds.'
            : 'Top prediction, confidence and the two runners-up, all from the same image.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        <div className="border-2 border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] max-md:max-w-sm">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt="Uploaded animal for classification"
            className="aspect-[4/3] w-full border-b-2 border-foreground object-cover"
          />
          <p className="bg-foreground text-background kicker px-3 py-2">Uploaded image</p>
        </div>

        {loading || !result ? (
          <div
            className="border-2 border-foreground bg-card p-6 shadow-[5px_5px_0_0_var(--foreground)]"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">Classifying image, please wait</span>
            <div className="flex items-center gap-5">
              <div className="bg-secondary size-28 animate-pulse border-2 border-foreground" />
              <div className="flex flex-1 flex-col gap-3">
                <div className="bg-secondary h-9 w-40 animate-pulse border-2 border-foreground" />
                <div className="bg-secondary h-6 w-24 animate-pulse border-2 border-foreground" />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-secondary h-7 w-full animate-pulse border-2 border-foreground" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {!result.isReliable && (
              <div
                role="alert"
                className="bg-warning text-warning-foreground flex items-start gap-3 border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--foreground)]"
              >
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="text-sm leading-relaxed">
                  <p className="font-display font-black uppercase">Low confidence — verify manually</p>
                  <p className="mt-1">
                    The model is unsure this animal matches any of the 8 supported breeds. The breed
                    below is a best guess; check it before relying on the ATC score.
                  </p>
                </div>
              </div>
            )}

            <div className="border-2 border-foreground bg-card p-5 shadow-[5px_5px_0_0_var(--foreground)] sm:p-6">
              <div className="flex flex-wrap items-center gap-5">
                <ConfidenceRing value={result.confidence} />
                <div className="flex flex-col gap-2">
                  <span className="kicker text-muted-foreground">Predicted breed</span>
                  <h3 className="font-display text-4xl leading-none font-black uppercase sm:text-5xl">
                    {result.breed}
                  </h3>
                  <span
                    className={cn(
                      'w-fit border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold tracking-widest uppercase',
                      result.category === 'Cattle'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-accent text-accent-foreground',
                    )}
                  >
                    {result.category}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t-2 border-foreground pt-5">
                <h4 className="kicker text-muted-foreground">Top 3 predictions</h4>
                {result.topPredictions.map((p) => (
                  <div key={p.breed} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-bold uppercase tracking-wide">
                        {p.breed}
                        <span className="text-muted-foreground ml-2 text-[0.65rem] font-semibold tracking-widest">
                          {getBreedCategory(p.breed)}
                        </span>
                      </span>
                      <span className={cn('font-display text-base font-black tabular-nums', confidenceText(p.confidence))}>
                        {p.confidence}%
                      </span>
                    </div>
                    <div
                      className="h-4 overflow-hidden border-2 border-foreground bg-secondary"
                      role="progressbar"
                      aria-valuenow={p.confidence}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${p.breed} confidence`}
                    >
                      <div
                        className={cn('animate-grow-bar h-full', confidenceColor(p.confidence))}
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t-2 border-foreground pt-5 sm:flex-row sm:justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="size-4" aria-hidden />
          Start over
        </Button>
        <Button size="lg" onClick={onNext} disabled={loading || !result} className="w-full sm:w-auto">
          Proceed to measurements
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
