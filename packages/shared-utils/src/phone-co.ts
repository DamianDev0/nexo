const PHONE_DIGITS = 10
const MOBILE_PREFIX = '3'
const LANDLINE_PREFIX = '60'
const COUNTRY_CODE = '57'

export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '')
  const national =
    digits.length > PHONE_DIGITS && digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits
  return national.slice(0, PHONE_DIGITS)
}

export function isValidCOPhone(value: string): boolean {
  const digits = phoneDigits(value)
  if (digits.length !== PHONE_DIGITS) return false
  return digits.startsWith(MOBILE_PREFIX) || digits.startsWith(LANDLINE_PREFIX)
}

export function isMobileCOPhone(value: string): boolean {
  const digits = phoneDigits(value)
  return digits.length === PHONE_DIGITS && digits.startsWith(MOBILE_PREFIX)
}

export function formatCOPhone(value: string): string {
  const digits = phoneDigits(value)
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
  return groups.filter(Boolean).join(' ')
}
