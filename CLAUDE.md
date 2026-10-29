# Trackwell website

The public website of Trackwell (a fictional company that tracks hospital equipment in real time): one page with the
hero and product screenshot, how it works, features, customers, What's new and contact. Vite + React + TypeScript
(strict) + Tailwind CSS v4, no backend. Production: https://lucianostraga.github.io/trackwell/ (GitHub Pages, deployed
by `.github/workflows/deploy.yml` on every push to main). Every pull request gets a preview at
`https://lucianostraga.github.io/trackwell/preview/pr-<n>/` with its end-to-end evidence.

## Commands
- `npm ci` · `npm run typecheck` · `npm test` (Vitest) · `npm run build` · `npm run evidence` (Playwright end-to-end:
  screenshots and videos in `evidence/`) · `npm run dev`.

## Conventions
- Texts and lists live in typed files in `src/content/`; business rules (prices, validation, calculations) are pure,
  typed functions in `src/lib/<module>.ts`; components only render. New sections go in `src/App.tsx`, and sections
  that need a navbar link are registered in `src/content/sections.ts`.
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
Slack, Jira, step notes and the top of each pull request are read by non-developers: plain language, what changed for
the visitor and how we know it works. The `writing-for-people` skill has the rules and examples.

## Guardrails (hooks)
`.claude/hooks/guard.mjs` runs before every command and file edit of every agent and blocks, whatever the model
decides: merging a pull request before a person approved the deploy in Slack, pushing to main or force-pushing,
editing the pipelines, secrets or the guardrails themselves, printing credentials, changing repository settings and
broad deletes. `.claude/hooks/session-start.mjs` briefs every session with the backlog. The team's standards are
skills preloaded into the agents: `web-ui-standards`, `review-checklist`, `writing-for-people`, `ts-unit-tests`.
