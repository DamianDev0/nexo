'use client'

import { useTranslation } from 'react-i18next'

import { TagOptionRow } from '@/entities/tag'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { SearchInput } from '@/shared/ui/molecules/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

import { useBulkTagOptions } from '../model/useBulkTagOptions'

type BulkTagsDialogProps = {
  readonly mode: 'add_tags' | 'remove_tags'
  readonly count: number
  readonly scope: readonly string[] | null
  readonly onConfirm: (tags: string[]) => void
  readonly onClose: () => void
}

export function BulkTagsDialog({
  mode,
  count,
  scope,
  onConfirm,
  onClose,
}: Readonly<BulkTagsDialogProps>) {
  const { t } = useTranslation()
  const picker = useBulkTagOptions(scope)
  const emptyKey = picker.isScoped ? 'emptyScoped' : 'empty'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t(`contacts.bulk.dialogs.tags.${mode}`, { count })}</DialogTitle>
          <DialogDescription>
            {t(`contacts.bulk.dialogs.tags.${picker.isScoped ? 'scopedHint' : 'catalogHint'}`)}
          </DialogDescription>
        </DialogHeader>
        <SearchInput
          value={picker.query}
          onChange={picker.setQuery}
          placeholder={t('contacts.bulk.dialogs.tags.search')}
        />
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {picker.options.length === 0 && (
            <Text variant="muted" className="px-2 py-3">
              {t(`contacts.bulk.dialogs.tags.${emptyKey}`)}
            </Text>
          )}
          {picker.options.map((option) => (
            <TagOptionRow key={option.name} option={option} onToggle={picker.toggle} />
          ))}
        </div>
        <DialogActions>
          <PillButton variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          <PillButton
            size="sm"
            disabled={picker.selected.length === 0}
            onClick={() => onConfirm(picker.selected)}
          >
            {t(`contacts.bulk.dialogs.tags.confirm_${mode}`, { count: picker.selected.length })}
          </PillButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
