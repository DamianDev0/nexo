import type { VoiceIdentity } from '../interfaces/twilio-webhook.interfaces'

const HEX_UUID = /^[0-9a-f]{32}$/
const IDENTITY = /^t([0-9a-f]{32})_u([0-9a-f]{32})$/
const CLIENT_PREFIX = 'client:'

function toHex(uuid: string): string {
  const hex = uuid.replaceAll('-', '').toLowerCase()
  if (!HEX_UUID.test(hex)) throw new TypeError(`Invalid UUID: ${uuid}`)
  return hex
}

function toUuid(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function encodeVoiceIdentity(tenantId: string, userId: string): string {
  return `t${toHex(tenantId)}_u${toHex(userId)}`
}

export function decodeVoiceIdentity(identity: string): VoiceIdentity | null {
  const match = IDENTITY.exec(identity)
  if (!match) return null
  return { tenantId: toUuid(match[1]!), userId: toUuid(match[2]!) }
}

export function identityFromClientAddress(address: string | undefined): string | null {
  if (!address?.startsWith(CLIENT_PREFIX)) return null
  return address.slice(CLIENT_PREFIX.length)
}
