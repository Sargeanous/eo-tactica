import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useTicketsList } from "@/hooks/api/tickets";

export function TicketDrawer() {
  const [params, setParams] = useSearchParams();
  const ticketId = params.get("ticket");
  const list = useTicketsList();
  const ticket = list.data?.items.find((t) => t.id === ticketId) ?? null;

  useEffect(() => {
    if (ticketId && !list.isLoading && !ticket) {
      const next = new URLSearchParams(params);
      next.delete("ticket");
      setParams(next, { replace: true });
    }
  }, [ticketId, list.isLoading, ticket, params, setParams]);

  return (
    <Sheet
      open={!!ticket}
      onOpenChange={(open) => {
        if (!open) {
          const next = new URLSearchParams(params);
          next.delete("ticket");
          setParams(next, { replace: true });
        }
      }}
    >
      <SheetContent>
        {ticket && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {ticket.code}
                </Badge>
                <Badge>{ticket.criticality}</Badge>
                <Badge variant="secondary">{ticket.status}</Badge>
              </div>
              <SheetTitle>{ticket.title}</SheetTitle>
              <SheetDescription>
                {ticket.sourceKind && (
                  <>
                    Source: {ticket.sourceKind}
                    {ticket.sourceId ? ` · ${ticket.sourceId}` : ""}
                  </>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 text-sm whitespace-pre-wrap text-ink-700">
              {ticket.description ?? <em>No description.</em>}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
