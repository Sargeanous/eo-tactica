import { createLogger } from "@eo-tactica/observability";
import { bootstrap } from "../../src/lib/bootstrap.js";
import { pool } from "../../src/lib/db.js";

const log = createLogger({ name: "seed" });

// Shape of the rich content the per-line page renders. Stored under
// `requirement_lines.metadata` (JSONB) so the schema stays slim while the
// dashboard text is fully editable.
interface KpiTile {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn" | "alert";
}

interface ContentSection {
  heading: string;
  rows?: Array<Record<string, string | number>>;
  bullets?: string[];
  kvs?: Array<{ label: string; value: string }>;
  badge?: { text: string; tone?: "ok" | "warn" | "alert" };
  note?: string;
}

interface Workstream {
  code: string; // "A", "B", "C"
  name: string;
  status: string; // "DELIVERED", "PARTIALLY DELIVERED", ...
  statusTone: "ok" | "warn" | "alert" | "neutral";
  sections: ContentSection[];
}

interface KeyAsk {
  tone: "ok" | "warn" | "alert";
  text: string;
}

interface LineMetadata {
  subtitle: string; // e.g. "Delivered · Pending Payment & Acceptance"
  badge?: string; // e.g. "WO · Wed"
  kpiTiles: KpiTile[];
  workstreams: Workstream[];
  keyIssues: KeyAsk[];
  notes: string[];
}

interface SeedLine {
  code: string;
  name: string;
  status: string;
  contractValueAed: number;
  nextMilestone: string | null;
  predecessors: string[];
  progressPct: number;
  metadata: LineMetadata;
}

