import { Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'
import type { ApiKey } from '@repo/shared-types'
import type { ApiKeyRow } from '../interfaces/api-key-row.interfaces'
import { toApiKey } from '../mappers/api-key.mapper'
import { ApiKeysRepository } from '../repositories/api-keys.repository'

@Injectable()
export class ApiKeysService {
  constructor(private readonly repository: ApiKeysRepository) {}

  async findAll(schemaName: string): Promise<ApiKey[]> {
    const rows = await this.repository.findAllActive(schemaName)
    return rows.map(toApiKey)
  }

  async create(
    schemaName: string,
    data: { name: string; scopes?: string[]; expiresAt?: string },
    userId: string,
  ): Promise<ApiKey & { rawKey: string }> {
    const rawKey = `nxo_${randomBytes(32).toString('hex')}`
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.slice(0, 10)

    const row = await this.repository.insert(schemaName, {
      name: data.name,
      keyHash,
      keyPrefix,
      scopes: data.scopes ?? ['*'],
      expiresAt: data.expiresAt ?? null,
      createdBy: userId,
    })
    return { ...toApiKey(row), rawKey }
  }

  async revoke(schemaName: string, keyId: string): Promise<void> {
    const updated = await this.repository.deactivateById(schemaName, keyId)
    if (updated === 0) throw new NotFoundException(`API key ${keyId} not found`)
  }

  async validateKey(schemaName: string, rawKey: string): Promise<ApiKeyRow | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    return this.repository.findActiveByHashAndMarkUsed(schemaName, keyHash)
  }
}
