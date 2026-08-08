import { ConflictException } from '@nestjs/common'
import { ContactDuplicatesService } from '../services/contact-duplicates.service'
import { ContactDuplicatesRepository } from '../repositories/contact-duplicates.repository'
import type { ContactDuplicatePayload } from '@repo/shared-types'

function makeDuplicateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'existing-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '3001234567',
    document_number: '123456789',
    ...overrides,
  }
}

function buildQrMock() {
  return { query: jest.fn() }
}

function getConflictPayload(error: unknown): ContactDuplicatePayload {
  const response = (error as ConflictException).getResponse() as {
    duplicate: ContactDuplicatePayload
  }
  return response.duplicate
}

describe('ContactDuplicatesService', () => {
  let service: ContactDuplicatesService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(() => {
    service = new ContactDuplicatesService(new ContactDuplicatesRepository())
    qr = buildQrMock()
  })

  describe('hard matches', () => {
    it('throws ConflictException with severity hard on email match, case-insensitively', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      try {
        await service.assertNoDuplicates(qr as never, { email: 'John@Example.com' })
        throw new Error('expected to throw')
      } catch (error) {
        expect((error as ConflictException).getResponse()).toMatchObject({
          statusCode: 409,
          message: 'contact_duplicate',
        })
        expect(getConflictPayload(error)).toMatchObject({ severity: 'hard', field: 'email' })
        const [, params] = qr.query.mock.calls[0] as [string, unknown[]]
        expect(params).toEqual(['john@example.com'])
      }
    })

    it('throws ConflictException with severity hard on document number match', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      try {
        await service.assertNoDuplicates(qr as never, { documentNumber: '123456789' })
        throw new Error('expected to throw')
      } catch (error) {
        expect(getConflictPayload(error)).toMatchObject({
          severity: 'hard',
          field: 'documentNumber',
        })
      }
    })

    it('checks email before document number and stops at the first hard match', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      await expect(
        service.assertNoDuplicates(qr as never, {
          email: 'john@example.com',
          documentNumber: '999999999',
        }),
      ).rejects.toThrow(ConflictException)

      expect(qr.query).toHaveBeenCalledTimes(1)
    })

    it('is not skipped by force: true', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      await expect(
        service.assertNoDuplicates(qr as never, { email: 'john@example.com' }, { force: true }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('soft matches', () => {
    it('throws ConflictException with severity soft on phone match', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      try {
        await service.assertNoDuplicates(qr as never, { phone: '3001234567' })
        throw new Error('expected to throw')
      } catch (error) {
        expect(getConflictPayload(error)).toMatchObject({ severity: 'soft', field: 'phone' })
      }
    })

    it('throws ConflictException with severity soft on first+last name match', async () => {
      qr.query.mockResolvedValueOnce([makeDuplicateRow()])

      try {
        await service.assertNoDuplicates(qr as never, { firstName: 'John', lastName: 'Doe' })
        throw new Error('expected to throw')
      } catch (error) {
        expect(getConflictPayload(error)).toMatchObject({ severity: 'soft', field: 'name' })
      }
    })

    it('is skipped entirely when force: true', async () => {
      await service.assertNoDuplicates(
        qr as never,
        { phone: '3001234567', firstName: 'John', lastName: 'Doe' },
        { force: true },
      )

      expect(qr.query).not.toHaveBeenCalled()
    })

    it('does not run when no probe fields are provided', async () => {
      await expect(service.assertNoDuplicates(qr as never, {})).resolves.toBeUndefined()
      expect(qr.query).not.toHaveBeenCalled()
    })
  })

  describe('excludeId', () => {
    it('adds an id exclusion clause and param to the query', async () => {
      qr.query.mockResolvedValueOnce([])

      await service.assertNoDuplicates(
        qr as never,
        { email: 'john@example.com' },
        { excludeId: 'self-1' },
      )

      const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
      expect(sql).toContain('AND id != $2')
      expect(params).toEqual(['john@example.com', 'self-1'])
    })

    it('excludes self from soft matches too', async () => {
      qr.query.mockResolvedValueOnce([])

      await service.assertNoDuplicates(
        qr as never,
        { firstName: 'John', lastName: 'Doe' },
        { excludeId: 'self-1' },
      )

      const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
      expect(sql).toContain('AND id != $3')
      expect(params).toEqual(['john', 'doe', 'self-1'])
    })
  })
})
