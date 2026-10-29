import { describe, expect, it } from 'vitest'
import { ASSET_BLUEPRINTS } from '../../src/data/asset-blueprints'
import { buildAssets } from '../../src/data/assets'
import { KPI_HISTORY } from '../../src/data/kpi-history'
import { computeKpis } from '../../src/lib/kpis'
import { TYPE_PREFIX } from '../../src/lib/labels'
import { distance } from '../../src/lib/geometry'
import { countByZone, isInZone, zoneById } from '../../src/lib/zones'
import type { Asset } from '../../src/types'
import { NOW } from './fixtures'

/**
 * Invariants of the demo dataset: what the data contains (locations, home departments,
 * timestamps, tag batteries, usage). They describe data, not product rules.
 */
const assets = buildAssets(NOW)
const MINUTE = 60_000
const t = (iso: string) => new Date(iso).getTime()
const minutesBefore = (iso: string) => Math.round((NOW.getTime() - t(iso)) / MINUTE)
const ids = (list: readonly Asset[]) => list.map((a) => a.id).sort()
const byId = (id: string) => assets.find((a) => a.id === id)!

describe('buildAssets', () => {
  it('builds 60 assets with unique IDs that match their type', () => {
    expect(assets).toHaveLength(60)
    expect(new Set(assets.map((a) => a.id)).size).toBe(60)
    for (const a of assets) expect(a.id, a.id).toMatch(new RegExp(`^${TYPE_PREFIX[a.type]}-\\d{2,3}$`))
  })

  it('is deterministic and anchored to the given instant', () => {
    expect(buildAssets(NOW)).toEqual(assets)
    const later = buildAssets(new Date(NOW.getTime() + 60 * MINUTE))
    expect(later.map((a) => a.id)).toEqual(assets.map((a) => a.id))
    expect(t(later[0]!.lastSeenAt) - t(assets[0]!.lastSeenAt)).toBe(60 * MINUTE)
  })

  it('keeps every asset internally consistent', () => {
    for (const a of assets) {
      expect(isInZone(a.position, zoneById(a.zone)!), `${a.id} position`).toBe(true)
      expect(a.history[0], a.id).toEqual({ zone: a.zone, enteredAt: a.zoneEnteredAt })
      const times = a.history.map((h) => t(h.enteredAt))
      expect(times, a.id).toEqual([...times].sort((x, y) => y - x))
      expect(new Set(times).size, a.id).toBe(times.length)
      for (let i = 1; i < a.history.length; i++) expect(a.history[i]!.zone, a.id).not.toBe(a.history[i - 1]!.zone)
      expect(t(a.lastSeenAt), a.id).toBeGreaterThanOrEqual(t(a.zoneEnteredAt))
      expect(t(a.lastSeenAt), a.id).toBeLessThanOrEqual(NOW.getTime())
      expect(a.batteryPct, a.id).toBeGreaterThanOrEqual(0)
      expect(a.batteryPct, a.id).toBeLessThanOrEqual(100)
      expect(a.usageMinutes24h, a.id).toBeGreaterThanOrEqual(0)
      expect(a.usageMinutes24h, a.id).toBeLessThanOrEqual(1440)
    }
  })

  it('never puts two assets on top of each other', () => {
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        expect(distance(assets[i]!.position, assets[j]!.position), `${assets[i]!.id} / ${assets[j]!.id}`).toBeGreaterThan(2.4)
      }
    }
  })

  it('matches its blueprints one to one', () => {
    expect(assets.map((a) => a.id)).toEqual(ASSET_BLUEPRINTS.map((b) => b.id))
  })
})

describe('fleet snapshot', () => {
  it('has the documented totals', () => {
    expect(computeKpis(assets, NOW)).toEqual({
      tracked: 60,
      inUse: 28,
      available: 27,
      maintenance: 5,
      tagsOffline: 4,
      inUseShare: (28 / 60) * 100,
      zonesCovered: 10,
    })
    expect(KPI_HISTORY.tracked).toHaveLength(7)
  })

  it('has the documented mix of types and zones', () => {
    const count = (type: Asset['type']) => assets.filter((a) => a.type === type).length
    expect([
      count('infusion-pump'),
      count('wheelchair'),
      count('patient-monitor'),
      count('ventilator'),
      count('hospital-bed'),
      count('defibrillator'),
      count('portable-ultrasound'),
    ]).toEqual([16, 10, 10, 7, 8, 5, 4])
    expect(countByZone(assets)).toEqual({
      emergency: 9,
      radiology: 4,
      'operating-rooms': 3,
      'sterile-processing': 2,
      'nurses-station': 9,
      icu: 12,
      'ward-a': 7,
      'ward-b': 6,
      pharmacy: 1,
      'central-supply': 7,
    })
  })
})

