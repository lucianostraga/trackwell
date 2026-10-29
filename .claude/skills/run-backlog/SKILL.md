---
name: run-backlog
description: The agentic delivery loop. Consumes the Jira backlog end to end - intake, Slack context, parallel build with Claude and local subagents, sandbox, adversarial review, end-to-end evidence, human approval and promotion through GitHub Actions - until no Ready tickets are left. Use it when asked to run, work or burn down the backlog, or to deliver a ticket.
---

# The agentic delivery loop

You are the lead. You plan, delegate, integrate and decide; subagents do the work in parallel. Eight steps and four
gates per ticket. A failure at any gate sends the ticket back to build with the reason. Never skip a gate, never
merge without Gate 4, never modify the pipelines to make a gate pass.

Tools: `node tools/loop.mjs` (Jira, Slack, approvals, Mission Control: run it without arguments for help), `gh`
(GitHub), `git`, `npm`. Report every step with `loop step`, so Jira, Slack and Mission Control stay in sync:
`node tools/loop.mjs step <KEY> <step> <started|passed|failed|waiting|skipped> [--gate N] [--note "..."] [--link name=url]`.

## Throughput rules
- Up to TWO tickets in flight, each in its own worktree: when the current ticket is waiting (CI, review, human),
  start the next one. Highest rank first, but the second ticket in flight must change different screens or
  components than the first (compare the specs); if every Ready ticket overlaps, wait and run them one after the other.
- Claude subagents run in parallel. The local model (`local-worker`) is a single queue: one task at a time,
  never two at once; give it the next ticket's tests as soon as it is free.
- Launch subagents in the background and react to their completion notifications; watch CI in the background too.
- Keep the user-facing text short: one line per event. Every `--note` and `--summary` goes to Slack, Jira and the
  dashboard: plain language for non-developers ("Wheelchairs and pumps now show the nearest free one"), never file
  names or test jargon. See "Writing for people" in CLAUDE.md.

## Start
1. `git -C /workspace/trackwell fetch origin && git -C /workspace/trackwell checkout main && git -C /workspace/trackwell pull --ff-only`
2. `node tools/loop.mjs run start`, then `node tools/loop.mjs tickets`.

## Per ticket
**01 Intake** — `loop step <KEY> intake started`, then ask `backlog-triage` (Haiku) for the brief. Jira does not
move yet. Not ready:
- in Refinement: `loop skip <KEY> "in Refinement"` (once per run) and take the next one;
- Ready, but a decision it depends on cannot be found: `loop skip <KEY> "<what is missing>" --comment` (asks for it
  on the ticket) and take the next one. Never guess a business rule, and never take one from the code, the README
  or the data.
Ready: `loop step <KEY> intake passed` (moves Jira to In Progress).

**02 Context** — the triage brief includes the Slack decisions. `loop step <KEY> context passed --note "<the
decisions in a few words>"` (or `skipped` if the ticket needs none).

**03 Build** — create the worktree:
```
git -C /workspace/trackwell worktree add /workspace/worktrees/<KEY> -b feature/<KEY>-<short-slug> origin/main
cd /workspace/worktrees/<KEY> && npm ci --prefer-offline --no-audit --no-fund
```
Each worktree records its evidence on its own port: tell every agent working there to `export E2E_PORT=<4300 + the
ticket number>` (e.g. 4305 for TW-5) before any `npm run evidence`.
Write a short spec (module file, exact exported signatures and types, the rules with numbers, the UI changes, the e2e
flow). Then `loop step <KEY> build started` and launch IN PARALLEL, each with the worktree path and the spec:
- `logic-builder` (Sonnet): the pure functions in `src/lib/`.
- `ui-builder` (Sonnet): the components, `src/data/releases.json` and `e2e/<key>.spec.ts` with evidence.
- `local-worker` (Qwen3.8 on this Mac): `tests/unit/<module>.test.ts` from the spec (if the local queue is busy,
  queue it; never two local tasks at once).
Tell each lane two things: the type check stays red until the other lanes land (they only check their own files),
and who updates the existing tests the change breaks (logic-builder: unit tests of the modules it changes;
ui-builder: existing e2e specs it affects; local-worker only writes the new test file).
When all three report, integrate: read every diff yourself, fix seams, run `npm run typecheck && npm test`.
`loop step <KEY> build passed --note "<files, tests count>"`.

