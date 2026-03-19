'use client'

import { useState, useEffect } from 'react'
import { Gender, SyntaxIIInput, SyntaxIIResult } from '@/lib/types'
import { calculateSyntaxII, calculateCockcroftGault } from '@/lib/syntax-score-ii'

// ── Shared sub-components ─────────────────────────────────────────────────────

function BoolToggle({
  value,
  onChange,
  labels = ['No', 'Yes'],
}: {
  value: boolean
  onChange: (v: boolean) => void
  labels?: [string, string]
}) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {([false, true] as const).map((v, i) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            value === v
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  )
}

function GenderToggle({ value, onChange }: { value: Gender; onChange: (v: Gender) => void }) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {(['male', 'female'] as const).map(g => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
            value === g ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {g === 'male' ? 'Male' : 'Female'}
        </button>
      ))}
    </div>
  )
}

function NumField({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  step?: number
  unit?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-20 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
      />
      {unit && <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>}
    </div>
  )
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <span className="ml-1.5 text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ── Cockcroft-Gault sub-panel ─────────────────────────────────────────────────

function CGCalculator({
  age,
  gender,
  onApply,
  onClose,
}: {
  age: number
  gender: Gender
  onApply: (crcl: number) => void
  onClose: () => void
}) {
  const [weight, setWeight]         = useState('70')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [cr, setCr]                 = useState('1.0')
  const [crUnit, setCrUnit]         = useState<'mg/dL' | 'μmol/L'>('mg/dL')

  const weightKg        = weightUnit === 'kg' ? parseFloat(weight) || 70 : (parseFloat(weight) || 154) * 0.4536
  const crMgDl          = crUnit === 'mg/dL'  ? parseFloat(cr)    || 1.0 : (parseFloat(cr) || 88.4)   / 88.4
  const preview         = age > 0 && weightKg > 0 && crMgDl > 0
    ? calculateCockcroftGault({ age, weightKg, serumCreatinineMgDl: crMgDl, gender })
    : null

  return (
    <div className="mt-2 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Cockcroft-Gault</p>
        <button type="button" onClick={onClose} className="text-xs text-indigo-400 hover:text-indigo-600">
          ✕ close
        </button>
      </div>

      <div className="space-y-2">
        {/* Weight */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-gray-600">Weight</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <div className="flex gap-0.5 bg-gray-200 rounded-md p-0.5">
              {(['kg', 'lbs'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`px-1.5 py-0.5 text-xs rounded transition-all ${weightUnit === u ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Serum creatinine */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-gray-600">Serum Cr</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              value={cr}
              onChange={e => setCr(e.target.value)}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <div className="flex gap-0.5 bg-gray-200 rounded-md p-0.5">
              {(['mg/dL', 'μmol/L'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setCrUnit(u)}
                  className={`px-1.5 py-0.5 text-xs rounded transition-all ${crUnit === u ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-indigo-400 mt-2">
        Using age={age} yrs, {gender}. CrCl capped at 90 in SYNTAX II formula.
      </p>

      <div className="flex items-center justify-between mt-3">
        {preview !== null ? (
          <span className="text-sm font-bold text-indigo-700">
            CrCl ≈ {Math.max(1, Math.round(preview))} ml/min
          </span>
        ) : (
          <span className="text-xs text-gray-400">Enter values above</span>
        )}
        <button
          type="button"
          disabled={preview === null || preview <= 0}
          onClick={() => { if (preview !== null) onApply(Math.max(1, Math.round(preview))) }}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ── Results display ───────────────────────────────────────────────────────────

function ResultsPanel({ result }: { result: SyntaxIIResult }) {
  const { mortalityPCI, mortalityCABG, ss2PCI, ss2CABG, pValue, recommendation } = result

  const fmt1  = (n: number) => n.toFixed(1)
  const fmt0  = (n: number) => Math.round(n).toString()
  const fmtP  = (p: number) => p < 0.001 ? '<0.001' : p.toFixed(3)

  const maxM  = Math.max(mortalityPCI, mortalityCABG)
  const scale = maxM > 0 ? 80 / maxM : 1

  const pciWins  = mortalityPCI  < mortalityCABG
  const cabgWins = mortalityCABG < mortalityPCI
  const sigDiff  = pValue < 0.05

  return (
    <div className="p-4 border-t border-indigo-100 bg-gradient-to-b from-indigo-50/20 to-white">
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-3">
        Predicted 4-Year Outcomes
      </p>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'PCI',  mortality: mortalityPCI,  ss2: ss2PCI,  better: pciWins  },
          { label: 'CABG', mortality: mortalityCABG, ss2: ss2CABG, better: cabgWins },
        ].map(({ label, mortality, ss2, better }) => (
          <div
            key={label}
            className={`rounded-xl p-3 border-2 transition-all ${
              better
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
              {better && recommendation !== 'equipoise' && (
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                  Favored
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold tabular-nums leading-none ${better ? 'text-emerald-600' : 'text-gray-400'}`}>
              {fmt1(mortality)}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5 mb-2">4-yr mortality</div>
            <div className={`text-xs font-semibold ${better ? 'text-emerald-500' : 'text-gray-400'}`}>
              SS2 score = {fmt0(ss2)}
            </div>
          </div>
        ))}
      </div>

      {/* Bar comparison */}
      <div className="space-y-1.5 mb-4">
        {[
          { label: 'PCI',  value: mortalityPCI,  better: pciWins  },
          { label: 'CABG', value: mortalityCABG, better: cabgWins },
        ].map(({ label, value, better }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 w-8">{label}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${better ? 'bg-emerald-400' : 'bg-gray-300'}`}
                style={{ width: `${value * scale}%` }}
              />
            </div>
            <span className={`text-xs font-bold tabular-nums w-10 text-right ${better ? 'text-emerald-600' : 'text-gray-400'}`}>
              {fmt1(value)}%
            </span>
          </div>
        ))}
      </div>

      {/* Recommendation box */}
      <div className={`rounded-xl px-3.5 py-2.5 border ${
        recommendation === 'equipoise'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 ${
            recommendation === 'PCI'      ? 'bg-blue-500' :
            recommendation === 'CABG'     ? 'bg-red-500'  : 'bg-amber-400'
          }`} />
          <div>
            <p className={`text-sm font-bold ${
              recommendation === 'equipoise' ? 'text-amber-800' : 'text-emerald-800'
            }`}>
              {recommendation === 'PCI'
                ? `PCI predicted to have lower 4-year mortality (${fmt1(mortalityPCI)}% vs ${fmt1(mortalityCABG)}%)`
                : recommendation === 'CABG'
                ? `CABG predicted to have lower 4-year mortality (${fmt1(mortalityCABG)}% vs ${fmt1(mortalityPCI)}%)`
                : `No significant difference (PCI ${fmt1(mortalityPCI)}% vs CABG ${fmt1(mortalityCABG)}%)`
              }
            </p>
            <p className={`text-xs mt-0.5 ${
              recommendation === 'equipoise' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              p = {fmtP(pValue)}
              {sigDiff
                ? ' — statistically significant difference'
                : ' — not significant; heart team discussion recommended'}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-3 text-center">
        Farooq V, et al. Lancet 2013. Validated for 3-vessel or left main disease.
      </p>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export interface SyntaxIISharedValues {
  age: number
  gender: 'male' | 'female'
  crcl: number
  lvef: number
  copd: boolean
  pvd: boolean
}

interface Props {
  syntaxIScore: number
  hasLeftMainDisease: boolean
  onValuesChange?: (values: SyntaxIISharedValues) => void
  onResultChange?: (result: SyntaxIIResult | null) => void
}

export function SyntaxIIPanel({ syntaxIScore, hasLeftMainDisease, onValuesChange, onResultChange }: Props) {
  const [age,      setAge]      = useState('65')
  const [gender,   setGender]   = useState<Gender>('male')
  const [lvef,     setLvef]     = useState('55')
  const [crcl,     setCrcl]     = useState('70')
  const [leftMain, setLeftMain] = useState(hasLeftMainDisease)
  const [leftMainOverride, setLeftMainOverride] = useState(false)
  const [showLMWarning, setShowLMWarning] = useState<boolean | null>(null)
  const [copd,     setCopd]     = useState(false)
  const [pvd,      setPvd]      = useState(false)
  const [showCG,   setShowCG]   = useState(false)
  const [result,   setResult]   = useState<SyntaxIIResult | null>(null)

  // Always sync Left Main from SYNTAX I unless user has manually overridden
  useEffect(() => {
    if (!leftMainOverride) setLeftMain(hasLeftMainDisease)
  }, [hasLeftMainDisease, leftMainOverride])

  const ageNum  = parseInt(age)  || 0
  const lvefNum = parseInt(lvef) || 0
  const crclNum = parseFloat(crcl) || 0

  const isValid = ageNum >= 18 && ageNum <= 100 && lvefNum >= 10 && lvefNum <= 99 && crclNum > 0

  // Report shared values to parent (for EuroSCORE II)
  useEffect(() => {
    onValuesChange?.({ age: ageNum, gender, crcl: crclNum, lvef: lvefNum, copd, pvd })
  }, [ageNum, gender, crclNum, lvefNum, copd, pvd, onValuesChange])

  // Auto-recalculate when any input changes
  useEffect(() => {
    if (!isValid) { setResult(null); onResultChange?.(null); return }
    const input: SyntaxIIInput = {
      age: ageNum, crcl: crclNum, lvef: lvefNum,
      leftMainDisease: leftMain, gender, copd, pvd,
    }
    const r = calculateSyntaxII(syntaxIScore, input)
    setResult(r)
    onResultChange?.(r)
  }, [syntaxIScore, ageNum, crclNum, lvefNum, leftMain, gender, copd, pvd, isValid])

  const handleCalculate = () => {
    if (!isValid) return
    const input: SyntaxIIInput = {
      age: ageNum, crcl: crclNum, lvef: lvefNum,
      leftMainDisease: leftMain, gender, copd, pvd,
    }
    setResult(calculateSyntaxII(syntaxIScore, input))
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-white overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-indigo-900">
            SYNTAX Score II
            <span className="ml-2 text-xs font-normal text-indigo-500">Clinical Risk Prediction</span>
          </h2>
          <p className="text-xs text-indigo-400 mt-0.5">
            Combines anatomy with clinical variables to predict 4-year PCI vs CABG mortality
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-indigo-400">SYNTAX I</div>
          <div className="text-lg font-bold text-indigo-700 tabular-nums leading-tight">
            {Math.round(syntaxIScore)}
          </div>
        </div>
      </div>

      {/* Input form */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
          {/* Left column */}
          <div>
            <FormRow label="Age">
              <NumField value={age} onChange={setAge} min={18} max={100} unit="yrs" />
            </FormRow>
            <FormRow label="LVEF">
              <NumField value={lvef} onChange={setLvef} min={10} max={99} unit="%" />
            </FormRow>
            <FormRow label="COPD">
              <BoolToggle value={copd} onChange={setCopd} />
            </FormRow>
          </div>

          {/* Right column */}
          <div>
            <FormRow label="Gender">
              <GenderToggle value={gender} onChange={setGender} />
            </FormRow>
            <FormRow label="PVD">
              <BoolToggle value={pvd} onChange={setPvd} />
            </FormRow>
            <FormRow
              label="Left Main"
              hint={leftMainOverride
                ? '(manual override)'
                : hasLeftMainDisease ? '(auto: seg 5 ✓)' : '(auto: seg 5 ✗)'}
            >
              <BoolToggle value={leftMain} onChange={(v) => {
                if (v !== hasLeftMainDisease) {
                  setShowLMWarning(v)
                } else {
                  // Going back to match SYNTAX I — clear override
                  setLeftMainOverride(false)
                  setLeftMain(v)
                }
              }} />
            </FormRow>
          </div>
        </div>

        {/* CrCl row — full width with inline CG toggle */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50">
          <div>
            <span className="text-sm font-medium text-gray-700">CrCl</span>
            <button
              type="button"
              onClick={() => setShowCG(v => !v)}
              className="ml-2 text-xs font-medium text-indigo-500 hover:text-indigo-700"
            >
              {showCG ? '▲ hide calculator' : '▼ Cockcroft-Gault'}
            </button>
          </div>
          <NumField value={crcl} onChange={setCrcl} min={1} max={200} unit="ml/min" />
        </div>

        {showCG && (
          <CGCalculator
            age={ageNum || 65}
            gender={gender}
            onApply={v => { setCrcl(String(v)); setShowCG(false) }}
            onClose={() => setShowCG(false)}
          />
        )}

        {/* Left Main override warning */}
        {showLMWarning !== null && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs font-bold text-amber-800 mb-1">⚠️ Override Left Main?</p>
            <p className="text-xs text-amber-700 mb-3">
              {showLMWarning
                ? 'SYNTAX I does not have segment 5 (Left Main) selected as diseased. Are you sure you want to set Left Main to Yes?'
                : 'SYNTAX I has segment 5 (Left Main) selected as diseased. Are you sure you want to set Left Main to No?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLeftMain(showLMWarning)
                  setLeftMainOverride(true)
                  setShowLMWarning(null)
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Yes, override
              </button>
              <button
                type="button"
                onClick={() => setShowLMWarning(null)}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {leftMainOverride && (
                <button
                  type="button"
                  onClick={() => {
                    setLeftMainOverride(false)
                    setLeftMain(hasLeftMainDisease)
                    setShowLMWarning(null)
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Reset to SYNTAX I
                </button>
              )}
            </div>
          </div>
        )}

        {/* Calculate button */}
        <div className="py-3">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!isValid}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
              isValid
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {result ? 'Recalculate SYNTAX II' : 'Calculate SYNTAX II'}
          </button>
          {!isValid && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              Enter valid Age (18–100), LVEF (10–99%), and CrCl
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {result && <ResultsPanel result={result} />}
    </div>
  )
}
