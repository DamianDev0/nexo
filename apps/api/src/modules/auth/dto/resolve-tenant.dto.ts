import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResolveTenantDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}
