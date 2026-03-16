'use client'

import { Dominance, Lesion } from '@/lib/types'
import { calculateLesionScore, getScoreTertile, getTertileRecommendation } from '@/lib/syntax-score'

interface Props {
  dominance: Dominance
  lesions: Lesion[]
  diffuseCount: number
}

export function ScorePanel({ dominance, lesions, diffuseCount }: Props) {
  const lesionScores = lesions.map(l => ({
    lesion: l,
    score: calculateLesionScore(l, dominance),
  }))
  const lesionTotal = lesionScores.reduce((sum, { score }) => sum + score, 0)
  const total = lesionTotal + diffuseCount
  const tertile = getScoreTertile(total)

  const tertileConfig = {
    low: {
      label: 'Low',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      score: 'text-emerald-600',
    },
    intermediate: {
      label: 'Intermediate',
      badge: 'bg-amber-100 text-amber-800 border border-amber-200',
      score: 'text-amber-600',
    },
    high: {
      label: 'High',
      badge: 'bg-red-100 text-red-800 border border-red-200',
      score: 'text-red-600',
    },
  }[tertile]

  const fmt = (n: number) => n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Big score */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SYNTAX Score</p>
            <p className={`text-5xl font-bold tabular-nums leading-none mt-1 ${tertileConfig.score}`}>
              {fmt(total)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tertileConfig.badge}`}>
          {tertileConfig.label} Tertile
        </span>
        <p className="mt-2 text-xs text-gray-500 leading-snug">
          {getTertileRecommendation(tertile)}
        </p>
      </div>

      {/* Breakdown */}
      {(lesions.length > 0 || diffuseCount > 0) && (
        <div className="p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Breakdown</p>
          {lesionScores.map(({ lesion, score }, i) => (
            <div key={lesion.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lesion.color }}
                />
                <span className="text-gray-600 truncate">
                  Lesion {i + 1}
                  {lesion.segments.length > 0 && (
                    <span className="text-gray-400 text-xs ml-1">
                      ({lesion.segments.slice(0, 3).join(', ')}{lesion.segments.length > 3 ? '…' : ''})
                    </span>
                  )}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-gray-700 ml-2 flex-shrink-0">{fmt(score)}</span>
            </div>
          ))}
          {diffuseCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Diffuse disease</span>
              <span className="font-semibold tabular-nums text-gray-700">+{diffuseCount}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 mt-1">
            <span className="font-semibold text-gray-700">Total</span>
            <span className={`font-bold tabular-nums text-lg ${tertileConfig.score}`}>{fmt(total)}</span>
          </div>
        </div>
      )}

      {lesions.length === 0 && diffuseCount === 0 && (
        <div className="p-4 text-center text-sm text-gray-400">
          Add a lesion to begin scoring
        </div>
      )}

      {/* Tertile reference */}
      <div className="p-3 pt-2 border-t border-gray-100 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Reference</p>
        {[
          { range: '0–22',  label: 'Low',          color: 'bg-emerald-50 text-emerald-700', rec: 'PCI reasonable' },
          { range: '23–32', label: 'Intermediate',  color: 'bg-amber-50 text-amber-700',   rec: 'Heart team' },
          { range: '≥33',   label: 'High',          color: 'bg-red-50 text-red-700',        rec: 'CABG preferred' },
        ].map(t => (
          <div key={t.label} className="flex items-center justify-between text-xs">
            <span className={`px-1.5 py-0.5 rounded font-medium ${t.color} w-24 text-center`}>{t.range} – {t.label}</span>
            <span className="text-gray-400">{t.rec}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
