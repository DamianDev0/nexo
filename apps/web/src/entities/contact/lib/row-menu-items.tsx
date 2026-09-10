import {
  CalendarBlankIcon,
  ChatTextIcon,
  CheckSquareIcon,
  EnvelopeSimpleIcon,
  PencilSimpleIcon,
  PhoneIcon,
} from '@/shared/ui/icons'

import { contactDialNumber } from './contact-links'

import type { ContactNameLabels, ContactRowActions } from '../model/types/contact-cells.types'
import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { ContactListItem } from '@repo/shared-types'

export function buildRowMenuItems(
  contact: ContactListItem,
  labels: ContactNameLabels,
  actions: ContactRowActions,
): ReadonlyArray<ActionMenuItem> {
  const menu = labels.menu
  const phone = contact.phone ?? contact.whatsapp
  const items: ActionMenuItem[] = []

  if (actions.onOpen) {
    items.push({
      id: 'open',
      label: menu.open,
      icon: <PencilSimpleIcon />,
      onClick: () => actions.onOpen?.(contact),
    })
  }
  if (actions.onCall && phone) {
    items.push({
      id: 'call',
      label: menu.call,
      icon: <PhoneIcon />,
      onClick: () => actions.onCall?.(contactDialNumber(phone)),
    })
  }
  if (actions.onCompose && contact.phone) {
    items.push({
      id: 'sms',
      label: menu.sms,
      icon: <ChatTextIcon />,
      onClick: () => actions.onCompose?.('sms', contact),
    })
  }
  if (actions.onCompose && contact.email) {
    items.push({
      id: 'email',
      label: menu.email,
      icon: <EnvelopeSimpleIcon />,
      onClick: () => actions.onCompose?.('email', contact),
    })
  }
  if (actions.onLogActivity) {
    items.push(
      {
        id: 'task',
        label: menu.task,
        icon: <CheckSquareIcon />,
        onClick: () => actions.onLogActivity?.('task', contact),
      },
      {
        id: 'meeting',
        label: menu.meeting,
        icon: <CalendarBlankIcon />,
        onClick: () => actions.onLogActivity?.('meeting', contact),
      },
    )
  }

  return items
}
