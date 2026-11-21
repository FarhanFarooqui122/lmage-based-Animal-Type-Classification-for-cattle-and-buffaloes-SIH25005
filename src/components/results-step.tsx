'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { exportToExcel, TRAITS, type AnimalCategory, type AtcResult, type TraitScore } from '@/lib/atc-data'
import { FileSpreadsheet, RefreshCw } from 'lucide-react'

const STATUS_STYLES: Record<TraitScore['status'], { badge: string; bar: string }> = {
  Excellent: { badge: 'bg-success text-success-foreground', bar: 'bg-success' },
  Good: { badge: 'bg-chart-3 text-white', bar: 'bg-chart-3' },
  Average: { badge: 'bg-warning text-warning-foreground', bar: 'bg-warning' },
  Poor: { badge: 'bg-destructive text-white', bar: 'bg-destructive' },
}

interface ResultsStepProps {
  result: AtcResult
  breed: string
  category: AnimalCategory
  imageUrl: string
  onRestart: () => void
  classificationConfidence: number
}

const labelHiMap: Record<string, string> = {}
for (const t of TRAITS) {
  labelHiMap[t.label] = t.labelHi
}

export function ResultsStep({ result, breed, category, imageUrl, onRestart, classificationConfidence }: ResultsStepProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="kicker text-muted-foreground">Step 04 — Report</span>
        <h2 className="headline text-4xl text-balance sm:text-5xl">The score sheet.</h2>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Standardized type classification for the evaluated {category.toLowerCase()}.
        </p>
      </div>

      <div className="grid border-2 border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] sm:grid-cols-[220px_1fr]">
        <div className="border-foreground max-sm:border-b-2 sm:border-r-2">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={`Evaluated ${breed}`}
            className="aspect-[4/3] size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <span className="kicker text-muted-foreground">Overall ATC score</span>
          <div className="flex items-end gap-2">
            <span className="font-display text-7xl leading-none font-black tabular-nums sm:text-8xl">
              {result.overall}
            </span>
            <span className="text-muted-foreground mb-2 text-xl font-bold">/100</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-accent text-accent-foreground -rotate-2 border-2 border-foreground px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[3px_3px_0_0_var(--foreground)]">
              {result.grade} — {result.gradeLabel}
            </span>
            <span className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
              {breed} · {category}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.traits.map((t) => {
          const styles = STATUS_STYLES[t.status]
          return (
            <div
              key={t.key}
              className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_var(--foreground)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <h3 className="font-display text-lg leading-none font-black uppercase">{t.label}</h3>
                  <span className="text-muted-foreground mt-1 text-[0.7rem] font-semibold">{labelHiMap[t.label]}</span>
                  <p className="mt-2 text-[0.65rem] font-bold tracking-wide uppercase">
                    {t.measured}{t.unit}{' '}
                    <span className="text-muted-foreground">measured ·</span> {t.ideal}{t.unit}{' '}
                    <span className="text-muted-foreground">ideal</span>
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 border-2 border-foreground px-2 py-0.5 text-[0.6rem] font-bold tracking-widest uppercase',
                    styles.badge,
                  )}
                >
                  {t.status}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="bg-secondary h-4 flex-1 overflow-hidden border-2 border-foreground"
                  role="progressbar"
                  aria-valuenow={t.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${t.label} score`}
                >
                  <div
                    className={cn('animate-grow-bar h-full', styles.bar)}
                    style={{ width: `${t.score}%` }}
                  />
                </div>
                <span className="font-display w-12 text-right text-xl font-black tabular-nums">{t.score}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border-t-2 border-foreground pt-5 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => exportToExcel(result, breed, category, classificationConfidence)} className="w-full sm:w-auto">
          <FileSpreadsheet className="size-4" aria-hidden />
          Export to Excel (BPA format)
        </Button>
        <Button variant="outline" size="lg" onClick={onRestart} className="w-full sm:w-auto">
          <RefreshCw className="size-4" aria-hidden />
          New classification
        </Button>
      </div>
    </div>
  )
}
