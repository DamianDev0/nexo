import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  Length,
} from 'class-validator'
import { PlanName } from '@repo/shared-types'
import { PASSWORD_STRENGTH_REGEX, TENANT_SLUG_REGEX } from '@repo/shared-utils'

export class OnboardingDto {
  @ApiProperty({ example: 'Distribuidora ABC', description: 'Business name' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  businessName: string

  @ApiProperty({
    example: 'distribuidora-abc',
    description: 'Subdomain slug — lowercase letters, numbers, and hyphens only',
  })
  @IsString()
  @Length(3, 63)
  @Matches(TENANT_SLUG_REGEX, {
    message:
      'Slug must be lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
  })
  slug: string

  @ApiPropertyOptional({
    enum: Object.values(PlanName),
    example: PlanName.FREE,
    description: 'Plan name (defaults to free)',
  })
  @IsOptional()
  @IsEnum(PlanName)
  planName?: PlanName

  @ApiProperty({ example: 'admin@distribuidora-abc.com' })
  @IsEmail()
  ownerEmail: string

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_STRENGTH_REGEX, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  ownerPassword: string

  @ApiProperty({ example: 'María García' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  ownerFullName: string
}
