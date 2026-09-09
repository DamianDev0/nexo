'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { DialogHeading } from '@/shared/ui/molecules/dialog-heading'
import { Dialog, DialogContent } from '@/shared/ui/shadcn/dialog'

import { matchesChoice } from '../lib/bulk-choice-options'

import { BulkChoiceRow } from './BulkChoiceRow'

import type { BulkChoiceOption } from '../model/types/bulk-actions.types'
import type { ReactNode } from 'react'

export type BulkChoiceCopy = {
  readonly title: string
  readonly description: ReactNode
  readonly field: string
  readonly placeholder: string
  readonly searchPlaceholder: string
  readonly empty: string
  readonly confirm: string
}

type BulkChoiceDialogProps = {
  readonly copy: BulkChoiceCopy
  readonly options: ReadonlyArray<BulkChoiceOption>
  readonly onConfirm: (value: string) => void
  readonly onClose: () => void
}

export function BulkChoiceDialog({
  copy,
  options,
  onConfirm,
  onClose,
}: Readonly<BulkChoiceDialogProps>) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeading title={copy.title} description={copy.description} />
        <div className="flex flex-col gap-1.5 py-1">
          <FieldLabel required>{copy.field}</FieldLabel>
          <AsyncSelect
            value={value}
            onChange={setValue}
            source={{
              options,
              getValue: (option) => option.value,
              filterFn: matchesChoice,
              renderOption: (option) => <BulkChoiceRow option={option} />,
            }}
            view={{
              label: copy.placeholder,
              display: selected ? <BulkChoiceRow option={selected} compact /> : undefined,
              placeholder: copy.placeholder,
              searchPlaceholder: copy.searchPlaceholder,
              empty: copy.empty,
              triggerClassName: 'h-11',
            }}
          />
        </div>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          <PillButton size="sm" disabled={value === ''} onClick={() => onConfirm(value)}>
            {copy.confirm}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
