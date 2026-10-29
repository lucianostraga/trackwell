import { expect, test, type Locator, type Page } from '@playwright/test'
import { contrastRatio } from '../src/lib/contrast'
import {
  caption,
  createStepCounter,
  hideCaption,
  installPresenter,
  pause,
  presentClick,
  saveEvidence,
  scrollToTop,
  smoothScrollTo,
} from './support/presenter'

/**
 * TW-8 · Dark mode. Saves evidence/tw-8-light.png, tw-8-dark.png, tw-8-dark-sections.png (plus one picture per
 * section in dark), tw-8-remembered.png and tw-8-contrast-light/dark.png; the video is copied to evidence/tw-8.webm.
 */

const STORAGE_KEY = 'trackwell-theme'
const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme)
const stored = (page: Page) => page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)

/** Text color and the first non-transparent background found walking up from the element. */
async function colors(el: Locator): Promise<{ fg: string; bg: string; size: number; weight: number }> {
  return el.evaluate((node) => {
    // Chromium reports color-mix() results as oklab(...): convert any color to plain rgb through a canvas.
    const toRgb = (value: string) => {
      const ctx = document.createElement('canvas').getContext('2d')!
      ctx.fillStyle = '#000'
      ctx.fillStyle = value
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      return `rgb(${r}, ${g}, ${b})`
    }
    const style = getComputedStyle(node)
    let bg = 'rgb(255, 255, 255)'
    for (let n: Element | null = node; n; n = n.parentElement) {
      const value = getComputedStyle(n).backgroundColor
      const alpha = /\/\s*([\d.]+)\)$|,\s*([\d.]+)\)$/.exec(value)
      const a = alpha ? Number(alpha[1] ?? alpha[2]) : 1
      if (a > 0) {
        bg = toRgb(value)
        break
      }
    }
    return { fg: toRgb(style.color), bg, size: parseFloat(style.fontSize), weight: Number(style.fontWeight) }
  })
}

async function expectReadable(el: Locator, label: string): Promise<void> {
  await el.scrollIntoViewIfNeeded()
  const { fg, bg, size, weight } = await colors(el)
  const large = size >= 24 || (size >= 18.66 && weight >= 700)
  const ratio = contrastRatio(fg, bg)
  expect(ratio, `${label}: ${fg} on ${bg} (${ratio.toFixed(2)})`).toBeGreaterThanOrEqual(large ? 3 : 4.5)
}

async function expectContrast(page: Page): Promise<void> {
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expectReadable(page.getByRole('heading', { level: 1 }), 'h1')
  await expectReadable(page.getByTestId('pricing').getByRole('heading', { level: 2 }), 'section h2')
  await expectReadable(page.getByTestId('hero').locator('p').first(), 'hero paragraph')
  await expectReadable(page.getByTestId('features').locator('p').first(), 'body paragraph')
  for (const name of ['Product', 'How it works', 'Customers', 'Pricing', 'FAQ']) {
    await expectReadable(nav.getByRole('link', { name, exact: true }), `navbar link ${name}`)
  }
  await expectReadable(page.getByTestId('hero-book-demo'), 'primary button')
  await expectReadable(page.getByTestId('plan-price').first(), 'pricing price')
  await expectReadable(page.getByTestId('demo-form').locator('label').first(), 'form label')
  await expectReadable(page.getByTestId('faq-question').first(), 'FAQ question')
  await expectReadable(page.getByTestId('demo-submit'), 'form submit button')
}

