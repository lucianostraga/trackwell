import { expect, test } from '@playwright/test'
import { caption, createStepCounter, hideCaption, installPresenter, pause, pointAt, presentClick, saveEvidence, scrollToTop } from './support/presenter'

/**
 * Book a demo form walkthrough. Saves evidence/tw-7-form.png, tw-7-blur-errors.png,
 * tw-7-invalid-submit.png and tw-7-confirmation.png; the video is copied to evidence/tw-7.webm.
 */

test('a hospital visitor books a demo with a validated form', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const t = (id: string) => page.getByTestId(id)
  const typeInto = async (id: string, text: string) => {
    const input = t(id)
    await pointAt(input)
    await input.click()
    await input.pressSequentially(text, { delay: 70 })
    await pause(page, 400)
  }

  await caption(page, 'The "Book a demo" button leads to the form', step())
  await presentClick(t('nav-book-demo'))
  await expect(page).toHaveURL(/#contact$/)
  await expect(t('demo-form')).toBeVisible()
  await expect(t('demo-submit')).toHaveText('Request a demo')
  await expect(t('contact-email')).toHaveAttribute('href', 'mailto:sales@trackwell.example')
  await pause(page, 900)
  await hideCaption(page)
  await saveEvidence(page, 'tw-7-form', { fullPage: false })

  await caption(page, 'Leaving a field shows what to fix', step())
  await typeInto('demo-fullName', 'A')
  await expect(t('demo-fullName-error')).toHaveCount(0)
  await page.keyboard.press('Tab')
  await expect(t('demo-fullName-error')).toHaveText('Enter your full name (at least 2 characters).')
  await expect(t('demo-fullName')).toHaveAttribute('aria-invalid', 'true')
  await typeInto('demo-email', 'ana@GMAIL.com')
  await page.keyboard.press('Tab')
  await expect(t('demo-email-error')).toHaveText("Use your work email. Personal addresses like gmail.com aren't accepted.")
  await pause(page, 600)
  await hideCaption(page)
  await saveEvidence(page, 'tw-7-blur-errors', { fullPage: false })

  await caption(page, 'Sending an incomplete form points to every problem', step())
  await t('demo-fullName').fill('Ana María López')
  await expect(t('demo-fullName-error')).toHaveCount(0)
  await t('demo-email').fill('ana.lopez@stmarys-hospital.org')
  await expect(t('demo-email-error')).toHaveCount(0)
  await typeInto('demo-beds', '0')
  await presentClick(t('demo-submit'))
  await expect(t('demo-hospital-error')).toBeVisible()
  await expect(t('demo-role-error')).toHaveText('Choose your role.')
  await expect(t('demo-beds-error')).toHaveText('Enter the number of beds as a whole number from 1 to 5,000.')
  await expect(t('demo-hospital')).toBeFocused()
  await expect(t('demo-confirmation')).toHaveCount(0)
  await pause(page, 600)
  await hideCaption(page)
  await saveEvidence(page, 'tw-7-invalid-submit', { fullPage: false })

  await caption(page, 'A complete form shows the confirmation', step())
  await typeInto('demo-hospital', "St. Mary's Hospital")
  await t('demo-role').selectOption('Nursing leadership')
  await t('demo-beds').fill('5,000')
  await expect(t('demo-hospital-error')).toHaveCount(0)
  await expect(t('demo-role-error')).toHaveCount(0)
  await expect(t('demo-beds-error')).toHaveCount(0)
  await presentClick(t('demo-submit'))
  await expect(t('demo-confirmation')).toHaveText("Thanks, Ana! We'll reach out within one business day.")
  await expect(t('demo-confirmation')).toBeFocused()
  await expect(t('demo-form')).toHaveCount(0)
  await pause(page, 900)
  await hideCaption(page)
  await saveEvidence(page, 'tw-7-confirmation', { fullPage: false })
  await scrollToTop(page)
})
