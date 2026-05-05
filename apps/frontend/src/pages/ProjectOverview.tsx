import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/api/projects";
import { useRequirementLines } from "@/hooks/api/requirement-lines";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAed } from "@/lib/utils";

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

export default function ProjectOverview() {
  const { t } = useTranslation();
  const projects = useProjects();
  const lines = useRequirementLines();

  if (projects.isLoading || lines.isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const project = projects.data?.items[0];
  const md = (project?.metadata ?? {}) as ProjectMetadata;
  const items = lines.data?.items ?? [];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold text-brand-900">
          {project?.name ?? t("pages.project.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {project?.description ?? t("pages.project.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Programme Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {md.ownerName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span>
                {md.ownerName}
                {md.ownerEmail && (
                  <span className="text-brand-700"> · {md.ownerEmail}</span>
                )}
              </span>
            </div>
          )}
          {md.lastUpdated && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>{md.lastUpdated}</span>
            </div>
          )}
          {md.source && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span className="text-right">{md.source}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirement Lines (R1 .. R5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((line) => {
            const lm = (line.metadata ?? {}) as LineMetadataLite;
            return (
              <div
                key={line.id}
                className="flex flex-wrap items-center gap-3 border-b border-border last:border-b-0 pb-3 last:pb-0"
              >
                <Badge variant="outline" className="font-mono">
                  {line.code}
                </Badge>
                <div className="font-medium">{line.name}</div>
                {lm.subtitle && (
                  <Badge
                    variant="secondary"
                    className="bg-brand-100 text-brand-900 border-brand-300/40 text-[11px]"
                  >
                    {lm.subtitle}
                  </Badge>
                )}
                <div className="ml-auto flex items-center gap-3 text-sm">
                  {line.contractValueAed > 0 && (
                    <span className="text-brand-700 font-semibold">
                      {formatAed(line.contractValueAed)}
                    </span>
                  )}
                  {lm.badge && (
                    <span className="text-status-warn font-semibold">
                      {lm.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
