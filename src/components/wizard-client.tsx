'use client'

import dynamic from 'next/dynamic'

const AtcWizard = dynamic(() => import('@/components/atc-wizard'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading ATC Wizard…</p>
      </div>
    </div>
  ),
})

export default function WizardClient() {
  return <AtcWizard />
}
