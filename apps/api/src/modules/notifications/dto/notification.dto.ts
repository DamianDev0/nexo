import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { MAX_PAGE_SIZE } from '@repo/shared-utils'

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
  @Max(MAX_PAGE_SIZE)
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
