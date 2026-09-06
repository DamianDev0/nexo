import { DocumentType } from '@repo/shared-types'
import {
  coPhoneE164,
  formatCOPhoneIntl,
  phoneDigits,
  validateDocumentNumber,
} from '@repo/shared-utils'

export function contactTelHref(phone: string): string {
  return `tel:${coPhoneE164(phone)}`
}

export function contactDialNumber(phone: string): string {
  return coPhoneE164(phone)
}

export function contactWaHref(whatsapp: string): string {
  return `https://wa.me/${coPhoneE164(whatsapp).slice(1)}`
}

export function contactMailHref(email: string): string {
  return `mailto:${email}`
}

export function contactPhoneLabel(phone: string): string {
  return formatCOPhoneIntl(phone)
}

export function contactDocumentLabel(type: DocumentType | null, number: string): string {
  return type ? `${type.toUpperCase()} ${number}` : number
}

export function daysSince(iso: string): number {
  const elapsed = Date.now() - new Date(iso).getTime()
  return Math.floor(elapsed / (24 * 60 * 60 * 1000))
}

export function sameCOPhone(a: string, b: string): boolean {
  return phoneDigits(a) === phoneDigits(b)
}

function asDocumentType(value: string): DocumentType | null {
  const normalized = value.toLowerCase()
  const known: ReadonlyArray<string> = Object.values(DocumentType)
  return known.includes(normalized) ? (normalized as DocumentType) : null
}

export function isValidContactDocument(type: string | null, number: string): boolean {
  const known = type ? asDocumentType(type) : null
  if (!known) return true
  return validateDocumentNumber(known, number).isValid
}
