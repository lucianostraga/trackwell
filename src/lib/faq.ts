export interface FaqItem {
  id: string
  question: string
  answer: string
}

/** Lowercase, accents removed, whitespace collapsed, trimmed. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Items whose question or answer contains every word of the query. Empty query returns all items. */
export function filterFaq(items: readonly FaqItem[], query: string): FaqItem[] {
  const words = normalizeText(query).split(' ').filter(Boolean)
  if (words.length === 0) return [...items]
  return items.filter((item) => {
    const haystack = normalizeText(`${item.question} ${item.answer}`)
    return words.every((word) => haystack.includes(word))
  })
}
