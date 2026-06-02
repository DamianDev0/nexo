import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const EXPORT_FORMATS = ['css', 'dtcg'] as const

export type ThemeExportFormat = (typeof EXPORT_FORMATS)[number]

export class ImportThemeDto {
  @ApiProperty({ description: 'Raw shadcn CSS variables block or W3C DTCG JSON' })
  @IsString()
  @IsNotEmpty()
  source!: string
}

export class ExportThemeQueryDto {
  @ApiPropertyOptional({ enum: EXPORT_FORMATS, default: 'css' })
  @IsOptional()
  @IsIn(EXPORT_FORMATS)
  format?: ThemeExportFormat
}
