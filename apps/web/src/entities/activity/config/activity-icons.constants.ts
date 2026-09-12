import {
  CalendarBlankIcon,
  ChatCircleIcon,
  CheckSquareIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  HandshakeIcon,
  LightbulbIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  UsersThreeIcon,
} from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export const ACTIVITY_ICON_MAP: Record<string, AppIcon> = {
  phone: PhoneIcon,
  mail: EnvelopeSimpleIcon,
  calendar: CalendarBlankIcon,
  'check-square': CheckSquareIcon,
  'file-text': FileTextIcon,
  'message-circle': ChatCircleIcon,
  users: UsersThreeIcon,
  clock: ClockIcon,
  'map-pin': MapPinIcon,
  handshake: HandshakeIcon,
  lightbulb: LightbulbIcon,
  tag: TagIcon,
}

export const ACTIVITY_ICON_NAMES: ReadonlyArray<string> = Object.keys(ACTIVITY_ICON_MAP)

export const DEFAULT_ACTIVITY_ICON = 'calendar'

export const FALLBACK_ACTIVITY_ICON: AppIcon = CalendarBlankIcon
