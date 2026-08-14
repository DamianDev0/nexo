import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
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
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PartialType, PickType } from '@nestjs/mapped-types'
import {
  DocumentType,
  LifecycleStage,
  CONTACT_SORT_FIELDS,
  TAXONOMY_KEY_PATTERN,
} from '@repo/shared-types'
import type { ContactSortField, TaxonomyReassignKind } from '@repo/shared-types'
import { TaggedPaginationQueryDto } from '@/shared/dto/tagged-pagination-query.dto'

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
  @Length(1, 150)
  jobTitle?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  linkedinUrl?: string

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  birthday?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string

  @ApiPropertyOptional({ description: 'Street address, canonicalized on the client' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string

  @ApiPropertyOptional({ description: 'DANE 5-digit municipality code' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/)
  municipioCode?: string

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

  @ApiPropertyOptional({ description: 'Tenant taxonomy type key' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  type?: string

  @ApiPropertyOptional({ description: 'Free-text label, persisted only when type is other' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  typeLabel?: string

  @ApiPropertyOptional({ enum: LifecycleStage })
  @IsOptional()
  @IsEnum(LifecycleStage)
  lifecycleStage?: LifecycleStage

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  leadScore?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dataConsent?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  consentSource?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optOutEmail?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optOutSms?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optOutWhatsapp?: boolean

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
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

  @ApiPropertyOptional({ enum: LifecycleStage })
  @IsOptional()
  @IsEnum(LifecycleStage)
  lifecycleStage?: LifecycleStage

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
  @ApiProperty({ enum: ['status', 'source', 'type', 'tag'] })
  @IsIn(['status', 'source', 'type', 'tag'])
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
