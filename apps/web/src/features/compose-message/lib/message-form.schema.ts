import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import { z } from 'zod'

import {
  CHANNEL_HAS_SUBJECT,
  MESSAGE_BODY_MAX,
  MESSAGE_SUBJECT_MAX,
} from '../config/message-channels'

import type { MessageChannel } from '../config/message-channels'
import type { TFunction } from 'i18next'

function recipientSchema(t: TFunction, channel: MessageChannel) {
  if (channel === 'email') {
    return z
      .string()
      .trim()
      .min(1, t('contacts.composers.message.toRequired'))
      .email(t('contacts.composers.message.toInvalid'))
  }
  return z
    .string()
    .trim()
    .min(1, t('contacts.composers.message.toRequired'))
    .transform(phoneDigits)
    .refine(isValidCOPhone, t('contacts.composers.message.toInvalid'))
}

function emailListSchema(t: TFunction) {
  const email = z.string().email()
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || value.split(',').every((part) => email.safeParse(part.trim()).success),
      t('contacts.composers.message.recipientsInvalid'),
    )
}

export function buildMessageSchema(t: TFunction, channel: MessageChannel) {
  const max = MESSAGE_BODY_MAX[channel]
  return z.object({
    to: recipientSchema(t, channel),
    cc: emailListSchema(t),
    bcc: emailListSchema(t),
    subject: z.string().trim().max(MESSAGE_SUBJECT_MAX),
    body: z
      .string()
      .trim()
      .min(1, t('contacts.composers.message.bodyRequired'))
      .max(max, t('contacts.composers.message.bodyTooLong', { max })),
  })
}

export type MessageFormValues = z.infer<ReturnType<typeof buildMessageSchema>>

export type RecipientSource = {
  readonly id: string
  readonly email: string | null
  readonly phone: string | null
  readonly whatsapp: string | null
}

export function messageDefaults(channel: MessageChannel, contact: RecipientSource) {
  const to =
    channel === 'email'
      ? (contact.email ?? '')
      : channel === 'whatsapp'
        ? (contact.whatsapp ?? contact.phone ?? '')
        : (contact.phone ?? contact.whatsapp ?? '')
  return { to, cc: '', bcc: '', subject: '', body: '' }
}

export function channelHasSubject(channel: MessageChannel): boolean {
  return CHANNEL_HAS_SUBJECT[channel]
}
