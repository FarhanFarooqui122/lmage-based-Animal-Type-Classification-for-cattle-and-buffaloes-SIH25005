<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->
# SIH 2025 — Problem SIH25005: Animal Type Classification

## Purpose
AI-powered ATC (Animal Type Classification) tool for cattle & buffaloes under Rashtriya Gokul Mission. 4-step wizard: Upload Image → AI Classify Breed → Enter Measurements → Show ATC Score + Export.

## Tech Stack
- Next.js 16.2.10 + React 19.2.4 + TypeScript
- TailwindCSS v4, shadcn/ui, @base-ui/react
- TensorFlow.js 4.22 (CPU-only inference — device lacks WebGL)
- xlsx (SheetJS) for Excel export
- Lucide React icons

## Architecture

### Component Hierarchy
```
layout.tsx
  └── page.tsx
       ├── SiteHeader (site-header.tsx)
       ├── WizardClient (wizard-client.tsx) — dynamic import, ssr:false
       │    └── AtcWizard (atc-wizard.tsx) — orchestrates 4-step state
       │         ├── StepIndicator (step-indicator.tsx)
       │         ├── UploadStep (upload-step.tsx) — step 0
       │         ├── ClassifyStep (classify-step.tsx) — step 1
       │         ├── MeasureStep (measure-step.tsx) — step 2
       │         └── ResultsStep (results-step.tsx) — step 3
```

### Data Flow
```
UploadStep → handleImageSelected()
  → atc-data.ts:classifyImage()
    → ensureModelLoaded() → tfjs-loader.ts:loadModel() [cached, runs once]
    → tfjs-loader.ts:classifyImage(imgElement)
    → getBreedCategory()
  → setState({result, step:1})
→ ClassifyStep shows predictions
→ MeasureStep → computeAtcScore(measurements, breed)
  → atc-scoring.ts:calculateATCScore()
→ ResultsStep → exportToExcel() // generates CSV, not XLSX
```

### Model Details
- **Format:** TF.js LayersModel (Keras Sequential, NOT GraphModel)
- **Backend:** MobileNetV2-derived (ImageNet weights), 224x224 RGB input, 8 output classes
- **Preprocessing:** resize to 224x224 → toFloat() → div(127.5) → sub(1.0) [normalize to [-1, 1]] — matches `mobilenet_v2.preprocess_input`
- **Labels:** ["Gir","Sahiwal","Kankrej","Ongole","Murrah","Surti","Jaffarabadi","Bhadawari"]
- **Category mapping:** Cattle = Gir, Sahiwal, Kankrej, Ongole; Buffalo = Murrah, Surti, Jaffarabadi, Bhadawari
- **Model files:** `public/models/model.json`, `weights.bin`, `metadata.json`

### Model Training (Colab)
- **Script:** `colab_train.py` — 13 cells, copy-paste into Colab notebook
- **Hardware:** T4 GPU (free tier, ~24hr quota resets)
- **Two-phase training:** Phase 1 (frozen base, ~2hrs) → Phase 2 (fine-tune top 1/3, ~1hr)
- **Datasets (Kaggle, auto-downloaded via API):**
  - `atharvadarpude/indian-cattle-image-dataset` — 50 cattle breeds, CC0
  - `atharvadarpude/indian-buffalo-dataset` — 17 buffalo breeds, CC0
  - `birendranathnandi/indian-cattle-and-buffalo-breeds-dataset` — extra, Apache 2.0
- **Results:** ~83% val accuracy (frozen base), expected ~88%+ after fine-tuning
- **Image counts:** Gir ~1450, Sahiwal ~1722, Kankrej ~712, Ongole ~814, Murrah ~1130, Surti ~379, Jaffarabadi ~693, Bhadawari ~454
- **Recovery:** Use Cell 8b if runtime disconnects after Phase 1 — reloads checkpoint and skips to fine-tuning
- **Export:** Cell 11-13 converts Keras .h5 → TF.js LayersModel + metadata.json, downloads as zip

### Breed Standards
16 breeds defined in `src/lib/breed-standards.ts` (10 cattle + 6 buffalo). Only 8 are detectable by the model. Each has ideal body measurements and tolerance (10%).

## Conventions

### File Organization
- `src/lib/` — business logic (TF.js loader, scoring, breed data, data bridge, export)
- `src/components/` — React components; wizard steps are `*-step.tsx`
- `src/components/ui/` — shadcn/ui primitives (currently only `button.tsx`)
- `src/types/` — shared TypeScript interfaces
- `public/models/` — TF.js model files (tracked as binary in git via .gitattributes)
- `public/images/` — sample images

### Key Files
| File | Purpose |
|---|---|
| `src/lib/tfjs-loader.ts` | Model loading & image classification |
| `src/lib/atc-data.ts` | Integration bridge: connects UI to TF.js, scoring, export |
| `src/lib/atc-scoring.ts` | Weighted ATC scoring algorithm |
| `src/lib/breed-standards.ts` | Breed standards data for 16 breeds |
| `src/lib/excel-export.ts` | XLSX generation (SheetJS, wired via `atc-data.ts:exportToExcel()`) |
| `src/components/atc-wizard.tsx` | Main state controller for the 4-step wizard |
| `colab_train.py` | Google Colab notebook script for model training & TF.js export |

### Model Loading Pattern
- `loadModel()` is called lazily on first classification (not at app startup)
- Cached via module-level `modelLoading` promise in `atc-data.ts`
- TF.js is imported dynamically (WizardClient uses `next/dynamic` with `ssr:false`)
- Always sets CPU backend (WebGL not available on target devices)

### Known Gotchas
- Type name collision: `ClassificationResult` in `@/types` (has `breed,category,confidence,topPredictions`) differs from `@/lib/atc-data` (has `top,predictions`)
- Measurement field name mismatch: `atc-data.ts` uses `heightWithers`, `@/types` uses `heightAtWithers`
- `exportToExcel()` in `atc-data.ts` maps local `Measurements` (heightWithers) to `OurMeasurements` (heightAtWithers) for the SheetJS excel-export.ts
- `.gitattributes` marks `public/models/*` and `*.bin` as binary to prevent CRLF corruption
- Colab free tier `/content/` is ephemeral — all data & checkpoints lost on runtime disconnect. Recovery Cell 8b only works if runtime hasn't disconnected
- Colab GPU quota resets ~24hrs after last use; switch to CPU runtime to export without GPU
- `colab_train.py` cell blocks are delimited by `"""..."""` — paste without the quotes when adding to Colab

## Commands
- `npm run dev` — development server
- `npm run build` — production build (includes TypeScript check)
- `npm run lint` — ESLint
- Build must pass before pushing (TypeScript errors will fail build)

## Git Workflow
- Commit after each logical change
- Push to GitHub at `https://github.com/FarhanFarooqui122/lmage-based-Animal-Type-Classification-for-cattle-and-buffaloes-SIH25005`
- Branch: `master` (single branch)
<!-- END:project-rules -->
