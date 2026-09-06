'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { SectionTabs } from '@/shared/ui/molecules/section-tabs'

import { useTrashPane } from '../../../model/useTrashPane'

import { ArchivedContactsList } from './ArchivedContactsList'
import { ArchivedFieldsList } from './ArchivedFieldsList'
import { ArchivedTagsList } from './ArchivedTagsList'

export function TrashPane() {
  const { t } = useTranslation()
  const pane = useTrashPane()

  return (
    <div className="max-w-2xl">
      <Text as="p" variant="muted" className="mb-4">
        {t('settings.trash.description')}
      </Text>
      <SectionTabs
        tabs={pane.tabs.map((key) => ({ key, label: t(`settings.trash.tabs.${key}`) }))}
        active={pane.tab}
        onChange={pane.onTabChange}
        className="mb-4"
      />
      {pane.tab === 'contacts' && <ArchivedContactsList />}
      {pane.tab === 'tags' && <ArchivedTagsList />}
      {pane.tab === 'fields' && <ArchivedFieldsList />}
    </div>
  )
}
