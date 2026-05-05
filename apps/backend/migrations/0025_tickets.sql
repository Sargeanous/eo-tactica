CREATE TABLE IF NOT EXISTS ticket_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS ticket_teams (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','on_hold','closed','cancelled')),
  criticality TEXT NOT NULL DEFAULT 'tier_3'
    CHECK (criticality IN ('tier_1','tier_2','tier_3','tier_4')),
  category_id TEXT REFERENCES ticket_categories(id) ON DELETE SET NULL,
  team_id TEXT REFERENCES ticket_teams(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source_kind TEXT,
  source_id TEXT,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_source ON tickets(source_kind, source_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
