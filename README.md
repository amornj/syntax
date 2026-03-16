# SYNTAX Score Calculator

A modern web-based calculator for the SYNTAX I Score — the angiographic gold standard for grading coronary artery disease complexity and guiding PCI vs CABG decisions.

## What is the SYNTAX Score?

The SYNTAX (SYNergy between PCI with TAXUS and Cardiac Surgery) Score quantifies coronary artery disease complexity by evaluating:
- **Lesion location** weighted by myocardial blood supply (Leaman score)
- **Occlusion severity** (non-occlusive vs total occlusion)
- **Adverse characteristics** (bifurcations, trifurcations, calcification, tortuosity, etc.)
- **Diffuse disease** and small vessel involvement

Higher scores indicate more complex disease, guiding the Heart Team's revascularization strategy.

## Features

- 🫀 **Interactive 16-segment coronary diagram** — click to select involved segments
- 📊 **Step-by-step wizard** — mirrors the original syntaxscore.org flow
- 🔄 **Dominance-aware** — adjusts segment weights for right/left dominant systems
- 📱 **Mobile-responsive** — optimized for cath lab iPad use
- 📋 **Detailed report** — per-lesion breakdown with export
- 📚 **Built-in reference** — scoring tables and Medina classification

## Score Interpretation

| SYNTAX Score | Tertile | Recommendation |
|-------------|---------|----------------|
| 0–22 | Low | PCI reasonable |
| 23–32 | Intermediate | Heart team discussion |
| ≥33 | High | CABG preferred |

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## References

1. Sianos G, et al. The SYNTAX Score: an angiographic tool grading the complexity of CAD. *EuroIntervention.* 2005;1:219-227.
2. Serruys PW, et al. PCI versus CABG for severe CAD. *N Engl J Med.* 2009;360:961-972.
3. SYNTAX Score Calculator: [syntaxscore.org](https://syntaxscore.org)
4. Leaman DM, et al. Coronary artery atherosclerosis. *Circulation.* 1981;63:285-299.

## License

MIT
