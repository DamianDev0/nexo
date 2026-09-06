import type { Job } from 'bullmq'
import { BulkActionsProcessor } from '../processors/bulk-actions.processor'
import type { BulkActionRunnerService } from '../services/bulk-action-runner.service'
import type { BulkActionJobData } from '../interfaces/bulk-action-row.interfaces'

const DATA: BulkActionJobData = {
  bulkActionId: 'ba-1',
  schemaName: 'tenant_acme',
  tenantId: 't-1',
  tenantSlug: 'acme',
}

describe('BulkActionsProcessor', () => {
  it('marks the action failed when the runner throws, then lets BullMQ record the failure', async () => {
    const runner = { run: jest.fn().mockRejectedValue(new Error('db down')), markFailed: jest.fn() }
    const processor = new BulkActionsProcessor(runner as unknown as BulkActionRunnerService)

    await expect(processor.process({ data: DATA } as Job<BulkActionJobData>)).rejects.toThrow(
      'db down',
    )

    expect(runner.markFailed).toHaveBeenCalledWith(DATA)
  })

  it('does not touch the row when the run succeeds', async () => {
    const runner = { run: jest.fn().mockResolvedValue(undefined), markFailed: jest.fn() }
    const processor = new BulkActionsProcessor(runner as unknown as BulkActionRunnerService)

    await processor.process({ data: DATA } as Job<BulkActionJobData>)

    expect(runner.markFailed).not.toHaveBeenCalled()
  })
})
