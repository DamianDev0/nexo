import type { CallStatus } from '../model/types/call.types'

export function statusLabel(status: CallStatus, held: boolean, t: (key: string) => string): string {
  if (status === 'ended') return t('dialer.ended')
  if (status !== 'active') return t('dialer.connecting')
  if (held) return t('dialer.onHold')
  return t('dialer.inCall')
}
