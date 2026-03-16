'use client'

import { Dominance, Lesion, SegmentId } from '@/lib/types'
import { getAvailableSegments, getSegmentWeight } from '@/lib/segments'

interface SegmentLineDef {
  id: SegmentId
  x1: number; y1: number; x2: number; y2: number
  labelX: number; labelY: number
  anchor: 'start' | 'middle' | 'end'
}

const SEGMENT_LINES: SegmentLineDef[] = [
  // RCA
  { id: '1',   x1: 300, y1:  25, x2: 316, y2:  80, labelX: 322, labelY:  52, anchor: 'start' },
  { id: '2',   x1: 316, y1:  80, x2: 319, y2: 152, labelX: 328, labelY: 116, anchor: 'start' },
  { id: '3',   x1: 319, y1: 152, x2: 309, y2: 224, labelX: 322, labelY: 189, anchor: 'start' },
  { id: '4',   x1: 309, y1: 224, x2: 286, y2: 270, labelX: 299, labelY: 255, anchor: 'start' },
  // PLV (right dom only)
  { id: '16',  x1: 317, y1: 166, x2: 292, y2: 188, labelX: 288, labelY: 187, anchor: 'end'   },
  { id: '16a', x1: 292, y1: 188, x2: 280, y2: 202, labelX: 276, labelY: 201, anchor: 'end'   },
  { id: '16b', x1: 280, y1: 202, x2: 270, y2: 215, labelX: 266, labelY: 214, anchor: 'end'   },
  { id: '16c', x1: 270, y1: 215, x2: 262, y2: 227, labelX: 258, labelY: 226, anchor: 'end'   },
  // LM
  { id: '5',   x1: 165, y1:  25, x2: 165, y2:  68, labelX: 151, labelY:  48, anchor: 'end'   },
  // LAD
  { id: '6',   x1: 165, y1:  68, x2: 137, y2: 130, labelX: 124, labelY:  99, anchor: 'end'   },
  { id: '7',   x1: 137, y1: 130, x2: 123, y2: 199, labelX: 108, labelY: 166, anchor: 'end'   },
  { id: '8',   x1: 123, y1: 199, x2: 112, y2: 270, labelX:  97, labelY: 236, anchor: 'end'   },
  // Diagonals (branch from seg 6 & 7 midpoints)
  { id: '9',   x1: 151, y1:  99, x2: 197, y2: 112, labelX: 199, labelY: 108, anchor: 'start' },
  { id: '9a',  x1: 197, y1: 112, x2: 222, y2: 120, labelX: 224, labelY: 116, anchor: 'start' },
  { id: '10',  x1: 130, y1: 164, x2: 172, y2: 173, labelX: 174, labelY: 169, anchor: 'start' },
  { id: '10a', x1: 172, y1: 173, x2: 195, y2: 179, labelX: 197, labelY: 175, anchor: 'start' },
  // LCx (from LM bifurcation, going left)
  { id: '11',  x1: 165, y1:  68, x2:  87, y2:  82, labelX: 126, labelY:  61, anchor: 'middle' },
  // OM branches (from seg 11 at t≈0.39, 0.62, 0.80)
  { id: '12',  x1: 134, y1:  74, x2: 127, y2: 113, labelX: 114, labelY:  96, anchor: 'end'   },
  { id: '12a', x1: 117, y1:  77, x2: 110, y2: 116, labelX:  97, labelY:  99, anchor: 'end'   },
  { id: '12b', x1: 103, y1:  80, x2:  96, y2: 119, labelX:  83, labelY: 103, anchor: 'end'   },
  // LCx distal
  { id: '13',  x1:  87, y1:  82, x2:  65, y2: 154, labelX:  51, labelY: 119, anchor: 'end'   },
  // LPL branches (from seg 13 midpoint)
  { id: '14',  x1:  76, y1: 118, x2:  97, y2: 141, labelX: 100, labelY: 138, anchor: 'start' },
  { id: '14a', x1:  97, y1: 141, x2: 110, y2: 154, labelX: 113, labelY: 151, anchor: 'start' },
  { id: '14b', x1: 110, y1: 154, x2: 121, y2: 165, labelX: 124, labelY: 163, anchor: 'start' },
  // PDA from LCx (left dom only)
  { id: '15',  x1:  65, y1: 154, x2:  85, y2: 198, labelX:  67, labelY: 182, anchor: 'end'   },
]

