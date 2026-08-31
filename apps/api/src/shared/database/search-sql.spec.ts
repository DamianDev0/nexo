import { searchClause, type SearchSource } from './search-sql'

describe('searchClause', () => {
  const source: SearchSource = { columns: ['first_name', 'email'] }

  it('binds the term for full-text and progressive ILIKE matching', () => {
    const params: unknown[] = []
    const clause = searchClause('caro', source, params)

    expect(params).toEqual(['caro', '%caro%'])
    expect(clause).toContain("plainto_tsquery('spanish', $1)")
    expect(clause).toContain('ILIKE $2')
  })

  it('wraps every column in COALESCE over a text cast', () => {
    const params: unknown[] = []
    const clause = searchClause('x', source, params)

    expect(clause).toContain("COALESCE(first_name::text, '')")
    expect(clause).toContain("COALESCE(email::text, '')")
  })

  it('appends custom field values when configured', () => {
    const params: unknown[] = []
    const clause = searchClause('x', { ...source, customFieldsColumn: 'custom_fields' }, params)

    expect(clause).toContain("jsonb_each_text(COALESCE(custom_fields, '{}'::jsonb))")
    expect(clause).toContain('string_agg(cf.value')
  })

  it('continues numbering from existing params', () => {
    const params: unknown[] = ['prior']
    const clause = searchClause('ana', source, params)

    expect(clause).toContain('$2')
    expect(clause).toContain('$3')
    expect(params).toEqual(['prior', 'ana', '%ana%'])
  })
})
