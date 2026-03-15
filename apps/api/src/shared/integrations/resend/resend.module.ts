import { Global, Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { ResendService } from './resend.service'
import { TenantEmailService } from './tenant-email.service'

@Global()
@Module({
  imports: [SettingsModule],
  providers: [ResendService, TenantEmailService],
  exports: [ResendService, TenantEmailService],
})
export class ResendModule {}
