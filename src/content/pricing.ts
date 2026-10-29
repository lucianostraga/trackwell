import { FREE_MONTHS_PER_YEAR } from '../lib/pricing'

export interface Plan {
  id: 'starter' | 'growth' | 'enterprise'
  name: string
  description: string
  /** Whole USD per month; null when the plan has no list price. */
  monthlyPrice: number | null
  assetLimit: string | null
  mostPopular: boolean
}

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For a single unit or clinic',
    monthlyPrice: 290,
    assetLimit: 'Up to 250 assets',
    mostPopular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For a whole hospital',
    monthlyPrice: 890,
    assetLimit: 'Up to 1,000 assets',
    mostPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom pricing for larger hospitals and health systems',
    monthlyPrice: null,
    assetLimit: null,
    mostPopular: false,
  },
]

export const PRICING_TEXT = {
  eyebrow: 'Pricing',
  title: 'Simple pricing that grows with your fleet',
  description: 'Pick the plan that fits the number of assets you track. Pay monthly, or yearly and get two months free.',
  monthly: 'Monthly',
  yearly: 'Yearly',
  yearlyHint: `${FREE_MONTHS_PER_YEAR} months free`,
  mostPopular: 'Most popular',
  saveBadge: `Save ${FREE_MONTHS_PER_YEAR} months`,
  perMonth: '/month',
  billedMonthly: 'billed monthly',
  billedYearlyAs: 'billed yearly as',
  enterprisePrice: 'Custom',
  enterpriseNote: 'Tailored to your organization',
  bookDemo: 'Book a demo',
  contactSales: 'Contact sales',
} as const
