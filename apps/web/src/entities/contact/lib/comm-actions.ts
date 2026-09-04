import type {
  CommCellActions,
  ContactComposeChannel,
  ContactRowActions,
} from '../model/types/contact-cells.types'
import type { ContactListItem } from '@repo/shared-types'

export function commCellActions(
  actions: ContactRowActions | undefined,
  channel: ContactComposeChannel,
  contact: ContactListItem,
): CommCellActions {
  return {
    onCopy: actions?.onCopy,
    onCall: actions?.onCall,
    onCompose: actions?.onCompose ? () => actions.onCompose?.(channel, contact) : undefined,
  }
}
