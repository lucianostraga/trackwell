# Trackwell

Trackwell (a fictional SaaS) shows where every piece of hospital equipment is, in real time: a live floor plan, the
equipment list, alerts and asset details. This instance is "St. Aurelia Medical Center, Level 2 · Critical Care".
Vite + React + TypeScript (strict) + Tailwind CSS v4, deterministic mock data, no backend. Production:
https://lucianostraga.github.io/trackwell/ (GitHub Pages, deployed by `.github/workflows/deploy.yml` on every push to
main). Every pull request gets a preview at `https://lucianostraga.github.io/trackwell/preview/pr-<n>/` with its
end-to-end evidence.

## Commands
- `npm ci` · `npm run typecheck` · `npm test` (Vitest) · `npm run build` · `npm run evidence` (Playwright end-to-end:
  screenshots and videos in `evidence/`) · `npm run dev`.

## Conventions
- Business rules are pure, typed functions in `src/lib/<module>.ts`; components only render. Anything that depends
  on time takes `now` as a parameter.
- Unit tests: `tests/unit/<module>.test.ts`, one file per lib module (see the `ts-unit-tests` skill).
- End-to-end: `e2e/<ticket>.spec.ts` (e.g. `e2e/tw-5.spec.ts`), Chromium headless; each spec asserts behaviour and
  leaves a screenshot per acceptance criterion and a video in `evidence/`.
- UI: reuse the existing components, spacing, typography, pills and the color tokens in `src/index.css` (brand teal
  `--color-brand-*`, ink `--color-ink-*`). It is shown on big screens: finished, aligned, no overflow.
- `src/data/releases.json`: every feature adds `{ "key", "title", "pr", "date" }` at the top.
- Never edit `.github/workflows/` to make a check pass; the pipelines are owned by the team.

## How work gets done here: the agentic delivery loop
Jira project TW (https://lucianostraga.atlassian.net/browse/TW). Only stories in **Ready** are delivered;
**Refinement** is never picked up. The `run-backlog` skill is the playbook: 8 steps, 4 gates (sandbox build,
adversarial review, end-to-end evidence, human approval), one pull request per ticket titled `<KEY>: <summary>`,
branch `feature/<KEY>-<slug>`, each ticket in its own worktree under `/workspace/worktrees/<KEY>`.

Agents: `backlog-triage` (Haiku), `logic-builder` and `ui-builder` (Sonnet), `local-worker` (Qwen3.8 on this
MacBook, unit tests, one task at a time), `adversarial-reviewer` (Opus), `release-scribe` and `ci-doctor` (Haiku).
Side effects on Jira, Slack and the dashboard go through `node tools/loop.mjs` (run it without arguments for help);
GitHub through `gh`.

## Writing for people
Slack messages, Jira comments, step notes and the summary at the top of each pull request are read by product
owners, managers and other non-developers. Write them so anyone understands what happened:
- Say what changed for the user and how we know it works, not how the code does it. No file paths, function
  names, test counts by file, or jargon ("e2e", "lint", "refactor", "regression") outside the pull request's
  technical section.
- Short sentences, everyday words, one idea per line, at most two lines per Slack update.
- Use the team's own words and numbers ("ventilators that have been out of the ICU for more than 10 minutes"), not
  internal identifiers.
- Good: "Nurses can now find the nearest free wheelchair. Tested in a real browser; video attached."
  Bad: "Implemented findNearest() in src/lib/nearest.ts with 14 Vitest cases; e2e green."
