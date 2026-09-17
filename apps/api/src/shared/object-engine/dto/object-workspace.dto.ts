import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

import { OBJECT_TABLE_MAX_COLUMNS, OBJECT_VIEW_DENSITIES } from '@repo/shared-types'

import { ObjectViewColumnsDto } from './object-view.dto'

export class ObjectTableStateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ObjectViewColumnsDto)
  columns?: ObjectViewColumnsDto

  @IsOptional()
  @IsIn(OBJECT_VIEW_DENSITIES)
  density?: (typeof OBJECT_VIEW_DENSITIES)[number]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(OBJECT_TABLE_MAX_COLUMNS)
  listOrder?: string[]
}

export class UpdateObjectWorkspaceDto {
  @IsOptional()
  @ValidateIf((o: UpdateObjectWorkspaceDto) => o.activeViewId !== null)
  @IsUUID()
  activeViewId?: string | null

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ObjectTableStateDto)
  tableState?: ObjectTableStateDto
}
