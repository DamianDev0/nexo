export interface ApiKeyRow {
  id: string
  name: string
  key_hash: string
  key_prefix: string
  scopes: string[]
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export type InsertApiKeyData = {
  name: string
  keyHash: string
  keyPrefix: string
  scopes: string[]
  expiresAt: string | null
  createdBy: string
}
