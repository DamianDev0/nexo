import type { ApiKey } from '@repo/shared-types'
import type { ApiKeyRow } from '../interfaces/api-key-row.interfaces'

export function toApiKey(r: ApiKeyRow): ApiKey {
  return {
    id: r.id,
    name: r.name,
    keyPrefix: r.key_prefix,
    scopes: r.scopes ?? [],
    lastUsedAt: r.last_used_at,
    expiresAt: r.expires_at,
    isActive: r.is_active,
    createdAt: r.created_at,
  }
}
