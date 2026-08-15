import type { DataTableBulkLabels } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

export function buildBulkLabels(t: TFunction): DataTableBulkLabels {
  return {
    selected: (count) => t('common.table.selection.selected', { count }),
    selectAll: (total) => t('common.table.selection.selectAll', { count: total }),
    clear: t('common.table.selection.clear'),
  }
}
