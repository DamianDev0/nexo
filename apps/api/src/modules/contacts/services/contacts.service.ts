import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DEFAULT_CONTACT_TAXONOMY, DOMAIN_EVENTS, NotificationType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AuditAction } from '@/shared/events/audit.events'
import { ContactDuplicatesService } from './contact-duplicates.service'
import { ContactTaxonomyService } from './contact-taxonomy.service'
import { ContactStatsCacheService } from './contact-stats-cache.service'
import { emitContactAudit } from './contact-audit'
import type {
  Contact,
  ContactCounts,
  ContactDuplicateProbeResult,
  ContactListItem,
  ContactTaxonomy,
  ContactTaxonomyUsage,
  TaxonomyReassignKind,
  PaginatedContacts,
  ContactTimeline,
} from '@repo/shared-types'
import type {
  CreateContactDto,
  UpdateContactDto,
  ProbeContactDuplicatesDto,
} from '../dto/contact.dto'
import { CONTACT_TIMELINE_DEFAULT } from '../dto/contact.dto'
import type { ContactListQuery } from '../interfaces/contact-row.interfaces'
import { CONTACT_UNIQUE_CONSTRAINT } from '../constants/contact.constants'
import { isUniqueViolation } from '@/shared/database/sql.util'
import { ContactsRepository } from '../repositories/contacts.repository'
import {
  mapContact,
  mapContactActivity,
  mapContactDeal,
  mapContactListItem,
} from '../mappers/contact.mapper'
import { toContactChanges, toCreateContactData } from '../mappers/contact-write.mapper'

type ContactActor = { readonly id: string; readonly tenantId: string }

