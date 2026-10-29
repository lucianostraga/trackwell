import { expect, test } from '@playwright/test'
import {
  caption,
  createStepCounter,
  hideCaption,
  installPresenter,
  pointAt,
  presentClick,
  saveEvidence,
  smoothScrollTo,
} from './support/presenter'

/**
 * TW-6 · Pricing with monthly and yearly billing. Saves evidence/tw-6-plans.png, tw-6-monthly.png,
 * tw-6-yearly.png and tw-6-contact-sales.png; the video is copied to evidence/tw-6.webm.
 */

test('a buyer compares the plans and switches between monthly and yearly billing', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const cards = page.getByTestId('plan-card')
  const starter = page.locator('[data-plan="starter"]')
  const growth = page.locator('[data-plan="growth"]')
  const enterprise = page.locator('[data-plan="enterprise"]')

  await caption(page, 'The Pricing link in the navbar jumps to the three plans', step())
  await presentClick(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Pricing', exact: true }))
  await expect(page).toHaveURL(/#pricing$/)
  await expect(page.getByTestId('pricing').getByRole('heading', { level: 2 })).toBeInViewport()
  await expect(cards).toHaveCount(3)
  await smoothScrollTo(page.getByTestId('plan-card').nth(1))
  await expect(cards.first()).toBeInViewport({ ratio: 1 })
  await expect(cards.last()).toBeInViewport({ ratio: 1 })
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Starter', 'Growth', 'Enterprise'])
  await hideCaption(page)
  await saveEvidence(page, 'tw-6-plans', { fullPage: false })

  await caption(page, 'Monthly billing is the default: Starter $290, Growth $890', step())
  await smoothScrollTo(page.getByTestId('plan-card').nth(1))
  await expect(page.getByTestId('billing-monthly')).toHaveAttribute('aria-pressed', 'true')
  await expect(starter.getByTestId('plan-price')).toHaveText('$290')
  await expect(growth.getByTestId('plan-price')).toHaveText('$890')
  await expect(starter.getByTestId('plan-assets')).toHaveText('up to 250 assets')
  await expect(growth.getByTestId('plan-assets')).toHaveText('up to 1,000 assets')
  await expect(growth.getByTestId('plan-popular')).toHaveText('Most popular')
  await expect(page.getByTestId('plan-popular')).toHaveCount(1)
  await expect(enterprise).not.toContainText('$')
  await expect(enterprise.getByTestId('plan-contact-sales')).toHaveText('Contact sales')
  await expect(page.getByTestId('plan-save')).toHaveCount(0)
  await pointAt(growth)
  await hideCaption(page)
  await saveEvidence(page, 'tw-6-monthly', { fullPage: false })

  await caption(page, 'Yearly billing: 2 months free, shown as a lower monthly price', step())
  const heightBefore = await growth.evaluate((el) => el.getBoundingClientRect().height)
  await presentClick(page.getByTestId('billing-yearly'))
  await expect(page.getByTestId('billing-yearly')).toHaveAttribute('aria-pressed', 'true')
  await expect(starter.getByTestId('plan-price')).toHaveText('$241')
  await expect(growth.getByTestId('plan-price')).toHaveText('$741')
  await expect(page.getByTestId('plan-save')).toHaveCount(2)
  await expect(starter.getByTestId('plan-save')).toHaveText('Save 2 months')
  await expect(growth.getByTestId('plan-save')).toHaveText('Save 2 months')
  await expect(enterprise.getByTestId('plan-save')).toHaveCount(0)
  await expect(starter).toContainText('billed $2,900 per year')
  await expect(growth).toContainText('billed $8,900 per year')
  await expect(enterprise).not.toContainText('$')
  expect(await growth.evaluate((el) => el.getBoundingClientRect().height)).toBe(heightBefore)
  await pointAt(starter)
  await hideCaption(page)
  await saveEvidence(page, 'tw-6-yearly', { fullPage: false })

  await caption(page, 'Back to monthly, then Contact sales for Enterprise', step())
  await presentClick(page.getByTestId('billing-monthly'))
  await expect(starter.getByTestId('plan-price')).toHaveText('$290')
  await expect(growth.getByTestId('plan-price')).toHaveText('$890')
  await expect(page.getByTestId('plan-save')).toHaveCount(0)
  for (const plan of [starter, growth]) {
    await expect(plan.getByRole('link', { name: 'Book a demo' })).toHaveAttribute('href', '#contact')
  }
  const contactSales = enterprise.getByTestId('plan-contact-sales')
  await expect(contactSales).toHaveAttribute('href', '#contact')
  await presentClick(contactSales)
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toBeInViewport()
  await hideCaption(page)
  await saveEvidence(page, 'tw-6-contact-sales', { fullPage: false })
})
