import { describe, expect, it } from 'vitest'

import { resolveAddressKey } from '@/entities/geo/lib/address-keyboard'

describe('resolveAddressKey', () => {
  it('moves down and wraps to the first option', () => {
    expect(resolveAddressKey('ArrowDown', 0, 3)).toEqual({ kind: 'move', index: 1 })
    expect(resolveAddressKey('ArrowDown', 2, 3)).toEqual({ kind: 'move', index: 0 })
  })

  it('moves up and wraps to the last option', () => {
    expect(resolveAddressKey('ArrowUp', 1, 3)).toEqual({ kind: 'move', index: 0 })
    expect(resolveAddressKey('ArrowUp', 0, 3)).toEqual({ kind: 'move', index: 2 })
    expect(resolveAddressKey('ArrowUp', -1, 3)).toEqual({ kind: 'move', index: 2 })
  })

  it('selects only when an option is active', () => {
    expect(resolveAddressKey('Enter', 1, 3)).toEqual({ kind: 'select' })
    expect(resolveAddressKey('Enter', -1, 3)).toEqual({ kind: 'none' })
  })

  it('closes on Escape even without options', () => {
    expect(resolveAddressKey('Escape', -1, 0)).toEqual({ kind: 'close' })
  })

  it('ignores navigation when there are no options', () => {
    expect(resolveAddressKey('ArrowDown', -1, 0)).toEqual({ kind: 'none' })
    expect(resolveAddressKey('Enter', 0, 0)).toEqual({ kind: 'none' })
  })

  it('ignores unrelated keys', () => {
    expect(resolveAddressKey('a', 0, 3)).toEqual({ kind: 'none' })
    expect(resolveAddressKey('Tab', 0, 3)).toEqual({ kind: 'none' })
  })
})
