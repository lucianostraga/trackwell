import { sectionHref } from '../lib/sections'
import { SECTION } from './sections'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: readonly FooterLink[]
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: sectionHref(SECTION.product) },
      { label: 'How it works', href: sectionHref(SECTION.howItWorks) },
      { label: "What's new", href: sectionHref(SECTION.whatsNew) },
      { label: 'Book a demo', href: sectionHref(SECTION.contact) },
    ],
  },
  {
    title: 'Customers',
    links: [
      { label: 'Results', href: sectionHref(SECTION.customers) },
      { label: 'Hospitals', href: sectionHref(SECTION.customers) },
      { label: 'Clinical engineering', href: sectionHref(SECTION.product) },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', href: sectionHref(SECTION.contact) },
      { label: 'Security', href: sectionHref(SECTION.product) },
      { label: 'Privacy', href: sectionHref(SECTION.contact) },
    ],
  },
]
