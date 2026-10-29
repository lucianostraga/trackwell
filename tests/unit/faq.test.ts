import { describe, expect, it } from 'vitest'
import { FAQ } from '../../src/content/faq'
import { filterFaq, normalizeText } from '../../src/lib/faq'
import type { FaqItem } from '../../src/lib/faq'

function makeItem(overrides: Partial<FaqItem> = {}): FaqItem {
  return { id: 'item', question: 'What does Trackwell do?', answer: 'It tracks hospital equipment.', ...overrides }
}

describe('normalizeText', () => {
  it('lowercases letters', () => {
    expect(normalizeText('ABC Trackwell')).toBe('abc trackwell')
  })

  it('removes accents from uppercase letters ("CAFÉ" -> "cafe")', () => {
    expect(normalizeText('CAFÉ')).toBe('cafe')
  })

  it('removes accents from mixed-case words with n and u ("Ñandú" -> "nandu")', () => {
    expect(normalizeText('Ñandú')).toBe('nandu')
  })

  it('removes accents and lowercases ("Ventilátor" -> "ventilator")', () => {
    expect(normalizeText('Ventilátor')).toBe('ventilator')
  })

  it('collapses repeated whitespace and trims the edges', () => {
    expect(normalizeText('  Ventilátor   ICU ')).toBe('ventilator icu')
  })

  it('returns an empty string for an empty string', () => {
    expect(normalizeText('')).toBe('')
  })

  it('returns an empty string for whitespace-only input', () => {
    expect(normalizeText('   ')).toBe('')
  })
})

describe('filterFaq', () => {
  const items = [
    makeItem({ id: 'pricing', question: 'How much is the price of a plan?', answer: 'Monthly plans start low.' }),
    makeItem({ id: 'cafe', question: 'Is there a Café on site?', answer: 'Yes, a small one.' }),
    makeItem({ id: 'integrations', question: 'Which systems does it connect to?', answer: 'It has EHR integrations and a sign-in flow.' }),
    makeItem({ id: 'beds', question: 'Can we tag beds and pumps?', answer: 'Yes, beds, pumps and monitors.' })
  ]

  it('returns all items, in order, for an empty query', () => {
    expect(filterFaq(items, '')).toEqual(items)
  })

  it('returns all items, in order, for a whitespace-only query', () => {
    expect(filterFaq(items, '   ')).toEqual(items)
  })

  it('matches case-insensitively (query "price" finds "Price" in the question)', () => {
    expect(filterFaq(items, 'price')).toEqual([items[0]])
  })

  it('matches accent-insensitively from an accented query to plain text ("PRÍCE" finds "price")', () => {
    expect(filterFaq(items, 'PRÍCE')).toEqual([items[0]])
  })

  it('matches accent-insensitively from a plain query to accented text ("cafe" finds "Café")', () => {
    expect(filterFaq(items, 'cafe')).toEqual([items[1]])
  })

  it('matches partial words ("integr" finds "Integrations")', () => {
    expect(filterFaq(items, 'integr')).toEqual([items[2]])
  })

  it('requires every word of the query to match', () => {
    expect(filterFaq(items, 'ehr sign')).toEqual([items[2]])
    expect(filterFaq(items, 'ehr teleportation')).toEqual([])
  })

  it('lets the words be split between question and answer', () => {
    const mixed = [makeItem({ id: 'split', question: 'How does monitoring work?', answer: 'It tracks pumps in the ICU.' })]
    expect(filterFaq(mixed, 'monitoring icu')).toEqual([mixed[0]])
    expect(filterFaq(mixed, 'monitoring pumps')).toEqual([mixed[0]])
  })

  it('returns an empty array when nothing matches', () => {
    expect(filterFaq(items, 'zzz')).toEqual([])
  })

  it('keeps the original order of the input items', () => {
    const result = filterFaq(items, 'and')
    expect(result.map((item) => item.id)).toEqual(['integrations', 'beds'])
  })

  it('does not mutate the input array', () => {
    const before = [...items.map((item) => item.id)]
    filterFaq(items, 'price')
    filterFaq(items, '')
    expect(items.map((item) => item.id)).toEqual(before)
  })
})

describe('FAQ content', () => {
  it('has 8 to 10 items', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(8)
    expect(FAQ.length).toBeLessThanOrEqual(10)
  })

  it('has unique, non-empty ids', () => {
    const ids = FAQ.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.length > 0)).toBe(true)
  })

  it('has non-empty questions and answers', () => {
    expect(FAQ.every((item) => item.question.trim().length > 0 && item.answer.trim().length > 0)).toBe(true)
  })
})

describe('FAQ pricing answer', () => {
  it('quotes each paid plan with the price and asset limit shown on the pricing cards', () => {
    const answer = FAQ.find((item) => item.id === 'cost')?.answer
    expect(answer).toContain('Starter is $290 per month for up to 250 assets.')
    expect(answer).toContain('Growth is $890 per month for up to 1,000 assets.')
  })
})
