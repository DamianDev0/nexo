import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { BulkActionJobData } from '../interfaces/bulk-action-row.interfaces'
import { BulkActionRunnerService } from '../services/bulk-action-runner.service'

@Processor(QUEUE_NAMES.BULK_ACTIONS)
export class BulkActionsProcessor extends WorkerHost {
  constructor(private readonly runner: BulkActionRunnerService) {
    super()
  }

  async process(job: Job<BulkActionJobData>): Promise<void> {
    try {
      await this.runner.run(job.data)
    } catch (error) {
      await this.runner.markFailed(job.data)
      throw error
    }
  }
}
