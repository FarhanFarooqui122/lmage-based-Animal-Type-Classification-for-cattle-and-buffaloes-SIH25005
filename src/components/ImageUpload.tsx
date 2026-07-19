'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, X } from 'lucide-react'

interface ImageUploadProps {
  onImageSelected: (image: HTMLImageElement, file: File) => void
  disabled?: boolean
}

export default function ImageUpload({ onImageSelected, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        onImageSelected(img, file)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [onImageSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      setTimeout(() => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
            processFile(file)
          }
        }, 'image/jpeg')

        stream.getTracks().forEach(t => t.stop())
      }, 500)
    } catch {
      fileInputRef.current?.click()
    }
  }, [processFile])

  const reset = useCallback(() => {
    setPreview(null)
    imageRef.current = null
  }, [])

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop image here or click to upload</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPG, PNG, WEBP
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                handleCamera()
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture from Camera
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded animal"
              className="w-full max-h-96 object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={reset}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
