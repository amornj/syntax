# SYNTAX Score Calculator — Build Spec

## Overview
A modern webapp to calculate the SYNTAX I Score — an angiographic tool grading the complexity of coronary artery disease. This replaces the painful multi-page wizard at syntaxscore.org with a **single-page, fast, modern UI** that a cardiologist can complete in under 2 minutes instead of 5-10.

## Tech Stack
- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **shadcn/ui** components
- No backend — pure client-side calculation
- Deploy to Vercel

## ⚡ UX PHILOSOPHY: SPEED OVER WIZARDS

The #1 pain point of syntaxscore.org is: **too many clicks, too many pages, 5-10 minutes per case.**

Our design principle: **SINGLE PAGE, ALL VISIBLE, MINIMUM CLICKS.**

### Design Rules:
1. **No wizard/multi-step flow** — everything on ONE page with expandable sections
2. **Dominance toggle** at the top (2 buttons, done in 1 click)
3. **Add lesion = one button** → inline expandable card appears with ALL options visible at once
4. **Segment selection** via clickable coronary diagram OR quick-select buttons (grouped by vessel)
5. **Adverse features** = toggle switches/checkboxes, all visible at once (no next/back)
6. **Bifurcation type** = visual diagram with clickable types (Medina pattern, 1 click)
7. **Running score** always visible in sticky sidebar
8. **Diffuse disease** = segment multi-select at the bottom
9. Target: **complete a 3-vessel disease case in <2 minutes**

## SYNTAX Score Algorithm (MUST BE EXACT)

The SYNTAX score is **lesion-based**. Each lesion ≥50% diameter stenosis in vessels ≥1.5mm is scored separately. Total SYNTAX score = sum of all individual lesion scores + diffuse disease points.

### Coronary Dominance (toggle at top)
- **Right dominant** (default, ~85%)
- **Left dominant** (~15%)
This changes segment weighting factors.

### 16-Segment Coronary Tree (AHA modified for ARTS)

| Seg | Name | Right Dom | Left Dom |
|-----|------|-----------|----------|
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
| 15 | PDA (from LCx, left dom only) | — | 1.0 |
| 16 | Posterolateral from RCA | 0.5 | — |
| 16a | Posterolateral a from RCA | 0.5 | — |
| 16b | Posterolateral b from RCA | 0.5 | — |
| 16c | Posterolateral c from RCA | 0.5 | — |

### Lesion Base Score
```
Base Score = (Sum of segment weights) × Multiplication Factor
```
- **Non-occlusive (50-99%):** × 2
- **Total occlusion (100%):** × 5

### Adverse Characteristics (ADDITIVE points per lesion)

#### Total Occlusion sub-features (only if 100%):
| Feature | Points |
|---------|--------|
| Age >3 months or unknown | +1 |
| Blunt stump | +1 |
| Bridging collaterals | +1 |
| Side branch ≥1.5mm | +1 per branch |
| First segment beyond TO | +1 per additional segment |

#### Trifurcation:
| Diseased segments | Points |
|-------------------|--------|
| 1 segment | +3 |
| 2 segments | +4 |
| 3 segments | +5 |
| 4 segments | +6 |

Valid locations: 5/6/11/12, 3/4/16/16a, 6/7/9/9a, 7/8/10/10a, 11/13/12a/12b

#### Bifurcation (Medina):
| Type | Points |
|------|--------|
| A (1,0,0) / B (0,1,0) / C (1,1,0) | +1 |
| D (1,1,1) / E (0,0,1) / F (1,0,1) / G (0,1,1) | +2 |
| Angulation <70° | additional +1 |

Valid locations: 5/6/11, 6/7/9, 7/8/10, 11/13/12a, 13/14/14a, 3/4/16, 13/14/15 (left dom)

#### Other features:
| Feature | Points |
|---------|--------|
| Aorto-ostial (seg 1, 5, or 6/11 if no LM) | +1 |
| Severe tortuosity | +2 |
| Length >20mm | +1 |
| Heavy calcification | +2 |
| Thrombus | +1 |

### Diffuse Disease/Small Vessels (ONCE per patient)
- ≥75% of segment length has vessel <2mm
- +1 point per affected segment

### Interpretation
| Score | Tertile | Recommendation |
|-------|---------|----------------|
| 0–22 | Low | PCI reasonable |
| 23–32 | Intermediate | Heart Team discussion |
| ≥33 | High | CABG preferred |

