import { describe, expect, it } from 'vitest'

import { insertLink, toggleLinePrefix, wrapInline } from '@/shared/lib/text-markup'

describe('wrapInline', () => {
  it('wraps the selection with the marker', () => {
    expect(wrapInline('hola mundo', { start: 5, end: 10 }, '**')).toEqual({
      value: 'hola **mundo**',
      start: 7,
      end: 12,
    })
  })

  it('unwraps when the marker already surrounds the selection', () => {
    expect(wrapInline('hola **mundo**', { start: 7, end: 12 }, '**')).toEqual({
      value: 'hola mundo',
      start: 5,
      end: 10,
    })
  })

  it('unwraps when the selection includes the markers', () => {
    expect(wrapInline('hola **mundo**', { start: 5, end: 14 }, '**')).toEqual({
      value: 'hola mundo',
      start: 5,
      end: 10,
    })
  })

  it('wraps an empty selection leaving the caret inside', () => {
    expect(wrapInline('hola ', { start: 5, end: 5 }, '_')).toEqual({
      value: 'hola __',
      start: 6,
      end: 6,
    })
  })
})

describe('toggleLinePrefix', () => {
  it('adds bullet prefixes to every selected line', () => {
    expect(toggleLinePrefix('uno\ndos', { start: 0, end: 7 }, 'bullet')).toEqual({
      value: '- uno\n- dos',
      start: 2,
      end: 11,
    })
  })

  it('removes bullet prefixes when all lines already have one', () => {
    expect(toggleLinePrefix('- uno\n- dos', { start: 2, end: 11 }, 'bullet')).toEqual({
      value: 'uno\ndos',
      start: 0,
      end: 7,
    })
  })

  it('numbers lines sequentially', () => {
    expect(toggleLinePrefix('uno\ndos\ntres', { start: 0, end: 12 }, 'numbered').value).toBe(
      '1. uno\n2. dos\n3. tres',
    )
  })

  it('removes numbered prefixes on toggle', () => {
    expect(toggleLinePrefix('1. uno\n2. dos', { start: 3, end: 13 }, 'numbered').value).toBe(
      'uno\ndos',
    )
  })

  it('prefixes the full line even when the caret is mid-line', () => {
    expect(toggleLinePrefix('hola mundo', { start: 7, end: 7 }, 'bullet').value).toBe(
      '- hola mundo',
    )
  })
})

describe('insertLink', () => {
  it('wraps the selection in markdown link syntax and selects the url placeholder', () => {
    const result = insertLink('mira esto', { start: 5, end: 9 })
    expect(result.value).toBe('mira [esto](https://)')
    expect(result.value.slice(result.start, result.end)).toBe('https://')
  })
})
