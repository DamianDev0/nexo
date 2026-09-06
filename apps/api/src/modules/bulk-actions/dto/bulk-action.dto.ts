import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { BULK_ACTION_KINDS, BULK_ACTION_STATUSES } from '@repo/shared-types'
import type {
  BulkActionKind,
  BulkActionStatus,
  ContactListQuery,
  CustomFieldEntity,
} from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@repo/shared-utils'
import { BULK_MAX_SELECTION_IDS } from '../constants/bulk-action.constants'

const ENTITIES: CustomFieldEntity[] = ['contacts', 'companies', 'deals']

export class BulkSelectionDto {
  @ApiProperty({ enum: ['ids', 'filter'] })
  @IsIn(['ids', 'filter'])
  mode: 'ids' | 'filter'

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(BULK_MAX_SELECTION_IDS)
  @IsUUID('4', { each: true })
  ids?: string[]

  @ApiPropertyOptional({ description: 'Contact list query; every match becomes a target' })
  @IsOptional()
  @IsObject()
  query?: ContactListQuery
}

export class BulkDripDto {
  @ApiProperty({ minimum: 1, maximum: 5000 })
  @IsInt()
  @Min(1)
  @Max(5000)
  batchSize: number

  @ApiProperty({ minimum: 10, maximum: 86_400 })
  @IsInt()
  @Min(10)
  @Max(86_400)
  intervalSeconds: number
}

export class CreateBulkActionDto {
  @ApiProperty({ enum: ENTITIES })
  @IsIn(ENTITIES)
  entity: CustomFieldEntity

  @ApiProperty({ enum: BULK_ACTION_KINDS })
  @IsIn(BULK_ACTION_KINDS)
  action: BulkActionKind

  @ApiPropertyOptional({ description: 'Action-specific parameters' })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>

  @ApiProperty({ type: BulkSelectionDto })
  @ValidateNested()
  @Type(() => BulkSelectionDto)
  selection: BulkSelectionDto

  @ApiPropertyOptional({ type: BulkDripDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BulkDripDto)
  drip?: BulkDripDto
}

export class BulkActionQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: DEFAULT_PAGE_SIZE, minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number = DEFAULT_PAGE_SIZE

  @ApiPropertyOptional({ enum: ENTITIES })
  @IsOptional()
  @IsIn(ENTITIES)
  entity?: CustomFieldEntity

  @ApiPropertyOptional({ enum: BULK_ACTION_STATUSES })
  @IsOptional()
  @IsIn(BULK_ACTION_STATUSES)
  status?: BulkActionStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdById?: string
}
