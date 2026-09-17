import type { ObjectColumnDef, ObjectType } from '@repo/shared-types'

export interface ObjectTableDefinition<TSortField extends string = string> {
  type: ObjectType
  columns: ReadonlyArray<ObjectColumnDef<TSortField>>
}
