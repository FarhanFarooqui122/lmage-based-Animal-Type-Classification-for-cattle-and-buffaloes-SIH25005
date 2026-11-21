'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Camera, ImageIcon, Sparkles, Upload } from 'lucide-react'

interface UploadStepProps {
  onImageSelected: (url: string) => void
}

export function UploadStep({ onImageSelected }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const url = URL.createObjectURL(file)
      onImageSelected(url)
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
    <div className="animate-fade-up flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="kicker text-muted-foreground">Step 01 — Image intake</span>
        <h2 className="headline text-4xl text-balance sm:text-5xl lg:text-6xl">
          Snap the animal.
          <br />
          <span className="bg-accent box-decoration-clone px-1">Get the breed.</span>
        </h2>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty sm:text-base">
          Upload a clear side-profile photograph. The model names the breed, then walks you through
          four standard body measurements for an objective ATC score.
        </p>
        <p className="text-[0.7rem] font-bold tracking-widest text-muted-foreground uppercase">
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
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'group grid cursor-pointer gap-6 border-2 border-foreground p-6 shadow-[6px_6px_0_0_var(--foreground)] transition-transform duration-150 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8',
          dragging ? '-translate-y-1 bg-accent' : 'bg-card hover:-translate-y-1',
        )}
      >
        <div className="flex items-center gap-4">
          <div className="bg-secondary flex size-14 shrink-0 items-center justify-center border-2 border-foreground">
            <Camera className="size-7" aria-hidden />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl leading-none font-black uppercase">
              Drag &amp; drop a photo
            </p>
            <p className="text-muted-foreground text-[0.7rem] font-bold tracking-widest uppercase">
              JPG · PNG · WEBP — side view preferred
            </p>
          </div>
        </div>
        <Button size="lg" className="w-full sm:w-auto" tabIndex={-1}>
          <Upload className="size-4" aria-hidden />
          Select photo
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
        <div className="bg-foreground/20 h-0.5 flex-1" aria-hidden />
        <span className="bg-foreground text-background kicker border-2 border-foreground px-2 py-1">
          Or
        </span>
        <div className="bg-foreground/20 h-0.5 flex-1" aria-hidden />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="mx-auto w-full sm:w-auto"
        onClick={() => onImageSelected('/images/sample-gir-cow.png')}
      >
        <Sparkles className="size-4" aria-hidden />
        Try a sample Gir cow
      </Button>

      <div className="flex items-center justify-center gap-2 border-2 border-foreground bg-card px-3 py-2 text-[0.7rem] font-bold tracking-widest uppercase">
        <ImageIcon className="size-3.5 shrink-0" aria-hidden />
        Photos are processed on-device
      </div>
    </div>
  )
}
