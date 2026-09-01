'use client'

import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

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
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      tone="destructive"
      copy={{
        title: t('contacts.views.deleteTitle', { name }),
        description: t('contacts.views.deleteDescription'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
      }}
    />
  )
}
