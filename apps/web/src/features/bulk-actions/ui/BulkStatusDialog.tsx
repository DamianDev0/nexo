'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

type BulkStatusDialogProps = {
  readonly count: number
  readonly onConfirm: (status: string) => void
  readonly onClose: () => void
}

export function BulkStatusDialog({ count, onConfirm, onClose }: Readonly<BulkStatusDialogProps>) {
  const { t } = useTranslation()
  const { statuses } = useContactTaxonomy()
  const [value, setValue] = useState('')

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('contacts.bulk.dialogs.status.title', { count })}</DialogTitle>
        </DialogHeader>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger aria-label={t('contacts.form.status')}>
            <SelectValue placeholder={t('contacts.bulk.dialogs.status.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((choice) => (
              <SelectItem key={choice.key} value={choice.key}>
                <span className="flex items-center gap-2">
                  <ColorDot color={choice.color} />
                  {choice.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          <PillButton size="sm" disabled={value === ''} onClick={() => onConfirm(value)}>
            {t('contacts.bulk.dialogs.status.confirm')}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
