'use client'

import { useTranslation } from 'react-i18next'

import { formatShortcut } from '@/shared/lib/keyboard'
import { Text } from '@/shared/ui/atoms/text'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

import { SHORTCUT_GROUPS, shortcutKeys } from '../config/shortcut-groups'
import { useShortcutsDialog } from '../model/useShortcutsDialog'

export function ShortcutsDialog() {
  const { t } = useTranslation()
  const { open, setOpen } = useShortcutsDialog()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('shortcuts.title')}</DialogTitle>
          <DialogDescription>{t('shortcuts.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.id} className="flex flex-col gap-1.5">
              <Text variant="hint" className="font-medium tracking-wide uppercase">
                {t(`shortcuts.groups.${group.id}`)}
              </Text>
              <ul className="flex flex-col">
                {group.shortcuts.map((id) => (
                  <li key={id} className="flex items-center justify-between py-1.5">
                    <Text variant="body">{t(`shortcuts.actions.${id}`)}</Text>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-body">
                      {formatShortcut(shortcutKeys(id)).join(' ')}
                    </kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
