import { describe, expect, it } from 'vitest'
import { STATUS_LABEL, STATUS_ORDER, TYPE_COLOR, TYPE_LABEL, TYPE_ORDER, TYPE_PREFIX, assetName } from '../../src/lib/labels'

describe('labels', () => {
  it('covers every type and status', () => {
    expect(TYPE_ORDER).toHaveLength(7)
    for (const type of TYPE_ORDER) {
      expect(TYPE_LABEL[type]).toBeTruthy()
      expect(TYPE_PREFIX[type]).toMatch(/^[A-Z]{2}$/)
      expect(TYPE_COLOR[type]).toMatch(/^var\(--color-type-/)
    }
    expect(new Set(Object.values(TYPE_PREFIX)).size).toBe(7)
    expect(STATUS_ORDER.map((s) => STATUS_LABEL[s])).toEqual(['In use', 'Available', 'In maintenance'])
  })

  it('names an asset from its type and ID', () => {
    expect(assetName('ventilator', 'VT-03')).toBe('Ventilator 03')
    expect(assetName('infusion-pump', 'IP-104')).toBe('Infusion pump 104')
  })
})
