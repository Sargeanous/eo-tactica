import { Bell, Globe2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { paletteEvent } from "./CommandPalette";

export function TopBar() {
  const { t, i18n } = useTranslation();
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const user = useAppStore((s) => s.user);

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    setLocale(next);
    void i18n.changeLanguage(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background h-14 flex items-center px-4 gap-3">
      <div className="font-semibold tracking-tight">
        <span className="text-brand-700">{t("app.name")}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          · {t("app.tagline")}
        </span>
      </div>
      <button
        type="button"
        onClick={() => paletteEvent.dispatchEvent(new Event("toggle"))}
        className="ml-6 flex items-center gap-2 h-9 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-72"
        aria-label={t("common.search")}
      >
        <Search size={14} />
        <span className="flex-1 text-left">{t("common.search")}</span>
        <kbd className="text-[10px] font-mono opacity-70">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="locale">
          <Globe2 size={16} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="notifications">
          <Bell size={16} />
        </Button>
        <div className="text-xs text-muted-foreground">
          {user?.displayName ?? user?.email ?? ""}
        </div>
      </div>
    </header>
  );
}
