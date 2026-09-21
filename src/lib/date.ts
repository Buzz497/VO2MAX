export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function addWeeks(iso: string, weeks: number): string {
  return addDays(iso, weeks * 7)
}

export function daysBetween(fromISO: string, toISOD: string): number {
  const a = new Date(fromISO + 'T00:00:00')
  const b = new Date(toISOD + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function isPastOrToday(iso: string): boolean {
  return daysBetween(iso, todayISO()) >= 0
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

export function formatShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatWeekday(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

// 0 = Sunday .. 6 = Saturday, matching Date#getDay
export function nextWeekday(fromISO: string, weekday: number): string {
  const d = new Date(fromISO + 'T00:00:00')
  const diff = (weekday - d.getDay() + 7) % 7
  return addDays(fromISO, diff === 0 ? 0 : diff)
}
