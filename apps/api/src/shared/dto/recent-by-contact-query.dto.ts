import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator'
import { MAX_PAGE_SIZE } from '@repo/shared-utils'

export class RecentByContactQueryDto {
  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number
}
