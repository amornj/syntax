import { SyntaxIIInput, SyntaxIIResult } from './types'

// ── Constants from original SYNTAX II calculator ─────────────────────────────

const MATRIX_T: number[][] = [
  [ 4.7974789,    -0.0022691742, -0.041283075,  -0.014209803,  -0.015760779,  0.016421691,  -0.13220816,   -0.029747290,  -0.072484832  ],
  [-0.0022691742,  0.00017558373, -0.000039818421, -0.0000038640218, 0.000010274595, -0.00045952233, -0.00042217922, -0.00018668306, -0.00023176363],
  [-0.041283075,  -0.000039818421, 0.00050586537,  0.00013189496, -0.000042132029, -0.00049111250,  0.00035032298, -0.000040442897, 0.00018785665 ],
  [-0.014209803,  -0.0000038640218, 0.00013189496, 0.00011255699, -0.000043774476, -0.000096217752, -0.00065604327, 0.000069536561, 0.00043958607 ],
  [-0.015760779,   0.000010274595, -0.000042132029, -0.000043774476, 0.00044180161, -0.00023193162, 0.0010977041,  0.00014896064,  0.00020527758 ],
  [ 0.016421691,  -0.00045952233, -0.00049111250, -0.000096217752, -0.00023193162, 0.099396936,    0.0074237030,  0.0057716330,  -0.0039146463  ],
  [-0.13220816,   -0.00042217922,  0.00035032298, -0.00065604327,  0.0010977041,  0.0074237030,    0.14623999,   -0.0021780574,  -0.0018524115  ],
  [-0.029747290,  -0.00018668306, -0.000040442897, 0.000069536561, 0.00014896064, 0.0057716330,   -0.0021780574,  0.17207925,    -0.018464301   ],
  [-0.072484832,  -0.00023176363,  0.00018785665,  0.00043958607,  0.00020527758, -0.0039146463,  -0.0018524115, -0.018464301,   0.13182483     ],
]

const GAMMA_PCI  = [5.9363531, 0.0239369855, 0.025503045, -0.0203536122, -0.05782588, -0.20157158, -0.53147248, 0.30235489, 1.0269338356630]
const GAMMA_CABG = [5.936353100, -0.003465218500, 0.063047153, -0.009266941200, -0.017106187, 0.38612534, 0.52174742, 1.0428342, 1.0268928]

const CUM_HAZ            = 0.075349171
const NOMOGRAM_INTERCEPT = -2.5885388
const NOMOGRAM_SLOPE     = 0.084062871
const LP_CENTER          = 3.4210909

// ── Math helpers ─────────────────────────────────────────────────────────────

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0)
}

function matVec(M: number[][], v: number[]): number[] {
  return M.map(row => dot(row, v))
}

// Abramowitz & Stegun approximation — max error < 7.5e-8
function normalCDF(x: number): number {
  const abs = Math.abs(x)
  const t   = 1 / (1 + 0.2316419 * abs)
  const phi = Math.exp(-0.5 * abs * abs) / Math.sqrt(2 * Math.PI)
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const cdf  = 1 - phi * poly
  return x >= 0 ? cdf : 1 - cdf
}

// ── Main calculation ──────────────────────────────────────────────────────────

/**
 * Calculate SYNTAX Score II.
 * Input vector: [treatment, ss1, age, min(crcl,90), min(lvef,50), leftMain, gender(m=1), copd, pvd]
 */
export function calculateSyntaxII(syntaxIScore: number, input: SyntaxIIInput): SyntaxIIResult {
  const { age, crcl, lvef, leftMainDisease, gender, copd, pvd } = input

  const crclCapped = Math.min(crcl, 90)
  const lvefCapped = Math.min(lvef, 50)
  const lm         = leftMainDisease ? 1 : 0
  const genderVal  = gender === 'male' ? 1 : 0
  const copdVal    = copd ? 1 : 0
  const pvdVal     = pvd  ? 1 : 0

  const z_PCI:  number[] = [1, syntaxIScore, age, crclCapped, lvefCapped, lm, genderVal, copdVal, pvdVal]
  const z_CABG: number[] = [0, syntaxIScore, age, crclCapped, lvefCapped, lm, genderVal, copdVal, pvdVal]

  // Step 1: Linear predictors
  const lp_PCI   = dot(z_PCI,  GAMMA_PCI)
  const lp_CABG  = dot(z_CABG, GAMMA_CABG)
  const lp_delta = lp_PCI - lp_CABG

  // Step 2: Standard error of delta (z_delta = z_PCI, treatment=1)
  const v        = matVec(MATRIX_T, z_PCI)
  const variance = dot(z_PCI, v)
  const se_delta = Math.sqrt(Math.abs(variance))

  // Step 3: SYNTAX II scores (nomogram scale)
  const ss2PCI  = (lp_PCI  - LP_CENTER - NOMOGRAM_INTERCEPT) / NOMOGRAM_SLOPE
  const ss2CABG = (lp_CABG - LP_CENTER - NOMOGRAM_INTERCEPT) / NOMOGRAM_SLOPE

  // Step 4: Predicted 4-year mortality (%)
  const mortalityPCI  = 100 * (1 - Math.exp(-CUM_HAZ * Math.exp(lp_PCI  - LP_CENTER)))
  const mortalityCABG = 100 * (1 - Math.exp(-CUM_HAZ * Math.exp(lp_CABG - LP_CENTER)))

  // Step 5: Two-tailed p-value
  const zStat  = Math.abs(lp_delta) / se_delta
  const pValue = normalCDF(-zStat) * 2

  const recommendation: SyntaxIIResult['recommendation'] =
    mortalityPCI < mortalityCABG ? 'PCI' :
    mortalityCABG < mortalityPCI ? 'CABG' : 'equipoise'

  return { ss2PCI, ss2CABG, mortalityPCI, mortalityCABG, lpDelta: lp_delta, seDelta: se_delta, pValue, recommendation }
}

// ── Cockcroft-Gault ───────────────────────────────────────────────────────────

export interface CGInput {
  age: number
  weightKg: number
  serumCreatinineMgDl: number
  gender: 'male' | 'female'
}

export function calculateCockcroftGault({ age, weightKg, serumCreatinineMgDl, gender }: CGInput): number {
  const crcl = ((140 - age) * weightKg) / (72 * serumCreatinineMgDl)
  return gender === 'female' ? crcl * 0.85 : crcl
}
