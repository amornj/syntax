'use client'

import { useState, useCallback } from 'react'
import { Dominance, Lesion, SegmentId } from '@/lib/types'
import { createNewLesion, calculateLesionScore, calculateTotalScore } from '@/lib/syntax-score'
import { getAvailableSegments } from '@/lib/segments'
import { CoronaryDiagram } from './coronary-diagram'
import { LesionCard } from './lesion-card'
import { ScorePanel } from './score-panel'
import { SyntaxIIPanel } from './syntax-ii-panel'

// ── Diffuse disease (inline, simple) ─────────────────────────────────────────
function DiffuseDisease({
  dominance,
  selected,
  onToggle,
}: {
  dominance: Dominance
  selected: SegmentId[]
  onToggle: (id: SegmentId) => void
}) {
  const segments = getAvailableSegments(dominance)
  const sel = new Set(selected)
  const groups = {
    LM:  segments.filter(s => s.vessel === 'lm'),
    RCA: segments.filter(s => s.vessel === 'rca'),
    LAD: segments.filter(s => s.vessel === 'lad'),
    LCx: segments.filter(s => s.vessel === 'lcx'),
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Diffuse Disease / Small Vessels</h3>
          <p className="text-xs text-gray-400 mt-0.5">≥75% of segment length has vessel &lt;2mm — +1 pt per segment</p>
        </div>
        {selected.length > 0 && (
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            +{selected.length} pts
          </span>
        )}
      </div>
      <div className="space-y-2">
        {(Object.entries(groups) as [string, typeof groups.LM][]).map(([vessel, segs]) =>
          segs.length > 0 && (
            <div key={vessel} className="flex items-start gap-2">
              <span className="text-xs font-semibold text-gray-400 w-8 pt-1.5 flex-shrink-0">{vessel}</span>
              <div className="flex flex-wrap gap-1.5">
                {segs.map(seg => {
                  const isSelected = sel.has(seg.id)
                  return (
                    <button
                      key={seg.id}
                      onClick={() => onToggle(seg.id)}
                      title={seg.name}
                      className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
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
  )
}

// ── Main calculator ───────────────────────────────────────────────────────────
export function SyntaxCalculator() {
  const [dominance, setDominance] = useState<Dominance>('right')
  const [lesions, setLesions] = useState<Lesion[]>([])
  const [diffuseDiseaseSegments, setDiffuseDiseaseSegments] = useState<SegmentId[]>([])
  const [expandedLesionId, setExpandedLesionId] = useState<string | null>(null)

  const addLesion = () => {
    const newLesion = createNewLesion(lesions.length)
    setLesions(prev => [...prev, newLesion])
    setExpandedLesionId(newLesion.id)
  }

  const removeLesion = (id: string) => {
    setLesions(prev => prev.filter(l => l.id !== id))
    if (expandedLesionId === id) setExpandedLesionId(null)
  }

  const updateLesion = (id: string, updates: Partial<Lesion>) => {
    setLesions(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const toggleSegmentInActiveLesion = useCallback((segId: SegmentId) => {
    if (!expandedLesionId) return
    setLesions(prev => prev.map(l => {
      if (l.id !== expandedLesionId) return l
      const segments = l.segments.includes(segId)
        ? l.segments.filter(s => s !== segId)
        : [...l.segments, segId]
      return { ...l, segments }
    }))
  }, [expandedLesionId])

  const toggleDiffuseSegment = (segId: SegmentId) => {
    setDiffuseDiseaseSegments(prev =>
      prev.includes(segId) ? prev.filter(s => s !== segId) : [...prev, segId]
    )
  }

  const toggleExpanded = (id: string) => {
    setExpandedLesionId(prev => prev === id ? null : id)
  }

  const handleReset = () => {
    if (!confirm('Reset all lesions and scores?')) return
    setLesions([])
    setDiffuseDiseaseSegments([])
    setExpandedLesionId(null)
  }

  const syntaxIScore = calculateTotalScore({
    dominance,
    lesions,
    diffuseDiseaseSegments,
    currentStep: 'results',
    editingLesionId: null,
    lesionStep: 'segments',
  })
  const hasLeftMainDisease = lesions.some(l => l.segments.includes('5'))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SYNTAX Score</h1>
          <p className="text-sm text-gray-400">Coronary artery disease complexity — single-page calculator</p>
        </div>

        {/* Dominance toggle */}
        <div className="flex items-center self-start sm:self-auto">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'right' as Dominance, label: 'Right dominant' },
              { value: 'left' as Dominance, label: 'Left dominant' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDominance(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dominance === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Diagram + Score grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Coronary diagram */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coronary Diagram</h2>
            {expandedLesionId && (
              <span className="text-xs text-blue-500 font-medium">
                Click segments to assign to Lesion {lesions.findIndex(l => l.id === expandedLesionId) + 1}
              </span>
            )}
          </div>
          <CoronaryDiagram
            dominance={dominance}
            lesions={lesions}
            activeLesionId={expandedLesionId}
            onSegmentToggle={toggleSegmentInActiveLesion}
          />
        </div>

        {/* Score panel — sticky on desktop */}
        <div className="lg:sticky lg:top-4 self-start">
          <ScorePanel
            dominance={dominance}
            lesions={lesions}
            diffuseCount={diffuseDiseaseSegments.length}
          />
        </div>
      </div>

      {/* ── Lesions ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Lesions
            {lesions.length > 0 && (
              <span className="ml-2 text-gray-400 font-normal normal-case">({lesions.length})</span>
            )}
          </h2>
          <button
            onClick={addLesion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add Lesion
          </button>
        </div>

        {lesions.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <p className="text-gray-400 text-sm">No lesions yet</p>
            <p className="text-gray-300 text-xs mt-1">Click "Add Lesion" to score a coronary lesion</p>
          </div>
        )}

        {lesions.map((lesion, i) => (
          <LesionCard
            key={lesion.id}
            lesion={lesion}
            lesionNumber={i + 1}
            dominance={dominance}
            isExpanded={expandedLesionId === lesion.id}
            score={calculateLesionScore(lesion, dominance)}
            onToggleExpand={() => toggleExpanded(lesion.id)}
            onRemove={() => removeLesion(lesion.id)}
            onUpdate={updates => updateLesion(lesion.id, updates)}
          />
        ))}
      </div>

      {/* ── Diffuse disease ── */}
      <DiffuseDisease
        dominance={dominance}
        selected={diffuseDiseaseSegments}
        onToggle={toggleDiffuseSegment}
      />

      {/* ── SYNTAX II ── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">SYNTAX Score II</h2>
          <span className="text-xs text-gray-400">Clinical risk prediction — PCI vs CABG</span>
        </div>
        <SyntaxIIPanel
          syntaxIScore={syntaxIScore}
          hasLeftMainDisease={hasLeftMainDisease}
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset All
        </button>
        <p className="text-xs text-gray-300">
          Sianos et al. EuroIntervention 2005 · Leaman et al. Circulation 1981
        </p>
      </div>
    </div>
  )
}