describe('dataset scenarios', () => {
  it('has ventilators and defibrillators outside their home zone for different amounts of time', () => {
    const away = assets
      .filter((a) => (a.type === 'ventilator' || a.type === 'defibrillator') && a.zone !== a.homeZone)
      .map((a) => [a.id, a.status, a.zone, a.homeZone, minutesBefore(a.zoneEnteredAt)])
      .sort((x, y) => (x[4] as number) - (y[4] as number))
    expect(away).toEqual([
      ['DF-02', 'available', 'ward-a', 'emergency', 6],
      ['VT-02', 'in-use', 'radiology', 'icu', 14],
      ['DF-04', 'available', 'radiology', 'icu', 52],
      ['VT-05', 'in-use', 'emergency', 'icu', 205],
      ['DF-03', 'available', 'nurses-station', 'operating-rooms', 550],
      ['VT-07', 'available', 'ward-b', 'icu', 1560],
      ['VT-06', 'maintenance', 'central-supply', 'icu', 2880],
    ])
    const home = assets.filter((a) => (a.type === 'ventilator' || a.type === 'defibrillator') && a.zone === a.homeZone)
    expect(ids(home)).toEqual(['DF-01', 'DF-05', 'VT-01', 'VT-03', 'VT-04'])
  })

  it('has tag batteries from 3% to 100%, several under 20% and a few under 10%', () => {
    const levels = assets.map((a) => a.batteryPct)
    expect(Math.min(...levels)).toBe(3)
    expect(Math.max(...levels)).toBe(100)
    expect(ids(assets.filter((a) => a.batteryPct < 10))).toEqual(['IP-111', 'PM-09', 'WC-07'])
    expect(ids(assets.filter((a) => a.batteryPct >= 10 && a.batteryPct < 20))).toEqual([
      'DF-03',
      'HB-06',
      'IP-114',
      'US-02',
      'VT-04',
    ])
    expect(ids(assets.filter((a) => a.batteryPct === 20))).toEqual(['PM-04'])
  })

  it('has available assets used after their last cleaning, and others cleaned since', () => {
    const available = assets.filter((a) => a.status === 'available')
    const usedAfter = available.filter(
      (a) => a.lastUseEndedAt !== null && (a.lastCleanedAt === null || t(a.lastUseEndedAt) > t(a.lastCleanedAt)),
    )
    expect(ids(usedAfter)).toEqual(['HB-07', 'IP-107', 'PM-06', 'US-03', 'WC-03'])
    expect(byId('HB-07').lastCleanedAt).toBeNull()
    const cleanedSince = available.filter(
      (a) => a.lastUseEndedAt !== null && a.lastCleanedAt !== null && t(a.lastCleanedAt) > t(a.lastUseEndedAt),
    )
    expect(cleanedSince).toHaveLength(20)
    expect(available.filter((a) => a.lastUseEndedAt === null).map((a) => [a.id, a.lastCleanedAt === null])).toEqual([
      ['DF-04', false],
      ['IP-110', true],
    ])
  })

  it('has several available assets of the same type at different places', () => {
    const where = (type: Asset['type']) =>
      assets.filter((a) => a.status === 'available' && a.type === type).map((a) => `${a.id}@${a.zone}`).sort()
    expect(where('infusion-pump')).toEqual([
      'IP-107@ward-a',
      'IP-108@nurses-station',
      'IP-110@pharmacy',
      'IP-111@central-supply',
      'IP-113@sterile-processing',
      'IP-114@radiology',
    ])
    expect(where('wheelchair')).toEqual([
      'WC-02@nurses-station',
      'WC-03@emergency',
      'WC-05@nurses-station',
      'WC-06@central-supply',
      'WC-09@ward-a',
      'WC-10@ward-b',
    ])
    expect(where('defibrillator')).toEqual([
      'DF-01@emergency',
      'DF-02@ward-a',
      'DF-03@nurses-station',
      'DF-04@radiology',
      'DF-05@ward-b',
    ])
    expect(where('portable-ultrasound')).toEqual(['US-01@ward-a', 'US-03@emergency', 'US-04@sterile-processing'])
    expect(byId('IP-102')).toMatchObject({ zone: 'emergency', status: 'maintenance' })
  })

  it('has a realistic spread of 24h usage per type', () => {
    const total = (type: Asset['type']) =>
      assets.filter((a) => a.type === type).reduce((sum, a) => sum + a.usageMinutes24h, 0)
    expect({
      'infusion-pump': total('infusion-pump'),
      wheelchair: total('wheelchair'),
      'patient-monitor': total('patient-monitor'),
      ventilator: total('ventilator'),
      'hospital-bed': total('hospital-bed'),
      defibrillator: total('defibrillator'),
      'portable-ultrasound': total('portable-ultrasound'),
    }).toEqual({
      'infusion-pump': 7655,
      wheelchair: 860,
      'patient-monitor': 7850,
      ventilator: 6555,
      'hospital-bed': 9325,
      defibrillator: 18,
      'portable-ultrasound': 660,
    })
    for (const a of assets.filter((x) => x.status === 'available')) {
      const ended = a.lastUseEndedAt === null ? Infinity : minutesBefore(a.lastUseEndedAt)
      if (ended > 1440) expect(a.usageMinutes24h, a.id).toBe(0)
    }
  })

  it('has four tags offline and one that reported 28 minutes ago', () => {
    const silent = assets
      .map((a) => [a.id, minutesBefore(a.lastSeenAt)] as const)
      .filter(([, m]) => m >= 10)
      .sort((x, y) => y[1] - x[1])
    expect(silent).toEqual([
      ['PM-09', 380],
      ['HB-05', 130],
      ['WC-02', 47],
      ['IP-112', 34],
      ['IP-106', 28],
    ])
  })

  it('has equipment being moved along the corridor', () => {
    const moving = assets.filter((a) => a.zone === 'nurses-station' && a.status === 'in-use')
    expect(ids(moving)).toEqual(['HB-04', 'WC-01', 'WC-04'])
  })
})
