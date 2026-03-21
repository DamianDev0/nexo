/**
 * Returns the SQL to create all tables for a tenant schema.
 * Each tenant lives in an isolated PostgreSQL schema identified by `schemaName`.
 */
export function getTenantSchemaSQL(schema: string): string {
  return `
    -- Users within the tenant
    CREATE TABLE "${schema}".users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255),
      full_name VARCHAR(200) NOT NULL,
      avatar_url TEXT,
      role VARCHAR(30) NOT NULL DEFAULT 'sales_rep',
      is_active BOOLEAN DEFAULT true,
      google_id VARCHAR(100),
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email)
    );

    -- Companies
    CREATE TABLE "${schema}".companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(300) NOT NULL,
      nit VARCHAR(20),
      nit_dv CHAR(1),
      tax_regime VARCHAR(50),
      company_size VARCHAR(30),
      sector_ciiu VARCHAR(10),
      website VARCHAR(500),
      phone VARCHAR(20),
      email VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      department VARCHAR(100),
      municipio_code VARCHAR(5),
      tags TEXT[] DEFAULT '{}',
      assigned_to_id UUID REFERENCES "${schema}".users(id),
      custom_fields JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- NIT must be unique per tenant (partial: only non-null active companies)
    CREATE UNIQUE INDEX uq_companies_nit ON "${schema}".companies (nit)
      WHERE nit IS NOT NULL AND is_active = true;

    -- Contacts
    CREATE TABLE "${schema}".contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(20),
      whatsapp VARCHAR(20),
      document_type VARCHAR(10),
      document_number VARCHAR(20),
      city VARCHAR(100),
      department VARCHAR(100),
      municipio_code VARCHAR(5),
      status VARCHAR(30) DEFAULT 'new',
      source VARCHAR(50),
      lead_score INTEGER DEFAULT 0,
      tags TEXT[] DEFAULT '{}',
      company_id UUID REFERENCES "${schema}".companies(id),
      assigned_to_id UUID REFERENCES "${schema}".users(id),
      custom_fields JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Pipelines
    CREATE TABLE "${schema}".pipelines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Pipeline stages
    CREATE TABLE "${schema}".pipeline_stages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pipeline_id UUID NOT NULL REFERENCES "${schema}".pipelines(id),
      name VARCHAR(100) NOT NULL,
      color VARCHAR(7) DEFAULT '#3B82F6',
      probability INTEGER DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Deals
    CREATE TABLE "${schema}".deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(300) NOT NULL,
      value_cents BIGINT DEFAULT 0,
      expected_close_date DATE,
      stage_id UUID REFERENCES "${schema}".pipeline_stages(id),
      pipeline_id UUID REFERENCES "${schema}".pipelines(id),
      contact_id UUID REFERENCES "${schema}".contacts(id),
      company_id UUID REFERENCES "${schema}".companies(id),
      assigned_to_id UUID REFERENCES "${schema}".users(id),
      loss_reason VARCHAR(300),
      status VARCHAR(30) DEFAULT 'open',
      custom_fields JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Deal items (products/services linked to a deal — basis for invoice generation)
    CREATE TABLE "${schema}".deal_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES "${schema}".deals(id) ON DELETE CASCADE,
      product_id UUID REFERENCES "${schema}".products(id),
      description VARCHAR(500) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_cents BIGINT NOT NULL DEFAULT 0,
      discount_percent INTEGER DEFAULT 0,
      iva_rate INTEGER DEFAULT 19,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Deal stage history (tracks every stage transition for metrics)
    CREATE TABLE "${schema}".deal_stage_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES "${schema}".deals(id) ON DELETE CASCADE,
      from_stage_id UUID REFERENCES "${schema}".pipeline_stages(id),
      to_stage_id UUID REFERENCES "${schema}".pipeline_stages(id),
      from_status VARCHAR(30),
      to_status VARCHAR(30),
      changed_by UUID REFERENCES "${schema}".users(id),
      changed_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Products
    CREATE TABLE "${schema}".products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(300) NOT NULL,
      sku VARCHAR(100),
      barcode VARCHAR(100),
      description TEXT,
      category VARCHAR(100),
      brand VARCHAR(100),
      price_cents BIGINT NOT NULL DEFAULT 0,
      cost_cents BIGINT DEFAULT 0,
      iva_rate INTEGER DEFAULT 19,
      product_type VARCHAR(20) DEFAULT 'product',
      unit_of_measure VARCHAR(30) DEFAULT 'unit',
      currency VARCHAR(3) DEFAULT 'COP',
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      weight_grams INTEGER,
      tags TEXT[] DEFAULT '{}',
      images TEXT[] DEFAULT '{}',
      custom_fields JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Inventory movements
    CREATE TABLE "${schema}".inventory_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES "${schema}".products(id),
      quantity INTEGER NOT NULL,
      movement_type VARCHAR(20) NOT NULL,
      reference_type VARCHAR(30),
      reference_id UUID,
      notes TEXT,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Invoice resolutions (DIAN)
    CREATE TABLE "${schema}".invoice_resolutions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resolution_number VARCHAR(50) NOT NULL,
      resolution_date DATE NOT NULL,
      prefix VARCHAR(10) NOT NULL,
      range_from INTEGER NOT NULL,
      range_to INTEGER NOT NULL,
      current_number INTEGER NOT NULL,
      technical_key VARCHAR(200),
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Invoices
    CREATE TABLE "${schema}".invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_number VARCHAR(50) NOT NULL,
      resolution_id UUID REFERENCES "${schema}".invoice_resolutions(id),
      contact_id UUID REFERENCES "${schema}".contacts(id),
      company_id UUID REFERENCES "${schema}".companies(id),
      deal_id UUID REFERENCES "${schema}".deals(id),
      status VARCHAR(30) DEFAULT 'draft',
      subtotal_cents BIGINT DEFAULT 0,
      iva_cents BIGINT DEFAULT 0,
      retention_cents BIGINT DEFAULT 0,
      ica_cents BIGINT DEFAULT 0,
      total_cents BIGINT DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'COP',
      due_date DATE,
      notes TEXT,
      cufe VARCHAR(200),
      pdf_url TEXT,
      xml_url TEXT,
      dian_response JSONB,
      dian_validated_at TIMESTAMPTZ,
      items JSONB DEFAULT '[]',
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Payments
    CREATE TABLE "${schema}".payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID REFERENCES "${schema}".invoices(id),
      amount_cents BIGINT NOT NULL,
      payment_method VARCHAR(50),
      wompi_transaction_id VARCHAR(100),
      wompi_payment_link VARCHAR(500),
      status VARCHAR(30) DEFAULT 'pending',
      paid_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Activities
    CREATE TABLE "${schema}".activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      activity_type VARCHAR(30) NOT NULL,
      title VARCHAR(300),
      description TEXT,
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      status VARCHAR(20) DEFAULT 'pending',
      duration_minutes INTEGER,
      reminder_at TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      contact_id UUID REFERENCES "${schema}".contacts(id),
      company_id UUID REFERENCES "${schema}".companies(id),
      deal_id UUID REFERENCES "${schema}".deals(id),
      assigned_to_id UUID REFERENCES "${schema}".users(id),
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- WhatsApp conversations
    CREATE TABLE "${schema}".whatsapp_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id UUID REFERENCES "${schema}".contacts(id),
      phone_number VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'open',
      last_message_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- WhatsApp messages
    CREATE TABLE "${schema}".whatsapp_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES "${schema}".whatsapp_conversations(id),
      direction VARCHAR(10) NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text',
      content TEXT,
      media_url TEXT,
      wamid VARCHAR(100),
      status VARCHAR(20) DEFAULT 'sent',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Workflows
    CREATE TABLE "${schema}".workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      trigger_event VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT false,
      definition JSONB DEFAULT '{}',
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Workflow executions
    CREATE TABLE "${schema}".workflow_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID NOT NULL REFERENCES "${schema}".workflows(id),
      trigger_entity_type VARCHAR(30),
      trigger_entity_id UUID,
      status VARCHAR(20) DEFAULT 'running',
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      error TEXT,
      execution_log JSONB DEFAULT '[]'
    );

    -- Notifications
    CREATE TABLE "${schema}".notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "${schema}".users(id),
      notification_type VARCHAR(50) NOT NULL,
      title VARCHAR(300) NOT NULL,
      body TEXT,
      entity_type VARCHAR(30),
      entity_id UUID,
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Notification preferences
    CREATE TABLE "${schema}".notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "${schema}".users(id) UNIQUE,
      in_app BOOLEAN DEFAULT true,
      email BOOLEAN DEFAULT true,
      push BOOLEAN DEFAULT false,
      muted_types TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- AI embeddings
    CREATE TABLE "${schema}".ai_embeddings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type VARCHAR(30) NOT NULL,
      entity_id UUID NOT NULL,
      content TEXT NOT NULL,
      embedding vector(1536),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Password reset tokens
    CREATE TABLE "${schema}".password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "${schema}".users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(token_hash)
    );

    -- Invitations (team member onboarding via invite link)
    CREATE TABLE "${schema}".invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'sales_rep',
      token_hash VARCHAR(64) NOT NULL,
      invited_by UUID REFERENCES "${schema}".users(id),
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(token_hash),
      UNIQUE(email)
    );

    -- Refresh tokens (JWT rotation with reuse detection)
    CREATE TABLE "${schema}".refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "${schema}".users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(token_hash)
    );

    -- Schema migration tracking (applied at startup by TenantMigrationService)
    CREATE TABLE "${schema}".schema_migrations (
      id VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Audit log (immutable — no UPDATE or DELETE allowed via API)
    CREATE TABLE "${schema}".audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID,
      user_id UUID REFERENCES "${schema}".users(id),
      ip_address VARCHAR(45),
      user_agent TEXT,
      severity VARCHAR(10) NOT NULL DEFAULT 'info',
      description TEXT,
      metadata JSONB DEFAULT '{}',
      old_value JSONB,
      new_value JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
}

/**
 * Returns the SQL to create all indices for a tenant schema.
 */
export function getTenantIndicesSQL(schema: string): string {
  return `
    -- Full-text search on companies (name + NIT)
    CREATE INDEX idx_${schema}_companies_fts ON "${schema}".companies
      USING GIN (
        to_tsvector('spanish',
          coalesce(name, '') || ' ' ||
          coalesce(nit,  '')
        )
      )
      WHERE is_active = true;

    -- Tags on companies
    CREATE INDEX idx_${schema}_companies_tags ON "${schema}".companies
      USING GIN (tags);

    -- Companies assigned_to + is_active
    CREATE INDEX idx_${schema}_companies_status ON "${schema}".companies (assigned_to_id, is_active);

    -- Full-text search on contacts (Spanish)
    CREATE INDEX idx_${schema}_contacts_fts ON "${schema}".contacts
      USING GIN (
        to_tsvector('spanish',
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name, '') || ' ' ||
          coalesce(email, '') || ' ' ||
          coalesce(document_number, '') || ' ' ||
          coalesce(phone, '')
        )
      );

    -- JSONB custom_fields on contacts
    CREATE INDEX idx_${schema}_contacts_custom ON "${schema}".contacts
      USING GIN (custom_fields jsonb_path_ops);

    -- Tags on contacts
    CREATE INDEX idx_${schema}_contacts_tags ON "${schema}".contacts
      USING GIN (tags);

    -- Contact status for filtering
    CREATE INDEX idx_${schema}_contacts_status ON "${schema}".contacts (status)
      WHERE is_active = true;

    -- Invoices by status
    CREATE INDEX idx_${schema}_invoices_status ON "${schema}".invoices (status);

    -- Deals by stage
    CREATE INDEX idx_${schema}_deals_stage ON "${schema}".deals (stage_id)
      WHERE is_active = true;

    -- Deal items by deal
    CREATE INDEX idx_${schema}_deal_items_deal ON "${schema}".deal_items (deal_id, position);

    -- Deal stage history by deal (timeline queries)
    CREATE INDEX idx_${schema}_deal_stage_history ON "${schema}".deal_stage_history (deal_id, changed_at DESC);

    -- Products
    CREATE INDEX idx_${schema}_products_sku ON "${schema}".products (sku)
      WHERE sku IS NOT NULL AND is_active = true;
    CREATE INDEX idx_${schema}_products_barcode ON "${schema}".products (barcode)
      WHERE barcode IS NOT NULL AND is_active = true;
    CREATE INDEX idx_${schema}_products_category ON "${schema}".products (category)
      WHERE is_active = true;
    CREATE INDEX idx_${schema}_products_fts ON "${schema}".products
      USING GIN (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(description,'')))
      WHERE is_active = true;
    CREATE INDEX idx_${schema}_products_tags ON "${schema}".products USING GIN (tags);

    -- Inventory movements
    CREATE INDEX idx_${schema}_inventory_product ON "${schema}".inventory_movements (product_id, created_at DESC);

    -- Activities
    CREATE INDEX idx_${schema}_activities_assigned ON "${schema}".activities (assigned_to_id, due_date)
      WHERE is_active = true;
    CREATE INDEX idx_${schema}_activities_contact ON "${schema}".activities (contact_id)
      WHERE is_active = true;
    CREATE INDEX idx_${schema}_activities_deal ON "${schema}".activities (deal_id)
      WHERE is_active = true;
    CREATE INDEX idx_${schema}_activities_calendar ON "${schema}".activities (due_date, assigned_to_id)
      WHERE is_active = true AND status = 'pending';

    -- Notifications unread
    CREATE INDEX idx_${schema}_notifications_unread ON "${schema}".notifications (user_id, is_read)
      WHERE is_read = false;

    -- AI embeddings entity lookup
    CREATE INDEX idx_${schema}_embeddings_entity ON "${schema}".ai_embeddings (entity_type, entity_id);

    -- Audit log lookup
    CREATE INDEX idx_${schema}_audit_entity ON "${schema}".audit_log (entity_type, entity_id);
    CREATE INDEX idx_${schema}_audit_user ON "${schema}".audit_log (user_id, created_at DESC);

    -- WhatsApp messages by conversation
    CREATE INDEX idx_${schema}_wa_messages_conv ON "${schema}".whatsapp_messages (conversation_id, created_at DESC);

    -- Audit log time-range queries (cursor pagination on GET /audit-log)
    CREATE INDEX idx_${schema}_audit_created_at ON "${schema}".audit_log (created_at DESC);
  `
}
