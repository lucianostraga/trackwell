import { describe, expect, it } from 'vitest'
import {
  NO_FILTERS,
  countByStatus,
  countByType,
  filterAssets,
  hasActiveFilters,
  matchesQuery,
  sortAssets,
} from '../../src/lib/filters'
import { makeAsset } from './fixtures'

const pump = makeAsset({ id: 'IP-104', name: 'Infusion pump 104', type: 'infusion-pump', status: 'in-use' })
const pump9 = makeAsset({ id: 'IP-9', name: 'Infusion pump 9', type: 'infusion-pump', status: 'available' })
const vent = makeAsset({ id: 'VT-03', name: 'Ventilator 03', type: 'ventilator', status: 'available' })
const chair = makeAsset({ id: 'WC-12', name: 'Wheelchair 12', type: 'wheelchair', status: 'maintenance' })
const all = [vent, chair, pump, pump9]

describe('matchesQuery', () => {
  it.each(['IP-104', 'ip104', 'ip 104', 'pump 104', 'INFUSION', ''])('"%s" finds Infusion pump 104', (q) => {
    expect(matchesQuery(pump, q)).toBe(true)
  })

  it('does not match other assets', () => {
    expect(matchesQuery(vent, 'pump')).toBe(false)
    expect(matchesQuery(pump, 'VT-03')).toBe(false)
  })
})

describe('filterAssets', () => {
  it('combines search, type and status, in list order', () => {
    expect(filterAssets(all, NO_FILTERS).map((a) => a.id)).toEqual(['IP-9', 'IP-104', 'WC-12', 'VT-03'])
    expect(filterAssets(all, { ...NO_FILTERS, type: 'infusion-pump' }).map((a) => a.id)).toEqual(['IP-9', 'IP-104'])
    expect(filterAssets(all, { ...NO_FILTERS, status: 'available' }).map((a) => a.id)).toEqual(['IP-9', 'VT-03'])
    expect(filterAssets(all, { query: 'pump', type: 'all', status: 'in-use' }).map((a) => a.id)).toEqual(['IP-104'])
    expect(filterAssets(all, { query: 'nothing', type: 'all', status: 'all' })).toEqual([])
  })

  it('sorts by type order, then by ID with numbers in numeric order', () => {
    expect(sortAssets([pump, pump9]).map((a) => a.id)).toEqual(['IP-9', 'IP-104'])
  })
})

describe('counts and state', () => {
  it('counts by status and type', () => {
    expect(countByStatus(all)).toEqual({ all: 4, 'in-use': 1, available: 2, maintenance: 1 })
    expect(countByType(all)).toMatchObject({ 'infusion-pump': 2, ventilator: 1, wheelchair: 1, defibrillator: 0 })
  })

  it('knows when a filter is active', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...NO_FILTERS, query: '   ' })).toBe(false)
    expect(hasActiveFilters({ ...NO_FILTERS, query: 'vt' })).toBe(true)
    expect(hasActiveFilters({ ...NO_FILTERS, type: 'wheelchair' })).toBe(true)
    expect(hasActiveFilters({ ...NO_FILTERS, status: 'maintenance' })).toBe(true)
  })
})
