import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Send, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStreamingAsk } from "@/hooks/api/streaming";

/**
 * Public event bus so the TopBar (or any other surface) can request the
 * palette to open. Emit `toggle` to flip `open` state.
 */
export const paletteEvent = new EventTarget();

const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: "Command Center", href: "/" },
  { label: "Project Overview", href: "/project" },
  { label: "R1 · CV + Imagery", href: "/line1" },
  { label: "R2 · Platform Modules", href: "/line2" },
  { label: "R3 · Vendor APIs", href: "/line3" },
  { label: "R4 · GSA Platform", href: "/line4" },
  { label: "R5 · SIGINT", href: "/line5" },
  { label: "Tickets", href: "/collab" },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const ask = useStreamingAsk();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("keydown", onKeyDown);
    paletteEvent.addEventListener("toggle", onToggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      paletteEvent.removeEventListener("toggle", onToggle);
    };
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      ask.reset();
      setQuery("");
    }
  }, [open, ask]);

  const matches = QUICK_LINKS.filter((q) =>
    q.label.toLowerCase().includes(query.toLowerCase()),
  );

  const submit = () => {
    if (!query.trim()) return;
    ask.send(query.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-700" />
            {t("common.search")} · Ask EO-TACTICA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Ask anything, or jump to a page…"
            />
            <Button onClick={submit} disabled={ask.isStreaming}>
              {ask.isStreaming ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
            </Button>
          </div>

          {ask.isStreaming || ask.text ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
              {ask.text || (
                <span className="text-muted-foreground">Thinking…</span>
              )}
              {ask.error && (
                <div className="mt-2 text-xs text-status-danger">
                  {ask.error}
                </div>
              )}
            </div>
          ) : (
            <ul className="text-sm">
              {matches.map((m) => (
                <li key={m.href}>
                  <button
                    type="button"
                    className="w-full text-left rounded-md px-2 py-1.5 hover:bg-muted"
                    onClick={() => {
                      navigate(m.href);
                      setOpen(false);
                    }}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
              {matches.length === 0 && (
                <li className="px-2 py-1.5 text-muted-foreground">
                  Press Enter to ask the EO-TACTICA agent.
                </li>
              )}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
