'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.pipelines.deleteTitle')}</DialogTitle>
        </DialogHeader>

        <Text as="p" variant="muted">
          {t('settings.pipelines.deleteDescription', { name })}
        </Text>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
