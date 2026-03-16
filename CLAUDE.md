# SYNTAX Score Calculator — Build Spec

## Overview
A modern webapp to calculate the SYNTAX I Score — an angiographic tool grading the complexity of coronary artery disease. This is the gold standard for deciding between PCI and CABG in multivessel/left main disease. **Accuracy is paramount** — validate against the original calculator at syntaxscore.org.

## Tech Stack
- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **shadcn/ui** components
- No backend — pure client-side calculation
- Deploy to Vercel

## SYNTAX Score Algorithm (MUST BE EXACT)

The SYNTAX score is **lesion-based**. Each lesion ≥50% diameter stenosis in vessels ≥1.5mm is scored separately. Total SYNTAX score = sum of all individual lesion scores.

### Step 1: Coronary Dominance (asked once)
- **Right dominant** (most common, ~85%)
- **Left dominant** (~15%)
This changes segment weighting factors.

### Step 2: Define Lesions
Each lesion involves one or more coronary segments. Tandem lesions <3 vessel reference diameters apart = 1 lesion. Max 12 lesions.

### Step 3: 16-Segment Coronary Tree (AHA modified for ARTS)

| Seg | Name | Right Dom Weight | Left Dom Weight |
|-----|------|-----------------|-----------------|
| 1 | RCA proximal | 1.0 | 0 |
| 2 | RCA mid | 1.0 | 0 |
| 3 | RCA distal | 1.0 | 0 |
| 4 | PDA (from RCA) | 1.0 | — |
| 5 | Left Main | 5.0 | 6.0 |
| 6 | LAD proximal | 3.5 | 3.5 |
| 7 | LAD mid | 2.5 | 2.5 |
| 8 | LAD apical | 1.0 | 1.0 |
| 9 | First Diagonal (D1) | 1.0 | 1.0 |
| 9a | First Diagonal a | 1.0 | 1.0 |
| 10 | Second Diagonal (D2) | 0.5 | 0.5 |
| 10a | Second Diagonal a | 0.5 | 0.5 |
| 11 | Proximal LCx | 1.5 | 2.5 |
| 12 | Intermediate/Anterolateral | 1.0 | 1.0 |
| 12a | Obtuse Marginal a (OM1) | 1.0 | 1.0 |
| 12b | Obtuse Marginal b (OM2) | 1.0 | 1.0 |
| 13 | Distal LCx | 0.5 | 1.5 |
| 14 | Left Posterolateral | 0.5 | 1.0 |
| 14a | Left Posterolateral a | 0.5 | 1.0 |
| 14b | Left Posterolateral b | 0.5 | 1.0 |
| 15 | PDA (from LCx — left dom only) | — | 1.0 |
| 16 | Posterolateral from RCA | 0.5 | — |
| 16a | Posterolateral a from RCA | 0.5 | — |
| 16b | Posterolateral b from RCA | 0.5 | — |
| 16c | Posterolateral c from RCA | 0.5 | — |

**Note:** In left dominant system, segments 4, 16, 16a, 16b, 16c are absent. Segment 15 appears instead.

### Step 4: Lesion Base Score Calculation
```
Lesion Base Score = (Sum of segment weights for involved segments) × Multiplication Factor
```
- **Non-occlusive (50-99% stenosis):** multiplication factor = **2**
- **Total occlusion (100%):** multiplication factor = **5**

### Step 5: Adverse Lesion Characteristics (ADDITIVE to base score)

#### A. Total Occlusion sub-questions (if 100% stenosis):
| Feature | Points |
|---------|--------|
| Age of TO >3 months (or unknown) | +1 |
| Blunt stump | +1 |
| Bridging collaterals | +1 |
| Side branch ≥1.5mm at occlusion site | +1 per branch |
| First segment visible beyond TO | (used for length calculation, +1 per additional segment) |

#### B. Trifurcation:
| Diseased Segments | Points |
|-------------------|--------|
| 1 segment diseased | +3 |
| 2 segments diseased | +4 |
| 3 segments diseased | +5 |
| 4 segments diseased | +6 |

Valid trifurcation locations: 5/6/11/12, 3/4/16/16a, 6/7/9/9a, 7/8/10/10a, 11/13/12a/12b

#### C. Bifurcation (Medina classification):
| Type | Description | Points |
|------|-------------|--------|
| A | Pre-branch, no ostial SB involvement (Medina 1,0,0) | +1 |
| B | Post-branch, no ostial SB involvement (Medina 0,1,0) | +1 |
| C | Both pre+post, no ostial SB involvement (Medina 1,1,0) | +1 |
| D | Main vessel + ostium SB (Medina 1,1,1) | +2 |
| E | Ostium SB only (Medina 0,0,1) | +2 |
| F | Pre-branch + ostium SB (Medina 1,0,1) | +2 |
| G | Post-branch + ostium SB (Medina 0,1,1) | +2 |

**Bifurcation angulation <70°:** additional +1 point

Valid bifurcation locations: 5/6/11, 6/7/9, 7/8/10, 11/13/12a, 13/14/14a, 3/4/16, and 13/14/15 (left dominant)

#### D. Other Adverse Characteristics:
| Feature | Points |
|---------|--------|
| Aorto-ostial lesion (segments 1, 5, or 6/11 if no LM) | +1 |
| Severe tortuosity | +2 |
| Lesion length >20mm | +1 |
| Heavy calcification | +2 |
| Thrombus | +1 |

### Step 6: Diffuse Disease/Small Vessels (asked ONCE, not per lesion)
- Present when ≥75% of segment length has vessel diameter <2mm
- +1 point per segment with diffuse disease
- Can apply to segments proximal, at, or distal to lesions

