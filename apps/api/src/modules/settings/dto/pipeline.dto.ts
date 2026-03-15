import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PickType } from '@nestjs/mapped-types'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePipelineStageDto {
  @ApiProperty() @IsString() @Length(1, 100) name: string
  @ApiProperty({ description: 'Hex color', example: '#3B82F6' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color: string
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  probability: number
  @ApiProperty() @IsInt() @Min(0) position: number
}

export class CreatePipelineDto {
  @ApiProperty() @IsString() @Length(1, 200) name: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean
  @ApiProperty({ type: [CreatePipelineStageDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePipelineStageDto)
  stages: CreatePipelineStageDto[]
}

export class UpdatePipelineDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) name?: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean
}

// Full replacement of stages — reuses the stages field definition from CreatePipelineDto
export class ReorderStagesDto extends PickType(CreatePipelineDto, ['stages'] as const) {}
