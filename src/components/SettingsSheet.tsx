import { useState } from 'react'
import type { UserSettings } from '../lib/types'
import { Sheet } from './Sheet'

interface Props {
  settings: UserSettings
  onClose: () => void
  onSave: (partial: Partial<UserSettings>) => void
  onReset: () => void
  onOpenImport: () => void
}

export function SettingsSheet({ settings, onClose, onSave, onReset, onOpenImport }: Props) {
  const [baseline, setBaseline] = useState(String(settings.baselineVo2Max))
  const [goal, setGoal] = useState(String(settings.goalVo2Max))
  const [goalDate, setGoalDate] = useState(settings.goalDate)
  const [age, setAge] = useState(settings.age ? String(settings.age) : '')
  const [sessionsPerWeek, setSessionsPerWeek] = useState(settings.sessionsPerWeek)
  const [includeLongEasyRun, setIncludeLongEasyRun] = useState(settings.includeLongEasyRun)

  function submit() {
    onSave({
      baselineVo2Max: parseFloat(baseline) || settings.baselineVo2Max,
      goalVo2Max: parseFloat(goal) || settings.goalVo2Max,
      goalDate,
      age: age ? parseInt(age, 10) : null,
      sessionsPerWeek,
      includeLongEasyRun,
    })
    onClose()
  }

  return (
    <Sheet title="Training Settings" onClose={submit}>
      <div className="banner">
        <span style={{ fontSize: 20 }}>🍎</span>
        <div className="banner-text">
          <b>Get your real VO2max readings</b>
          There's no live cloud API for Apple Health, but you can export your data from the iPhone
          Health app and import it here — the most accurate source, since Strava doesn't reliably
          report a true VO2max.
        </div>
      </div>
      <button className="btn-secondary" onClick={onOpenImport} style={{ marginBottom: 16 }}>
        Import Apple Health Export
      </button>

      <div className="field-row">
        <div className="field">
          <label>Baseline VO2max</label>
          <input type="number" step="0.1" value={baseline} onChange={(e) => setBaseline(e.target.value)} />
        </div>
        <div className="field">
          <label>Goal VO2max</label>
          <input type="number" step="0.1" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Goal date</label>
        <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
      </div>

      <div className="field">
        <label>Age (optional — used for heart-rate zones)</label>
        <input type="number" placeholder="e.g. 34" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>

      <div className="field">
        <label>Interval sessions per week</label>
        <div className="segmented">
          <button className={sessionsPerWeek === 1 ? 'active' : ''} onClick={() => setSessionsPerWeek(1)}>
            1× / week
          </button>
          <button className={sessionsPerWeek === 2 ? 'active' : ''} onClick={() => setSessionsPerWeek(2)}>
            2× / week
          </button>
        </div>
      </div>

      <div className="toggle-row">
        <span className="label">Include weekly long easy run</span>
        <input
          type="checkbox"
          checked={includeLongEasyRun}
          onChange={(e) => setIncludeLongEasyRun(e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
      </div>

      <div style={{ height: 8 }} />
      <button className="btn-primary" onClick={submit}>
        Save Settings
      </button>
      <div style={{ height: 10 }} />
      <button
        className="btn-secondary"
        onClick={() => {
          if (confirm('Reset all data back to the sample plan? This clears your readings and log.')) {
            onReset()
            onClose()
          }
        }}
      >
        Reset Sample Data
      </button>
    </Sheet>
  )
}
