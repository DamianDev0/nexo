'use client'

import { useBoardHotkeys } from './useBoardHotkeys'

import type { BulkActionsController } from '@/features/bulk-actions'
import type { DataTableInstance } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

type BoardKeyboardArgs = {
  readonly instance: DataTableInstance<ContactListItem>
  readonly bulk: BulkActionsController
  readonly editors: {
    readonly sheetOpen: boolean
    readonly previewOpen: boolean
    readonly openCreate: () => void
  }
  readonly clearSelection: () => void
}

export function useBoardKeyboard({
  instance,
  bulk,
  editors,
  clearSelection,
}: BoardKeyboardArgs): void {
  useBoardHotkeys({
    onCreate: editors.openCreate,
    enabled: !editors.sheetOpen && !editors.previewOpen && bulk.dialogs.open === null,
    selection: {
      active: instance.selection.active,
      pageSelected: instance.table.getIsAllPageRowsSelected(),
      selectPage: () => instance.table.toggleAllPageRowsSelected(true),
      selectAll: bulk.bar.onSelectAll,
      clear: clearSelection,
    },
  })
}
