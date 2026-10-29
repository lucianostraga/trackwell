import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import type { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter'
import { EVIDENCE_DIR } from './paths'

/**
 * Copies each test's video to evidence/<spec-name>.webm (stable names for CI and
 * PR comments). A spec with several tests gets evidence/<spec-name>--<test-title>.webm.
 */
export default class EvidenceReporter implements Reporter {
  private readonly testsPerFile = new Map<string, number>()
  private readonly videos = new Map<string, string>()

  onBegin(_config: FullConfig, suite: Suite): void {
    for (const test of suite.allTests()) {
      const file = test.location.file
      this.testsPerFile.set(file, (this.testsPerFile.get(file) ?? 0) + 1)
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const video = result.attachments.find((a) => a.name === 'video' && a.path)
    if (!video?.path) return
    // The last attempt wins, so a passing retry replaces the failed recording.
    this.videos.set(this.targetName(test), video.path)
  }

  onEnd(): void {
    if (this.videos.size === 0) return
    mkdirSync(EVIDENCE_DIR, { recursive: true })
    for (const [name, source] of this.videos) {
      if (!existsSync(source)) continue
      const target = path.join(EVIDENCE_DIR, `${name}.webm`)
      copyFileSync(source, target)
      console.log(`  evidence: ${path.relative(process.cwd(), target)}`)
    }
  }

  printsToStdio(): boolean {
    return false
  }

  private targetName(test: TestCase): string {
    const spec = path.basename(test.location.file).replace(/\.(spec|test)\.[cm]?[jt]sx?$/, '')
    if ((this.testsPerFile.get(test.location.file) ?? 0) <= 1) return spec
    const slug = test.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    return `${spec}--${slug}`
  }
}
