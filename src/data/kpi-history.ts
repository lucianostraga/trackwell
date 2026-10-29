/**
 * Daily fleet snapshots for the previous seven days, oldest first. Today's value is
 * computed live from the assets; the first entry is the "vs last week" baseline.
 */
export const KPI_HISTORY = {
  tracked: [57, 58, 58, 59, 59, 60, 60],
  inUse: [24, 27, 25, 29, 26, 27, 26],
  available: [26, 25, 27, 24, 28, 27, 28],
  maintenance: [7, 6, 6, 6, 5, 6, 6],
  tagsOffline: [6, 5, 5, 4, 6, 5, 3],
} as const satisfies Record<string, readonly number[]>
