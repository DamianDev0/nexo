'use client'

import { t } from 'i18next'
import { useCallback, useState } from 'react'
import { sileo } from 'sileo'

import { buildImportFieldDefs, toImportRows, updateImportRow } from '../lib/header-import'
import { useAnalyzeHeaders } from '../query/useAnalyzeHeaders'
import { useCustomFieldsAdmin } from '../query/useCustomFieldsAdmin'

import type { HeaderImportRow } from '../lib/header-import'
import type { CustomFieldEntity, CustomFieldHeaderAnalysis } from '@repo/shared-types'

export function useHeaderImport(entity: CustomFieldEntity) {
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState<CustomFieldHeaderAnalysis | null>(null)
  const [rows, setRows] = useState<HeaderImportRow[]>([])
  const admin = useCustomFieldsAdmin(entity)
  const analyze = useAnalyzeHeaders(entity)

  const openImport = useCallback(() => {
    setAnalysis(null)
    setRows([])
    setOpen(true)
  }, [])

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setAnalysis(null)
      setRows([])
    }
  }, [])

  const upload = useCallback(
    async (file: File) => {
      const result = await analyze.mutateAsync(file)
      setAnalysis(result)
      setRows(toImportRows(result.suggestions))
    },
    [analyze],
  )

  const onUpdateRow = useCallback(
    (column: string, patch: Partial<Pick<HeaderImportRow, 'include' | 'label' | 'type'>>) => {
      setRows((prev) => updateImportRow(prev, column, patch))
    },
    [],
  )

  const confirm = useCallback(() => {
    if (admin.isPending) return
    const defs = buildImportFieldDefs(rows, admin.fields)
    if (defs.length === 0) return
    admin.replace([...admin.fields, ...defs], {
      onSuccess: () => {
        sileo.success({ title: t('settings.fields.import.done', { count: defs.length }) })
        onOpenChange(false)
      },
    })
  }, [admin, onOpenChange, rows])

  return {
    open,
    step: analysis === null ? ('upload' as const) : ('review' as const),
    totalRows: analysis?.totalRows ?? 0,
    rows,
    isAnalyzing: analyze.isPending,
    fieldsPending: admin.isPending,
    openImport,
    onOpenChange,
    upload,
    onUpdateRow,
    confirm,
  }
}

export type HeaderImporter = ReturnType<typeof useHeaderImport>
