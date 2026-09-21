import { useState } from 'react'
import { todayISO } from '../lib/date'
import { Sheet } from './Sheet'

interface Props {
  onClose: () => void
  onAdd: (value: number, date: string) => void
}

export function AddReadingSheet({ onClose, onAdd }: Props) {
  const [value, setValue] = useState('')
  const [date, setDate] = useState(todayISO())

  function submit() {
    const v = parseFloat(value)
    if (!Number.isFinite(v) || v <= 0) return
    onAdd(v, date)
    onClose()
  }

  return (
    <Sheet title="Log VO2 Max" onClose={onClose}>
      <div className="field">
        <label>VO2 Max (mL/kg/min)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="e.g. 42.5"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>Date</label>
        <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={submit} disabled={!value}>
        Save Reading
      </button>
    </Sheet>
  )
}
