import { useMemo, useState } from 'react'
import './App.css'
import { AddReadingSheet } from './components/AddReadingSheet'
import { HeroCard } from './components/HeroCard'
import { GearIcon, PlusIcon } from './components/Icons'
import { NextSessionCard } from './components/NextSessionCard'
import { SessionHistory } from './components/SessionHistory'
import { SettingsSheet } from './components/SettingsSheet'
import type { ChartRange } from './components/Vo2MaxChart'
import { Vo2MaxChart } from './components/Vo2MaxChart'
import { todayISO } from './lib/date'
import { useAppData } from './lib/store'
import type { TrainingSession } from './lib/types'

const RANGES: ChartRange[] = ['1M', '3M', '6M', '1Y', 'ALL']

function App() {
  const { data, updateSettings, addReading, completeSession, uncompleteSession, resetData } = useAppData()
  const [range, setRange] = useState<ChartRange>('3M')
  const [showAddReading, setShowAddReading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const nextSession = useMemo(() => {
    const today = todayISO()
    return (
      data.sessions
        .filter((s) => s.status === 'upcoming' && s.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
    )
  }, [data.sessions])

  function handleToggleSession(session: TrainingSession) {
    if (session.status === 'completed') {
      uncompleteSession(session.id)
    } else {
      completeSession(session.id, todayISO())
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="titles">
          <span className="eyebrow">Cardio Fitness</span>
          <h1>VO2 Max</h1>
        </div>
        <button className="icon-button" onClick={() => setShowSettings(true)} aria-label="Settings">
          <GearIcon />
        </button>
      </header>

      <HeroCard readings={data.readings} settings={data.settings} />

      <NextSessionCard
        session={nextSession}
        onComplete={(id) => completeSession(id, todayISO())}
        onOpenPlan={() => document.getElementById('training-log')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div className="card">
        <div className="card-title-row">
          <span className="card-title">Trend</span>
        </div>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
        <Vo2MaxChart readings={data.readings} goal={data.settings.goalVo2Max} range={range} />
      </div>

      <div id="training-log">
        <SessionHistory sessions={data.sessions} onToggle={handleToggleSession} />
      </div>

      <button className="fab" onClick={() => setShowAddReading(true)} aria-label="Log VO2max reading">
        <PlusIcon />
      </button>

      {showAddReading && (
        <AddReadingSheet onClose={() => setShowAddReading(false)} onAdd={addReading} />
      )}

      {showSettings && (
        <SettingsSheet
          settings={data.settings}
          onClose={() => setShowSettings(false)}
          onSave={updateSettings}
          onReset={resetData}
        />
      )}
    </div>
  )
}

export default App
