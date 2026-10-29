#!/usr/bin/env node
// Guardrail hook (PreToolUse). Claude Code runs it before every Bash command and every file edit, for the lead and
// for every subagent. It enforces the team's rules no matter what the model decides: exit code 2 blocks the action
// and the message on stderr tells the agent why. Allowed actions exit 0 silently.
//
// The rules:
// - A pull request is merged only after a person approved the deploy in Slack (`loop approval` records it).
// - Nobody pushes to main or force-pushes; `--force-with-lease` on a feature branch is fine.
// - The pipelines, the secrets and these guardrails are not edited by agents.
// - Tokens are never printed; repository settings and branch protection are not changed.
// - No broad deletes (/, ~, the workspace).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const STATE = process.env.LOOP_STATE || path.join(os.homedir(), '.cache', 'agentic-loop', 'state.json');
const MC = (process.env.MISSION_CONTROL_URL || 'http://127.0.0.1:4800').replace(/\/$/, '');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.exit(0); }
const tool = input.tool_name || '';
const args = input.tool_input || {};

function approvedPrs() {
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')).approved || {}; } catch { return {}; }
}

function checkCommand(cmd) {
  if (/\bgh\s+pr\s+merge\b/.test(cmd)) {
    const n = cmd.match(/\/pull\/(\d+)/)?.[1] || cmd.match(/\bgh\s+pr\s+merge\s+(\d+)\b/)?.[1];
    if (!n) return 'name the pull request number when merging (gh pr merge <n> --squash).';
    if (!approvedPrs()[n]) return `pull request #${n} has no deploy approval yet. A person approves it in Slack: run "node tools/loop.mjs approval <KEY> --pr <url>" and wait for "approved".`;
  }
  if (/\bgit\s+push\b/.test(cmd)) {
    if (/\s(origin\s+)?(main|master)(\s|$)/.test(cmd) || /:(refs\/heads\/)?(main|master)(\s|$)/.test(cmd))
      return 'nobody pushes to main: changes reach main only through an approved pull request.';
    if (/\s--force(?!-with-lease)(\s|=|$)/.test(cmd) || /\s-f(\s|$)/.test(cmd))
      return 'no force pushes. On your own feature branch, use --force-with-lease.';
  }
  if (/\$\{?(GITHUB_TOKEN|GH_TOKEN|JIRA_API_TOKEN|SLACK_BOT_TOKEN)\b/.test(cmd) || /(^|[;&|]\s*)(env|printenv)(\s*$|\s*[|;&])/.test(cmd)
    || /secrets\.env/.test(cmd))
    return 'credentials are never printed or copied; the tools read them from the environment.';
  if (/\bgh\s+(repo\s+edit|secret\b|ruleset\b)/.test(cmd) || /\bgh\s+api\b.*\/(protection|rulesets|actions\/permissions|collaborators)/.test(cmd))
    return 'repository settings, secrets and branch protection belong to the team, not to the agents.';
  if (/\brm\s+-[a-zA-Z]*r[a-zA-Z]*\s+(-[a-zA-Z]+\s+)*("|')?(\/|~|\$HOME|\/workspace\/?|\.\.?)("|')?(\s|$)/.test(cmd))
    return 'broad deletes are not allowed; delete specific files or use git worktree remove.';
  return null;
}

function checkFile(file) {
  if (!file) return null;
  if (/(^|\/)\.github\/workflows\//.test(file)) return 'the pipelines (.github/workflows) belong to the team; fix the code, not the checks.';
  if (/(^|\/)\.env(\.|$)/.test(file) || /secrets\.env$/.test(file)) return 'secrets files are not edited by agents.';
  if (/(^|\/)\.claude\/(settings(\.local)?\.json|hooks\/)/.test(file)) return 'agents do not change their own guardrails or permissions.';
  return null;
}

const reason = tool === 'Bash' ? checkCommand(String(args.command || ''))
  : ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool) ? checkFile(String(args.file_path || args.notebook_path || ''))
  : null;
if (!reason) process.exit(0);

const who = input.agent_type || 'lead';
try {
  await fetch(`${MC}/events`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(800),
    body: JSON.stringify({ ts: new Date().toISOString(), type: 'note', text: `🛡️ Guardrail blocked ${who}: ${reason}` }),
  });
} catch { /* the dashboard is optional */ }
process.stderr.write(`Blocked by the team's guardrail: ${reason}\n`);
process.exit(2);
