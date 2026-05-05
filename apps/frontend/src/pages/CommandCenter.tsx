import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CalendarClock, Flag, FileCheck2, Wallet, Zap } from "lucide-react";
import { useProjectKpis } from "@/hooks/api/projects";
import { useRequirementLines } from "@/hooks/api/requirement-lines";
import { useProjects } from "@/hooks/api/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatAed, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface ProjectMetadata {
  ownerName?: string;
  ownerEmail?: string;
  lastUpdated?: string;
  source?: string;
}

interface LineMetadataLite {
  subtitle?: string;
  badge?: string;
}

interface KpiCardProps {
  label: string;
  primary: string;
  hint?: string;
  icon: typeof Wallet;
  href: string;
  tone: "ok" | "warn" | "alert";
  live?: boolean;
}

const TONE_BORDER = {
  ok: "border-brand-300/40 bg-brand-50",
  warn: "border-status-warn/30 bg-status-warn/5",
  alert: "border-status-danger/30 bg-status-danger/5",
};
const TONE_TEXT = {
  ok: "text-brand-700",
  warn: "text-status-warn",
  alert: "text-status-danger",
};

function KpiCard({
  label,
  primary,
  hint,
  icon: Icon,
  href,
  tone,
  live,
}: KpiCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "rounded-lg border p-4 transition hover:shadow-sm block",
        TONE_BORDER[tone],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
          {label}
          {live && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-300/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
              title="Recomputed from your edits in R1..R5"
            >
              <Zap size={9} />
              live
            </span>
          )}
        </div>
        <Icon size={14} className="text-ink-500" />
      </div>
      <div className={cn("mt-2 text-3xl font-semibold", TONE_TEXT[tone])}>
        {primary}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      )}
    </Link>
  );
}

export default function CommandCenter() {
  const { t } = useTranslation();
  const kpis = useProjectKpis();
  const lines = useRequirementLines();
  const projects = useProjects();
  const lineFinancials = useAppStore((s) => s.lineFinancials);
  const clearLineFinancials = useAppStore((s) => s.clearLineFinancials);

  const project = projects.data?.items[0];
  const projMeta = (project?.metadata ?? {}) as ProjectMetadata;

  // Sum the live contributions reported by interactive scenarios on the
  // per-line pages. When at least one block has reported, prefer the
  // live value over the static API KPI.
  const liveTotals = Object.values(lineFinancials).reduce(
    (acc, c) => ({
      confirmedQuoteAed: acc.confirmedQuoteAed + c.confirmedQuoteAed,
      invoicedAed: acc.invoicedAed + c.invoicedAed,
    }),
    { confirmedQuoteAed: 0, invoicedAed: 0 },
  );
  const hasLive = Object.keys(lineFinancials).length > 0;
  const confirmedQuote = hasLive
    ? liveTotals.confirmedQuoteAed
    : (kpis.data?.confirmedQuoteAed ?? 0);
  const invoiced = hasLive
    ? liveTotals.invoicedAed
    : (kpis.data?.invoicedAed ?? 0);

  // Derive the upcoming-quotes hint from the live lines list.
  const upcomingHints = (lines.data?.items ?? [])
    .filter((l) => {
      const md = (l.metadata ?? {}) as LineMetadataLite;
      return !!md.badge && l.status !== "delivered";
    })
    .map((l) => {
      const md = (l.metadata ?? {}) as LineMetadataLite;
      return `${l.code} · ${md.badge}`;
    });

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">
            {project?.name ?? "TACTICA Project Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {project?.description ?? t("pages.commandCenter.subtitle")}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {projMeta.lastUpdated && (
            <div>
              Last updated{" "}
              <span className="font-medium text-foreground">
                {projMeta.lastUpdated}
              </span>
            </div>
          )}
          {projMeta.ownerName && (
            <div>
              Owner {projMeta.ownerName}
              {projMeta.ownerEmail && (
                <>
                  {" · "}
                  <span className="text-brand-700">{projMeta.ownerEmail}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {kpis.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Confirmed Quote"
              primary={formatAed(confirmedQuote)}
              hint="Imagery $1.45M + CV $2.37M"
              icon={Wallet}
              href="/r1"
              tone="ok"
              live={hasLive}
            />
            <KpiCard
              label="Invoiced"
              primary={formatAed(invoiced)}
              hint="R1 Imagery WO · Awaiting Customer Payment"
              icon={FileCheck2}
              href="/r1"
              tone="ok"
              live={hasLive}
            />
            <KpiCard
              label="Upcoming Quotes"
              primary="This Week"
              hint={
                upcomingHints.length > 0
                  ? upcomingHints.join("  ·  ")
                  : "R2 · WO Wed · R3 · Fri · R4 / R5 · Scope TBD"
              }
              icon={CalendarClock}
              href="/project"
              tone="warn"
            />
            <KpiCard
              label="High-Priority Asks"
              primary={String(kpis.data?.highPriorityAsks ?? 0)}
              hint="Red-flag items needing immediate action"
              icon={Flag}
              href="/collab"
              tone="alert"
            />
          </div>
          {hasLive && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Headline tiles are recomputed live from edits across R1..R5.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearLineFinancials()}
                className="h-7"
              >
                Clear live overrides
              </Button>
            </div>
          )}
        </>
      )}

      <section className="space-y-3">
        {lines.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          (lines.data?.items ?? []).map((line) => {
            const md = (line.metadata ?? {}) as LineMetadataLite;
            return (
              <Link
                key={line.id}
                to={`/${line.code.toLowerCase()}`}
                className="block rounded-lg border border-border bg-background p-4 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {line.code}
                  </Badge>
                  <div className="font-medium">{line.name}</div>
                  {md.subtitle && (
                    <Badge
                      variant="secondary"
                      className="bg-brand-100 text-brand-900 border-brand-300/40 text-[11px]"
                    >
                      {md.subtitle}
                    </Badge>
                  )}
                  <div className="ml-auto flex items-center gap-3 text-sm">
                    {line.contractValueAed > 0 && (
                      <span className="text-brand-700 font-semibold">
                        {formatAed(line.contractValueAed)}
                      </span>
                    )}
                    {md.badge && (
                      <span className="text-status-warn font-semibold">
                        {md.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <Progress value={line.progressPct} className="h-1.5 flex-1" />
                  <span>{line.progressPct.toFixed(0)}%</span>
                </div>
              </Link>
            );
          })
        )}
      </section>

      {projMeta.source && (
        <footer className="pt-4 text-xs text-muted-foreground border-t border-border">
          Status snapshot generated{" "}
          <span className="font-medium text-foreground">
            {projMeta.lastUpdated}
          </span>{" "}
          · Source: {projMeta.source}
        </footer>
      )}
    </div>
  );
}
