import { SMS_BODY_MAX } from '@repo/shared-utils'

export const MESSAGE_CHANNELS = ['email', 'sms', 'whatsapp'] as const

export type MessageChannel = (typeof MESSAGE_CHANNELS)[number]

export const MESSAGE_BODY_MAX: Record<MessageChannel, number> = {
  email: 10000,
  sms: SMS_BODY_MAX,
  whatsapp: 4096,
}

export const CHANNEL_SEND_ENABLED: Record<MessageChannel, boolean> = {
  email: false,
  sms: true,
  whatsapp: false,
}

export const CHANNEL_HAS_SUBJECT: Record<MessageChannel, boolean> = {
  email: true,
  sms: false,
  whatsapp: false,
}

export const MESSAGE_SUBJECT_MAX = 200
export const MESSAGE_ATTACH_ACCEPT = ''
export const MESSAGE_MEDIA_ACCEPT = 'image/*'

export type ChannelMarks = {
  readonly bold: string
  readonly italic: string
  readonly strike: string
}

export const CHANNEL_MARKS: Record<MessageChannel, ChannelMarks | null> = {
  email: { bold: '**', italic: '_', strike: '~~' },
  whatsapp: { bold: '*', italic: '_', strike: '~' },
  sms: null,
}

export const CHANNEL_HAS_LISTS: Record<MessageChannel, boolean> = {
  email: true,
  whatsapp: false,
  sms: false,
}
