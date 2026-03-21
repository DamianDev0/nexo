import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'

export interface MessageJobData {
  schemaName: string
  tenantId: string
  templateId: string
  channel: string
  recipient: string
  subject: string | null
  renderedBody: string
  variables: Record<string, string>
}

@Processor(QUEUE_NAMES.MESSAGES)
export class MessageQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageQueueProcessor.name)

  async process(job: Job<MessageJobData>): Promise<void> {
    const { channel, recipient, subject } = job.data

    switch (channel) {
      case 'email':
        this.logger.log(`[EMAIL] To: ${recipient} | Subject: ${subject}`)
        // TODO: connect to ResendService or SendGrid when ready
        break

      case 'sms':
        this.logger.log(`[SMS] To: ${recipient}`)
        // TODO: connect to Twilio when ready
        break

      case 'whatsapp':
        this.logger.log(`[WHATSAPP] To: ${recipient}`)
        // TODO: connect to 360dialog/Meta when ready
        break

      default:
        this.logger.warn(`Unknown channel: ${channel}`)
    }
  }
}
