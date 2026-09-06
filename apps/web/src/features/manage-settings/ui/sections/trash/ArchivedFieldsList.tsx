'use client'

import { useTranslation } from 'react-i18next'

import { ShapesIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { useArchivedFields } from '../../../model/useArchivedFields'

import { TrashRow } from './TrashRow'

export function ArchivedFieldsList() {
  const { t } = useTranslation()
  const list = useArchivedFields()

  if (!list.isPending && list.fields.length === 0) {
    return (
      <EmptyState
        icon={<ShapesIcon className="size-6" />}
        title={t('settings.trash.emptyFieldsTitle')}
        description={t('settings.trash.emptyFieldsDescription')}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {list.fields.map((item) => (
        <TrashRow
          key={`${item.entity}:${item.field.key}`}
          title={item.field.label}
          subtitle={`${t(`settings.trash.fieldEntity.${item.entity}`)} · ${t(`settings.fields.types.${item.field.type}`)}`}
          restore={{
            label: t('settings.trash.restore'),
            onClick: () => list.restore(item),
            disabled: list.isRestoring,
          }}
        />
      ))}
    </div>
  )
}
