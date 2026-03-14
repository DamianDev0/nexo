/**
 * Tenant Migration Registry
 *
 * Add migrations here in order. Each migration runs once per tenant schema
 * and is tracked in `tenant_{slug}.migrations`.
 *
 * Naming convention: NNN_description (e.g. 002_add_contact_lead_score)
 * Rules:
 *   - NEVER modify a migration that has already been deployed.
 *   - ALWAYS write idempotent SQL (use IF NOT EXISTS, IF EXISTS, etc.).
 *   - One logical change per migration.
 *   - The `down` SQL is optional but strongly recommended for critical changes.
 */
export interface TenantMigration {
  /** Unique name — used as the idempotency key in the migrations tracking table */
  name: string
  /** SQL to apply to the tenant schema. Use {schema} as a placeholder. */
  up: string
  /** SQL to roll back. Optional — used by the rollback script. */
  down?: string
}

export const migrations: TenantMigration[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 001 — Initial schema is created by TenantProvisioningService.createTenantSchema()
  //       during tenant registration. It is NOT a migration.
  //       Migrations start from 002 onwards for schema changes on existing tenants.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: '002_add_refresh_tokens',
    up: `
      CREATE TABLE IF NOT EXISTS "{schema}".refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "{schema}".users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(token_hash)
      )
    `,
    down: `DROP TABLE IF EXISTS "{schema}".refresh_tokens`,
  },
]
