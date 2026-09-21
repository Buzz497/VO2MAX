export type ReadingSource = 'manual' | 'strava' | 'apple_health'

export interface Vo2MaxReading {
  id: string
  date: string // ISO date, yyyy-mm-dd
  value: number // ml/kg/min
  source: ReadingSource
}

export type SessionKind = 'norwegian_4x4' | 'vo2max_intervals' | 'zone2_long' | 'easy_run'

export type SessionStatus = 'upcoming' | 'completed' | 'missed'

export interface TrainingSession {
  id: string
  date: string // ISO date, yyyy-mm-dd — scheduled date
  kind: SessionKind
  title: string
  description: string
  durationMin: number
  status: SessionStatus
  completedDate?: string
  completedNote?: string
}

export interface UserSettings {
  name: string
  sex: 'male' | 'female' | 'unspecified'
  age: number | null
  baselineVo2Max: number
  goalVo2Max: number
  goalDate: string // ISO date
  sessionsPerWeek: number // interval sessions per week (1 or 2)
  includeLongEasyRun: boolean
  planStartDate: string // ISO date
}

export interface AppData {
  settings: UserSettings
  readings: Vo2MaxReading[]
  sessions: TrainingSession[]
}
