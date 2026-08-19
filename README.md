# Image-based Animal Type Classification for Cattle & Buffaloes

**SIH 2025 — Problem Statement ID: SIH25005**

[![Vercel](https://img.shields.io/badge/deploy%20on-Vercel-black)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00)](https://www.tensorflow.org/js)

## Problem

Manual ATC scoring by field workers under the Rashtriya Gokul Mission is:

- **Subjective and inconsistent** — manual scoring achieves only 65–70% accuracy, with results varying from worker to worker
- **Prone to human error** — fatigue and bias degrade data quality in breeding programs
- **Time-consuming** — the manual process consumes **40–60%** of field workers' time
- **Hard to standardize** — no unified digital record, difficult to integrate with the Bharat Pashudhan App (BPA)

## Features

- **AI breed identification** — Upload a photo of a cow or buffalo and a TensorFlow.js model identifies the breed from **8 Indian breeds** (Gir, Sahiwal, Kankrej, Ongole, Murrah, Surti, Jaffarabadi, Bhadawari) with confidence scores and top-3 predictions.
- **Fully client-side ML** — All inference runs in the browser via TensorFlow.js on the CPU backend. No server-side ML compute, no API costs, works offline after first load.
- **4-step guided wizard** — Upload → Classify → Measure → Score with a visual progress indicator.
- **Low-confidence guard** — Predictions below a 40% confidence threshold are flagged as unreliable, with warning banners shown to prevent incorrect scoring.
- **Body measurement sliders** — Adjust body length, height at withers, chest width, and rump angle within breed-specific ideal ranges (with ±10% tolerance), in bilingual (English/Hindi) labels.
- **Standardized ATC scoring** — A weighted 0–100 score with per-trait breakdown and A+/A/B+/B/C/D grades based on proximity to breed-specific RGM standards.
- **Excel export** — Generate a formatted `.xlsx` ATC report (SheetJS) ready for BPA (Bharat Pashudhan App) integration.
- **16 breed standards** — Scoring references the ideal body measurements for 10 cattle + 6 buffalo breeds defined per Rashtriya Gokul Mission guidelines.
- **RGM branding** — Header/footer with Rashtriya Gokul Mission identity.

## How it works

The app is a 4-step wizard that turns a single photo into a standardized ATC report:

```
Upload Image → AI Classify Breed → Enter Measurements → ATC Score + Export
```

1. **Upload** — Drag-drop or pick a photo of the animal. The image is validated and shown as a preview.
2. **Classify** — The image is resized to 224×224, normalized to [-1, 1], and passed through the MobileNetV2-derived TF.js model. The top-3 breed predictions with confidence percentages are shown, plus a warning banner if confidence falls below the 40% reliability threshold.
3. **Measure** — Guided sliders let the field worker record body length, height at withers, chest width, and rump angle. Slider ranges default to the breed's ideal values and tolerance.
4. **Score** — The ATC scoring engine computes a weighted composite score (0–100) with a per-trait breakdown and letter grade, then exports a `.xlsx` report.

## ML model details

- **Architecture:** MobileNetV2-derived (Keras Sequential → TF.js **LayersModel**), 224×224 RGB input, 8 output classes.
- **Preprocessing:** Resize to 224×224 → `toFloat()` → divide by 127.5 → subtract 1.0 (matches `mobilenet_v2.preprocess_input`, normalizes pixels to [-1, 1]).
- **Training:** Two-phase transfer learning — Phase 1 freezes the base (≈83% val accuracy), Phase 2 fine-tunes the top third (89.4% val accuracy, trained 2026-08-18).
- **Datasets:** ~7,400 images across 3 Kaggle datasets (CC0 / Apache 2.0), auto-downloaded via the Kaggle API.
- **Class labels:** `["Gir","Sahiwal","Kankrej","Ongole","Murrah","Surti","Jaffarabadi","Bhadawari"]`
- **Category mapping:** Cattle = Gir, Sahiwal, Kankrej, Ongole; Buffalo = Murrah, Surti, Jaffarabadi, Bhadawari.
- **Runtime:** CPU backend only (target field devices lack WebGL). Model is loaded lazily on first classification and cached for subsequent runs.
- **Reliability:** Predictions below 40% confidence are flagged `isReliable=false`; the UI then shows "unknown breed" warnings and falls back to mock predictions, which are always marked unreliable.
- **Known limitations:** Per-breed recall is weakest on Surti (63%) and Bhadawari (52%) — small training classes.

**Model files** (`public/models/`): `model.json` (Keras 2 schema), `group1-shard1of3.bin` / `shard2of3` / `shard3of3` (weights), `metadata.json` (labels).

### Training scripts

| Script | Purpose |
|---|---|
| `colab_train.py` | 13-cell Google Colab notebook: install → download → train → export TF.js |
| `colab_run_all.py` | Single-cell all-in-one Colab runner |
| `train_local.py` | Standalone local GPU training (e.g. RTX 2000 Ada 24 GB), `--skip-download`/`--skip-phase1` resume flags |
| `fix_tfjs_model.py` | Converts Keras 3-format model.json to the Keras 2 schema tfjs 4.x can load (run after every export) |

## ATC scoring formula

The overall ATC score is a **weighted composite** of four body traits:

| Trait | Weight |
|---|---|
| Body Length | 30% |
| Height at Withers | 25% |
| Chest Width | 25% |
| Rump Angle | 20% |

Each trait is scored 0–100 from its deviation against the breed's ideal value within a tolerance window:

```
maxDeviation = ideal × (tolerance / 100)          // tolerance = 10% per RGM standards
deviation    = |measured − ideal|
traitScore   = max(0, 100 − (deviation / maxDeviation) × 100)   // clamped to [0, 100]

overallScore = Σ (traitScoreᵢ × weightᵢ)          // rounded to nearest integer
```

Trait status thresholds: **Excellent** ≥ 85, **Good** ≥ 70, **Average** ≥ 50, else **Poor**.

Overall letter grade:

| Score | Grade |
|---|---|
| ≥ 90 | A+ (Excellent) |
| ≥ 80 | A (Very Good) |
| ≥ 70 | B+ (Good) |
| ≥ 60 | B (Fair) |
| ≥ 50 | C (Average) |
| < 50 | D (Poor) |

Ideal measurements are defined per breed in `src/lib/breed-standards.ts` (10 cattle + 6 buffalo breeds).

## Getting started + deployment

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (only for model training, not required to run the app)

### Run locally

```bash
# Clone the repo
git clone https://github.com/FarhanFarooqui122/lmage-based-Animal-Type-Classification-for-cattle-and-buffaloes-SIH25005.git
cd lmage-based-Animal-Type-Classification-for-cattle-and-buffaloes-SIH25005

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

```bash
npm run build
npx vercel deploy
```

All ML inference happens client-side (TensorFlow.js CPU backend), so the deployment is a **static export** — no server-side ML compute or environment variables are needed.

### (Optional) Retrain the model

1. Open `colab_train.py` and paste each cell into a Google Colab notebook (or paste the whole `colab_run_all.py` block).
2. Upload your Kaggle API key when prompted.
3. Run all cells — trains on 3 Kaggle datasets (~7,400 images, 8 breeds).
4. Final cells convert Keras `.h5` → TF.js LayersModel + `metadata.json`.
5. Run `python fix_tfjs_model.py` on the exported `model.json` (required for tfjs 4.x compatibility).
6. Copy the output into `public/models/`.

For local GPU training instead: `pip install -r requirements-train.txt` then `python train_local.py --epochs 100`.

## Screenshots

> Screenshots pending — will be added from the live wizard.

| Step | Preview |
|---|---|
| Upload | Image upload with drag-drop & preview |
| Classify | Breed predictions with confidence bars + reliability banner |
| Measure | Body measurement sliders (EN/HI labels) |
| Results | ATC score, grade, trait breakdown, export |

A sample Gir cow photo is available at `public/images/sample-gir-cow.png` for quick testing of the upload step.

## Roadmap

- [ ] Capture and add screenshots of the live wizard
- [ ] Integrate the generated ATC report directly into the **Bharat Pashudhan App (BPA)** API
- [ ] Add 8 more detectables to the model (Tharparkar, Red Sindhi, Hariana, Rathi, Khillari, Deoni, Banni, Mehsana, Nagpuri, Pandharpuri) — breed standards already defined
- [ ] Improve per-breed recall on small classes (Surti, Bhadawari) with data augmentation & class weighting
- [ ] Expand the model to detect all 16 breeds with standards
- [ ] Add Hindi (Hindi UI) full localization beyond measurement labels
- [ ] Offline-first mode (service worker caching of model weights for field use)
- [ ] Mobile camera capture with on-device image cropping/auto-centering
- [ ] Photogrammetry-assisted measurement entry to reduce manual slider input

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| ML Runtime | TensorFlow.js (client-side inference) |
| Model Training | MobileNetV2 (Keras) → TF.js LayersModel |
| UI | TailwindCSS + shadcn/ui |
| Excel Export | SheetJS (xlsx) |
| Deployment | Vercel (static export) |

## Supported Breeds

**Model detects (8):** Gir, Sahiwal, Kankrej, Ongole, Murrah, Surti, Jaffarabadi, Bhadawari

**Breed standards available (16):** All 8 detectables plus Tharparkar, Red Sindhi, Hariana, Rathi, Khillari, Deoni, Banni, Mehsana, Nagpuri, Pandharpuri

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Tailwind v4 + shadcn theme
├── components/
│   ├── atc-wizard.tsx     # 4-step wizard state controller
│   ├── wizard-client.tsx  # Dynamic import wrapper (ssr:false)
│   ├── site-header.tsx    # Header & footer with RGM branding
│   ├── step-indicator.tsx # 4-step progress bar
│   ├── upload-step.tsx    # Step 0: drag-drop image upload
│   ├── classify-step.tsx  # Step 1: AI breed predictions
│   ├── measure-step.tsx   # Step 2: body measurement sliders
│   ├── results-step.tsx   # Step 3: ATC score + export
│   └── ui/                # shadcn/ui primitives
│       └── button.tsx     # @base-ui/react button
├── lib/
│   ├── atc-data.ts        # Integration bridge (TF.js + scoring + export)
│   ├── atc-scoring.ts     # Weighted ATC scoring algorithm
│   ├── breed-standards.ts # 16 breed standards data
│   ├── excel-export.ts    # XLSX generation (SheetJS)
│   ├── tfjs-loader.ts     # TF.js model loader + classify
│   └── utils.ts           # cn() helper
├── types/
│   └── index.ts           # Shared TypeScript interfaces
public/
├── models/                # TF.js model (model.json, group1-shard*.bin, metadata.json)
└── images/                # Sample images
```

## License

MIT