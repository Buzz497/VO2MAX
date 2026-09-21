import type { UserSettings, Vo2MaxReading } from '../lib/types'

interface Props {
  readings: Vo2MaxReading[]
  settings: UserSettings
}

export function HeroCard({ readings, settings }: Props) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : undefined

  const current = latest?.value ?? settings.baselineVo2Max
  const span = settings.goalVo2Max - settings.baselineVo2Max
  const progress = span > 0 ? Math.min(Math.max((current - settings.baselineVo2Max) / span, 0), 1) : 0

  const delta = previous ? current - previous.value : 0

  return (
    <div className="card hero-card">
      <div className="hero-label">Aerobic Capacity · VO2 Max</div>
      <div className="hero-value-row">
        <span className="hero-value">{current.toFixed(1)}</span>
        <span className="hero-unit">mL/kg/min</span>
      </div>
      {previous && delta !== 0 && (
        <div className="hero-delta" style={{ color: delta > 0 ? 'var(--good-text)' : 'var(--miss)' }}>
          {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} since last reading
        </div>
      )}

      <div className="hero-progress">
        <div className="hero-progress-track">
          <div className="hero-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="hero-progress-labels">
          <span>Baseline {settings.baselineVo2Max}</span>
          <span>{Math.round(progress * 100)}% to goal</span>
          <span>Goal {settings.goalVo2Max}</span>
        </div>
      </div>

      {latest?.source === 'apple_health' && (
        <div className="hero-goal" style={{ color: 'var(--text-tertiary)' }}>
          Synced from Apple Health
        </div>
      )}
    </div>
  )
}
