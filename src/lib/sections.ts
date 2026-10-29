/** In-page navigation: every section has an id, and links point at it with "#id". */

export interface SectionLink {
  /** The target section's element id, e.g. "how-it-works". */
  id: string
  label: string
}

const ID_PATTERN = /^[a-z][a-z0-9-]*$/

/** "#how-it-works". Fragment links work under any base path, so no base is needed. */
export function sectionHref(id: string): string {
  if (!ID_PATTERN.test(id)) throw new Error(`Invalid section id: "${id}"`)
  return `#${id}`
}

/** True when every link has a valid, unique id and a non-empty label. */
export function isValidNav(links: readonly SectionLink[]): boolean {
  const ids = links.map((l) => l.id)
  return (
    links.every((l) => ID_PATTERN.test(l.id) && l.label.trim() !== '') && new Set(ids).size === ids.length
  )
}
