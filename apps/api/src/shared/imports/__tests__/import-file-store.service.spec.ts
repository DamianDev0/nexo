import { BadRequestException } from '@nestjs/common'
import { ImportFileStoreService } from '../services/import-file-store.service'

const TENANT_A = 'tenant_a'
const TENANT_B = 'tenant_b'
const BUFFER = Buffer.from('firstName,email\nAna,ana@a.co\n')

describe('ImportFileStoreService', () => {
  let store: ImportFileStoreService

  beforeEach(() => {
    store = new ImportFileStoreService()
  })

  afterEach(() => {
    store.onModuleDestroy()
  })

  it('returns the file to the tenant that uploaded it', () => {
    const fileId = store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    expect(store.getFile(fileId, TENANT_A).fileName).toBe('contacts.csv')
  })

  it('hides the file from every other tenant', () => {
    const fileId = store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    expect(() => store.getFile(fileId, TENANT_B)).toThrow(BadRequestException)
  })

  it('refuses to let another tenant discard the file', () => {
    const fileId = store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    store.removeFile(fileId, TENANT_B)

    expect(store.getFile(fileId, TENANT_A).buffer).toEqual(BUFFER)
  })

  it('discards the file for the tenant that owns it', () => {
    const fileId = store.storeFile(BUFFER, 'contacts.csv', TENANT_A)

    store.removeFile(fileId, TENANT_A)

    expect(() => store.getFile(fileId, TENANT_A)).toThrow(BadRequestException)
  })

  it('expires the file once its lifetime is over', () => {
    const fileId = store.storeFile(BUFFER, 'contacts.csv', TENANT_A)
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 11 * 60 * 1000)

    expect(() => store.getFile(fileId, TENANT_A)).toThrow(BadRequestException)

    jest.restoreAllMocks()
  })
})
