'use client'

import { useTranslation } from 'react-i18next'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { TagIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { useArchivedTags } from '../../../model/useArchivedTags'

import { TrashRow } from './TrashRow'

export function ArchivedTagsList() {
  const { t } = useTranslation()
  const list = useArchivedTags()

  if (!list.isPending && list.tags.length === 0) {
    return (
      <EmptyState
        icon={<TagIcon className="size-6" />}
        title={t('settings.trash.emptyTagsTitle')}
        description={t('settings.trash.emptyTagsDescription')}
      />
    )
  }

  return (
    <>
      <PagedTransition page={list.pagination.page} className="flex flex-col gap-1.5">
        {list.tags.map((tag) => (
          <TrashRow
            key={tag.id}
            title={tag.name}
            subtitle={
              <span className="inline-flex items-center gap-1.5">
                <ColorDot color={tag.color} />
                {tag.description ?? t('settings.trash.tagSubtitle')}
              </span>
            }
            restore={{
              label: t('settings.trash.restore'),
              onClick: () => list.restore(tag.id),
              disabled: list.isRestoring,
            }}
          />
        ))}
      </PagedTransition>
      <MorphingPageDots
        total={list.pagination.totalPages}
        page={list.pagination.page}
        onPageChange={list.pagination.onPageChange}
        label={t('settings.pagination.page')}
        className="mt-3"
      />
    </>
  )
}
