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
 * TW-6: pricing with monthly and yearly billing. Saves evidence/tw-6-monthly.png, tw-6-yearly.png and
 * tw-6-contact-sales.png; the video is copied to evidence/tw-6.webm.
 */

test('a visitor compares the plans monthly and yearly and contacts sales', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const cards = page.getByTestId('plan-card')
  const card = (plan: string) => page.locator(`[data-testid="plan-card"][data-plan="${plan}"]`)

  // Monthly (default)
  await caption(page, 'Pricing in the navbar: three plans, billed monthly by default', step())
  await presentClick(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Pricing', exact: true }))
  await expect(page).toHaveURL(/#pricing$/)
  await expect(page.getByTestId('pricing').getByRole('heading', { level: 2 })).toBeInViewport()
  await expect(cards).toHaveCount(3)
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Starter', 'Growth', 'Enterprise'])
  await expect(page.getByTestId('billing-monthly')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('billing-yearly')).toHaveAttribute('aria-pressed', 'false')
  await expect(card('starter').getByTestId('plan-price')).toHaveText('$290')
  await expect(card('growth').getByTestId('plan-price')).toHaveText('$890')
  await expect(card('starter').getByTestId('plan-billing-note')).toHaveText('billed monthly')
  await expect(card('starter')).toContainText('Up to 250 assets')
  await expect(card('growth')).toContainText('Up to 1,000 assets')
  await expect(card('growth').getByTestId('plan-most-popular')).toHaveText('Most popular')
  await expect(page.getByTestId('plan-most-popular')).toHaveCount(1)
  await expect(page.getByTestId('plan-save-badge')).toHaveCount(0)
  await expect(card('enterprise')).not.toContainText('$')
  await expect(card('enterprise').getByTestId('plan-contact-sales')).toHaveText('Contact sales')
  await pointAt(card('growth'))
  await hideCaption(page)
  await smoothScrollTo(cards.first(), 'center')
  await saveEvidence(page, 'tw-6-monthly', { fullPage: false })

  // Yearly
  await caption(page, 'Yearly billing: two months free, shown as the monthly equivalent', step())
  await presentClick(page.getByTestId('billing-yearly'))
  await expect(page.getByTestId('billing-yearly')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('billing-monthly')).toHaveAttribute('aria-pressed', 'false')
  await expect(card('starter').getByTestId('plan-price')).toHaveText('$241')
  await expect(card('growth').getByTestId('plan-price')).toHaveText('$741')
  await expect(card('starter').getByTestId('plan-billing-note')).toHaveText('billed yearly as $2,900')
  await expect(card('growth').getByTestId('plan-billing-note')).toHaveText('billed yearly as $8,900')
  await expect(page.getByTestId('plan-save-badge')).toHaveText(['Save 2 months', 'Save 2 months'])
  await expect(card('enterprise')).not.toContainText('$')
  await expect(card('enterprise').getByTestId('plan-contact-sales')).toBeVisible()
  await pointAt(card('starter'))
  await hideCaption(page)
  await smoothScrollTo(cards.first(), 'center')
  await saveEvidence(page, 'tw-6-yearly', { fullPage: false })

  // Contact sales
  await caption(page, 'Enterprise has no price: "Contact sales" goes to the contact section', step())
  await presentClick(card('enterprise').getByTestId('plan-contact-sales'))
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toBeInViewport()
  await hideCaption(page)
  await saveEvidence(page, 'tw-6-contact-sales', { fullPage: false })
})
