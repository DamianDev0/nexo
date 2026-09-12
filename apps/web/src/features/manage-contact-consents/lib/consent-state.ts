import { CONSENT_CHANNELS } from '@repo/shared-types'

import type { ConsentChannel, ContactConsent } from '@repo/shared-types'

export type ChannelConsent = {
  readonly channel: ConsentChannel
  readonly granted: boolean
  readonly recorded: boolean
  readonly reason: string | null
  readonly updatedAt: string | null
}

export function buildChannelConsents(
  consents: ReadonlyArray<ContactConsent>,
): ReadonlyArray<ChannelConsent> {
  const byChannel = new Map(consents.map((consent) => [consent.channel, consent]))

  return CONSENT_CHANNELS.map((channel) => {
    const recorded = byChannel.get(channel)
    return {
      channel,
      granted: recorded ? recorded.granted : true,
      recorded: recorded !== undefined,
      reason: recorded?.reason ?? null,
      updatedAt: recorded?.updatedAt ?? null,
    }
  })
}

export function revokedChannels(
  consents: ReadonlyArray<ContactConsent>,
): ReadonlyArray<ConsentChannel> {
  return consents.filter((consent) => !consent.granted).map((consent) => consent.channel)
}
