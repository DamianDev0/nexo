import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { PartialType, PickType } from '@nestjs/mapped-types'
import { DUPLICATE_STRATEGIES } from '@/shared/imports/constants/import.constants'
import type { DuplicateStrategy } from '@repo/shared-types'
import { DocumentType, CONTACT_SORT_FIELDS, TAXONOMY_KEY_PATTERN } from '@repo/shared-types'
import type { ContactSortField, TaxonomyReassignKind } from '@repo/shared-types'
import { TaggedPaginationQueryDto } from '@/shared/dto/tagged-pagination-query.dto'
import { IsOptionalNotNull } from '@/shared/decorators/is-optional-not-null.decorator'

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  firstName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  whatsapp?: string

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  documentNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string

  @ApiPropertyOptional({ description: 'DANE 5-digit municipality code' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/)
  municipioCode?: string

  @ApiPropertyOptional({ description: 'Tenant taxonomy status key' })
  @IsOptionalNotNull()
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  status?: string

  @ApiPropertyOptional({ description: 'Tenant taxonomy source key, null clears it' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  source?: string | null

  @ApiPropertyOptional({ description: 'Tenant taxonomy lifecycle stage key' })
  @IsOptionalNotNull()
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  lifecycleStage?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptionalNotNull()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string

  @ApiPropertyOptional({ description: 'Avatar image URL', maxLength: 500 })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(500)
  avatarUrl?: string

  @ApiPropertyOptional({
    description: 'Tenant-defined custom field values',
    example: { industry: 'tech' },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}

export class ProbeContactDuplicatesDto extends PartialType(
  PickType(CreateContactDto, [
    'email',
    'phone',
    'whatsapp',
    'firstName',
    'lastName',
    'documentNumber',
  ] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  excludeId?: string
}

export class ContactQueryDto extends TaggedPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search (name, email, phone, document)' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({
    description: 'JSON array of {field, operator, value} conditions (AND semantics)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  advanced?: string

  @ApiPropertyOptional({ description: 'Tenant taxonomy status key' })
  @IsOptional()
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  status?: string

  @ApiPropertyOptional({ description: 'Tenant taxonomy source key' })
  @IsOptional()
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  source?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string

  @ApiPropertyOptional({ description: 'Tenant taxonomy lifecycle stage key' })
  @IsOptional()
  @IsString()
  @Matches(TAXONOMY_KEY_PATTERN)
  lifecycleStage?: string

  @ApiPropertyOptional({ description: 'Exact city match (case-insensitive)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({ description: 'Created at or after (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  createdFrom?: string

  @ApiPropertyOptional({ description: 'Created at or before (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  createdTo?: string

  @ApiPropertyOptional({ description: 'Last contacted at or after (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  lastContactedFrom?: string

  @ApiPropertyOptional({ description: 'Last contacted at or before (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  lastContactedTo?: string

  @ApiPropertyOptional({ description: 'List archived (inactive) contacts instead of active ones' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === true || value === 'true')
  @IsBoolean()
  archived?: boolean

  @ApiPropertyOptional({ enum: CONTACT_SORT_FIELDS })
  @IsOptional()
  @IsIn(CONTACT_SORT_FIELDS)
  sortBy?: ContactSortField

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}

export class ReassignTaxonomyDto {
  @ApiProperty({ enum: ['status', 'source', 'lifecycle', 'tag'] })
  @IsIn(['status', 'source', 'lifecycle', 'tag'])
  kind: TaxonomyReassignKind

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  fromKey: string

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  toKey: string
}

export class ExecuteContactImportDto {
  @IsString()
  @IsNotEmpty()
  fileId: string

  @IsOptional()
  mapping?: Record<string, string | null>

  @IsOptional()
  @IsIn(DUPLICATE_STRATEGIES)
  duplicateStrategy?: DuplicateStrategy
}

export const CONTACT_TIMELINE_MAX = 200
export const CONTACT_TIMELINE_DEFAULT = 50

export class ContactTimelineQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CONTACT_TIMELINE_MAX)
  limit?: number
}
