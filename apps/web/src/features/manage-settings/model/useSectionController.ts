'use client'

import { useManageSettings, type SettingsSectionController } from './settings-context'

import type { SettingsSectionKey } from './types'

export function useSectionController(
  key: SettingsSectionKey | undefined,
): SettingsSectionController | null {
  const { company, appearance, navigation, nomenclature, contacts } = useManageSettings()

  switch (key) {
    case 'company':
      return company
    case 'appearance':
      return appearance
    case 'navigation':
      return navigation
    case 'nomenclature':
      return nomenclature
    case 'contacts':
      return contacts
    default:
      return null
  }
}
