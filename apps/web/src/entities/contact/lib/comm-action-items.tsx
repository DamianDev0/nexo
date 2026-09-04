import { CopyIcon, PhoneIcon } from '@/shared/ui/icons'

import { contactDialNumber, contactTelHref } from './contact-links'

import type { CommCellActions } from '../model/types/contact-cells.types'
import type { ActionDockItem } from '@/shared/ui/molecules/action-dock'

export function copyAction(
  label: string,
  value: string,
  actions?: CommCellActions,
): ActionDockItem {
  return {
    id: 'copy',
    label,
    icon: <CopyIcon />,
    onClick: () => actions?.onCopy?.(value),
  }
}

export function callAction(
  number: string,
  label: string,
  onCall?: (value: string) => void,
): ActionDockItem {
  if (onCall) {
    return {
      id: 'call',
      label,
      icon: <PhoneIcon />,
      onClick: () => onCall(contactDialNumber(number)),
    }
  }
  return { id: 'call', label, icon: <PhoneIcon />, href: contactTelHref(number) }
}
