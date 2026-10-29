---
name: writing-for-people
description: How the team writes anything people read - Slack updates, Jira comments, step notes and the top of each pull request. Plain language for product owners, managers and other non-developers. Preloaded into the release scribe; use it for every note or summary.
---

# Writing for people

Product owners, managers and people outside engineering read Slack, Jira and the top of each pull request. Write so
anyone understands what happened.

- Say what changed for the visitor and how we know it works, not how the code does it.
- No file paths, function names, test counts by file or jargon ("e2e", "lint", "refactor", "regression") outside
  the pull request's technical section.
- Short sentences, everyday words, one idea per line, at most two lines per Slack update.
- Use the team's own words and numbers ("yearly billing gives 2 months free"), not internal identifiers.
- Never claim what you did not see: if a fact is missing, say "pending".

Good: "Visitors can now see how much Trackwell would save them per year. Tested in a real browser; video attached."
Bad: "Implemented calculateSavings() in src/lib/savings.ts with 14 Vitest cases; e2e green."
