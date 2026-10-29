#!/usr/bin/env node
// loop - the agentic delivery loop's side effects in one place: Jira, Slack, the human approval gate and
// Mission Control events. Agents call it from Bash; GitHub work goes through `gh`.
//
//   loop tickets [--json]                       backlog in rank order (Ready first is the next ticket)
//   loop ticket <KEY>                           the whole ticket: fields, description, comments, attachments
//   loop context <KEY>                          Slack conversations in the team channel that mention the ticket
//   loop step <KEY> <step> <status> [--gate N] [--note TEXT] [--link name=url]...
//        step:   intake | context | build | sandbox | review | e2e | approval | ship
//        status: started | passed | failed | waiting | skipped
//        Side effects: intake passed -> Jira In Progress; approval waiting -> In Review; ship passed -> Done.
//        Every step is sent to Mission Control and to the ticket's Slack thread.
//   loop skip <KEY> <reason> [--comment]        a ticket the loop will not take (Refinement, or Ready but missing a
//                                               decision); --comment also asks for it on the Jira ticket
//   loop comment <KEY> <file.md | ->            Jira comment from Markdown (### headings, - bullets, `code`, **bold**, [text](url))
//   loop attach <KEY> <file>...                 attach evidence files to the Jira ticket
//   loop link <KEY> <url> <title>               add a link (PR, preview, production) to the Jira ticket
//   loop pr <KEY> --pr <url> [--preview <url>] [--screenshot <url>] [--video <url>] [--summary TEXT]
//        Announces the pull request in the team channel: summary, links, the evidence screenshot and the gates.
//   loop approval <KEY> --pr <url> [--timeout-min 45]
//        Gate 4. Asks for the deploy to production in Slack (react ✅ to approve, ❌ to send it back) and waits.
//        Merging the PR or adding the `approved` label on GitHub also counts. Prints approved | rejected | timeout.
//        LOOP_APPROVAL=auto skips it.
//   loop run start|finish                       marks the start and end of a run
//   loop note <text>                            a line for Mission Control's feed
//
// Env: JIRA_BASE_URL JIRA_EMAIL JIRA_API_TOKEN [JIRA_PROJECT=TW] [SLACK_BOT_TOKEN SLACK_CHANNEL_ID]
//      [MISSION_CONTROL_URL=http://127.0.0.1:4800] [LOOP_APPROVAL=human|auto]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const env = process.env;
const PROJECT = env.JIRA_PROJECT || 'TW';
const MC = (env.MISSION_CONTROL_URL || 'http://127.0.0.1:4800').replace(/\/$/, '');
// Shared by every worktree of the run (Slack thread per ticket); reset-demo deletes it.
const STATE_FILE = env.LOOP_STATE || path.join(env.HOME || '.', '.cache', 'agentic-loop', 'state.json');
const STEPS = ['intake', 'context', 'build', 'sandbox', 'review', 'e2e', 'approval', 'ship'];
const STATUSES = ['started', 'passed', 'failed', 'waiting', 'skipped'];
// Plain words: these lines are read in Slack and Jira by people who are not developers.
const STEP_LABEL = {
  intake: 'Picked from the backlog', context: "Read the team's decisions", build: 'Building the change',
  sandbox: 'Preview ready to try (check 1)', review: 'Independent code review (check 2)',
  e2e: 'Tested in a real browser (check 3)', approval: 'Deploy approval (check 4)', ship: 'Live in production',
};
const STATUS_WORD = { started: 'started', passed: 'done', failed: 'needs another pass', waiting: 'waiting', skipped: 'skipped' };
const ICON = { started: '▶️', passed: '✅', failed: '❌', waiting: '⏳', skipped: '⏭️' };

const die = (msg) => { console.error(`loop: ${msg}`); process.exit(1); };
const loadState = () => { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { threads: {} }; } };
const saveState = (s) => { fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true }); fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 1)); };

