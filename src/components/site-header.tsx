import { Landmark } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="bg-card/80 sticky top-0 z-10 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Landmark className="size-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold leading-tight sm:text-base">
            Animal Type Classification (ATC)
          </span>
          <span className="text-muted-foreground truncate text-xs leading-tight">
            Rashtriya Gokul Mission · Ministry of Fisheries, Animal Husbandry &amp; Dairying
          </span>
        </div>
        <span className="bg-secondary text-secondary-foreground ml-auto hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:block">
          {'भारत सरकार'}
        </span>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-4xl flex-col items-center gap-1 px-4 py-6 text-center text-xs sm:px-6">
        <p>
          Smart India Hackathon 2025 · Problem Statement ID: SIH25005 — Image-based Animal Type
          Classification for cattle and buffaloes
        </p>
        <p>Prototype demonstration — AI classification powered by TensorFlow.js</p>
      </div>
    </footer>
  )
}
