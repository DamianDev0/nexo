'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { HEX_COLOR_PALETTE } from '../../../config/hex-palette.constants'
import { useActivityTypeForm } from '../../../model/useActivityTypeForm'

import { ActivityIconPicker } from './ActivityIconPicker'

import type { ActivityTypeFormValues } from '../../../lib/activity-type-edit'

interface ActivityTypeFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ActivityTypeFormValues) => void
}

export function ActivityTypeFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: Readonly<ActivityTypeFormDialogProps>) {
  const { t } = useTranslation()
  const form = useActivityTypeForm(onSubmit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.activityTypes.createTitle')}</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={form.submit}>
          <Controller
            control={form.control}
            name="label"
            render={({ field, fieldState }) => (
              <div>
                <div className="flex items-center gap-2">
                  <Controller
                    control={form.control}
                    name="icon"
                    render={({ field: icon }) => (
                      <ActivityIconPicker
                        icon={icon.value}
                        onChange={icon.onChange}
                        label={t('settings.activityTypes.pickIcon')}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="color"
                    render={({ field: color }) => (
                      <ColorSwatchPicker
                        color={color.value}
                        colors={HEX_COLOR_PALETTE}
                        onChange={color.onChange}
                        label={t('settings.taxonomy.pickColor')}
                      />
                    )}
                  />
                  <Input
                    {...field}
                    autoFocus
                    placeholder={t('settings.activityTypes.namePlaceholder')}
                    aria-label={t('settings.activityTypes.nameLabel')}
                    className="h-9 flex-1"
                  />
                </div>
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Text as="p" variant="strong">
                {t('settings.activityTypes.trackDuration')}
              </Text>
              <Text as="p" variant="hint">
                {t('settings.activityTypes.trackDurationHint')}
              </Text>
            </div>
            <Controller
              control={form.control}
              name="trackDuration"
              render={({ field }) => (
                <AnimatedToggle
                  size="sm"
                  checked={field.value}
                  label={t('settings.activityTypes.trackDuration')}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

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
