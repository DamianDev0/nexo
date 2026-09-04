import { formatCallDuration } from './call-duration'

import type { CallStatus } from '../model/types/call.types'

export function statusLabel(
  status: CallStatus,
  seconds: number,
  t: (key: string) => string,
): string {
  if (status === 'active') return formatCallDuration(seconds)
  if (status === 'ended') return t('dialer.ended')
  return t('dialer.connecting')
}
