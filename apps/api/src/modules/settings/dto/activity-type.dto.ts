import { IsBoolean, IsString, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import type { ActivityTypeDef } from '@repo/shared-types'

export class ActivityTypeDto implements ActivityTypeDef {
  @ApiProperty() @IsString() @Length(1, 30) key: string
  @ApiProperty() @IsString() @Length(1, 80) label: string
  @ApiProperty() @IsString() @Length(1, 50) icon: string
  @ApiProperty({ example: '#22C55E' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color: string
  @ApiProperty() @IsBoolean() trackDuration: boolean
  @ApiProperty() @IsBoolean() isSystem: boolean
}
