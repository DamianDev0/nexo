import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
  IsArray,
  IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { SECTOR_KEYS } from '../constants/industry-presets'

export class UpdateAddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() street?: string
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string
  @ApiPropertyOptional() @IsOptional() @IsString() zipCode?: string
}

export class UpdateBusinessDto {
  @ApiPropertyOptional({ description: 'NIT without check digit' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6,15}(-\d)?$/, {
    message: 'NIT must be numeric digits, optionally followed by -DV',
  })
  nit?: string

  @ApiPropertyOptional({
    enum: ['responsible_iva', 'not_responsible', 'large_taxpayer', 'simple_regime'],
  })
  @IsOptional()
  @IsIn(['responsible_iva', 'not_responsible', 'large_taxpayer', 'simple_regime'])
  taxRegime?: string

  @ApiPropertyOptional({ type: UpdateAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) phone?: string
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string
}

export class UpdateI18nDto {
  @ApiPropertyOptional({ enum: ['es', 'en', 'pt'] })
  @IsOptional()
  @IsIn(['es', 'en', 'pt'])
  language?: string

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional({ example: 'COP' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string

  @ApiPropertyOptional({ enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] })
  @IsOptional()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string

  @ApiPropertyOptional({ enum: ['colombian', 'anglosaxon'] })
  @IsOptional()
  @IsIn(['colombian', 'anglosaxon'])
  numberFormat?: string
}

export class UpdateBillingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) legalName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() municipalityCode?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fiscalResponsibilities?: string[]
}

export class UpdateIndustryDto {
  @ApiPropertyOptional({ enum: SECTOR_KEYS })
  @IsOptional()
  @IsIn(SECTOR_KEYS)
  sector?: string
}

export class UpdateSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) businessName?: string

  @ApiPropertyOptional({ type: UpdateBusinessDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBusinessDto)
  business?: UpdateBusinessDto

  @ApiPropertyOptional({ type: UpdateI18nDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateI18nDto)
  i18n?: UpdateI18nDto

  @ApiPropertyOptional({ type: UpdateBillingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBillingDto)
  billing?: UpdateBillingDto

  @ApiPropertyOptional({ type: UpdateIndustryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateIndustryDto)
  industry?: UpdateIndustryDto
}
