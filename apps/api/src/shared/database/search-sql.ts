export type SearchSource = {
  columns: ReadonlyArray<string>
  customFieldsColumn?: string
}

function customFieldsText(column: string): string {
  return `(SELECT COALESCE(string_agg(cf.value, ' '), '') FROM jsonb_each_text(COALESCE(${column}, '{}'::jsonb)) cf)`
}

export function searchClause(q: string, source: SearchSource, params: unknown[]): string {
  const parts = source.columns.map((column) => `COALESCE(${column}::text, '')`)
  if (source.customFieldsColumn) parts.push(customFieldsText(source.customFieldsColumn))
  const haystack = parts.join(" || ' ' || ")
  params.push(q)
  const tsParam = `$${params.length}`
  params.push(`%${q}%`)
  const likeParam = `$${params.length}`
  return `(to_tsvector('spanish', ${haystack}) @@ plainto_tsquery('spanish', ${tsParam}) OR (${haystack}) ILIKE ${likeParam})`
}
