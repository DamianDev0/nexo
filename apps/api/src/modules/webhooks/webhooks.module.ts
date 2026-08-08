import { Module } from '@nestjs/common'
import { WebhooksController } from './controllers/webhooks.controller'
import { WebhooksService } from './services/webhooks.service'
import { WebhooksRepository } from './repositories/webhooks.repository'
import { WebhooksListener } from './webhooks.listener'

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksRepository, WebhooksListener],
  exports: [WebhooksService],
})
export class WebhooksModule {}
