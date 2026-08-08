'use client'

import { usePathname } from 'next/navigation'

import { ROUTES } from '@/shared/config/routes'

import { useManageSettings, type SettingsSectionController } from './settings-context'

import type { SettingsSectionKey } from './types'

export function useSectionController(
  key: SettingsSectionKey | undefined,
): SettingsSectionController | null {
  const { company, appearance, navigation, nomenclature, contacts } = useManageSettings()
  const pathname = usePathname()

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
      return pathname === ROUTES.app.settings.contacts.tags ? null : contacts
    default:
      return null
  }
}
