import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '600'],
  variable: '--font-devanagari',
})

export const metadata: Metadata = {
  title: 'ATC — Animal Type Classification | Rashtriya Gokul Mission',
  description:
    'AI-powered image-based Animal Type Classification for cattle and buffaloes. Upload a photo, identify the breed, enter measurements, and generate a standardized ATC score. Ministry of Fisheries, Animal Husbandry & Dairying, Government of India.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#15803d',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${notoDevanagari.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
