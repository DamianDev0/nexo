'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { SubmitButton } from '@/shared/ui/molecules/submit-button'
import { Button } from '@/shared/ui/shadcn/button'

import { useSaveShortcutLabel } from '../model/useSaveShortcut'

interface SaveBarProps {
  readonly onSave: () => void
  readonly onReset: () => void
  readonly isDirty: boolean
  readonly isPending: boolean
}

export function SaveBar({ onSave, onReset, isDirty, isPending }: Readonly<SaveBarProps>) {
  const { t } = useTranslation()
  const transition = useReducedTransition(quickEase)
  const canSave = isDirty && !isPending
  const shortcut = useSaveShortcutLabel()

  const saveButton = (
    <SubmitButton size="sm" onSubmit={onSave} isPending={isPending} disabled={!isDirty}>
      {isPending ? t('common.saving') : t('common.save')}
      {shortcut && (
        <kbd
          aria-hidden
          className="rounded-sm border border-current/25 px-1 text-[10px] leading-4 opacity-70"
        >
          {shortcut}
        </kbd>
      )}
    </SubmitButton>
  )

  return (
    <div className="flex shrink-0 items-center justify-end gap-4 border-t border-border bg-background px-8 py-3">
      <span className="mr-auto text-sm text-muted-foreground">
        {isDirty ? t('settings.unsavedChanges') : t('settings.noChanges')}
      </span>

      <div className="flex items-center gap-2">
        <AnimatePresence initial={false}>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={transition}
            >
              <Button variant="ghost" size="sm" onClick={onReset} disabled={isPending}>
                {t('settings.discard')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {canSave ? (
          saveButton
        ) : (
          <HintTooltip asChild hint={t('settings.noChangesHint')}>
            {saveButton}
          </HintTooltip>
        )}
      </div>
    </div>
  )
}
