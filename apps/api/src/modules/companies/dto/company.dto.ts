import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PartialType } from '@nestjs/mapped-types'
import { TaxRegime, CompanySize, CIIUSector } from '@repo/shared-types'
import { TaggedPaginationQueryDto } from '@/shared/dto/tagged-pagination-query.dto'

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp S.A.S' })
  @IsString()
  @Length(1, 300)
  name: string

  @ApiPropertyOptional({
    description: 'NIT without check digit: "900123456" or formatted "900.123.456-7"',
    example: '900123456',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\d.\-\s]{9,12}$/, { message: 'Invalid NIT format' })
  nit?: string

  @ApiPropertyOptional({ enum: TaxRegime })
  @IsOptional()
  @IsEnum(TaxRegime)
  taxRegime?: TaxRegime

  @ApiPropertyOptional({ enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize

  @ApiPropertyOptional({ enum: CIIUSector, description: 'CIIU Rev 4 sector letter' })
  @IsOptional()
  @IsEnum(CIIUSector)
  sectorCiiu?: CIIUSector

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string

  @ApiPropertyOptional({ description: 'Tenant-defined custom field values' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class CompanyQueryDto extends TaggedPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search (name, NIT)' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({ enum: TaxRegime })
  @IsOptional()
  @IsEnum(TaxRegime)
  taxRegime?: TaxRegime

  @ApiPropertyOptional({ enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize

  @ApiPropertyOptional({ enum: CIIUSector })
  @IsOptional()
  @IsEnum(CIIUSector)
  sectorCiiu?: CIIUSector

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string
}

export class AssignContactDto {
  @ApiProperty({ description: 'UUID of the contact to assign' })
  @IsUUID()
  contactId: string
}
