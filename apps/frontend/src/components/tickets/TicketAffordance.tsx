import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type {
  Ticket,
  TicketCreate,
  TicketCriticality,
  TicketSourceKind,
} from "@eo-tactica/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTicket } from "@/hooks/api/tickets";
import { cn } from "@/lib/utils";

interface TicketAffordanceProps {
  ticket: Ticket | null;
  prefill: {
    title: string;
    description?: string;
    criticality: TicketCriticality;
    categoryId?: string;
    sourceKind?: TicketSourceKind;
    sourceId?: string;
  };
}

const TIER_CLASSES: Record<TicketCriticality, string> = {
  tier_1: "bg-status-danger text-white border-transparent",
  tier_2: "bg-status-warn text-white border-transparent",
  tier_3: "bg-status-info/15 text-status-info border-status-info/30",
  tier_4: "bg-muted text-ink-700 border-border",
};

export function TicketAffordance({ ticket, prefill }: TicketAffordanceProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(prefill.title);
  const [description, setDescription] = useState(prefill.description ?? "");
  const [criticality, setCriticality] = useState<TicketCriticality>(
    prefill.criticality,
  );
  const create = useCreateTicket();

  if (ticket) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/collab?ticket=${ticket.id}`)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
          TIER_CLASSES[ticket.criticality as TicketCriticality],
        )}
        title={ticket.code}
      >
        {ticket.criticality.replace("tier_", "T")}
      </button>
    );
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="create ticket"
      >
        <Plus size={14} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Criticality</Label>
              <Select
                value={criticality}
                onValueChange={(v) => setCriticality(v as TicketCriticality)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier_1">Tier 1 — critical</SelectItem>
                  <SelectItem value="tier_2">Tier 2 — high</SelectItem>
                  <SelectItem value="tier_3">Tier 3 — medium</SelectItem>
                  <SelectItem value="tier_4">Tier 4 — low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              source: {prefill.sourceKind ?? "manual"} ·{" "}
              {prefill.sourceId ?? "-"}
            </Badge>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const payload: TicketCreate = {
                    title,
                    description: description || null,
                    criticality,
                    categoryId: prefill.categoryId ?? null,
                    sourceKind: prefill.sourceKind ?? "manual",
                    sourceId: prefill.sourceId ?? null,
                    tags: [],
                  };
                  try {
                    await create.mutateAsync(payload);
                    toast.success("Ticket created");
                    setOpen(false);
                  } catch {
                    toast.error("Failed to create ticket");
                  }
                }}
                disabled={!title.trim() || create.isPending}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
