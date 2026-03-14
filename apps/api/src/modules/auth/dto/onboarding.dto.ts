import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  Length,
} from 'class-validator'

export class OnboardingDto {
  // ─── Business info ────────────────────────────────────────────────────────

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
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message:
      'Slug must be lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
  })
  slug: string

  @ApiPropertyOptional({ example: 'free', description: 'Plan name (defaults to free)' })
  @IsOptional()
  @IsString()
  planName?: string

  // ─── Owner credentials ────────────────────────────────────────────────────

  @ApiProperty({ example: 'admin@distribuidora-abc.com' })
  @IsEmail()
  ownerEmail: string

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
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