### Score Interpretation
| SYNTAX Score | Tertile | Recommendation |
|-------------|---------|----------------|
| 0–22 | Low | PCI reasonable, comparable to CABG |
| 23–32 | Intermediate | Heart team discussion recommended |
| ≥33 | High | CABG preferred over PCI |

## UI Requirements

### Design Philosophy
- **Wizard/step-by-step flow** — mirrors the original syntaxscore.org but with modern UX
- **Mobile-responsive** — works on iPad in cath lab
- **Progress indicator** — show which step user is on
- **Score visible throughout** — running total always displayed

### Flow (Screens/Steps):
1. **Welcome/Start** — brief explanation, "Begin Scoring" button
2. **Dominance** — Right or Left dominant (radio buttons, coronary diagram)
3. **Lesion Manager** — add/edit/delete lesions, shows list with per-lesion scores
4. **Per-Lesion Scoring** (sub-wizard for each lesion):
   a. **Segment Selection** — interactive coronary diagram, check involved segments
   b. **Occlusion Status** — non-occlusive (50-99%) or total occlusion (100%)
   c. **Total Occlusion Details** (if applicable) — age, blunt stump, bridging, side branches, first visible segment
   d. **Trifurcation** — is this a trifurcation? How many segments diseased?
   e. **Bifurcation** — is this a bifurcation? Medina type, angulation
   f. **Other Features** — aorto-ostial, tortuosity, length, calcification, thrombus
5. **Diffuse Disease** — select segments with diffuse disease/small vessels
6. **Results Summary** — total score, per-lesion breakdown, interpretation, export

### Interactive Coronary Artery Diagram
- SVG-based 16-segment coronary tree
- Changes based on dominance selection
- Clickable segments for lesion segment selection
- Color-coded: involved segments highlighted, different colors per lesion
- Labels for all segment numbers and names

### Key UI Features:
- **Lesion color coding** — each lesion gets a unique color on the diagram
- **Running score** — always visible in a sticky sidebar/header
- **Score breakdown** — expandable per-lesion detail
- **Medina classification visual** — show the bifurcation diagram for type selection
- **Undo/Edit** — can go back and modify any lesion
- **Export** — copy report or save as PDF
- **Reset** — start over
- **Quick reference** — collapsible panel with scoring tables

### Score Summary Page:
- Total SYNTAX Score (large, bold)
- Tertile interpretation with color (green/yellow/red)
- Per-lesion breakdown table
- Vessel involvement summary
- PCI vs CABG recommendation
- Copy/export report

## File Structure
```
syntax/
├── CLAUDE.md
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── SyntaxCalculator.tsx     — main orchestrator with step wizard
│   │   ├── DominanceStep.tsx        — step 1: dominance selection
│   │   ├── LesionManager.tsx        — lesion list/add/edit/delete
│   │   ├── SegmentSelector.tsx      — interactive segment selection per lesion
│   │   ├── OcclusionStep.tsx        — occlusion status + TO sub-questions
│   │   ├── BifurcationStep.tsx      — bifurcation/trifurcation questions
│   │   ├── AdverseFeatures.tsx      — other adverse characteristics
│   │   ├── DiffuseDiseaseStep.tsx   — diffuse disease/small vessel (once)
│   │   ├── ScoreSummary.tsx         — final results + interpretation
│   │   ├── CoronaryDiagram.tsx      — SVG coronary tree (16 segments)
│   │   ├── RunningScore.tsx         — sticky score display
│   │   └── ReferencePanel.tsx       — collapsible scoring reference
│   ├── lib/
│   │   ├── syntax-score.ts          — core scoring engine (pure functions)
│   │   ├── segments.ts              — segment definitions + weights
│   │   ├── types.ts                 — TypeScript types
│   │   └── bifurcation.ts           — bifurcation/trifurcation logic
│   └── data/
│       ├── segment-weights.ts       — weight tables (right/left dominant)
│       └── constants.ts             — scoring constants
```

## Validation
After building, test these scenarios against syntaxscore.org:
1. **Simple case:** Single lesion in proximal LAD (seg 6), non-occlusive → 3.5 × 2 = 7
2. **Left main + LAD:** LM/LAD bifurcation (seg 5+6), non-occlusive, Medina 1,1,1 → (5+3.5)×2 + 2 = 19
3. **CTO RCA:** Total occlusion RCA mid (seg 2), age >3mo, blunt stump → 1×5 + 1 + 1 = 7
4. **Three-vessel disease:** Multiple lesions across LAD, LCx, RCA

## References
1. Sianos G, et al. The SYNTAX Score: an angiographic tool grading the complexity of CAD. EuroIntervention. 2005;1:219-227.
2. Serruys PW, et al. Percutaneous coronary intervention versus coronary-artery bypass grafting for severe coronary artery disease. N Engl J Med. 2009;360:961-972.
3. SYNTAX Score Calculator: https://syntaxscore.org
4. Leaman DM, et al. Coronary artery atherosclerosis: severity of the disease, severity of angina pectoris and compromised left ventricular function. Circulation. 1981;63:285-299.

## CRITICAL ACCURACY NOTES
- Segment weights MUST match the original Leaman-based SYNTAX weighting
- Multiplication factors: non-occlusive = 2, occlusive = 5 (NOT the Gensini system)
- Bifurcation types A/B/C = 1 point; D/E/F/G = 2 points
- Trifurcation: 3/4/5/6 points for 1/2/3/4 diseased segments
- Diffuse disease is per-PATIENT, not per-lesion
- Score tertiles: 0-22 low, 23-32 intermediate, ≥33 high
