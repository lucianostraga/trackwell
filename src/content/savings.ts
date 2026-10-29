import { MINUTES_SAVED_PER_ASSET_PER_MONTH } from '../lib/savings'

export const SAVINGS_TEXT = {
  eyebrow: 'Savings calculator',
  title: 'What would Trackwell save you?',
  description: 'Enter how many assets you track and what an hour of nursing time costs. See the time and money you get back.',
  assetsLabel: 'Tracked assets',
  assetsHint: '10 to 20,000',
  hourlyCostLabel: 'Average nurse hourly cost (USD)',
  hourlyCostHint: '$20 to $200',
  hoursLabel: 'Hours saved per month',
  dollarsLabel: 'Saved per year',
  empty: '—',
  footnote: `Based on ${MINUTES_SAVED_PER_ASSET_PER_MONTH} minutes of searching saved per asset each month.`,
} as const
