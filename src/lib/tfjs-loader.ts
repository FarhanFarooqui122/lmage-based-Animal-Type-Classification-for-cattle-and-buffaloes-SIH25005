import * as tf from '@tensorflow/tfjs'

let model: tf.LayersModel | tf.GraphModel | null = null
let breedLabels: string[] = []
let isLoading = false
let loadPromise: Promise<boolean> | null = null

async function fetchJSON(path: string): Promise<any> {
  const res = await fetch(path)
  return res.json()
}

export async function loadModel(): Promise<boolean> {
  if (model) return true
  if (isLoading && loadPromise) return loadPromise
  isLoading = true

  loadPromise = new Promise(async (resolve) => {
    try {
      await tf.ready()
      const currentBackend = tf.getBackend()
      if (currentBackend !== 'cpu') {
        const switched = await tf.setBackend('cpu').catch(() => false)
        if (!switched) {
          console.warn('Could not switch to CPU backend, current:', currentBackend)
        }
      }
      console.log('TF.js backend:', tf.getBackend())

      breedLabels = await fetchJSON('/models/metadata.json').then(m => m.labels || [])

      try {
        model = await tf.loadLayersModel('/models/model.json')
        console.log('Model loaded as LayersModel')
      } catch {
        model = await tf.loadGraphModel('/models/model.json')
        console.log('Model loaded as GraphModel')
      }

      resolve(true)
    } catch (err) {
      console.error('TF.js model load failed:', err)
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
  if (!model) {
    console.warn('No model loaded, using mock predictions')
    return getMockPredictions()
  }

  let tensor: tf.Tensor | null = null
  let output: tf.Tensor | null = null

  try {
    tensor = tf.tidy(() => {
      let img = tf.browser.fromPixels(imageElement)
      img = tf.image.resizeBilinear(img, [224, 224])
      img = img.expandDims(0)
      img = img.toFloat()
      img = img.div(255.0)
      return img
    })

    output = model.predict(tensor) as tf.Tensor
    const logits = await output.data()
    const probs = Array.from(logits)

    const predictions = breedLabels
      .map((breed, i) => ({ breed, confidence: Math.round(probs[i] * 100) }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)

    return predictions
  } catch (err) {
    console.error('Classification failed:', err)
    return getMockPredictions()
  } finally {
    if (tensor) tensor.dispose()
    if (output) output.dispose()
  }
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
