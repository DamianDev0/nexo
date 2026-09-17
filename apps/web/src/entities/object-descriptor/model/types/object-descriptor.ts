import type { ObjectType } from '@repo/shared-types'
import type { QueryClient } from '@tanstack/react-query'

export type RecordBase = { readonly id: string }

export type RecordDealLink = { readonly contactId?: string; readonly companyId?: string }

export type ObjectRecordApi = {
  update(id: string, patch: Record<string, unknown>): Promise<unknown>
  archive(id: string): Promise<unknown>
  restore(id: string): Promise<unknown>
}

export type ObjectDescriptor<TRecord extends RecordBase = RecordBase> = {
  readonly type: ObjectType
  readonly apiPath: string
  readonly queryRoot: string
  readonly defaultPinnedColumns: ReadonlyArray<string>
  readonly api: ObjectRecordApi
  displayName(record: TRecord): string
  dealLink(id: string): RecordDealLink | null
  invalidateRecords(client: QueryClient, id?: string): Promise<void>
}
