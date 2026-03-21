import { Module } from '@nestjs/common'
import { MessageTemplatesController } from './message-templates.controller'
import { MessageTemplatesService } from './message-templates.service'
import { MessageQueueProcessor } from './message-queue.processor'

@Module({
  controllers: [MessageTemplatesController],
  providers: [MessageTemplatesService, MessageQueueProcessor],
  exports: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
