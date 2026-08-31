'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { PIPELINE_NAME_MAX } from '../../../config/pipelines.constants'
import { usePipelineForm } from '../../../model/usePipelineForm'

interface CreatePipelineDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (name: string) => void
}

export function CreatePipelineDialog({
  open,
  onOpenChange,
  onSubmit,
}: Readonly<CreatePipelineDialogProps>) {
  const { t } = useTranslation()
  const form = usePipelineForm(onSubmit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.pipelines.createTitle')}</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={form.submit}>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <div>
                <Input
                  {...field}
                  autoFocus
                  maxLength={PIPELINE_NAME_MAX}
                  placeholder={t('settings.pipelines.namePlaceholder')}
                  aria-label={t('settings.pipelines.nameLabel')}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />
          <Text as="p" variant="hint">
            {t('settings.pipelines.createHint')}
          </Text>

          <DialogActions>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!form.canSubmit}>
              {t('common.create')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}
