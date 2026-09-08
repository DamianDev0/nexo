import { IsOptional, IsUUID } from 'class-validator'
import { RecentByContactQueryDto } from '@/shared/dto/recent-by-contact-query.dto'

export class CallQueryDto extends RecentByContactQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string
}
