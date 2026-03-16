'use client'

import { Dominance, Lesion, SegmentId, BifurcationType } from '@/lib/types'
import { getAvailableSegments } from '@/lib/segments'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none ${
        checked ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ── Medina bifurcation icon ──────────────────────────────────────────────────
const MEDINA_PATTERNS: Record<BifurcationType, [boolean, boolean, boolean]> = {
  A: [true,  false, false],
  B: [false, true,  false],
  C: [true,  true,  false],
  D: [true,  true,  true ],
  E: [false, false, true ],
  F: [true,  false, true ],
  G: [false, true,  true ],
}

function MedinaIcon({ type, selected }: { type: BifurcationType; selected: boolean }) {
  const [prox, main, side] = MEDINA_PATTERNS[type]
  const strokeClr = selected ? 'white' : '#4b5563'
  const filledClr = selected ? 'white' : '#1f2937'
  const emptyClr  = selected ? 'rgba(255,255,255,0.2)' : 'white'
  return (
    <svg viewBox="0 0 40 50" width="28" height="35" className="pointer-events-none">
      <line x1="20" y1="5"  x2="20" y2="22" stroke={strokeClr} strokeWidth={2} />
      <line x1="20" y1="22" x2="9"  y2="42" stroke={strokeClr} strokeWidth={2} />
      <line x1="20" y1="22" x2="31" y2="42" stroke={strokeClr} strokeWidth={2} />
      <circle cx="20" cy="5"  r="4.5" fill={prox ? filledClr : emptyClr} stroke={strokeClr} strokeWidth={1.5} />
      <circle cx="9"  cy="42" r="4.5" fill={main ? filledClr : emptyClr} stroke={strokeClr} strokeWidth={1.5} />
      <circle cx="31" cy="42" r="4.5" fill={side ? filledClr : emptyClr} stroke={strokeClr} strokeWidth={1.5} />
    </svg>
  )
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{children}</p>
  )
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  lesion: Lesion
  lesionNumber: number
  dominance: Dominance
  isExpanded: boolean
  score: number
  onToggleExpand: () => void
  onRemove: () => void
  onUpdate: (updates: Partial<Lesion>) => void
}

const VESSEL_LABELS: Record<string, string> = {
  lm: 'LM', rca: 'RCA', lad: 'LAD', lcx: 'LCx',
}

