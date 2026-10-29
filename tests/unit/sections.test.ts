import { describe, expect, it } from 'vitest'
import { isValidNav, sectionHref } from '../../src/lib/sections'

describe('sectionHref', () => {
  it('links to a section by id', () => {
    expect(sectionHref('how-it-works')).toBe('#how-it-works')
    expect(sectionHref('contact')).toBe('#contact')
  })

  it('rejects ids that are not lowercase slugs', () => {
    expect(() => sectionHref('How it works')).toThrow()
    expect(() => sectionHref('')).toThrow()
    expect(() => sectionHref('#contact')).toThrow()
  })
})

describe('isValidNav', () => {
  it('accepts unique, labelled links', () => {
    expect(isValidNav([{ id: 'product', label: 'Product' }, { id: 'contact', label: 'Contact' }])).toBe(true)
    expect(isValidNav([])).toBe(true)
  })

  it('rejects duplicated ids, empty labels and bad ids', () => {
    expect(isValidNav([{ id: 'product', label: 'A' }, { id: 'product', label: 'B' }])).toBe(false)
    expect(isValidNav([{ id: 'product', label: '  ' }])).toBe(false)
    expect(isValidNav([{ id: 'Product', label: 'Product' }])).toBe(false)
  })
})
