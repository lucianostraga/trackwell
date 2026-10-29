import type { SectionLink } from '../lib/sections'

/** Section ids used across the page (anchors, navbar, tests). */
export const SECTION = {
  product: 'product',
  howItWorks: 'how-it-works',
  customers: 'customers',
  whatsNew: 'whats-new',
  contact: 'contact',
} as const

/** Navbar links, in order. */
export const NAV_LINKS: readonly SectionLink[] = [
  { id: SECTION.product, label: 'Product' },
  { id: SECTION.howItWorks, label: 'How it works' },
  { id: SECTION.customers, label: 'Customers' },
]

export const CONTACT_EMAIL = 'sales@trackwell.example'
