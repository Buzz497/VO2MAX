import { formatShort, formatWeekday, todayISO } from '../lib/date'
import { SESSION_INFO } from '../lib/plan'
import type { TrainingSession } from '../lib/types'
import { CheckIcon } from './Icons'

interface Props {
  sessions: TrainingSession[]
  onToggle: (session: TrainingSession) => void
}

export function SessionHistory({ sessions, onToggle }: Props) {
  const today = todayISO()
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  const past = sorted.filter((s) => s.date < today || (s.date === today && s.status !== 'upcoming'))
  const upcoming = sorted.filter((s) => s.date >= today && !(s.date === today && s.status !== 'upcoming'))

  const recentPast = past.slice(-6).reverse()
  const nextUpcoming = upcoming.slice(0, 5)

  const completedCount = sessions.filter((s) => s.status === 'completed').length

  function Row({ s }: { s: TrainingSession }) {
    const canToggle = s.date <= today
    return (
      <div
        className="session-row"
        style={{ cursor: canToggle ? 'pointer' : 'default' }}
        onClick={() => canToggle && onToggle(s)}
      >
        <div className={`tick ${s.status}`}>
          {s.status === 'completed' && <CheckIcon size={14} />}
        </div>
        <div className="session-row-body">
          <div className="session-row-title">{s.title}</div>
          <div className="session-row-sub">{SESSION_INFO[s.kind].short} · {s.durationMin} min</div>
        </div>
        <div className="session-row-date">
          {formatWeekday(s.date)}
          <br />
          {formatShort(s.date)}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title-row">
        <span className="card-title">Training Log</span>
        <span className="card-link" style={{ cursor: 'default', color: 'var(--text-tertiary)' }}>
          {completedCount} completed
        </span>
      </div>

      {nextUpcoming.length > 0 && (
        <>
          <div className="section-label" style={{ margin: '0 0 4px' }}>
            Upcoming
          </div>
          {nextUpcoming.map((s) => (
            <Row key={s.id} s={s} />
          ))}
        </>
      )}

      {recentPast.length > 0 && (
        <>
          <div className="section-label" style={{ margin: '18px 0 4px' }}>
            Recent
          </div>
          {recentPast.map((s) => (
            <Row key={s.id} s={s} />
          ))}
        </>
      )}

      {nextUpcoming.length === 0 && recentPast.length === 0 && (
        <div className="empty-state">No sessions yet.</div>
      )}
    </div>
  )
}