test('the page follows the system theme, remembers the visitor choice and stays readable in both', async ({ page }) => {
  const step = createStepCounter()
  const toggle = page.getByTestId('theme-toggle')
  const navbar = page.getByRole('navigation', { name: 'Main' })

  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  // 1. System light, nothing stored: light.
  await caption(page, 'System set to light, nothing saved: the page is light', step())
  expect(await theme(page)).toBe('light')
  expect(await stored(page)).toBeNull()
  await expect(toggle).toHaveAccessibleName('Switch to dark theme')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('hero')).toBeInViewport()
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)')
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-light', { fullPage: false })

  // 2. System dark, nothing stored: dark.
  await caption(page, 'The visitor system switches to dark: the page follows', step())
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => theme(page)).toBe('dark')
  expect(await stored(page)).toBeNull()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)
  expect(await theme(page)).toBe('dark')
  await expect(toggle).toHaveAccessibleName('Switch to light theme')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgb(255, 255, 255)')
  await expect(page.getByTestId('product-frame')).toBeVisible()
  await expect(page.getByTestId('product-frame')).toBeInViewport()
  await pause(page, 600)
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark', { fullPage: false })

  // Every section in dark.
  await caption(page, 'Every section in dark: how it works, features, customers', step())
  for (const [id, name] of [
    ['how-it-works', 'how-it-works'],
    ['features', 'features'],
    ['customers', 'customers'],
  ] as const) {
    await smoothScrollTo(page.getByTestId(id), 'start')
    await hideCaption(page)
    await saveEvidence(page, `tw-8-dark-${name}`, { fullPage: false })
  }

  await caption(page, 'Savings calculator with an error, still readable', step())
  await smoothScrollTo(page.getByTestId('savings-calculator'), 'center')
  await page.getByTestId('savings-assets').fill('')
  await expect(page.getByTestId('savings-assets-error')).toBeVisible()
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-calculator', { fullPage: false })
  await page.getByTestId('savings-assets').fill('200')

  await caption(page, 'Pricing with yearly billing', step())
  await smoothScrollTo(page.getByTestId('pricing'), 'start')
  await presentClick(page.getByTestId('billing-yearly'))
  await expect(page.getByTestId('billing-yearly')).toBeVisible()
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-sections', { fullPage: false })

  await caption(page, 'An open FAQ answer', step())
  await smoothScrollTo(page.getByTestId('faq'), 'start')
  await presentClick(page.getByTestId('faq-question').first())
  await expect(page.getByTestId('faq-answer')).toBeVisible()
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-faq', { fullPage: false })

  await caption(page, 'What is new, final call to action and the demo form with errors', step())
  await smoothScrollTo(page.getByTestId('whats-new'), 'start')
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-whats-new', { fullPage: false })
  await smoothScrollTo(page.getByTestId('final-cta'), 'center')
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-final-cta', { fullPage: false })
  await smoothScrollTo(page.getByTestId('demo-form'), 'center')
  await page.getByTestId('demo-submit').click()
  await expect(page.getByTestId('demo-fullName-error')).toBeVisible()
  await pause(page, 500)
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-dark-form', { fullPage: false })
  await page.locator('footer').scrollIntoViewIfNeeded()
  await pause(page, 600)
  await saveEvidence(page, 'tw-8-dark-footer', { fullPage: false })

  // Contrast in dark (system dark, nothing stored).
  await caption(page, 'Dark theme: text is readable (WCAG AA contrast)', step())
  await expectContrast(page)
  await scrollToTop(page)
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-contrast-dark', { fullPage: false })

  // 3. The toggle: system light, click the toggle.
  await caption(page, 'System back to light; the visitor clicks the toggle in the navbar', step())
  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => theme(page)).toBe('light')
  expect(await stored(page)).toBeNull()
  await presentClick(toggle)
  expect(await theme(page)).toBe('dark')
  expect(await stored(page)).toBe('dark')
  await expect(toggle).toHaveAccessibleName('Switch to light theme')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  // The choice wins over a later system change.
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.emulateMedia({ colorScheme: 'light' })
  await pause(page, 400)
  expect(await theme(page)).toBe('dark')

  await caption(page, 'Reload: still dark, even though the system is light', step())
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)
  expect(await theme(page)).toBe('dark')
  expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(false)
  await expect(page.getByTestId('hero')).toBeInViewport()
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-remembered', { fullPage: false })

  await caption(page, 'Toggle back: light, and remembered as light', step())
  await presentClick(toggle)
  expect(await theme(page)).toBe('light')
  expect(await stored(page)).toBe('light')
  await expect(toggle).toHaveAccessibleName('Switch to dark theme')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)
  expect(await theme(page)).toBe('light')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)')

  // Contrast in light (stored light, system dark).
  await caption(page, 'Light theme: text is readable too', step())
  await expectContrast(page)
  await scrollToTop(page)
  await smoothScrollTo(page.getByTestId('pricing'), 'start')
  await hideCaption(page)
  await saveEvidence(page, 'tw-8-contrast-light', { fullPage: false })
  await expect(navbar).toBeVisible()
})
