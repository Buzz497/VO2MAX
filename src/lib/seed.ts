import { generateProgram } from './plan'
import { addWeeks, todayISO } from './date'
import type { AppData, UserSettings, Vo2MaxReading } from './types'

function makeSeedSettings(): UserSettings {
  return {
    baselineVo2Max: 38,
    goalVo2Max: 46,
    goalDate: addWeeks(todayISO(), 8),
    // Seed as if the 8-week program started 3 weeks ago, so there's both a
    // completed history and sessions still ahead for the demo data.
    programStartDate: addWeeks(todayISO(), -3),
  }
}

function makeSeedReadings(settings: UserSettings): Vo2MaxReading[] {
  const readings: Vo2MaxReading[] = []
  const weeks = 8
  for (let i = weeks; i >= 0; i -= 2) {
    const progress = (weeks - i) / weeks
    const value = settings.baselineVo2Max + (settings.goalVo2Max - settings.baselineVo2Max) * 0.35 * progress
    readings.push({
      id: `seed_read_${i}`,
      date: addWeeks(todayISO(), -i),
      value: Math.round(value * 10) / 10,
      source: 'manual',
    })
  }
  return readings
}

export function makeSeedData(): AppData {
  const settings = makeSeedSettings()
  const readings = makeSeedReadings(settings)
  const today = todayISO()

  let missedCounter = 0
  const sessions = generateProgram(settings.programStartDate).map((s, idx) => {
    if (s.date >= today) return s
    missedCounter += 1
    const completed = missedCounter % 6 !== 0 // occasional missed session for realism
    return {
      ...s,
      id: `seed_sess_${idx}`,
      status: completed ? ('completed' as const) : ('missed' as const),
      completedDate: completed ? s.date : undefined,
    }
  })

  return { settings, readings, sessions }
}
