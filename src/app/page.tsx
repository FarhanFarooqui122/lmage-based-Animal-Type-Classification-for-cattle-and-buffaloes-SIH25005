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

import { SiteFooter, SiteHeader } from '@/components/site-header'

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <AtcWizard />
      </main>
      <SiteFooter />
    </div>
  )
}
