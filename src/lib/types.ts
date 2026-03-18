export type Dominance = 'right' | 'left';

export type Gender = 'male' | 'female';

export interface SyntaxIIInput {
  age: number;
  crcl: number;       // ml/min
  lvef: number;       // %
  leftMainDisease: boolean;
  gender: Gender;
  copd: boolean;
  pvd: boolean;
}

export interface SyntaxIIResult {
  ss2PCI: number;
  ss2CABG: number;
  mortalityPCI: number;   // 4-year %, 0–100
  mortalityCABG: number;  // 4-year %, 0–100
  lpDelta: number;
  seDelta: number;
  pValue: number;
  recommendation: 'PCI' | 'CABG' | 'equipoise';
}

export type SegmentId =
  | '1' | '2' | '3' | '4'
  | '5' | '6' | '7' | '8'
  | '9' | '9a' | '10' | '10a'
  | '11' | '12' | '12a' | '12b'
  | '13' | '14' | '14a' | '14b'
  | '15' | '16' | '16a' | '16b' | '16c';

export type OcclusionType = 'non-occlusive' | 'total-occlusion';

export type BifurcationType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface TotalOcclusionDetails {
  ageOver3Months: boolean;
  bluntStump: boolean;
  bridgingCollaterals: boolean;
  sideBranchesAtSite: number; // 0, 1, 2, etc.
  firstVisibleSegmentBeyond: SegmentId | null;
}

export interface BifurcationDetails {
  present: boolean;
  type: BifurcationType | null;
  angulationLessThan70: boolean;
}

export interface TrifurcationDetails {
  present: boolean;
  diseasedSegments: 1 | 2 | 3 | 4 | null;
}

export interface AdverseFeatures {
  aortoOstial: boolean;
  severeTortuosity: boolean;
  lengthGreaterThan20mm: boolean;
  heavyCalcification: boolean;
  thrombus: boolean;
}

export interface Lesion {
  id: string;
  color: string;
  segments: SegmentId[];
  occlusionType: OcclusionType;
  totalOcclusionDetails: TotalOcclusionDetails;
  bifurcation: BifurcationDetails;
  trifurcation: TrifurcationDetails;
  adverseFeatures: AdverseFeatures;
  score: number;
}

export interface SyntaxState {
  dominance: Dominance;
  lesions: Lesion[];
  diffuseDiseaseSegments: SegmentId[];
  currentStep: 'welcome' | 'dominance' | 'lesions' | 'diffuse' | 'results';
  editingLesionId: string | null;
  lesionStep: 'segments' | 'occlusion' | 'trifurcation' | 'bifurcation' | 'adverse';
}
