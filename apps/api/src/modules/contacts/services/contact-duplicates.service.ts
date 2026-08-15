import { ConflictException, Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactDuplicatePayload } from '@repo/shared-types'
import type { DuplicateProbe } from '../interfaces/contact-duplicate-row.interfaces'
import { ContactDuplicatesRepository } from '../repositories/contact-duplicates.repository'
import { mapContactDuplicatePayload } from '../mappers/contact-duplicate.mapper'

@Injectable()
export class ContactDuplicatesService {
  constructor(private readonly repository: ContactDuplicatesRepository) {}

  async assertNoDuplicates(
    qr: QueryRunner,
    probe: DuplicateProbe,
    options: { force?: boolean; excludeId?: string } = {},
  ): Promise<void> {
    const hard = await this.findHard(qr, probe, options.excludeId)
    if (hard) this.throwConflict(hard)

    const soft = await this.findSoft(qr, probe, options.excludeId)
    if (soft && !(options.force === true && soft.canForce)) this.throwConflict(soft)
  }

  async probe(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<ContactDuplicatePayload | null> {
    const hard = await this.findHard(qr, probe, excludeId)
    if (hard) return hard
    return this.findSoft(qr, probe, excludeId)
  }

  private async findHard(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<ContactDuplicatePayload | null> {
    const email = probe.email?.trim().toLowerCase()
    if (email) {
      const rows = await this.repository.findByEmail(qr, email, excludeId)
      if (rows.length > 0) return mapContactDuplicatePayload('hard', 'email', rows)
    }

    const document = probe.documentNumber?.trim()
    if (document) {
      const rows = await this.repository.findByDocumentNumber(qr, document, excludeId)
      if (rows.length > 0) return mapContactDuplicatePayload('hard', 'documentNumber', rows)
    }

    return null
  }

  private async findSoft(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<ContactDuplicatePayload | null> {
    const phones = [probe.phone?.trim(), probe.whatsapp?.trim()].filter((value): value is string =>
      Boolean(value),
    )
    if (phones.length > 0) {
      const rows = await this.repository.findByPhones(qr, phones, excludeId)
      if (rows.length > 0) return mapContactDuplicatePayload('soft', 'phone', rows)
    }

    const first = probe.firstName?.trim().toLowerCase()
    const last = probe.lastName?.trim().toLowerCase()
    if (first && last) {
      const rows = await this.repository.findByName(qr, first, last, excludeId)
      if (rows.length > 0) return mapContactDuplicatePayload('soft', 'name', rows)
    }

    return null
  }

  private throwConflict(duplicate: ContactDuplicatePayload): never {
    throw new ConflictException({
      statusCode: 409,
      error: 'Conflict',
      message: 'contact_duplicate',
      duplicate,
    })
  }
}
