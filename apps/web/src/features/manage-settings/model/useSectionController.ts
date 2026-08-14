'use client'

import { useManageSettings, type SettingsSectionController } from './settings-context'

import type { SettingsSectionKey } from './types'

export function useSectionController(
  key: SettingsSectionKey | undefined,
): SettingsSectionController | null {
  const { company, appearance, navigation, nomenclature } = useManageSettings()

  switch (key) {
    case 'company':
      return company
    case 'appearance':
      return appearance
    case 'navigation':
      return navigation
    case 'nomenclature':
      return nomenclature
    default:
      return null
  }
}
