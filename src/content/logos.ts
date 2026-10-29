import { Cross, HeartPulse, Hospital, Leaf, Sun, Waves, type LucideIcon } from 'lucide-react'

/** How a hospital wordmark is set, so the trust bar looks like a row of real, different logos. */
export type WordmarkStyle = 'sans' | 'serif' | 'caps' | 'rounded'

export interface CustomerLogo {
  id: string
  /** Fictional hospital name. */
  name: string
  icon: LucideIcon
  style: WordmarkStyle
}

/** "Trusted by care teams at" (all fictional). */
export const CUSTOMER_LOGOS: readonly CustomerLogo[] = [
  { id: 'st-aurelia', name: 'St. Aurelia Medical', icon: Cross, style: 'serif' },
  { id: 'wrenfield', name: 'Wrenfield Health', icon: Leaf, style: 'sans' },
  { id: 'kestrel-bay', name: 'Kestrel Bay', icon: Waves, style: 'caps' },
  { id: 'larkhaven', name: "Larkhaven Children's", icon: Sun, style: 'rounded' },
  { id: 'morrow-creek', name: 'Morrow Creek Regional', icon: Hospital, style: 'sans' },
  { id: 'bellhaven', name: 'Bellhaven General', icon: HeartPulse, style: 'serif' },
]
