import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DEFAULT_CONTACT_TAXONOMY, DOMAIN_EVENTS, firstEnabledOptionKey } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import { ContactDuplicatesService } from './contact-duplicates.service'
import type {
  Contact,
  ContactCounts,
  ContactDuplicateProbeResult,
  ContactTaxonomy,
  ContactTaxonomyUsage,
  TaxonomyReassignKind,
  PaginatedContacts,
  ContactTimeline,
} from '@repo/shared-types'
import type {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
  ProbeContactDuplicatesDto,
} from '../dto/contact.dto'
import type { ContactColumnChange, CreateContactData, ContactListQuery } from '../interfaces/contact-row.interfaces'
import { OTHER_CONTACT_TYPE, UPDATABLE_FIELDS } from '../constants/contact.constants'
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

  async findAll(schemaName: string, query: ContactListQuery): Promise<PaginatedContacts> {
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

  async taxonomyUsage(schemaName: string): Promise<ContactTaxonomyUsage> {
    const raw = await this.repository.taxonomyUsage(schemaName)
    const toRecord = (rows: Array<{ key: string; count: string }>) =>
      Object.fromEntries(rows.map((row) => [row.key, Number.parseInt(row.count, 10)]))
    return {
      statuses: toRecord(raw.statuses),
      sources: toRecord(raw.sources),
      types: toRecord(raw.types),
      lifecycleStages: toRecord(raw.lifecycleStages),
      tags: toRecord(raw.tags),
    }
  }

  async reassignTaxonomy(
    schemaName: string,
    kind: TaxonomyReassignKind,
    fromKey: string,
    toKey: string,
  ): Promise<{ reassigned: number }> {
    if (fromKey === toKey) {
      throw new BadRequestException('fromKey and toKey must be different')
    }
    const reassigned =
      kind === 'tag'
        ? await this.repository.reassignTag(schemaName, fromKey, toKey)
        : await this.repository.reassignTaxonomyColumn(schemaName, kind, fromKey, toKey)
    return { reassigned }
  }

  async probeDuplicates(
    schemaName: string,
    query: ProbeContactDuplicatesDto,
  ): Promise<ContactDuplicateProbeResult> {
    const { excludeId, ...probe } = query
    return this.db.query(schemaName, async (qr): Promise<ContactDuplicateProbeResult> => {
      return { duplicate: await this.duplicates.probe(qr, probe, excludeId) }
    })
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
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
  ): Promise<Contact> {
    this.assertTaxonomyKeys(dto, taxonomy)
    const result = await this.db.query(schemaName, async (qr): Promise<Contact> => {
      await this.duplicates.assertNoDuplicates(qr, dto, { force })

      const tags = await this.resolveTags(qr, dto.tags ?? [])
      const row = await this.repository.insert(qr, {
        ...this.buildCreateData(dto, createdById, taxonomy),
        tags,
      })
      if (!row) throw new InternalServerErrorException('Contact insert returned no row')
      const created = mapContact(row)
      this.emitAudit(
        schemaName,
        AuditAction.ContactCreated,
        created.id,
        createdById,
        `Contact ${dto.firstName} created`,
      )
      return created
    })
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_CREATED, {
      schemaName,
      entityType: 'contact',
      entityId: result.id,
      contact: result,
    })
    return result
  }

  async update(
    schemaName: string,
    contactId: string,
    dto: UpdateContactDto,
    force = false,
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
    changedBy?: string,
  ): Promise<Contact> {
    this.assertTaxonomyKeys(dto, taxonomy)
    let lifecycleFrom: string | null | undefined
    const result = await this.db.transactional(schemaName, async (qr): Promise<Contact> => {
      const previous = await this.repository.findActiveById(qr, contactId)
      if (!previous) throw new NotFoundException(`Contact ${contactId} not found`)
      await this.duplicates.assertNoDuplicates(qr, dto, { force, excludeId: contactId })

      const sanitized =
        dto.tags === undefined ? dto : { ...dto, tags: await this.resolveTags(qr, dto.tags) }
      const changes = this.buildUpdateChanges(sanitized)
      if (!changes.length) return this.fetchContactOrFail(qr, contactId)

      const row = await this.repository.updateById(qr, contactId, changes)
      if (dto.lifecycleStage !== undefined && dto.lifecycleStage !== previous.lifecycle_stage) {
        lifecycleFrom = previous.lifecycle_stage
        await this.repository.recordLifecycleChange(
          qr,
          contactId,
          previous.lifecycle_stage,
          dto.lifecycleStage,
          changedBy ?? null,
        )
      }
      const updated = mapContact(row!)
      this.emitAudit(
        schemaName,
        AuditAction.ContactUpdated,
        contactId,
        undefined,
        `Contact ${contactId} updated`,
      )
      return updated
    })
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_UPDATED, {
      schemaName,
      entityType: 'contact',
      entityId: contactId,
      contact: result,
    })
    if (lifecycleFrom !== undefined) {
      this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_LIFECYCLE_CHANGED, {
        schemaName,
        entityType: 'contact',
        entityId: contactId,
        fromStage: lifecycleFrom,
        toStage: dto.lifecycleStage,
        changedBy: changedBy ?? null,
      })
    }
    return result
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
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_DELETED, {
      schemaName,
      entityType: 'contact',
      entityId: contactId,
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

  private assertTaxonomyKeys(dto: UpdateContactDto, taxonomy: ContactTaxonomy): void {
    const checks: Array<[string | undefined, keyof ContactTaxonomy]> = [
      [dto.status, 'statuses'],
      [dto.source, 'sources'],
      [dto.type, 'types'],
      [dto.lifecycleStage, 'lifecycleStages'],
    ]

    const invalid = checks
      .filter(([value, kind]) => {
        if (value === undefined) return false
        return !taxonomy[kind].some((option) => option.enabled && option.key === value)
      })
      .map(([value, kind]) => `${kind}: ${value}`)

    if (invalid.length > 0) {
      throw new BadRequestException(`Unknown taxonomy keys — ${invalid.join(', ')}`)
    }
  }

  private async resolveTags(qr: QueryRunner, tags: string[]): Promise<string[]> {
    if (tags.length === 0) return []

    const names = await this.repository.findEnabledTagNames(qr)
    const canonicalByLower = new Map(names.map((name) => [name.toLowerCase(), name]))

    const resolved: string[] = []
    const unknown: string[] = []
    for (const tag of tags) {
      const canonical = canonicalByLower.get(tag.trim().toLowerCase())
      if (!canonical) unknown.push(tag)
      else if (!resolved.includes(canonical)) resolved.push(canonical)
    }

    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown contact tags: ${unknown.join(', ')}`)
    }
    return resolved
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

  private buildCreateData(
    dto: CreateContactDto,
    createdById: string,
    taxonomy: ContactTaxonomy,
  ): CreateContactData {
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
      status: dto.status ?? firstEnabledOptionKey(taxonomy.statuses),
      lifecycleStage: dto.lifecycleStage ?? firstEnabledOptionKey(taxonomy.lifecycleStages),
      source: dto.source ?? null,
      type: dto.type ?? null,
      typeLabel: dto.type === OTHER_CONTACT_TYPE ? (dto.typeLabel ?? null) : null,
      avatarUrl: dto.avatarUrl ?? null,
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

    if (dto.type !== undefined) {
      changes.push({ column: 'type', value: dto.type })
      changes.push({
        column: 'type_label',
        value: dto.type === OTHER_CONTACT_TYPE ? (dto.typeLabel ?? null) : null,
      })
    } else if (dto.typeLabel !== undefined) {
      changes.push({ column: 'type_label', value: dto.typeLabel })
    }

    return changes
  }
}
