'use client'

import { useTranslation } from 'react-i18next'

import { TagIcon } from '@/shared/ui/icons'

import { useTagsPane } from '../../../model/useTagsPane'

import { AddOptionInput } from './AddOptionInput'
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

      <AddOptionInput
        form={{ value: pane.newName, onChange: pane.setNewName, onSubmit: pane.handleAdd }}
        placeholder={t('settings.tags.addPlaceholder')}
        label={t('settings.tags.add')}
        disabled={pane.isPending}
      />
    </div>
  )
}
