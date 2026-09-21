export type ReadingSource = 'manual' | 'strava' | 'apple_health'

export interface Vo2MaxReading {
  id: string
  date: string // ISO date, yyyy-mm-dd
  value: number // ml/kg/min
  source: ReadingSource
}

export type SessionKind = 'vo2max_intervals' | 'tempo_run' | 'easy_run' | 'long_run'

export type SessionStatus = 'upcoming' | 'completed' | 'missed'

export interface TrainingSession {
  id: string
  date: string // ISO date, yyyy-mm-dd — scheduled date
  kind: SessionKind
  title: string
  description: string
  duration: string // display label, e.g. "25–30 min"
  status: SessionStatus
  completedDate?: string
  completedNote?: string
}

export interface UserSettings {
  baselineVo2Max: number
  goalVo2Max: number
  goalDate: string // ISO date
  programStartDate: string // ISO date — Monday the 8-week program begins
}

export interface AppData {
  settings: UserSettings
  readings: Vo2MaxReading[]
  sessions: TrainingSession[]
}
