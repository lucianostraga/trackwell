import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against the production build served by `vite preview`.
 * Chromium only (headless, no Google Chrome channel) so they also run on Linux ARM64.
 * Every test records a video; e2e/support/evidence-reporter.ts copies it to
 * evidence/<spec-name>.webm next to the screenshots the specs save.
 */
const PORT = Number(process.env.E2E_PORT ?? 4317)
const BASE_URL = `http://127.0.0.1:${PORT}`
const VIEWPORT = { width: 1600, height: 900 }

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./e2e/support/evidence-reporter.ts'],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'en-US',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: { mode: 'on', fullPage: true },
    video: { mode: 'on', size: VIEWPORT },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORT, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // The e2e build is always served from the root, whatever BASE_PATH the shell has.
    env: { BASE_PATH: '/' },
  },
})
