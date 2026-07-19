'use client'

import { useCallback, useRef, useState } from 'react'
import { StepIndicator } from '@/components/step-indicator'
import { UploadStep } from '@/components/upload-step'
import { ClassifyStep } from '@/components/classify-step'
import { MeasureStep } from '@/components/measure-step'
import { ResultsStep } from '@/components/results-step'
import {
  BREED_STANDARDS,
  TRAITS,
  classifyImage,
  computeAtcScore,
  type AtcResult,
  type ClassificationResult,
  type Measurements,
  type TraitKey,
} from '@/lib/atc-data'

function defaultMeasurements(breed?: string): Measurements {
  const standard = breed ? BREED_STANDARDS[breed] : undefined
  return {
    bodyLength: standard?.bodyLength ?? TRAITS[0].ideal,
    heightWithers: standard?.heightWithers ?? TRAITS[1].ideal,
    chestWidth: standard?.chestWidth ?? TRAITS[2].ideal,
    rumpAngle: standard?.rumpAngle ?? TRAITS[3].ideal,
  }
}

export default function AtcWizard() {
  const [step, setStep] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [classifying, setClassifying] = useState(false)
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements())
  const [result, setResult] = useState<AtcResult | null>(null)

  const handleImageSelected = useCallback(async (url: string, seed: number, isSample: boolean) => {
    setImageUrl(url)
    setClassification(null)
    setClassifying(true)
    setStep(1)

    const res = await classifyImage(url, seed, isSample)
    setClassification(res)
    setMeasurements(defaultMeasurements(res.top.breed))
    setClassifying(false)
  }, [])

  const handleMeasurementChange = useCallback((key: TraitKey, value: number) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleCalculate = useCallback(() => {
    if (!classification) return
    setResult(computeAtcScore(measurements, classification.top.breed))
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [classification, measurements])

  const handleRestart = useCallback(() => {
    if (imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setStep(0)
    setImageUrl('')
    setClassification(null)
    setResult(null)
    setMeasurements(defaultMeasurements())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [imageUrl])

  return (
    <section aria-label="Animal Type Classification wizard" className="flex flex-col gap-8">
      <StepIndicator current={step} />

      {step === 0 && <UploadStep onImageSelected={handleImageSelected} />}

      {step === 1 && (
        <ClassifyStep
          loading={classifying}
          imageUrl={imageUrl}
          result={classification}
          onBack={handleRestart}
          onNext={() => {
            setStep(2)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      {step === 2 && classification && (
        <MeasureStep
          breed={classification.top.breed}
          imageUrl={imageUrl}
          measurements={measurements}
          onChange={handleMeasurementChange}
          onReset={() => setMeasurements(defaultMeasurements(classification.top.breed))}
          onBack={() => setStep(1)}
          onCalculate={handleCalculate}
        />
      )}

      {step === 3 && result && classification && (
        <ResultsStep
          result={result}
          breed={classification.top.breed}
          category={classification.top.category}
          imageUrl={imageUrl}
          onRestart={handleRestart}
        />
      )}
    </section>
  )
}
