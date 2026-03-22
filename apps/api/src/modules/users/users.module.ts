import { Module } from '@nestjs/common'
import { AuthModule } from '@/modules/auth/auth.module'
import { TenantsModule } from '@/modules/tenants/tenants.module'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './services/users.service'
import { InvitationRepository } from './repositories/invitation.repository'

@Module({
  imports: [AuthModule, TenantsModule],
  controllers: [UsersController],
  providers: [UsersService, InvitationRepository],
  exports: [UsersService],
})
export class UsersModule {}
