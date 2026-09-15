import { BadRequestException } from '@nestjs/common'
import { ImportFileStoreService } from '../services/import-file-store.service'
import type { CacheService } from '@/shared/cache/cache.service'

const TENANT_A = 'tenant_a'
const TENANT_B = 'tenant_b'
const BUFFER = Buffer.from('firstName,email\nAna,ana@a.co\n')

function buildCache() {
  const entries = new Map<string, unknown>()
  return {
    entries,
    service: {
      get: jest.fn((key: string) => Promise.resolve(entries.get(key) ?? null)),
      set: jest.fn((key: string, value: unknown) => {
        entries.set(key, value)
        return Promise.resolve()
      }),
      del: jest.fn((key: string) => {
        entries.delete(key)
        return Promise.resolve()
      }),
    } as unknown as CacheService,
  }
}

describe('ImportFileStoreService', () => {
  let store: ImportFileStoreService
  let cache: ReturnType<typeof buildCache>

  beforeEach(() => {
    cache = buildCache()
    store = new ImportFileStoreService(cache.service)
  })

  it('returns the file to the tenant that uploaded it', async () => {
    const fileId = await store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    const stored = await store.getFile(fileId, TENANT_A)
    expect(stored.fileName).toBe('contacts.csv')
    expect(stored.buffer).toEqual(BUFFER)
  })

  it('stores the file in the shared cache with a ten minute ttl', async () => {
    await store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    const [key, , ttl] = (cache.service.set as jest.Mock).mock.calls[0] as [string, unknown, number]
    expect(key).toMatch(/^imports:file:/)
    expect(ttl).toBe(600)
  })

  it('hides the file from every other tenant', async () => {
    const fileId = await store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    await expect(store.getFile(fileId, TENANT_B)).rejects.toThrow(BadRequestException)
  })

  it('refuses to let another tenant discard the file', async () => {
    const fileId = await store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    await store.removeFile(fileId, TENANT_B)

    await expect(store.getFile(fileId, TENANT_A)).resolves.toMatchObject({ scope: TENANT_A })
  })

  it('discards the file for the tenant that owns it', async () => {
    const fileId = await store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    await store.removeFile(fileId, TENANT_A)

    await expect(store.getFile(fileId, TENANT_A)).rejects.toThrow(BadRequestException)
  })

  it('treats a missing or expired file as gone', async () => {
    await expect(store.getFile('missing', TENANT_A)).rejects.toThrow(BadRequestException)
  })
})
