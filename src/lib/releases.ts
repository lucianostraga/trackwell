/** The "Recently shipped" timeline, read from src/data/releases.json. */

export interface Release {
  /** Jira issue key, e.g. "TW-195". */
  key: string
  title: string
  /** Pull request number that shipped it; null until the agent knows it (the PR is opened after the change). */
  pr: number | null
  /** Ship date, YYYY-MM-DD. */
  date: string
}

export const JIRA_BROWSE_URL = 'https://lucianostraga.atlassian.net/browse/'

export function jiraUrl(key: string): string {
  return `${JIRA_BROWSE_URL}${encodeURIComponent(key)}`
}

const KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRelease(value: unknown): value is Release {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.key === 'string' &&
    KEY_PATTERN.test(r.key) &&
    typeof r.title === 'string' &&
    r.title.trim() !== '' &&
    (r.pr === null || (typeof r.pr === 'number' && Number.isInteger(r.pr) && r.pr > 0)) &&
    typeof r.date === 'string' &&
    DATE_PATTERN.test(r.date) &&
    !Number.isNaN(Date.parse(r.date))
  )
}

/**
 * Validates the raw JSON and returns the releases newest first (by date, then by PR
 * number, then file order). Invalid entries are dropped so one bad edit cannot break the dashboard.
 */
export function parseReleases(raw: unknown): Release[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(isRelease)
    .map(({ key, title, pr, date }) => ({ key, title: title.trim(), pr, date }))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.pr ?? 0) - (a.pr ?? 0))
}
