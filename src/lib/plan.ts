import type { SessionKind, TrainingSession } from './types'
import { addDays, daysBetween, nextWeekday } from './date'

export const SESSION_INFO: Record<SessionKind, { label: string; short: string }> = {
  vo2max_intervals: { label: 'VO2 Max Intervals', short: 'Intervals' },
  tempo_run: { label: 'Tempo Run', short: 'Tempo' },
  easy_run: { label: 'Easy Recovery Run', short: 'Easy' },
  long_run: { label: 'Long Outdoor Run', short: 'Long run' },
}

interface SessionTemplate {
  /** Days after that week's Monday: Mon=0, Tue=1, ... Sun=6 */
  dayOffset: number
  kind: SessionKind
  duration: string
  pace: string
  setsReps: string
  notes: string
}

interface PhaseTemplate {
  /** Program week numbers this phase covers, 1-indexed (e.g. [1, 2]) */
  weeks: [number, number]
  sessions: SessionTemplate[]
}

// The user's 8-week periodized plan: 4 two-week phases, each with the same
// weekly rhythm (Mon/Tue/Thu/Sat) but progressing duration, pace and volume.
const PROGRAM: PhaseTemplate[] = [
  {
    weeks: [1, 2],
    sessions: [
      { dayOffset: 0, kind: 'vo2max_intervals', duration: '25–30 min', pace: '5:00–5:30/km', setsReps: '4×4 min + 2 min recovery', notes: 'Hard effort, 8.5/10' },
      { dayOffset: 1, kind: 'easy_run', duration: '20–25 min', pace: '6:30–7:00/km', setsReps: 'Continuous', notes: 'Conversational pace' },
      { dayOffset: 3, kind: 'tempo_run', duration: '28–30 min', pace: '5:45/km', setsReps: '2×8 min + 2 min recovery', notes: 'Comfortably hard, 7.5/10' },
      { dayOffset: 5, kind: 'long_run', duration: '45–60 min', pace: '6:30/km', setsReps: 'Continuous', notes: 'GPS required, steady effort' },
    ],
  },
  {
    weeks: [3, 4],
    sessions: [
      { dayOffset: 0, kind: 'vo2max_intervals', duration: '28–32 min', pace: '5:00–5:30/km', setsReps: '5×4 min + 2 min recovery', notes: '+1 rep from weeks 1-2' },
      { dayOffset: 1, kind: 'easy_run', duration: '20–25 min', pace: '6:30–7:00/km', setsReps: 'Continuous', notes: 'Keep easy' },
      { dayOffset: 3, kind: 'tempo_run', duration: '28–30 min', pace: '5:45/km', setsReps: '2×8 min + 2 min recovery', notes: 'Same pace, focus on form' },
      { dayOffset: 5, kind: 'long_run', duration: '50–65 min', pace: '6:30/km', setsReps: 'Continuous', notes: 'Steady, GPS data' },
    ],
  },
  {
    weeks: [5, 6],
    sessions: [
      { dayOffset: 0, kind: 'vo2max_intervals', duration: '25–30 min', pace: '4:50–5:15/km', setsReps: '4×5 min + 2 min recovery', notes: 'Faster pace, longer duration' },
      { dayOffset: 1, kind: 'easy_run', duration: '20–25 min', pace: '6:30–7:00/km', setsReps: 'Continuous', notes: 'Stay comfortable' },
      { dayOffset: 3, kind: 'tempo_run', duration: '30–32 min', pace: '5:35/km', setsReps: '2×9 min + 2 min recovery', notes: 'Slightly longer, faster' },
      { dayOffset: 5, kind: 'long_run', duration: '50–65 min', pace: '6:30/km', setsReps: 'Continuous', notes: 'Outdoor, steady' },
    ],
  },
  {
    weeks: [7, 8],
    sessions: [
      { dayOffset: 0, kind: 'vo2max_intervals', duration: '30–35 min', pace: '4:50–5:15/km', setsReps: '5×5 min + 2 min recovery', notes: 'Peak intensity, +1 rep' },
      { dayOffset: 1, kind: 'easy_run', duration: '20–25 min', pace: '6:30–7:00/km', setsReps: 'Continuous', notes: 'Active recovery' },
      { dayOffset: 3, kind: 'tempo_run', duration: '30–32 min', pace: '5:35/km', setsReps: '2×9 min + 2 min recovery', notes: 'Maintain intensity' },
      { dayOffset: 5, kind: 'long_run', duration: '45–60 min', pace: '6:30/km', setsReps: 'Continuous', notes: 'Consolidate gains' },
    ],
  },
]

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}`
}

function describeSession(t: SessionTemplate): string {
  return `${t.pace} · ${t.setsReps}. ${t.notes}.`
}

/**
 * Builds every session of the fixed 8-week program, anchored so program week 1
 * starts on the Monday on/after `startDate`.
 */
export function generateProgram(startDate: string): TrainingSession[] {
  const week1Monday = nextWeekday(startDate, 1) // 1 = Monday
  const sessions: TrainingSession[] = []

  for (const phase of PROGRAM) {
    for (const week of [phase.weeks[0], phase.weeks[1]]) {
      const weekMonday = addDays(week1Monday, (week - 1) * 7)
      for (const t of phase.sessions) {
        const date = addDays(weekMonday, t.dayOffset)
        sessions.push({
          id: nextId('sess'),
          date,
          kind: t.kind,
          title: SESSION_INFO[t.kind].label,
          description: describeSession(t),
          duration: t.duration,
          status: 'upcoming',
        })
      }
    }
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Fills in any program sessions not already present (by date), so calling this
 * after a settings change never duplicates existing entries.
 */
export function generatePlan(programStartDate: string, existing: TrainingSession[]): TrainingSession[] {
  const existingDates = new Set(existing.map((s) => s.date))
  return generateProgram(programStartDate).filter((s) => {
    if (existingDates.has(s.date)) return false
    existingDates.add(s.date)
    return true
  })
}

export function programEndDate(programStartDate: string): string {
  const week1Monday = nextWeekday(programStartDate, 1)
  return addDays(week1Monday, 8 * 7 - 1)
}

export function daysUntilProgramEnd(programStartDate: string, todayISO: string): number {
  return daysBetween(todayISO, programEndDate(programStartDate))
}
