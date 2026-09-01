'use client'

import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'
import { Textarea } from '@/shared/ui/shadcn/textarea'

import { useViewForm } from '../model/useViewForm'

import type { ViewFormValues } from '../lib/view-form.schema'

type SaveViewDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly initial: ViewFormValues
  readonly onSubmit: (values: ViewFormValues) => void
}

function SaveViewForm({
  title,
  initial,
  onSubmit,
  onClose,
}: Readonly<Omit<SaveViewDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }>) {
  const { t } = useTranslation()
  const { form, handleSubmit } = useViewForm({ initial, onSave: onSubmit, onDone: onClose })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3.5">
        <ControlledField
          control={form.control}
          name="name"
          field={{
            label: t('contacts.views.name'),
            placeholder: t('contacts.views.namePlaceholder'),
            required: true,
          }}
        />
        <div>
          <FieldLabel htmlFor="view-description">{t('contacts.views.description')}</FieldLabel>
          <Textarea
            id="view-description"
            {...form.register('description')}
            placeholder={t('contacts.views.descriptionPlaceholder')}
            rows={2}
            className="mt-1.5"
          />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
      </div>
      <DialogActions>
        <PillButton variant="ghost" size="sm" onClick={onClose}>
          {t('common.cancel')}
        </PillButton>
        <PillButton type="submit" size="sm">
          {t('common.save')}
        </PillButton>
      </DialogActions>
    </form>
  )
}

export function SaveViewDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: Readonly<SaveViewDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        {open && (
          <SaveViewForm
            title={title}
            initial={initial}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
