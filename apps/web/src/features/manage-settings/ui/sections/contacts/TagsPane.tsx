'use client'

import { useTranslation } from 'react-i18next'

import { PlusIcon, TagIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { useTagsPane } from '../../../model/useTagsPane'

import { TagRow } from './TagRow'

export function TagsPane() {
  const { t } = useTranslation()
  const pane = useTagsPane()

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-muted-foreground">{t('settings.tags.description')}</p>

      {!pane.isPending && pane.tags.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
          <TagIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{t('settings.tags.emptyTitle')}</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {t('settings.tags.emptyDescription')}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {pane.tags.map((tag) => (
          <TagRow key={tag.id} tag={tag} actions={pane.actions} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          className="h-9 max-w-xs text-sm"
          value={pane.newName}
          placeholder={t('settings.tags.addPlaceholder')}
          onChange={(e) => pane.setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              pane.handleAdd()
            }
          }}
        />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={pane.handleAdd}>
          <PlusIcon className="size-3.5" />
          {t('settings.tags.add')}
        </Button>
      </div>
    </div>
  )
}
