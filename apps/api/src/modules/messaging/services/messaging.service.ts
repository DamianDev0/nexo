import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { AuthenticatedUser, Message } from '@repo/shared-types'
import { phoneDigits, toE164 } from '@repo/shared-utils'
import { ContactPhoneLookupRepository } from '@/shared/database/repositories/contact-phone-lookup.repository'
import { TenantSchemaRepository } from '@/shared/database/repositories/tenant-schema.repository'
import { EventBusService } from '@/shared/events/event-bus.service'
import { MESSAGING_EVENTS, type MessageSentEvent } from '@/shared/events/messaging.events'
import { TwilioMessagingService } from '@/shared/integrations/twilio/twilio-messaging.service'
import { TwilioSettingsService } from '@/shared/integrations/twilio/twilio-settings.service'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { SmsJobData } from '@/shared/queue/sms-job.interfaces'
import { MESSAGE_LIST_DEFAULT, MESSAGING_WEBHOOK_PATH } from '../constants/message.constants'
import type { RecentByContactQueryDto } from '@/shared/dto/recent-by-contact-query.dto'
import type { SendMessageDto } from '../dto/send-message.dto'
import type { MessageRow, MessageStatusCallback } from '../interfaces/message-row.interfaces'
import { mapMessage, mapTwilioMessageStatus } from '../mappers/message.mapper'
import { MessagesRepository } from '../repositories/messages.repository'

function twilioErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null
  return String((error as { code: unknown }).code)
}

@Injectable()
export class MessagingService {
  constructor(
    @InjectPinoLogger(MessagingService.name)
    private readonly logger: PinoLogger,
    @InjectQueue(QUEUE_NAMES.SMS) private readonly queue: Queue<SmsJobData>,
    private readonly messages: MessagesRepository,
    private readonly contacts: ContactPhoneLookupRepository,
    private readonly tenants: TenantSchemaRepository,
    private readonly twilio: TwilioMessagingService,
    private readonly twilioSettings: TwilioSettingsService,
    private readonly eventBus: EventBusService,
  ) {}

  async send(schemaName: string, user: AuthenticatedUser, dto: SendMessageDto): Promise<Message> {
    const to = toE164(dto.to)
    if (to === null) throw new BadRequestException('Invalid destination number')
    const contactId =
      dto.contactId ?? (await this.contacts.findContactIdByPhone(schemaName, phoneDigits(to)))
    const row = await this.messages.insertQueued(schemaName, {
      fromNumber: this.twilio.senderNumber,
      toNumber: to,
      body: dto.body,
      contactId,
      userId: user.id,
    })
    await this.queue.add('send-sms', { schemaName, tenantId: user.tenantId, messageId: row.id })
    this.logger.info({ tenantId: user.tenantId, messageId: row.id }, 'SMS queued')
    return mapMessage(row)
  }

  async deliver(job: SmsJobData): Promise<void> {
    const row = await this.messages.findById(job.schemaName, job.messageId)
    if (row?.status !== 'queued') return

    try {
      const result = await this.twilio.sendSms({
        to: row.to_number,
        body: row.body,
        statusCallbackUrl: this.statusCallbackUrl(job.tenantId),
      })
      const sent = await this.messages.markSent(job.schemaName, {
        messageId: row.id,
        providerMessageSid: result.sid,
        segments: result.segments,
      })
      this.emitSent(job, sent)
    } catch (error) {
      const code = twilioErrorCode(error)
      await this.messages.markFailed(job.schemaName, row.id, code)
      this.logger.error({ tenantId: job.tenantId, messageId: row.id, code }, 'SMS send failed')
      throw error
    }
  }

  async handleStatusCallback(event: MessageStatusCallback, tenantId: string): Promise<void> {
    const schemaName = await this.tenants.findSchemaName(tenantId)
    if (schemaName === null) throw new NotFoundException('Tenant not found')
    await this.messages.applyProviderStatus(schemaName, {
      providerMessageSid: event.messageSid,
      status: mapTwilioMessageStatus(event.twilioStatus),
      errorCode: event.errorCode,
    })
  }

  async findRecent(schemaName: string, query: RecentByContactQueryDto): Promise<Message[]> {
    const rows = await this.messages.findRecent(schemaName, {
      contactId: query.contactId,
      limit: query.limit ?? MESSAGE_LIST_DEFAULT,
    })
    return rows.map(mapMessage)
  }

  async findOne(schemaName: string, messageId: string): Promise<Message> {
    const row = await this.messages.findById(schemaName, messageId)
    if (!row) throw new NotFoundException(`Message ${messageId} not found`)
    return mapMessage(row)
  }

  private emitSent(job: SmsJobData, row: MessageRow | null): void {
    if (row === null) return
    const payload: MessageSentEvent = {
      schemaName: job.schemaName,
      tenantId: job.tenantId,
      messageId: row.id,
      channel: 'sms',
      userId: row.user_id,
      contactId: row.contact_id,
      toNumber: row.to_number,
      body: row.body,
      sentAt: row.sent_at ?? row.created_at,
    }
    this.logger.info(
      { tenantId: job.tenantId, messageId: row.id, segments: row.segments },
      'SMS sent',
    )
    this.eventBus.emit(MESSAGING_EVENTS.MESSAGE_SENT, payload)
  }

  private statusCallbackUrl(tenantId: string): string {
    return this.twilioSettings.webhookUrl(`${MESSAGING_WEBHOOK_PATH}/status`, tenantId)
  }
}
