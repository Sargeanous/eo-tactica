import { Inbox, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTicketsList } from "@/hooks/api/tickets";
import { TicketDrawer } from "@/components/tickets/TicketDrawer";
import { cn } from "@/lib/utils";

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background p-10 text-center text-sm">
      <Icon size={24} className="text-muted-foreground" />
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground">{description}</div>
    </div>
  );
}

export default function CollaborationRoom() {
  const { t } = useTranslation();
  const list = useTicketsList();
  const [, setParams] = useSearchParams();

  if (list.isLoading) {
    return (
      <div className="card-surface p-10 flex items-center justify-center text-ink-500 m-6">
        <Loader2 className="animate-spin me-2" size={14} />
        {t("common.loading")}
      </div>
    );
  }

  if (list.error) {
    return (
      <div className="m-6 rounded-md border border-status-danger/30 bg-status-danger/5 p-4 text-sm text-status-danger flex items-center justify-between">
        <span>{t("pages.tickets.loadError")}</span>
        <Button
          variant="outline"
          onClick={() => list.refetch()}
          className="border-status-danger/30"
        >
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const items = list.data?.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">
          {t("pages.tickets.title")}
        </h1>
      </header>
      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("pages.tickets.empty.title")}
          description={t("pages.tickets.empty.detail")}
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">Tier</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    setParams(
                      (prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("ticket", row.id);
                        return next;
                      },
                      { replace: true },
                    )
                  }
                  className={cn(
                    "cursor-pointer border-t border-border hover:bg-muted/40",
                    idx % 2 === 0 ? "bg-background" : "bg-background/60",
                  )}
                >
                  <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                  <td className="px-3 py-2 font-medium">{row.title}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px]">
                      {row.criticality}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.status}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.sourceKind}
                    {row.sourceId ? ` · ${row.sourceId}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TicketDrawer />
    </div>
  );
}
