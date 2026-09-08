import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { AuthenticatedUser, VoiceToken } from '@repo/shared-types'
import { phoneDigits, toE164 } from '@repo/shared-utils'
import { ContactPhoneLookupRepository } from '@/shared/database/repositories/contact-phone-lookup.repository'
import { EventBusService } from '@/shared/events/event-bus.service'
import { TELEPHONY_EVENTS, type CallCompletedEvent } from '@/shared/events/telephony.events'
import { TwilioSettingsService } from '@/shared/integrations/twilio/twilio-settings.service'
import { TwilioVoiceService } from '@/shared/integrations/twilio/twilio-voice.service'
import { VOICE_WEBHOOK_PATH } from '../constants/call.constants'
import type { CallRow } from '../interfaces/call-row.interfaces'
import type {
  DialAction,
  StatusCallback,
  VoiceIdentity,
  VoiceRequest,
} from '../interfaces/twilio-webhook.interfaces'
import { mapTwilioCallStatus } from '../mappers/call.mapper'
import { decodeVoiceIdentity, encodeVoiceIdentity } from '../mappers/voice-identity.mapper'
import { CallsRepository } from '../repositories/calls.repository'
import { TenantSchemaRepository } from '@/shared/database/repositories/tenant-schema.repository'

@Injectable()
export class TelephonyService {
  constructor(
    @InjectPinoLogger(TelephonyService.name)
    private readonly logger: PinoLogger,
    private readonly twilio: TwilioVoiceService,
    private readonly twilioSettings: TwilioSettingsService,
    private readonly calls: CallsRepository,
    private readonly tenants: TenantSchemaRepository,
    private readonly contacts: ContactPhoneLookupRepository,
    private readonly eventBus: EventBusService,
  ) {}

  issueVoiceToken(user: AuthenticatedUser): VoiceToken {
    const identity = encodeVoiceIdentity(user.tenantId, user.id)
    const { token, expiresAt } = this.twilio.createAccessToken(identity)
    return { token, identity, expiresAt: expiresAt.toISOString() }
  }

  async handleOutboundVoice(request: VoiceRequest): Promise<string> {
    const identity = this.requireIdentity(request.identity)
    const schemaName = await this.requireSchema(identity.tenantId)
    const to = toE164(request.to)
    if (to === null) {
      this.logger.warn(
        { tenantId: identity.tenantId, callSid: request.callSid },
        'Invalid dial number',
      )
      return this.twilio.hangupTwiml()
    }

    const contactId = await this.contacts.findContactIdByPhone(schemaName, phoneDigits(to))
    await this.calls.insertOutbound(schemaName, {
      providerCallSid: request.callSid,
      fromNumber: this.twilio.callerId,
      toNumber: to,
      contactId,
      userId: identity.userId,
    })
    this.logger.info(
      { tenantId: identity.tenantId, userId: identity.userId, callSid: request.callSid },
      'Outbound call started',
    )

    return this.twilio.outboundDialTwiml({
      to,
      statusCallbackUrl: this.webhookUrl('status', identity.tenantId),
      actionUrl: this.webhookUrl('dial-action', identity.tenantId),
    })
  }

  async handleStatusCallback(event: StatusCallback, tenantHint: string | undefined): Promise<void> {
    const tenantId = tenantHint ?? this.requireIdentity(event.identity).tenantId
    const schemaName = await this.requireSchema(tenantId)
    const status = mapTwilioCallStatus(event.twilioStatus)
    const providerCallSid = event.parentCallSid ?? event.callSid

    if (event.parentCallSid === null && status === 'completed') {
      const row = await this.calls.finalize(schemaName, {
        providerCallSid,
        status,
        durationSeconds: event.durationSeconds,
      })
      this.emitCompleted(schemaName, tenantId, row)
      return
    }

    await this.calls.applyProgress(schemaName, {
      providerCallSid,
      status,
      sequence: event.sequence,
    })
  }

  async handleDialAction(action: DialAction, tenantId: string): Promise<string> {
    const schemaName = await this.requireSchema(tenantId)
    const row = await this.calls.finalize(schemaName, {
      providerCallSid: action.callSid,
      status: mapTwilioCallStatus(action.twilioStatus),
      durationSeconds: action.durationSeconds,
    })
    this.emitCompleted(schemaName, tenantId, row)
    return this.twilio.emptyTwiml()
  }

  fallbackTwiml(): string {
    return this.twilio.hangupTwiml()
  }

  private emitCompleted(schemaName: string, tenantId: string, row: CallRow | null): void {
    if (row === null) return
    const payload: CallCompletedEvent = {
      schemaName,
      tenantId,
      callId: row.id,
      userId: row.user_id,
      contactId: row.contact_id,
      direction: row.direction as CallCompletedEvent['direction'],
      status: row.status as CallCompletedEvent['status'],
      toNumber: row.to_number,
      durationSeconds: row.duration_seconds,
      startedAt: row.started_at,
    }
    this.logger.info(
      { tenantId, callId: row.id, status: row.status, durationSeconds: row.duration_seconds },
      'Call completed',
    )
    this.eventBus.emit(TELEPHONY_EVENTS.CALL_COMPLETED, payload)
  }

  private requireIdentity(identity: string | null): VoiceIdentity {
    const decoded = identity === null ? null : decodeVoiceIdentity(identity)
    if (decoded === null) throw new NotFoundException('Unknown voice identity')
    return decoded
  }

  private async requireSchema(tenantId: string): Promise<string> {
    const schemaName = await this.tenants.findSchemaName(tenantId)
    if (schemaName === null) throw new NotFoundException('Tenant not found')
    return schemaName
  }

  private webhookUrl(path: string, tenantId: string): string {
    return this.twilioSettings.webhookUrl(`${VOICE_WEBHOOK_PATH}/${path}`, tenantId)
  }
}
