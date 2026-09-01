'use client'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'

export type ConfirmDialogCopy = {
  readonly title: string
  readonly description: string
  readonly confirmLabel: string
  readonly cancelLabel: string
}

type ConfirmDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly tone?: 'default' | 'destructive'
  readonly copy: ConfirmDialogCopy
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tone = 'default',
  copy,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
        </DialogHeader>
        <Text as="p" variant="muted">
          {copy.description}
        </Text>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {copy.cancelLabel}
          </PillButton>
          <PillButton
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {copy.confirmLabel}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
