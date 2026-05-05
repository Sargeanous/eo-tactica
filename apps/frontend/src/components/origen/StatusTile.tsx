import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type TileStatus = "ok" | "warn" | "alert";

export interface StatusTileProps {
  label: string;
  status: TileStatus;
  icon: LucideIcon;
  metric: string;
  hint?: string;
  href: string;
  statusLabel?: string;
}

const STATUS_CLASSES: Record<TileStatus, string> = {
  ok: "border-brand-300/40 bg-brand-50",
  warn: "border-status-warn/30 bg-status-warn/5",
  alert: "border-status-danger/30 bg-status-danger/5",
};

const METRIC_CLASSES: Record<TileStatus, string> = {
  ok: "text-brand-700",
  warn: "text-status-warn",
  alert: "text-status-danger",
};

export function StatusTile({
  label,
  status,
  icon: Icon,
  metric,
  hint,
  href,
  statusLabel,
}: StatusTileProps) {
  return (
    <Link
      to={href}
      aria-label={statusLabel ?? `${label}: ${metric}`}
      className={cn(
        "block rounded-lg border p-4 transition hover:shadow-sm",
        STATUS_CLASSES[status],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wider text-ink-700">
          {label}
        </div>
        <Icon size={14} className="text-ink-500" />
      </div>
      <div className={cn("mt-2 text-3xl font-semibold", METRIC_CLASSES[status])}>
        {metric}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Link>
  );
}

export function deriveStatus(
  value: number,
  target: number,
  direction: "up" | "down" = "up",
): TileStatus {
  if (target === 0) return "ok";
  const ratio = direction === "up" ? value / target : target / value;
  if (ratio >= 1.0) return "ok";
  if (ratio >= 0.95) return "warn";
  return "alert";
}
