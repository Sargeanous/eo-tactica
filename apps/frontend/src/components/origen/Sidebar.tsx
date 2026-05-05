import { NavLink } from "react-router-dom";
import {
  ChevronsLeft,
  ChevronsRight,
  Cog,
  FileText,
  Gauge,
  LayoutGrid,
  LucideIcon,
  Network,
  Radio,
  Satellite,
  ScanLine,
  Telescope,
  Ticket as TicketsIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

// <DOMAIN_PLACEHOLDER>: nav groups. Replace with EO-TACTICA's verticals.
const GROUPS: NavGroup[] = [
  {
    labelKey: "nav.groupOperations",
    items: [
      { to: "/", labelKey: "nav.commandCenter", icon: Gauge },
      { to: "/project", labelKey: "nav.overview", icon: LayoutGrid },
    ],
  },
  {
    labelKey: "nav.groupRequirements",
    items: [
      { to: "/line1", labelKey: "nav.line1", icon: Satellite },
      { to: "/line2", labelKey: "nav.line2", icon: ScanLine },
      { to: "/line3", labelKey: "nav.line3", icon: Network },
      { to: "/line4", labelKey: "nav.line4", icon: Telescope },
      { to: "/line5", labelKey: "nav.line5", icon: Radio },
    ],
  },
  {
    labelKey: "nav.groupAdmin",
    items: [
      { to: "/collab", labelKey: "nav.tickets", icon: TicketsIcon },
      { to: "/reports", labelKey: "nav.reports", icon: FileText },
      { to: "/settings", labelKey: "nav.settings", icon: Cog },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const locale = useAppStore((s) => s.locale);

  return (
    <aside
      className={cn(
        "fixed top-14 bottom-0 z-30 border-border bg-background transition-[width] duration-200",
        locale === "ar" ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-[64px]" : "w-[256px]",
      )}
    >
      <nav className="h-full overflow-y-auto py-3 text-sm">
        {GROUPS.map((group) => (
          <div key={group.labelKey} className="mb-4">
            {!collapsed && (
              <div className="px-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {t(group.labelKey)}
              </div>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 transition-colors",
                        isActive
                          ? "bg-brand-100 text-brand-900 font-medium"
                          : "text-ink-700 hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-border bg-background p-1.5 hover:bg-muted"
        aria-label="toggle sidebar"
      >
        {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </button>
    </aside>
  );
}
