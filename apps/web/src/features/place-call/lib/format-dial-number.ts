const dialCharPattern = /^[0-9*#+]$/

export function isDialChar(char: string): boolean {
  return dialCharPattern.test(char)
}

export function toDialString(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  const chars = [...trimmed].filter((char) => /[0-9*#]/.test(char)).join('')
  return `${plus}${chars}`
}

function groupDigits(digits: string): string {
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  return digits
}

export function formatDialNumber(digits: string): string {
  if (digits === '') return ''
  if (!digits.startsWith('+')) return groupDigits(digits)
  if (!digits.startsWith('+57')) return digits
  const national = digits.slice(3)
  return national === '' ? '+57' : `+57 ${groupDigits(national)}`
}
