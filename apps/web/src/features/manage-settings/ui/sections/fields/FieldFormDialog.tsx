'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'
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
        <Text className="text-foreground">{label}</Text>
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
  const form = useFieldForm(initial, onSubmit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(form.isEdit ? 'settings.fields.editTitle' : 'settings.fields.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={form.submit}>
          <Controller
            control={form.control}
            name="label"
            render={({ field, fieldState }) => (
              <div>
                <Input
                  {...field}
                  autoFocus
                  placeholder={t('settings.fields.namePlaceholder')}
                  aria-label={t('settings.fields.nameLabel')}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          {form.isEdit ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {t('settings.fields.typeLabel')}
              <BadgeSoft tone="outline">{t(`settings.fields.types.${form.type}`)}</BadgeSoft>
            </div>
          ) : (
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <FieldTypePicker value={field.value} onChange={field.onChange} />
              )}
            />
          )}

          <Controller
            control={form.control}
            name="required"
            render={({ field }) => (
              <CheckRow
                label={t('settings.fields.requiredLabel')}
                hint={t('settings.fields.requiredHint')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="showInForm"
            render={({ field }) => (
              <CheckRow
                label={t('settings.fields.showInFormLabel')}
                hint={t('settings.fields.showInFormHint')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {form.hasOptions && (
            <div>
              <FieldOptionsEditor options={form.options} actions={form.optionActions} />
              <FieldError message={form.optionsError} />
            </div>
          )}

          <DialogActions>
            <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </PillButton>
            <PillButton type="submit" size="sm" disabled={!form.canSubmit}>
              {t(form.isEdit ? 'common.save' : 'common.create')}
            </PillButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}
