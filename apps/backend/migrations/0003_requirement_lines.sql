CREATE TABLE IF NOT EXISTS requirement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Human-readable code: "R1", "R2", ...
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  contract_value_aed NUMERIC(14,2) NOT NULL DEFAULT 0,
  next_milestone TEXT,
  next_milestone_date DATE,
  -- Predecessor codes (NOT UUIDs) so seed migrations stay legible.
  predecessors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  baseline_start DATE,
  baseline_end DATE,
  actual_start DATE,
  actual_end DATE,
  forecast_end DATE,
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, code)
);

CREATE TABLE IF NOT EXISTS requirement_line_workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_line_id UUID NOT NULL REFERENCES requirement_lines(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  notes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requirement_line_id, code)
);

CREATE INDEX IF NOT EXISTS idx_requirement_lines_project ON requirement_lines(project_id);
