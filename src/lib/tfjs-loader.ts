import * as tf from '@tensorflow/tfjs'

let model: tf.GraphModel | null = null
let breedLabels: string[] = []
let isLoading = false
let loadPromise: Promise<boolean> | null = null

async function fetchLabels(): Promise<string[]> {
  try {
    const res = await fetch('/models/metadata.json')
    const meta = await res.json()
    return meta.labels || []
  } catch {
    return []
  }
}

export async function loadModel(): Promise<boolean> {
  if (model) return true
  if (isLoading && loadPromise) return loadPromise
  isLoading = true

  loadPromise = new Promise(async (resolve) => {
    try {
      await tf.ready()
      await tf.setBackend('webgl')
      console.log('TF.js backend:', tf.getBackend())

      model = await tf.loadGraphModel('/models/model.json')
      breedLabels = await fetchLabels()
      resolve(true)
    } catch (err) {
      console.warn('TF.js model load failed, using mock:', err)
      model = null
      breedLabels = ['Gir', 'Sahiwal', 'Kankrej', 'Ongole', 'Murrah', 'Surti', 'Jaffarabadi', 'Bhadawari']
      resolve(false)
    } finally {
      isLoading = false
    }
  })

  return loadPromise
}

export function isModelLoaded(): boolean {
  return model !== null
}

export async function classifyImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<Array<{ breed: string; confidence: number }>> {
  if (!model) return getMockPredictions()

  const tensor = tf.tidy(() => {
    let img = tf.browser.fromPixels(imageElement)
    img = tf.image.resizeBilinear(img, [224, 224])
    img = img.expandDims(0)
    img = img.toFloat()
    img = img.div(127.5).sub(1)
    return img
  })

  const output = model.predict(tensor) as tf.Tensor
  const logits = await output.data()
  tensor.dispose()
  output.dispose()

  const probs = Array.from(logits)
  const softmax = softmaxFn(probs)

  const predictions = breedLabels
    .map((breed, i) => ({ breed, confidence: Math.round(softmax[i] * 100) }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  return predictions
}

function softmaxFn(logits: number[]): number[] {
  const max = Math.max(...logits)
  const exps = logits.map(l => Math.exp(l - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function getMockPredictions(): Array<{ breed: string; confidence: number }> {
  return [
    { breed: 'Gir', confidence: 88 },
    { breed: 'Sahiwal', confidence: 5 },
    { breed: 'Kankrej', confidence: 3 },
    { breed: 'Murrah', confidence: 2 },
    { breed: 'Ongole', confidence: 2 },
  ]
}

export function getBreedCategory(breed: string): 'Cattle' | 'Buffalo' {
  const buffaloBreeds = ['Murrah', 'Surti', 'Jaffarabadi', 'Bhadawari']
  return buffaloBreeds.includes(breed) ? 'Buffalo' : 'Cattle'
}