// Dots at key branch/bifurcation points
const BRANCH_DOTS = [
  { cx: 165, cy: 68 },   // LM → LAD + LCx
  { cx: 151, cy: 99 },   // D1 origin on LAD
  { cx: 130, cy: 164 },  // D2 origin on LAD
  { cx: 134, cy: 74 },   // IM origin on LCx
  { cx: 117, cy: 77 },   // OM1 origin on LCx
  { cx: 103, cy: 80 },   // OM2 origin on LCx
  { cx:  76, cy: 118 },  // LPL origin on LCx distal
  { cx: 317, cy: 166 },  // PLV origin on RCA
]

// Branch dots that only exist in specific dominance
const BRANCH_DOTS_RIGHT_ONLY = [{ cx: 317, cy: 166 }]

interface Props {
  dominance: Dominance
  lesions: Lesion[]
  activeLesionId: string | null
  onSegmentToggle: (segId: SegmentId) => void
}

export function CoronaryDiagram({ dominance, lesions, activeLesionId, onSegmentToggle }: Props) {
  const available = new Set(getAvailableSegments(dominance).map(s => s.id))

  // Map segment → lesion color
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
    return '#d1d5db'
  }

  const getStrokeWidth = (segId: SegmentId) => {
    const w = getSegmentWeight(segId, dominance)
    if (w >= 3.5) return 8
    if (w >= 1.0) return 6
    return 4
  }

  return (
    <div className="relative">
      <svg
        viewBox="0 0 395 290"
        className="w-full"
        style={{ userSelect: 'none', maxHeight: 360 }}
      >
        {/* Aortic root */}
        <line x1="162" y1="25" x2="302" y2="25" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 2" />
        <text x="232" y="19" textAnchor="middle" fontSize={8} fill="#9ca3af" fontStyle="italic">Aorta</text>

        {/* Vessel labels */}
        <text x="328" y="20" fontSize={9} fill="#6b7280" fontWeight={700}>RCA</text>
        <text x="148" y="20" textAnchor="end" fontSize={9} fill="#6b7280" fontWeight={700}>LM</text>
        <text x="95"  y="284" textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight={700}>LAD</text>
        <text x="32"  y="102" textAnchor="end" fontSize={9} fill="#6b7280" fontWeight={700}>LCx</text>

        {/* Branch dots */}
        {BRANCH_DOTS.map((dot, i) => {
          const isRightOnly = BRANCH_DOTS_RIGHT_ONLY.some(d => d.cx === dot.cx && d.cy === dot.cy)
          if (isRightOnly && dominance !== 'right') return null
          return (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={3} fill="#9ca3af" />
          )
        })}

        {/* Segments */}
        {SEGMENT_LINES.map(seg => {
          if (!available.has(seg.id)) return null

          const color = getStrokeColor(seg.id)
          const isInActiveLesion = activeSegments.has(seg.id)
          const isClickable = activeLesionId !== null
          const sw = getStrokeWidth(seg.id)

          return (
            <g key={seg.id} className={isClickable ? 'cursor-pointer' : 'cursor-default'}>
              {/* Wide transparent hit area */}
              <line
                x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                stroke="transparent"
                strokeWidth={22}
                onClick={() => isClickable && onSegmentToggle(seg.id)}
              />
              {/* Visible segment line */}
              <line
                x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                stroke={color}
                strokeWidth={isInActiveLesion ? sw + 2 : sw}
                strokeLinecap="round"
                strokeOpacity={isInActiveLesion ? 1 : color === '#d1d5db' ? 0.8 : 0.9}
                style={{ transition: 'stroke 0.15s, stroke-width 0.1s' }}
                pointerEvents="none"
              />
              {/* Segment label */}
              <text
                x={seg.labelX}
                y={seg.labelY}
                textAnchor={seg.anchor}
                fontSize={8}
                fill={color === '#d1d5db' ? '#9ca3af' : '#374151'}
                fontWeight={isInActiveLesion ? 700 : 500}
                className="pointer-events-none select-none"
              >
                {seg.id}
              </text>
            </g>
          )
        })}
      </svg>

      {!activeLesionId && lesions.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-1">Expand a lesion card to select segments on diagram</p>
      )}
      {lesions.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-1">Add a lesion below to start</p>
      )}
    </div>
  )
}
