import { useCallback, useEffect, useState } from 'react'
import { generatePlan } from './plan'
import { makeSeedData } from './seed'
import type { AppData, SessionKind, TrainingSession, UserSettings, Vo2MaxReading } from './types'

const STORAGE_KEY = 'vo2max_app_data_v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // fall through to seed
  }
  const seeded = makeSeedData()
  save(seeded)
  return seeded
}

function save(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage unavailable (private mode, quota) — app still works for the session
  }
}

let idCounter = 0
function makeId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => load())

  useEffect(() => {
    save(data)
  }, [data])

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setData((prev) => {
      const settings = { ...prev.settings, ...partial }
      const sessions = [...prev.sessions, ...generatePlan(settings, prev.sessions)]
      return { ...prev, settings, sessions }
    })
  }, [])

  const addReading = useCallback((value: number, date: string) => {
    setData((prev) => {
      const reading: Vo2MaxReading = { id: makeId('read'), date, value, source: 'manual' }
      const readings = [...prev.readings, reading].sort((a, b) => a.date.localeCompare(b.date))
      return { ...prev, readings }
    })
  }, [])

  const completeSession = useCallback((sessionId: string, completedDate: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'completed', completedDate } : s,
      ),
    }))
  }, [])

  const uncompleteSession = useCallback((sessionId: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'upcoming', completedDate: undefined } : s,
      ),
    }))
  }, [])

  const addExtraSession = useCallback((kind: SessionKind, date: string, title: string, description: string, durationMin: number) => {
    setData((prev) => {
      const session: TrainingSession = {
        id: makeId('sess'),
        date,
        kind,
        title,
        description,
        durationMin,
        status: 'upcoming',
      }
      return { ...prev, sessions: [...prev.sessions, session].sort((a, b) => a.date.localeCompare(b.date)) }
    })
  }, [])

  const ensurePlanFilled = useCallback(() => {
    setData((prev) => {
      const more = generatePlan(prev.settings, prev.sessions)
      if (more.length === 0) return prev
      return { ...prev, sessions: [...prev.sessions, ...more] }
    })
  }, [])

  const resetData = useCallback(() => {
    const seeded = makeSeedData()
    setData(seeded)
  }, [])

  return {
    data,
    updateSettings,
    addReading,
    completeSession,
    uncompleteSession,
    addExtraSession,
    ensurePlanFilled,
    resetData,
  }
}
