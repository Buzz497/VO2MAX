# VO2 Max

An Apple Health-styled tracker for VO2max training: see your current fitness, watch it trend
toward a goal, and follow a structured interval plan with a clear next session and checkmarks
for completed workouts.

## Features

- **Cardio Fitness card** — current VO2max with a progress ring toward your goal, matching
  Apple Health's VO2max metric styling.
- **Trend chart** — VO2max over time with 1M/3M/6M/1Y/ALL range tabs, a goal line, and a hover
  tooltip.
- **Next Session card** — the next scheduled training session front and center, with a
  one-tap "Mark Complete".
- **Training Log** — upcoming and recent sessions with ticks: a green check for completed, an
  amber ring for missed, and an empty ring for upcoming.
- **Training plan** — generates a Norwegian 4×4 VO2max interval plan (2×/week, 4×4 min hard /
  3 min easy) plus an optional weekly Zone 2 long run, editable in Settings.
- Data is stored locally in the browser (`localStorage`); log readings and sessions manually
  via the **+** button until a live data source is connected.

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