const SEED_LINES: SeedLine[] = [
  {
    code: "R1",
    name: "CV + Imagery Delivery",
    status: "delivered",
    contractValueAed: 3_810_000,
    nextMilestone: "Awaiting Customer Payment",
    predecessors: [],
    progressPct: 100,
    metadata: {
      subtitle: "Delivered · Pending Payment & Acceptance",
      badge: "$3.81M",
      kpiTiles: [
        { label: "Confirmed Quote (R1)", value: "$3.81M", hint: "Imagery $1.45M + CV $2.37M" },
      ],
      workstreams: [
        {
          code: "A",
          name: "Imagery Delivery",
          status: "Delivery Complete · Invoiced",
          statusTone: "ok",
          sections: [
            {
              heading: "Tile band",
              kvs: [
                { label: "Scenes Delivered", value: "281" },
                { label: "Optical + SAR", value: "29 + 252" },
                { label: "SLA ≤ 24h", value: "94%" },
                { label: "Contract Value (ex-VAT)", value: "$1.45M" },
                { label: "AOI Targets", value: "40+" },
              ],
            },
            {
              heading: "Resource Summary",
              rows: [
                { Source: "Optical Operator 1", Sensor: "Optical 0.5m", Scenes: 29 },
                { Source: "SAR Operator 1", Sensor: "SAR 0.5m", Scenes: 238 },
                { Source: "SAR Operator 2", Sensor: "SAR 0.5m", Scenes: 14 },
                { Source: "Total", Sensor: "—", Scenes: 281 },
              ],
              kvs: [
                { label: "Resolution / Format", value: "All 0.5m · GeoTIFF" },
                {
                  label: "Coverage Area",
                  value:
                    "Iran (5 provinces + strategic islands) · Hormozgan 98 · Fars 64 · Bushehr 48 · Kerman 39 · Tunb Is. 12 · + Other 20",
                },
                {
                  label: "Task Coverage",
                  value:
                    "40 target locations / 17 unique AOIs · Top 5: Hajiabad 22 · Baghin 21 · Saidi 18 · Shiraz 17 · Bandar-e-Jask 16",
                },
              ],
            },
            {
              heading: "Daily Delivery & SLA",
              kvs: [
                { label: "Window", value: "2026-03-02 to 2026-04-26 (8 weeks · 49 delivery days)" },
                { label: "Peak", value: "14 scenes/day (Mar 23)" },
                { label: "Average", value: "5.7 scenes/day" },
                { label: "Median", value: "24h" },
                { label: "Fastest", value: "same-day" },
                { label: "Slowest", value: "120h" },
              ],
              rows: [
                { Bucket: "≤ 12h", Share: "33.5%" },
                { Bucket: "12 – 24h", Share: "60.9%" },
                { Bucket: "24 – 48h", Share: "2.8%" },
                { Bucket: "> 48h", Share: "2.8%" },
              ],
            },
            {
              heading: "Commercial Logic",
              rows: [
                {
                  Source: "Optical Op1",
                  Note: "Emergency <12h · $6,500/sc effective",
                  Scenes: 29,
                  Final: "$188,500",
                },
                {
                  Source: "SAR Op1",
                  Note: "Urgent <28h · $5,000/sc effective",
                  Scenes: 238,
                  Final: "$1,190,000",
                },
                {
                  Source: "SAR Op2",
                  Note: "Urgent <24h · $5,000/sc effective",
                  Scenes: 14,
                  Final: "$70,000",
                },
                { Source: "Total", Note: "", Scenes: 281, Final: "$1,448,500" },
              ],
              kvs: [
                { label: "Total List Price", value: "$2,032,241" },
                { label: "One-shot Discount", value: "−$583,741" },
                { label: "Final (ex-VAT)", value: "$1,448,500" },
                { label: "Incl. 5% VAT", value: "$1,520,925" },
              ],
              note: "Volume procurement saved customer $584K (29% off list price)",
            },
          ],
        },
        {
          code: "B",
          name: "CV Algorithm Delivery",
          status: "Submitted · Awaiting Customer Acceptance",
          statusTone: "warn",
          sections: [
            {
              heading: "Tile band",
              kvs: [
                { label: "Total Algorithms", value: "69" },
                { label: "Universal · Optical · SAR", value: "10 + 50 + 9" },
                { label: "Contract Value (Batch 1+2)", value: "$2.37M" },
                { label: "Final Optimized Delivery", value: "Apr 24" },
                { label: "Avg Accuracy (key classes)", value: "0.92 avg" },
              ],
            },
            {
              heading: "Resource Summary",
              rows: [
                { Group: "Universal Optical EO", Types: 10, Resolution: "0.5m", Training: "160K+" },
                { Group: "Military Aircraft", Types: 29, Resolution: "0.3m", Training: "370K+" },
                { Group: "Military Vessel", Types: 21, Resolution: "0.3m", Training: "325K+" },
                { Group: "SAR Aircraft", Types: 5, Resolution: "1m", Training: "2K+" },
                { Group: "SAR Vessel", Types: 4, Resolution: "1m", Training: "3K+" },
                { Group: "Total", Types: 69, Resolution: "—", Training: "860K+" },
              ],
              kvs: [
                {
                  label: "Deliverables",
                  value: "Source code · Docker images · Training datasets · Test data · Documentation",
                },
              ],
            },
            {
              heading: "Submission Timeline",
              bullets: [
                "Batch 1 initial: Mar 5 → Mar 20",
                "Batch 2 initial: Mar 27 → Apr 3",
                "Apr 24 all final optimized versions submitted ✓",
              ],
            },
            {
              heading: "Performance Snapshot",
              rows: [
                { Model: "Optical Aircraft @ 0.3m", Score: "0.94" },
                { Model: "Optical Aircraft @ 0.6m", Score: "0.87" },
                { Model: "Optical Aircraft @ 1.2m", Score: "0.63" },
                { Model: "Optical Ship @ 0.3m", Score: "0.92" },
                { Model: "Optical Ship @ 0.5–0.6m", Score: "0.93" },
                { Model: "SAR Aircraft (F1)", Score: "0.90" },
                { Model: "SAR Vessel (F1)", Score: "0.91" },
              ],
              bullets: [
                "Optical Aircraft at native 0.3m: 20 / 27 models ≥ 0.9, 14 / 27 reach 1.0",
                "Optical Vessel 0.5m+ and 0.3m perform similarly (0.92 vs 0.93)",
                "SAR overall F1 0.90+, mainly affected by small-sample class (bomber)",
              ],
            },
            {
              heading: "Commercial Logic",
              rows: [
                { Batch: "Batch 1 — V2 0304 · Universal Optical EO", Types: 10, Price: "$298,500" },
                { Batch: "Batch 1 · Military Aircraft", Types: 29, Price: "$899,000" },
                { Batch: "Batch 1 · Military Vessel", Types: 21, Price: "$651,000" },
                { Batch: "Batch 1 Subtotal", Types: 60, Price: "$1,848,500" },
                { Batch: "Batch 2 — Quotation 0312 · SAR Aircraft", Types: 5, Price: "$287,500" },
                { Batch: "Batch 2 · SAR Vessel", Types: 4, Price: "$230,000" },
                { Batch: "Batch 2 Subtotal", Types: 9, Price: "$517,500" },
                { Batch: "Total", Types: 69, Price: "$2,366,000" },
              ],
              bullets: [
                "Batch 1 delivered · 20% deposit received",
                "Batch 2 delivered · awaiting customer payment",
                "Currently awaiting customer's final acceptance",
              ],
            },
          ],
        },
      ],
      keyIssues: [
        {
          tone: "alert",
          text: "Customer's new request: a more granular test report — evaluating each image by Image ID · Class · GT · TP · FP · FN · Precision · Recall · F1 (see 'New Report Spec' tab).",
        },
        {
          tone: "warn",
          text: "All final optimized versions submitted by Apr 24, awaiting customer-side acceptance.",
        },
      ],
      notes: [
        "Imagery WO sent & invoiced; tracking customer payment (acquisition tasks ended Apr 26, paused thereafter).",
      ],
    },
  },
  {
    code: "R2",
    name: "Marketing Place / Training Platform / Archive Data Management",
    status: "in_progress",
    contractValueAed: 0,
    nextMilestone: "WO Wed",
    predecessors: ["R1"],
    progressPct: 33,
    metadata: {
      subtitle: "In Progress · Partially Blocked",
      badge: "WO · Wed",
      kpiTiles: [
        { label: "Platform Modules", value: "3" },
        { label: "Marketing Delivered", value: "1 / 3" },
        { label: "WO Delivery", value: "This Wed", tone: "warn" },
        { label: "Current Deployment", value: "TII Test", tone: "warn" },
        { label: "Production Env Pending Customer", value: "Air-Gapped?", tone: "alert" },
      ],
      workstreams: [
        {
          code: "A",
          name: "Marketing Place",
          status: "DELIVERED",
          statusTone: "ok",
          sections: [
            {
              heading: "Module Scope",
              bullets: [
                "Imagery Tasking",
                "Historical Imagery Query",
                "Order management + simulated tasking",
                "Multi-source satellite imagery vendor APIs",
              ],
            },
            {
              heading: "Last Week",
              bullets: [
                "✓ All middleware deployed (8 components)",
                "✓ Marketing main services deployed and live",
                "✓ K8s external network access resolved",
                "✓ Main flow verified: query / order / simulated tasking (one vendor)",
              ],
            },
            {
              heading: "This Week",
              bullets: [
                "Test 2nd vendor integration",
                "Other system feature integration",
                "Finalize domain / email config",
              ],
            },
          ],
        },
        {
          code: "B",
          name: "Training Platform",
          status: "PARTIALLY DELIVERED",
          statusTone: "warn",
          sections: [
            {
              heading: "Module Scope",
              bullets: [
                "CV model training (based on MMDetection)",
                "Training dataset management + annotation",
                "Model export (.pth + .py config)",
                "Inference service publishing",
              ],
            },
            {
              heading: "Last Week",
              bullets: [
                "✓ Cloud Demo delivered, live at fariq.tacticalabs.ai",
                "✓ Training pipeline verified (cloud)",
                "✓ Customer demo account + user manual",
                "● Model export / publish features fixed (4/30)",
              ],
            },
            {
              heading: "This Week",
              bullets: [
                "TII test environment on-prem deployment kickoff",
                "Full functional integration testing",
              ],
            },
            {
              heading: "Blocker",
              badge: { text: "Blocker", tone: "alert" },
              bullets: [
                "Customer-side NVIDIA GPU driver unresolved, blocking on-prem Training debugging.",
              ],
            },
          ],
        },
        {
          code: "C",
          name: "Archive Data Management",
          status: "STARTING THIS WEEK",
          statusTone: "warn",
          sections: [
            {
              heading: "Module Scope",
              bullets: [
                "Customer OBS (object storage) integration",
                "Bulk import of existing imagery",
                "Data governance (cleaning / dedup / CRS normalization)",
                "GIS processing (fusion / cloud removal / tiling)",
                "Imagery service publishing to front-end apps",
              ],
            },
            {
              heading: "Last Week",
              bullets: ["— Not yet started (Marketing middleware took priority)"],
            },
            {
              heading: "This Week",
              bullets: [
                "Kickoff deployment — reuse ready middleware",
                "Configure customer OBS connection params",
                "Data import + governance flow integration",
              ],
            },
          ],
        },
      ],
      keyIssues: [
        {
          tone: "warn",
          text: "Question for customer: When will the customer's official Air-Gapped production environment be available? All current deployments are in the TII test environment. Production requires a physically isolated Air-Gapped deployment — confirm timing + hardware-readiness cadence.",
        },
        {
          tone: "alert",
          text: "NVIDIA GPU driver issue (customer-side) unresolved; will block Training Platform debugging.",
        },
        {
          tone: "warn",
          text: "WO to be provided this Wed; formal scope locked + quote in place.",
        },
        {
          tone: "ok",
          text: "All last-week blockers cleared: K8s external network ✓ · Marketing deployment ✓ · Main flow verified ✓.",
        },
      ],
      notes: ["Details: Deployment Timeline + Hardware Spec + Architecture Decisions"],
    },
  },
  {
    code: "R3",
    name: "Marketplace · Multi-source Imagery Vendor API Integration",
    status: "in_progress",
    contractValueAed: 0,
    nextMilestone: "Quote Fri",
    predecessors: ["R1"],
    progressPct: 50,
    metadata: {
      subtitle: "In Progress · Continuously Expanding",
      badge: "Quote · Fri",
      kpiTiles: [
        { label: "Integrated + In Dev", value: "2 + 1" },
        { label: "Integrated", value: "1 + 1", hint: "1 Optical + 1 SAR" },
        { label: "Eastern Quote Delivery", value: "This Fri", tone: "warn" },
        { label: "All Integrated Are Eastern Vendors", value: "East" },
        { label: "Awaiting Customer-Provided Western APIs", value: "West?", tone: "alert" },
      ],
      workstreams: [
        {
          code: "A",
          name: "Vendor Pipeline · Integration Workflow",
          status: "Pipeline",
          statusTone: "neutral",
          sections: [
            {
              heading: "Live · Online (2)",
              bullets: ["1 Optical + 1 SAR Supplied R1 imagery delivery"],
              badge: { text: "✓ LIVE", tone: "ok" },
            },
            {
              heading: "In Dev · In Progress (+1)",
              bullets: ["3rd vendor (Optical) API integration in progress"],
              badge: { text: "◷ IN DEV", tone: "warn" },
            },
            {
              heading: "Pipeline · Continuously Expanding (+N)",
              bullets: [
                "Continuously sourcing Eastern vendors. Goal: maximise constellation coverage.",
              ],
            },
            {
              heading: "Western API",
              bullets: [
                "Dependent on customer-provided API. Assess workload once available.",
              ],
              badge: { text: "⚠ WEST", tone: "alert" },
            },
          ],
        },
        {
          code: "B",
          name: "Commercial · Pricing Model",
          status: "Eastern Quote · Fri",
          statusTone: "warn",
          sections: [
            {
              heading: "Pricing",
              bullets: [
                "Per-vendor billing · One integration fee per vendor",
                "Pricing model: Per-Vendor API Integration Fee",
                "Each vendor requires independent interface adaptation + integration testing + normalization",
                "Formal Eastern-vendor quote will be provided this Fri",
                "Western API pending customer → quote separately after workload assessment",
              ],
            },
            {
              heading: "Strategic Goal",
              bullets: [
                "By continuously expanding Eastern + Western vendors, provide TACTICA with unified single-API, multi-source imagery access.",
              ],
            },
          ],
        },
      ],
      keyIssues: [
        {
          tone: "alert",
          text: "Western Imagery API: currently missing API interface, dependent on TACTICA to provide; once available we'll initiate workload + plan assessment.",
        },
        {
          tone: "warn",
          text: "Eastern vendor priority: needs customer alignment — Optical first or SAR? Target constellation size? — to guide future sourcing pace.",
        },
        {
          tone: "ok",
          text: "The 2 integrated vendors are already validated through R1; main flow smooth.",
        },
      ],
      notes: [
        "Supplied R1 imagery delivery: the 2 integrated vendors enabled 281 scenes delivered (29 Optical + 252 SAR).",
      ],
    },
  },
  {
    code: "R4",
    name: "Intelligence Discovery / GSA Platform",
    status: "in_preparation",
    contractValueAed: 0,
    nextMilestone: "Demo",
    predecessors: ["R1", "R2"],
    progressPct: 30,
    metadata: {
      subtitle: "Demo in Preparation",
      badge: "Scope TBD",
      kpiTiles: [
        { label: "Functional Modules", value: "28" },
        { label: "Sub-system Tiers", value: "3" },
        { label: "OSINT Data Sources", value: "450+" },
        { label: "SA Entities", value: "1M+" },
        { label: "Next Milestone", value: "Demo", tone: "warn" },
      ],
      workstreams: [
        {
          code: "A",
          name: "Solution Architecture",
          status: "Aligned",
          statusTone: "ok",
          sections: [
            {
              heading: "7 · Multi-source Data Governance",
              bullets: [
                "Intel Collection · Verification & Filtering · Entity Integration",
                "Real-time Ingestion · Standardisation · Storage · Retrieval",
              ],
            },
            {
              heading: "10 · Multi-source Fusion AI Analytics",
              bullets: [
                "CN/EN/AR AI · Vessel/Aircraft Track / Behaviour / Anomaly",
                "Knowledge Graph · Hotspot Events · Multi-Agent Coordination",
              ],
            },
            {
              heading: "11 · Global Situational Awareness App",
              bullets: [
                "Hotspot Monitoring · Map Visualisation · Annotation · Scenario Mgmt",
                "Event Rules · Remote-sensing Hub · Mobile Dashboard",
              ],
            },
            {
              heading: "Three-Tier Product System",
              bullets: [
                "Tier 1 · Anomaly Alert: multi-source sensor fusion, second-level latency",
                "Tier 2 · Target Confirmation: satellite imagery validation, 2-4 hours",
                "Tier 3 · Intelligence Report: multi-source fusion analysis, 30 sec - 5 min",
              ],
            },
          ],
        },
        {
          code: "B",
          name: "Progress",
          status: "Demo in Preparation",
          statusTone: "warn",
          sections: [
            {
              heading: "Status",
              bullets: [
                "Solution Design Document (Proposal for GSA Platform) complete",
                "28 modules + data requirements aligned with customer",
                "Demo development in progress",
                "After Demo → Customer Acceptance → Contract → Data Procurement",
              ],
            },
            {
              heading: "Solution → Demo → Contract → Delivery",
              kvs: [{ label: "Estimated stage", value: "~ 30%" }],
            },
          ],
        },
        {
          code: "C",
          name: "Next Steps & Asks",
          status: "Scope TBD",
          statusTone: "warn",
          sections: [
            {
              heading: "Quote pending Demo acceptance + scope lock",
              bullets: [
                "Solution design + requirements aligned with customer",
                "Estimated delivery: 4-6 months",
                "Formal commercial begins after Demo acceptance + customer's final scope confirmation",
              ],
            },
          ],
        },
      ],
      keyIssues: [
        {
          tone: "warn",
          text: "Demo Progress Tracking · R&D-side Demo development & optimisation in progress.",
        },
        {
          tone: "warn",
          text: "Senior-level confirmation & alignment · Final scope details to be agreed.",
        },
      ],
      notes: ["Details: Full 28-Module Catalog + Data Requirements"],
    },
  },
  {
    code: "R5",
    name: "SIGINT Data Management · Voice + Signal Intelligence",
    status: "scope_tbd",
    contractValueAed: 0,
    nextMilestone: "Awaiting customer feedback · Scope confirmation",
    predecessors: [],
    progressPct: 10,
    metadata: {
      subtitle: "Solution Reviewed · Awaiting Feedback",
      badge: "Scope TBD",
      kpiTiles: [
        { label: "Apr 28 · Mon", value: "Customer raised requirement" },
        { label: "May 1 · Fri", value: "Solution reviewed + materials forwarded" },
        {
          label: "This Week · Now",
          value: "Awaiting customer feedback · Scope confirmation",
          tone: "warn",
        },
        { label: "Next Step", value: "Provide quote + development plan", tone: "alert" },
      ],
      workstreams: [
        {
          code: "A",
          name: "Branch 1 · Voice Intelligence",
          status: "Solution Reviewed",
          statusTone: "neutral",
          sections: [
            {
              heading: "Pipeline",
              bullets: [
                "Audio ingest → VAD → denoising → ASR transcription + speaker ID",
                "→ NLP / NER entity extraction → Translation → Relation graph",
              ],
            },
            {
              heading: "Capabilities",
              bullets: [
                "Keyword archiving · Multi-dimensional search",
                "Speech-to-text · Multi-language translation",
                "Person / codename / location correlation",
              ],
            },
          ],
        },
        {
          code: "B",
          name: "Branch 2 · Signal Intelligence",
          status: "Solution Reviewed",
          statusTone: "neutral",
          sections: [
            {
              heading: "Pipeline",
              bullets: [
                "Radar / Comms / Electro-optic signals → Feature extraction",
                "→ Multi-source fusion → End-device identification",
              ],
            },
            {
              heading: "Capabilities",
              bullets: [
                "Identify end-device models from signals (e.g. radar / radio mounted on an F-16)",
              ],
            },
          ],
        },
        {
          code: "C",
          name: "Status",
          status: "May 1 Reviewed · Awaiting Scope Confirmation",
          statusTone: "warn",
          sections: [
            {
              heading: "Timeline",
              bullets: [
                "Apr 28 Mon — Customer raised SIGINT requirement",
                "May 1 Fri — Solution review completed, materials forwarded",
                "This week — Awaiting customer feedback & scope confirmation",
                "Once scope confirmed: Origen will provide quote + development plan",
              ],
            },
            {
              heading: "Materials Delivered",
              bullets: [
                "SIGINT Voice Intelligence System solution doc (PDF + PPTX, 5/1 version)",
              ],
            },
          ],
        },
      ],
      keyIssues: [
        {
          tone: "alert",
          text: "Awaiting customer feedback: clarify which branch (or both) and the coverage priority.",
        },
        {
          tone: "warn",
          text: "Once scope confirmed, Origen will initiate quote + detailed development plan.",
        },
        {
          tone: "ok",
          text: "Deployment form: localised / sovereign / offline-capable — interlinked with R2 deployment-env discussion.",
        },
      ],
      notes: [
        "Unified Knowledge Graph: signal-side devices + voice-side persons / codenames / locations all fused — sovereign deployment · no exfiltration · court-grade audit.",
      ],
    },
  },
];

