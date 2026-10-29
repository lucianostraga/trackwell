import { expect, test } from '@playwright/test'
import { caption, createStepCounter, hideCaption, installPresenter, pause, pointAt, saveEvidence, smoothScrollTo } from './support/presenter'

/**
 * Savings calculator walkthrough. Saves evidence/tw-5-defaults.png, tw-5-updates.png,
 * tw-5-invalid.png and tw-5-limits.png; the video is copied to evidence/tw-5.webm.
 */

test('a hospital manager works out what Trackwell would save', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const section = page.getByTestId('savings-calculator')
  const assets = page.getByTestId('savings-assets')
  const cost = page.getByTestId('savings-hourly-cost')
  const hours = page.getByTestId('savings-hours')
  const dollars = page.getByTestId('savings-dollars')
  const assetsError = page.getByTestId('savings-assets-error')
  const costError = page.getByTestId('savings-hourly-cost-error')

  const typeInto = async (input: typeof assets, text: string) => {
    await pointAt(input)
    await input.click()
    await input.fill('')
    await input.pressSequentially(text, { delay: 100 })
    await pause(page, 700)
  }
  const expectNoGarbage = async () => {
    const text = (await section.innerText()) ?? ''
    expect(text).not.toContain('NaN')
    expect(text).not.toMatch(/-\d/)
  }

  await caption(page, 'Savings calculator: the defaults are 500 assets and $52 per hour', step())
  await smoothScrollTo(section)
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('What would Trackwell save you?')
  await expect(assets).toHaveValue('500')
  await expect(cost).toHaveValue('52')
  await expect(hours).toHaveText('125')
  await expect(dollars).toHaveText('$78,000')
  await expect(section).toContainText('Based on 15 minutes of searching saved per asset each month.')
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-defaults', { fullPage: false })

  await caption(page, 'Typing updates the results on every keystroke', step())
  await typeInto(assets, '1200')
  await expect(hours).toHaveText('300')
  await expect(dollars).toHaveText('$187,000')
  await typeInto(cost, '75')
  await expect(dollars).toHaveText('$270,000')
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-updates', { fullPage: false })

  await caption(page, 'Wrong numbers show a clear message and no results', step())
  await typeInto(assets, '5')
  await expect(assetsError).toHaveText('Enter a whole number of assets from 10 to 20,000.')
  await expect(assets).toHaveAttribute('aria-invalid', 'true')
  await expect(hours).toHaveText('—')
  await expect(dollars).toHaveText('—')
  await expectNoGarbage()
  await typeInto(assets, 'abc')
  await expect(assetsError).toHaveText('Enter a whole number of assets from 10 to 20,000.')
  await expect(hours).toHaveText('—')
  await expect(dollars).toHaveText('—')
  await expectNoGarbage()
  await typeInto(cost, '250')
  await expect(costError).toHaveText('Enter an hourly cost from $20 to $200.')
  await expect(cost).toHaveAttribute('aria-invalid', 'true')
  await expectNoGarbage()
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-invalid', { fullPage: false })

  await caption(page, 'The largest allowed hospital: 20,000 assets at $200 per hour', step())
  await typeInto(assets, '20000')
  await typeInto(cost, '200')
  await expect(assetsError).toHaveCount(0)
  await expect(costError).toHaveCount(0)
  await expect(assets).toHaveAttribute('aria-invalid', 'false')
  await expect(hours).toHaveText('5,000')
  await expect(dollars).toHaveText('$12,000,000')
  await expectNoGarbage()
  await hideCaption(page)
  await saveEvidence(page, 'tw-5-limits', { fullPage: false })
})
