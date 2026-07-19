import ClientShell from '@/components/ClientShell'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
      <header className="border-b bg-white/80 dark:bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
            ATC
          </div>
          <div>
            <h1 className="text-lg font-bold">Animal Type Classification</h1>
            <p className="text-xs text-muted-foreground">
              Rashtriya Gokul Mission — Ministry of Fisheries, Animal Husbandry & Dairying
            </p>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-5xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Image-based Animal Type Classification
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of a cow or buffalo to identify its breed and calculate its
            Animal Type Classification (ATC) score — supporting scientific breeding decisions.
          </p>
        </div>
        <ClientShell />
      </main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>SIH 2025 — Problem Statement ID: SIH25005</p>
        <p className="text-xs mt-1">Department of Animal Husbandry & Dairying (DoAH&D)</p>
      </footer>
    </div>
  )
}
