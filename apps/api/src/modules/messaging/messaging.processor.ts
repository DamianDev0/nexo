import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { SmsJobData } from '@/shared/queue/sms-job.interfaces'
import { MessagingService } from './services/messaging.service'

@Processor(QUEUE_NAMES.SMS)
export class MessagingProcessor extends WorkerHost {
  constructor(private readonly messaging: MessagingService) {
    super()
  }

  process(job: Job<SmsJobData>): Promise<void> {
    return this.messaging.deliver(job.data)
  }
}
