import { Landmark } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-20 border-b-2 border-foreground">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="bg-foreground text-background flex size-11 shrink-0 items-center justify-center border-2 border-foreground shadow-[3px_3px_0_0_var(--accent)]">
          <Landmark className="size-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="kicker text-muted-foreground hidden truncate sm:block">
            Rashtriya Gokul Mission / SIH25005
          </span>
          <span className="font-display truncate text-base leading-none font-black tracking-tight uppercase sm:text-lg">
            Animal Type Classification
          </span>
        </div>
        <span className="bg-accent text-accent-foreground ml-auto hidden shrink-0 border-2 border-foreground px-3 py-1.5 text-xs font-bold tracking-widest uppercase shadow-[3px_3px_0_0_var(--foreground)] sm:block">
          {'भारत सरकार'}
        </span>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background border-t-2 border-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1">
          <span className="kicker opacity-60">Smart India Hackathon 2025</span>
          <p className="font-display max-w-md text-sm leading-snug font-black uppercase">
            Problem SIH25005 — Image-based Animal Type Classification for cattle &amp; buffaloes
          </p>
        </div>
        <p className="text-xs leading-relaxed opacity-70 sm:max-w-xs sm:text-right">
          Prototype demonstration · AI classification powered by TensorFlow.js
        </p>
      </div>
    </footer>
  )
}
