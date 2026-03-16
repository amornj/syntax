'use client'

import { Dominance, Lesion, SegmentId } from '@/lib/types'
import { getAvailableSegments, getSegmentWeight } from '@/lib/segments'

/* ──────────────────────────────────────────────────
   Anatomically-correct coronary artery SVG diagram
   Standard angiographic orientation:
     LEFT side  = RCA (backwards C-shape)
     RIGHT side = LM → LAD (right/down) + LCx (left/down)
   ────────────────────────────────────────────────── */

interface SegmentDef {
  id: SegmentId
  d: string                 // SVG path "d" attribute (Bézier curves)
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'middle' | 'end'
}

// ── RIGHT DOMINANT paths ──
const RCA_SEGMENTS: SegmentDef[] = [
  // Seg 1: RCA proximal — top of C, curves left and down
  { id: '1',  d: 'M 95 30 C 90 35, 68 42, 55 65',             labelX: 100, labelY: 38, labelAnchor: 'start' },
  // Seg 2: RCA mid — descends on left side of C
  { id: '2',  d: 'M 55 65 C 44 85, 38 110, 38 140',            labelX: 28, labelY: 105, labelAnchor: 'end' },
  // Seg 3: RCA distal — bottom of C, curves right
  { id: '3',  d: 'M 38 140 C 38 165, 45 185, 62 200',          labelX: 30, labelY: 175, labelAnchor: 'end' },
  // Seg 4: PDA from RCA — continues right along bottom
  { id: '4',  d: 'M 62 200 C 75 210, 95 218, 120 222',         labelX: 95, labelY: 235, labelAnchor: 'middle' },
  // Seg 16: Posterolateral from RCA — goes up-right from crux area
  { id: '16', d: 'M 62 200 C 72 190, 85 182, 100 176',         labelX: 104, labelY: 172, labelAnchor: 'start' },
  // Seg 16a: perpendicular to seg 16 trajectory (16 goes ~30° up-right, so 16a goes ~120° = down-right)
  { id: '16a', d: 'M 74 193 C 80 200, 86 208, 92 216',         labelX: 96, labelY: 218, labelAnchor: 'start' },
  // Seg 16b: perpendicular to seg 16, from middle of 16
  { id: '16b', d: 'M 85 186 C 92 194, 98 202, 104 210',        labelX: 108, labelY: 212, labelAnchor: 'start' },
  // Seg 16c: perpendicular to seg 16, from distal 16
  { id: '16c', d: 'M 96 180 C 102 188, 108 196, 114 204',      labelX: 118, labelY: 206, labelAnchor: 'start' },
]

