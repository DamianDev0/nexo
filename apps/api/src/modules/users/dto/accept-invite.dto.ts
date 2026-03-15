import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class AcceptInviteDto {
  @ApiProperty({ description: 'Raw invitation token from the invite link' })
  @IsString()
  token: string

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  fullName: string

  @ApiProperty({ minLength: 8, description: 'Password for the new account' })
  @IsString()
  @MinLength(8)
  password: string
}