// --- Mission Control (best effort: never blocks the loop) -------------------------------------------
let mcState = 'not sent';
async function mc(event) {
  try {
    const r = await fetch(`${MC}/events`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ts: new Date().toISOString(), ...event }), signal: AbortSignal.timeout(1500),
    });
    mcState = r.ok ? 'ok' : `HTTP ${r.status}`;
  } catch { mcState = 'offline'; /* Mission Control is optional: never block the loop */ }
}

// --- Jira ----------------------------------------------------------------------------------------------
function jiraAuth() {
  if (!env.JIRA_BASE_URL || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN) die('JIRA_BASE_URL, JIRA_EMAIL and JIRA_API_TOKEN are required');
  return 'Basic ' + Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
}
async function jira(method, p, body, headers = {}) {
  const r = await fetch(env.JIRA_BASE_URL.replace(/\/$/, '') + p, {
    method, body: body === undefined ? undefined : (body instanceof FormData ? body : JSON.stringify(body)),
    headers: { Authorization: jiraAuth(), Accept: 'application/json', ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...headers },
  });
  const text = await r.text();
  if (!r.ok) die(`Jira ${method} ${p} -> ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
const browse = (key) => `${env.JIRA_BASE_URL.replace(/\/$/, '')}/browse/${key}`;

async function transition(key, status) {
  const issue = await jira('GET', `/rest/api/3/issue/${key}?fields=status`);
  if (issue.fields.status.name === status) return;
  const { transitions } = await jira('GET', `/rest/api/3/issue/${key}/transitions`);
  const t = transitions.find((x) => x.to.name === status);
  if (!t) die(`${key}: no transition to ${status}`);
  await jira('POST', `/rest/api/3/issue/${key}/transitions`, { transition: { id: t.id } });
}

// Markdown subset -> Atlassian Document Format
function inline(text) {
  const nodes = [];
  for (const part of text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)) {
    if (!part) continue;
    if (part.startsWith('`')) nodes.push({ type: 'text', text: part.slice(1, -1), marks: [{ type: 'code' }] });
    else if (part.startsWith('**')) nodes.push({ type: 'text', text: part.slice(2, -2), marks: [{ type: 'strong' }] });
    else if (part.startsWith('[')) {
      const [, t, href] = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      nodes.push({ type: 'text', text: t, marks: [{ type: 'link', attrs: { href } }] });
    } else nodes.push({ type: 'text', text: part });
  }
  return nodes;
}
export function toAdf(md) {
  const content = [];
  let bullets = [];
  const flush = () => {
    if (!bullets.length) return;
    content.push({ type: 'bulletList', content: bullets.map((b) => ({ type: 'listItem', content: [{ type: 'paragraph', content: inline(b) }] })) });
    bullets = [];
  };
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (/^\s*[-*] /.test(line)) { bullets.push(line.replace(/^\s*[-*] /, '')); continue; }
    flush();
    if (!line) continue;
    const h = line.match(/^(#{1,6}) (.*)$/);
    if (h) content.push({ type: 'heading', attrs: { level: Math.min(h[1].length, 6) }, content: inline(h[2]) });
    else content.push({ type: 'paragraph', content: inline(line) });
  }
  flush();
  return { type: 'doc', version: 1, content };
}
// ADF -> readable text
export function adfText(node, depth = 0) {
  if (!node) return '';
  if (Array.isArray(node)) return node.map((n) => adfText(n, depth)).join('');
  const kids = () => adfText(node.content || [], depth);
  switch (node.type) {
    case 'doc': return kids().trim();
    case 'text': return node.marks?.some((m) => m.type === 'code') ? `\`${node.text}\`` : node.text;
    case 'hardBreak': return '\n';
    case 'paragraph': return kids() + '\n\n';
    case 'heading': return `${'#'.repeat(node.attrs?.level || 3)} ${kids()}\n\n`;
    case 'bulletList': return node.content.map((li) => `${'  '.repeat(depth)}- ${adfText(li.content, depth + 1).trim()}\n`).join('') + '\n';
    case 'orderedList': return node.content.map((li, i) => `${'  '.repeat(depth)}${i + 1}. ${adfText(li.content, depth + 1).trim()}\n`).join('') + '\n';
    case 'codeBlock': return '```\n' + kids() + '\n```\n\n';
    case 'inlineCard': case 'blockCard': return node.attrs?.url || '';
    case 'mention': return node.attrs?.text || '@someone';
    default: return kids();
  }
}

// --- Slack (optional) ----------------------------------------------------------------------------------
const slackOn = () => Boolean(env.SLACK_BOT_TOKEN && env.SLACK_CHANNEL_ID);
// How the loop signs its messages (chat:write.customize).
const AS_LOOP = { username: 'Agentic Loop', icon_emoji: ':robot_face:' };
async function slack(method, params = {}, { get = false } = {}) {
  const url = `https://slack.com/api/${method}` + (get ? '?' + new URLSearchParams(params) : '');
  const r = await fetch(url, {
    method: get ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`, ...(get ? {} : { 'Content-Type': 'application/json; charset=utf-8' }) },
    body: get ? undefined : JSON.stringify(params),
  });
  const d = await r.json();
  if (!d.ok) throw new Error(`Slack ${method}: ${d.error}`);
  return d;
}
async function slackThread(key, text, { broadcast = false, blocks } = {}) {
  if (!slackOn()) return null;
  try {
    const state = loadState();
    let ts = state.threads[key];
    if (!ts) {
      const { fields } = await jira('GET', `/rest/api/3/issue/${key}?fields=summary,priority`);
      const parent = await slack('chat.postMessage', {
        ...AS_LOOP, channel: env.SLACK_CHANNEL_ID, unfurl_links: false,
        text: `🤖 *Working on <${browse(key)}|${key}>:* ${fields.summary} (priority ${fields.priority?.name || 'not set'})`,
      });
      ts = state.threads[key] = parent.ts;
      saveState(state);
    }
    const msg = { ...AS_LOOP, channel: env.SLACK_CHANNEL_ID, thread_ts: ts, text, unfurl_links: false, reply_broadcast: broadcast };
    if (!blocks) return await slack('chat.postMessage', msg);
    // An image Slack cannot fetch yet (Pages still publishing) rejects the whole message: retry without the image,
    // then as plain text.
    for (const attempt of [blocks, blocks.filter((b) => b.type !== 'image')]) {
      try { return await slack('chat.postMessage', { ...msg, blocks: attempt }); } catch { /* next attempt */ }
    }
    return await slack('chat.postMessage', msg);
  } catch (e) { console.error(`loop: Slack skipped (${e.message})`); return null; }
}

// --- commands ------------------------------------------------------------------------------------------
function flags(args) {
  const out = { _: [], link: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--link') out.link.push(args[++i]);
    else if (a.startsWith('--')) out[a.slice(2)] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    else out._.push(a);
  }
  return out;
}

async function cmdTickets(f) {
  const d = await jira('POST', '/rest/api/3/search/jql', {
    jql: `project = ${PROJECT} AND issuetype != Epic ORDER BY rank ASC`, maxResults: 100,
    fields: ['summary', 'status', 'priority', 'labels', 'issuetype'],
  });
  const rows = d.issues.map((i) => ({ key: i.key, status: i.fields.status.name, priority: i.fields.priority?.name, summary: i.fields.summary }));
  if (f.json) return console.log(JSON.stringify(rows, null, 1));
  for (const r of rows) console.log(`${r.key.padEnd(7)} ${r.status.padEnd(11)} ${String(r.priority).padEnd(8)} ${r.summary}`);
  const next = rows.find((r) => r.status === 'Ready');
  console.log(next ? `\nNext Ready ticket by rank: ${next.key}` : '\nNo Ready tickets left.');
}

async function cmdTicket([key]) {
  if (!key) die('usage: loop ticket <KEY>');
  const i = await jira('GET', `/rest/api/3/issue/${key}?fields=summary,status,priority,issuetype,labels,parent,description,comment,attachment`);
  const f = i.fields;
  console.log(`# ${i.key} · ${f.summary}\n`);
  console.log(`Type: ${f.issuetype.name} | Status: ${f.status.name} | Priority: ${f.priority?.name} | Labels: ${f.labels.join(', ') || '-'} | Epic: ${f.parent ? `${f.parent.key} ${f.parent.fields.summary}` : '-'}`);
  console.log(`URL: ${browse(i.key)}\n`);
  console.log(adfText(f.description) || '(no description)');
  if (f.attachment?.length) console.log('\n## Attachments\n' + f.attachment.map((a) => `- ${a.filename} (${a.mimeType}, ${a.size} bytes)`).join('\n'));
  const comments = f.comment?.comments || [];
  console.log(`\n## Comments (${comments.length})`);
  for (const c of comments) console.log(`\n${c.author.displayName}, ${c.created}:\n${adfText(c.body)}`);
}

async function cmdContext([key]) {
  if (!key) die('usage: loop context <KEY>');
  if (!slackOn()) return console.log('Slack is not configured in this environment: no conversation context available. Use the ticket and its comments.');
  const hist = await slack('conversations.history', { channel: env.SLACK_CHANNEL_ID, limit: 200 }, { get: true });
  const state = loadState();
  const mine = new Set(Object.values(state.threads));
  // The loop's own threads (and their broadcast replies) are progress updates, not context.
  const ours = (m) => mine.has(m.ts) || mine.has(m.thread_ts) || /^(🤖|🙋|🚀|🔀)/u.test(m.text || '');
  const hits = hist.messages.filter((m) => (m.text || '').includes(key) && !ours(m));
  if (!hits.length) return console.log(`No conversations in the channel mention ${key}.`);
  const names = {};
  const who = async (m) => m.username || m.bot_profile?.name || (names[m.user] ??= await slack('users.info', { user: m.user }, { get: true }).then((d) => d.user.real_name).catch(() => m.user));
  for (const m of hits.reverse()) {
    const msgs = m.reply_count ? (await slack('conversations.replies', { channel: env.SLACK_CHANNEL_ID, ts: m.ts, limit: 50 }, { get: true })).messages : [m];
    console.log(`## Thread from ${new Date(Number(m.ts) * 1000).toISOString()}`);
    for (const x of msgs) console.log(`- ${await who(x)}: ${x.text}`);
    console.log('');
  }
}

async function cmdStep([key, step, status], f) {
  if (!key || !STEPS.includes(step) || !STATUSES.includes(status)) die(`usage: loop step <KEY> <${STEPS.join('|')}> <${STATUSES.join('|')}> [--gate N] [--note TEXT] [--link name=url]`);
  const links = Object.fromEntries(f.link.map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
  if (step === 'intake' && status === 'passed') await transition(key, 'In Progress');
  if (step === 'approval' && status === 'waiting') await transition(key, 'In Review');
  if (step === 'ship' && status === 'passed') await transition(key, 'Done');
  if (step === 'intake' && status === 'started') {
    const { fields } = await jira('GET', `/rest/api/3/issue/${key}?fields=summary,priority`);
    await mc({ type: 'ticket', ticket: key, title: fields.summary, priority: fields.priority?.name, status: 'picked' });
  }
  if (step === 'ship' && status === 'passed') await mc({ type: 'ticket', ticket: key, status: 'done' });
  await mc({ type: 'step', ticket: key, step, status, gate: f.gate ? Number(f.gate) : null, note: typeof f.note === 'string' ? f.note : '', links });
  const linkText = Object.entries(links).map(([n, u]) => `<${u}|${n}>`).join(' · ');
  if (step === 'ship' && status === 'passed') {
    const { fields } = await jira('GET', `/rest/api/3/issue/${key}?fields=summary`);
    await slackThread(key, `🚀 *Live in production:* <${browse(key)}|${key}> ${fields.summary}${linkText ? `\n${linkText}` : ''}`, { broadcast: true });
  } else {
    await slackThread(key, `${ICON[status]} *${STEP_LABEL[step]}*: ${STATUS_WORD[status]}${typeof f.note === 'string' && f.note ? `. ${f.note}` : ''}${linkText ? `\n${linkText}` : ''}`);
  }
  console.log(`${key} ${step} ${status} (Jira ok · Slack ${slackOn() ? 'ok' : 'not configured'} · dashboard ${mcState})`);
}

async function cmdSkip([key, ...reason], f) {
  if (!key) die('usage: loop skip <KEY> <reason> [--comment]');
  const why = reason.join(' ');
  const { fields } = await jira('GET', `/rest/api/3/issue/${key}?fields=summary,priority`);
  await mc({ type: 'ticket', ticket: key, title: fields.summary, priority: fields.priority?.name, status: 'skipped', reason: why });
  if (f.comment) {
    await jira('POST', `/rest/api/3/issue/${key}/comment`, { body: toAdf(`### Not started yet\n${why}\n\nThe agents will pick it up as soon as this is answered.`) });
  }
  console.log(`${key} skipped: ${why}`);
}

async function cmdComment([key, file]) {
  if (!key || !file) die('usage: loop comment <KEY> <file.md | ->');
  const md = fs.readFileSync(file === '-' ? 0 : file, 'utf8');
  const r = await jira('POST', `/rest/api/3/issue/${key}/comment`, { body: toAdf(md) });
  console.log(`comment ${r.id} on ${key}`);
}

async function cmdAttach([key, ...files]) {
  if (!key || !files.length) die('usage: loop attach <KEY> <file>...');
  for (const file of files) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
    await jira('POST', `/rest/api/3/issue/${key}/attachments`, form, { 'X-Atlassian-Token': 'no-check' });
    console.log(`attached ${path.basename(file)} to ${key}`);
  }
}

async function cmdLink([key, url, ...title]) {
  if (!key || !url) die('usage: loop link <KEY> <url> <title>');
  await jira('POST', `/rest/api/3/issue/${key}/remotelink`, { object: { url, title: title.join(' ') || url } });
  console.log(`linked ${url} to ${key}`);
}

async function cmdPr([key], f) {
  if (!key || typeof f.pr !== 'string') die('usage: loop pr <KEY> --pr <url> [--preview <url>] [--screenshot <url>] [--video <url>] [--summary TEXT]');
  const { fields } = await jira('GET', `/rest/api/3/issue/${key}?fields=summary`);
  const number = f.pr.match(/\/pull\/(\d+)/)?.[1] || '';
  const title = `🔀 Pull request #${number} · ${key} · ${fields.summary}`;
  const buttons = [['Review the pull request', f.pr, 'primary'], ['Open the preview', f.preview], ['Watch the video', f.video], ['Jira ticket', browse(key)]]
    .filter(([, url]) => typeof url === 'string')
    .map(([text, url, style]) => ({ type: 'button', text: { type: 'plain_text', text }, url, ...(style ? { style } : {}) }));
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*${title}*${typeof f.summary === 'string' ? `\n${f.summary}` : ''}` } },
    { type: 'actions', elements: buttons },
    ...(typeof f.screenshot === 'string' ? [{ type: 'image', image_url: f.screenshot, alt_text: `${key} evidence` }] : []),
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'Opened by the agents. Checked automatically: it builds and its tests pass · reviewed by an independent AI reviewer · tested in a real browser (video).' }] },
  ];
  if (!slackOn()) return console.log(`${key}: Slack not configured, pull request not announced`);
  await slackThread(key, title + `\n${f.pr}`, { broadcast: true, blocks });
  await mc({ type: 'note', text: `${key}: pull request #${number} announced in Slack` });
  console.log(`${key}: pull request announced in Slack`);
}

function prState(pr) {
  try {
    return JSON.parse(execFileSync('gh', ['pr', 'view', pr, '--json', 'state,labels,reviewDecision'], { encoding: 'utf8' }));
  } catch { return null; }
}

async function cmdApproval([key], f) {
  if (!key || typeof f.pr !== 'string') die('usage: loop approval <KEY> --pr <url> [--timeout-min 45]');
  const human = async (decision, by, via) => {
    await mc({ type: 'human', action: decision, by, ticket: key, via });
    await slackThread(key, decision === 'approved' ? `✅ *Approved by ${by}.* Putting it in production.` : `❌ *Sent back by ${by}.* Back to building it.`);
    console.log(decision);
  };
  if ((env.LOOP_APPROVAL || 'human') === 'auto') {
    await mc({ type: 'note', text: `${key}: approval skipped by policy (LOOP_APPROVAL=auto)` });
    return console.log('approved');
  }
  let ask = null;
  let botUser = null;
  if (slackOn()) {
    try {
      botUser = (await slack('auth.test')).user_id;
      const state = loadState();
      if (!state.threads[key]) await slackThread(key, `Working on ${key}.`);
      ask = await slack('chat.postMessage', {
        ...AS_LOOP, channel: env.SLACK_CHANNEL_ID, thread_ts: loadState().threads[key], reply_broadcast: true, unfurl_links: false,
        text: `🚀 *Ready for production: <${browse(key)}|${key}>.* It passed every check: it builds and its tests pass, an independent reviewer approved the code, and it was tested in a real browser (video in the pull request).\nReview it here: ${f.pr}\nReact ✅ to put it in production, or ❌ to send it back.`,
      });
    } catch (e) { console.error(`loop: Slack approval request failed (${e.message}); waiting on GitHub only`); }
  }
  console.error(`Waiting for a human: ${ask ? 'react ✅/❌ in Slack, or ' : ''}merge or label the PR "approved" on GitHub (${f.pr}).`);
  const deadline = Date.now() + Number(f['timeout-min'] || 45) * 60_000;
  while (Date.now() < deadline) {
    if (ask) {
      try {
        const { message } = await slack('reactions.get', { channel: env.SLACK_CHANNEL_ID, timestamp: ask.ts, full: true }, { get: true });
        for (const r of message.reactions || []) {
          const people = r.users.filter((u) => u !== botUser);
          if (!people.length) continue;
          const by = await slack('users.info', { user: people[0] }, { get: true }).then((d) => d.user.real_name).catch(() => people[0]);
          if (['white_check_mark', 'heavy_check_mark', '+1', 'ballot_box_with_check'].includes(r.name)) return human('approved', by, 'slack');
          if (['x', 'no_entry', '-1'].includes(r.name)) return human('rejected', by, 'slack');
        }
      } catch { /* keep waiting */ }
    }
    const pr = prState(f.pr);
    if (pr?.state === 'MERGED') return human('approved', 'a maintainer', 'github merge');
    if (pr?.reviewDecision === 'APPROVED' || pr?.labels?.some((l) => l.name === 'approved')) return human('approved', 'a maintainer', 'github');
    if (pr?.labels?.some((l) => l.name === 'changes-requested')) return human('rejected', 'a maintainer', 'github');
    await new Promise((r) => setTimeout(r, 4000));
  }
  console.log('timeout');
  process.exit(2);
}

const [cmd, ...rest] = process.argv.slice(2);
const f = flags(rest);
const commands = {
  tickets: () => cmdTickets(f), ticket: () => cmdTicket(f._), context: () => cmdContext(f._), step: () => cmdStep(f._, f),
  skip: () => cmdSkip(f._, f), comment: () => cmdComment(f._), attach: () => cmdAttach(f._), link: () => cmdLink(f._),
  approval: () => cmdApproval(f._, f), pr: () => cmdPr(f._, f),
  run: async () => { await mc({ type: 'run', state: f._[0] === 'finish' ? 'finished' : 'started' }); console.log(`run ${f._[0] || 'start'}`); },
  note: async () => { await mc({ type: 'note', text: f._.join(' ') }); console.log('noted'); },
};
if (!commands[cmd]) {
  const lines = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n');
  console.log(lines.slice(1, lines.findIndex((l, i) => i > 1 && !l.startsWith('//'))).map((l) => l.slice(3)).join('\n'));
  process.exit(cmd ? 1 : 0);
}
await commands[cmd]();
