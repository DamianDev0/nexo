import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PartialType } from '@nestjs/mapped-types'
import { Transform, Type } from 'class-transformer'
import {
  DocumentType,
  ContactStatus,
  ContactSource,
  LifecycleStage,
  CONTACT_SORT_FIELDS,
} from '@repo/shared-types'
import type { ContactSortField } from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@repo/shared-utils'

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

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus

  @ApiPropertyOptional({ enum: ContactSource })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  leadScore?: number

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

export class ContactQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search (name, email, phone, document)' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus

  @ApiPropertyOptional({ enum: ContactSource })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource

  @ApiPropertyOptional({ type: [String], description: 'Filter by tags (ALL must match)' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value
    return value ? [value] : undefined
  })
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
}