async function main() {
  const { superAdminTenantId } = await bootstrap();

  // Refresh project metadata so the dashboard header reflects current
  // ownership + snapshot date.
  await pool.query(
    `UPDATE projects
        SET name = 'TACTICA Project Dashboard',
            description = 'Urgent MOD Project · 5 Workstreams Status Overview',
            metadata = jsonb_build_object(
              'ownerName', 'Chase Chen',
              'ownerEmail', 'chase.chen@origen.ae',
              'lastUpdated', '2026-05-04',
              'source', '0503 Project Tracker · Delivered Scope 0406 · partner quotes 0430'
            ),
            updated_at = now()
      WHERE tenant_id = $1 AND code = 'TACTICA'`,
    [superAdminTenantId],
  );

  const project = await pool.query<{ id: string }>(
    `SELECT id FROM projects WHERE tenant_id = $1 AND code = 'TACTICA' LIMIT 1`,
    [superAdminTenantId],
  );
  const projectId = project.rows[0]?.id;
  if (!projectId) {
    log.error("demo project not seeded; aborting");
    return;
  }

  for (const line of SEED_LINES) {
    await pool.query(
      `INSERT INTO requirement_lines (
         tenant_id, project_id, code, name, status, contract_value_aed,
         next_milestone, predecessors, progress_pct, metadata
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       ON CONFLICT (project_id, code) DO UPDATE
         SET name = EXCLUDED.name,
             status = EXCLUDED.status,
             contract_value_aed = EXCLUDED.contract_value_aed,
             next_milestone = EXCLUDED.next_milestone,
             predecessors = EXCLUDED.predecessors,
             progress_pct = EXCLUDED.progress_pct,
             metadata = EXCLUDED.metadata,
             updated_at = now()`,
      [
        superAdminTenantId,
        projectId,
        line.code,
        line.name,
        line.status,
        line.contractValueAed,
        line.nextMilestone,
        line.predecessors,
        line.progressPct,
        JSON.stringify(line.metadata),
      ],
    );
  }

  await pool.query(
    `INSERT INTO project_kpis (
       project_id, confirmed_quote_aed, invoiced_aed,
       upcoming_quotes_count, high_priority_asks
     ) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_id) DO UPDATE
       SET confirmed_quote_aed = EXCLUDED.confirmed_quote_aed,
           invoiced_aed = EXCLUDED.invoiced_aed,
           upcoming_quotes_count = EXCLUDED.upcoming_quotes_count,
           high_priority_asks = EXCLUDED.high_priority_asks,
           as_of = now()`,
    [projectId, 3_810_000, 1_450_000, 3, 5],
  );

  log.info({ count: SEED_LINES.length }, "seeded requirement lines");
  await pool.end();
}

main().catch((err) => {
  log.error({ err }, "seed failed");
  process.exit(1);
});
