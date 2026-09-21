#!/usr/bin/env node
// Turns an Apple Health export (export.zip or an already-unzipped export.xml)
// into the VO2max JSON described in the app's README: one entry per reading
// with date, value and same-day workout type, plus an 8-week trend summary.
//
// Runs entirely on your machine — your health data never leaves it.
//
// Usage:
//   node scripts/parse-health-export.mjs /path/to/export.zip
//   node scripts/parse-health-export.mjs /path/to/export.xml --weeks 8 --out vo2max.json

import { readFileSync, writeFileSync } from 'node:fs'
import { unzipSync } from 'fflate'

const WORKOUT_LABELS = {
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

function humanizeWorkoutType(raw) {
  if (WORKOUT_LABELS[raw]) return WORKOUT_LABELS[raw]
  return raw.replace(/^HKWorkoutActivityType/, '').replace(/([a-z])([A-Z])/g, '$1 $2')
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`))
  return m ? m[1] : null
}

function toISODate(appleDate) {
  return appleDate.slice(0, 10)
}

function parseHealthExportXml(xml) {
  const workoutsByDate = new Map()
  const workoutTagRe = /<Workout\b[^>]*?>/g
  let m
  while ((m = workoutTagRe.exec(xml))) {
    const tag = m[0]
    const activityType = attr(tag, 'workoutActivityType')
    const startDate = attr(tag, 'startDate')
    if (!activityType || !startDate) continue
    const date = toISODate(startDate)
    if (!workoutsByDate.has(date)) workoutsByDate.set(date, humanizeWorkoutType(activityType))
  }

  const readings = []
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
      workoutType: workoutsByDate.get(date) ?? 'rest day',
    })
  }

  readings.sort((a, b) => a.date.localeCompare(b.date))
  return readings
}

function filterLastNWeeks(readings, weeks) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeks * 7)
  const cutoffISO = cutoff.toISOString().slice(0, 10)
  const inRange = readings.filter((r) => r.date >= cutoffISO)
  return inRange.length > 0 ? inRange : readings
}

function buildReport(readings) {
  if (readings.length === 0) {
    return { readings: [], trendSummary: { currentValue: null, changeFromWeek1: null, percentageGain: null } }
  }
  const week1Value = readings[0].value
  const currentValue = readings[readings.length - 1].value
  const changeFromWeek1 = Math.round((currentValue - week1Value) * 10) / 10
  const percentageGain = week1Value !== 0 ? Math.round((changeFromWeek1 / week1Value) * 1000) / 10 : 0

  return {
    readings: readings.map((r) => ({ date: r.date, vo2Max: r.value, workoutType: r.workoutType })),
    trendSummary: { currentValue, changeFromWeek1, percentageGain },
  }
}

function loadXmlText(path) {
  if (path.toLowerCase().endsWith('.zip')) {
    const buf = readFileSync(path)
    const files = unzipSync(buf, { filter: (entry) => entry.name.toLowerCase().endsWith('export.xml') })
    const key = Object.keys(files)[0]
    if (!key) throw new Error('Could not find export.xml inside that zip.')
    return Buffer.from(files[key]).toString('utf-8')
  }
  return readFileSync(path, 'utf-8')
}

function main() {
  const args = process.argv.slice(2)
  const inputPath = args[0]
  if (!inputPath) {
    console.error('Usage: node scripts/parse-health-export.mjs <export.zip|export.xml> [--weeks N] [--out file.json]')
    process.exit(1)
  }
  const weeksIdx = args.indexOf('--weeks')
  const weeks = weeksIdx !== -1 ? parseInt(args[weeksIdx + 1], 10) : 8
  const outIdx = args.indexOf('--out')
  const outPath = outIdx !== -1 ? args[outIdx + 1] : null

  const xml = loadXmlText(inputPath)
  const all = parseHealthExportXml(xml)
  if (all.length === 0) {
    console.error('No VO2 Max records found in that export.')
    process.exit(1)
  }
  const windowed = filterLastNWeeks(all, weeks)
  const report = buildReport(windowed)
  const json = JSON.stringify(report, null, 2)

  if (outPath) {
    writeFileSync(outPath, json)
    console.error(`Wrote ${windowed.length} readings to ${outPath}`)
  } else {
    console.log(json)
  }
}

main()
