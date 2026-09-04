'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { WarningCircleIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/shadcn/table'

import { IMPORT_PREVIEW_COLUMNS } from '../config/import-contacts.constants'
import { fieldLabel, mappedFieldsInOrder } from '../lib/import-mapping'
import { cellValue } from '../lib/import-preview'

import type { ImportMapping } from '../model/types/import.types'
import type { ImportFieldDef, ValidationPreview } from '@repo/shared-types'

type ImportPreviewProps = {
  readonly preview: ValidationPreview
  readonly fields: ReadonlyArray<ImportFieldDef>
  readonly mapping: ImportMapping
  readonly isStale: boolean
}

export function ImportPreview({ preview, fields, mapping, isStale }: Readonly<ImportPreviewProps>) {
  const { t } = useTranslation()
  const shown = mappedFieldsInOrder(mapping, fields).slice(0, IMPORT_PREVIEW_COLUMNS)

  return (
    <div
      className={cn('rounded-lg border border-border transition-opacity', isStale && 'opacity-50')}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 w-10 text-xs font-medium" />
            {shown.map((field) => (
              <TableHead key={field.field} className="h-9 text-xs font-medium">
                {fieldLabel(t, field)}
              </TableHead>
            ))}
            <TableHead className="h-9 w-10 text-xs font-medium" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {preview.rows.map((row) => (
            <TableRow key={row.rowNumber} className="hover:bg-transparent">
              <TableCell className="text-xs tabular-nums text-faint">{row.rowNumber}</TableCell>

              {shown.map((field) => (
                <TableCell key={field.field} className="max-w-40">
                  <TruncateTip className="text-body">
                    {cellValue(row.mapped[field.field])}
                  </TruncateTip>
                </TableCell>
              ))}

              <TableCell>
                {!row.isValid && (
                  <HintTooltip asChild hint={row.errors.map((error) => error.message).join(' · ')}>
                    <span
                      role="img"
                      aria-label={t('contacts.import.preview.invalid')}
                      className="flex cursor-help text-warning-deep"
                    >
                      <WarningCircleIcon className="size-4" />
                    </span>
                  </HintTooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
