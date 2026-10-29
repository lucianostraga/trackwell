import { readFileSync } from 'node:fs'
import { parseReleases } from '../src/lib/releases'
import { expect, test } from '@playwright/test'
import {
  caption,
  createStepCounter,
  hideCaption,
  installPresenter,
  pause,
  pointAt,
  presentClick,
  saveEvidence,
  scrollToTop,
  smoothScrollTo,
} from './support/presenter'

const rawReleases = JSON.parse(
  readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8'),
) as Array<{ key: string }>

/**
 * Walkthrough of the Trackwell website, top to bottom. Saves evidence/home.png (full page),
 * evidence/hero.png, evidence/how-it-works.png, evidence/features.png, evidence/whats-new.png
 * and evidence/contact.png; the video is copied to evidence/home.webm.
 */

test('a hospital visitor reads the Trackwell website and books a demo', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find any piece of hospital equipment in seconds')
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  // Hero
  await caption(page, 'Trackwell: find any piece of hospital equipment in seconds', step())
  const screenshot = page.getByTestId('product-frame').getByRole('img')
  await expect(screenshot).toBeVisible()
  expect(await screenshot.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(page.getByTestId('hero-book-demo')).toBeVisible()
  await expect(page.getByTestId('customer-logo')).toHaveCount(6)
  const nav = page.getByRole('navigation', { name: 'Main' })
  for (const label of ['Product', 'How it works', 'Customers', 'Pricing']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible()
  }
  await pointAt(screenshot)
  await hideCaption(page)
  await saveEvidence(page, 'hero', { fullPage: false })

  // How it works
  await caption(page, '"See how it works" jumps to the three steps', step())
  await presentClick(page.getByTestId('hero-how-it-works'))
  await expect(page).toHaveURL(/#how-it-works$/)
  const steps = page.getByTestId('how-step')
  await expect(steps).toHaveCount(3)
  await expect(steps.getByRole('heading', { level: 3 })).toHaveText(['Tag it', 'Track it', 'Find it'])
  await expect(page.getByTestId('how-it-works').getByRole('heading', { level: 2 })).toBeInViewport()
  await pointAt(steps.nth(2))
  await hideCaption(page)
  await saveEvidence(page, 'how-it-works', { fullPage: false })

  // Features
  await caption(page, 'Six features for nurses, engineering and sterile processing', step())
  const features = page.getByTestId('feature-card')
  await smoothScrollTo(page.getByTestId('features'))
  await expect(features).toHaveCount(6)
  await pointAt(features.first())
  await pointAt(features.last())
  await hideCaption(page)
  await saveEvidence(page, 'features', { fullPage: false })

  // Customers
  await caption(page, 'Customer-reported results and a quote from a nursing director', step())
  await smoothScrollTo(page.getByTestId('metrics'))
  await expect(page.getByTestId('metric')).toHaveCount(3)
  await expect(page.getByTestId('metrics-footnote')).toContainText('Customer-reported')
  await smoothScrollTo(page.getByTestId('customer-quote'))
  await expect(page.getByTestId('customer-quote')).toContainText('Director of Nursing')
  await hideCaption(page)

  // What's new
  await caption(page, "What's new: every shipped change links to its Jira ticket", step())
  await smoothScrollTo(page.getByTestId('release-list'))
  const items = page.getByTestId('release-item')
  await expect(items).toHaveCount(rawReleases.length)
  await expect(page.getByTestId('release-count')).toHaveText(`${rawReleases.length} releases shipped`)
  const newest = page.getByTestId('release-link').first()
  await expect(newest).toHaveText(parseReleases(rawReleases)[0]!.key)
  await expect(newest).toHaveAttribute('href', `https://lucianostraga.atlassian.net/browse/${parseReleases(rawReleases)[0]!.key}`)
  await pointAt(newest)
  await hideCaption(page)
  await saveEvidence(page, 'whats-new', { fullPage: false })

  // Book a demo
  await caption(page, '"Book a demo" in the navbar scrolls to the contact section', step())
  await scrollToTop(page)
  await presentClick(page.getByTestId('nav-book-demo'))
  await expect(page).toHaveURL(/#contact$/)
  const contact = page.locator('#contact')
  await expect(contact.getByRole('heading', { level: 2 })).toBeInViewport()
  const email = page.getByTestId('contact-email')
  await expect(email).toHaveAttribute('href', 'mailto:sales@trackwell.example')
  await pointAt(email)
  await hideCaption(page)
  await saveEvidence(page, 'contact', { fullPage: false })

  // Footer and the whole page
  await caption(page, 'Footer with the build that is running', step())
  await smoothScrollTo(page.getByTestId('site-footer'), 'end')
  await expect(page.getByTestId('site-footer')).toContainText('© 2026 Trackwell (fictional company for a demo)')
  await expect(page.getByTestId('build-env')).toHaveText(/^(local|production|preview)$/)
  await pause(page, 600)
  await hideCaption(page)
  await scrollToTop(page)
  await saveEvidence(page, 'home')
})
