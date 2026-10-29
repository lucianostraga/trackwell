import { expect, test, type Page } from '@playwright/test'
import {
  caption,
  createStepCounter,
  hideCaption,
  installPresenter,
  pause,
  pointAt,
  presentClick,
  presentType,
  saveEvidence,
  scrollToTop,
  smoothScrollTo,
} from './support/presenter'

/**
 * Walkthrough of the live equipment map. Saves evidence/dashboard.png,
 * evidence/floor-plan-tooltip.png, evidence/map-highlight.png and evidence/asset-drawer.png;
 * the video is copied to evidence/dashboard.webm.
 */

const numberIn = async (page: Page, testId: string, inner: string) =>
  Number((await page.getByTestId(testId).getByTestId(inner).innerText()).replace(/[^\d.]/g, ''))

test('clinical engineer finds equipment on the live floor plan', async ({ page }) => {
  const step = createStepCounter()
  await page.goto('/')
  await expect(page.getByTestId('floor-plan')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await installPresenter(page)

  const mapAssets = page.getByTestId('map-asset')
  const rows = page.getByTestId('equipment-row')
  const search = page.getByRole('searchbox', { name: 'Search equipment' })

  // KPIs
  await caption(page, 'Trackwell: where is every piece of equipment right now?', step())
  await expect(page.getByTestId('current-floor')).toHaveText('Level 2 · Critical Care')
  await expect(page.getByTestId('live-indicator')).toHaveText('Live')
  await expect(page.getByTestId('signed-in-user')).toContainText('Jordan Lee')
  for (const id of ['tracked', 'in-use', 'available', 'maintenance', 'tags-offline']) {
    await expect(page.getByTestId(`kpi-${id}`).getByTestId('kpi-value')).toHaveText(/^\d+$/)
    await expect(page.getByTestId(`kpi-${id}`).getByTestId('kpi-delta')).toBeVisible()
  }
  const tracked = await numberIn(page, 'kpi-tracked', 'kpi-value')
  const inUse = await numberIn(page, 'kpi-in-use', 'kpi-value')
  const available = await numberIn(page, 'kpi-available', 'kpi-value')
  const maintenance = await numberIn(page, 'kpi-maintenance', 'kpi-value')
  expect(inUse + available + maintenance).toBe(tracked)
  expect(await numberIn(page, 'status-tab-in-use', 'status-tab-count')).toBe(inUse)
  expect(await numberIn(page, 'status-tab-available', 'status-tab-count')).toBe(available)
  await pointAt(page.getByTestId('kpi-in-use'))
  await pointAt(page.getByTestId('kpi-tags-offline'))
  await hideCaption(page)
  await saveEvidence(page, 'dashboard')

  // Floor plan
  await caption(page, 'The live floor plan: every dot is a piece of equipment', step())
  await expect(mapAssets).toHaveCount(tracked)
  await expect(page.getByTestId('zone-label')).toHaveCount(9)
  await expect(page.getByTestId('map-legend').getByTestId('legend-type')).toHaveCount(7)
  await pointAt(page.getByTestId('map-frame'))
  await pause(page, 1200)

  // Hover a dot
  await caption(page, 'Point at a dot to see what it is and where', step())
  const ventilator = page.locator('[data-testid="map-asset"][data-asset-id="VT-02"]')
  await pointAt(ventilator)
  const tooltip = page.getByTestId('map-tooltip')
  await expect(tooltip).toBeVisible()
  await expect(tooltip.getByTestId('tooltip-name')).toHaveText('Ventilator 02')
  await expect(tooltip.getByTestId('tooltip-zone')).toHaveText('Radiology')
  await expect(tooltip).toContainText('In use')
  await pause(page, 1400)
  await hideCaption(page)
  await saveEvidence(page, 'floor-plan-tooltip', { fullPage: false })

  // Search the list and see it on the map
  await caption(page, 'Search the list for ventilator VT-07', step())
  await presentType(search, 'VT-07')
  await expect(rows).toHaveCount(1)
  await expect(page.getByTestId('map-filter-note')).toHaveText('Highlighting 1 of 60')
  await expect(page.locator('[data-testid="map-asset"][data-dimmed="false"]')).toHaveCount(1)

  await caption(page, 'Select it: the map zooms in and highlights it', step())
  await presentClick(rows.first().getByRole('button', { name: /Show Ventilator 07 on the map/ }))
  const selectedDot = page.locator('[data-testid="map-asset"][data-asset-id="VT-07"]')
  await expect(selectedDot).toHaveAttribute('data-selected', 'true')
  const callout = page.getByTestId('map-callout')
  await expect(callout).toBeVisible()
  await expect(callout).toContainText('Ventilator 07')
  await expect(callout).toContainText('Ward B')
  await pause(page, 1500)
  await hideCaption(page)
  await saveEvidence(page, 'map-highlight', { fullPage: false })

  // Drawer
  await caption(page, 'Open the details: location history, home department, tag battery', step())
  await presentClick(page.getByTestId('row-details'))
  const drawer = page.getByTestId('asset-drawer')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByTestId('drawer-asset-id')).toHaveText('VT-07')
  await expect(drawer.getByTestId('drawer-zone')).toHaveText('Ward B')
  await expect(drawer.getByTestId('drawer-home')).toHaveText('ICU')
  await expect(drawer.getByTestId('drawer-battery')).toHaveText('87%')
  await expect(drawer.getByTestId('drawer-last-seen')).toHaveText('just now')
  await expect(drawer.getByTestId('history-entry')).toHaveCount(3)
  await expect(drawer.getByTestId('history-entry').first()).toContainText('Now')
  await pause(page, 1500)
  await hideCaption(page)
  await saveEvidence(page, 'asset-drawer', { fullPage: false })

  await caption(page, 'Close with Esc and show the whole floor again', step())
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await presentClick(page.getByRole('button', { name: 'Clear search' }))
  await expect(search).toHaveValue('')
  await presentClick(page.getByTestId('map-reset'))
  await expect(page.getByTestId('map-callout')).toBeHidden()
  await expect(page.locator('[data-testid="map-asset"][data-selected="true"]')).toHaveCount(0)

  // Alerts
  await caption(page, 'Alerts: tags that stopped reporting for 30+ minutes', step())
  const alertsPanel = page.getByTestId('alerts-panel')
  await smoothScrollTo(alertsPanel)
  const alerts = page.getByTestId('alert-item')
  const offline = await numberIn(page, 'kpi-tags-offline', 'kpi-value')
  await expect(alerts).toHaveCount(offline)
  await expect(page.locator('[data-testid="alert-item"]:not([data-kind="tag-offline"])')).toHaveCount(0)
  await expect(alerts.first()).toContainText('Tag offline')
  const alertAsset = await alerts.first().getAttribute('data-asset-id')
  await presentClick(alerts.first())
  await expect(page.locator(`[data-testid="map-asset"][data-asset-id="${alertAsset}"]`)).toHaveAttribute('data-selected', 'true')
  await expect(page.locator(`[data-testid="map-asset"][data-asset-id="${alertAsset}"]`)).toHaveAttribute('data-offline', 'true')
  await smoothScrollTo(page.getByTestId('floor-plan'))
  await pause(page, 1400)
  await presentClick(page.getByTestId('map-reset'))

  // Recently shipped
  await caption(page, 'Recently shipped: each release links to its Jira ticket', step())
  await smoothScrollTo(page.getByTestId('releases-panel'))
  const releaseLinks = page.getByTestId('release-link')
  expect(await releaseLinks.count()).toBeGreaterThanOrEqual(3)
  await expect(releaseLinks.first()).toHaveAttribute('href', /^https:\/\/lucianostraga\.atlassian\.net\/browse\/[A-Z]+-\d+$/)
  await pointAt(releaseLinks.first())
  await pause(page, 1000)

  // Build info
  await caption(page, 'Build info: commit, build time and environment', step())
  await smoothScrollTo(page.getByTestId('app-footer'), 'end')
  await expect(page.getByTestId('app-footer')).toContainText('© 2026 Trackwell (fictional product for a demo)')
  await expect(page.getByTestId('build-sha')).not.toBeEmpty()
  const environment = await page.getByTestId('environment-badge').getAttribute('data-environment')
  await expect(page.getByTestId('build-env')).toHaveText(environment!)
  await pointAt(page.getByTestId('build-info'))
  await pause(page, 1200)

  await hideCaption(page)
  await scrollToTop(page)
  await pause(page, 800)
})
