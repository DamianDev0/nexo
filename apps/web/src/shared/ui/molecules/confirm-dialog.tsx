'use client'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import SlideToDeleteButton from '@/shared/ui/ruixen/slide-to-delete-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'

const SLIDE_CLOSE_DELAY_MS = 450

export type ConfirmDialogCopy = {
  readonly title: string
  readonly description: string
  readonly confirmLabel: string
  readonly cancelLabel: string
  readonly confirmedLabel?: string
}

type ConfirmDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly tone?: 'default' | 'destructive' | 'slide-destructive'
  readonly copy: ConfirmDialogCopy
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tone = 'default',
  copy,
}: Readonly<ConfirmDialogProps>) {
  const slideConfirm = () => {
    onConfirm()
    window.setTimeout(() => onOpenChange(false), SLIDE_CLOSE_DELAY_MS)
  }

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
          {tone === 'slide-destructive' ? (
            <SlideToDeleteButton
              label={copy.confirmLabel}
              confirmedLabel={copy.confirmedLabel ?? copy.confirmLabel}
              onConfirm={slideConfirm}
              sound={false}
            />
          ) : (
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
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
