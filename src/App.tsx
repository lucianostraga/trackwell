import { useCallback, useMemo, useState } from 'react'
import { AlertsPanel } from './components/AlertsPanel'
import { AssetDrawer } from './components/AssetDrawer'
import { EquipmentPanel } from './components/EquipmentPanel'
import { FloorPlan } from './components/floor/FloorPlan'
import { Footer } from './components/Footer'
import { KpiRow } from './components/KpiRow'
import { ReleasesPanel } from './components/ReleasesPanel'
import { TopBar } from './components/TopBar'
import { BUILD_INFO } from './config'
import { buildAssets } from './data/assets'
import rawReleases from './data/releases.json'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useNow } from './hooks/useNow'
import { buildAlerts } from './lib/alerts'
import { filterAssets, hasActiveFilters, NO_FILTERS, type AssetFilters } from './lib/filters'
import { computeKpis } from './lib/kpis'
import { parseReleases } from './lib/releases'
import type { AssetType } from './types'

const RELEASES = parseReleases(rawReleases)

export default function App() {
  const now = useNow(1000)
  // Data is anchored to the page-load instant, so "last seen" and "time in zone" move live.
  const [assets] = useState(() => buildAssets(new Date()))
  const [filters, setFilters] = useState<AssetFilters>(NO_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const alertsBesideList = useMediaQuery('(min-width: 1800px)')

  const kpis = useMemo(() => computeKpis(assets, now), [assets, now])
  const alerts = useMemo(() => buildAlerts(assets, now), [assets, now])
  const visible = useMemo(() => filterAssets(assets, filters), [assets, filters])
  const matchingIds = useMemo(() => new Set(visible.map((a) => a.id)), [visible])
  const filtered = hasActiveFilters(filters)
  const drawerAsset = useMemo(() => assets.find((a) => a.id === drawerId) ?? null, [assets, drawerId])

  const openAsset = useCallback((id: string) => {
    setSelectedId(id)
    setDrawerId(id)
  }, [])
  const closeDrawer = useCallback(() => setDrawerId(null), [])
  const setTypeFilter = useCallback((type: AssetType | 'all') => setFilters((f) => ({ ...f, type })), [])

  const alertsPanel = (
    <AlertsPanel
      alerts={alerts}
      assets={assets}
      selectedId={selectedId}
      onSelect={setSelectedId}
      now={now}
      className={alertsBesideList ? 'max-h-[340px] shrink-0' : undefined}
    />
  )

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar now={now} build={BUILD_INFO} />

      <main className="mx-auto w-full max-w-[1880px] flex-1 px-6 pt-6 pb-10 xl:px-8">
        <h1 className="sr-only">Trackwell · live equipment map</h1>
        <KpiRow kpis={kpis} now={now} />

        <div className="mt-6 grid gap-6 wide:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_440px] 3xl:grid-cols-[minmax(0,1fr)_480px]">
          <div className="flex min-w-0 flex-col gap-6">
            <FloorPlan
              assets={assets}
              matchingIds={matchingIds}
              filtered={filtered}
              selectedId={selectedId}
              now={now}
              onSelect={setSelectedId}
              onOpen={openAsset}
              typeFilter={filters.type}
              onTypeFilter={setTypeFilter}
            />
            {!alertsBesideList && alertsPanel}
          </div>
          <div className="relative">
            <div className="flex flex-col gap-6 wide:absolute wide:inset-0">
              <EquipmentPanel
                assets={assets}
                visible={visible}
                filters={filters}
                onFiltersChange={setFilters}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onOpen={openAsset}
                now={now}
                className="max-h-[640px] wide:max-h-none wide:flex-1"
              />
              {alertsBesideList && alertsPanel}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ReleasesPanel releases={RELEASES} />
        </div>
      </main>

      <Footer build={BUILD_INFO} />

      <AssetDrawer asset={drawerAsset} now={now} onClose={closeDrawer} />
    </div>
  )
}
