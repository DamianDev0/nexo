import { PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { MAX_PAGE_SIZE } from '@repo/shared-utils'

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  activityType: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  @Type(() => Number)
  durationMinutes?: number

  @IsOptional()
  @IsDateString()
  reminderAt?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  dealId?: string

  @IsOptional()
  @IsUUID()
  assignedToId?: string
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class ActivityQueryDto {
  @IsOptional()
  @IsString()
  activityType?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  dealId?: string

  @IsOptional()
  @IsUUID()
  assignedToId?: string

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

export class CalendarQueryDto {
  @IsDateString()
  from: string

  @IsDateString()
  to: string

  @IsOptional()
  @IsUUID()
  userId?: string
}
