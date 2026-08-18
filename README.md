# Image-based Animal Type Classification for Cattle & Buffaloes

**SIH 2025 — Problem Statement ID: SIH25005**

[![Vercel](https://img.shields.io/badge/deploy%20on-Vercel-black)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00)](https://www.tensorflow.org/js)

## Overview

An AI-powered web application for automated **Animal Type Classification (ATC)** under the **Rashtriya Gokul Mission (RGM)**. Upload a photo of a cow or buffalo to identify its breed and calculate a standardized ATC score based on body measurements.

Built for the **Ministry of Fisheries, Animal Husbandry & Dairying**, this tool aims to replace subjective manual scoring with objective, AI-driven analysis.

### Problem Statement

- Manual ATC scoring by field workers is **subjective and inconsistent** (65-70% accuracy)
- Human factors like fatigue and bias affect data quality in breeding programs
- Current process consumes **40-60%** of field workers' time
- Need for a standardized, automated system integrated with the **Bharat Pashudhan App (BPA)**

### Solution

1. **Upload** — Take or upload a photo of a cow/buffalo
2. **Classify** — AI identifies the breed (8 Indian breeds detected; 16 breed standards available) via TensorFlow.js
3. **Measure** — Adjust body measurements (length, height, chest width, rump angle) via guided sliders
4. **Score** — ATC scoring engine computes a standardized score (0-100) with per-trait breakdown
5. **Export** — Generate Excel reports compatible with BPA integration

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| ML Runtime | TensorFlow.js (client-side inference) |
| Model Training | MobileNetV2 (Keras) → TF.js LayersModel via `colab_train.py` |
| UI | TailwindCSS + shadcn/ui |
| Excel Export | SheetJS (xlsx) |
| Deployment | Vercel (static export) |

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

## Supported Breeds

**Model detects (8):** Gir, Sahiwal, Kankrej, Ongole, Murrah, Surti, Jaffarabadi, Bhadawari

**Breed standards available (16):** All 8 detectables plus Tharparkar, Red Sindhi, Hariana, Rathi, Khillari, Deoni, Banni, Mehsana, Nagpuri, Pandharpuri

## Getting Started

```bash
# Clone the repo
git clone https://github.com/FarhanFarooqui122/lmage-based-Animal-Type-Classification-for-cattle-and-buffaloes-SIH25005.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Model Training

The breed classifier uses a MobileNetV2-derived model trained via `colab_train.py`:

1. Open `colab_train.py` and paste each cell into a Google Colab notebook
2. Upload your Kaggle API key when prompted (Cell 2)
3. Run all cells — trains on 3 Kaggle datasets (~7400 images, 8 breeds)
4. Final cells convert Keras `.h5` → TF.js LayersModel + `metadata.json`
5. Extract the downloaded ZIP into `public/models/`

## Deployment

```bash
npm run build
npx vercel deploy
```

All ML inference happens client-side (TensorFlow.js), so no server-side ML compute is needed.

## ATC Scoring Formula

The overall ATC score is a weighted composite:

| Trait | Weight |
|---|---|
| Body Length | 30% |
| Height at Withers | 25% |
| Chest Width | 25% |
| Rump Angle | 20% |

Each trait is scored 0-100 based on proximity to breed-specific ideal values (per RGM guidelines).

## License

MIT
