'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Text } from '@/shared/ui/atoms/text'
import { SmoothCheckbox } from '@/shared/ui/smoothui/checkbox'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { FieldTypePopover } from './FieldTypePopover'

import type { HeaderImportRow } from '../../../lib/header-import'

interface ImportReviewRowProps {
  readonly row: HeaderImportRow
  readonly onUpdate: (
    column: string,
    patch: Partial<Pick<HeaderImportRow, 'include' | 'label' | 'type'>>,
  ) => void
}

export function ImportReviewRow({ row, onUpdate }: Readonly<ImportReviewRowProps>) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5',
        !row.include && 'opacity-55',
      )}
    >
      <div className="flex items-center gap-2">
        <SmoothCheckbox
          checked={row.include}
          aria-label={t('settings.fields.import.includeColumn', { column: row.column })}
          onCheckedChange={(include) => onUpdate(row.column, { include })}
        />
        <Text variant="strong" className="min-w-0 flex-1 truncate">
          {row.column}
        </Text>
        {row.existingFieldKey !== null && (
          <BadgeSoft tone="warning">{t('settings.fields.import.alreadyExists')}</BadgeSoft>
        )}
      </div>

      {row.sampleValues.length > 0 && (
        <Text variant="hint" className="truncate pl-7">
          {row.sampleValues.join(' · ')}
        </Text>
      )}

      <div className="flex items-center gap-2 pl-7">
        <Input
          value={row.label}
          aria-label={t('settings.fields.nameLabel')}
          className="h-8 flex-1 text-sm"
          disabled={!row.include}
          onChange={(event) => onUpdate(row.column, { label: event.target.value })}
        />
        <FieldTypePopover value={row.type} onChange={(type) => onUpdate(row.column, { type })} />
      </div>
    </div>
  )
}
