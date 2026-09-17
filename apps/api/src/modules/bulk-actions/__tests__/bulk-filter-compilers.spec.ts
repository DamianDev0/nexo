import { BULK_FILTER_COMPILERS } from '../constants/bulk-action.constants'

describe('BULK_FILTER_COMPILERS', () => {
  it('compiles a contact filter with the same rules as the contact list', () => {
    const compile = BULK_FILTER_COMPILERS.contacts

    expect(compile?.({ status: 'lost', archived: true })).toEqual({
      where: 'is_active = false AND merged_into_id IS NULL AND status = $1',
      params: ['lost'],
    })
  })

  it('leaves entities without a filter definition out of filter selection', () => {
    expect(BULK_FILTER_COMPILERS.deals).toBeUndefined()
  })
})