@Injectable()
export class ContactsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactsRepository,
    private readonly eventBus: EventBusService,
    private readonly duplicates: ContactDuplicatesService,
    private readonly taxonomyRules: ContactTaxonomyService,
    private readonly stats: ContactStatsCacheService,
  ) {}

  private emitAudit(
    schemaName: string,
    action: AuditAction,
    entityId: string,
    userId: string | undefined,
    description: string,
  ): void {
    emitContactAudit(this.eventBus, { schemaName, action, entityId, userId, description })
  }

  async findAll(schemaName: string, query: ContactListQuery): Promise<PaginatedContacts> {
    const { rows, total, page, limit } = await this.repository.findPage(schemaName, query)
    return { data: rows.map((r) => mapContactListItem(r)), total, page, limit }
  }

  async counts(schemaName: string, userId: string): Promise<ContactCounts> {
    const cached = await this.stats.getCounts(schemaName, userId)
    if (cached) return cached
    const [rows, archived, ownership] = await Promise.all([
      this.repository.countByStatus(schemaName),
      this.repository.countArchived(schemaName),
      this.repository.countOwnership(schemaName, userId),
    ])
    const byStatus: Record<string, number> = {}
    let total = 0
    for (const row of rows) {
      const value = Number.parseInt(row.count, 10)
      byStatus[row.status] = value
      total += value
    }
    const counts = { total, archived, ...ownership, byStatus }
    await this.stats.setCounts(schemaName, userId, counts)
    return counts
  }

  async taxonomyUsage(schemaName: string): Promise<ContactTaxonomyUsage> {
    const cached = await this.stats.getUsage(schemaName)
    if (cached) return cached
    const raw = await this.repository.taxonomyUsage(schemaName)
    const toRecord = (rows: Array<{ key: string; count: string }>) =>
      Object.fromEntries(rows.map((row) => [row.key, Number.parseInt(row.count, 10)]))
    const usage = {
      statuses: toRecord(raw.statuses),
      sources: toRecord(raw.sources),
      lifecycleStages: toRecord(raw.lifecycleStages),
      tags: toRecord(raw.tags),
    }
    await this.stats.setUsage(schemaName, usage)
    return usage
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
    await this.stats.invalidate(schemaName)
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

  async findOne(schemaName: string, contactId: string): Promise<ContactListItem> {
    return this.db.query(schemaName, async (qr): Promise<ContactListItem> => {
      const row = await this.repository.findDetailById(qr, contactId)
      if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
      return mapContactListItem(row)
    })
  }

  async create(
    schemaName: string,
    dto: CreateContactDto,
    createdById: string,
    force = false,
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
  ): Promise<Contact> {
    this.taxonomyRules.assertKeys(dto, taxonomy)
    const result = await this.withDuplicateGuard(schemaName, dto, () =>
      this.db.transactional(schemaName, async (qr): Promise<Contact> => {
        await this.duplicates.assertNoDuplicates(qr, dto, { force })

        const tags = await this.taxonomyRules.resolveTags(qr, dto.tags ?? [])
        const row = await this.repository.insert(qr, {
          ...toCreateContactData(dto, createdById, taxonomy),
          tags,
        })
        if (!row) throw new InternalServerErrorException('Contact insert returned no row')
        return mapContact(row)
      }),
    )
    await this.stats.invalidate(schemaName)
    this.emitAudit(
      schemaName,
      AuditAction.ContactCreated,
      result.id,
      createdById,
      `Contact ${dto.firstName} created`,
    )
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
    actor?: ContactActor,
  ): Promise<Contact> {
    this.taxonomyRules.assertKeys(dto, taxonomy)
    const changedBy = actor?.id
    let lifecycleFrom: string | null | undefined
    let ownerChanged = false
    const result = await this.withDuplicateGuard(
      schemaName,
      dto,
      () =>
        this.db.transactional(schemaName, async (qr): Promise<Contact> => {
          const previous = await this.repository.findActiveById(qr, contactId, { forUpdate: true })
          if (!previous) throw new NotFoundException(`Contact ${contactId} not found`)
          ownerChanged =
            dto.assignedToId !== undefined &&
            dto.assignedToId !== null &&
            dto.assignedToId !== previous.assigned_to_id
          await this.duplicates.assertNoDuplicates(qr, dto, { force, excludeId: contactId })

          const sanitized =
            dto.tags === undefined
              ? dto
              : { ...dto, tags: await this.taxonomyRules.resolveTags(qr, dto.tags ?? []) }
          const changes = toContactChanges(sanitized)
          if (!changes.length) return this.fetchContactOrFail(qr, contactId)

          const row = await this.repository.updateById(qr, contactId, changes)
          if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
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
          return mapContact(row)
        }),
      contactId,
    )
    await this.stats.invalidate(schemaName)
    this.emitAudit(
      schemaName,
      AuditAction.ContactUpdated,
      contactId,
      changedBy,
      `Contact ${contactId} updated`,
    )
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
    if (ownerChanged && actor && result.assignedToId) {
      this.notifyAssignment(schemaName, actor, result)
    }
    return result
  }

  private notifyAssignment(schemaName: string, actor: ContactActor, contact: Contact): void {
    if (!contact.assignedToId || contact.assignedToId === actor.id) return
    const contactName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
    this.eventBus.emit(DOMAIN_EVENTS.CONTACT_ASSIGNED, {
      schemaName,
      tenantId: actor.tenantId,
      userId: contact.assignedToId,
      type: NotificationType.CONTACT_ASSIGNED,
      title: `Te asignaron el contacto ${contactName}`,
      entityType: 'contact',
      entityId: contact.id,
      data: { contactId: contact.id, contactName, assignedById: actor.id, count: 1 },
    })
  }

  async remove(schemaName: string, contactId: string): Promise<void> {
    await this.db.transactional(schemaName, async (qr): Promise<void> => {
      await this.assertContactExists(qr, contactId)
      await this.repository.softDeleteById(qr, contactId)
    })
    await this.stats.invalidate(schemaName)
    this.emitAudit(
      schemaName,
      AuditAction.ContactDeleted,
      contactId,
      undefined,
      `Contact ${contactId} deleted`,
    )
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_DELETED, {
      schemaName,
      entityType: 'contact',
      entityId: contactId,
    })
  }

  async restore(schemaName: string, contactId: string, userId?: string): Promise<Contact> {
    const restored = await this.db.transactional(schemaName, async (qr): Promise<Contact> => {
      const row = await this.repository.restoreById(qr, contactId)
      if (!row) throw new NotFoundException(`Archived contact ${contactId} not found`)
      return mapContact(row)
    })
    await this.stats.invalidate(schemaName)
    this.emitAudit(
      schemaName,
      AuditAction.ContactUpdated,
      contactId,
      userId,
      `Contact ${contactId} restored`,
    )
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_UPDATED, {
      schemaName,
      entityType: 'contact',
      entityId: contactId,
      contact: restored,
    })
    return restored
  }

  async getTimeline(
    schemaName: string,
    contactId: string,
    limit = CONTACT_TIMELINE_DEFAULT,
  ): Promise<ContactTimeline> {
    return this.db.query(schemaName, async (qr): Promise<ContactTimeline> => {
      await this.assertContactExists(qr, contactId)

      const activityRows = await this.repository.findActivities(qr, contactId, limit)
      const dealRows = await this.repository.findDeals(qr, contactId, limit)

      return {
        activities: activityRows.map((a) => mapContactActivity(a)),
        deals: dealRows.map((d) => mapContactDeal(d)),
      }
    })
  }

  private async withDuplicateGuard<T>(
    schemaName: string,
    dto: UpdateContactDto,
    write: () => Promise<T>,
    excludeId?: string,
  ): Promise<T> {
    try {
      return await write()
    } catch (error) {
      if (!isUniqueViolation(error, CONTACT_UNIQUE_CONSTRAINT)) throw error
      await this.db.query(schemaName, (qr) =>
        this.duplicates.assertNoDuplicates(qr, dto, { excludeId }),
      )
      throw new ConflictException('contact_duplicate')
    }
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
}
