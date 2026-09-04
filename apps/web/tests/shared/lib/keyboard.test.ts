import { describe, expect, it } from 'vitest'

import { formatShortcut, isEditableTarget, matchesShortcut } from '@/shared/lib/keyboard'

describe('formatShortcut', () => {
  it('maps modifier tokens to apple symbols', () => {
    expect(formatShortcut(['mod', 'shift', 'x'], true)).toEqual(['⌘', '⇧', 'X'])
  })

  it('maps modifier tokens to pc labels', () => {
    expect(formatShortcut(['mod', 'shift', 'x'], false)).toEqual(['Ctrl', 'Shift', 'X'])
  })

  it('maps named keys per platform', () => {
    expect(formatShortcut(['enter', 'esc', 'tab'], true)).toEqual(['↵', 'Esc', '⇥'])
    expect(formatShortcut(['enter', 'esc', 'tab'], false)).toEqual(['Enter', 'Esc', 'Tab'])
  })

  it('uppercases single characters and keeps unknown words as-is', () => {
    expect(formatShortcut(['k', 'F2'], true)).toEqual(['K', 'F2'])
  })

  it('accepts literal symbols already resolved', () => {
    expect(formatShortcut(['⌘', 'C'], true)).toEqual(['⌘', 'C'])
  })
})

function keyEvent(overrides: Partial<KeyboardEvent> & { key: string }) {
  return { metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...overrides }
}

describe('matchesShortcut', () => {
  it('resolves mod to meta on apple and ctrl on pc', () => {
    expect(matchesShortcut(keyEvent({ key: 'k', metaKey: true }), ['mod', 'K'], true)).toBe(true)
    expect(matchesShortcut(keyEvent({ key: 'k', ctrlKey: true }), ['mod', 'K'], false)).toBe(true)
    expect(matchesShortcut(keyEvent({ key: 'k', ctrlKey: true }), ['mod', 'K'], true)).toBe(false)
  })

  it('requires modifier flags to match exactly', () => {
    expect(
      matchesShortcut(keyEvent({ key: 'z', metaKey: true, shiftKey: true }), ['mod', 'Z'], true),
    ).toBe(false)
    expect(
      matchesShortcut(
        keyEvent({ key: 'z', metaKey: true, shiftKey: true }),
        ['mod', 'shift', 'Z'],
        true,
      ),
    ).toBe(true)
  })

  it('matches plain single-key shortcuts', () => {
    expect(matchesShortcut(keyEvent({ key: 'f' }), ['F'], true)).toBe(true)
    expect(matchesShortcut(keyEvent({ key: 'f', metaKey: true }), ['F'], true)).toBe(false)
  })

  it('resolves key aliases', () => {
    expect(matchesShortcut(keyEvent({ key: 'Escape' }), ['esc'], true)).toBe(true)
    expect(matchesShortcut(keyEvent({ key: ' ' }), ['space'], true)).toBe(true)
  })

  it('never matches modifier-only combos', () => {
    expect(matchesShortcut(keyEvent({ key: 'Meta', metaKey: true }), ['mod'], true)).toBe(false)
  })
})

describe('isEditableTarget', () => {
  it('detects inputs, textareas and contenteditable', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true)
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true)
    expect(isEditableTarget(document.createElement('div'))).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})
