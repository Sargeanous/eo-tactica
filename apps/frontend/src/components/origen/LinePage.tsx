import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import type { Ticket } from "@eo-tactica/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequirementLine } from "@/hooks/api/requirement-lines";
import { formatAed, cn } from "@/lib/utils";
import { TicketAffordance } from "@/components/tickets/TicketAffordance";
import { useTicketsBySource } from "@/hooks/api/tickets";
import {
  InteractiveSection,
  type InteractiveBlock,
} from "@/components/origen/InteractiveCommercial";

interface LinePageProps {
  code: string;
}

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
  code: string;
  name: string;
  status: string;
  statusTone: "ok" | "warn" | "alert" | "neutral";
  sections: ContentSection[];
  interactive?: InteractiveBlock[];
}

interface KeyAsk {
  tone: "ok" | "warn" | "alert";
  text: string;
}

interface LineMetadata {
  subtitle?: string;
  badge?: string;
  kpiTiles?: KpiTile[];
  workstreams?: Workstream[];
  keyIssues?: KeyAsk[];
  notes?: string[];
}

const TONE_TEXT = {
  ok: "text-brand-700",
  warn: "text-status-warn",
  alert: "text-status-danger",
  neutral: "text-ink-700",
} as const;

const TONE_BORDER = {
  ok: "border-brand-300/40 bg-brand-50",
  warn: "border-status-warn/30 bg-status-warn/5",
  alert: "border-status-danger/30 bg-status-danger/5",
  neutral: "border-border bg-background",
} as const;

const TONE_DOT = {
  ok: "bg-brand-500",
  warn: "bg-status-warn",
  alert: "bg-status-danger",
} as const;

