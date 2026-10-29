#!/usr/bin/env node
// SessionStart hook: every session starts knowing the state of the backlog and the guardrails in force. What it
// prints is added to the session's context. It never blocks: on any error it prints nothing.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
try {
  const backlog = execFileSync('node', [path.join(root, 'tools', 'loop.mjs'), 'tickets'], {
    cwd: root, encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'ignore'],
  });
  process.stdout.write(`Backlog right now (Jira):\n${backlog.trim()}\n\n`
    + 'Guardrails in force (.claude/hooks/guard.mjs): pull requests are merged only after a person approves the '
    + 'deploy in Slack; no pushes to main and no force pushes; pipelines, secrets and guardrails are off limits.\n');
} catch { /* the briefing is a convenience */ }
