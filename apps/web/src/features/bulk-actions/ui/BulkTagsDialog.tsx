'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTagCatalog } from '@/entities/tag'
import { cn } from '@/shared/lib'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { SearchInput } from '@/shared/ui/molecules/search-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'

type BulkTagsDialogProps = {
  readonly mode: 'add_tags' | 'remove_tags'
  readonly count: number
  readonly onConfirm: (tags: string[]) => void
  readonly onClose: () => void
}

export function BulkTagsDialog({ mode, count, onConfirm, onClose }: Readonly<BulkTagsDialogProps>) {
  const { t } = useTranslation()
  const catalog = useTagCatalog('contact')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set())

  const options = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...catalog.values()]
      .filter((tag) => q === '' || tag.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [catalog, query])

  const toggle = (name: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t(`contacts.bulk.dialogs.tags.${mode}`, { count })}</DialogTitle>
        </DialogHeader>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('contacts.bulk.dialogs.tags.search')}
        />
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {options.length === 0 && (
            <Text variant="muted" className="px-2 py-3">
              {t('contacts.bulk.dialogs.tags.empty')}
            </Text>
          )}
          {options.map((tag) => (
            <PillButton
              key={tag.id}
              variant="ghost"
              size="xs"
              aria-pressed={selected.has(tag.name)}
              onClick={() => toggle(tag.name)}
              className={cn(
                'w-full justify-start gap-2 font-normal',
                selected.has(tag.name) && 'bg-secondary font-medium text-secondary-foreground',
              )}
            >
              <ColorDot color={tag.color ?? 'var(--muted-foreground)'} />
              <span className="min-w-0 flex-1 truncate text-left">{tag.name}</span>
              {selected.has(tag.name) && <CheckIcon className="size-4 shrink-0" />}
            </PillButton>
          ))}
        </div>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          <PillButton
            size="sm"
            disabled={selected.size === 0}
            onClick={() => onConfirm([...selected])}
          >
            {t('contacts.bulk.dialogs.tags.confirm', { count: selected.size })}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
