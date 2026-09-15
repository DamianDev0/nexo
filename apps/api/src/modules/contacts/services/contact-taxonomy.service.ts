import { BadRequestException, Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactTaxonomy } from '@repo/shared-types'
import type { UpdateContactDto } from '../dto/contact.dto'
import { ContactsRepository } from '../repositories/contacts.repository'

@Injectable()
export class ContactTaxonomyService {
  constructor(private readonly repository: ContactsRepository) {}

  assertKeys(dto: UpdateContactDto, taxonomy: ContactTaxonomy): void {
    const checks: Array<[string | null | undefined, keyof ContactTaxonomy, boolean]> = [
      [dto.status, 'statuses', false],
      [dto.source, 'sources', true],
      [dto.lifecycleStage, 'lifecycleStages', false],
    ]

    const invalid = checks
      .filter(([value, kind, clearable]) => {
        if (value === undefined) return false
        if (value === null) return !clearable
        return !taxonomy[kind].some((option) => option.enabled && option.key === value)
      })
      .map(([value, kind]) => `${kind}: ${value}`)

    if (invalid.length > 0) {
      throw new BadRequestException(`Unknown taxonomy keys — ${invalid.join(', ')}`)
    }
  }

  async resolveTags(qr: QueryRunner, tags: string[]): Promise<string[]> {
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
}
