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
import type {
  Contact,
  ContactCounts,
  ContactListItem,
  PaginatedContacts,
  ContactTimeline,
  ContactActivity,
  ContactDeal,
} from '@repo/shared-types'
import type { CreateContactDto, UpdateContactDto, ContactQueryDto } from '../dto/contact.dto'
import type { ContactRow, ActivityRow, DealRow } from '../interfaces/contact-row.interfaces'
import {
  UPDATABLE_FIELDS,
  CONTACT_COLUMNS,
  CONTACT_LIST_COLUMNS,
  SORTABLE_COLUMNS,
} from '../constants/contact.constants'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'

@Injectable()
export class ContactsService {
  constructor(
    private readonly db: TenantDbService,
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
    return this.db.query(schemaName, async (qr): Promise<PaginatedContacts> => {
      const page = query.page ?? 1
      const limit = query.limit ?? DEFAULT_PAGE_SIZE
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM contacts WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: ContactRow[] = await qr.query(
        `SELECT ${CONTACT_LIST_COLUMNS}
         FROM contacts
         WHERE ${where}
         ${this.buildOrderClause(query)}
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  async counts(schemaName: string): Promise<ContactCounts> {
    return this.db.query(schemaName, async (qr): Promise<ContactCounts> => {
      const rows: Array<{ status: string; count: string }> = await qr.query(
        `SELECT status, COUNT(*)::text AS count
         FROM contacts
         WHERE is_active = true
         GROUP BY status`,
      )
      const byStatus: Record<string, number> = {}
      let total = 0
      for (const row of rows) {
        const value = Number.parseInt(row.count, 10)
        byStatus[row.status] = value
        total += value
      }
      return { total, byStatus }
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
  ): Promise<Contact> {
    return this.db.query(schemaName, async (qr): Promise<Contact> => {
      await this.duplicates.assertNoDuplicates(qr, dto, { force })

      const rows: ContactRow[] = await qr.query(
        `INSERT INTO contacts (
           first_name, last_name, email, phone, whatsapp,
           document_type, document_number, job_title, linkedin_url, birthday,
           address, city, department, municipio_code,
           status, lifecycle_stage, source, lead_score,
           data_consent, consent_date, consent_source,
           opt_out_email, opt_out_sms, opt_out_whatsapp,
           tags, company_id, assigned_to_id, custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
         RETURNING ${CONTACT_COLUMNS}`,
        [
          dto.firstName,
          dto.lastName ?? null,
          dto.email ?? null,
          dto.phone ?? null,
          dto.whatsapp ?? null,
          dto.documentType ?? null,
          dto.documentNumber ?? null,
          dto.jobTitle ?? null,
          dto.linkedinUrl ?? null,
          dto.birthday ?? null,
          dto.address ?? null,
          dto.city ?? null,
          dto.department ?? null,
          dto.municipioCode ?? null,
          dto.status ?? 'new',
          dto.lifecycleStage ?? LifecycleStage.SUBSCRIBER,
          dto.source ?? null,
          dto.leadScore ?? 0,
          dto.dataConsent ?? false,
          dto.dataConsent ? new Date() : null,
          dto.consentSource ?? null,
          dto.optOutEmail ?? false,
          dto.optOutSms ?? false,
          dto.optOutWhatsapp ?? false,
          dto.tags ?? [],
          dto.companyId ?? null,
          dto.assignedToId ?? null,
          dto.customFields ?? {},
          createdById,
        ],
      )
      const row = rows[0]
      if (!row) throw new InternalServerErrorException('Contact insert returned no row')
      const result = this.mapContact(row)
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

      const updates: string[] = []
      const values: unknown[] = []

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          values.push(dto[dtoKey])
          updates.push(`${col} = $${values.length}`)
        }
      }

      if (dto.dataConsent !== undefined) {
        values.push(dto.dataConsent ? new Date() : null)
        updates.push(`consent_date = $${values.length}`)
      }

      if (!updates.length) return this.fetchContactOrFail(qr, contactId)

      values.push(contactId)
      const rows: ContactRow[] = await qr.query(
        `UPDATE contacts
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING ${CONTACT_COLUMNS}`,
        values,
      )
      const result = this.mapContact(rows[0]!)
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
      await qr.query(`UPDATE contacts SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        contactId,
      ])
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
        qr.query(
          `SELECT id, activity_type, title, description, due_date, completed_at,
                  assigned_to_id, created_by, created_at
           FROM activities
           WHERE contact_id = $1
           ORDER BY created_at DESC
           LIMIT 50`,
          [contactId],
        ) as Promise<ActivityRow[]>,
        qr.query(
          `SELECT id, title, value_cents, status, stage_id, pipeline_id,
                  expected_close_date, created_at
           FROM deals
           WHERE contact_id = $1 AND is_active = true
           ORDER BY created_at DESC`,
          [contactId],
        ) as Promise<DealRow[]>,
      ])

      return {
        activities: activityRows.map((a) => this.mapActivity(a)),
        deals: dealRows.map((d) => this.mapDeal(d)),
      }
    })
  }

  private async assertContactExists(qr: QueryRunner, contactId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    if (!rows[0]) throw new NotFoundException(`Contact ${contactId} not found`)
  }

  private async fetchContactOrFail(qr: QueryRunner, contactId: string): Promise<Contact> {
    const rows: ContactRow[] = await qr.query(
      `SELECT ${CONTACT_COLUMNS} FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
    return this.mapContact(row)
  }

  private buildWhereClause(query: ContactQueryDto): { where: string; params: unknown[] } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    const push = (condition: string, value: unknown) => {
      params.push(value)
      conditions.push(condition.replace('?', `$${params.length}`))
    }

    if (query.q) {
      push(
        `to_tsvector('spanish',
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name, '') || ' ' ||
          coalesce(email, '') || ' ' ||
          coalesce(document_number, '') || ' ' ||
          coalesce(phone, '')
        ) @@ plainto_tsquery('spanish', ?)`,
        query.q,
      )
    }
    if (query.status) push(`status = ?`, query.status)
    if (query.source) push(`source = ?`, query.source)
    if (query.lifecycleStage) push(`lifecycle_stage = ?`, query.lifecycleStage)
    if (query.tags?.length) push(`tags @> ?::text[]`, query.tags)
    if (query.companyId) push(`company_id = ?`, query.companyId)
    if (query.assignedToId) push(`assigned_to_id = ?`, query.assignedToId)
    if (query.city) push(`LOWER(city) = LOWER(?)`, query.city)
    if (query.createdFrom) push(`created_at >= ?`, query.createdFrom)
    if (query.createdTo) push(`created_at <= ?`, query.createdTo)
    if (query.lastContactedFrom) push(`last_contacted_at >= ?`, query.lastContactedFrom)
    if (query.lastContactedTo) push(`last_contacted_at <= ?`, query.lastContactedTo)

    return { where: conditions.join(' AND '), params }
  }

  private buildOrderClause(query: ContactQueryDto): string {
    const column = query.sortBy ? SORTABLE_COLUMNS[query.sortBy] : 'created_at'
    const direction = query.sortDir === 'asc' ? 'ASC' : 'DESC'
    return `ORDER BY ${column} ${direction} NULLS LAST, id ASC`
  }

  private mapListItem(r: ContactRow): ContactListItem {
    return {
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      whatsapp: r.whatsapp,
      documentType: r.document_type as ContactListItem['documentType'],
      documentNumber: r.document_number,
      jobTitle: r.job_title ?? null,
      linkedinUrl: r.linkedin_url ?? null,
      birthday: r.birthday ?? null,
      address: r.address ?? null,
      city: r.city,
      department: r.department,
      municipioCode: r.municipio_code,
      country: r.country ?? 'CO',
      status: r.status as ContactListItem['status'],
      lifecycleStage: (r.lifecycle_stage ?? 'subscriber') as ContactListItem['lifecycleStage'],
      source: r.source as ContactListItem['source'],
      leadScore: r.lead_score,
      dataConsent: r.data_consent ?? false,
      consentDate: r.consent_date ?? null,
      consentSource: r.consent_source ?? null,
      optOutEmail: r.opt_out_email ?? false,
      optOutSms: r.opt_out_sms ?? false,
      optOutWhatsapp: r.opt_out_whatsapp ?? false,
      lastContactedAt: r.last_contacted_at ?? null,
      tags: r.tags,
      companyId: r.company_id,
      assignedToId: r.assigned_to_id,
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapContact(r: ContactRow): Contact {
    return {
      ...this.mapListItem(r),
      customFields: r.custom_fields ?? {},
    }
  }

  private mapActivity(a: ActivityRow): ContactActivity {
    return {
      id: a.id,
      activityType: a.activity_type,
      title: a.title,
      description: a.description,
      dueDate: a.due_date,
      completedAt: a.completed_at,
      assignedToId: a.assigned_to_id,
      createdById: a.created_by,
      createdAt: a.created_at,
    }
  }

  private mapDeal(d: DealRow): ContactDeal {
    return {
      id: d.id,
      title: d.title,
      valueCents: d.value_cents,
      status: d.status,
      stageId: d.stage_id,
      pipelineId: d.pipeline_id,
      expectedCloseDate: d.expected_close_date,
      createdAt: d.created_at,
    }
  }
}
