# Trackwell

Real-time equipment tracking for hospitals: **where is every piece of equipment right now?**
Trackwell is a fictional product built for a demo. The customer instance is the (equally
fictional) St. Aurelia Medical Center, Level 2 · Critical Care: a live floor plan with 60
tagged assets (infusion pumps, wheelchairs, patient monitors, ventilators, hospital beds,
defibrillators and portable ultrasounds), KPIs, a searchable equipment list, alerts, an
asset drawer with location history and a "Recently shipped" timeline.
Single page, no backend: the data is generated in the browser.

**Stack:** Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · lucide-react ·
Vitest · Playwright (Chromium).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck (`tsc -b`) and production build to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests (Vitest, `tests/unit/`) |
| `npm run test:e2e` | End-to-end tests (Playwright, `e2e/`) against a fresh build |
| `npm run evidence` | Runs the e2e suite and prints the screenshots and videos it saved in `evidence/` |
| `npm run preview` | Serves `dist/` locally |

First time only: `npx playwright install chromium` (add `--with-deps` on Linux).

## How the code is organized

```
src/
  types.ts            domain model (Asset, Zone, LocationEntry, ...)
  data/               floor plan and zones, asset blueprints, KPI history, releases.json
  lib/                pure logic, one unit test file each in tests/unit/
  components/         rendering only (components/floor/ is the floor plan)
e2e/                  Playwright specs; e2e/support/ has the video helpers
.github/workflows/    CI, production deploy, preview cleanup
```

- Logic lives in `src/lib/` as pure functions: `kpis`, `filters`, `geometry` (distance,
  point-in-polygon, zoom), `zones` (point-in-zone, counts), `tags` (offline after 30 minutes
  without a report), `alerts`, `location` (time spent in each zone), `labels`, `format`.
  Anything time-dependent takes `now: Date`.
- `src/data/floor.ts` defines the floor in meters (120 x 64; the SVG viewBox) and the ten
  zones as polygons. `src/data/asset-blueprints.ts` lists the 60 assets with times as
  "minutes before page load"; `buildAssets(now)` turns them into ISO timestamps, so the
  dashboard looks live and every load is identical apart from the clock.
- Colors are CSS variables in `src/index.css` (`@theme static`), including one per
  equipment type and one per zone.
- `src/data/releases.json` feeds "Recently shipped": a plain JSON array, newest first, of
  `{ "key": "TW-5", "title": "...", "pr": null, "date": "2026-10-29" }` (`pr` is the pull
  request number, or null when it is not known yet). Every feature PR adds its entry at the
  top. Keys link to `https://lucianostraga.atlassian.net/browse/<key>`.

## Data

Asset fields: `id` (`IP-104`, `WC-02`, `VT-03`, ...), `name`, `type`, `model`, `status`
(`in-use|available|maintenance`), `zone`, `position {x, y}` (meters, inside `zone`),
`homeZone` (the department that owns it), `zoneEnteredAt`, `lastSeenAt`, `batteryPct` (tag
battery), `lastUseEndedAt` (or null), `lastCleanedAt` (or null), `usageMinutes24h`, and
`history[] { zone, enteredAt }` (newest first; the first entry is the current zone).

Zones: `emergency`, `radiology`, `operating-rooms`, `sterile-processing`, `nurses-station`
(the corridor and the central nurses' station), `icu`, `ward-a`, `ward-b`, `pharmacy`,
`central-supply`.

The dataset is deterministic and pinned by `tests/unit/dataset.test.ts`. It describes data,
not product rules: business rules live in Jira tickets and the team's decisions, and in
`src/lib/` once implemented.

## Tests and evidence

- **Unit:** one file per `src/lib` module in `tests/unit/`, with a fixed `now` and small
  inline fixtures (`tests/unit/fixtures.ts`), plus `dataset.test.ts` for the demo data.
- **End-to-end:** `playwright.config.ts` builds the app, serves it with `vite preview` on
  port 4317 at base `/`, and runs Chromium headless at 1600x900 (no Google Chrome channel,
  so it also runs on Linux ARM64). Every test records a video.
- **Evidence:** specs save screenshots with `saveEvidence(page, 'name')` to
  `evidence/<name>.png`; the reporter in `e2e/support/evidence-reporter.ts` copies each
  test's video to `evidence/<spec-name>.webm`. The helpers in `e2e/support/presenter.ts`
  (step captions, a visible cursor, smooth scrolling, paced typing) keep the video readable
  on a big screen; `E2E_PACE=0` runs the same assertions without pauses.

## CI/CD and previews

GitHub Pages serves the `gh-pages` branch: production at
`https://<owner>.github.io/<repository>/`, each pull request at
`.../<repository>/preview/pr-<n>/` (the workflows derive both from the repository name).

| Workflow | Trigger | Jobs |
| --- | --- | --- |
| `ci.yml` | pull request to `main` | **Gate 1 · Build & unit tests** (typecheck, Vitest, preview build) · **Gate 3 · End-to-end (Playwright)** (uploads `evidence`, also on failure) · **Deploy preview (sandbox)** (after both gates) |
| `deploy.yml` | push to `main`, manual | Build & unit tests, then **Deploy to production** (`environment: production`) |
| `preview-cleanup.yml` | pull request closed | Removes `preview/pr-<n>/` and marks the PR comment |

The preview deploy publishes the build plus `evidence/` to `preview/pr-<n>/` and keeps a
single sticky comment on the PR (marker `trackwell-preview`) with the preview link, the
screenshots embedded and the videos linked. Builds get `VITE_ENV`, `VITE_BUILD_SHA`,
`VITE_BUILD_TIME` and `VITE_PREVIEW_LABEL` (shown in the top bar badge and the footer) and
`BASE_PATH`; locally they default to `local` and `/`. Each build also writes `version.json`.

Every job that writes `gh-pages` shares the `gh-pages` concurrency group, so pushes never
race. One-time repository setup: Settings → Pages → Deploy from a branch → `gh-pages` / root
(the branch appears after the first deploy).
