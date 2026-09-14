import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import { ContactsRepository } from '../repositories/contacts.repository'
import { mapContact } from '../mappers/contact.mapper'
import type { ContactMergeResult } from '@repo/shared-types'
import type { MergeContactDto } from '../dto/contact.dto'

@Injectable()
export class ContactMergeService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactsRepository,
    private readonly eventBus: EventBusService,
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
        const winner = await this.repository.findActiveById(qr, winnerId)
        if (!winner) throw new NotFoundException(`Contact ${winnerId} not found`)

        const loser = await this.repository.findActiveById(qr, dto.loserId)
        if (!loser) throw new NotFoundException(`Contact ${dto.loserId} not found`)

        const moved = await this.repository.moveChildRows(qr, loser.id, winner.id)
        const movedConsents = await this.repository.moveMissingConsents(qr, loser.id, winner.id)
        await this.repository.dropRemainingConsents(qr, loser.id)

        const merged = await this.repository.applyMergedFields(
          qr,
          winner.id,
          loser.id,
          dto.fieldsFromLoser ?? [],
        )
        if (!merged) throw new NotFoundException(`Contact ${winnerId} not found`)

        await this.repository.markMergedInto(qr, loser.id, winner.id)

        this.eventBus.emit(
          AUDIT_EVENTS.ENTITY,
          new AuditEntityEvent(
            schemaName,
            AuditAction.ContactUpdated,
            AuditEntityType.Contact,
            winner.id,
            userId,
            `Contact ${loser.id} merged into ${winner.id}`,
          ),
        )

        return {
          contact: mapContact(merged),
          movedRecords: Object.values(moved).reduce((total, count) => total + count, 0),
          movedActivities: moved.activities ?? 0,
          movedDeals: moved.deals ?? 0,
          movedConsents,
        }
      },
    )

    this.eventBus.emitCrm(DOMAIN_EVENTS.CONTACT_MERGED, {
      schemaName,
      entityType: 'contact',
      entityId: winnerId,
      contact: result.contact,
    })

    return result
  }
}
