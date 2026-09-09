import { describe, expect, it } from 'vitest'

import { clearedFieldsToNull } from '@/entities/contact'

describe('clearedFieldsToNull', () => {
  it('turns an emptied field into an explicit null the API accepts', () => {
    expect(clearedFieldsToNull({ lastName: '' })).toEqual({ lastName: null })
    expect(clearedFieldsToNull({ email: '   ' })).toEqual({ email: null })
  })

  it('keeps real values untouched, including ones that only look empty', () => {
    expect(clearedFieldsToNull({ firstName: 'Laura', city: 'Cali' })).toEqual({
      firstName: 'Laura',
      city: 'Cali',
    })
    expect(clearedFieldsToNull({ lastName: ' Jiménez ' })).toEqual({ lastName: ' Jiménez ' })
  })

  it('leaves an already-null clear alone and never invents keys', () => {
    expect(clearedFieldsToNull({ source: null })).toEqual({ source: null })
    expect(clearedFieldsToNull({})).toEqual({})
  })

  it('clears the city and its municipality code together', () => {
    expect(clearedFieldsToNull({ city: '', municipioCode: '' })).toEqual({
      city: null,
      municipioCode: null,
    })
  })
})
