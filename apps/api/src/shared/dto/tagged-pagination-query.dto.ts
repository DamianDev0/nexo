import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@repo/shared-utils'

export class TaggedPaginationQueryDto {
  @ApiPropertyOptional({ type: [String], description: 'Filter by tags (ALL must match)' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value as string[]
    return value ? [value] : undefined
  })
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: DEFAULT_PAGE_SIZE, minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number = DEFAULT_PAGE_SIZE
}
