import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { NotificationsController } from './controllers/notifications.controller'
import { NotificationsService } from './services/notifications.service'
import { NotificationsRepository } from './repositories/notifications.repository'
import { NotificationsGateway } from './notifications.gateway'
import { NotificationsListener } from './notifications.listener'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: config.get<string>('jwt.publicKey'),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsGateway,
    NotificationsListener,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
