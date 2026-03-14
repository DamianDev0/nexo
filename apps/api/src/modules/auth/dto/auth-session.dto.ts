import { ApiProperty } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'

/**
 * The authenticated user's public profile.
 * Returned in every auth response so the frontend can populate the UI
 * without needing to call GET /auth/me immediately after login.
 */
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

/**
 * Response for login and refresh.
 * Access and refresh tokens are delivered via httpOnly cookies only —
 * never in the response body. The browser sends them automatically on
 * every request; JavaScript cannot read them (XSS protection).
 */
export class LoginSessionDto {
  @ApiProperty()
  user: SessionUserDto
}

/**
 * Tenant summary included in the onboarding response.
 * Lets the frontend redirect to the correct subdomain immediately.
 */
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

/**
 * Response for onboarding.
 * Includes tenant data so the frontend can redirect to the new subdomain.
 */
export class OnboardingSessionDto {
  @ApiProperty()
  user: SessionUserDto

  @ApiProperty()
  tenant: TenantSummaryDto
}
