import {
  AddressBookIcon,
  ChatCircleIcon,
  ChatTextIcon,
  DotsThreeIcon,
  PhoneIcon,
} from '@/shared/ui/icons'

import type { DockScreen, PhoneTab, PresenceKey } from '../model/types/call.types'
import type { AppIcon } from '@/shared/ui/icons'

export const SCREEN_ICONS: Readonly<Record<DockScreen, AppIcon>> = {
  phone: PhoneIcon,
  messages: ChatTextIcon,
  contacts: AddressBookIcon,
  chat: ChatCircleIcon,
  more: DotsThreeIcon,
}

export const SCREEN_ORDER: readonly DockScreen[] = ['phone', 'messages', 'contacts', 'chat', 'more']

export const DISABLED_SCREENS: readonly DockScreen[] = ['messages', 'chat']

export const PHONE_TABS: readonly PhoneTab[] = ['dialpad', 'calls']

export const PRESENCE_ORDER: readonly PresenceKey[] = ['available', 'busy', 'dnd', 'invisible']

export const PRESENCE_TONES: Readonly<Record<PresenceKey, string>> = {
  available: 'bg-positive',
  busy: 'bg-warning',
  dnd: 'bg-destructive',
  invisible: 'bg-muted-foreground',
}
