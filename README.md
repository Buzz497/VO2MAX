# VO2 Max

A tracker for VO2max training: see your current fitness, watch it trend toward a goal, and
follow a fixed 8-week periodized plan with a clear next session and checkmarks for completed
workouts.

## Features

- **Aerobic Capacity card** — current VO2max with a progress bar toward your goal.
- **Trend chart** — VO2max over time with 1M/3M/6M/1Y/ALL range tabs, a goal line, and a hover
  tooltip.
- **Next Session card** — the next scheduled training session front and center, with a
  one-tap "Mark Complete".
- **Training Log** — upcoming and recent sessions with ticks: a green check for completed, an
  amber square for missed, and an empty square for upcoming.
- **Training plan** — a fixed 8-week program (`src/lib/plan.ts`), four two-week phases run
  Monday/Tuesday/Thursday/Saturday:
  - **Monday — VO2 Max Intervals**: pace and rep count progress each phase, from 4×4 min up to
    5×5 min, 5:00–5:30/km down to 4:50–5:15/km.
  - **Tuesday — Easy Recovery Run**: 20–25 min, 6:30–7:00/km, conversational throughout.
  - **Thursday — Tempo Run**: comfortably-hard continuous intervals, progressing from 2×8 min
    at 5:45/km to 2×9 min at 5:35/km.
  - **Saturday — Long Outdoor Run**: 45–65 min steady effort, GPS tracked.

  The program's start date (which Monday is week 1) and your baseline/goal VO2max are editable
  in Settings.
- Data is stored locally in the browser (`localStorage`); log readings manually via the **+**
  button until a live data source is connected.

## Data sources

There is no public API for Apple's Health app — HealthKit data only lives on-device or in a
manual export, so nothing (including this app, or any cloud service) can pull it live. Three
ways to get real data in, most accurate first:

- **Import from Health (recommended)** — on your iPhone: Health app → profile picture →
  **Export All Health Data**. Import the resulting `export.zip` (or an unzipped `export.xml`)
  via the "Import from Health" button in the app, or Settings. Parsing happens entirely in your
  browser — the file is never uploaded anywhere. This reads your real VO2max records and links
  each one to same-day workouts.
- **CLI script** — for a one-off JSON dump without opening the app, run the export through
  `scripts/parse-health-export.mjs` (see below). Useful for feeding the data into something
  else, or just inspecting it.
- **Manual entry** — log individual readings by hand via the **+** button.
- **Strava** is wired up in Settings too, but Strava doesn't reliably report a true VO2max, so
  a Health export is the better source for this metric specifically.

### CLI: `scripts/parse-health-export.mjs`

Produces the same JSON shape the app imports — one entry per reading with date, VO2max value,
and same-day workout type (or `"rest day"`), plus an 8-week trend summary — without needing the
browser:

```bash
node scripts/parse-health-export.mjs ~/Downloads/export.zip
# or, already unzipped, with a custom window and output file:
node scripts/parse-health-export.mjs ~/Downloads/export.xml --weeks 8 --out vo2max.json
```

Output shape:

```json
{
  "readings": [
    { "date": "2026-07-27", "vo2Max": 38.4, "workoutType": "rest day" },
    { "date": "2026-07-29", "vo2Max": 38.9, "workoutType": "Running" }
  ],
  "trendSummary": { "currentValue": 40.8, "changeFromWeek1": 2.4, "percentageGain": 6.3 }
}
```

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
```
