import { Dominance, SegmentId } from './types';

export interface SegmentInfo {
  id: SegmentId;
  name: string;
  shortName: string;
  rightDomWeight: number | null;
  leftDomWeight: number | null;
  vessel: 'rca' | 'lad' | 'lcx' | 'lm';
}

export const SEGMENTS: SegmentInfo[] = [
  // RCA
  { id: '1', name: 'RCA Proximal', shortName: 'RCA prox', rightDomWeight: 1.0, leftDomWeight: 0, vessel: 'rca' },
  { id: '2', name: 'RCA Mid', shortName: 'RCA mid', rightDomWeight: 1.0, leftDomWeight: 0, vessel: 'rca' },
  { id: '3', name: 'RCA Distal', shortName: 'RCA dist', rightDomWeight: 1.0, leftDomWeight: 0, vessel: 'rca' },
  { id: '4', name: 'PDA (from RCA)', shortName: 'PDA', rightDomWeight: 1.0, leftDomWeight: null, vessel: 'rca' },
  // Left Main
  { id: '5', name: 'Left Main', shortName: 'LM', rightDomWeight: 5.0, leftDomWeight: 6.0, vessel: 'lm' },
  // LAD
  { id: '6', name: 'LAD Proximal', shortName: 'LAD prox', rightDomWeight: 3.5, leftDomWeight: 3.5, vessel: 'lad' },
  { id: '7', name: 'LAD Mid', shortName: 'LAD mid', rightDomWeight: 2.5, leftDomWeight: 2.5, vessel: 'lad' },
  { id: '8', name: 'LAD Apical', shortName: 'LAD apex', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lad' },
  { id: '9', name: 'First Diagonal (D1)', shortName: 'D1', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lad' },
  { id: '9a', name: 'First Diagonal a', shortName: 'D1a', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lad' },
  { id: '10', name: 'Second Diagonal (D2)', shortName: 'D2', rightDomWeight: 0.5, leftDomWeight: 0.5, vessel: 'lad' },
  { id: '10a', name: 'Second Diagonal a', shortName: 'D2a', rightDomWeight: 0.5, leftDomWeight: 0.5, vessel: 'lad' },
  // LCx
  { id: '11', name: 'Proximal LCx', shortName: 'LCx prox', rightDomWeight: 1.5, leftDomWeight: 2.5, vessel: 'lcx' },
  { id: '12', name: 'Intermediate/Anterolateral', shortName: 'IM', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lcx' },
  { id: '12a', name: 'Obtuse Marginal a (OM1)', shortName: 'OM1', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lcx' },
  { id: '12b', name: 'Obtuse Marginal b (OM2)', shortName: 'OM2', rightDomWeight: 1.0, leftDomWeight: 1.0, vessel: 'lcx' },
  { id: '13', name: 'Distal LCx', shortName: 'LCx dist', rightDomWeight: 0.5, leftDomWeight: 1.5, vessel: 'lcx' },
  { id: '14', name: 'Left Posterolateral', shortName: 'LPL', rightDomWeight: 0.5, leftDomWeight: 1.0, vessel: 'lcx' },
  { id: '14a', name: 'Left Posterolateral a', shortName: 'LPLa', rightDomWeight: 0.5, leftDomWeight: 1.0, vessel: 'lcx' },
  { id: '14b', name: 'Left Posterolateral b', shortName: 'LPLb', rightDomWeight: 0.5, leftDomWeight: 1.0, vessel: 'lcx' },
  // Left dominant only
  { id: '15', name: 'PDA (from LCx)', shortName: 'PDA', rightDomWeight: null, leftDomWeight: 1.0, vessel: 'lcx' },
  // Right dominant posterolateral branches
  { id: '16', name: 'Posterolateral from RCA', shortName: 'PLV', rightDomWeight: 0.5, leftDomWeight: null, vessel: 'rca' },
  { id: '16a', name: 'Posterolateral a from RCA', shortName: 'PLVa', rightDomWeight: 0.5, leftDomWeight: null, vessel: 'rca' },
  { id: '16b', name: 'Posterolateral b from RCA', shortName: 'PLVb', rightDomWeight: 0.5, leftDomWeight: null, vessel: 'rca' },
  { id: '16c', name: 'Posterolateral c from RCA', shortName: 'PLVc', rightDomWeight: 0.5, leftDomWeight: null, vessel: 'rca' },
];

export function getSegmentWeight(segId: SegmentId, dominance: Dominance): number {
  const seg = SEGMENTS.find(s => s.id === segId);
  if (!seg) return 0;
  const weight = dominance === 'right' ? seg.rightDomWeight : seg.leftDomWeight;
  return weight ?? 0;
}

export function getAvailableSegments(dominance: Dominance): SegmentInfo[] {
  return SEGMENTS.filter(seg => {
    const weight = dominance === 'right' ? seg.rightDomWeight : seg.leftDomWeight;
    return weight !== null;
  });
}

export function getSegmentInfo(id: SegmentId): SegmentInfo | undefined {
  return SEGMENTS.find(s => s.id === id);
}
