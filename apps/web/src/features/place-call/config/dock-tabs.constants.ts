import { AddressBookIcon, ClockIcon, PhoneIcon } from '@/shared/ui/icons'

import type { DockTab } from '../model/types/call.types'
import type { AppIcon } from '@/shared/ui/icons'

export const TAB_ICONS: Readonly<Record<DockTab, AppIcon>> = {
  dialpad: PhoneIcon,
  calls: ClockIcon,
  contacts: AddressBookIcon,
}

export const TAB_ORDER: readonly DockTab[] = ['dialpad', 'calls', 'contacts']
