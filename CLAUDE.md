# SYNTAX Score Calculator — Developer Reference

## Project Overview

A single-page, client-side web application for comprehensive coronary revascularization risk assessment. It integrates five linked calculators that a cardiologist can complete in under 2 minutes per case. Deployed at https://syntax-azure.vercel.app.

**GitHub:** github.com/amornj/syntax

## Tech Stack

- **Next.js 16** (App Router, `next: 16.1.6`)
- **React 19** (`react: 19.2.3`)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **shadcn/ui** components (base-ui/react)
- No backend — pure client-side calculation
- Deployed on Vercel

## Development Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Architecture

### Source Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Entry point — renders <SyntaxCalculator />
│   └── globals.css
├── components/
│   ├── syntax-calculator.tsx   # ROOT component — orchestrates all state + sections
│   ├── coronary-diagram.tsx    # SVG interactive 16-segment coronary diagram
│   ├── lesion-card.tsx         # Per-lesion expandable card (segments, features)
│   ├── score-panel.tsx         # Sticky live SYNTAX I score display
│   ├── syntax-ii-panel.tsx     # SYNTAX II inputs + result + shared param emission
│   ├── euroscore-ii-panel.tsx  # EuroSCORE II inputs + result
│   ├── eft-panel.tsx           # Essential Frailty Toolset inputs + result
│   ├── summary-panel.tsx       # 4-card risk summary + Copy/HTML/Print export
│   └── ui/                     # shadcn/ui primitives (badge, button, card, etc.)
└── lib/
    ├── types.ts                # All shared TypeScript types and interfaces
    ├── segments.ts             # 16-segment definitions + dominance-aware weights
    ├── syntax-score.ts         # SYNTAX I calculation engine
    ├── syntax-score-ii.ts      # SYNTAX II calculation (Farooq 2013 coefficients)
    ├── euroscore-ii.ts         # EuroSCORE II calculation (Nashef 2012, validated)
    ├── eft-score.ts            # Essential Frailty Toolset scoring
    └── utils.ts                # Tailwind class merge utility
```

### Component Hierarchy

```
page.tsx
└── SyntaxCalculator          ← single source of truth for all state
    ├── CoronaryDiagram       ← reads lesions[], activeLesionId
    ├── ScorePanel            ← reads lesions[], diffuseCount (sticky)
    ├── LesionCard[]          ← per-lesion state via onUpdate callback
    ├── DiffuseDisease        ← inline component in syntax-calculator.tsx
    ├── SyntaxIIPanel         ← emits SyntaxIISharedValues upward via onValuesChange
    ├── EuroScoreIIPanel      ← receives shared params as props (age, gender, CrCl, LVEF, COPD, PVD)
    ├── EFTPanel              ← receives sharedGender prop
    └── SummaryPanel          ← receives all four results + patient demographics
