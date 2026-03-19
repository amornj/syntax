// Essential Frailty Toolset (EFT)
// TAVR/SAVR: Afilalo et al., JACC 2017 (FRAILTY-AVR)
// CABG: Solomon et al., JAHA 2021

export interface EFTInput {
  gender: 'male' | 'female'
  chairStandsTime: number | null   // seconds (1-60), null if not measured
  chairStandsUnable: boolean       // unable to complete
  cognitiveImpairment: boolean     // MMSE <24
  hemoglobin: number | null        // g/dL
  albumin: number | null           // g/dL
}

export type FrailtyClass = 'robust' | 'prefrail' | 'frail'

export interface EFTResult {
  score: number                    // 0-5
  frailtyClass: FrailtyClass
  mortality1yr: { tavr: number; savr: number; cabg: number }
  mortality5yr: { cabg: number }
  cabgSecondary: {
    losGe14d: number
    dischargeFacility: number
    readmit30d: number
    majorMorbidity: number
  }
}

// 1-year mortality (%) by EFT score
const MORTALITY_1YR: Record<number, { tavr: number; savr: number; cabg: number }> = {
  0: { tavr: 6, savr: 3, cabg: 2 },
  1: { tavr: 6, savr: 3, cabg: 4 },
  2: { tavr: 15, savr: 7, cabg: 6 },
  3: { tavr: 28, savr: 16, cabg: 9 },
  4: { tavr: 30, savr: 38, cabg: 12 },
  5: { tavr: 65, savr: 50, cabg: 15 },
}

// 5-year mortality for CABG (Solomon et al.)
const MORTALITY_5YR_CABG: Record<number, number> = {
  0: 11, 1: 14, 2: 20, 3: 37, 4: 42, 5: 50,
}

// CABG secondary outcomes by frailty group (Solomon et al., Table 2)
const CABG_SECONDARY: Record<FrailtyClass, { losGe14d: number; dischargeFacility: number; readmit30d: number; majorMorbidity: number }> = {
  robust:   { losGe14d: 5,  dischargeFacility: 2,  readmit30d: 8,  majorMorbidity: 15 },
  prefrail: { losGe14d: 10, dischargeFacility: 4,  readmit30d: 12, majorMorbidity: 19 },
  frail:    { losGe14d: 26, dischargeFacility: 11, readmit30d: 24, majorMorbidity: 31 },
}

export function getFrailtyClass(score: number): FrailtyClass {
  if (score === 0) return 'robust'
  if (score <= 2) return 'prefrail'
  return 'frail'
}

export function calculateEFT(input: EFTInput): EFTResult {
  let score = 0

  // Chair stands: unable = 2pts, ≥15s = 1pt, <15s = 0
  if (input.chairStandsUnable) {
    score += 2
  } else if (input.chairStandsTime !== null && input.chairStandsTime >= 15) {
    score += 1
  }

  // Cognitive impairment (MMSE <24): 1pt
  if (input.cognitiveImpairment) {
    score += 1
  }

  // Anemia: male <13, female <12 = 1pt
  if (input.hemoglobin !== null) {
    const threshold = input.gender === 'female' ? 12 : 13
    if (input.hemoglobin < threshold) score += 1
  }

  // Hypoalbuminemia <3.5 = 1pt
  if (input.albumin !== null && input.albumin < 3.5) {
    score += 1
  }

  // Cap at 5 (max possible)
  score = Math.min(score, 5)

  const frailtyClass = getFrailtyClass(score)

  return {
    score,
    frailtyClass,
    mortality1yr: MORTALITY_1YR[score],
    mortality5yr: { cabg: MORTALITY_5YR_CABG[score] },
    cabgSecondary: CABG_SECONDARY[frailtyClass],
  }
}
