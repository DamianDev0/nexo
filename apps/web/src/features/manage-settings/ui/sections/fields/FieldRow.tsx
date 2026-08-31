'use client'

import { useTranslation } from 'react-i18next'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { DragHandle } from '@/shared/ui/atoms/drag-handle'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PencilSimpleIcon, TrashIcon } from '@/shared/ui/icons'

import type { DragHandleBinding } from '@/shared/ui/atoms/drag-handle'
import type { FieldDef } from '@repo/shared-types'

export interface FieldRowActions {
  readonly onEdit: (key: string) => void
  readonly onArchive: (key: string) => void
}

interface FieldRowProps {
  readonly field: FieldDef
  readonly actions: FieldRowActions
  readonly handle?: DragHandleBinding
}

export function FieldRow({ field, actions, handle }: Readonly<FieldRowProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors hover:border-input/70 hover:bg-row-hover">
      <DragHandle handle={handle} label={t('settings.fields.reorder')} />
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{field.label}</span>
      {field.required && <BadgeSoft tone="warning">{t('settings.fields.requiredLabel')}</BadgeSoft>}
      <BadgeSoft tone="outline">{t(`settings.fields.types.${field.type}`)}</BadgeSoft>
      <PillButton
        variant="ghost"
        size="xs"
        className="w-8 px-0 text-muted-foreground hover:text-primary"
        aria-label={t('settings.fields.editTitle')}
        onClick={() => actions.onEdit(field.key)}
      >
        <PencilSimpleIcon className="size-3.5" />
      </PillButton>
      <PillButton
        variant="ghostDanger"
        size="xs"
        aria-label={t('settings.fields.archive')}
        onClick={() => actions.onArchive(field.key)}
      >
        <TrashIcon className="size-3.5" />
      </PillButton>
    </div>
  )
}
