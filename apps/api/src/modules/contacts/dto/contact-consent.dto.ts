import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator'
import { CONSENT_CHANNELS } from '@repo/shared-types'
import type { ConsentChannel } from '@repo/shared-types'

export class UpsertContactConsentDto {
  @ApiProperty({ enum: CONSENT_CHANNELS })
  @IsIn(CONSENT_CHANNELS)
  channel: ConsentChannel

  @ApiProperty()
  @IsBoolean()
  granted: boolean

  @ApiPropertyOptional({ description: 'Where the consent was captured (form, call, import…)' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  source?: string

  @ApiPropertyOptional({ description: 'Why it was revoked or granted' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string

  @ApiPropertyOptional({ description: 'Evidence payload: IP, accepted text, message id…' })
  @IsOptional()
  @IsObject()
  evidence?: Record<string, unknown>
}
