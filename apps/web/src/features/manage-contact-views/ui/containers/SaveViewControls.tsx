'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { smoothSpring, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { ArrowCounterClockwiseIcon, FloppyDiskIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { buildViewInput, isSnapshotDirty, type ViewSnapshot } from '../../lib/view-snapshot'
import { useContactViewsAdmin } from '../../query/useContactViewsAdmin'
import { SaveViewDialog } from '../SaveViewDialog'

import type { ViewFormValues } from '../../lib/view-form.schema'
import type { ContactView } from '@repo/shared-types'

type SaveViewControlsProps = {
  readonly snapshot: ViewSnapshot
  readonly activeView: ContactView | null
  readonly onRevert: () => void
}

export function SaveViewControls({
  snapshot,
  activeView,
  onRevert,
}: Readonly<SaveViewControlsProps>) {
  const { t } = useTranslation()
  const views = useContactViewsAdmin()
  const [open, setOpen] = useState(false)
  const transition = useReducedTransition(smoothSpring)

  const dirty = !activeView && isSnapshotDirty(snapshot)

  const submit = (meta: ViewFormValues) => {
    views.create(buildViewInput(meta, snapshot))
  }

  return (
    <AnimatePresence initial={false}>
      {dirty && (
        <motion.span
          key="save-view-controls"
          initial={{ opacity: 0, scale: 0.9, x: 8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 8 }}
          transition={transition}
          className="flex shrink-0 items-center gap-1"
        >
          <HintTooltip asChild hint={t('contacts.views.save')}>
            <PillButton
              variant="ghost"
              size="sm"
              aria-label={t('contacts.views.save')}
              disabled={views.isPending}
              onClick={() => setOpen(true)}
              className="w-8 rounded-md bg-primary px-0 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              <FloppyDiskIcon className="size-4" />
            </PillButton>
          </HintTooltip>
          <HintTooltip asChild hint={t('contacts.views.revert')}>
            <PillButton
              variant="ghost"
              size="sm"
              aria-label={t('contacts.views.revert')}
              onClick={onRevert}
              className="w-8 rounded-md px-0 text-muted-foreground hover:text-foreground"
            >
              <ArrowCounterClockwiseIcon className="size-4" />
            </PillButton>
          </HintTooltip>
          <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />

          <SaveViewDialog
            open={open}
            onOpenChange={setOpen}
            title={t('contacts.views.saveTitle')}
            initial={{ name: '', description: '' }}
            onSubmit={submit}
          />
        </motion.span>
      )}
    </AnimatePresence>
  )
}
