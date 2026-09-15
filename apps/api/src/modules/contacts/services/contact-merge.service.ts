import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AuditAction } from '@/shared/events/audit.events'
import { ContactsRepository } from '../repositories/contacts.repository'
import { mapContact } from '../mappers/contact.mapper'
import { emitContactAudit } from './contact-audit'
import { ContactStatsCacheService } from './contact-stats-cache.service'
import type { ContactMergeResult } from '@repo/shared-types'
import type { ContactRow } from '../interfaces/contact-row.interfaces'
import type { MergeContactDto } from '../dto/contact.dto'

@Injectable()
export class ContactMergeService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactsRepository,
    private readonly eventBus: EventBusService,
    private readonly stats: ContactStatsCacheService,
  ) {}

  async merge(
    schemaName: string,
    winnerId: string,
    dto: MergeContactDto,
    userId?: string,
  ): Promise<ContactMergeResult> {
    if (winnerId === dto.loserId) {
      throw new BadRequestException('A contact cannot be merged into itself')
    }

    const result = await this.db.transactional(
      schemaName,
      async (qr): Promise<ContactMergeResult> => {
        const locked = await this.repository.lockByIds(qr, [winnerId, dto.loserId])
        const winner = this.requireActive(locked, winnerId)
        const loser = this.requireActive(locked, dto.loserId)

        const moved = await this.repository.moveChildRows(qr, loser.id, winner.id)
        const movedConsents = await this.repository.moveMissingConsents(qr, loser.id, winner.id)
        await this.repository.dropRemainingConsents(qr, loser.id)
        await this.repository.markMergedInto(qr, loser.id, winner.id)

        const merged = await this.repository.applyMergedFields(
          qr,
          winner.id,
          loser.id,
          dto.fieldsFromLoser ?? [],
        )
        if (!merged) throw new NotFoundException(`Contact ${winnerId} not found`)

        return {
          contact: mapContact(merged),
          movedRecords: Object.values(moved).reduce((total, count) => total + count, 0),
          movedActivities: moved.activities ?? 0,
          movedDeals: moved.deals ?? 0,
          movedConsents,
        }
      },
    )

    await this.stats.invalidate(schemaName)
    emitContactAudit(this.eventBus, {
      schemaName,
      action: AuditAction.ContactUpdated,
      entityId: winnerId,
      userId,
      description: `Contact ${dto.loserId} merged into ${winnerId}`,
    })
    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_MERGED, {
      schemaName,
      entityType: 'contact',
      entityId: winnerId,
      contact: result.contact,
    })

    return result
  }

  private requireActive(rows: ReadonlyArray<ContactRow>, contactId: string): ContactRow {
    const row = rows.find((candidate) => candidate.id === contactId)
    if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
    if (!row.is_active) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'contact_already_merged',
        contactId,
      })
    }
    return row
  }
}
