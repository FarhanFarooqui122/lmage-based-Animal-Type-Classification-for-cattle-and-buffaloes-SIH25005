'use client'

import { cn } from '@/lib/utils'
import { Check, Upload, ScanSearch, Ruler, BarChart3 } from 'lucide-react'

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Classify', icon: ScanSearch },
  { label: 'Measure', icon: Ruler },
  { label: 'Results', icon: BarChart3 },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = i < current
          const active = i === current
          return (
            <li key={step.label} className="flex flex-1 items-center gap-1 last:flex-none sm:gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-primary bg-card text-primary shadow-md',
                    !done && !active && 'border-border bg-card text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium sm:text-sm',
                    active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    'mb-6 h-0.5 flex-1 rounded-full transition-colors duration-500',
                    done ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
