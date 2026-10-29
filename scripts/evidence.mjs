#!/usr/bin/env node
/**
 * npm run evidence [-- <playwright args>]
 *
 * Runs the end-to-end suite and prints the evidence it produced: full-page
 * screenshots (evidence/*.png) and one video per test (evidence/*.webm).
 * Old evidence is removed first so the folder only reflects this run.
 * Exits with Playwright's exit code.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidenceDir = path.join(root, 'evidence')
const EVIDENCE = /\.(png|webm)$/i

mkdirSync(evidenceDir, { recursive: true })
for (const name of readdirSync(evidenceDir)) {
  if (EVIDENCE.test(name)) rmSync(path.join(evidenceDir, name))
}

const cli = createRequire(import.meta.url).resolve('@playwright/test/cli')
const run = spawnSync(process.execPath, [cli, 'test', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

const files = readdirSync(evidenceDir)
  .filter((name) => EVIDENCE.test(name))
  .sort()
  .map((name) => {
    const full = path.join(evidenceDir, name)
    return { full, size: statSync(full).size }
  })

const kb = (bytes) => `${(bytes / 1024).toFixed(0).padStart(6)} KB`
console.log('')
if (files.length === 0) {
  console.log('No evidence was produced.')
} else {
  console.log(`Evidence (${files.length} files):`)
  for (const { full, size } of files) console.log(`  ${kb(size)}  ${full}`)
}
if (run.status !== 0) console.log(`\nPlaywright exited with code ${run.status ?? 'unknown'}.`)
process.exit(run.status ?? 1)
