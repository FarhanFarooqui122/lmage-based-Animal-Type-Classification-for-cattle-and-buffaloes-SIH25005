import { SiteFooter, SiteHeader } from '@/components/site-header'
import WizardClient from '@/components/wizard-client'

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <WizardClient />
      </main>
      <SiteFooter />
    </div>
  )
}
