CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('planning','in_progress','delivered','blocked','cancelled')),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS project_kpis (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  confirmed_quote_aed NUMERIC(14,2) NOT NULL DEFAULT 0,
  invoiced_aed NUMERIC(14,2) NOT NULL DEFAULT 0,
  upcoming_quotes_count INTEGER NOT NULL DEFAULT 0,
  high_priority_asks INTEGER NOT NULL DEFAULT 0,
  as_of TIMESTAMPTZ NOT NULL DEFAULT now()
);
