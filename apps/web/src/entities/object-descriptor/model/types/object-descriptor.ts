import type { AppIcon } from '@/shared/ui/icons'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  ObjectType,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'
import type { QueryClient } from '@tanstack/react-query'

export type RecordBase = { readonly id: string }

export type RecordDealLink = { readonly contactId?: string; readonly companyId?: string }

export type ObjectRecordApi = {
  update(id: string, patch: Record<string, unknown>): Promise<unknown>
  archive(id: string): Promise<unknown>
  restore(id: string): Promise<unknown>
}

export type RecordImportRun = {
  readonly fileId: string
  readonly mapping: Readonly<Record<string, string | null>>
  readonly duplicateStrategy?: DuplicateStrategy
}

export type ObjectImportConfig = {
  analyze(file: File): Promise<AnalyzeResult>
  preview(run: RecordImportRun): Promise<ValidationPreview>
  validate(run: RecordImportRun): Promise<ValidationReport>
  execute(run: RecordImportRun): Promise<ImportResult>
  readonly fieldLabelKey: string
  readonly matchNoteKey: string
  readonly template: {
    readonly headers: ReadonlyArray<string>
    readonly sample: ReadonlyArray<string>
  }
}

export type ObjectRoutes = {
  readonly list: string
  readonly import: string | null
  readonly listSettings: string | null
  detail(id: string): string
}

export type ObjectDescriptor<TRecord extends RecordBase = RecordBase> = {
  readonly type: ObjectType
  readonly apiPath: string
  readonly queryRoot: string
  readonly defaultPinnedColumns: ReadonlyArray<string>
  readonly icon: AppIcon
  readonly searchPlaceholderKey: string
  readonly api: ObjectRecordApi
  readonly routes: ObjectRoutes
  readonly imports: ObjectImportConfig | null
  displayName(record: TRecord): string
  dealLink(id: string): RecordDealLink | null
  invalidateRecords(client: QueryClient, id?: string): Promise<void>
  revalidate(): Promise<void>
}
