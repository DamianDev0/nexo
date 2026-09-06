import type { DataTableBulkLabels, SelectionBannerLabels } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

export function buildBulkLabels(t: TFunction, selectedOverride?: number): DataTableBulkLabels {
  return {
    selected: (count) => t('common.table.selection.selected', { count: selectedOverride ?? count }),
    clear: t('common.table.selection.clear'),
  }
}

export function buildSelectionBannerLabels(t: TFunction): SelectionBannerLabels {
  return {
    pageSelected: (count) => t('common.table.selection.pageSelected', { count }),
    allSelected: (total) => t('common.table.selection.allSelected', { count: total }),
    selectAll: (total) => t('common.table.selection.selectAll', { count: total }),
    clear: t('common.table.selection.clear'),
  }
}
