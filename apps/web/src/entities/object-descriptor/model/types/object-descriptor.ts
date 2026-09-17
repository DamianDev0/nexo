import type { ObjectType } from '@repo/shared-types'

export type ObjectDescriptor = {
  readonly type: ObjectType
  readonly apiPath: string
  readonly queryRoot: string
  readonly defaultPinnedColumns: ReadonlyArray<string>
}
