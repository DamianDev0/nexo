import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { SidebarConfigInput, SidebarModuleInput } from '../interfaces/sidebar-config.interface'

export class SidebarModuleDto implements SidebarModuleInput {
  @ApiProperty() @IsString() key: string
  @ApiProperty() @IsString() label: string
  @ApiProperty() @IsString() icon: string
  @ApiProperty() @IsBoolean() enabled: boolean
  @ApiProperty() @IsInt() @Min(1) order: number
  @ApiPropertyOptional() @IsOptional() @IsUrl() customIconUrl: string | null
  @ApiProperty() @IsBoolean() required: boolean
}

export class UpdateSidebarDto implements SidebarConfigInput {
  @ApiProperty({ type: [SidebarModuleDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SidebarModuleDto)
  modules: SidebarModuleDto[]
}
