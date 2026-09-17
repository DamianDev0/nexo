import type { RecordBase } from '@/entities/object-descriptor'

export type RecordFieldsChange = {
  readonly id: string
  readonly patch: Readonly<Record<string, unknown>>
}

export type RecordCustomFieldsChange = {
  readonly id: string
  readonly customFields: Readonly<Record<string, unknown>>
}

export type RecordStatusChange = { readonly id: string; readonly status: string }

export type RecordOwnerChange = {
  readonly id: string
  readonly assignedToId: string | null
  readonly assignedToName: string | null
}

export type RecordTagsChange = { readonly id: string; readonly tags: ReadonlyArray<string> }

type WithCustomFields = { readonly customFields?: Readonly<Record<string, unknown>> }

export function isSameRecord(record: RecordBase, change: { readonly id: string }): boolean {
  return record.id === change.id
}

export function applyFields<TRecord extends RecordBase>(
  record: TRecord,
  change: RecordFieldsChange,
): TRecord {
  return { ...record, ...change.patch }
}

export function applyCustomFields<TRecord extends RecordBase & WithCustomFields>(
  record: TRecord,
  change: RecordCustomFieldsChange,
): TRecord {
  const merged = { ...record.customFields, ...change.customFields }
  const customFields = Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== null && value !== undefined),
  )
  return { ...record, customFields }
}

export function applyStatus<TRecord extends RecordBase>(
  record: TRecord,
  change: RecordStatusChange,
): TRecord {
  return { ...record, status: change.status, statusChangedAt: new Date().toISOString() }
}

export function applyOwner<TRecord extends RecordBase>(
  record: TRecord,
  change: RecordOwnerChange,
): TRecord {
  return { ...record, assignedToId: change.assignedToId, assignedToName: change.assignedToName }
}

export function applyTags<TRecord extends RecordBase>(
  record: TRecord,
  change: RecordTagsChange,
): TRecord {
  return { ...record, tags: [...change.tags] }
}
