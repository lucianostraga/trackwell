import type { Plan } from '../lib/pricing'

export interface PlanContent extends Plan {
  description: string
}

export const PLANS: readonly PlanContent[] = [
  { id: 'starter', name: 'Starter', monthlyPrice: 290, assetLimit: 250, highlighted: false, description: 'Live tracking for smaller fleets of equipment.' },
  { id: 'growth', name: 'Growth', monthlyPrice: 890, assetLimit: 1000, highlighted: true, description: 'Live tracking for larger fleets of equipment.' },
  { id: 'enterprise', name: 'Enterprise', monthlyPrice: null, assetLimit: null, highlighted: false, description: 'For hospital groups with custom needs.' },
]
