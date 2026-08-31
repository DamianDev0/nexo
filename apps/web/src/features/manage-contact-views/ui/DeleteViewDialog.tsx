'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

type DeleteViewDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly name: string
  readonly onConfirm: () => void
}

export function DeleteViewDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
}: Readonly<DeleteViewDialogProps>) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('contacts.views.deleteTitle', { name })}</DialogTitle>
        </DialogHeader>
        <Text as="p" variant="muted">
          {t('contacts.views.deleteDescription')}
        </Text>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </PillButton>
          <PillButton
            variant="ghostDanger"
            size="sm"
            className="font-bold text-destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {t('common.delete')}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
