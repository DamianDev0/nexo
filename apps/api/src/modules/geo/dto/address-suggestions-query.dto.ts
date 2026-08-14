import { IsOptional, IsString, IsUUID, Length } from 'class-validator'

export class AddressSuggestionsQueryDto {
  @IsString()
  @Length(3, 255)
  q: string

  @IsOptional()
  @IsUUID('4')
  sessionToken?: string
}
