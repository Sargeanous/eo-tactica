import { useTranslation } from "react-i18next";
import { CalendarClock, Flag, FileCheck2, Wallet } from "lucide-react";
import { useProjectKpis } from "@/hooks/api/projects";
import { useRequirementLines } from "@/hooks/api/requirement-lines";
import { StatusTile } from "@/components/origen/StatusTile";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatAed } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function CommandCenter() {
  const { t } = useTranslation();
  const kpis = useProjectKpis();
  const lines = useRequirementLines();

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-900">
          {t("pages.commandCenter.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pages.commandCenter.subtitle")}
        </p>
      </header>

      {kpis.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusTile
            label={t("pages.commandCenter.kpiConfirmedQuote")}
            status="ok"
            icon={Wallet}
            metric={formatAed(kpis.data?.confirmedQuoteAed ?? 0)}
            href="/project"
          />
          <StatusTile
            label={t("pages.commandCenter.kpiInvoiced")}
            status="ok"
            icon={FileCheck2}
            metric={formatAed(kpis.data?.invoicedAed ?? 0)}
            href="/project"
          />
          <StatusTile
            label={t("pages.commandCenter.kpiUpcomingQuotes")}
            status="warn"
            icon={CalendarClock}
            metric={String(kpis.data?.upcomingQuotesCount ?? 0)}
            href="/project"
          />
          <StatusTile
            label={t("pages.commandCenter.kpiHighPriorityAsks")}
            status="alert"
            icon={Flag}
            metric={String(kpis.data?.highPriorityAsks ?? 0)}
            href="/collab"
          />
        </div>
      )}

      <section className="space-y-3">
        {lines.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="space-y-3">
            {(lines.data?.items ?? []).map((line) => (
              <Link
                key={line.id}
                to={`/${line.code.toLowerCase()}`}
                className="block rounded-lg border border-border bg-background p-4 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {line.code}
                  </Badge>
                  <div className="font-medium">{line.name}</div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {formatAed(line.contractValueAed)}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <Progress value={line.progressPct} className="h-1.5 flex-1" />
                  <span>{line.progressPct.toFixed(0)}%</span>
                  {line.nextMilestone && <span>· {line.nextMilestone}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
