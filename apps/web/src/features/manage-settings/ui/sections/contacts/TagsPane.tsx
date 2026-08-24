'use client'

import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { PlusIcon, TagIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { Button } from '@/shared/ui/shadcn/button'

import { useTagsPane } from '../../../model/useTagsPane'

import { OptionFormDialog } from './OptionFormDialog'
import { ReassignOptionDialog } from './ReassignOptionDialog'
import { TagRow } from './TagRow'

export function TagsPane() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const pane = useTagsPane()

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('settings.tags.description', {
            entity: terms.lowerSingular,
            entities: terms.lowerPlural,
          })}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={pane.editor.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.tags.add')}
        </Button>
      </div>

      {!pane.isPending && pane.tags.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
          <TagIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{t('settings.tags.emptyTitle')}</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {t('settings.tags.emptyDescription', { entities: terms.lowerPlural })}
          </p>
        </div>
      )}

      <PagedTransition page={pane.pagination.page} className="flex flex-col gap-1.5">
        {pane.tags.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            count={pane.counts[tag.name] ?? 0}
            actions={pane.actions}
          />
        ))}
      </PagedTransition>

      <MorphingPageDots
        total={pane.pagination.totalPages}
        page={pane.pagination.page}
        onPageChange={pane.pagination.onPageChange}
        label={t('settings.pagination.page')}
        className="mt-3"
      />

      {pane.editor.open && (
        <OptionFormDialog
          open
          onOpenChange={pane.editor.onOpenChange}
          initial={pane.editor.editing}
          namePlaceholder={t('settings.tags.addPlaceholder')}
          onSubmit={pane.editor.onSubmit}
        />
      )}

      {pane.removal && (
        <ReassignOptionDialog
          open
          onOpenChange={(open) => {
            if (!open) pane.removal?.cancel()
          }}
          source={pane.removal.source}
          candidates={pane.removal.candidates}
          onConfirm={pane.removal.confirm}
        />
      )}
    </div>
  )
}
