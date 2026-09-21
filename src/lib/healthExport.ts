// Parses an Apple Health "export.xml" (from Health app -> profile -> Export All
// Health Data) to pull out VO2max records and same-day workouts. Regex-based
// rather than a full XML parser: export.xml can be hundreds of MB and is a flat
// list of self-contained <Record>/<Workout> elements, so a full DOM parse is
// unnecessary and often too slow/memory-heavy for a browser tab.

export interface RawVo2Reading {
  date: string // ISO yyyy-mm-dd
  value: number
  workoutType: string // human label, or "Rest Day"
}

export interface TrendSummary {
  currentValue: number
  changeFromWeek1: number
  percentageGain: number
}

export interface Vo2Report {
  readings: { date: string; vo2Max: number; workoutType: string }[]
  trendSummary: TrendSummary
}

const WORKOUT_LABELS: Record<string, string> = {
  HKWorkoutActivityTypeRunning: 'Running',
  HKWorkoutActivityTypeWalking: 'Walking',
  HKWorkoutActivityTypeCycling: 'Cycling',
  HKWorkoutActivityTypeRowing: 'Rowing',
  HKWorkoutActivityTypeSwimming: 'Swimming',
  HKWorkoutActivityTypeElliptical: 'Elliptical',
  HKWorkoutActivityTypeStairClimbing: 'Stair Climbing',
  HKWorkoutActivityTypeHighIntensityIntervalTraining: 'HIIT',
  HKWorkoutActivityTypeTraditionalStrengthTraining: 'Strength Training',
  HKWorkoutActivityTypeFunctionalStrengthTraining: 'Strength Training',
  HKWorkoutActivityTypeHiking: 'Hiking',
  HKWorkoutActivityTypeCoreTraining: 'Core Training',
  HKWorkoutActivityTypeCrossTraining: 'Cross Training',
  HKWorkoutActivityTypeYoga: 'Yoga',
  HKWorkoutActivityTypeOther: 'Other Workout',
}

function humanizeWorkoutType(raw: string): string {
  if (WORKOUT_LABELS[raw]) return WORKOUT_LABELS[raw]
  const stripped = raw.replace(/^HKWorkoutActivityType/, '')
  return stripped.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`))
  return m ? m[1] : null
}

function toISODate(appleDate: string): string {
  // Apple format: "2024-05-01 08:23:15 -0700" — the date prefix is already ISO.
  return appleDate.slice(0, 10)
}

/**
 * Scans export.xml text for HKQuantityTypeIdentifierVO2Max records and Workout
 * elements, and returns one VO2max reading per record with the workout that
 * happened the same calendar day attached (or "Rest Day" if none).
 */
export function parseHealthExportXml(xml: string): RawVo2Reading[] {
  const workoutsByDate = new Map<string, string>()
  const workoutTagRe = /<Workout\b[^>]*?>/g
  let m: RegExpExecArray | null
  while ((m = workoutTagRe.exec(xml))) {
    const tag = m[0]
    const activityType = attr(tag, 'workoutActivityType')
    const startDate = attr(tag, 'startDate')
    if (!activityType || !startDate) continue
    const date = toISODate(startDate)
    // A day can have multiple workouts — keep the first one we see per day.
    if (!workoutsByDate.has(date)) {
      workoutsByDate.set(date, humanizeWorkoutType(activityType))
    }
  }

  const readings: RawVo2Reading[] = []
  const recordTagRe = /<Record\b[^>]*?\/>/g
  while ((m = recordTagRe.exec(xml))) {
    const tag = m[0]
    if (!tag.includes('HKQuantityTypeIdentifierVO2Max')) continue
    const value = attr(tag, 'value')
    const startDate = attr(tag, 'startDate')
    if (!value || !startDate) continue
    const date = toISODate(startDate)
    readings.push({
      date,
      value: Math.round(parseFloat(value) * 10) / 10,
      workoutType: workoutsByDate.get(date) ?? 'Rest Day',
    })
  }

  readings.sort((a, b) => a.date.localeCompare(b.date))
  return readings
}

export function filterLastNWeeks(readings: RawVo2Reading[], weeks: number, todayISO: string): RawVo2Reading[] {
  const cutoff = new Date(todayISO + 'T00:00:00')
  cutoff.setDate(cutoff.getDate() - weeks * 7)
  const cutoffISO = cutoff.toISOString().slice(0, 10)
  return readings.filter((r) => r.date >= cutoffISO)
}

export function buildVo2Report(readings: RawVo2Reading[]): Vo2Report {
  if (readings.length === 0) {
    return { readings: [], trendSummary: { currentValue: 0, changeFromWeek1: 0, percentageGain: 0 } }
  }
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const week1Value = sorted[0].value
  const currentValue = sorted[sorted.length - 1].value
  const changeFromWeek1 = Math.round((currentValue - week1Value) * 10) / 10
  const percentageGain = week1Value !== 0 ? Math.round((changeFromWeek1 / week1Value) * 1000) / 10 : 0

  return {
    readings: sorted.map((r) => ({ date: r.date, vo2Max: r.value, workoutType: r.workoutType })),
    trendSummary: { currentValue, changeFromWeek1, percentageGain },
  }
}
