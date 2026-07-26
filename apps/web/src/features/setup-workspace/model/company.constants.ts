import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '@repo/shared-utils'

export const REGIONAL_DEFAULTS = {
  timezoneDisplay: TIMEZONE_OPTIONS[0].label,
  currencyDisplay: CURRENCY_OPTIONS[0].label,
} as const
