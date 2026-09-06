'use client'

import { Controller } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { DialogHeading } from '@/shared/ui/molecules/dialog-heading'
import { Dialog, DialogContent } from '@/shared/ui/shadcn/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { BULK_EXPORT_FORMAT_OPTIONS } from '../config/bulk-actions.constants'
import { useBulkExportForm } from '../model/useBulkExportForm'

import type { BulkExportParams } from '@repo/shared-types'

type BulkExportDialogProps = {
  readonly count: number
  readonly onConfirm: (params: BulkExportParams) => void
  readonly onClose: () => void
}

export function BulkExportDialog({ count, onConfirm, onClose }: Readonly<BulkExportDialogProps>) {
  const { t } = useTranslation()
  const { form, handleSubmit } = useBulkExportForm(onConfirm)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeading
            title={t('contacts.bulk.dialogs.export.title')}
            description={
              <Trans
                i18nKey="contacts.bulk.dialogs.export.description"
                count={count}
                components={{ b: <strong /> }}
              />
            }
          />
          <ControlledField
            control={form.control}
            name="fileName"
            field={{
              label: t('contacts.bulk.dialogs.export.fileName'),
              placeholder: t('contacts.bulk.dialogs.export.fileNamePlaceholder'),
            }}
          />
          <Controller
            control={form.control}
            name="format"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t('contacts.bulk.dialogs.export.format')}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-label={t('contacts.bulk.dialogs.export.format')}
                    className="h-10 w-full border-border bg-surface-input"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BULK_EXPORT_FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <DialogActions>
            <PillButton variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </PillButton>
            <PillButton type="submit" size="sm">
              {t('contacts.bulk.dialogs.export.confirm', { count })}
            </PillButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}
