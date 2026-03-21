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
  {
    // Adds email, tags, assigned_to_id to companies (not in original schema)
    // + GIN indices for full-text search and tag filtering
    id: '0005_companies_email_tags_assigned_to',
    up: (schema) => `
      ALTER TABLE "${schema}".companies
        ADD COLUMN IF NOT EXISTS email          VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tags           TEXT[]  DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS assigned_to_id UUID    REFERENCES "${schema}".users(id);

      CREATE INDEX IF NOT EXISTS "idx_${schema}_companies_fts"
        ON "${schema}".companies
        USING GIN (
          to_tsvector('spanish',
            coalesce(name, '') || ' ' ||
            coalesce(nit,  '')
          )
        )
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_companies_tags"
        ON "${schema}".companies USING GIN (tags);

      CREATE INDEX IF NOT EXISTS "idx_${schema}_companies_status"
        ON "${schema}".companies (assigned_to_id, is_active);
    `,
  },
  {
    // Enforce NIT uniqueness per tenant (only active companies with non-null NIT)
    id: '0006_companies_nit_unique',
    up: (schema) => `
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_${schema}_companies_nit"
        ON "${schema}".companies (nit)
        WHERE nit IS NOT NULL AND is_active = true;
    `,
  },
  {
    id: '0007_deal_items',
    up: (schema) => `
      CREATE TABLE IF NOT EXISTS "${schema}".deal_items (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id          UUID NOT NULL REFERENCES "${schema}".deals(id) ON DELETE CASCADE,
        product_id       UUID REFERENCES "${schema}".products(id),
        description      VARCHAR(500) NOT NULL,
        quantity         INTEGER NOT NULL DEFAULT 1,
        unit_price_cents BIGINT NOT NULL DEFAULT 0,
        discount_percent INTEGER DEFAULT 0,
        iva_rate         INTEGER DEFAULT 19,
        position         INTEGER NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "idx_${schema}_deal_items_deal"
        ON "${schema}".deal_items (deal_id, position);
    `,
  },
  {
    id: '0008_deal_stage_history',
    up: (schema) => `
      CREATE TABLE IF NOT EXISTS "${schema}".deal_stage_history (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id       UUID NOT NULL REFERENCES "${schema}".deals(id) ON DELETE CASCADE,
        from_stage_id UUID REFERENCES "${schema}".pipeline_stages(id),
        to_stage_id   UUID REFERENCES "${schema}".pipeline_stages(id),
        from_status   VARCHAR(30),
        to_status     VARCHAR(30),
        changed_by    UUID REFERENCES "${schema}".users(id),
        changed_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "idx_${schema}_deal_stage_history"
        ON "${schema}".deal_stage_history (deal_id, changed_at DESC);
    `,
  },
  {
    id: '0009_activities_enhance',
    up: (schema) => `
      ALTER TABLE "${schema}".activities
        ADD COLUMN IF NOT EXISTS status          VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
        ADD COLUMN IF NOT EXISTS reminder_at      TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_activities_assigned"
        ON "${schema}".activities (assigned_to_id, due_date)
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_activities_contact"
        ON "${schema}".activities (contact_id)
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_activities_deal"
        ON "${schema}".activities (deal_id)
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_activities_calendar"
        ON "${schema}".activities (due_date, assigned_to_id)
        WHERE is_active = true AND status = 'pending';
    `,
  },
  {
    id: '0010_products_enhance',
    up: (schema) => `
      ALTER TABLE "${schema}".products
        ADD COLUMN IF NOT EXISTS barcode       VARCHAR(100),
        ADD COLUMN IF NOT EXISTS category      VARCHAR(100),
        ADD COLUMN IF NOT EXISTS brand         VARCHAR(100),
        ADD COLUMN IF NOT EXISTS currency      VARCHAR(3) DEFAULT 'COP',
        ADD COLUMN IF NOT EXISTS weight_grams  INTEGER,
        ADD COLUMN IF NOT EXISTS tags          TEXT[]  DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS images        TEXT[]  DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS custom_fields JSONB   DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS created_by    UUID    REFERENCES "${schema}".users(id);

      CREATE INDEX IF NOT EXISTS "idx_${schema}_products_sku"
        ON "${schema}".products (sku)
        WHERE sku IS NOT NULL AND is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_products_barcode"
        ON "${schema}".products (barcode)
        WHERE barcode IS NOT NULL AND is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_products_category"
        ON "${schema}".products (category)
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_products_fts"
        ON "${schema}".products
        USING GIN (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(description,'')))
        WHERE is_active = true;

      CREATE INDEX IF NOT EXISTS "idx_${schema}_products_tags"
        ON "${schema}".products USING GIN (tags);

      CREATE INDEX IF NOT EXISTS "idx_${schema}_inventory_product"
        ON "${schema}".inventory_movements (product_id, created_at DESC);
    `,
  },
  {
    id: '0011_notification_preferences_muted_types',
    up: (schema) => `
      ALTER TABLE "${schema}".notification_preferences
        ADD COLUMN IF NOT EXISTS muted_types TEXT[] DEFAULT '{}';
    `,
  },
  {
    id: '0012_tags_saved_filters_message_templates',
    up: (schema) => `
      CREATE TABLE IF NOT EXISTS "${schema}".tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) DEFAULT '#6B7280',
        entity_type VARCHAR(30) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${schema}".saved_filters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "${schema}".users(id),
        entity_type VARCHAR(30) NOT NULL,
        name VARCHAR(200) NOT NULL,
        filters JSONB NOT NULL DEFAULT '{}',
        is_default BOOLEAN DEFAULT false,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${schema}".message_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        channel VARCHAR(20) NOT NULL DEFAULT 'email',
        subject VARCHAR(500),
        body TEXT NOT NULL,
        variables TEXT[] DEFAULT '{}',
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES "${schema}".users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "idx_${schema}_tags_entity"
        ON "${schema}".tags (entity_type, name);
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_${schema}_tags_unique"
        ON "${schema}".tags (entity_type, LOWER(name));
      CREATE INDEX IF NOT EXISTS "idx_${schema}_saved_filters_user"
        ON "${schema}".saved_filters (user_id, entity_type);
      CREATE INDEX IF NOT EXISTS "idx_${schema}_message_templates_channel"
        ON "${schema}".message_templates (channel) WHERE is_active = true;
    `,
  },
  {
    id: '0013_activities_mentioned_users',
    up: (schema) => `
      ALTER TABLE "${schema}".activities
        ADD COLUMN IF NOT EXISTS mentioned_user_ids UUID[] DEFAULT '{}';
    `,
  },
]
