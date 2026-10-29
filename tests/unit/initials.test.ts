import { describe, expect, it } from 'vitest'
import { initialsOf } from '../../src/lib/initials'

describe('initialsOf', () => {
  it.each([
    ['Dana Whitfield', 'DW'],
    ['maria de la cruz', 'MC'],
    ['Cher', 'C'],
    ['  Jordan   Lee  ', 'JL'],
    ['', ''],
  ])('%s -> %s', (name, expected) => {
    expect(initialsOf(name)).toBe(expected)
  })
})
