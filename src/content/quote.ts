export interface CustomerQuote {
  text: string
  name: string
  role: string
  /** Fictional hospital. */
  organization: string
}

export const QUOTE: CustomerQuote = {
  text: 'Our nurses used to spend the first hour of every shift hunting for infusion pumps. Now they open Trackwell, walk to the nearest one, and get on with caring for patients.',
  name: 'Dana Whitfield',
  role: 'Director of Nursing',
  organization: 'St. Aurelia Medical Center',
}
