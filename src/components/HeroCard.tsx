import type { UserSettings, Vo2MaxReading } from '../lib/types'

interface Props {
  readings: Vo2MaxReading[]
  settings: UserSettings
}

const RING_R = 34
const RING_CIRC = 2 * Math.PI * RING_R

export function HeroCard({ readings, settings }: Props) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : undefined

  const current = latest?.value ?? settings.baselineVo2Max
  const span = settings.goalVo2Max - settings.baselineVo2Max
  const progress = span > 0 ? Math.min(Math.max((current - settings.baselineVo2Max) / span, 0), 1) : 0
  const dashOffset = RING_CIRC * (1 - progress)

  const delta = previous ? current - previous.value : 0

  return (
    <div className="card hero-card">
      <div className="hero-ring">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={RING_R} fill="none" stroke="var(--separator)" strokeWidth="8" />
          <circle
            cx="44"
            cy="44"
            r={RING_R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 44 44)"
          />
          <text x="44" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-primary)">
            {Math.round(progress * 100)}%
          </text>
          <text x="44" y="55" textAnchor="middle" fontSize="8.5" fill="var(--text-tertiary)">
            to goal
          </text>
        </svg>
      </div>
      <div className="hero-main">
        <div className="hero-label">Cardio Fitness · VO2 Max</div>
        <div className="hero-value-row">
          <span className="hero-value">{current.toFixed(1)}</span>
          <span className="hero-unit">mL/kg/min</span>
        </div>
        {previous && delta !== 0 && (
          <div className="hero-delta" style={{ color: delta > 0 ? 'var(--good-text)' : 'var(--miss)' }}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} since last reading
          </div>
        )}
        <div className="hero-goal">
          Baseline {settings.baselineVo2Max} → Goal {settings.goalVo2Max} mL/kg/min
        </div>
      </div>
    </div>
  )
}
