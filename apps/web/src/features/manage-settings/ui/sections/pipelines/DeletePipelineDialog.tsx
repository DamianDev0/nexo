'use client'

import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

interface DeletePipelineDialogProps {
  readonly name: string
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function DeletePipelineDialog({
  name,
  onCancel,
  onConfirm,
}: Readonly<DeletePipelineDialogProps>) {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      onConfirm={onConfirm}
      tone="destructive"
      copy={{
        title: t('settings.pipelines.deleteTitle'),
        description: t('settings.pipelines.deleteDescription', { name }),
        confirmLabel: t('common.confirm.slideToDelete'),
        confirmedLabel: t('common.confirm.deleted'),
        cancelLabel: t('common.cancel'),
      }}
    />
  )
}
