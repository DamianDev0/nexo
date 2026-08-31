'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

interface SectorConfirmDialogProps {
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SectorConfirmDialog({
  onCancel,
  onConfirm,
}: Readonly<SectorConfirmDialogProps>) {
  const { t } = useTranslation()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.company.sectorConfirm.title')}</DialogTitle>
        </DialogHeader>

        <Text as="p" variant="muted">
          {t('settings.company.sectorConfirm.description')}
        </Text>

        <DialogActions>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t('settings.company.sectorConfirm.confirm')}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
