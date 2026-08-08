import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { LifecycleStage } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import { ContactDuplicatesService } from './contact-duplicates.service'
import type { Contact, ContactCounts, PaginatedContacts, ContactTimeline } from '@repo/shared-types'
import type { CreateContactDto, UpdateContactDto, ContactQueryDto } from '../dto/contact.dto'
import type { ContactColumnChange, CreateContactData } from '../interfaces/contact-row.interfaces'
import { UPDATABLE_FIELDS } from '../constants/contact.constants'
import { ContactsRepository } from '../repositories/contacts.repository'
import {
  mapContact,
  mapContactActivity,
  mapContactDeal,
  mapContactListItem,
} from '../mappers/contact.mapper'

@Injectable()
export class ContactsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactsRepository,
    private readonly eventBus: EventBusService,
    private readonly duplicates: ContactDuplicatesService,
  ) {}

  private emitAudit(
    schemaName: string,
    action: AuditAction,
    entityId: string,
    userId: string | undefined,
    description: string,
  ): void {
    this.eventBus.emit(
      AUDIT_EVENTS.ENTITY,
      new AuditEntityEvent(
        schemaName,
        action,
        AuditEntityType.Contact,
        entityId,
        userId,
        description,
      ),
    )
  }

  async findAll(schemaName: string, query: ContactQueryDto): Promise<PaginatedContacts> {
    const { rows, total, page, limit } = await this.repository.findPage(schemaName, query)
    return { data: rows.map((r) => mapContactListItem(r)), total, page, limit }
  }

  async counts(schemaName: string): Promise<ContactCounts> {
    const rows = await this.repository.countByStatus(schemaName)
    const byStatus: Record<string, number> = {}
    let total = 0
    for (const row of rows) {
      const value = Number.parseInt(row.count, 10)
      byStatus[row.status] = value
      total += value
    }
    return { total, byStatus }
  }

  async findOne(schemaName: string, contactId: string): Promise<Contact> {
    return this.db.query(schemaName, async (qr): Promise<Contact> => {
      return this.fetchContactOrFail(qr, contactId)
    })
  }

  async create(
    schemaName: string,
    dto: CreateContactDto,
    createdById: string,
    force = false,
  ): Promise<Contact> {
    return this.db.query(schemaName, async (qr): Promise<Contact> => {
      await this.duplicates.assertNoDuplicates(qr, dto, { force })

      const row = await this.repository.insert(qr, this.buildCreateData(dto, createdById))
      if (!row) throw new InternalServerErrorException('Contact insert returned no row')
      const result = mapContact(row)
      this.emitAudit(
        schemaName,
        AuditAction.ContactCreated,
        result.id,
        createdById,
        `Contact ${dto.firstName} created`,
      )
      return result
    })
  }

  async update(
    schemaName: string,
    contactId: string,
    dto: UpdateContactDto,
    force = false,
  ): Promise<Contact> {
    return this.db.transactional(schemaName, async (qr): Promise<Contact> => {
      await this.assertContactExists(qr, contactId)
      await this.duplicates.assertNoDuplicates(qr, dto, { force, excludeId: contactId })

      const changes = this.buildUpdateChanges(dto)
      if (!changes.length) return this.fetchContactOrFail(qr, contactId)

      const row = await this.repository.updateById(qr, contactId, changes)
      const result = mapContact(row!)
      this.emitAudit(
        schemaName,
        AuditAction.ContactUpdated,
        contactId,
        undefined,
        `Contact ${contactId} updated`,
      )
      return result
    })
  }

  async remove(schemaName: string, contactId: string): Promise<void> {
    await this.db.transactional(schemaName, async (qr): Promise<void> => {
      await this.assertContactExists(qr, contactId)
      await this.repository.softDeleteById(qr, contactId)
      this.emitAudit(
        schemaName,
        AuditAction.ContactDeleted,
        contactId,
        undefined,
        `Contact ${contactId} deleted`,
      )
    })
  }

  async getTimeline(schemaName: string, contactId: string): Promise<ContactTimeline> {
    return this.db.query(schemaName, async (qr): Promise<ContactTimeline> => {
      await this.assertContactExists(qr, contactId)

      const [activityRows, dealRows] = await Promise.all([
        this.repository.findActivities(qr, contactId),
        this.repository.findDeals(qr, contactId),
      ])

      return {
        activities: activityRows.map((a) => mapContactActivity(a)),
        deals: dealRows.map((d) => mapContactDeal(d)),
      }
    })
  }

  private async assertContactExists(qr: QueryRunner, contactId: string): Promise<void> {
    const exists = await this.repository.existsActiveById(qr, contactId)
    if (!exists) throw new NotFoundException(`Contact ${contactId} not found`)
  }

  private async fetchContactOrFail(qr: QueryRunner, contactId: string): Promise<Contact> {
    const row = await this.repository.findActiveById(qr, contactId)
    if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
    return mapContact(row)
  }

  private buildCreateData(dto: CreateContactDto, createdById: string): CreateContactData {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      whatsapp: dto.whatsapp ?? null,
      documentType: dto.documentType ?? null,
      documentNumber: dto.documentNumber ?? null,
      jobTitle: dto.jobTitle ?? null,
      linkedinUrl: dto.linkedinUrl ?? null,
      birthday: dto.birthday ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      department: dto.department ?? null,
      municipioCode: dto.municipioCode ?? null,
      status: dto.status ?? 'new',
      lifecycleStage: dto.lifecycleStage ?? LifecycleStage.SUBSCRIBER,
      source: dto.source ?? null,
      leadScore: dto.leadScore ?? 0,
      dataConsent: dto.dataConsent ?? false,
      consentDate: dto.dataConsent ? new Date() : null,
      consentSource: dto.consentSource ?? null,
      optOutEmail: dto.optOutEmail ?? false,
      optOutSms: dto.optOutSms ?? false,
      optOutWhatsapp: dto.optOutWhatsapp ?? false,
      tags: dto.tags ?? [],
      companyId: dto.companyId ?? null,
      assignedToId: dto.assignedToId ?? null,
      customFields: dto.customFields ?? {},
      createdBy: createdById,
    }
  }

  private buildUpdateChanges(dto: UpdateContactDto): ContactColumnChange[] {
    const changes: ContactColumnChange[] = []

    for (const [dtoKey, col] of UPDATABLE_FIELDS) {
      if (dto[dtoKey] !== undefined) changes.push({ column: col, value: dto[dtoKey] })
    }

    if (dto.dataConsent !== undefined) {
      changes.push({ column: 'consent_date', value: dto.dataConsent ? new Date() : null })
    }

    return changes
  }
}
