'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Camera, ImageIcon, Sparkles, Upload } from 'lucide-react'

interface UploadStepProps {
  onImageSelected: (url: string, seed: number, isSample: boolean) => void
}

export function UploadStep({ onImageSelected }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const url = URL.createObjectURL(file)
      const seed = file.size + file.name.length
      onImageSelected(url, seed, false)
    },
    [onImageSelected],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-balance sm:text-3xl">
          Image-based Animal Type Classification for Cattle &amp; Buffaloes
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl leading-relaxed text-pretty">
          Upload a clear side-profile photograph of the animal. The AI model identifies the breed,
          then guides you through standardized body measurements to produce an objective ATC score
          — replacing subjective manual scoring in the field.
        </p>
        <p className="text-muted-foreground text-sm">
          {'पशु की स्पष्ट पार्श्व-प्रोफ़ाइल तस्वीर अपलोड करें'}
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload or capture an animal photo. Drag and drop an image here, or press Enter to browse files."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 sm:py-20',
          dragging
            ? 'border-primary bg-secondary scale-[1.01]'
            : 'border-border bg-card hover:border-primary/60 hover:bg-secondary/50',
        )}
      >
        <div className="bg-secondary text-primary flex size-16 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110">
          <Camera className="size-8" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold">Drag &amp; drop an animal photo here</p>
          <p className="text-muted-foreground text-sm">JPG, PNG or WEBP — clear side view recommended</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" tabIndex={-1}>
          <Upload className="size-4" aria-hidden />
          Upload or Capture
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" aria-hidden />
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">or</span>
        <div className="bg-border h-px flex-1" aria-hidden />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="mx-auto w-full sm:w-auto"
        onClick={() => onImageSelected('/images/sample-gir-cow.png', 0, true)}
      >
        <Sparkles className="size-4 text-accent" aria-hidden />
        Try with a sample Gir cow image
      </Button>

      <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
        <ImageIcon className="size-3.5" aria-hidden />
        Photos are processed on-device — nothing is uploaded to a server.
      </div>
    </div>
  )
}
