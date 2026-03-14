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
      address TEXT,
      city VARCHAR(100),
      department VARCHAR(100),
      municipio_code VARCHAR(5),
      custom_fields JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES "${schema}".users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

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

    -- Products
    CREATE TABLE "${schema}".products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(300) NOT NULL,
      sku VARCHAR(100),
      description TEXT,
      price_cents BIGINT NOT NULL DEFAULT 0,
      cost_cents BIGINT DEFAULT 0,
      iva_rate INTEGER DEFAULT 19,
      product_type VARCHAR(20) DEFAULT 'product',
      unit_of_measure VARCHAR(30) DEFAULT 'unit',
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
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

    -- Audit log (immutable)
    CREATE TABLE "${schema}".audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(30) NOT NULL,
      entity_id UUID,
      user_id UUID REFERENCES "${schema}".users(id),
      ip_address VARCHAR(45),
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
  `
}
