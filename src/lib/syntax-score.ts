import { Dominance, Lesion, SyntaxState } from './types';
import { getSegmentWeight } from './segments';

export function calculateLesionScore(lesion: Lesion, dominance: Dominance): number {
  if (lesion.segments.length === 0) return 0;

  // Step 1: Sum segment weights
  const segmentWeightSum = lesion.segments.reduce((sum, segId) => {
    return sum + getSegmentWeight(segId, dominance);
  }, 0);

  // Step 2: Multiply by occlusion factor
  const occlusionFactor = lesion.occlusionType === 'total-occlusion' ? 5 : 2;
  let score = segmentWeightSum * occlusionFactor;

  // Step 3: Add total occlusion sub-points
  if (lesion.occlusionType === 'total-occlusion') {
    const tod = lesion.totalOcclusionDetails;
    if (tod.ageOver3Months) score += 1;
    if (tod.bluntStump) score += 1;
    if (tod.bridgingCollaterals) score += 1;
    score += tod.sideBranchesAtSite; // +1 per branch ≥1.5mm
    // First visible segment beyond TO: +1 per additional segment beyond first
    if (tod.firstVisibleSegmentBeyond) score += 1;
  }

  // Step 4: Trifurcation points
  if (lesion.trifurcation.present && lesion.trifurcation.diseasedSegments !== null) {
    const trifPoints: Record<number, number> = { 1: 3, 2: 4, 3: 5, 4: 6 };
    score += trifPoints[lesion.trifurcation.diseasedSegments] ?? 0;
  }

  // Step 5: Bifurcation points
  if (lesion.bifurcation.present && lesion.bifurcation.type !== null) {
    const type = lesion.bifurcation.type;
    // A, B, C = +1; D, E, F, G = +2
    const bifPoints: Record<string, number> = {
      A: 1, B: 1, C: 1, D: 2, E: 2, F: 2, G: 2,
    };
    score += bifPoints[type] ?? 0;
    if (lesion.bifurcation.angulationLessThan70) score += 1;
  }

  // Step 6: Other adverse characteristics
  const af = lesion.adverseFeatures;
  if (af.aortoOstial) score += 1;
  if (af.severeTortuosity) score += 2;
  if (af.lengthGreaterThan20mm) score += 1;
  if (af.heavyCalcification) score += 2;
  if (af.thrombus) score += 1;

  return score;
}

export function calculateTotalScore(state: SyntaxState): number {
  const lesionTotal = state.lesions.reduce((sum, lesion) => {
    return sum + calculateLesionScore(lesion, state.dominance);
  }, 0);

  // Diffuse disease: +1 per segment
  const diffuseTotal = state.diffuseDiseaseSegments.length;

  return lesionTotal + diffuseTotal;
}

export function getScoreTertile(score: number): 'low' | 'intermediate' | 'high' {
  if (score <= 22) return 'low';
  if (score <= 32) return 'intermediate';
  return 'high';
}

export function getTertileLabel(tertile: 'low' | 'intermediate' | 'high'): string {
  const labels = {
    low: 'Low (0–22)',
    intermediate: 'Intermediate (23–32)',
    high: 'High (≥33)',
  };
  return labels[tertile];
}

export function getTertileRecommendation(tertile: 'low' | 'intermediate' | 'high'): string {
  const recs = {
    low: 'PCI is reasonable and comparable to CABG',
    intermediate: 'Heart team discussion recommended; both PCI and CABG acceptable',
    high: 'CABG preferred over PCI based on evidence',
  };
  return recs[tertile];
}

export const LESION_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple
];

export function createNewLesion(index: number): Lesion {
  return {
    id: crypto.randomUUID(),
    color: LESION_COLORS[index % LESION_COLORS.length],
    segments: [],
    occlusionType: 'non-occlusive',
    totalOcclusionDetails: {
      ageOver3Months: false,
      bluntStump: false,
      bridgingCollaterals: false,
      sideBranchesAtSite: 0,
      firstVisibleSegmentBeyond: null,
    },
    bifurcation: {
      present: false,
      type: null,
      angulationLessThan70: false,
    },
    trifurcation: {
      present: false,
      diseasedSegments: null,
    },
    adverseFeatures: {
      aortoOstial: false,
      severeTortuosity: false,
      lengthGreaterThan20mm: false,
      heavyCalcification: false,
      thrombus: false,
    },
    score: 0,
  };
}
