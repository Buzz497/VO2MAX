import type { SessionKind, TrainingSession, UserSettings } from './types'
import { addDays, addWeeks, daysBetween, nextWeekday, todayISO } from './date'

export const SESSION_INFO: Record<SessionKind, { label: string; short: string }> = {
  norwegian_4x4: { label: 'Norwegian 4×4 Intervals', short: '4×4' },
  vo2max_intervals: { label: 'VO2max Intervals', short: 'Intervals' },
  zone2_long: { label: 'Zone 2 Long Run', short: 'Long run' },
  easy_run: { label: 'Easy Recovery Run', short: 'Easy' },
}

function hrZoneText(settings: UserSettings, lowPct: number, highPct: number): string {
  if (!settings.age) return `${lowPct}–${highPct}% of max heart rate`
  const hrMax = 220 - settings.age
  return `${Math.round((hrMax * lowPct) / 100)}–${Math.round((hrMax * highPct) / 100)} bpm (${lowPct}–${highPct}% HRmax)`
}

function norwegian4x4Session(id: string, date: string, settings: UserSettings): TrainingSession {
  return {
    id,
    date,
    kind: 'norwegian_4x4',
    title: 'Norwegian 4×4 Intervals',
    description: `10 min warm-up, then 4 × 4 min hard at ${hrZoneText(settings, 85, 95)}, with 3 min easy recovery at ${hrZoneText(settings, 60, 70)} between reps. 5–10 min cool-down. ~38 min total.`,
    durationMin: 38,
    status: 'upcoming',
  }
}

function zone2Session(id: string, date: string, settings: UserSettings): TrainingSession {
  return {
    id,
    date,
    kind: 'zone2_long',
    title: 'Zone 2 Long Run',
    description: `Steady aerobic effort at ${hrZoneText(settings, 60, 75)}. Builds the aerobic base that supports VO2max gains. 45–60 min, conversational pace.`,
    durationMin: 50,
    status: 'upcoming',
  }
}

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}`
}

/**
 * Generates upcoming sessions on a fixed weekly rhythm (Tue/Fri intervals, Sun long run)
 * from today through the goal date (capped at 16 weeks out), skipping any date that
 * already has a session.
 */
export function generatePlan(settings: UserSettings, existing: TrainingSession[]): TrainingSession[] {
  const existingDates = new Set(existing.map((s) => s.date))
  const start = todayISO()
  const cappedEnd = addWeeks(start, 16)
  const end = daysBetween(start, settings.goalDate) > 0 && daysBetween(settings.goalDate, cappedEnd) > 0
    ? settings.goalDate
    : cappedEnd

  const intervalWeekdays = settings.sessionsPerWeek >= 2 ? [2, 5] : [2] // Tue, Fri
  const generated: TrainingSession[] = []

  for (const weekday of intervalWeekdays) {
    let d = nextWeekday(start, weekday)
    while (daysBetween(d, end) >= 0) {
      if (!existingDates.has(d)) {
        generated.push(norwegian4x4Session(nextId('sess'), d, settings))
        existingDates.add(d)
      }
      d = addDays(d, 7)
    }
  }

  if (settings.includeLongEasyRun) {
    let d = nextWeekday(start, 0) // Sunday
    while (daysBetween(d, end) >= 0) {
      if (!existingDates.has(d)) {
        generated.push(zone2Session(nextId('sess'), d, settings))
        existingDates.add(d)
      }
      d = addDays(d, 7)
    }
  }

  return generated.sort((a, b) => a.date.localeCompare(b.date))
}
