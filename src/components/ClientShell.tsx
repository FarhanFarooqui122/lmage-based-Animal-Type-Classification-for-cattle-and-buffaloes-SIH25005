'use client'

import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('@/components/AppShell'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    </div>
  ),
})

export default function ClientShell() {
  return <AppShell />
}
