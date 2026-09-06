import { ROUTES } from '@/shared/config/routes'
import {
  ArrowCounterClockwiseIcon,
  AddressBookIcon,
  BellIcon,
  BuildingsIcon,
  CalendarCheckIcon,
  PaletteIcon,
  ShapesIcon,
  SidebarSimpleIcon,
  StackIcon,
  TextAaIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@/shared/ui/icons'

import type { SettingsGroup } from '../model/types'

const SETTINGS = ROUTES.app.settings

export const SETTINGS_GROUPS: ReadonlyArray<SettingsGroup> = [
  {
    key: 'personal',
    sections: [
      { key: 'profile', href: SETTINGS.profile, icon: UserCircleIcon, available: false },
      {
        key: 'notifications',
        href: SETTINGS.notifications,
        icon: BellIcon,
        available: false,
      },
    ],
  },
  {
    key: 'account',
    sections: [
      { key: 'company', href: SETTINGS.company, icon: BuildingsIcon, available: true },
      { key: 'team', href: SETTINGS.team, icon: UsersThreeIcon, available: false },
    ],
  },
  {
    key: 'workspace',
    sections: [
      {
        key: 'appearance',
        href: SETTINGS.appearance.brand,
        icon: PaletteIcon,
        available: true,
        children: [
          { key: 'brand', href: SETTINGS.appearance.brand },
          { key: 'theme', href: SETTINGS.appearance.theme },
          { key: 'typography', href: SETTINGS.appearance.typography },
        ],
      },
      { key: 'navigation', href: SETTINGS.navigation, icon: SidebarSimpleIcon, available: true },
      {
        key: 'nomenclature',
        href: SETTINGS.nomenclature,
        icon: TextAaIcon,
        available: true,
      },
      { key: 'fields', href: SETTINGS.fields, icon: ShapesIcon, available: true },
      { key: 'pipelines', href: SETTINGS.pipelines, icon: StackIcon, available: true },
      {
        key: 'activities',
        href: SETTINGS.activities,
        icon: CalendarCheckIcon,
        available: true,
      },
      {
        key: 'contacts',
        href: SETTINGS.contacts.status,
        icon: AddressBookIcon,
        available: true,
        children: [
          { key: 'status', href: SETTINGS.contacts.status },
          { key: 'lifecycle', href: SETTINGS.contacts.lifecycle },
          { key: 'sources', href: SETTINGS.contacts.sources },
          { key: 'tags', href: SETTINGS.contacts.tags },
        ],
      },
      { key: 'trash', href: SETTINGS.trash, icon: ArrowCounterClockwiseIcon, available: true },
    ],
  },
]
