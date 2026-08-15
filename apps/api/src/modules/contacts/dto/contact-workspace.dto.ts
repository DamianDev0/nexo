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

import { CONTACT_TABLE_MAX_COLUMNS, CONTACT_VIEW_DENSITIES } from '@repo/shared-types'

import { ContactViewColumnsDto } from './contact-view.dto'

export class ContactTableStateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactViewColumnsDto)
  columns?: ContactViewColumnsDto

  @IsOptional()
  @IsIn(CONTACT_VIEW_DENSITIES)
  density?: (typeof CONTACT_VIEW_DENSITIES)[number]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(CONTACT_TABLE_MAX_COLUMNS)
  listOrder?: string[]
}

export class UpdateContactWorkspaceDto {
  @IsOptional()
  @ValidateIf((o: UpdateContactWorkspaceDto) => o.activeViewId !== null)
  @IsUUID()
  activeViewId?: string | null

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContactTableStateDto)
  tableState?: ContactTableStateDto
}
