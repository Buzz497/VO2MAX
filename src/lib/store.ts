import { useCallback, useEffect, useState } from 'react'
import type { RawVo2Reading } from './healthExport'
import { generatePlan } from './plan'
import { makeSeedData } from './seed'
import type { AppData, UserSettings, Vo2MaxReading } from './types'

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
      const sessions = [...prev.sessions, ...generatePlan(settings.programStartDate, prev.sessions)].sort((a, b) =>
        a.date.localeCompare(b.date),
      )
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

  const importVo2Readings = useCallback((imported: RawVo2Reading[]) => {
    setData((prev) => {
      const importedDates = new Set(imported.map((r) => r.date))
      const kept = prev.readings.filter((r) => !importedDates.has(r.date))
      const newOnes: Vo2MaxReading[] = imported.map((r) => ({
        id: makeId('read'),
        date: r.date,
        value: r.value,
        source: 'apple_health',
      }))
      const readings = [...kept, ...newOnes].sort((a, b) => a.date.localeCompare(b.date))
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

  const resetData = useCallback(() => {
    const seeded = makeSeedData()
    setData(seeded)
  }, [])

  return {
    data,
    updateSettings,
    addReading,
    importVo2Readings,
    completeSession,
    uncompleteSession,
    resetData,
  }
}
