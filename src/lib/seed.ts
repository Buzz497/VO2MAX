import { generatePlan } from './plan'
import { addDays, addWeeks, todayISO } from './date'
import type { AppData, TrainingSession, UserSettings, Vo2MaxReading } from './types'

function makeSeedSettings(): UserSettings {
  return {
    name: '',
    sex: 'unspecified',
    age: null,
    baselineVo2Max: 38,
    goalVo2Max: 46,
    goalDate: addWeeks(todayISO(), 12),
    sessionsPerWeek: 2,
    includeLongEasyRun: true,
    planStartDate: addWeeks(todayISO(), -8),
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

function makeSeedPastSessions(settings: UserSettings): TrainingSession[] {
  const sessions: TrainingSession[] = []
  const start = settings.planStartDate
  let d = start
  let idx = 0
  while (d < todayISO()) {
    const weekday = new Date(d + 'T00:00:00').getDay()
    if (weekday === 2 || weekday === 5) {
      idx += 1
      const completed = idx % 5 !== 0 // occasional missed session for realism
      sessions.push({
        id: `seed_sess_${idx}`,
        date: d,
        kind: 'norwegian_4x4',
        title: 'Norwegian 4×4 Intervals',
        description: '10 min warm-up, then 4 × 4 min hard with 3 min easy recovery between reps. 5–10 min cool-down.',
        durationMin: 38,
        status: completed ? 'completed' : 'missed',
        completedDate: completed ? d : undefined,
      })
    } else if (weekday === 0) {
      sessions.push({
        id: `seed_sess_long_${idx}`,
        date: d,
        kind: 'zone2_long',
        title: 'Zone 2 Long Run',
        description: 'Steady aerobic effort, conversational pace. 45–60 min.',
        durationMin: 50,
        status: 'completed',
        completedDate: d,
      })
    }
    d = addDays(d, 1)
  }
  return sessions
}

export function makeSeedData(): AppData {
  const settings = makeSeedSettings()
  const readings = makeSeedReadings(settings)
  const pastSessions = makeSeedPastSessions(settings)
  const futureSessions = generatePlan(settings, pastSessions)
  return {
    settings,
    readings,
    sessions: [...pastSessions, ...futureSessions],
  }
}
