'use client'

import { cn } from '@/lib/utils'
import { Check, Upload, ScanSearch, Ruler, BarChart3 } from 'lucide-react'

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Classify', icon: ScanSearch },
  { label: 'Measure', icon: Ruler },
  { label: 'Results', icon: BarChart3 },
]

const NUMERALS = ['01', '02', '03', '04']

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = i < current
          const active = i === current
          return (
            <li key={step.label}>
              <div
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex h-full items-center gap-2 border-2 border-foreground px-2 py-2.5 transition-all duration-200 sm:px-3',
                  active && 'bg-accent text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)]',
                  done && 'bg-primary text-primary-foreground',
                  !done && !active && 'bg-card text-muted-foreground',
                )}
              >
                <span className="font-display text-sm font-black tabular-nums sm:text-base">
                  {NUMERALS[i]}
                </span>
                <span className="hidden min-w-0 truncate text-[0.65rem] font-bold tracking-widest uppercase sm:inline">
                  {step.label}
                </span>
                <span className="sr-only sm:hidden">{step.label}</span>
                <span className="ml-auto shrink-0">
                  {done ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Icon className="size-4" aria-hidden />
                  )}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:gap-3" aria-hidden>
        {STEPS.map((step, i) => (
          <span
            key={step.label}
            className={cn(
              'h-1.5 border border-foreground',
              i <= current ? 'bg-foreground' : 'bg-background',
            )}
          />
        ))}
      </div>
    </nav>
  )
}
