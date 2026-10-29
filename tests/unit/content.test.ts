import { describe, expect, it } from 'vitest'
import { FEATURES } from '../../src/content/features'
import { FOOTER_COLUMNS } from '../../src/content/footer'
import { HERO } from '../../src/content/hero'
import { CUSTOMER_LOGOS } from '../../src/content/logos'
import { METRICS, METRICS_FOOTNOTE } from '../../src/content/metrics'
import { QUOTE } from '../../src/content/quote'
import { CONTACT_EMAIL, NAV_LINKS, SECTION } from '../../src/content/sections'
import { STEPS } from '../../src/content/steps'
import { isValidNav } from '../../src/lib/sections'

const unique = (values: readonly string[]) => new Set(values).size === values.length
const filled = (value: string) => value.trim() !== ''

describe('page content', () => {
  it('has the three steps in order', () => {
    expect(STEPS.map((s) => s.title)).toEqual(['Tag it', 'Track it', 'Find it'])
  })

  it('has six features with unique ids, text and an icon', () => {
    expect(FEATURES).toHaveLength(6)
    expect(unique(FEATURES.map((f) => f.id))).toBe(true)
    for (const f of FEATURES) {
      expect(filled(f.title) && filled(f.description)).toBe(true)
      expect(f.icon).toBeTruthy()
    }
  })

  it('has five or six customer logos with unique ids', () => {
    expect(CUSTOMER_LOGOS.length).toBeGreaterThanOrEqual(5)
    expect(CUSTOMER_LOGOS.length).toBeLessThanOrEqual(6)
    expect(unique(CUSTOMER_LOGOS.map((l) => l.id))).toBe(true)
  })

  it('has three metrics, labelled as customer-reported', () => {
    expect(METRICS).toHaveLength(3)
    expect(METRICS_FOOTNOTE).toMatch(/customer-reported/i)
  })

  it('has a quote with a name, a role and an organization', () => {
    expect([QUOTE.text, QUOTE.name, QUOTE.role, QUOTE.organization].every(filled)).toBe(true)
  })

  it('has a valid navbar that points at existing sections', () => {
    expect(isValidNav(NAV_LINKS)).toBe(true)
    const ids = Object.values(SECTION) as string[]
    for (const link of NAV_LINKS) expect(ids).toContain(link.id)
  })

  it('only links the footer to sections of this page', () => {
    const ids = Object.values(SECTION) as string[]
    for (const link of FOOTER_COLUMNS.flatMap((c) => c.links)) {
      expect(ids).toContain(link.href.replace(/^#/, ''))
    }
  })

  it('uses a placeholder email domain and a screenshot from public/', () => {
    expect(CONTACT_EMAIL).toBe('sales@trackwell.example')
    expect(HERO.screenshot.file).toBe('product-floorplan.png')
  })
})
