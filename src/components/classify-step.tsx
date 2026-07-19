'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ClassificationResult } from '@/lib/atc-data'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
    <div className="relative size-28 shrink-0" role="img" aria-label={`Confidence ${value} percent`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-out',
            value >= 80 ? 'stroke-success' : value >= 60 ? 'stroke-warning' : 'stroke-destructive',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{value}%</span>
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">confidence</span>
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
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Breed Classification</h2>
        <p className="text-muted-foreground leading-relaxed">
          {loading ? 'Analyzing the image with the AI breed-recognition model…' : 'AI model prediction based on the uploaded image'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt="Uploaded animal for classification"
            className="aspect-[4/3] w-full object-cover"
          />
          <p className="text-muted-foreground border-t px-4 py-2 text-xs">Uploaded image</p>
        </div>

        {loading || !result ? (
          <div className="bg-card flex flex-col gap-5 rounded-xl border p-6 shadow-sm" aria-busy="true" aria-live="polite">
            <span className="sr-only">Classifying image, please wait</span>
            <div className="flex items-center gap-5">
              <div className="bg-muted size-28 animate-pulse rounded-full" />
              <div className="flex flex-1 flex-col gap-3">
                <div className="bg-muted h-8 w-40 animate-pulse rounded-md" />
                <div className="bg-muted h-5 w-20 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-muted h-6 w-full animate-pulse rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-5">
              <ConfidenceRing value={result.top.confidence} />
              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-bold sm:text-4xl">{result.top.breed}</h3>
                <span
                  className={cn(
                    'w-fit rounded-full px-3 py-1 text-xs font-semibold',
                    result.top.category === 'Cattle'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-accent/20 text-accent-foreground',
                  )}
                >
                  {result.top.category}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Top 3 predictions
              </h4>
              {result.predictions.map((p) => (
                <div key={p.breed} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {p.breed}
                      <span className="text-muted-foreground ml-2 text-xs">({p.category})</span>
                    </span>
                    <span className={cn('font-semibold tabular-nums', confidenceText(p.confidence))}>
                      {p.confidence}%
                    </span>
                  </div>
                  <div
                    className="bg-muted h-2.5 overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={p.confidence} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`${p.breed} confidence`}
                  >
                    <div
                      className={cn('animate-grow-bar h-full rounded-full', confidenceColor(p.confidence))}
                      style={{ width: `${p.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto bg-transparent">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={loading || !result} className="w-full sm:w-auto">
          Proceed to Measurements
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
