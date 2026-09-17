import { buildRecordWhereClause, type RecordFilterDefinition } from './record-filter-sql'

type CompanyQuery = {
  q?: string
  archived?: boolean
  city?: string
  tags?: string[]
  unassigned?: boolean
  advanced?: Array<{ field: string; operator: 'is'; value: string }>
}

const DEFINITION: RecordFilterDefinition<CompanyQuery> = {
  activeCondition: 'is_active = true',
  archivedCondition: 'is_active = false',
  search: { columns: ['name', 'nit'] },
  valueFilters: [
    ['city', 'LOWER(city) = LOWER(?)'],
    ['tags', 'tags @> ?::text[]'],
  ],
  flagFilters: [['unassigned', 'assigned_to_id IS NULL']],
  filterableColumns: { city: { column: 'city', type: 'text' } },
}

describe('buildRecordWhereClause', () => {
  it('scopes to active records when nothing else is asked', () => {
    expect(buildRecordWhereClause(DEFINITION, {})).toEqual({
      where: 'is_active = true',
      params: [],
    })
  })

  it('switches to the archived condition of the definition', () => {
    expect(buildRecordWhereClause(DEFINITION, { archived: true }).where).toBe('is_active = false')
  })

  it('binds value filters in order and skips empty ones', () => {
    const { where, params } = buildRecordWhereClause(DEFINITION, {
      city: 'Medellín',
      tags: [],
      unassigned: true,
    })

    expect(where).toBe('is_active = true AND assigned_to_id IS NULL AND LOWER(city) = LOWER($1)')
    expect(params).toEqual(['Medellín'])
  })

  it('numbers search, value and advanced params in one sequence', () => {
    const { where, params } = buildRecordWhereClause(DEFINITION, {
      q: 'acme',
      tags: ['vip'],
      advanced: [{ field: 'city', operator: 'is', value: 'Cali' }],
    })

    expect(where).toContain('$1')
    expect(where).toContain('tags @> $3::text[]')
    expect(where).toContain('LOWER(city) = LOWER($4)')
    expect(params).toEqual(['acme', '%acme%', ['vip'], 'Cali'])
  })

  it('ignores advanced conditions on columns the definition does not expose', () => {
    const { where, params } = buildRecordWhereClause(DEFINITION, {
      advanced: [{ field: 'password_hash', operator: 'is', value: 'x' }],
    })

    expect(where).toBe('is_active = true')
    expect(params).toEqual([])
  })
})
