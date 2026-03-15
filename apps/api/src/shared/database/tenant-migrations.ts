export interface TenantMigration {
  id: string
  /** Returns the SQL to apply. Must be idempotent (use IF NOT EXISTS, IF EXISTS, etc.) */
  up(schema: string): string
}

/**
 * Ordered list of migrations applied to every tenant schema.
 * New entries MUST be appended — never reorder or remove.
 */
export const TENANT_MIGRATIONS: TenantMigration[] = [
  {
    id: '0001_audit_log_description_metadata',
    up: (schema) => `
      ALTER TABLE "${schema}".audit_log
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS metadata   JSONB DEFAULT '{}';
      -- Widen entity_type if it was VARCHAR(30)
      ALTER TABLE "${schema}".audit_log
        ALTER COLUMN entity_type TYPE VARCHAR(50);
    `,
  },
  {
    id: '0002_audit_log_created_at_index',
    up: (schema) => `
      CREATE INDEX IF NOT EXISTS "idx_${schema}_audit_created_at"
        ON "${schema}".audit_log (created_at DESC);
    `,
  },
  {
    id: '0003_invitations_table',
    up: (schema) => `
      CREATE TABLE IF NOT EXISTS "${schema}".invitations (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       VARCHAR(255) NOT NULL,
        role        VARCHAR(30)  NOT NULL DEFAULT 'sales_rep',
        token_hash  VARCHAR(64)  NOT NULL,
        invited_by  UUID REFERENCES "${schema}".users(id),
        expires_at  TIMESTAMPTZ  NOT NULL,
        accepted_at TIMESTAMPTZ,
        created_at  TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE(token_hash),
        UNIQUE(email)
      );
    `,
  },
  {
    id: '0004_password_reset_tokens_table',
    up: (schema) => `
      CREATE TABLE IF NOT EXISTS "${schema}".password_reset_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES "${schema}".users(id) ON DELETE CASCADE,
        token_hash  VARCHAR(64) NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        used_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(token_hash)
      );
    `,
  },
]
