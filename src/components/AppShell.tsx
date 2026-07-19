'use client'

import { useState, useCallback } from 'react'
import ImageUpload from './ImageUpload'
import Classifier from './Classifier'
import MeasurementForm from './MeasurementForm'
import ATCScoreCard from './results/ATCScoreCard'
import ExportButton from './ExportButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClassificationResult, Measurements, ATCScoreResult } from '@/types'
import { calculateATCScore } from '@/lib/atc-scoring'
import { Button } from '@/components/ui/button'
import { RefreshCw, Info } from 'lucide-react'

export default function AppShell() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [measurements, setMeasurements] = useState<Measurements | null>(null)
  const [atcResult, setAtcResult] = useState<ATCScoreResult | null>(null)
  const [activeTab, setActiveTab] = useState('upload')

  const handleImageSelected = useCallback((img: HTMLImageElement) => {
    setImage(img)
    setClassification(null)
    setMeasurements(null)
    setAtcResult(null)
    setActiveTab('classify')
  }, [])

  const handleClassificationResult = useCallback((result: ClassificationResult | null) => {
    setClassification(result)
    if (result) {
      setActiveTab('measure')
    }
  }, [])

  const handleMeasurementsChange = useCallback((m: Measurements) => {
    setMeasurements(m)
  }, [])

  const handleCalculate = useCallback(() => {
    if (!classification || !measurements) return
    const result = calculateATCScore(
      classification.breed,
      measurements,
      classification.confidence
    )
    setAtcResult(result)
    setActiveTab('results')
  }, [classification, measurements])

  const handleReset = useCallback(() => {
    setImage(null)
    setClassification(null)
    setMeasurements(null)
    setAtcResult(null)
    setActiveTab('upload')
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="upload" disabled={activeTab !== 'upload'}>
            1. Upload
          </TabsTrigger>
          <TabsTrigger value="classify" disabled={activeTab !== 'classify'}>
            2. Classify
          </TabsTrigger>
          <TabsTrigger value="measure" disabled={activeTab !== 'measure'}>
            3. Measure
          </TabsTrigger>
          <TabsTrigger value="results" disabled={activeTab !== 'results'}>
            4. Results
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="upload">
            <ImageUpload onImageSelected={handleImageSelected} />
          </TabsContent>

          <TabsContent value="classify">
            <Classifier image={image} onResult={handleClassificationResult} />
          </TabsContent>

          <TabsContent value="measure" className="space-y-4">
            {classification && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <strong>Identified:</strong> {classification.breed} ({classification.category}) — {classification.confidence}% confidence
              </div>
            )}
            {classification && (
              <MeasurementForm
                breed={classification.breed}
                onMeasurementsChange={handleMeasurementsChange}
              />
            )}
            <Button
              onClick={handleCalculate}
              disabled={!classification || !measurements}
              className="w-full"
              size="lg"
            >
              Calculate ATC Score
            </Button>
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Adjust the sliders to match the animal&apos;s actual body measurements.
                The ideal values shown are breed standards from the Rashtriya Gokul Mission guidelines.
                Your adjustments will directly affect the ATC score.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {atcResult && measurements && (
              <>
                <ATCScoreCard result={atcResult} />
                <ExportButton result={atcResult} measurements={measurements} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Classification
                </Button>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
