'use client'

import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

interface SectorConfirmDialogProps {
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SectorConfirmDialog({ onCancel, onConfirm }: Readonly<SectorConfirmDialogProps>) {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      onConfirm={onConfirm}
      copy={{
        title: t('settings.company.sectorConfirm.title'),
        description: t('settings.company.sectorConfirm.description'),
        confirmLabel: t('settings.company.sectorConfirm.confirm'),
        cancelLabel: t('common.cancel'),
      }}
    />
  )
}
