import { BadRequestException } from '@nestjs/common'

export type TwilioWebhookBody = Readonly<Record<string, string | undefined>>

export function requiredField(body: TwilioWebhookBody, key: string): string {
  const value = body[key]
  if (typeof value !== 'string' || value === '') {
    throw new BadRequestException(`Missing webhook field ${key}`)
  }
  return value
}

export function optionalField(body: TwilioWebhookBody, key: string): string | null {
  const value = body[key]
  return value === undefined || value === '' ? null : value
}

export function optionalInt(body: TwilioWebhookBody, key: string): number | null {
  const value = optionalField(body, key)
  if (value === null) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}
