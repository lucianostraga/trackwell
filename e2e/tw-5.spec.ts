import { expect, test } from '@playwright/test'
import {
  caption,
  createStepCounter,
  hideCaption,
  installPresenter,
  pause,
  pointAt,
  presentType,
  saveEvidence,
  smoothScrollTo,
} from './support/presenter'

/**
 * TW-5 savings calculator. Saves evidence/tw-5-defaults.png, tw-5-updates.png and tw-5-invalid.png;
 * the video is copied to evidence/tw-5.webm.
 */

test('a visitor estimates what Trackwell saves their hospital', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const section = page.getByTestId('savings')
  const assets = page.getByTestId('savings-assets')
  const cost = page.getByTestId('savings-hourly-cost')
  const hours = page.getByTestId('savings-hours')
  const money = page.getByTestId('savings-money')
  const assetsError = page.getByTestId('savings-assets-error')
  const costError = page.getByTestId('savings-hourly-cost-error')
  const heading = section.getByRole('heading', { level: 2 })

  // Defaults
  await caption(page, 'The savings calculator starts with 500 assets at $52 per hour', step())
  await smoothScrollTo(section)
  await expect(heading).toHaveText('See what Trackwell saves your hospital')
  await expect(assets).toHaveValue('500')
  await expect(cost).toHaveValue('52')
  await expect(hours).toHaveText('125 hours')
  await expect(money).toHaveText('$78,000')
  await expect(section).toContainText('Based on 15 minutes of searching saved per tracked asset each month.')
  await pointAt(money)
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-defaults', { fullPage: false })

  // Updates as the visitor types
  await caption(page, 'Results update as the visitor types: 1,200 assets at $60', step())
  await assets.fill('')
  await presentType(assets, '1200')
  await expect(hours).toHaveText('300 hours')
  await cost.fill('')
  await presentType(cost, '60')
  await expect(hours).toHaveText('300 hours')
  await expect(money).toHaveText('$216,000')
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-updates', { fullPage: false })

  // Invalid values
  await caption(page, 'Out-of-range values show a clear message instead of a result', step())
  await assets.fill('')
  await presentType(assets, '5')
  await expect(assets).toHaveAttribute('aria-invalid', 'true')
  await expect(assetsError).toContainText('10 to 20,000')
  await expect(hours).toHaveText('—')
  await expect(money).toHaveText('—')
  await expect(section).toContainText('Fix the highlighted field to see your savings.')
  await cost.fill('')
  await presentType(cost, '500')
  await expect(costError).toContainText('$20 to $200')
  await expect(cost).toHaveAttribute('aria-invalid', 'true')
  await assets.fill('')
  await expect(assetsError).toBeVisible()
  await expect(hours).toHaveText('—')
  await assets.fill('abc')
  await expect(assetsError).toBeVisible()
  const text = await page.locator('body').innerText()
  expect(text).not.toContain('NaN')
  expect(text).not.toContain('-$')
  await assets.fill('5')
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-invalid', { fullPage: false })

  // Fixing the inputs brings the results back
  await caption(page, 'Fixing the values brings the results back', step())
  await assets.fill('')
  await presentType(assets, '1,200')
  await cost.fill('')
  await presentType(cost, '60')
  await expect(assetsError).toHaveCount(0)
  await expect(costError).toHaveCount(0)
  await expect(assets).not.toHaveAttribute('aria-invalid', 'true')
  await expect(hours).toHaveText('300 hours')
  await expect(money).toHaveText('$216,000')
  await pause(page, 600)
  await hideCaption(page)

  // No horizontal overflow on a phone
  await page.setViewportSize({ width: 390, height: 844 })
  await smoothScrollTo(section)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(money).toBeVisible()
})
