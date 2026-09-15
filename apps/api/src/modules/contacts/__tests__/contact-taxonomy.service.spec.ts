import { BadRequestException } from '@nestjs/common'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import type { ContactTaxonomy } from '@repo/shared-types'
import { ContactTaxonomyService } from '../services/contact-taxonomy.service'
import type { UpdateContactDto } from '../dto/contact.dto'
import { type ContactsRepository } from '../repositories/contacts.repository'
import { buildQrMock } from '@/shared/testing/tenant-db.mock'

function taxonomyWithDisabledSource(): ContactTaxonomy {
  return {
    ...DEFAULT_CONTACT_TAXONOMY,
    sources: DEFAULT_CONTACT_TAXONOMY.sources.map((option) =>
      option.key === 'manual' ? { ...option, enabled: false } : option,
    ),
  }
}

describe('ContactTaxonomyService', () => {
  let service: ContactTaxonomyService
  let repository: { findEnabledTagNames: jest.Mock }
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(() => {
    repository = { findEnabledTagNames: jest.fn() }
    service = new ContactTaxonomyService(repository as unknown as ContactsRepository)
    qr = buildQrMock()
  })

  describe('assertKeys', () => {
    it('throws BadRequestException for an unknown status', () => {
      expect(() => service.assertKeys({ status: 'ghost' }, DEFAULT_CONTACT_TAXONOMY)).toThrow(
        BadRequestException,
      )
    })

    it('allows a null source since source is clearable', () => {
      expect(() => service.assertKeys({ source: null }, DEFAULT_CONTACT_TAXONOMY)).not.toThrow()
    })

    it('rejects a null status since status is not clearable', () => {
      const dto = { status: null } as unknown as UpdateContactDto
      expect(() => service.assertKeys(dto, DEFAULT_CONTACT_TAXONOMY)).toThrow(BadRequestException)
    })

    it('rejects an option that exists but is disabled', () => {
      expect(() => service.assertKeys({ source: 'manual' }, taxonomyWithDisabledSource())).toThrow(
        BadRequestException,
      )
    })
  })

  describe('resolveTags', () => {
    it('canonicalizes tag casing against the enabled catalog', async () => {
      repository.findEnabledTagNames.mockResolvedValue(['VIP', 'Mayorista'])

      const result = await service.resolveTags(qr as never, ['vip'])

      expect(result).toEqual(['VIP'])
    })

    it('dedupes tags that resolve to the same canonical name', async () => {
      repository.findEnabledTagNames.mockResolvedValue(['VIP'])

      const result = await service.resolveTags(qr as never, ['VIP', 'vip', ' vip '])

      expect(result).toEqual(['VIP'])
    })

    it('rejects tags that are not in the enabled catalog', async () => {
      repository.findEnabledTagNames.mockResolvedValue(['VIP'])

      await expect(service.resolveTags(qr as never, ['fantasma'])).rejects.toThrow(
        BadRequestException,
      )
    })

    it('skips the query and returns an empty array when input is empty', async () => {
      const result = await service.resolveTags(qr as never, [])

      expect(result).toEqual([])
      expect(repository.findEnabledTagNames).not.toHaveBeenCalled()
    })
  })
})
