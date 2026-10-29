import { formatInteger, formatUsd } from '../lib/format'
import { ASSET_LIMITS, HOURLY_COST_LIMITS, MINUTES_SAVED_PER_ASSET_PER_MONTH } from '../lib/savings'

/** Texts of the savings calculator. The numbers come from the rules in src/lib/savings.ts. */
export const SAVINGS_COPY = {
  eyebrow: 'Savings calculator',
  title: 'See what Trackwell saves your hospital',
  description: 'Enter how much equipment you track and what an hour of nursing time costs you.',
  assetsLabel: 'Tracked assets',
  assetsHint: `${formatInteger(ASSET_LIMITS.min)} to ${formatInteger(ASSET_LIMITS.max)}`,
  hourlyCostLabel: 'Average nurse hourly cost (USD)',
  hourlyCostHint: `${formatUsd(HOURLY_COST_LIMITS.min)} to ${formatUsd(HOURLY_COST_LIMITS.max)}`,
  hoursLabel: 'Hours saved per month',
  moneyLabel: 'Saved per year',
  hoursUnit: 'hours',
  placeholder: '—',
  invalidNote: 'Fix the highlighted field to see your savings.',
  validNote: 'Updated as you type.',
  footnote: `Based on ${MINUTES_SAVED_PER_ASSET_PER_MONTH} minutes of searching saved per tracked asset each month.`,
} as const
