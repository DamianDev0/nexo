import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator'

const URL_OPTS = { require_protocol: true, protocols: ['https'] }

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://example.com/hooks/nexo' })
  @IsUrl(URL_OPTS)
  url: string

  @ApiProperty({ example: ['deal.won', 'invoice.paid'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[]
}

export class UpdateWebhookDto {
  @ApiPropertyOptional({ example: 'https://example.com/hooks/nexo' })
  @IsOptional()
  @IsUrl(URL_OPTS)
  url?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