// ── Component ────────────────────────────────────────────────────────────────
export function LesionCard({
  lesion, lesionNumber, dominance, isExpanded, score,
  onToggleExpand, onRemove, onUpdate,
}: Props) {
  const availableSegments = getAvailableSegments(dominance)
  const grouped = {
    lm:  availableSegments.filter(s => s.vessel === 'lm'),
    rca: availableSegments.filter(s => s.vessel === 'rca'),
    lad: availableSegments.filter(s => s.vessel === 'lad'),
    lcx: availableSegments.filter(s => s.vessel === 'lcx'),
  }

  const toggleSegment = (segId: SegmentId) => {
    const next = lesion.segments.includes(segId)
      ? lesion.segments.filter(s => s !== segId)
      : [...lesion.segments, segId]
    onUpdate({ segments: next })
  }

  const fmt = (n: number) => n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)

  const segSummary = lesion.segments.length > 0
    ? `Seg ${lesion.segments.slice(0, 5).join(', ')}${lesion.segments.length > 5 ? '…' : ''}`
    : 'No segments selected'

  return (
    <div
      className="rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200"
      style={{
        borderColor: isExpanded ? lesion.color : '#e5e7eb',
        borderWidth: isExpanded ? 2 : 1,
      }}
    >
      {/* ── Card header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={onToggleExpand}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: lesion.color }}
        />
        <span className="font-semibold text-gray-800 text-sm">Lesion {lesionNumber}</span>
        <span className="text-gray-400 text-xs truncate max-w-[180px]">{segSummary}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
          lesion.occlusionType === 'total-occlusion'
            ? 'bg-red-50 text-red-600'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {lesion.occlusionType === 'total-occlusion' ? 'CTO' : '50–99%'}
        </span>
        <div className="flex-1" />
        <span className="text-sm font-bold tabular-nums text-gray-700 flex-shrink-0">{fmt(score)}</span>
        <button
          className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
          onClick={e => { e.stopPropagation(); onRemove() }}
          title="Remove lesion"
        >
          <X size={14} />
        </button>
        {isExpanded
          ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
        }
      </div>

      {/* ── Expanded content ── */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-5">

          {/* ── 1. Segments ── */}
          <div>
            <SectionLabel>Segments (≥50% stenosis, vessel ≥1.5mm)</SectionLabel>
            <div className="space-y-2">
              {(Object.entries(grouped) as [string, typeof grouped.lm][]).map(([vessel, segs]) =>
                segs.length > 0 && (
                  <div key={vessel} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 font-semibold w-8 pt-1.5 flex-shrink-0">
                      {VESSEL_LABELS[vessel]}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {segs.map(seg => {
                        const sel = lesion.segments.includes(seg.id)
                        return (
                          <button
                            key={seg.id}
                            onClick={() => toggleSegment(seg.id)}
                            title={seg.name}
                            className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                              sel
                                ? 'border-transparent text-white'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                            style={sel ? { backgroundColor: lesion.color, borderColor: lesion.color } : {}}
                          >
                            {seg.id}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ── 2. Occlusion type ── */}
          <div>
            <SectionLabel>Occlusion Type</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'non-occlusive' as const, label: '50–99%', sub: 'Non-occlusive  ×2' },
                { value: 'total-occlusion' as const, label: '100%', sub: 'Total occlusion  ×5' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ occlusionType: opt.value })}
                  className={`py-2 px-3 rounded-lg border text-left transition-all ${
                    lesion.occlusionType === opt.value
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. CTO details (conditional) ── */}
          {lesion.occlusionType === 'total-occlusion' && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 space-y-2.5">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">CTO Sub-scores</p>

              {[
                { key: 'ageOver3Months' as const,      label: 'Age >3 months or unknown', pts: '+1' },
                { key: 'bluntStump' as const,           label: 'Blunt stump',              pts: '+1' },
                { key: 'bridgingCollaterals' as const,  label: 'Bridging collaterals',     pts: '+1' },
              ].map(({ key, label, pts }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Toggle
                      checked={lesion.totalOcclusionDetails[key]}
                      onChange={v => onUpdate({
                        totalOcclusionDetails: { ...lesion.totalOcclusionDetails, [key]: v },
                      })}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                  <span className={`text-xs font-semibold ml-2 ${
                    lesion.totalOcclusionDetails[key] ? 'text-red-500' : 'text-gray-300'
                  }`}>{pts}</span>
                </div>
              ))}

              {/* Side branches counter */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Side branches ≥1.5mm at site</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${
                    lesion.totalOcclusionDetails.sideBranchesAtSite > 0 ? 'text-red-500' : 'text-gray-300'
                  }`}>+{lesion.totalOcclusionDetails.sideBranchesAtSite}</span>
                  <button
                    onClick={() => onUpdate({
                      totalOcclusionDetails: {
                        ...lesion.totalOcclusionDetails,
                        sideBranchesAtSite: Math.max(0, lesion.totalOcclusionDetails.sideBranchesAtSite - 1),
                      },
                    })}
                    className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center bg-white"
                  >−</button>
                  <span className="w-6 text-center text-sm font-bold text-gray-700 tabular-nums">
                    {lesion.totalOcclusionDetails.sideBranchesAtSite}
                  </span>
                  <button
                    onClick={() => onUpdate({
                      totalOcclusionDetails: {
                        ...lesion.totalOcclusionDetails,
                        sideBranchesAtSite: lesion.totalOcclusionDetails.sideBranchesAtSite + 1,
                      },
                    })}
                    className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center bg-white"
                  >+</button>
                </div>
              </div>

              {/* First segment beyond TO */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Toggle
                    checked={lesion.totalOcclusionDetails.firstVisibleSegmentBeyond !== null}
                    onChange={v => onUpdate({
                      totalOcclusionDetails: {
                        ...lesion.totalOcclusionDetails,
                        firstVisibleSegmentBeyond: v ? '1' : null,
                      },
                    })}
                  />
                  <span className="text-sm text-gray-700">First segment beyond TO visible</span>
                </label>
                <span className={`text-xs font-semibold ml-2 ${
                  lesion.totalOcclusionDetails.firstVisibleSegmentBeyond ? 'text-red-500' : 'text-gray-300'
                }`}>+1</span>
              </div>
            </div>
          )}

          {/* ── 4. Trifurcation ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Trifurcation</SectionLabel>
              <Toggle
                checked={lesion.trifurcation.present}
                onChange={v => onUpdate({ trifurcation: { ...lesion.trifurcation, present: v, diseasedSegments: v ? lesion.trifurcation.diseasedSegments : null } })}
              />
            </div>
            {lesion.trifurcation.present && (
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                <p className="text-xs text-gray-500 mb-2">Number of diseased segments:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {([1, 2, 3, 4] as const).map(n => {
                    const pts = n + 2
                    const sel = lesion.trifurcation.diseasedSegments === n
                    return (
                      <button
                        key={n}
                        onClick={() => onUpdate({ trifurcation: { ...lesion.trifurcation, diseasedSegments: n } })}
                        className={`py-2 rounded-lg border text-center transition-all ${
                          sel
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-lg font-bold leading-none">{n}</div>
                        <div className={`text-xs mt-0.5 ${sel ? 'text-orange-100' : 'text-gray-400'}`}>+{pts} pts</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── 5. Bifurcation (Medina) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Bifurcation (Medina)</SectionLabel>
              <Toggle
                checked={lesion.bifurcation.present}
                onChange={v => onUpdate({ bifurcation: { ...lesion.bifurcation, present: v, type: v ? lesion.bifurcation.type : null } })}
              />
            </div>
            {lesion.bifurcation.present && (
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 space-y-3">
                {/* Medina type grid */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Type <span className="text-gray-400">(prox vessel · distal main · side branch)</span>
                    <span className="ml-2 text-purple-500">A/B/C = +1 pt, D/E/F/G = +2 pts</span>
                  </p>
                  <div className="grid grid-cols-7 gap-1">
                    {(Object.keys(MEDINA_PATTERNS) as BifurcationType[]).map(type => {
                      const [p, m, s] = MEDINA_PATTERNS[type]
                      const pts = ['A', 'B', 'C'].includes(type) ? '+1' : '+2'
                      const sel = lesion.bifurcation.type === type
                      return (
                        <button
                          key={type}
                          onClick={() => onUpdate({ bifurcation: { ...lesion.bifurcation, type } })}
                          title={`(${p ? 1 : 0},${m ? 1 : 0},${s ? 1 : 0})`}
                          className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all ${
                            sel
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          <MedinaIcon type={type} selected={sel} />
                          <span className="text-xs font-bold mt-0.5">{type}</span>
                          <span className={`text-xs ${sel ? 'text-purple-200' : 'text-gray-400'}`}>{pts}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Angulation */}
                <div className="flex items-center justify-between pt-1 border-t border-purple-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Toggle
                      checked={lesion.bifurcation.angulationLessThan70}
                      onChange={v => onUpdate({ bifurcation: { ...lesion.bifurcation, angulationLessThan70: v } })}
                    />
                    <span className="text-sm text-gray-700">Bifurcation angulation &lt;70°</span>
                  </label>
                  <span className={`text-xs font-semibold ml-2 ${
                    lesion.bifurcation.angulationLessThan70 ? 'text-purple-600' : 'text-gray-300'
                  }`}>+1</span>
                </div>
              </div>
            )}
          </div>

          {/* ── 6. Other adverse features ── */}
          <div>
            <SectionLabel>Other Adverse Features</SectionLabel>
            <div className="rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {[
                { key: 'aortoOstial'           as const, label: 'Aorto-ostial lesion',         pts: '+1', ptVal: 1 },
                { key: 'severeTortuosity'       as const, label: 'Severe tortuosity (≥45°)',     pts: '+2', ptVal: 2 },
                { key: 'lengthGreaterThan20mm'  as const, label: 'Length >20mm',                 pts: '+1', ptVal: 1 },
                { key: 'heavyCalcification'     as const, label: 'Heavy calcification',          pts: '+2', ptVal: 2 },
                { key: 'thrombus'               as const, label: 'Thrombus',                     pts: '+1', ptVal: 1 },
              ].map(({ key, label, pts }) => {
                const active = lesion.adverseFeatures[key]
                return (
                  <div key={key} className={`flex items-center justify-between px-3 py-2.5 transition-colors ${active ? 'bg-blue-50' : 'bg-white'}`}>
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <Toggle
                        checked={active}
                        onChange={v => onUpdate({ adverseFeatures: { ...lesion.adverseFeatures, [key]: v } })}
                      />
                      <span className={`text-sm ${active ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{label}</span>
                    </label>
                    <span className={`text-xs font-bold ml-2 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-300'}`}>{pts}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
