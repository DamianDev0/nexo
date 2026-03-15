import {
  IsHexColor,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'

const FONT_FAMILIES = ['inter', 'roboto', 'poppins', 'nunito', 'system'] as const
const BORDER_RADII = ['none', 'sm', 'md', 'lg', 'full'] as const
const DENSITIES = ['compact', 'comfortable', 'spacious'] as const
const ICON_PACKS = ['outline', 'filled', 'duotone', 'rounded'] as const
const DARK_MODES = ['light', 'dark', 'system'] as const

export class UpdateThemeColorsDto {
  @IsOptional() @IsHexColor() primary?: string
  @IsOptional() @IsHexColor() primaryForeground?: string
  @IsOptional() @IsHexColor() secondary?: string
  @IsOptional() @IsHexColor() accent?: string
  @IsOptional() @IsHexColor() sidebar?: string
  @IsOptional() @IsHexColor() sidebarForeground?: string
}

export class UpdateThemeTypographyDto {
  @IsOptional() @IsIn(FONT_FAMILIES) fontFamily?: TenantTheme['typography']['fontFamily']
  @IsOptional() @IsIn(BORDER_RADII) borderRadius?: TenantTheme['typography']['borderRadius']
  @IsOptional() @IsIn(DENSITIES) density?: TenantTheme['typography']['density']
}

export class UpdateThemeBrandingDto {
  @ApiPropertyOptional() @IsOptional() @IsUrl() logoUrl?: string | null
  @ApiPropertyOptional() @IsOptional() @IsUrl() faviconUrl?: string | null
  @ApiPropertyOptional() @IsOptional() @IsUrl() loginBgUrl?: string | null
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() loginTagline?: string | null
}

export class UpdateThemeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateThemeColorsDto)
  colors?: UpdateThemeColorsDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateThemeTypographyDto)
  typography?: UpdateThemeTypographyDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateThemeBrandingDto)
  branding?: UpdateThemeBrandingDto

  @ApiPropertyOptional({ enum: ICON_PACKS })
  @IsOptional()
  @IsIn(ICON_PACKS)
  iconPack?: TenantTheme['iconPack']

  @ApiPropertyOptional({ enum: DARK_MODES })
  @IsOptional()
  @IsIn(DARK_MODES)
  darkModeDefault?: TenantTheme['darkModeDefault']
}
