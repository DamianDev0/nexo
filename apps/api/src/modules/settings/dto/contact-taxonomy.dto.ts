import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'
import type { ContactTaxonomy, TaxonomyOption } from '@repo/shared-types'

const KEY_PATTERN = /^[a-z][a-z0-9_]{0,39}$/

export class TaxonomyOptionDto implements TaxonomyOption {
  @ApiProperty({ description: 'Stable key stored on the contact row' })
  @IsString()
  @Matches(KEY_PATTERN, { message: 'key must be lowercase snake_case' })
  key: string

  @ApiProperty({ nullable: true, description: 'Null falls back to the localized system label' })
  @IsOptional()
  @IsString()
  label: string | null

  @ApiProperty()
  @IsHexColor()
  color: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  order: number

  @ApiProperty()
  @IsBoolean()
  isSystem: boolean
}

export class UpdateContactTaxonomyDto implements ContactTaxonomy {
  @ApiProperty({ type: [TaxonomyOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxonomyOptionDto)
  statuses: TaxonomyOptionDto[]

  @ApiProperty({ type: [TaxonomyOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxonomyOptionDto)
  sources: TaxonomyOptionDto[]
}
