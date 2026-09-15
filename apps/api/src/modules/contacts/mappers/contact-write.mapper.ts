import { firstEnabledOptionKey } from '@repo/shared-types'
import type { ContactTaxonomy } from '@repo/shared-types'
import type { CreateContactDto, UpdateContactDto } from '../dto/contact.dto'
import type { ContactColumnChange, CreateContactData } from '../interfaces/contact-row.interfaces'
import { UPDATABLE_FIELDS } from '../constants/contact.constants'

export function toCreateContactData(
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
    avatarUrl: dto.avatarUrl ?? null,
    city: dto.city ?? null,
    municipioCode: dto.municipioCode ?? null,
    status: dto.status ?? firstEnabledOptionKey(taxonomy.statuses),
    lifecycleStage: dto.lifecycleStage ?? firstEnabledOptionKey(taxonomy.lifecycleStages),
    source: dto.source ?? null,
    tags: dto.tags ?? [],
    companyId: dto.companyId ?? null,
    assignedToId: dto.assignedToId ?? null,
    customFields: dto.customFields ?? {},
    createdBy: createdById,
  }
}

export function toContactChanges(dto: UpdateContactDto): ContactColumnChange[] {
  const changes: ContactColumnChange[] = []
  for (const [dtoKey, col] of UPDATABLE_FIELDS) {
    if (dto[dtoKey] !== undefined) changes.push({ column: col, value: dto[dtoKey] })
  }
  return changes
}