function KpiBand({
  tiles,
  values,
  onChange,
}: {
  tiles: KpiTile[];
  values: string[];
  onChange: (idx: number, next: string) => void;
}) {
  if (!tiles.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={cn(
            "rounded-lg border p-4",
            TONE_BORDER[tile.tone ?? "neutral"],
          )}
        >
          <Input
            value={values[i] ?? tile.value}
            onChange={(e) => onChange(i, e.target.value)}
            className={cn(
              "h-auto px-0 py-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-2xl font-semibold tracking-tight",
              TONE_TEXT[tile.tone ?? "ok"],
            )}
          />
          <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-700">
            {tile.label}
          </div>
          {tile.hint && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              {tile.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionRows({ rows }: { rows: Array<Record<string, string | number>> }) {
  const headers = Object.keys(rows[0] ?? {});
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2">
                  {String(row[h] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ section }: { section: ContentSection }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {section.heading}
        </h4>
        {section.badge && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              section.badge.tone === "alert" &&
                "border-status-danger/40 text-status-danger",
              section.badge.tone === "warn" &&
                "border-status-warn/40 text-status-warn",
              section.badge.tone === "ok" &&
                "border-brand-300/40 text-brand-700",
            )}
          >
            {section.badge.text}
          </Badge>
        )}
      </div>
      {section.rows && <SectionRows rows={section.rows} />}
      {section.kvs && section.kvs.length > 0 && (
        <dl className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {section.kvs.map((kv, i) => (
            <div key={i} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{kv.label}</dt>
              <dd className="font-medium text-right">{kv.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="text-sm list-disc pl-5 space-y-1 text-ink-700">
          {section.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {section.note && (
        <div className="rounded-md bg-brand-50 border border-brand-300/30 p-2 text-xs text-brand-900">
          {section.note}
        </div>
      )}
    </div>
  );
}

function WorkstreamCard({ ws }: { ws: Workstream }) {
  const statusToneClass =
    ws.statusTone === "ok"
      ? "border-brand-300/40 text-brand-700 bg-brand-50"
      : ws.statusTone === "warn"
        ? "border-status-warn/40 text-status-warn bg-status-warn/5"
        : ws.statusTone === "alert"
          ? "border-status-danger/40 text-status-danger bg-status-danger/5"
          : "border-border text-ink-700";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-mono bg-brand-100 text-brand-900">
            {ws.code}
          </span>
          <CardTitle className="text-base">{ws.name}</CardTitle>
        </div>
        <Badge variant="outline" className={cn("ml-auto", statusToneClass)}>
          {ws.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {ws.sections.map((s, i) => (
          <Section key={i} section={s} />
        ))}
        {ws.interactive?.map((block, i) => (
          <InteractiveSection key={`int-${i}`} block={block} />
        ))}
      </CardContent>
    </Card>
  );
}

function KeyIssues({ items }: { items: KeyAsk[] }) {
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">
          Key Issues &amp; Asks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-1.5 inline-block w-2 h-2 rounded-full shrink-0",
                  TONE_DOT[item.tone],
                )}
              />
              <span className="text-ink-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function LinePage({ code }: LinePageProps) {
  const { t } = useTranslation();
  const line = useRequirementLine(code);
  const tickets = useTicketsBySource("requirement_line");

  if (line.isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }
  if (!line.data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {t("common.error")}
      </div>
    );
  }

  const data = line.data;
  const md = (data.metadata ?? {}) as LineMetadata;
  return <LineBody data={data} md={md} t={t} ticketsBySource={tickets.data?.bySource} />;
}

interface LineBodyProps {
  data: NonNullable<ReturnType<typeof useRequirementLine>["data"]>;
  md: LineMetadata;
  t: ReturnType<typeof useTranslation>["t"];
  ticketsBySource: Record<string, Ticket> | undefined;
}

function LineBody({ data, md, t, ticketsBySource }: LineBodyProps) {
  const baselineKpiValues = (md.kpiTiles ?? []).map((tile) => tile.value);
  const [kpiValues, setKpiValues] = useState<string[]>(baselineKpiValues);
  const dirty =
    JSON.stringify(kpiValues) !== JSON.stringify(baselineKpiValues);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <header className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="font-mono">
          {data.code}
        </Badge>
        <h1 className="text-2xl font-semibold text-brand-900">{data.name}</h1>
        {md.subtitle && (
          <Badge
            variant="secondary"
            className="bg-brand-100 text-brand-900 border-brand-300/40"
          >
            {md.subtitle}
          </Badge>
        )}
        {md.badge && (
          <span className="text-sm font-semibold text-status-warn">
            {md.badge}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {data.contractValueAed > 0 && (
            <span className="text-sm font-semibold text-brand-700">
              {formatAed(data.contractValueAed)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={!dirty}
            onClick={() => setKpiValues(baselineKpiValues)}
            title="Reset KPI tile values to baseline"
          >
            <RotateCcw size={12} className="me-1" />
            Reset KPIs
          </Button>
          <TicketAffordance
            ticket={ticketsBySource?.[data.code] ?? null}
            prefill={{
              title: `${data.code} · ${data.name}`,
              criticality: "tier_3",
              sourceKind: "requirement_line",
              sourceId: data.code,
            }}
          />
        </div>
      </header>

      {md.kpiTiles && md.kpiTiles.length > 0 && (
        <KpiBand
          tiles={md.kpiTiles}
          values={kpiValues}
          onChange={(idx, next) =>
            setKpiValues((vals) => {
              const out = vals.slice();
              out[idx] = next;
              return out;
            })
          }
        />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">
            {t("pages.line.progress")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={data.progressPct} />
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{data.progressPct.toFixed(0)}%</span>
            <span>·</span>
            <span>{data.status}</span>
            {data.nextMilestone && (
              <>
                <span>·</span>
                <span>
                  {t("pages.line.nextMilestone")}: {data.nextMilestone}
                </span>
              </>
            )}
            {data.predecessors.length > 0 && (
              <>
                <span>·</span>
                <span>
                  {t("pages.line.predecessors")}: {data.predecessors.join(", ")}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {md.workstreams && md.workstreams.length > 0 && (
        <div className="space-y-4">
          {md.workstreams.map((ws) => (
            <WorkstreamCard key={ws.code} ws={ws} />
          ))}
        </div>
      )}

      {md.keyIssues && md.keyIssues.length > 0 && (
        <KeyIssues items={md.keyIssues} />
      )}

      {md.notes && md.notes.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          {md.notes.map((n, i) => (
            <div key={i}>· {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
