import type { DataTableBulkLabels } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

export function buildBulkLabels(
  t: TFunction,
  allMatching = false,
  total?: number,
): DataTableBulkLabels {
  return {
    selected: (count) =>
      allMatching
        ? t('contacts.bulk.allMatching', { count: total ?? count })
        : t('common.table.selection.selected', { count }),
    selectAll: (total) => t('common.table.selection.selectAll', { count: total }),
    clear: t('common.table.selection.clear'),
  }
}
