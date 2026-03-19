'use client'

import { useState, useEffect, useMemo } from 'react'
import { EFTInput, EFTResult, FrailtyClass, calculateEFT } from '@/lib/eft-score'

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

// ── Frailty badge styles ──────────────────────────────────────────────────────

const FRAILTY_STYLES: Record<FrailtyClass, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  robust:   { label: 'Robust (Non-Frail)', emoji: '💪', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  prefrail: { label: 'Pre-Frail',          emoji: '⚠️', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  frail:    { label: 'Frail',              emoji: '🔴', color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
}

// ── Results ───────────────────────────────────────────────────────────────────

function ResultsPanel({ result }: { result: EFTResult }) {
  const { score, frailtyClass, mortality1yr, mortality5yr, cabgSecondary } = result
  const style = FRAILTY_STYLES[frailtyClass]

  return (
    <div className="p-4 border-t border-teal-100 bg-gradient-to-b from-teal-50/20 to-white">
      {/* Score + Classification */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-3 flex-shrink-0"
          style={{
            borderWidth: 3,
            borderColor: frailtyClass === 'robust' ? '#34d399' : frailtyClass === 'prefrail' ? '#fbbf24' : '#f87171',
            backgroundColor: frailtyClass === 'robust' ? '#ecfdf5' : frailtyClass === 'prefrail' ? '#fffbeb' : '#fef2f2',
          }}>
          <span className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: frailtyClass === 'robust' ? '#059669' : frailtyClass === 'prefrail' ? '#d97706' : '#dc2626' }}>
            {score}
          </span>
          <span className="text-[9px] text-gray-400">/5</span>
        </div>
        <div className="flex-1">
          <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.border} border ${style.color}`}>
            {style.emoji} {style.label}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {frailtyClass === 'robust' ? 'No frailty deficits detected' :
             frailtyClass === 'prefrail' ? '1-2 frailty deficits — intermediate risk' :
             '≥3 frailty deficits — significantly elevated risk'}
          </p>
        </div>
      </div>

      {/* CABG outcomes (primary context for SYNTAX patients) */}
      <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2">
        CABG Mortality Prediction
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-center">
          <p className="text-[10px] text-teal-500 font-semibold">1-Year</p>
          <p className="text-xl font-bold text-teal-800 tabular-nums">{mortality1yr.cabg}%</p>
        </div>
        <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-center">
          <p className="text-[10px] text-teal-500 font-semibold">5-Year</p>
          <p className="text-xl font-bold text-teal-800 tabular-nums">{mortality5yr.cabg}%</p>
        </div>
      </div>

      {/* CABG secondary outcomes */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        CABG Postop Outcomes ({style.label.split(' (')[0]})
      </p>
      <div className="space-y-1 mb-3">
        {[
          { label: 'LOS ≥14 days', value: cabgSecondary.losGe14d },
          { label: 'Discharge to facility', value: cabgSecondary.dischargeFacility },
          { label: '30-day readmission', value: cabgSecondary.readmit30d },
          { label: 'Major morbidity/mortality', value: cabgSecondary.majorMorbidity },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-0.5">
            <span className="text-xs text-gray-500">{item.label}</span>
            <span className="text-xs font-bold text-gray-700">{item.value}%</span>
          </div>
        ))}
      </div>

      {/* AVR outcomes (for completeness — some SYNTAX patients may need valve) */}
      <details className="group">
        <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
          AVR Mortality (TAVR/SAVR) ▸
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">TAVR 1-yr</p>
            <p className="text-sm font-bold text-gray-700 tabular-nums">{mortality1yr.tavr}%</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">SAVR 1-yr</p>
            <p className="text-sm font-bold text-gray-700 tabular-nums">{mortality1yr.savr}%</p>
          </div>
        </div>
      </details>

      <p className="text-xs text-gray-300 mt-3 text-center">
        Solomon et al., JAHA 2021 · Afilalo et al., JACC 2017
      </p>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  sharedGender?: 'male' | 'female'
  onResultChange?: (result: EFTResult) => void
}

export function EFTPanel({ sharedGender, onResultChange }: Props) {
  const [gender, setGender] = useState<'male' | 'female'>(sharedGender || 'male')
  const [chairTime, setChairTime] = useState('')
  const [chairUnable, setChairUnable] = useState(false)
  const [cognitive, setCognitive] = useState(false)
  const [hgb, setHgb] = useState('')
  const [albumin, setAlbumin] = useState('')

  // Sync gender from SYNTAX II
  useEffect(() => { if (sharedGender) setGender(sharedGender) }, [sharedGender])

  const chairTimeNum = chairTime ? parseInt(chairTime) : null
  const hgbNum = hgb ? parseFloat(hgb) : null
  const albNum = albumin ? parseFloat(albumin) : null

  // Hemoglobin threshold hint
  const hgbThreshold = gender === 'female' ? 12 : 13
  const isAnemic = hgbNum !== null && hgbNum < hgbThreshold

  const result = useMemo<EFTResult>(() => {
    return calculateEFT({
      gender,
      chairStandsTime: chairUnable ? null : chairTimeNum,
      chairStandsUnable: chairUnable,
      cognitiveImpairment: cognitive,
      hemoglobin: hgbNum,
      albumin: albNum,
    })
  }, [gender, chairTimeNum, chairUnable, cognitive, hgbNum, albNum])

  // Report result to parent
  useEffect(() => { onResultChange?.(result) }, [result])

  return (
    <div className="rounded-xl border border-teal-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
        <h2 className="text-sm font-bold text-teal-900">
          Essential Frailty Toolset
          <span className="ml-2 text-xs font-normal text-teal-500">Preoperative Frailty Assessment</span>
        </h2>
        <p className="text-xs text-teal-400 mt-0.5">
          4 domains: physical performance, cognition, nutrition, anemia (scored 0-5)
        </p>
      </div>

      <div className="px-4 py-2">
        {/* Gender (synced) */}
        <Row label="Gender" hint={sharedGender ? '(from SYNTAX II)' : undefined}>
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {(['male', 'female'] as const).map(g => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                  gender === g ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </Row>

        {/* Chair stands */}
        <Row label="5 Chair Stands" hint="Time to complete 5 sit-to-stands without using arms">
          <div className="flex items-center gap-2">
            {!chairUnable && (
              <div className="flex items-center gap-1">
                <input type="number" min={1} max={60} value={chairTime}
                  onChange={e => setChairTime(e.target.value)} placeholder="sec"
                  className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-300" />
                <span className="text-xs text-gray-400">s</span>
              </div>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={chairUnable}
                onChange={e => { setChairUnable(e.target.checked); if (e.target.checked) setChairTime('') }}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-xs text-gray-500">Unable</span>
            </label>
          </div>
        </Row>
        {/* Chair stands scoring hint */}
        {(chairTimeNum !== null && chairTimeNum >= 15 && !chairUnable) && (
          <div className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1 rounded mb-1">≥15s → +1 point</div>
        )}
        {(chairTimeNum !== null && chairTimeNum < 15 && !chairUnable) && (
          <div className="text-[10px] text-green-600 bg-green-50 px-3 py-1 rounded mb-1">&lt;15s → 0 points (normal)</div>
        )}
        {chairUnable && (
          <div className="text-[10px] text-red-600 bg-red-50 px-3 py-1 rounded mb-1">Unable to complete → +2 points</div>
        )}

        {/* Cognitive impairment */}
        <Row label="Cognitive Impairment" hint="MMSE <24/30">
          <Toggle value={cognitive} onChange={setCognitive} />
        </Row>

        {/* Hemoglobin */}
        <Row label="Hemoglobin" hint={`Anemia: <${hgbThreshold} g/dL (${gender})`}>
          <div className="flex items-center gap-1.5">
            <input type="number" step={0.1} value={hgb}
              onChange={e => setHgb(e.target.value)} placeholder="g/dL"
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-300" />
            <span className="text-xs text-gray-400">g/dL</span>
          </div>
        </Row>
        {hgbNum !== null && (
          <div className={`text-[10px] ${isAnemic ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'} px-3 py-1 rounded mb-1`}>
            {isAnemic ? `Anemic → +1 point` : 'Normal'}
          </div>
        )}

        {/* Albumin */}
        <Row label="Serum Albumin" hint="Hypoalbuminemia: <3.5 g/dL">
          <div className="flex items-center gap-1.5">
            <input type="number" step={0.1} value={albumin}
              onChange={e => setAlbumin(e.target.value)} placeholder="g/dL"
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-300" />
            <span className="text-xs text-gray-400">g/dL</span>
          </div>
        </Row>
        {albNum !== null && (
          <div className={`text-[10px] ${albNum < 3.5 ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'} px-3 py-1 rounded mb-1`}>
            {albNum < 3.5 ? 'Hypoalbuminemia → +1 point' : 'Normal'}
          </div>
        )}
      </div>

      {/* Results — always shown */}
      <ResultsPanel result={result} />
    </div>
  )
}
