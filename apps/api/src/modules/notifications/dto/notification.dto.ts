import { PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'

export class NotificationQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  unread?: string

  @IsOptional()
  @IsString()
  notificationType?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  inApp?: boolean

  @IsOptional()
  @IsBoolean()
  email?: boolean

  @IsOptional()
  @IsBoolean()
  push?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutedTypes?: string[]
}
