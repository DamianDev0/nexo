import type { ConsentChannel } from '@repo/shared-types'

type OptedOutSource = {
  readonly optedOutChannels: ReadonlyArray<ConsentChannel>
}

export function isChannelBlocked(contact: OptedOutSource, channel: ConsentChannel): boolean {
  return contact.optedOutChannels.includes(channel)
}
