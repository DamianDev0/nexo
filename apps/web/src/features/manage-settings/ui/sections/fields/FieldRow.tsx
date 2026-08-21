'use client'

import { useTranslation } from 'react-i18next'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { TrashIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import type { FieldDef } from '@repo/shared-types'

interface FieldRowProps {
  readonly field: FieldDef
  readonly onArchive: (key: string) => void
}

export function FieldRow({ field, onArchive }: Readonly<FieldRowProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-card px-3 py-1.5">
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{field.label}</span>
      <BadgeSoft tone="outline">{t(`settings.fields.types.${field.type}`)}</BadgeSoft>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('settings.fields.archive')}
        onClick={() => onArchive(field.key)}
      >
        <TrashIcon className="size-3.5" />
      </Button>
    </div>
  )
}
