export interface Metric {
  id: string
  /** The big number, as shown ("72%", "4 s"). */
  value: string
  label: string
  detail: string
}

/** Customer-reported results (fictional figures for a demo). */
export const METRICS: readonly Metric[] = [
  {
    id: 'search-time',
    value: '72%',
    label: 'less time searching',
    detail: 'Nurses get back to patients instead of walking the halls.',
  },
  {
    id: 'rentals',
    value: '$410k',
    label: 'saved on rentals per year',
    detail: 'Idle equipment is found and shared before anyone rents more.',
  },
  {
    id: 'find-time',
    value: '9 s',
    label: 'to find any device',
    detail: 'From typing its name to seeing it on the floor plan.',
  },
]

export const METRICS_FOOTNOTE = 'Customer-reported averages after six months. Fictional figures for a demo.'
