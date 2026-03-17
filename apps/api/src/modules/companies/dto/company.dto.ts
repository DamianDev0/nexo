import {
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PartialType } from '@nestjs/mapped-types'
import { Transform, Type } from 'class-transformer'
import { TaxRegime, CompanySize, CIIUSector } from '@repo/shared-types'

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

export class CompanyQueryDto {
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
  assignedToId?: string

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25
}

export class AssignContactDto {
  @ApiProperty({ description: 'UUID of the contact to assign' })
  @IsUUID()
  contactId: string
}
