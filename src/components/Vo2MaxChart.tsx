import { useMemo, useRef, useState } from 'react'
import { formatShort } from '../lib/date'
import type { Vo2MaxReading } from '../lib/types'

export type ChartRange = '1M' | '3M' | '6M' | '1Y' | 'ALL'

const RANGE_DAYS: Record<ChartRange, number | null> = {
  '1M': 30,
  '3M': 90,
  '6M': 182,
  '1Y': 365,
  ALL: null,
}

interface Props {
  readings: Vo2MaxReading[]
  goal?: number
  range: ChartRange
}

const WIDTH = 300
const HEIGHT = 150
const PAD_TOP = 14
const PAD_BOTTOM = 22
const PAD_X = 4

export function Vo2MaxChart({ readings, goal, range }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
    const days = RANGE_DAYS[range]
    if (days == null) return sorted
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffISO = cutoff.toISOString().slice(0, 10)
    const inRange = sorted.filter((r) => r.date >= cutoffISO)
    return inRange.length >= 2 ? inRange : sorted.slice(-2)
  }, [readings, range])

  const { points, minY, maxY } = useMemo(() => {
    if (filtered.length === 0) return { points: [] as { x: number; y: number; r: Vo2MaxReading }[], minY: 0, maxY: 1 }
    const values = filtered.map((r) => r.value)
    const goalPad = goal ? [goal] : []
    let min = Math.min(...values, ...goalPad)
    let max = Math.max(...values, ...goalPad)
    if (min === max) {
      min -= 2
      max += 2
    }
    const span = max - min
    min -= span * 0.15
    max += span * 0.15

    const first = filtered[0].date
    const last = filtered[filtered.length - 1].date
    const firstT = new Date(first + 'T00:00:00').getTime()
    const lastT = new Date(last + 'T00:00:00').getTime()
    const span2 = Math.max(lastT - firstT, 86_400_000)

    const pts = filtered.map((r) => {
      const t = new Date(r.date + 'T00:00:00').getTime()
      const x = PAD_X + ((t - firstT) / span2) * (WIDTH - PAD_X * 2)
      const y = PAD_TOP + (1 - (r.value - min) / (max - min)) * (HEIGHT - PAD_TOP - PAD_BOTTOM)
      return { x, y, r }
    })
    return { points: pts, minY: min, maxY: max }
  }, [filtered, goal])

  if (filtered.length === 0) {
    return (
      <div className="empty-state">Log a VO2max reading to start your trend.</div>
    )
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${HEIGHT - PAD_BOTTOM} L ${points[0].x.toFixed(1)} ${HEIGHT - PAD_BOTTOM} Z`

  const goalY = goal != null ? PAD_TOP + (1 - (goal - minY) / (maxY - minY)) * (HEIGHT - PAD_TOP - PAD_BOTTOM) : null

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX)
      if (d < closestDist) {
        closestDist = d
        closest = i
      }
    })
    setHoverIdx(closest)
  }

  const active = hoverIdx != null ? points[hoverIdx] : points[points.length - 1]
  const tooltipLeft = active ? Math.min(Math.max((active.x / WIDTH) * 100, 14), 86) : 50

  return (
    <div className="vo2-chart" style={{ position: 'relative' }}>
      {active && (
        <div
          className="vo2-chart-tooltip"
          style={{
            position: 'absolute',
            top: 0,
            left: `${tooltipLeft}%`,
            transform: 'translateX(-50%)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>{active.r.value.toFixed(1)}</span>{' '}
          <span>{formatShort(active.r.date)}</span>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        style={{ display: 'block', marginTop: 22, touchAction: 'none' }}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
        onPointerDown={handleMove}
      >
        <defs>
          <linearGradient id="vo2-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {goalY != null && (
          <>
            <line
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={goalY}
              y2={goalY}
              stroke="var(--text-tertiary)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <text x={WIDTH - PAD_X} y={goalY - 4} textAnchor="end" fontSize="9" fill="var(--text-tertiary)">
              Goal {goal}
            </text>
          </>
        )}

        <path d={areaPath} fill="url(#vo2-area)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hoverIdx != null && (
          <line
            x1={points[hoverIdx].x}
            x2={points[hoverIdx].x}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="var(--separator-opaque)"
            strokeWidth={1}
          />
        )}

        <circle
          cx={active.x}
          cy={active.y}
          r={4}
          fill="var(--accent)"
          stroke="var(--card-bg)"
          strokeWidth={2}
        />

        <text x={points[0].x} y={HEIGHT - 6} fontSize="10" fill="var(--text-tertiary)" textAnchor="start">
          {formatShort(filtered[0].date)}
        </text>
        <text x={points[points.length - 1].x} y={HEIGHT - 6} fontSize="10" fill="var(--text-tertiary)" textAnchor="end">
          {formatShort(filtered[filtered.length - 1].date)}
        </text>
      </svg>
    </div>
  )
}

export { RANGE_DAYS }
