import { type QueryRunner } from 'typeorm'

const SEPARATORS = `'[.\\s-]'`

export interface DocumentCollisionRow {
  id: string
  first_name: string
  last_name: string | null
  document_type: string | null
  document_number: string
  normalized: string
  is_active: boolean
}

export interface DocumentCollision {
  normalized: string
  active: boolean
  contacts: ReadonlyArray<{
    id: string
    name: string
    documentType: string | null
    stored: string
    clean: boolean
  }>
}

export async function findDocumentCollisionRows(
  runner: QueryRunner,
  schema: string,
): Promise<DocumentCollisionRow[]> {
  return (await runner.query(
    `WITH normalized AS (
       SELECT id, first_name, last_name, document_type, document_number, is_active,
              regexp_replace(document_number, ${SEPARATORS}, '', 'g') AS normalized
       FROM "${schema}".contacts
       WHERE document_number IS NOT NULL
     ),
     dirty AS (
       SELECT DISTINCT normalized, is_active FROM normalized WHERE document_number <> normalized
     )
     SELECT n.id, n.first_name, n.last_name, n.document_type, n.document_number,
            n.normalized, n.is_active
     FROM normalized n
     JOIN dirty d ON d.normalized = n.normalized AND d.is_active = n.is_active
     ORDER BY n.normalized, n.is_active DESC, (n.document_number = n.normalized) DESC, n.id`,
  )) as DocumentCollisionRow[]
}

export function groupDocumentCollisions(
  rows: ReadonlyArray<DocumentCollisionRow>,
): DocumentCollision[] {
  const groups = new Map<string, DocumentCollision>()
  for (const row of rows) {
    const key = `${row.normalized}:${row.is_active}`
    const group = groups.get(key) ?? {
      normalized: row.normalized,
      active: row.is_active,
      contacts: [],
    }
    groups.set(key, {
      ...group,
      contacts: [
        ...group.contacts,
        {
          id: row.id,
          name: [row.first_name, row.last_name].filter(Boolean).join(' '),
          documentType: row.document_type,
          stored: row.document_number,
          clean: row.document_number === row.normalized,
        },
      ],
    })
  }
  return [...groups.values()]
}
