import {
  CalendarBlankIcon,
  ChatTextIcon,
  CheckSquareIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  NotePencilIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'

import type { ActivityKindKey } from './activity-groups'
import type { ReactNode } from 'react'

const ACTIVITY_ICONS: Record<ActivityKindKey, ReactNode> = {
  call: <PhoneIcon />,
  meeting: <CalendarBlankIcon />,
  email: <EnvelopeSimpleIcon />,
  task: <CheckSquareIcon />,
  note: <NotePencilIcon />,
  whatsapp: <WhatsappLogoIcon />,
  sms: <ChatTextIcon />,
  other: <ClockIcon />,
}

export function activityIcon(kind: ActivityKindKey): ReactNode {
  return ACTIVITY_ICONS[kind]
}
