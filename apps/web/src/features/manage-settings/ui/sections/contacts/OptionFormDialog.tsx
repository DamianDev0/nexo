'use client'

import { TAXONOMY_DESCRIPTION_MAX } from '@repo/shared-types'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'
import { Textarea } from '@/shared/ui/shadcn/textarea'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { useOptionForm } from '../../../model/useOptionForm'

import type { OptionFormValues } from '../../../model/types'

interface OptionFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initial: OptionFormValues | null
  readonly namePlaceholder: string
  readonly onSubmit: (values: OptionFormValues) => void
}

export function OptionFormDialog({
  open,
  onOpenChange,
  initial,
  namePlaceholder,
  onSubmit,
}: Readonly<OptionFormDialogProps>) {
  const { t } = useTranslation()
  const form = useOptionForm({ initial, onSubmit, onClose: () => onOpenChange(false) })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {initial ? t('settings.optionForm.editTitle') : t('settings.optionForm.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.submit} className="flex flex-col gap-1">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <div>
                <Input
                  {...field}
                  autoFocus
                  placeholder={namePlaceholder}
                  aria-label={t('settings.optionForm.name')}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <div>
                <Textarea
                  {...field}
                  rows={5}
                  maxLength={TAXONOMY_DESCRIPTION_MAX}
                  placeholder={t('settings.optionForm.descriptionPlaceholder')}
                  aria-label={t('settings.optionForm.description')}
                  className="min-h-28 resize-none focus-visible:ring-1"
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          <Text as="p" variant="hint" className="text-right tabular-nums">
            {form.descriptionLength}/{TAXONOMY_DESCRIPTION_MAX}
          </Text>

          <DialogActions>
            <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </PillButton>
            <PillButton type="submit" size="sm" disabled={!form.canSubmit}>
              {initial ? t('common.save') : t('common.create')}
            </PillButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}
