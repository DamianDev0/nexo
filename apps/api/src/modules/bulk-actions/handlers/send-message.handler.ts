import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import Handlebars from 'handlebars'
import type { BulkActionKind } from '@repo/shared-types'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { MessageJobData } from '@/shared/queue/message-job.interfaces'
import { BULK_MESSAGE_CHANNEL } from '../constants/bulk-action.constants'
import type {
  BatchOutcome,
  BulkMessageTemplateRow,
  BulkRecipientRow,
  BulkRunContext,
} from '../interfaces/bulk-action-row.interfaces'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import type { BulkActionHandler } from './bulk-action-handler.interface'

type MessageKind = keyof typeof BULK_MESSAGE_CHANNEL

function render(text: string, format: string | null, variables: Record<string, string>): string {
  if (format === 'handlebars' || format === 'html') return Handlebars.compile(text)(variables)
  return text.replaceAll(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
}

function recipientFor(row: BulkRecipientRow, channel: 'email' | 'sms' | 'whatsapp'): string | null {
  if (channel === 'email') return row.email
  if (channel === 'sms') return row.phone
  return row.whatsapp ?? row.phone
}

function variablesFor(
  row: BulkRecipientRow,
  extra: Record<string, string>,
): Record<string, string> {
  return {
    ...extra,
    firstName: row.first_name,
    lastName: row.last_name ?? '',
    fullName: [row.first_name, row.last_name].filter(Boolean).join(' '),
    email: row.email ?? '',
    phone: row.phone ?? '',
  }
}

@Injectable()
export class SendMessageHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['send_email', 'send_sms', 'send_whatsapp']

  constructor(
    private readonly targets: BulkTargetsRepository,
    @InjectQueue(QUEUE_NAMES.MESSAGES) private readonly messageQueue: Queue<MessageJobData>,
  ) {}

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const channel = BULK_MESSAGE_CHANNEL[ctx.action.action as MessageKind]
    const template = await this.targets.findMessageTemplate(
      ctx.schemaName,
      ctx.action.params['templateId'] as string,
    )
    if (!template)
      return { succeeded: [], errors: ids.map((id) => ({ id, message: 'template_not_found' })) }

    const extra = (ctx.action.params['variables'] as Record<string, string> | undefined) ?? {}
    const recipients = await this.targets.findRecipients(ctx.schemaName, ids, channel)
    const byId = new Map(recipients.map((row) => [row.id, row]))
    const outcome: BatchOutcome = { succeeded: [], errors: [] }
    const jobs: Array<{ name: string; data: MessageJobData }> = []

    for (const id of ids) {
      const row = byId.get(id)
      if (!row) {
        outcome.errors.push({ id, message: 'not_found' })
        continue
      }
      if (row.opted_out) {
        outcome.errors.push({ id, message: 'no_consent' })
        continue
      }
      const recipient = recipientFor(row, channel)
      if (!recipient) {
        outcome.errors.push({ id, message: 'no_recipient' })
        continue
      }
      jobs.push(this.buildJob(ctx, template, channel, recipient, variablesFor(row, extra)))
      outcome.succeeded.push(id)
    }

    if (jobs.length > 0) await this.messageQueue.addBulk(jobs)
    return outcome
  }

  private buildJob(
    ctx: BulkRunContext,
    template: BulkMessageTemplateRow,
    channel: 'email' | 'sms' | 'whatsapp',
    recipient: string,
    variables: Record<string, string>,
  ): { name: string; data: MessageJobData } {
    return {
      name: `send-${channel}`,
      data: {
        schemaName: ctx.schemaName,
        tenantId: ctx.tenantId,
        templateId: template.id,
        channel,
        recipient,
        subject: template.subject ? render(template.subject, 'text', variables) : null,
        renderedBody: render(template.body, template.format, variables),
        variables,
      },
    }
  }
}
