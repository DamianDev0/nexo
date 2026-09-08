import type { CallStatus, TelephonyError } from '../model/types/call.types'

type StatusLabelInput = {
  readonly status: CallStatus
  readonly held: boolean
  readonly error: TelephonyError | null
}

export function statusLabel(
  { status, held, error }: StatusLabelInput,
  t: (key: string) => string,
): string {
  if (status === 'failed') return t(`dialer.errors.${error ?? 'callFailed'}`)
  if (status === 'ended') return t('dialer.ended')
  if (status === 'ringing') return t('dialer.ringing')
  if (status !== 'active') return t('dialer.connecting')
  if (held) return t('dialer.onHold')
  return t('dialer.inCall')
}
