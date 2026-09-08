import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import type { MessageChannel } from '@repo/shared-types'
import { SMS_BODY_MAX } from '@repo/shared-utils'

const CHANNELS: readonly MessageChannel[] = ['sms']

export class SendMessageDto {
  @IsIn(CHANNELS)
  channel: MessageChannel

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  to: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(SMS_BODY_MAX)
  body: string

  @IsOptional()
  @IsUUID()
  contactId?: string
}
