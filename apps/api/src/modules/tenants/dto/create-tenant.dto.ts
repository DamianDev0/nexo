import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTenantDto {
  @ApiProperty({ example: 'Distribuidora ABC' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 300)
  name: string

  @ApiProperty({ example: 'distribuidora-abc', description: 'Tenant subdomain (lowercase letters, numbers, and hyphens only)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 63)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
  })
  slug: string

  @ApiPropertyOptional({ example: 'free' })
  @IsOptional()
  @IsString()
  planName?: string
}
