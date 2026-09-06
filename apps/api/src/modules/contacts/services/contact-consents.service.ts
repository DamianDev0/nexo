import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactConsent } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import type { UpsertContactConsentDto } from '../dto/contact-consent.dto'
import { mapContactConsent } from '../mappers/contact-consent.mapper'
import { ContactConsentsRepository } from '../repositories/contact-consents.repository'
import { ContactsRepository } from '../repositories/contacts.repository'

@Injectable()
export class ContactConsentsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly contacts: ContactsRepository,
    private readonly repository: ContactConsentsRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async list(schemaName: string, contactId: string): Promise<ContactConsent[]> {
    return this.db.query(schemaName, async (qr): Promise<ContactConsent[]> => {
      await this.assertContactExists(qr, contactId)
      const rows = await this.repository.findByContact(qr, contactId)
      return rows.map((row) => mapContactConsent(row))
    })
  }

  async upsert(
    schemaName: string,
    contactId: string,
    dto: UpsertContactConsentDto,
    recordedBy: string,
  ): Promise<ContactConsent> {
    const consent = await this.db.transactional(schemaName, async (qr): Promise<ContactConsent> => {
      await this.assertContactExists(qr, contactId)
      const row = await this.repository.upsert(qr, {
        contactId,
        channel: dto.channel,
        granted: dto.granted,
        source: dto.source ?? null,
        reason: dto.reason ?? null,
        evidence: dto.evidence ?? null,
        recordedBy,
      })
      if (!row) throw new InternalServerErrorException('Consent upsert returned no row')
      return mapContactConsent(row)
    })

    this.eventBus.emit(
      AUDIT_EVENTS.ENTITY,
      new AuditEntityEvent(
        schemaName,
        AuditAction.ContactUpdated,
        AuditEntityType.Contact,
        contactId,
        recordedBy,
        `Consent ${dto.channel} ${dto.granted ? 'granted' : 'revoked'}`,
      ),
    )
    return consent
  }

  private async assertContactExists(qr: QueryRunner, contactId: string): Promise<void> {
    const exists = await this.contacts.existsActiveById(qr, contactId)
    if (!exists) throw new NotFoundException(`Contact ${contactId} not found`)
  }
}
