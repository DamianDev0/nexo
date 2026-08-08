import { Module } from '@nestjs/common'
import { MessageTemplatesController } from './controllers/message-templates.controller'
import { MessageTemplatesService } from './services/message-templates.service'
import { MessageTemplatesRepository } from './repositories/message-templates.repository'
import { MessageQueueProcessor } from './message-queue.processor'

@Module({
  controllers: [MessageTemplatesController],
  providers: [MessageTemplatesService, MessageTemplatesRepository, MessageQueueProcessor],
  exports: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
