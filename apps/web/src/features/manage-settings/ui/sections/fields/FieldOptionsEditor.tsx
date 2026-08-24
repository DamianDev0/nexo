'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PlusIcon, TrashIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

import type { FieldOptionItem } from '../../../model/useFieldForm'

interface FieldOptionsEditorProps {
  readonly options: ReadonlyArray<FieldOptionItem>
  readonly actions: {
    readonly onAdd: () => void
    readonly onChange: (id: string, value: string) => void
    readonly onRemove: (id: string) => void
  }
}

export function FieldOptionsEditor({ options, actions }: Readonly<FieldOptionsEditorProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{t('settings.fields.optionsLabel')}</Label>
      {options.map((option) => (
        <div key={option.id} className="flex items-center gap-1.5">
          <Input
            value={option.value}
            onChange={(event) => actions.onChange(option.id, event.target.value)}
            placeholder={t('settings.fields.optionPlaceholder')}
            aria-label={t('settings.fields.optionPlaceholder')}
          />
          <PillButton
            type="button"
            variant="ghostDanger"
            size="xs"
            aria-label={t('settings.fields.removeOption')}
            onClick={() => actions.onRemove(option.id)}
          >
            <TrashIcon className="size-3.5" />
          </PillButton>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start gap-1.5"
        onClick={actions.onAdd}
      >
        <PlusIcon className="size-3.5" />
        {t('settings.fields.addOption')}
      </Button>
    </div>
  )
}
