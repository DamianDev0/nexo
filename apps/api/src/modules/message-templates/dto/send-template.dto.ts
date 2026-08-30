import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsObject, IsString, MaxLength } from 'class-validator'

export class SendTemplateDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(254, { each: true })
  recipients: string[]

  @IsObject()
  variables: Record<string, string>
}