## UI Layout (Single Page)

```
┌─────────────────────────────────────────────────────────┐
│ SYNTAX Score Calculator            [Right ◉] [○ Left]   │
├────────────────────────────────┬────────────────────────┤
│                                │                        │
│  CORONARY DIAGRAM (SVG)        │  SCORE PANEL (sticky)  │
│  - 16 segments, clickable      │  ┌──────────────────┐  │
│  - Color per lesion             │  │ SYNTAX Score: 28 │  │
│  - Dominance-aware              │  │ ■ Intermediate   │  │
│                                │  │ Heart Team Disc. │  │
│  [Seg buttons: RCA | LAD |     │  ├──────────────────┤  │
│   LCx | Other]                 │  │ Lesion 1: 14     │  │
│                                │  │ Lesion 2: 7      │  │
│                                │  │ Lesion 3: 5      │  │
│                                │  │ Diffuse: 2       │  │
│                                │  └──────────────────┘  │
├────────────────────────────────┴────────────────────────┤
│  LESIONS                                   [+ Add Lesion]│
│  ┌──────────────────────────────────────────────────────┐│
│  │ Lesion 1 (●) Seg 5,6 | Non-occlusive        Score:14││
│  │ ┌─────────────────────────────────────────────────┐  ││
│  │ │ Segments: [5 LM ✓] [6 pLAD ✓] [7] [8] ...     │  ││
│  │ │ Occlusion: [◉ 50-99%] [○ 100%]                 │  ││
│  │ │ Bifurcation: [✓] Type: [D ●] Angle<70°: [✓]    │  ││
│  │ │ Trifurcation: [ ] Diseased segs: [1][2][3][4]   │  ││
│  │ │ ┌──── Other Features ────────────────────┐      │  ││
│  │ │ │ [✓] Heavy calcification (+2)           │      │  ││
│  │ │ │ [ ] Aorto-ostial (+1)                  │      │  ││
│  │ │ │ [ ] Severe tortuosity (+2)             │      │  ││
│  │ │ │ [ ] Length >20mm (+1)                  │      │  ││
│  │ │ │ [ ] Thrombus (+1)                      │      │  ││
│  │ │ └────────────────────────────────────────┘      │  ││
│  │ └─────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │ Lesion 2 (●) Seg 2 | Total Occlusion        Score: 7││
│  │ [collapsed — click to expand]                        ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  DIFFUSE DISEASE / SMALL VESSELS                         │
│  Select segments: [1][ ][3][ ][ ][6][ ][ ]...    +2 pts │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ [Export Report]  [Reset All]  [Reference Tables ▼]   ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Key UX Patterns:
1. **Lesion cards** — each lesion is an expandable card. Latest one auto-expands. Click header to collapse/expand.
2. **Segment selection** — dual mode: click on diagram OR click segment buttons (grouped by vessel). Both update simultaneously.
3. **Toggle switches** for all yes/no features (not dropdowns or radio pages)
4. **Bifurcation type** — show small Medina diagrams (3 circles: proximal, distal, side branch) as clickable buttons. User picks visually in 1 click.
5. **Total occlusion details** — only appear when "100% Total Occlusion" is selected (smooth expand animation)
6. **Trifurcation details** — only appear when trifurcation toggle is on
7. **Score updates in real-time** as user toggles any option
8. **Color system** — each lesion gets a distinct color, shown on diagram and in score panel
9. **Mobile:** stack diagram above score panel, lesion cards full-width

## Validation Test Cases
1. Single proximal LAD non-occlusive → 3.5 × 2 = **7.0**
2. LM/LAD bifurcation (seg 5+6), non-occlusive, Medina D (1,1,1) → (5+3.5)×2 + 2 = **19.0**
3. CTO RCA mid (seg 2), age >3mo, blunt stump → 1×5 + 1 + 1 = **7.0**
4. LM trifurcation (seg 5,6,11,12), 4 diseased, non-occlusive → (5+3.5+1.5+1)×2 + 6 = **28.0**

## References
1. Sianos G, et al. The SYNTAX Score. EuroIntervention. 2005;1:219-227.
2. Serruys PW, et al. PCI vs CABG. N Engl J Med. 2009;360:961-972.
3. syntaxscore.org
4. Leaman DM, et al. Circulation. 1981;63:285-299.

## EXISTING CODE
Silver already created segments.ts and types.ts in src/lib/ — USE THEM as-is, they are correct. Build the rest of the components on top.
