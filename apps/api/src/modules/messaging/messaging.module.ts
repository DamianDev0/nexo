import { Module } from '@nestjs/common'
import { MessagingController } from './controllers/messaging.controller'
import { TwilioMessagingWebhooksController } from './controllers/twilio-messaging-webhooks.controller'
import { MessagingProcessor } from './messaging.processor'
import { MessagesRepository } from './repositories/messages.repository'
import { MessagingService } from './services/messaging.service'

@Module({
  controllers: [MessagingController, TwilioMessagingWebhooksController],
  providers: [MessagingService, MessagesRepository, MessagingProcessor],
})
export class MessagingModule {}
