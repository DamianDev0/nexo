import { ApiProperty } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'

export class AuthUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  fullName: string

  @ApiProperty()
  role: UserRole

  @ApiProperty({ nullable: true })
  avatarUrl: string | null
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  user: AuthUserDto
}
