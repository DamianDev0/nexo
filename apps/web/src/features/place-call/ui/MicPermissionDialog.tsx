'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

type MicPermissionDialogProps = {
  readonly open: boolean
  readonly denied: boolean
  readonly onAllow: () => void
  readonly onClose: () => void
}

export function MicPermissionDialog({
  open,
  denied,
  onAllow,
  onClose,
}: Readonly<MicPermissionDialogProps>) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="top-16 w-105 max-w-[calc(100dvw-2rem)] translate-y-0 gap-3 rounded-3xl p-6">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-medium">{t('dialer.mic.title')}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {denied ? t('dialer.mic.denied') : t('dialer.mic.body')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <PillButton variant="ghost" size="xs" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          {denied ? null : (
            <PillButton size="xs" onClick={onAllow}>
              {t('dialer.mic.allow')}
            </PillButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