// ── LEFT CORONARY SYSTEM paths ──
const LEFT_SEGMENTS: SegmentDef[] = [
  // Seg 5: Left Main — short, enters from upper-right going left
  { id: '5',   d: 'M 280 30 C 275 38, 268 48, 260 58',         labelX: 286, labelY: 36, labelAnchor: 'start' },

  // === LAD system (continues right and curves down) ===
  // Seg 6: Proximal LAD — from bifurcation, goes right
  { id: '6',   d: 'M 260 58 C 268 65, 280 72, 290 82',         labelX: 295, labelY: 68, labelAnchor: 'start' },
  // Seg 7: Mid LAD — continues right, begins curving down
  { id: '7',   d: 'M 290 82 C 302 94, 312 110, 318 130',       labelX: 324, labelY: 110, labelAnchor: 'start' },
  // Seg 8: Distal/Apical LAD — curves down to apex
  { id: '8',   d: 'M 318 130 C 322 155, 320 185, 310 218',     labelX: 324, labelY: 180, labelAnchor: 'start' },

  // All diagonals branch RIGHT-downward from LAD, parallel to each other, away from LCx.
  // LAD path: seg6 ~(260,58)→(290,82), seg7 ~(290,82)→(318,130), seg8 ~(318,130)→(310,218)
  // Diagonal direction: roughly 40° right-downward (dx=+20, dy=+35 per unit)

  // Seg 9: D1 — takes off from PROXIMAL LAD (seg 6, ~halfway at 275,70)
  { id: '9',   d: 'M 275 70 C 286 80, 296 95, 304 112',        labelX: 308, labelY: 108, labelAnchor: 'start' },
  // Seg 9a: D1a — takes off from PROXIMAL-MID LAD junction (seg 6/7 boundary at ~290,82)
  { id: '9a',  d: 'M 290 82 C 300 92, 312 107, 320 124',       labelX: 324, labelY: 120, labelAnchor: 'start' },
  // Seg 10: D2 — takes off from MID LAD (seg 7, ~halfway at 305,106)
  { id: '10',  d: 'M 305 106 C 316 116, 326 131, 334 148',     labelX: 338, labelY: 144, labelAnchor: 'start' },
  // Seg 10a: D2a — takes off from MID-DISTAL LAD junction (seg 7/8 boundary at ~318,130)
  { id: '10a', d: 'M 318 130 C 328 140, 338 155, 346 172',     labelX: 350, labelY: 168, labelAnchor: 'start' },

  // === LCx system (goes down-left from bifurcation) ===
  // Seg 11: Proximal LCx — from bifurcation, curves down and left
  { id: '11',  d: 'M 260 58 C 252 66, 240 75, 228 82',         labelX: 238, labelY: 60, labelAnchor: 'end' },

  // Seg 12: Intermediate/Anterolateral — branch down from prox LCx
  { id: '12',  d: 'M 248 68 C 250 80, 252 92, 254 108',        labelX: 258, labelY: 95, labelAnchor: 'start' },

  // Seg 12a: OM1 — branch down from LCx
  { id: '12a', d: 'M 238 76 C 240 88, 242 102, 244 118',       labelX: 248, labelY: 108, labelAnchor: 'start' },
  // Seg 12b: OM2 — branch down from LCx
  { id: '12b', d: 'M 232 80 C 234 92, 236 106, 238 122',       labelX: 242, labelY: 118, labelAnchor: 'start' },

  // Seg 13: Distal LCx — continues down-left
  { id: '13',  d: 'M 228 82 C 218 92, 206 108, 198 128',       labelX: 192, labelY: 110, labelAnchor: 'end' },

  // Seg 14: Left Posterolateral — branches right from distal LCx
  { id: '14',  d: 'M 210 100 C 218 110, 226 120, 234 132',     labelX: 238, labelY: 128, labelAnchor: 'start' },
  // Seg 14a: Left Posterolateral a
  { id: '14a', d: 'M 204 115 C 212 126, 222 136, 230 148',     labelX: 234, labelY: 144, labelAnchor: 'start' },
  // Seg 14b: Left Posterolateral b
  { id: '14b', d: 'M 198 128 C 208 140, 218 152, 228 164',     labelX: 232, labelY: 160, labelAnchor: 'start' },

  // Seg 15: PDA from LCx (LEFT DOMINANT ONLY) — at bottom, sweeps right
  { id: '15',  d: 'M 198 128 C 195 150, 198 175, 210 200',     labelX: 190, labelY: 175, labelAnchor: 'end' },
]

const ALL_SEGMENTS = [...RCA_SEGMENTS, ...LEFT_SEGMENTS]

interface Props {
  dominance: Dominance
  lesions: Lesion[]
  activeLesionId: string | null
  onSegmentToggle: (segId: SegmentId) => void
}