**04 Sandbox · Gate 1** — `npm run build && npm test` in the worktree, then commit
(`<KEY>: <summary>` + a body listing which agent did what) and
`git push -u origin HEAD`. Open the PR as draft:
`gh pr create --draft --title "<KEY>: <summary>" --body "Delivered by the agentic loop. Evidence follows." --base main`.
`loop step <KEY> sandbox started --gate 1 --link pr=<url>`. Watch CI in the background:
`gh pr checks <n> --watch --interval 10`. When "Gate 1 · Build & unit tests" and "Deploy preview (sandbox)" pass:
`loop step <KEY> sandbox passed --gate 1 --link preview=https://lucianostraga.github.io/trackwell/preview/pr-<n>/`.
If a check fails: `loop step <KEY> sandbox failed --gate 1 --note "<reason>"`, ask `ci-doctor` (Haiku), fix
(yourself or by resuming the builder with SendMessage), push, and watch again. After EVERY push (review fixes too),
watch CI again: the gates only count on the latest commit.

**05 Adversarial review · Gate 2** — run it in parallel with CI. `loop step <KEY> review started --gate 2`, then
`adversarial-reviewer` (Opus) with the worktree, the brief and the base branch. Only blocker and major findings
fail the gate; fix minor ones yourself or list them in the pull request. Verdict "changes required":
`loop step <KEY> review failed --gate 2 --note "<the problem in plain words>"`, send the findings back to the
builder that owns the file (SendMessage), push, and review again. At most THREE review passes: if the third still
fails, `loop note` the open findings, ask the team in the ticket's Slack thread and move on to the next ticket.
Verdict "clean": `loop step <KEY> review passed --gate 2`.

**06 End-to-end · Gate 3** — locally `npm run evidence -- e2e/<key>.spec.ts` (video and screenshots in `evidence/`) and in CI the job
"Gate 3 · End-to-end (Playwright)". `loop step <KEY> e2e started --gate 3`; when both pass:
`loop step <KEY> e2e passed --gate 3 --link video=<preview>/evidence/<key>.webm --link screenshot=<preview>/evidence/<key>.png`
(use the real file names). Look at the screenshots before you claim the UI works.

**07 Pull request · Gate 4 (deploy approval in Slack)** — ask `release-scribe` (Haiku) for `.loop-out/pr-body.md`
and `.loop-out/jira-comment.md` with the real evidence. Check both drafts against the facts (what the feature does,
test numbers, who did what) and fix them before publishing; then `gh pr edit <n> --body-file .loop-out/pr-body.md` and
`gh pr ready <n>`. Announce it to the team:
`loop pr <KEY> --pr <url> --preview <preview url> --screenshot <preview>/evidence/<file>.png --video <preview>/evidence/<file>.webm --summary "<one line: what changed for the user>"`.
Then `loop step <KEY> approval waiting --gate 4 --link pr=<url>` (moves Jira to In Review) and wait for a human in
the background: `node tools/loop.mjs approval <KEY> --pr <url>` (asks "Deploy to production?" in Slack). Approved:
`loop step <KEY> approval passed --gate 4`. Rejected: back to build with the reason. Never approve, label or merge
on a human's behalf before this command prints `approved`.

**08 Promote** — first the paperwork, while the worktree and its evidence still exist: update
`.loop-out/jira-comment.md` with the links, `loop comment <KEY> .loop-out/jira-comment.md`,
`loop attach <KEY> evidence/<this ticket's files>`, `loop link <KEY> <pr url> "Pull request #<n>"`. Then
`gh pr merge <n> --squash` (no `--delete-branch`: GitHub deletes the remote branch; the preview and its evidence
stay published). `loop step <KEY> ship started`, watch the production deploy (`gh run list --workflow deploy.yml
--branch main -L 1`, then `gh run watch <id>`; if it was cancelled, because previews and production share the
gh-pages lock, run it again with `gh workflow run deploy.yml --ref main`), check the live site answers
(`curl -fsS https://lucianostraga.github.io/trackwell/ >/dev/null`), `loop link <KEY>
https://lucianostraga.github.io/trackwell/ "Production"` and `loop step <KEY> ship passed --link
prod=https://lucianostraga.github.io/trackwell/` (moves Jira to Done and tells the channel). Remove the worktree last
(`git -C /workspace/trackwell worktree remove /workspace/worktrees/<KEY> --force`).

## Rebase
Before the second ticket in flight merges, rebase it on `origin/main`, resolve conflicts (keep both entries in
`releases.json`, newest first), re-run the local checks and push with `--force-with-lease`. If the rebase misbehaves,
cherry-pick the ticket's commits onto a fresh branch from `origin/main` instead.

## Finish
When `loop tickets` shows no Ready tickets and nothing is in flight: `node tools/loop.mjs run finish` and a
five-line summary: tickets shipped, gates failed and recovered, human interventions, what the local model did.
