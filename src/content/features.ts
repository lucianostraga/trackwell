import { BellRing, ChartColumn, Map, Plug, ShieldCheck, SprayCan, type LucideIcon } from 'lucide-react'

export interface Feature {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

/** The product features grid, in display order. */
export const FEATURES: readonly Feature[] = [
  {
    id: 'live-floor-plan',
    title: 'Live floor plan',
    description: 'Every tagged device on an interactive map of your building, refreshed in real time and filterable by type or status.',
    icon: Map,
  },
  {
    id: 'alerts',
    title: 'Smart alerts',
    description: 'Know when a ventilator leaves the ICU, a tag goes quiet or a unit is overdue for service, before anyone has to ask.',
    icon: BellRing,
  },
  {
    id: 'utilization',
    title: 'Utilization insights',
    description: 'See which equipment sits idle and which is always in demand, so you rent less and buy only what you need.',
    icon: ChartColumn,
  },
  {
    id: 'cleaning',
    title: 'Cleaning workflow',
    description: 'Used devices are flagged for sterile processing automatically and only show as available once they are clean.',
    icon: SprayCan,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connects to your EHR, work-order and nurse-call systems, with single sign-on and an open API for everything else.',
    icon: Plug,
  },
  {
    id: 'security',
    title: 'Security built in',
    description: 'Encrypted end to end, role-based access and full audit trails. No patient data ever touches a tag.',
    icon: ShieldCheck,
  },
]
