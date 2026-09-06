import {
  CalendarBlankIcon,
  ChartLineUpIcon,
  CircleIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
  ShapesIcon,
  SignpostIcon,
  TagIcon,
  UserCircleIcon,
  UserIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export const ADVANCED_FILTER_ICONS: Readonly<Record<string, AppIcon>> = {
  name: UserIcon,
  email: EnvelopeSimpleIcon,
  phone: PhoneIcon,
  whatsapp: WhatsappLogoIcon,
  city: MapPinIcon,
  status: CircleIcon,
  source: SignpostIcon,
  lifecycleStage: ChartLineUpIcon,
  assignedTo: UserCircleIcon,
  tags: TagIcon,
  createdAt: CalendarBlankIcon,
  updatedAt: CalendarBlankIcon,
  lastContactedAt: ClockIcon,
  custom: ShapesIcon,
}
