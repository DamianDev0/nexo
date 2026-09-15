import { Injectable, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { CacheService } from '@/shared/cache/cache.service'
import type { StoredFile } from '../interfaces/import.interfaces'

const FILE_TTL_SECONDS = 10 * 60
const EXPIRED_MESSAGE = 'The uploaded file has expired. Please upload again.'

type StoredFileRecord = {
  readonly fileName: string
  readonly scope: string
  readonly data: string
  readonly expiresAt: number
}

@Injectable()
export class ImportFileStoreService {
  constructor(private readonly cache: CacheService) {}

  async storeFile(buffer: Buffer, fileName: string, scope: string): Promise<string> {
    const fileId = randomUUID()
    const record: StoredFileRecord = {
      fileName,
      scope,
      data: buffer.toString('base64'),
      expiresAt: Date.now() + FILE_TTL_SECONDS * 1000,
    }
    await this.cache.set(this.key(fileId), record, FILE_TTL_SECONDS)
    return fileId
  }

  async getFile(fileId: string, scope: string): Promise<StoredFile> {
    const record = await this.cache.get<StoredFileRecord>(this.key(fileId))
    if (record?.scope !== scope) throw new BadRequestException(EXPIRED_MESSAGE)
    return {
      buffer: Buffer.from(record.data, 'base64'),
      fileName: record.fileName,
      scope: record.scope,
      expiresAt: record.expiresAt,
    }
  }

  async removeFile(fileId: string, scope: string): Promise<void> {
    const record = await this.cache.get<StoredFileRecord>(this.key(fileId))
    if (record?.scope !== scope) return
    await this.cache.del(this.key(fileId))
  }

  private key(fileId: string): string {
    return `imports:file:${fileId}`
  }
}
