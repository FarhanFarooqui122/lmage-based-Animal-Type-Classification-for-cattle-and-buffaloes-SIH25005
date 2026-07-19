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
2. **Classify** — AI identifies the breed (18 Indian breeds supported) via TensorFlow.js
3. **Measure** — Adjust body measurements (length, height, chest width, rump angle) via guided sliders
4. **Score** — ATC scoring engine computes a standardized score (0-100) with per-trait breakdown
5. **Export** — Generate Excel reports compatible with BPA integration

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| ML Runtime | TensorFlow.js (client-side inference) |
| Model Training | Teachable Machine / Custom MobileNetV3 → TFJS |
| UI | TailwindCSS + shadcn/ui |
| Excel Export | SheetJS (xlsx) |
| Deployment | Vercel (static export) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/
│   ├── AppShell.tsx       # Main app shell with tabs
│   ├── ClientShell.tsx    # Client wrapper (SSR-safe)
│   ├── ImageUpload.tsx    # Image upload with drag & drop + camera
│   ├── Classifier.tsx     # TF.js breed classification
│   ├── MeasurementForm.tsx # Guided measurement input
│   ├── ExportButton.tsx   # Excel export
│   ├── results/
│   │   └── ATCScoreCard.tsx # Score results display
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── atc-scoring.ts     # ATC scoring formula
│   ├── breed-standards.ts # Breed data & ideal measurements
│   ├── excel-export.ts    # Excel generation utility
│   ├── tfjs-loader.ts     # TF.js model loader (with mock fallback)
│   └── utils.ts
├── types/
│   └── index.ts           # TypeScript types
public/models/              # TF.js model files
```

## Supported Breeds (18)

**Cattle (10):** Gir, Sahiwal, Tharparkar, Red Sindhi, Ongole, Kankrej, Hariana, Rathi, Khillari, Deoni

**Buffalo (8):** Murrah, Surti, Banni, Jaffarabadi, Bhadawari, Mehsana, Nagpuri, Pandharpuri

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

The breed classifier uses TensorFlow.js with a Teachable Machine compatible model:

1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Train an Image Classifier with your breed images
3. Export as TensorFlow.js
4. Place `model.json` and weight files in `public/models/`

## Deployment

```bash
npm run build
npx vercel deploy
```

The app is designed for **static export** — all ML inference happens client-side, so Vercel free tier works perfectly.

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
