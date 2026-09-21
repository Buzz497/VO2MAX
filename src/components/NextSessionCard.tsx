import { daysBetween, formatLong, todayISO } from '../lib/date'
import type { TrainingSession } from '../lib/types'
import { CheckIcon, FlameIcon, RunIcon } from './Icons'

interface Props {
  session: TrainingSession | null
  onComplete: (id: string) => void
  onOpenPlan: () => void
}

function whenLabel(dateISO: string): string {
  const diff = daysBetween(todayISO(), dateISO)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 0) return 'Overdue'
  return `In ${diff} days`
}

export function NextSessionCard({ session, onComplete, onOpenPlan }: Props) {
  if (!session) {
    return (
      <div className="card">
        <div className="card-title-row">
          <span className="card-title">Next Session</span>
        </div>
        <div className="no-session-card">
          <p>No session scheduled yet.</p>
          <div style={{ height: 12 }} />
          <button className="btn-secondary" onClick={onOpenPlan}>
            Set up training plan
          </button>
        </div>
      </div>
    )
  }

  const isHard = session.kind === 'vo2max_intervals' || session.kind === 'tempo_run'

  return (
    <div className="card next-session-card">
      <div className="next-session-top">
        <div className="session-icon">{isHard ? <FlameIcon /> : <RunIcon />}</div>
        <div className="next-session-body">
          <div className="next-session-when">{whenLabel(session.date)} · Next Training Session</div>
          <div className="next-session-title">{session.title}</div>
          <div className="next-session-desc">{session.description}</div>
          <div className="next-session-meta">
            {formatLong(session.date)} · {session.duration}
          </div>
        </div>
      </div>
      <div className="next-session-actions">
        <button onClick={() => onComplete(session.id)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckIcon size={15} /> Mark Complete
          </span>
        </button>
        <button onClick={onOpenPlan}>View Full Plan</button>
      </div>
    </div>
  )
}
