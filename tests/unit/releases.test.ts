import { describe, expect, it } from 'vitest'
import rawReleases from '../../src/data/releases.json'
import { JIRA_BROWSE_URL, jiraUrl, parseReleases } from '../../src/lib/releases'

describe('parseReleases', () => {
  it('sorts newest first by date, then by PR number', () => {
    const releases = parseReleases([
      { key: 'TW-1', title: 'Old', pr: 1, date: '2026-10-01' },
      { key: 'TW-3', title: 'Same day, later PR', pr: 9, date: '2026-10-20' },
      { key: 'TW-2', title: 'Same day', pr: 4, date: '2026-10-20' },
    ])
    expect(releases.map((r) => r.key)).toEqual(['TW-3', 'TW-2', 'TW-1'])
  })

  it('drops invalid entries instead of failing', () => {
    const releases = parseReleases([
      { key: 'TW-10', title: 'Valid', pr: 10, date: '2026-10-21' },
      { key: 'bad key', title: 'Bad key', pr: 1, date: '2026-10-21' },
      { key: 'TW-11', title: '', pr: 1, date: '2026-10-21' },
      { key: 'TW-12', title: 'Bad PR', pr: '12', date: '2026-10-21' },
      { key: 'TW-13', title: 'Bad date', pr: 13, date: '21/10/2026' },
      null,
      'TW-14',
    ])
    expect(releases.map((r) => r.key)).toEqual(['TW-10'])
  })

  it('keeps only the known fields and trims titles', () => {
    expect(parseReleases([{ key: 'TW-5', title: '  Spaced  ', pr: 5, date: '2026-10-05', extra: true }])).toEqual([
      { key: 'TW-5', title: 'Spaced', pr: 5, date: '2026-10-05' },
    ])
  })

  it('returns an empty list for non-arrays', () => {
    expect(parseReleases({})).toEqual([])
    expect(parseReleases(undefined)).toEqual([])
  })
})

describe('releases.json', () => {
  it('is a plain JSON array of valid releases, newest first', () => {
    expect(Array.isArray(rawReleases)).toBe(true)
    const parsed = parseReleases(rawReleases)
    expect(parsed).toHaveLength(rawReleases.length)
    expect(parsed.map((r) => r.key)).toEqual(rawReleases.map((r) => r.key))
  })

  it('has unique Jira keys', () => {
    const keys = rawReleases.map((r) => r.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('jiraUrl', () => {
  it('links to the Jira issue', () => {
    expect(jiraUrl('TW-195')).toBe('https://lucianostraga.atlassian.net/browse/TW-195')
    expect(jiraUrl('TW-195').startsWith(JIRA_BROWSE_URL)).toBe(true)
  })

  it('accepts a release whose PR number is not known yet (null) and keeps file order on ties', () => {
    expect(
      parseReleases([
        { key: 'TW-9', title: 'Newest', pr: null, date: '2026-10-29' },
        { key: 'TW-5', title: 'Same day', pr: null, date: '2026-10-29' },
        { key: 'TW-4', title: 'Older', pr: null, date: '2026-10-20' },
      ]).map((r) => r.key),
    ).toEqual(['TW-9', 'TW-5', 'TW-4'])
  })
})