export function CoronaryDiagram({ dominance, lesions, activeLesionId, onSegmentToggle }: Props) {
  const available = new Set(getAvailableSegments(dominance).map(s => s.id))

  // Map segment → lesion color (last lesion wins if overlapping)
  const segmentColors: Record<string, string> = {}
  for (const lesion of lesions) {
    for (const segId of lesion.segments) {
      segmentColors[segId] = lesion.color
    }
  }

  const activeLesion = lesions.find(l => l.id === activeLesionId)
  const activeSegments = new Set(activeLesion?.segments ?? [])

  const getStrokeColor = (segId: SegmentId) => {
    if (segmentColors[segId]) return segmentColors[segId]
    return '#cbd5e1' // slate-300
  }

  const getStrokeWidth = (segId: SegmentId) => {
    const w = getSegmentWeight(segId, dominance)
    if (w >= 5.0) return 7  // LM
    if (w >= 3.0) return 6  // pLAD, mLAD
    if (w >= 1.5) return 5  // pLCx (left dom), RCA main
    if (w >= 1.0) return 4  // most segments
    return 3                 // 0.5 weight branches
  }

  const isClickable = activeLesionId !== null

  return (
    <div className="relative">
      <svg
        viewBox="0 0 390 250"
        className="w-full"
        style={{ userSelect: 'none', maxHeight: 380 }}
      >
        {/* ── Aortic root ── */}
        <path
          d="M 85 26 C 85 14, 100 8, 115 8 L 260 8 C 275 8, 290 14, 290 26"
          fill="none" stroke="#e2e8f0" strokeWidth={1.5}
        />
        <text x="188" y="8" textAnchor="middle" fontSize={7} fill="#94a3b8" fontStyle="italic">Aorta</text>

        {/* ── Vessel group labels ── */}
        <text x="60" y="22" textAnchor="middle" fontSize={9} fill="#64748b" fontWeight={700}>RCA</text>
        <text x="308" y="22" textAnchor="middle" fontSize={9} fill="#64748b" fontWeight={700}>LCA</text>

        {/* ── Dashed segment boundary lines ── */}
        {/* RCA boundaries */}
        <line x1="48" y1="60" x2="62" y2="70" stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3 2" />
        <line x1="32" y1="135" x2="46" y2="145" stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3 2" />
        {/* LAD boundaries */}
        <line x1="286" y1="76" x2="296" y2="86" stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3 2" />
        <line x1="314" y1="124" x2="324" y2="134" stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3 2" />

        {/* ── Render all segment paths ── */}
        {ALL_SEGMENTS.map(seg => {
          if (!available.has(seg.id)) return null

          const color = getStrokeColor(seg.id)
          const isInActiveLesion = activeSegments.has(seg.id)
          const sw = getStrokeWidth(seg.id)
          const isAssigned = !!segmentColors[seg.id]

          return (
            <g key={seg.id} className={isClickable ? 'cursor-pointer' : 'cursor-default'}>
              {/* Wide transparent hit area for clicking */}
              <path
                d={seg.d}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                onClick={() => isClickable && onSegmentToggle(seg.id)}
              />
              {/* Visible vessel path */}
              <path
                d={seg.d}
                fill="none"
                stroke={color}
                strokeWidth={isInActiveLesion ? sw + 2 : sw}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={isInActiveLesion ? 1 : isAssigned ? 0.9 : 0.6}
                style={{ transition: 'stroke 0.15s, stroke-width 0.15s, stroke-opacity 0.15s' }}
                pointerEvents="none"
              />
              {/* Segment number label */}
              <text
                x={seg.labelX}
                y={seg.labelY}
                textAnchor={seg.labelAnchor}
                fontSize={7.5}
                fill={isAssigned ? '#1e293b' : '#94a3b8'}
                fontWeight={isInActiveLesion ? 700 : isAssigned ? 600 : 400}
                className="pointer-events-none select-none"
                fontFamily="system-ui, sans-serif"
              >
                {seg.id}
              </text>
            </g>
          )
        })}

        {/* ── Bifurcation dots ── */}
        <circle cx={260} cy={58} r={2.5} fill="#94a3b8" /> {/* LM bifurcation */}
        <circle cx={95} cy={30} r={2.5} fill="#94a3b8" />  {/* RCA ostium */}
        <circle cx={280} cy={30} r={2.5} fill="#94a3b8" />  {/* LM ostium */}

        {/* ── Legend ── */}
        <g transform="translate(5, 238)">
          <text fontSize={7} fill="#94a3b8" fontFamily="system-ui">
            {dominance === 'right' ? '● Right Dominant' : '● Left Dominant'}
          </text>
        </g>

        {/* ── Color legend for stenosis ── */}
        {lesions.length > 0 && (
          <g transform="translate(280, 232)">
            {lesions.slice(0, 6).map((l, i) => (
              <g key={l.id} transform={`translate(${i * 14}, 0)`}>
                <circle cx={5} cy={5} r={4} fill={l.color} opacity={0.9} />
                <text x={5} y={15} textAnchor="middle" fontSize={6} fill="#64748b">L{i + 1}</text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Hint text */}
      {!activeLesionId && lesions.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-1">Expand a lesion card to select segments on diagram</p>
      )}
      {activeLesionId && (
        <p className="text-center text-xs text-indigo-500 font-medium mt-1">Click segments to add/remove from lesion</p>
      )}
      {lesions.length === 0 && (
        <p className="text-center text-xs text-slate-400 mt-1">Add a lesion below to start scoring</p>
      )}
    </div>
  )
}
