import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import {
  SWATCH_COLOR_PATTERN,
  TAXONOMY_DESCRIPTION_MAX,
  TAXONOMY_KEY_PATTERN,
} from '@repo/shared-types'
import type { ContactTaxonomy, TaxonomyOption } from '@repo/shared-types'

export class TaxonomyOptionDto implements TaxonomyOption {
  @ApiProperty({ description: 'Stable key stored on the contact row' })
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN, { message: 'key must be lowercase snake_case' })
  key: string

  @ApiProperty({ nullable: true, description: 'Null falls back to the localized system label' })
  @IsOptional()
  @IsString()
  label: string | null

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(TAXONOMY_DESCRIPTION_MAX)
  description: string | null

  @ApiProperty()
  @Matches(SWATCH_COLOR_PATTERN)
  color: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  order: number

  @ApiProperty()
  @IsBoolean()
  isSystem: boolean

  @ApiProperty()
  @IsBoolean()
  enabled: boolean
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

  @ApiProperty({ type: [TaxonomyOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxonomyOptionDto)
  types: TaxonomyOptionDto[]
}
