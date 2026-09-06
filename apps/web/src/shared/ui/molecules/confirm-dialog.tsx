'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { WarningCircleIcon } from '@/shared/ui/icons'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import SlideToDeleteButton from '@/shared/ui/ruixen/slide-to-delete-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

const SLIDE_CLOSE_DELAY_MS = 450

export type ConfirmDialogCopy = {
  readonly title: string
  readonly description: string
  readonly confirmLabel: string
  readonly cancelLabel: string
  readonly confirmedLabel?: string
  readonly warning?: string
}

type ConfirmDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly tone?: 'default' | 'destructive'
  readonly copy: ConfirmDialogCopy
}

function WarningCallout({ children }: Readonly<{ children: string }>) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3"
    >
      <WarningCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      <Text variant="body" className="text-foreground/85">
        {children}
      </Text>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tone = 'default',
  copy,
}: Readonly<ConfirmDialogProps>) {
  const { t } = useTranslation()
  const destructive = tone === 'destructive'

  const slideConfirm = () => {
    onConfirm()
    window.setTimeout(() => onOpenChange(false), SLIDE_CLOSE_DELAY_MS)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        {destructive && (
          <WarningCallout>{copy.warning ?? t('common.confirm.irreversible')}</WarningCallout>
        )}
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {copy.cancelLabel}
          </PillButton>
          {destructive ? (
            <SlideToDeleteButton
              label={copy.confirmLabel}
              confirmedLabel={copy.confirmedLabel ?? copy.confirmLabel}
              onConfirm={slideConfirm}
            />
          ) : (
            <PillButton
              variant="primary"
              size="sm"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {copy.confirmLabel}
            </PillButton>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
