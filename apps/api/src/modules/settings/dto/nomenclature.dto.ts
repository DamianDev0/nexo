import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import type { TenantNomenclature } from '../interfaces/nomenclature.interface'

export class TermDto {
  @IsString() singular: string
  @IsString() plural: string
}

export class UpdateNomenclatureDto implements Partial<TenantNomenclature> {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TermDto)
  contact?: TermDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TermDto)
  company?: TermDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TermDto)
  deal?: TermDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TermDto)
  activity?: TermDto
}
