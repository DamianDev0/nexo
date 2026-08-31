import { advancedFilterClauses, type FilterableColumn } from './advanced-filter-sql'

const COLUMNS: Readonly<Record<string, FilterableColumn>> = {
  email: { column: 'email', type: 'text' },
  status: { column: 'status', type: 'select' },
  tags: { column: 'tags', type: 'multi' },
  leadScore: { column: 'lead_score', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' },
}

describe('advancedFilterClauses', () => {
  it('builds parameterized clauses per field type', () => {
    const params: unknown[] = ['seed']
    const clauses = advancedFilterClauses(
      [
        { field: 'email', operator: 'contains', value: 'acme' },
        { field: 'status', operator: 'is_any_of', value: ['new', 'client'] },
        { field: 'tags', operator: 'is_any_of', value: ['vip'] },
        { field: 'leadScore', operator: 'gte', value: 50 },
        { field: 'createdAt', operator: 'lte', value: '2026-01-01' },
      ],
      COLUMNS,
      params,
    )

    expect(clauses).toEqual([
      'email ILIKE $2',
      'status = ANY($3::text[])',
      'tags && $4::text[]',
      'lead_score >= $5',
      'created_at <= $6',
    ])
    expect(params).toEqual(['seed', '%acme%', ['new', 'client'], ['vip'], 50, '2026-01-01'])
  })

  it('never interpolates field names — unknown fields are dropped', () => {
    const params: unknown[] = []
    const clauses = advancedFilterClauses(
      [
        { field: 'email; DROP TABLE contacts', operator: 'is', value: 'x' },
        { field: 'is_active', operator: 'is', value: 'false' },
      ],
      COLUMNS,
      params,
    )
    expect(clauses).toEqual([])
    expect(params).toEqual([])
  })

  it('binds custom field keys as parameters, rejecting malformed keys', () => {
    const params: unknown[] = []
    const clauses = advancedFilterClauses(
      [
        { field: 'custom.presupuesto', operator: 'is', value: '5000' },
        { field: "custom.x'; --", operator: 'is', value: 'x' },
      ],
      COLUMNS,
      params,
    )
    expect(clauses).toEqual(["LOWER(custom_fields->>$1) = LOWER($2)"])
    expect(params).toEqual(['presupuesto', '5000'])
  })

  it('rejects operators that do not belong to the field type', () => {
    const params: unknown[] = []
    const clauses = advancedFilterClauses(
      [{ field: 'leadScore', operator: 'contains', value: '5' }],
      COLUMNS,
      params,
    )
    expect(clauses).toEqual([])
  })

  it('handles empty checks without consuming parameters', () => {
    const params: unknown[] = []
    const clauses = advancedFilterClauses(
      [
        { field: 'email', operator: 'is_empty' },
        { field: 'tags', operator: 'is_not_empty' },
        { field: 'createdAt', operator: 'is_empty' },
      ],
      COLUMNS,
      params,
    )
    expect(clauses).toEqual([
      "(email IS NULL OR email = '')",
      "(tags IS NOT NULL AND tags <> '{}')",
      'created_at IS NULL',
    ])
    expect(params).toEqual([])
  })

  it('skips value-requiring conditions with no value', () => {
    const params: unknown[] = []
    expect(
      advancedFilterClauses([{ field: 'email', operator: 'is' }], COLUMNS, params),
    ).toEqual([])
  })
})
