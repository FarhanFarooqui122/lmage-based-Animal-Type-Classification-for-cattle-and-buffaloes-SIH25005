'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { exportToExcel, TRAITS, type AnimalCategory, type AtcResult, type TraitScore } from '@/lib/atc-data'
import { FileSpreadsheet, RefreshCw } from 'lucide-react'

const STATUS_STYLES: Record<TraitScore['status'], { badge: string; bar: string }> = {
  Excellent: { badge: 'bg-success/15 text-success', bar: 'bg-success' },
  Good: { badge: 'bg-chart-3/15 text-chart-3', bar: 'bg-chart-3' },
  Average: { badge: 'bg-warning/25 text-warning-foreground', bar: 'bg-warning' },
  Poor: { badge: 'bg-destructive/15 text-destructive', bar: 'bg-destructive' },
}

interface ResultsStepProps {
  result: AtcResult
  breed: string
  category: AnimalCategory
  imageUrl: string
  onRestart: () => void
}

const labelHiMap: Record<string, string> = {}
for (const t of TRAITS) {
  labelHiMap[t.label] = t.labelHi
}

export function ResultsStep({ result, breed, category, imageUrl, onRestart }: ResultsStepProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">ATC Score Report</h2>
        <p className="text-muted-foreground leading-relaxed">
          Standardized type classification for the evaluated {category.toLowerCase()}
        </p>
      </div>

      <div className="bg-card flex flex-col items-center gap-6 rounded-xl border p-6 shadow-sm sm:flex-row sm:p-8">
        <div className="overflow-hidden rounded-lg border max-sm:w-full sm:size-36 sm:shrink-0">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={`Evaluated ${breed}`}
            className="size-full object-cover max-sm:aspect-[4/3]"
          />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Overall ATC Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-primary text-6xl font-bold tabular-nums sm:text-7xl">{result.overall}</span>
            <span className="text-muted-foreground text-2xl font-semibold">/100</span>
          </div>
          <span className="bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-bold">
            {result.grade} — {result.gradeLabel}
          </span>
          <span className="text-muted-foreground text-sm">{breed} ({category})</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.traits.map((t) => {
          const styles = STATUS_STYLES[t.status]
          return (
            <div key={t.key} className="bg-card flex flex-col gap-3 rounded-xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <h3 className="font-semibold">{t.label}</h3>
                  <span className="text-muted-foreground/60 text-xs">{labelHiMap[t.label]}</span>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {t.measured}{t.unit} measured · {t.ideal}{t.unit} ideal
                  </p>
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', styles.badge)}>
                  {t.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={t.score} aria-valuemin={0} aria-valuemax={100}
                  aria-label={`${t.label} score`}
                >
                  <div
                    className={cn('animate-grow-bar h-full rounded-full', styles.bar)}
                    style={{ width: `${t.score}%` }}
                  />
                </div>
                <span className="w-12 text-right text-lg font-bold tabular-nums">{t.score}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => exportToExcel(result, breed, category)} className="w-full sm:w-auto">
          <FileSpreadsheet className="size-4" aria-hidden />
          Export to Excel (BPA format)
        </Button>
        <Button variant="outline" size="lg" onClick={onRestart} className="w-full sm:w-auto bg-transparent">
          <RefreshCw className="size-4" aria-hidden />
          New Classification
        </Button>
      </div>
    </div>
  )
}