```

## The Five Sections

### 1. SYNTAX Score I (`syntax-score.ts`, `segments.ts`)

Anatomical lesion complexity scoring per the AHA 16-segment model.

- Each lesion ≥50% in vessels ≥1.5mm is scored: `(sum of segment weights) × multiplication factor`
- Non-occlusive (50–99%): ×2; Total occlusion (100%): ×5
- Adverse characteristics add points: bifurcation (+1/+2), trifurcation (+3–6), heavy calcification (+2), severe tortuosity (+2), aorto-ostial (+1), length >20mm (+1), thrombus (+1)
- Total occlusion sub-features: age >3mo/unknown (+1), blunt stump (+1), bridging collaterals (+1), side branches (+1 each), segments beyond TO (+1 each)
- Diffuse disease: +1 per segment with ≥75% of length <2mm vessel

**Interpretation:** Low ≤22, Intermediate 23–32, High ≥33

### 2. SYNTAX Score II (`syntax-score-ii.ts`)

Clinical prediction of 4-year PCI vs CABG mortality (Farooq et al., Lancet 2013).

- Inputs: SYNTAX I score, age, gender, CrCl (Cockcroft-Gault), LVEF, COPD, PVD, left main disease
- Outputs: SS2-PCI, SS2-CABG, predicted 4-year mortality % for each
- Validated against syntaxscore.org with exact published coefficients

### 3. EuroSCORE II (`euroscore-ii.ts`)

In-hospital cardiac surgery mortality (Nashef et al., EJCTS 2012). 18 variables.

- Validated against the official euroscore.org JavaScript source code
- Shared variables received as props from SYNTAX II

### 4. Essential Frailty Toolset (`eft-score.ts`)

Preoperative frailty assessment (Solomon et al. JAHA 2021; Afilalo et al. JACC 2017).

- 4 components: chair stands test, cognitive impairment, hemoglobin, albumin
- Output: Robust / Pre-Frail / Frail

### 5. Risk Assessment Summary (`summary-panel.tsx`)

- 4-card grid aggregating all results
- Decision guidance (PCI vs CABG recommendation)
- Export: plain-text Copy, self-contained HTML file, Print

## Key Implementation Notes

### Shared Parameter Flow

`SyntaxIIPanel` emits a `SyntaxIISharedValues` object (`age`, `gender`, `crcl`, `lvef`, `copd`, `pvd`) via the `onValuesChange` callback. `SyntaxCalculator` holds this in state and passes the values as individual props to `EuroScoreIIPanel` and `sharedGender` to `EFTPanel`. This means the user only enters demographic/clinical variables once.

### Left Main Auto-Sync

`hasLeftMainDisease` is derived in `SyntaxCalculator` by checking whether any lesion includes segment `'5'`:

```ts
const hasLeftMainDisease = lesions.some(l => l.segments.includes('5'))
```

This boolean is passed into `SyntaxIIPanel` so the Left Main Disease toggle auto-populates from SYNTAX I. The panel supports a manual override with a warning displayed when the auto-detected value and user override differ.

### Dominance-Aware Segment Weights

`segments.ts` exports `getAvailableSegments(dominance)` which returns the correct set of segments and weights for right vs left dominant systems. Right dominant exposes RCA territory (segs 1–4, 16x); left dominant exposes seg 15 (PDA from LCx) and different LCx weights.

### Validation

- SYNTAX II: coefficients matched exactly to Farooq et al. 2013 supplementary appendix and verified against syntaxscore.org output
- EuroSCORE II: algorithm validated against the official euroscore.org JavaScript source (Nashef et al. 2012)

### Real-Time Calculation

All scores recalculate on every state change — no submit button. `calculateLesionScore()` and `calculateTotalScore()` are called inline during render. `ScorePanel` is sticky (`lg:sticky lg:top-4`) so the running score is always visible.

## Types Reference (`types.ts`)

Key interfaces:
- `Lesion` — id, color, segments[], occlusionType, totalOcclusionDetails, bifurcation, trifurcation, adverseFeatures, score
- `SyntaxIIInput` — age, crcl, lvef, leftMainDisease, gender, copd, pvd
- `SyntaxIIResult` — ss2PCI, ss2CABG, mortalityPCI, mortalityCABG, recommendation
- `SyntaxState` — dominance, lesions, diffuseDiseaseSegments, currentStep, editingLesionId, lesionStep
- `SegmentId` — union type of all 24 segment string IDs ('1'–'16c')

## References

1. Sianos G, et al. The SYNTAX Score. *EuroIntervention.* 2005;1:219-227.
2. Farooq V, et al. Anatomical and clinical characteristics to guide decision making between coronary artery bypass surgery and percutaneous coronary intervention for individual patients: development and validation of SYNTAX score II. *Lancet.* 2013;381:639-650.
3. Nashef SAM, et al. EuroSCORE II. *Eur J Cardiothorac Surg.* 2012;41:734-745.
4. Solomon A, et al. Essential Frailty Toolset. *J Am Heart Assoc.* 2021.
5. Afilalo J, et al. Frailty in Older Adults Undergoing Aortic Valve Replacement. *J Am Coll Cardiol.* 2017;70:689-700.
6. Leaman DM, et al. *Circulation.* 1981;63:285-299.
