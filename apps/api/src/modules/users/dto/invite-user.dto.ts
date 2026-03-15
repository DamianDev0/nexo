import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum } from 'class-validator'
import { UserRole } from '@repo/shared-types'

export class InviteUserDto {
  @ApiProperty({ example: 'jane@acme.com' })
  @IsEmail()
  email: string

  @ApiProperty({ enum: UserRole, example: UserRole.SALES_REP })
  @IsEnum(UserRole)
  role: UserRole
}

export class InviteUserResponseDto {
  @ApiProperty()
  inviteToken: string

  @ApiProperty()
  email: string

  @ApiProperty()
  expiresAt: string
}
