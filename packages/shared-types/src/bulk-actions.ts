export type BulkAction = 'assign' | 'tag' | 'untag' | 'delete' | 'update_status'

export type BulkActionRequest = {
  ids: string[]
  action: BulkAction
  params: Record<string, unknown>
}

export type BulkActionResult = {
  processed: number
  failed: number
  errors: { id: string; message: string }[]
}
