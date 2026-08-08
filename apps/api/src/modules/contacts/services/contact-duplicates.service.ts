import { ConflictException, Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactDuplicateMatch, ContactDuplicatePayload } from '@repo/shared-types'
import type { DuplicateProbe } from '../interfaces/contact-duplicate-row.interfaces'
import { ContactDuplicatesRepository } from '../repositories/contact-duplicates.repository'
import { mapContactDuplicateMatch } from '../mappers/contact-duplicate.mapper'

@Injectable()
export class ContactDuplicatesService {
  constructor(private readonly repository: ContactDuplicatesRepository) {}

  async assertNoDuplicates(
    qr: QueryRunner,
    probe: DuplicateProbe,
    options: { force?: boolean; excludeId?: string } = {},
  ): Promise<void> {
    const hard = await this.findHard(qr, probe, options.excludeId)
    if (hard) this.throwConflict('hard', hard.field, hard.matches)

    if (options.force) return
    const soft = await this.findSoft(qr, probe, options.excludeId)
    if (soft) this.throwConflict('soft', soft.field, soft.matches)
  }

  private async findHard(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<{ field: ContactDuplicateMatch['field']; matches: ContactDuplicateMatch[] } | null> {
    const email = probe.email?.trim().toLowerCase()
    if (email) {
      const rows = await this.repository.findByEmail(qr, email, excludeId)
      if (rows.length > 0) {
        return { field: 'email', matches: rows.map((r) => mapContactDuplicateMatch(r, 'email')) }
      }
    }

    const document = probe.documentNumber?.trim()
    if (document) {
      const rows = await this.repository.findByDocumentNumber(qr, document, excludeId)
      if (rows.length > 0) {
        return {
          field: 'documentNumber',
          matches: rows.map((r) => mapContactDuplicateMatch(r, 'documentNumber')),
        }
      }
    }

    return null
  }

  private async findSoft(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<{ field: ContactDuplicateMatch['field']; matches: ContactDuplicateMatch[] } | null> {
    const phones = [probe.phone?.trim(), probe.whatsapp?.trim()].filter((value): value is string =>
      Boolean(value),
    )
    if (phones.length > 0) {
      const rows = await this.repository.findByPhones(qr, phones, excludeId)
      if (rows.length > 0) {
        return { field: 'phone', matches: rows.map((r) => mapContactDuplicateMatch(r, 'phone')) }
      }
    }

    const first = probe.firstName?.trim().toLowerCase()
    const last = probe.lastName?.trim().toLowerCase()
    if (first && last) {
      const rows = await this.repository.findByName(qr, first, last, excludeId)
      if (rows.length > 0) {
        return { field: 'name', matches: rows.map((r) => mapContactDuplicateMatch(r, 'name')) }
      }
    }

    return null
  }

  private throwConflict(
    severity: ContactDuplicatePayload['severity'],
    field: ContactDuplicateMatch['field'],
    matches: ContactDuplicateMatch[],
  ): never {
    throw new ConflictException({
      statusCode: 409,
      error: 'Conflict',
      message: 'contact_duplicate',
      duplicate: { severity, field, matches } satisfies ContactDuplicatePayload,
    })
  }
}
