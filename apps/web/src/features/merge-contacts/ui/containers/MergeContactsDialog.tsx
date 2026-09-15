'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { expandCollapse, smoothEase, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

import { decidedRows } from '../../lib/merge-fields'
import { MergeFieldRow } from '../MergeFieldRow'

import { MergeLoserPicker } from './MergeLoserPicker'

import type { MergeContactsDialogState } from '../../model/useMergeContactsDialog'
import type { ContactListItem } from '@repo/shared-types'

type MergeContactsDialogProps = {
  readonly winner: ContactListItem
  readonly state: MergeContactsDialogState
}

export function MergeContactsDialog({ winner, state }: Readonly<MergeContactsDialogProps>) {
  const { t } = useTranslation()
  const reveal = useReducedTransition(smoothEase)
  const choices = decidedRows(state.rows)

  return (
    <Dialog open={state.open} onOpenChange={(open) => (open ? undefined : state.close())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('contacts.merge.title')}</DialogTitle>
          <DialogDescription>
            {t('contacts.merge.description', { name: contactFullName(winner) })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <MergeLoserPicker
            winnerId={winner.id}
            loser={state.loser}
            onPick={state.pickLoser}
            disabled={state.isPending}
          />

          <AnimatePresence initial={false}>
            {state.loser ? (
              <motion.div
                key="merge-fields"
                variants={expandCollapse}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={reveal}
                className="flex flex-col gap-3 overflow-hidden"
              >
                <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                  {choices.length === 0 ? (
                    <Text variant="muted">{t('contacts.merge.identical')}</Text>
                  ) : (
                    choices.map((row) => (
                      <MergeFieldRow
                        key={row.field}
                        row={row}
                        takesLoser={state.fields.includes(row.field)}
                        onToggle={() => state.toggleField(row.field)}
                      />
                    ))
                  )}
                </div>
                <Text variant="hint">
                  {t('contacts.merge.archiveNotice', { name: contactFullName(state.loser) })}
                </Text>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={state.close}>
            {t('common.cancel')}
          </PillButton>
          <PillButton size="sm" disabled={!state.loser || state.isPending} onClick={state.confirm}>
            {t('contacts.merge.action')}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
