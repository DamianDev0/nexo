import type { TelephonyError } from '../model/types/call.types'

const TWILIO_ERROR_BY_CODE: Readonly<Record<number, TelephonyError>> = {
  20101: 'tokenExpired',
  20104: 'tokenExpired',
  20151: 'tokenExpired',
  31202: 'tokenExpired',
  31204: 'tokenExpired',
  31205: 'tokenExpired',
  31001: 'deviceNotReady',
  31002: 'callRejected',
  31003: 'networkError',
  31005: 'networkError',
  31009: 'networkError',
  53000: 'networkError',
  53001: 'networkError',
  53405: 'networkError',
  31008: 'callRejected',
  31603: 'callRejected',
  31480: 'busy',
  31486: 'busy',
  31400: 'invalidNumber',
  31404: 'invalidNumber',
  31401: 'microphoneDenied',
  31402: 'microphoneDenied',
  31206: 'providerError',
}

export function toTelephonyError(error: unknown): TelephonyError {
  if (typeof error !== 'object' || error === null || !('code' in error)) return 'callFailed'
  const code = Number((error as { code: unknown }).code)
  return TWILIO_ERROR_BY_CODE[code] ?? 'callFailed'
}
