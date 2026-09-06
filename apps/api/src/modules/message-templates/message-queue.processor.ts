import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { MessageJobData } from '@/shared/queue/message-job.interfaces'

@Processor(QUEUE_NAMES.MESSAGES)
export class MessageQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageQueueProcessor.name)

  async process(job: Job<MessageJobData>): Promise<void> {
    const { channel, recipient, subject } = job.data

    switch (channel) {
      case 'email':
        this.logger.log(`[EMAIL] To: ${recipient} | Subject: ${subject}`)

        break

      case 'sms':
        this.logger.log(`[SMS] To: ${recipient}`)

        break

      case 'whatsapp':
        this.logger.log(`[WHATSAPP] To: ${recipient}`)

        break

      default:
        this.logger.warn(`Unknown channel: ${channel}`)
    }
  }
}
