'use client'

import { useTranslation } from 'react-i18next'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { useFieldForm } from '../../../model/useFieldForm'

import { FieldOptionsEditor } from './FieldOptionsEditor'
import { FieldTypePicker } from './FieldTypePicker'

import type { FieldFormValues } from '../../../lib/custom-field-edit'

interface FieldFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: FieldFormValues) => void
  readonly initial: FieldFormValues | null
}

interface CheckRowProps {
  readonly label: string
  readonly hint: string
  readonly checked: boolean
  readonly onChange: (checked: boolean) => void
}

function CheckRow({ label, hint, checked, onChange }: Readonly<CheckRowProps>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <span className="flex min-w-0 flex-col">
        <span className="text-sm text-foreground">{label}</span>
        <Text variant="hint">{hint}</Text>
      </span>
      <AnimatedToggle size="sm" checked={checked} label={label} onChange={onChange} />
    </div>
  )
}

export function FieldFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: Readonly<FieldFormDialogProps>) {
  const { t } = useTranslation()
  const form = useFieldForm(initial)

  const submit = () => {
    if (!form.canSubmit) return
    onSubmit(form.values())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(form.isEdit ? 'settings.fields.editTitle' : 'settings.fields.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            value={form.label}
            onChange={(event) => form.setLabel(event.target.value)}
            placeholder={t('settings.fields.namePlaceholder')}
            aria-label={t('settings.fields.nameLabel')}
          />

          {form.isEdit ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {t('settings.fields.typeLabel')}
              <BadgeSoft tone="outline">{t(`settings.fields.types.${form.type}`)}</BadgeSoft>
            </div>
          ) : (
            <FieldTypePicker value={form.type} onChange={form.setType} />
          )}

          <CheckRow
            label={t('settings.fields.requiredLabel')}
            hint={t('settings.fields.requiredHint')}
            checked={form.required}
            onChange={form.setRequired}
          />
          <CheckRow
            label={t('settings.fields.showInFormLabel')}
            hint={t('settings.fields.showInFormHint')}
            checked={form.showInForm}
            onChange={form.setShowInForm}
          />

          {form.hasOptions && (
            <FieldOptionsEditor options={form.options} actions={form.optionActions} />
          )}
        </div>

        <DialogActions>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" disabled={!form.canSubmit} onClick={submit}>
            {t(form.isEdit ? 'common.save' : 'common.create')}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
