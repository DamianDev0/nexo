import { CONTACT_MERGE_FIELDS } from '@repo/shared-types'

import type { ContactListItem, ContactMergeField } from '@repo/shared-types'

export type MergeRow = {
  readonly field: ContactMergeField
  readonly winner: string | null
  readonly loser: string | null
  readonly differs: boolean
}

function readField(contact: ContactListItem, field: ContactMergeField): string | null {
  const value = contact[field]
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text === '' ? null : text
}

export function buildMergeRows(winner: ContactListItem, loser: ContactListItem): MergeRow[] {
  return CONTACT_MERGE_FIELDS.map((field) => {
    const winnerValue = readField(winner, field)
    const loserValue = readField(loser, field)
    return {
      field,
      winner: winnerValue,
      loser: loserValue,
      differs: loserValue !== null && loserValue !== winnerValue,
    }
  })
}

export function decidedRows(rows: ReadonlyArray<MergeRow>): MergeRow[] {
  return rows.filter((row) => row.differs)
}

export function fillGapsFromLoser(rows: ReadonlyArray<MergeRow>): ContactMergeField[] {
  return rows.filter((row) => row.winner === null && row.loser !== null).map((row) => row.field)
}

export function toggleMergeField(
  fields: ReadonlyArray<ContactMergeField>,
  field: ContactMergeField,
): ContactMergeField[] {
  return fields.includes(field) ? fields.filter((entry) => entry !== field) : [...fields, field]
}

export function mergedTags(winner: ContactListItem, loser: ContactListItem): string[] {
  return [...new Set([...winner.tags, ...loser.tags])]
}
