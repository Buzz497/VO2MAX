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
manual export, so nothing (including this app) can pull it live from the cloud. Two ways to
get real data in:

- **Strava** — connect Strava in your Claude connector settings; once connected, activities
  and any VO2max estimates your watch syncs to Strava can be pulled in.
- **Manual** — export from the iPhone Health app (Health → profile → Export All Health Data)
  and log readings/sessions by hand for now.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
```
