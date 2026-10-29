import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { Locator, Page } from '@playwright/test'
import { EVIDENCE_DIR } from './paths'

/**
 * Helpers that make the recorded video readable on a big screen: a caption naming
 * each step, a visible cursor that glides to its target, smooth scrolling and short
 * pauses. Set E2E_PACE=0 to run without pauses (the assertions are the same).
 */
const PACE = Number(process.env.E2E_PACE ?? 1)

/** Waits `ms` scaled by E2E_PACE. */
export async function pause(page: Page, ms = 700): Promise<void> {
  if (PACE > 0) await page.waitForTimeout(ms * PACE)
}

/** Installs the caption bar and the fake cursor. Call once after page.goto(). */
export async function installPresenter(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (document.getElementById('e2e-caption')) return
    const style = document.createElement('style')
    style.textContent = `
      #e2e-caption { position: fixed; left: 32px; bottom: 32px; z-index: 2147483646; transform: translateY(12px);
        display: flex; align-items: center; gap: 12px; padding: 12px 20px 12px 14px; border-radius: 14px;
        background: rgba(14, 26, 43, 0.92); color: #fff; font: 600 18px/1.3 'Inter Variable', Inter, system-ui, sans-serif;
        box-shadow: 0 12px 40px -8px rgba(14, 26, 43, 0.45); opacity: 0; transition: opacity .25s ease, transform .35s cubic-bezier(.16,1,.3,1);
        pointer-events: none; white-space: nowrap; letter-spacing: -0.01em; }
      #e2e-caption.on { opacity: 1; transform: translateY(0); }
      #e2e-caption .step { padding: 3px 9px; border-radius: 8px; background: #0e8478; font-size: 13px; letter-spacing: .02em; }
      #e2e-cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; width: 22px; height: 22px; margin: -3px 0 0 -3px;
        pointer-events: none; transition: transform .08s linear; }
      #e2e-cursor.click::after { content: ''; position: absolute; left: -9px; top: -9px; width: 24px; height: 24px; border-radius: 50%;
        border: 2px solid #0e8478; animation: e2e-ripple .45s ease-out forwards; }
      @keyframes e2e-ripple { from { transform: scale(.4); opacity: 1 } to { transform: scale(1.6); opacity: 0 } }
    `
    document.head.appendChild(style)

    const caption = document.createElement('div')
    caption.id = 'e2e-caption'
    caption.setAttribute('aria-hidden', 'true')
    document.body.appendChild(caption)

    const cursor = document.createElement('div')
    cursor.id = 'e2e-cursor'
    cursor.setAttribute('aria-hidden', 'true')
    cursor.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2.5 19.5 12l-7 1.6L9 20.5z" fill="#0e1a2b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    document.body.appendChild(cursor)
    window.addEventListener(
      'mousemove',
      (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      },
      { passive: true },
    )
    window.addEventListener('mousedown', () => {
      cursor.classList.remove('click')
      void cursor.offsetWidth
      cursor.classList.add('click')
    })
  })
}

/** Returns "Step 1", "Step 2", ... on each call, to number captions in order. */
export function createStepCounter(): () => string {
  let n = 0
  return () => `Step ${++n}`
}

/** Shows a caption such as "Step 3 · Open VT-07". */
export async function caption(page: Page, text: string, step?: string): Promise<void> {
  await page.evaluate(
    ({ text, step }) => {
      const el = document.getElementById('e2e-caption')
      if (!el) return
      el.replaceChildren()
      if (step) {
        const badge = document.createElement('span')
        badge.className = 'step'
        badge.textContent = step
        el.appendChild(badge)
      }
      el.appendChild(document.createTextNode(text))
      el.classList.add('on')
    },
    { text, step },
  )
  await pause(page, 1500)
}

export async function hideCaption(page: Page): Promise<void> {
  await page.evaluate(() => document.getElementById('e2e-caption')?.classList.remove('on'))
  await pause(page, 300)
}

/** Scrolls smoothly until the element is centered, then pauses. */
export async function smoothScrollTo(locator: Locator, block: ScrollLogicalPosition = 'center'): Promise<void> {
  await locator.evaluate((el, block) => el.scrollIntoView({ behavior: 'smooth', block }), block)
  await locator.page().waitForTimeout(PACE > 0 ? 1100 * PACE : 300)
}

/** Scrolls the page smoothly to the top. */
export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(PACE > 0 ? 1100 * PACE : 300)
}

/** Glides the visible cursor to the element's center. */
export async function pointAt(locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) return
  await locator.page().mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: PACE > 0 ? 24 : 1 })
  await pause(locator.page(), 350)
}

/** Points at the element, then clicks it. */
export async function presentClick(locator: Locator): Promise<void> {
  await pointAt(locator)
  await locator.click()
  await pause(locator.page(), 800)
}

/** Types like a person would. */
export async function presentType(locator: Locator, text: string): Promise<void> {
  await pointAt(locator)
  await locator.click()
  await locator.pressSequentially(text, { delay: PACE > 0 ? 120 * PACE : 0 })
  await pause(locator.page(), 900)
}

/**
 * Saves evidence/<name>.png (full page). The caption and cursor are hidden so the
 * screenshot shows only the product.
 */
export async function saveEvidence(page: Page, name: string, options: { fullPage?: boolean } = {}): Promise<string> {
  await mkdir(EVIDENCE_DIR, { recursive: true })
  const file = path.join(EVIDENCE_DIR, `${name}.png`)
  await page.evaluate(() => {
    for (const id of ['e2e-caption', 'e2e-cursor']) {
      const el = document.getElementById(id)
      if (el) el.style.visibility = 'hidden'
    }
  })
  await page.screenshot({ path: file, fullPage: options.fullPage ?? true, animations: 'disabled' })
  await page.evaluate(() => {
    for (const id of ['e2e-caption', 'e2e-cursor']) {
      const el = document.getElementById(id)
      if (el) el.style.visibility = ''
    }
  })
  return file
}
