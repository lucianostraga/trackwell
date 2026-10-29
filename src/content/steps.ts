import { MapPinned, RadioTower, Tag, type LucideIcon } from 'lucide-react'

export interface Step {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

/** "How it works", in order. */
export const STEPS: readonly Step[] = [
  {
    id: 'tag',
    title: 'Tag it',
    description: 'Clip a coin-sized tag onto pumps, beds, monitors and wheelchairs. Setup takes seconds per device, no IT ticket.',
    icon: Tag,
  },
  {
    id: 'track',
    title: 'Track it',
    description: 'Ceiling sensors pick up every tag and place it on your floor plan, room by room, updated every few seconds.',
    icon: RadioTower,
  },
  {
    id: 'find',
    title: 'Find it',
    description: 'Search "ventilator" and see the closest available one on the map, with who used it last and when it was cleaned.',
    icon: MapPinned,
  },
]
