import { Injectable, OnModuleDestroy, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

const FILE_TTL_MS = 10 * 60 * 1000
const CLEANUP_INTERVAL_MS = 60 * 1000

interface StoredFile {
  buffer: Buffer
  fileName: string
  expiresAt: number
}

@Injectable()
export class ImportFileStoreService implements OnModuleDestroy {
  private readonly store = new Map<string, StoredFile>()
  private readonly cleanupTimer: ReturnType<typeof setInterval>

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanupExpired(), CLEANUP_INTERVAL_MS)
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer)
    this.store.clear()
  }

  storeFile(buffer: Buffer, fileName: string): string {
    const fileId = randomUUID()
    this.store.set(fileId, { buffer, fileName, expiresAt: Date.now() + FILE_TTL_MS })
    return fileId
  }

  getBuffer(fileId: string): Buffer {
    const stored = this.store.get(fileId)
    if (!stored || stored.expiresAt < Date.now()) {
      this.store.delete(fileId)
      throw new BadRequestException('The uploaded file has expired. Please upload again.')
    }
    return stored.buffer
  }

  removeFile(fileId: string): void {
    this.store.delete(fileId)
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const [id, file] of this.store) {
      if (file.expiresAt < now) {
        this.store.delete(id)
      }
    }
  }
}
