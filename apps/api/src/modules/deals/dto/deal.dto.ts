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

export class UpdateDealDto extends PartialType(CreateDealDto) {}

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

export class MoveDealDto {
  @IsUUID()
  stageId: string

  @IsUUID()
  pipelineId: string
}

export class CreateDealItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number

  @IsInt()
  @Min(0)
  @Type(() => Number)
  unitPriceCents: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ivaRate?: number
}

export class UpdateDealItemDto extends PartialType(CreateDealItemDto) {}

export class LoseDealDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  lossReason: string
}
