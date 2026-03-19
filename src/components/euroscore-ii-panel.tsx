'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  EuroScoreIIInput, EuroScoreIIResult,
  calculateEuroScoreII,
  renalCategoryFromCrCl, lvefCategoryFromValue,
} from '@/lib/euroscore-ii'

// ── Shared components ─────────────────────────────────────────────────────────

function Toggle({
  value, onChange, labels = ['No', 'Yes'],
}: {
  value: boolean; onChange: (v: boolean) => void; labels?: [string, string]
}) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {([false, true] as const).map((v, i) => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            value === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          {labels[i]}
        </button>
      ))}
    </div>
  )
}

function SegmentedControl<T extends string | number>({
  value, onChange, options,
}: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]
}) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 flex-wrap">
      {options.map(o => (
        <button key={String(o.value)} type="button" onClick={() => onChange(o.value)}
          className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            value === o.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-3 mb-1 px-1">
      {children}
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────────────────────

function ResultsPanel({ result }: { result: EuroScoreIIResult }) {
  const { predictedMortality, riskCategory } = result

  const riskColor = riskCategory === 'low' ? 'emerald' : riskCategory === 'moderate' ? 'amber' : 'red'
  const riskLabel = riskCategory === 'low' ? 'Low Risk' : riskCategory === 'moderate' ? 'Moderate Risk' : 'High Risk'

  return (
    <div className="p-4 border-t border-rose-100 bg-gradient-to-b from-rose-50/20 to-white">
      <div className="flex items-center gap-4">
        {/* Score circle */}
        <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-${riskColor}-400 bg-${riskColor}-50 flex-shrink-0`}
          style={{
            borderColor: riskCategory === 'low' ? '#34d399' : riskCategory === 'moderate' ? '#fbbf24' : '#f87171',
            backgroundColor: riskCategory === 'low' ? '#ecfdf5' : riskCategory === 'moderate' ? '#fffbeb' : '#fef2f2',
          }}>
          <span className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: riskCategory === 'low' ? '#059669' : riskCategory === 'moderate' ? '#d97706' : '#dc2626' }}>
            {predictedMortality.toFixed(1)}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Predicted In-Hospital Mortality
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded-full"
              style={{
                backgroundColor: riskCategory === 'low' ? '#ecfdf5' : riskCategory === 'moderate' ? '#fffbeb' : '#fef2f2',
                color: riskCategory === 'low' ? '#059669' : riskCategory === 'moderate' ? '#d97706' : '#dc2626',
              }}>
              {riskLabel}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            If 100 similar patients had this operation, ~{Math.round(predictedMortality)} may die
            and ~{100 - Math.round(predictedMortality)} would survive.
          </p>
        </div>
      </div>

      {/* Mortality bar */}
      <div className="mt-3">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(predictedMortality, 100)}%`,
              backgroundColor: riskCategory === 'low' ? '#34d399' : riskCategory === 'moderate' ? '#fbbf24' : '#f87171',
            }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-300">
          <span>0%</span>
          <span className="text-gray-400">|2%</span>
          <span className="text-gray-400">|5%</span>
          <span>100%</span>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-3 text-center">
        Nashef SA, et al. Eur J Cardiothorac Surg. 2012;41(4):734-44.
      </p>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  // Shared from SYNTAX II
  sharedAge?: number
  sharedGender?: 'male' | 'female'
  sharedCrCl?: number
  sharedLvef?: number
  sharedCopd?: boolean
  sharedPvd?: boolean
  onResultChange?: (result: EuroScoreIIResult | null) => void
}

export function EuroScoreIIPanel({
  sharedAge, sharedGender, sharedCrCl, sharedLvef, sharedCopd, sharedPvd, onResultChange,
}: Props) {
  // Patient factors
  const [age, setAge]           = useState(sharedAge?.toString() || '65')
  const [gender, setGender]     = useState<'male' | 'female'>(sharedGender || 'male')
  const [iddm, setIddm]        = useState(false)
  const [copd, setCopd]         = useState(sharedCopd ?? false)
  const [poorMobility, setPoorMobility] = useState(false)
  const [dialysis, setDialysis] = useState(false)
  const [crcl, setCrcl]         = useState(sharedCrCl?.toString() || '90')
  const [critical, setCritical] = useState(false)

  // Cardiac factors
  const [nyha, setNyha]         = useState<1 | 2 | 3 | 4>(1)
  const [ccs4, setCcs4]         = useState(false)
  const [pvd, setPvd]           = useState(sharedPvd ?? false)
  const [prevSurgery, setPrevSurgery] = useState(false)
  const [endocarditis, setEndocarditis] = useState(false)
  const [lvef, setLvef]         = useState(sharedLvef?.toString() || '55')
  const [recentMI, setRecentMI] = useState(false)
  const [paPressure, setPaPressure] = useState<'low' | 'moderate' | 'severe'>('low')

  // Procedural factors
  const [urgency, setUrgency]   = useState<'elective' | 'urgent' | 'emergency' | 'salvage'>('elective')
  const [procedureWeight, setProcedureWeight] = useState<'isolatedCABG' | 'singleNonCABG' | 'twoMajor' | 'threePlusMajor'>('isolatedCABG')
  const [thoracicAorta, setThoracicAorta] = useState(false)

  // Sync shared values from SYNTAX II
  useEffect(() => { if (sharedAge !== undefined) setAge(sharedAge.toString()) }, [sharedAge])
  useEffect(() => { if (sharedGender !== undefined) setGender(sharedGender) }, [sharedGender])
  useEffect(() => { if (sharedCrCl !== undefined) setCrcl(sharedCrCl.toString()) }, [sharedCrCl])
  useEffect(() => { if (sharedLvef !== undefined) setLvef(sharedLvef.toString()) }, [sharedLvef])
  useEffect(() => { if (sharedCopd !== undefined) setCopd(sharedCopd) }, [sharedCopd])
  useEffect(() => { if (sharedPvd !== undefined) setPvd(sharedPvd) }, [sharedPvd])

  const ageNum  = parseInt(age) || 65
  const crclNum = parseFloat(crcl) || 90
  const lvefNum = parseInt(lvef) || 55

  // Auto-calculate
  const result = useMemo<EuroScoreIIResult | null>(() => {
    if (ageNum < 18 || ageNum > 100) return null

    const input: EuroScoreIIInput = {
      age: ageNum,
      gender,
      insulinDependentDM: iddm,
      chronicPulmonaryDysfunction: copd,
      poorMobility,
      renalFunction: renalCategoryFromCrCl(crclNum, dialysis),
      criticalPreopState: critical,
      nyhaClass: nyha,
      ccsClass4Angina: ccs4,
      extracardiacArteriopathy: pvd,
      previousCardiacSurgery: prevSurgery,
      activeEndocarditis: endocarditis,
      lvefCategory: lvefCategoryFromValue(lvefNum),
      recentMI,
      paSystolicPressure: paPressure,
      urgency,
      procedureWeight,
      thoracicAortaSurgery: thoracicAorta,
    }

    return calculateEuroScoreII(input)
  }, [ageNum, gender, iddm, copd, poorMobility, crclNum, dialysis, critical,
      nyha, ccs4, pvd, prevSurgery, endocarditis, lvefNum, recentMI, paPressure,
      urgency, procedureWeight, thoracicAorta])

  // Report result to parent
  useEffect(() => { onResultChange?.(result) }, [result])

  // Derived labels for synced fields
  const renalCat = renalCategoryFromCrCl(crclNum, dialysis)
  const lvefCat = lvefCategoryFromValue(lvefNum)
  const renalLabel = dialysis ? 'Dialysis' : renalCat === 'normal' ? '>85 (normal)' : renalCat === 'moderate' ? '51-85 (moderate)' : '≤50 (severe)'
  const lvefLabel = lvefCat === 'good' ? '≥51% (good)' : lvefCat === 'moderate' ? '31-50% (moderate)' : lvefCat === 'poor' ? '21-30% (poor)' : '≤20% (very poor)'

  return (
    <div className="rounded-xl border border-rose-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-rose-50 border-b border-rose-100">
        <h2 className="text-sm font-bold text-rose-900">
          EuroSCORE II
          <span className="ml-2 text-xs font-normal text-rose-500">Cardiac Surgery Risk</span>
        </h2>
        <p className="text-xs text-rose-400 mt-0.5">
          Predicts in-hospital mortality after cardiac surgery (Nashef et al., 2012)
        </p>
      </div>

      <div className="px-4 py-2">
        {/* ── Patient Factors ── */}
        <SectionHeader>Patient Factors</SectionHeader>

        <Row label="Age" hint={sharedAge !== undefined ? '(from SYNTAX II)' : undefined}>
          <div className="flex items-center gap-1.5">
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              min={18} max={100}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <span className="text-xs text-gray-400">yrs</span>
          </div>
        </Row>

        <Row label="Gender" hint={sharedGender !== undefined ? '(from SYNTAX II)' : undefined}>
          <SegmentedControl value={gender} onChange={setGender}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        </Row>

        <Row label="Insulin-dependent DM">
          <Toggle value={iddm} onChange={setIddm} />
        </Row>

        <Row label="COPD" hint={sharedCopd !== undefined ? '(from SYNTAX II)' : 'Chronic pulmonary dysfunction'}>
          <Toggle value={copd} onChange={setCopd} />
        </Row>

        <Row label="Poor Mobility" hint="Neuro/musculoskeletal dysfunction">
          <Toggle value={poorMobility} onChange={setPoorMobility} />
        </Row>

        <Row label="Renal Function" hint={`CrCl=${Math.round(crclNum)} → ${renalLabel}`}>
          <div className="flex items-center gap-1.5">
            <input type="number" value={crcl} onChange={e => setCrcl(e.target.value)}
              min={1} max={200}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <span className="text-xs text-gray-400">ml/min</span>
          </div>
        </Row>

        <Row label="On Dialysis">
          <Toggle value={dialysis} onChange={setDialysis} />
        </Row>

        <Row label="Critical Preop State" hint="Inotropes, IABP/VAD, cardiac massage, ventilated, acute renal failure">
          <Toggle value={critical} onChange={setCritical} />
        </Row>

        {/* ── Cardiac Factors ── */}
        <SectionHeader>Cardiac-Specific Factors</SectionHeader>

        <Row label="NYHA Class">
          <SegmentedControl value={nyha} onChange={setNyha}
            options={[
              { value: 1, label: 'I' },
              { value: 2, label: 'II' },
              { value: 3, label: 'III' },
              { value: 4, label: 'IV' },
            ]} />
        </Row>

        <Row label="CCS Class 4 Angina" hint="Angina at rest">
          <Toggle value={ccs4} onChange={setCcs4} />
        </Row>

        <Row label="Extracardiac Arteriopathy" hint={sharedPvd !== undefined ? '(PVD from SYNTAX II)' : 'Claudication, carotid >50%, amputation'}>
          <Toggle value={pvd} onChange={setPvd} />
        </Row>

        <Row label="Previous Cardiac Surgery" hint="Opening the pericardium">
          <Toggle value={prevSurgery} onChange={setPrevSurgery} />
        </Row>

        <Row label="Active Endocarditis" hint="On antibiotics at time of surgery">
          <Toggle value={endocarditis} onChange={setEndocarditis} />
        </Row>

        <Row label="LV Function" hint={`LVEF=${lvefNum}% → ${lvefLabel}`}>
          <div className="flex items-center gap-1.5">
            <input type="number" value={lvef} onChange={e => setLvef(e.target.value)}
              min={5} max={80}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <span className="text-xs text-gray-400">%</span>
          </div>
        </Row>

        <Row label="Recent MI" hint="≤90 days before operation">
          <Toggle value={recentMI} onChange={setRecentMI} />
        </Row>

        <Row label="PA Systolic Pressure">
          <SegmentedControl value={paPressure} onChange={setPaPressure}
            options={[
              { value: 'low', label: '<31' },
              { value: 'moderate', label: '31-54' },
              { value: 'severe', label: '≥55' },
            ]} />
        </Row>

        {/* ── Procedural Factors ── */}
        <SectionHeader>Procedural Factors</SectionHeader>

        <Row label="Urgency">
          <SegmentedControl value={urgency} onChange={setUrgency}
            options={[
              { value: 'elective', label: 'Elective' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'salvage', label: 'Salvage' },
            ]} />
        </Row>

        <Row label="Procedure Weight" hint="Extent of intervention">
          <SegmentedControl value={procedureWeight} onChange={setProcedureWeight}
            options={[
              { value: 'isolatedCABG', label: 'CABG' },
              { value: 'singleNonCABG', label: '1 Non-CABG' },
              { value: 'twoMajor', label: '2 Major' },
              { value: 'threePlusMajor', label: '≥3 Major' },
            ]} />
        </Row>

        <Row label="Thoracic Aorta Surgery">
          <Toggle value={thoracicAorta} onChange={setThoracicAorta} />
        </Row>
      </div>

      {/* Results — always shown (auto-calc) */}
      {result && <ResultsPanel result={result} />}
    </div>
  )
}
