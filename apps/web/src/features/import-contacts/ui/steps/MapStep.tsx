'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/shadcn/table'

import { fieldLabel, previewCounts } from '../../lib/import-mapping'
import { FieldSelector } from '../FieldSelector'
import { ImportPreview } from '../ImportPreview'

import type { ImportMapState } from '../../model/types/import.types'
import type { AnalyzeResult } from '@repo/shared-types'

interface MapStepProps {
  readonly analysis: AnalyzeResult
  readonly data: ImportMapState
  readonly onRemap: (column: string, field: string) => void
}

export function MapStep({ analysis, data, onRemap }: Readonly<MapStepProps>) {
  const { t } = useTranslation()
  const preview = data.preview ?? analysis.validationPreview
  const counts = previewCounts(preview)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 text-xs font-medium">
                {t('contacts.import.map.columnHeader')}
              </TableHead>
              <TableHead className="h-9 text-xs font-medium">
                {t('contacts.import.map.sampleHeader')}
              </TableHead>
              <TableHead className="h-9 w-56 text-xs font-medium">
                {t('contacts.import.map.fieldHeader')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {analysis.columnAnalysis.map((column) => (
              <TableRow key={column.csvColumn} className="hover:bg-transparent">
                <TableCell className="font-medium text-foreground">{column.csvColumn}</TableCell>
                <TableCell className="max-w-64">
                  <TruncateTip className="text-muted-foreground">
                    {column.sampleValues.slice(0, 3).join(' · ') || t('contacts.import.map.empty')}
                  </TruncateTip>
                </TableCell>
                <TableCell>
                  <FieldSelector
                    fields={analysis.availableFields}
                    value={data.mapping[column.csvColumn] ?? null}
                    label={column.csvColumn}
                    onSelect={(field) => onRemap(column.csvColumn, field)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.missingFields.length > 0 && (
        <Text as="p" role="alert" className="text-destructive">
          {t('contacts.import.map.missing', {
            fields: data.missingFields.map((field) => fieldLabel(t, field)).join(', '),
          })}
        </Text>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Text variant="strong">{t('contacts.import.preview.title')}</Text>
          <Text variant="hint">
            {t('contacts.import.preview.counts', { valid: counts.valid, invalid: counts.invalid })}
          </Text>
        </div>
        <ImportPreview
          preview={preview}
          fields={analysis.availableFields}
          mapping={data.mapping}
          isStale={data.isPreviewing}
        />
      </div>
    </div>
  )
}
