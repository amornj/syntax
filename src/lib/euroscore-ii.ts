// EuroSCORE II Calculator
// Based on: Nashef SA, et al. Eur J Cardiothorac Surg. 2012;41(4):734-44.
// Coefficients from the original publication.

export interface EuroScoreIIInput {
  // Patient factors
  age: number
  gender: 'male' | 'female'
  insulinDependentDM: boolean
  chronicPulmonaryDysfunction: boolean   // = COPD from SYNTAX II
  poorMobility: boolean                  // neurological/musculoskeletal
  renalFunction: 'normal' | 'moderate' | 'severe' | 'dialysis'
  // normal = CrCl >85, moderate = CrCl 51-85, severe = CrCl ≤50, dialysis
  criticalPreopState: boolean

  // Cardiac-specific factors
  nyhaClass: 1 | 2 | 3 | 4
  ccsClass4Angina: boolean
  extracardiacArteriopathy: boolean      // = PVD from SYNTAX II
  previousCardiacSurgery: boolean
  activeEndocarditis: boolean
  lvefCategory: 'good' | 'moderate' | 'poor' | 'veryPoor'
  // good = ≥51%, moderate = 31-50%, poor = 21-30%, veryPoor = ≤20%
  recentMI: boolean                      // ≤90 days
  paSystolicPressure: 'low' | 'moderate' | 'severe'
  // low = <31 mmHg, moderate = 31-54 mmHg, severe = ≥55 mmHg

  // Procedural factors
  urgency: 'elective' | 'urgent' | 'emergency' | 'salvage'
  procedureWeight: 'isolatedCABG' | 'singleNonCABG' | 'twoMajor' | 'threePlusMajor'
  thoracicAortaSurgery: boolean
}

export interface EuroScoreIIResult {
  predictedMortality: number   // percentage
  linearPredictor: number      // y value
  riskCategory: 'low' | 'moderate' | 'high'
}

// ── Coefficients (from Nashef et al. 2012) ────────────────────────────────────

const INTERCEPT = -5.324537

const COEFF = {
  // Patient factors
  age: 0.0285181,               // per year above 60 (capped at 1 if ≤60)
  female: 0.2196434,
  insulinDependentDM: 0.3542749,
  chronicPulmonaryDysfunction: 0.1886564,
  poorMobility: 0.2407181,
  renalModerate: 0.303553,      // CrCl 51-85
  renalSevere: 0.8592256,       // CrCl ≤50
  renalDialysis: 0.6421508,
  criticalPreopState: 1.086517,

  // Cardiac factors
  nyha2: 0.1070545,
  nyha3: 0.2958358,
  nyha4: 0.5597929,
  ccsClass4: 0.2226147,
  extracardiacArteriopathy: 0.5360268,
  previousCardiacSurgery: 1.118599,
  activeEndocarditis: 0.6194522,
  lvefModerate: 0.3150652,      // 31-50%
  lvefPoor: 0.8084096,          // 21-30%
  lvefVeryPoor: 0.9346919,      // ≤20%
  recentMI: 0.1528943,
  paModerate: 0.1788899,        // 31-54 mmHg
  paSevere: 0.3491475,          // ≥55 mmHg

  // Procedural factors
  urgent: 0.3174673,
  emergency: 0.7039121,
  salvage: 1.362947,
  singleNonCABG: 0.0062118,
  twoMajor: 0.5521478,
  threePlusMajor: 0.9724533,
  thoracicAorta: 0.6527205,
}

// ── Helper: Derive renal function category from CrCl ──────────────────────────

export function renalCategoryFromCrCl(crcl: number, onDialysis: boolean): EuroScoreIIInput['renalFunction'] {
  if (onDialysis) return 'dialysis'
  if (crcl > 85) return 'normal'
  if (crcl >= 51) return 'moderate'
  return 'severe'
}

// ── Helper: Derive LVEF category from numeric LVEF ────────────────────────────

export function lvefCategoryFromValue(lvef: number): EuroScoreIIInput['lvefCategory'] {
  if (lvef >= 51) return 'good'
  if (lvef >= 31) return 'moderate'
  if (lvef >= 21) return 'poor'
  return 'veryPoor'
}

// ── Main calculation ──────────────────────────────────────────────────────────

export function calculateEuroScoreII(input: EuroScoreIIInput): EuroScoreIIResult {
  let y = INTERCEPT

  // Age: 1 × coeff if ≤60, else (age - 59) × coeff
  // i.e., age factor = max(1, age - 59)
  const ageFactor = input.age <= 60 ? 1 : (input.age - 59)
  y += ageFactor * COEFF.age

  // Gender
  if (input.gender === 'female') y += COEFF.female

  // Insulin-dependent DM
  if (input.insulinDependentDM) y += COEFF.insulinDependentDM

  // Chronic pulmonary dysfunction (COPD)
  if (input.chronicPulmonaryDysfunction) y += COEFF.chronicPulmonaryDysfunction

  // Poor mobility
  if (input.poorMobility) y += COEFF.poorMobility

  // Renal function
  switch (input.renalFunction) {
    case 'moderate': y += COEFF.renalModerate; break
    case 'severe':   y += COEFF.renalSevere; break
    case 'dialysis': y += COEFF.renalDialysis; break
  }

  // Critical preop state
  if (input.criticalPreopState) y += COEFF.criticalPreopState

  // NYHA class
  switch (input.nyhaClass) {
    case 2: y += COEFF.nyha2; break
    case 3: y += COEFF.nyha3; break
    case 4: y += COEFF.nyha4; break
  }

  // CCS class 4 angina
  if (input.ccsClass4Angina) y += COEFF.ccsClass4

  // Extracardiac arteriopathy (PVD)
  if (input.extracardiacArteriopathy) y += COEFF.extracardiacArteriopathy

  // Previous cardiac surgery
  if (input.previousCardiacSurgery) y += COEFF.previousCardiacSurgery

  // Active endocarditis
  if (input.activeEndocarditis) y += COEFF.activeEndocarditis

  // LVEF
  switch (input.lvefCategory) {
    case 'moderate': y += COEFF.lvefModerate; break
    case 'poor':     y += COEFF.lvefPoor; break
    case 'veryPoor': y += COEFF.lvefVeryPoor; break
  }

  // Recent MI
  if (input.recentMI) y += COEFF.recentMI

  // PA systolic pressure
  switch (input.paSystolicPressure) {
    case 'moderate': y += COEFF.paModerate; break
    case 'severe':   y += COEFF.paSevere; break
  }

  // Urgency
  switch (input.urgency) {
    case 'urgent':    y += COEFF.urgent; break
    case 'emergency': y += COEFF.emergency; break
    case 'salvage':   y += COEFF.salvage; break
  }

  // Weight of procedure
  switch (input.procedureWeight) {
    case 'singleNonCABG': y += COEFF.singleNonCABG; break
    case 'twoMajor':      y += COEFF.twoMajor; break
    case 'threePlusMajor': y += COEFF.threePlusMajor; break
  }

  // Thoracic aorta surgery
  if (input.thoracicAortaSurgery) y += COEFF.thoracicAorta

  // Predicted mortality = e^y / (1 + e^y)
  const expY = Math.exp(y)
  const predictedMortality = (expY / (1 + expY)) * 100

  // Risk stratification
  const riskCategory: EuroScoreIIResult['riskCategory'] =
    predictedMortality < 2 ? 'low' :
    predictedMortality < 5 ? 'moderate' : 'high'

  return {
    predictedMortality,
    linearPredictor: y,
    riskCategory,
  }
}
