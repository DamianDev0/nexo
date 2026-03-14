import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt max
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string

  @ApiProperty({ example: 'María García' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  fullName: string
}
