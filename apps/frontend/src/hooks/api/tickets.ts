import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Ticket, TicketCreate, TicketUpdate } from "@eo-tactica/shared";
import { apiJson } from "@/lib/api/client";

interface ListResponse {
  items: Ticket[];
}

interface BySourceResponse {
  bySource: Record<string, Ticket>;
}

export function useTicketsList() {
  return useQuery({
    queryKey: ["tickets", "list"],
    queryFn: () => apiJson<ListResponse>("/api/tickets"),
  });
}

export function useTicketsBySource(kind: string) {
  return useQuery({
    queryKey: ["tickets", "by-source", kind],
    queryFn: () =>
      apiJson<BySourceResponse>(
        `/api/tickets/by-source/${encodeURIComponent(kind)}`,
      ),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TicketCreate) =>
      apiJson<Ticket>("/api/tickets", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: TicketUpdate & { id: string }) =>
      apiJson<Ticket>(`/api/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
