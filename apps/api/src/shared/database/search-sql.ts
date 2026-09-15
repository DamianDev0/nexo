export type SearchSource = {
  columns: ReadonlyArray<string>
  customFieldsColumn?: string
  indexed?: { vector: string; text: string }
}

function customFieldsText(column: string): string {
  return `(SELECT COALESCE(string_agg(cf.value, ' '), '') FROM jsonb_each_text(COALESCE(${column}, '{}'::jsonb)) cf)`
}

function bindTerms(q: string, params: unknown[]): { ts: string; like: string } {
  params.push(q)
  const ts = `$${params.length}`
  params.push(`%${q}%`)
  return { ts, like: `$${params.length}` }
}

export function searchClause(q: string, source: SearchSource, params: unknown[]): string {
  const { ts, like } = bindTerms(q, params)
  if (source.indexed) {
    const { vector, text } = source.indexed
    return `(${vector} @@ plainto_tsquery('spanish', ${ts}) OR ${text} ILIKE ${like})`
  }
  const parts = source.columns.map((column) => `COALESCE(${column}::text, '')`)
  if (source.customFieldsColumn) parts.push(customFieldsText(source.customFieldsColumn))
  const haystack = parts.join(" || ' ' || ")
  return `(to_tsvector('spanish', ${haystack}) @@ plainto_tsquery('spanish', ${ts}) OR (${haystack}) ILIKE ${like})`
}
