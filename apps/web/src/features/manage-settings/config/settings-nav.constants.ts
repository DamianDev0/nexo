import { ROUTES } from '@/shared/config/routes'

import type { SettingsGroup } from '../model/types'

const SETTINGS = ROUTES.app.settings

export const SETTINGS_GROUPS: ReadonlyArray<SettingsGroup> = [
  {
    key: 'personal',
    sections: [
      { key: 'profile', href: SETTINGS.profile, available: false },
      { key: 'notifications', href: SETTINGS.notifications, available: false },
    ],
  },
  {
    key: 'account',
    sections: [
      { key: 'company', href: SETTINGS.company, available: true },
      { key: 'team', href: SETTINGS.team, available: false },
    ],
  },
  {
    key: 'workspace',
    sections: [
      {
        key: 'appearance',
        href: SETTINGS.appearance.brand,
        available: true,
        children: [
          { key: 'brand', href: SETTINGS.appearance.brand },
          { key: 'theme', href: SETTINGS.appearance.theme },
          { key: 'typography', href: SETTINGS.appearance.typography },
        ],
      },
      { key: 'navigation', href: SETTINGS.navigation, available: true },
      { key: 'nomenclature', href: SETTINGS.nomenclature, available: true },
      { key: 'fields', href: SETTINGS.fields, available: true },
      { key: 'pipelines', href: SETTINGS.pipelines, available: true },
      { key: 'activities', href: SETTINGS.activities, available: true },
      {
        key: 'contacts',
        href: SETTINGS.contacts.status,
        available: true,
        children: [
          { key: 'status', href: SETTINGS.contacts.status },
          { key: 'lifecycle', href: SETTINGS.contacts.lifecycle },
          { key: 'sources', href: SETTINGS.contacts.sources },
          { key: 'types', href: SETTINGS.contacts.types },
          { key: 'tags', href: SETTINGS.contacts.tags },
        ],
      },
    ],
  },
]
