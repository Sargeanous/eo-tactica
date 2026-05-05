import { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { OnboardingTour } from "./OnboardingTour";
import { CommandPalette } from "./CommandPalette";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const locale = useAppStore((s) => s.locale);
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground"
    >
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200",
            collapsed
              ? locale === "ar"
                ? "mr-[64px]"
                : "ml-[64px]"
              : locale === "ar"
                ? "mr-[256px]"
                : "ml-[256px]",
          )}
        >
          {children}
        </main>
      </div>
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
}
