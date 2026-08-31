import {
  CalendarBlankIcon,
  ChartLineUpIcon,
  CircleIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  HashIcon,
  MapPinIcon,
  PhoneIcon,
  ShapesIcon,
  SignpostIcon,
  TagIcon,
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
  tags: TagIcon,
  leadScore: HashIcon,
  createdAt: CalendarBlankIcon,
  updatedAt: CalendarBlankIcon,
  lastContactedAt: ClockIcon,
  custom: ShapesIcon,
}
