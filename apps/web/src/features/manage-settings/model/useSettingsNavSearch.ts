'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'

import { SETTINGS_GROUPS } from '../config/settings-nav.constants'
import { filterSettingsGroups } from '../lib/filter-settings-nav'

import type { SettingsNavLabels } from '../lib/filter-settings-nav'

export function useSettingsNavSearch() {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const [query, setQuery] = useState('')

  const labels = useMemo<SettingsNavLabels>(
    () => ({
      section: (section) => moduleLabel(section.key, `settings.sections.${section.key}`),
      child: (sectionKey, childKey) => t(`settings.children.${sectionKey}.${childKey}`),
    }),
    [moduleLabel, t],
  )

  const groups = useMemo(
    () => filterSettingsGroups(SETTINGS_GROUPS, query, labels),
    [query, labels],
  )

  return { query, setQuery, groups }
}
