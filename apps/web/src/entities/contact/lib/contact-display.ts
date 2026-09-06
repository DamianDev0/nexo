import { CO_TIMEZONE, formatDateCO } from '@repo/shared-utils'

import { CONTACT_AVATARS } from '../config/contact-avatars.constants'

import type { ContactListItem } from '@repo/shared-types'

export type AvatarTone = 'lime' | 'warning' | 'info' | 'neutral'

const AVATAR_TONES: readonly AvatarTone[] = ['lime', 'info', 'warning', 'neutral']

export function contactFullName(contact: Pick<ContactListItem, 'firstName' | 'lastName'>): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(' ')
}

export function contactInitials(contact: Pick<ContactListItem, 'firstName' | 'lastName'>): string {
  const first = contact.firstName.charAt(0)
  const last = contact.lastName?.charAt(0) ?? contact.firstName.charAt(1)
  return `${first}${last ?? ''}`
}

function hashId(id: string): number {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return hash
}

export function contactAvatarTone(id: string): AvatarTone {
  return AVATAR_TONES[hashId(id) % AVATAR_TONES.length] ?? 'lime'
}

export function contactAvatarUrl(contact: Pick<ContactListItem, 'id' | 'avatarUrl'>): string {
  if (contact.avatarUrl) return contact.avatarUrl
  return CONTACT_AVATARS[hashId(contact.id) % CONTACT_AVATARS.length] ?? CONTACT_AVATARS[0] ?? ''
}

export type ContactCreatedParts = { readonly date: string; readonly time: string }

const TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function timeFormatter(locale: string): Intl.DateTimeFormat {
  const cached = TIME_FORMATTERS.get(locale)
  if (cached) return cached
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: CO_TIMEZONE,
  })
  TIME_FORMATTERS.set(locale, formatter)
  return formatter
}

export function contactCreatedParts(iso: string, locale: string): ContactCreatedParts {
  return {
    date: formatDateCO(iso),
    time: timeFormatter(locale).format(new Date(iso)),
  }
}
