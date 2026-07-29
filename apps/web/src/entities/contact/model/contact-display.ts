import { ContactStatus } from '@repo/shared-types'

import type { ContactListItem } from '@repo/shared-types'

export type StatusTone = 'neutral' | 'info' | 'warning' | 'positive' | 'negative' | 'outline'

export const CONTACT_STATUS_TONE: Record<ContactStatus, StatusTone> = {
  [ContactStatus.NEW]: 'info',
  [ContactStatus.IN_CONTACT]: 'warning',
  [ContactStatus.QUALIFIED]: 'positive',
  [ContactStatus.UNQUALIFIED]: 'negative',
  [ContactStatus.NURTURING]: 'outline',
  [ContactStatus.CLIENT]: 'positive',
  [ContactStatus.INACTIVE]: 'neutral',
  [ContactStatus.LOST]: 'negative',
}

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

export function contactAvatarTone(id: string): AvatarTone {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? 'lime'
}
