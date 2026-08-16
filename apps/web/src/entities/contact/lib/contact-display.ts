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
