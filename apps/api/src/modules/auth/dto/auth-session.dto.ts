import { ApiProperty } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'

export class SessionUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  fullName: string

  @ApiProperty({ enum: ['owner', 'admin', 'manager', 'sales_rep', 'viewer'] })
  role: UserRole

  @ApiProperty({ nullable: true })
  avatarUrl: string | null
}

export class LoginSessionDto {
  @ApiProperty()
  user: SessionUserDto
}

export class TenantSummaryDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  slug: string

  @ApiProperty()
  name: string

  @ApiProperty()
  schemaName: string

  @ApiProperty()
  plan: string
}

export class OnboardingSessionDto {
  @ApiProperty()
  user: SessionUserDto

  @ApiProperty()
  tenant: TenantSummaryDto
}
