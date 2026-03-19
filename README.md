# SYNTAX Score Calculator

A modern, single-page web application for comprehensive coronary revascularization risk assessment. Integrates SYNTAX Score I, SYNTAX Score II, EuroSCORE II, and the Essential Frailty Toolset into one fast, cath-lab-ready interface.

**Live demo:** https://syntax-azure.vercel.app

## What It Does

The app guides the Heart Team through five integrated sections:

1. **SYNTAX Score I** — Anatomical coronary complexity scoring. Lesion-by-lesion evaluation across the 16-segment AHA coronary model, including occlusion type, bifurcation/trifurcation, calcification, tortuosity, and diffuse disease. Replaces the multi-page wizard at syntaxscore.org with a single-page flow completable in under 2 minutes.

2. **SYNTAX Score II** — Clinical 4-year mortality prediction for PCI vs CABG. Incorporates anatomical complexity (SYNTAX I score) with clinical variables: age, gender, creatinine clearance, LVEF, COPD, PVD, and left main disease. Outputs predicted mortality for each strategy with a recommendation.

3. **EuroSCORE II** — In-hospital cardiac surgery mortality risk. Evaluates 18 patient and procedural variables per the Nashef et al. 2012 model.

4. **Essential Frailty Toolset (EFT)** — Preoperative frailty assessment via chair stands, cognitive screening, hemoglobin, and albumin. Classifies patients as Robust, Pre-Frail, or Frail.

5. **Risk Assessment Summary** — A 4-card consolidated view of all results with decision guidance and one-click export (plain text copy, self-contained HTML file, or print).

## Features

- Single-page layout — no wizard, no page reloads, all sections always visible
- Interactive SVG coronary diagram with clickable segment selection
- Dominance-aware scoring — right and left dominant coronary systems
- Shared parameter flow: demographics entered once in SYNTAX II auto-populate EuroSCORE II and EFT
- Left Main Disease auto-detected from SYNTAX I segment 5, with manual override
- Real-time score calculation — every field updates the running total instantly
- Sticky score panel always in view during lesion entry
- Self-contained HTML export for sharing results
- Mobile-responsive for cath lab use

## Score Interpretation

### SYNTAX Score I

| Score | Tertile | Recommendation |
|-------|---------|----------------|
| 0–22 | Low | PCI reasonable |
| 23–32 | Intermediate | Heart Team discussion |
| ≥33 | High | CABG preferred |

### EuroSCORE II

| Predicted Mortality | Risk Level |
|--------------------|------------|
| <2% | Low |
| 2–5% | Moderate |
| >5% | High |

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) component primitives
- No backend — pure client-side calculation
- Deployed on [Vercel](https://vercel.com/)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Validation

- SYNTAX II coefficients verified against Farooq et al. 2013 supplementary appendix and cross-checked with syntaxscore.org
- EuroSCORE II algorithm validated against the official euroscore.org JavaScript source

## References

1. Sianos G, et al. The SYNTAX Score: an angiographic tool grading the complexity of coronary artery disease. *EuroIntervention.* 2005;1:219-227.
2. Farooq V, et al. Anatomical and clinical characteristics to guide decision making between CABG and PCI: development and validation of SYNTAX score II. *Lancet.* 2013;381:639-650.
3. Nashef SAM, et al. EuroSCORE II. *Eur J Cardiothorac Surg.* 2012;41:734-745.
4. Solomon A, et al. Essential Frailty Toolset. *J Am Heart Assoc.* 2021.
5. Afilalo J, et al. Frailty in Older Adults Undergoing Aortic Valve Replacement. *J Am Coll Cardiol.* 2017;70:689-700.
6. Leaman DM, et al. Coronary artery atherosclerosis: a new prognostic classification. *Circulation.* 1981;63:285-299.

## License

MIT
