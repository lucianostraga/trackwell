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
 * TW-9 · FAQ with search. Saves evidence/tw-9-list.png, tw-9-one-open.png, tw-9-search.png and
 * tw-9-no-results.png; the video is copied to evidence/tw-9.webm.
 */

test('a visitor searches the FAQ and opens one answer at a time', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const items = page.getByTestId('faq-item')
  const questions = page.getByTestId('faq-question')
  const search = page.getByTestId('faq-search')

  await caption(page, 'The FAQ link in the navbar jumps to the questions', step())
  await presentClick(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'FAQ', exact: true }))
  await expect(page).toHaveURL(/#faq$/)
  await expect(page.getByTestId('faq').getByRole('heading', { level: 2 })).toBeInViewport()
  expect(await items.count()).toBeGreaterThanOrEqual(8)
  await expect(page.locator('[data-testid="faq-question"][aria-expanded="true"]')).toHaveCount(0)
  await expect(page.getByTestId('faq-answer')).toHaveCount(0)
  await expect(page.getByTestId('faq-count')).toHaveText(`${await items.count()} questions`)
  await hideCaption(page)
  await saveEvidence(page, 'tw-9-list', { fullPage: false })

  await caption(page, 'Only one answer is open at a time', step())
  await presentClick(questions.nth(0))
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('faq-answer')).toHaveCount(1)
  await expect(items.nth(0).getByTestId('faq-answer')).toBeVisible()
  await presentClick(questions.nth(2))
  await expect(questions.nth(2)).toHaveAttribute('aria-expanded', 'true')
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('[data-testid="faq-question"][aria-expanded="true"]')).toHaveCount(1)
  await expect(items.nth(2).getByTestId('faq-answer')).toBeVisible()
  await expect(items.nth(0).getByTestId('faq-answer')).toHaveCount(0)
  await hideCaption(page)
  await saveEvidence(page, 'tw-9-one-open', { fullPage: false })

  await caption(page, 'Searching "PRÍCE" (capitals and accent) finds the pricing question', step())
  const total = await items.count()
  await search.click()
  await search.pressSequentially('PRÍCE', { delay: 120 })
  await expect(search).toHaveValue('PRÍCE')
  const found = await items.count()
  expect(found).toBeGreaterThan(0)
  expect(found).toBeLessThan(total)
  await expect(page.getByTestId('faq-count')).toHaveText(found === 1 ? '1 question' : `${found} questions`)
  await expect(page.getByTestId('faq')).toContainText('What is the price of each plan?')
  await expect(page.locator('[data-testid="faq-question"][aria-expanded="true"]')).toHaveCount(0)
  await pointAt(items.first())
  await hideCaption(page)
  await saveEvidence(page, 'tw-9-search', { fullPage: false })

  await caption(page, 'No match: a message and a link to ask us directly', step())
  await search.fill('')
  // The answer that was open before the search stays closed when the full list comes back.
  await expect(items).toHaveCount(total)
  await expect(page.locator('[data-testid="faq-question"][aria-expanded="true"]')).toHaveCount(0)
  await search.pressSequentially('teleportation', { delay: 80 })
  await expect(items).toHaveCount(0)
  const empty = page.getByTestId('faq-empty')
  await expect(empty).toHaveText('No answers for "teleportation". Ask us directly')
  await expect(page.getByTestId('faq-empty-contact')).toHaveAttribute('href', '#contact')
  await expect(page.getByTestId('faq-count')).toHaveText('0 questions')
  await smoothScrollTo(page.getByTestId('faq'), 'start')
  await expect(empty).toBeInViewport()
  await saveEvidence(page, 'tw-9-no-results', { fullPage: false })
  await presentClick(page.getByTestId('faq-empty-contact'))
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toBeInViewport()
  await hideCaption(page)
})
