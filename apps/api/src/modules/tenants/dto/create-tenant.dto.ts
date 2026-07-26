import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PlanName } from '@repo/shared-types'
import { TENANT_SLUG_REGEX } from '@repo/shared-utils'

export class CreateTenantDto {
  @ApiProperty({ example: 'Distribuidora ABC' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 300)
  name: string

  @ApiProperty({
    example: 'distribuidora-abc',
    description: 'Tenant subdomain (lowercase letters, numbers, and hyphens only)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 63)
  @Matches(TENANT_SLUG_REGEX, {
    message:
      'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
  })
  slug: string

  @ApiPropertyOptional({ enum: Object.values(PlanName), example: PlanName.FREE })
  @IsOptional()
  @IsEnum(PlanName)
  planName?: PlanName
}
