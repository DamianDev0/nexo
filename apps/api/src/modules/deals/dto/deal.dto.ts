import { PartialType } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DealStatus } from '@repo/shared-types'

// ─── Create ───────────────────────────────────────────────────────────────────

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  valueCents?: number

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string

  @IsOptional()
  @IsUUID()
  stageId?: string

  @IsOptional()
  @IsUUID()
  pipelineId?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  assignedToId?: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  lossReason?: string

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>
}

// ─── Update ───────────────────────────────────────────────────────────────────

export class UpdateDealDto extends PartialType(CreateDealDto) {}

// ─── Query / filters ─────────────────────────────────────────────────────────

export class DealQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus

  @IsOptional()
  @IsUUID()
  pipelineId?: string

  @IsOptional()
  @IsUUID()
  stageId?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  assignedToId?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number
}

// ─── Move stage ───────────────────────────────────────────────────────────────

export class MoveDealDto {
  @IsUUID()
  stageId: string

  @IsUUID()
  pipelineId: string
}

// ─── Mark lost ────────────────────────────────────────────────────────────────

export class LoseDealDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  lossReason?: string
}
