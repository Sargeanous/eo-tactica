import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequirementLine } from "@/hooks/api/requirement-lines";
import { formatAed } from "@/lib/utils";
import { TicketAffordance } from "@/components/tickets/TicketAffordance";
import { useTicketsBySource } from "@/hooks/api/tickets";

interface LinePageProps {
  code: string;
}

/**
 * <DOMAIN_PLACEHOLDER>: each requirement line page is a thin wrapper around
 * this shared shell. Replace per-line content (workstream tables, drawers,
 * tier accents) by branching on `code` or by lifting per-line UI into
 * dedicated pages once the shape stabilises.
 */
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

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono">
          {data.code}
        </Badge>
        <h1 className="text-2xl font-semibold text-brand-900">{data.name}</h1>
        <div className="ml-auto">
          <TicketAffordance
            ticket={tickets.data?.bySource[data.code] ?? null}
            prefill={{
              title: `${data.code} · ${data.name}`,
              criticality: "tier_3",
              sourceKind: "requirement_line",
              sourceId: data.code,
            }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {t("pages.line.contractValue")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-brand-700">
            {formatAed(data.contractValueAed)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {t("pages.line.progress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={data.progressPct} />
            <div className="text-xs text-muted-foreground">
              {data.progressPct.toFixed(0)}% · {data.status}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {t("pages.line.nextMilestone")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {data.nextMilestone ?? t("pages.line.none")}
            {data.nextMilestoneDate && (
              <span className="ml-2 text-muted-foreground">
                · {data.nextMilestoneDate}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {t("pages.line.predecessors")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.predecessors.length === 0 ? (
            <span className="text-muted-foreground">
              {t("pages.line.none")}
            </span>
          ) : (
            <div className="flex gap-2">
              {data.predecessors.map((p) => (
                <Badge key={p} variant="outline" className="font-mono">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
