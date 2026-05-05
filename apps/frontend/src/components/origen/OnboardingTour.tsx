import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Gauge, Layers, Ticket, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TourStep {
  id: "commandCenter" | "lines" | "tickets";
  Icon: LucideIcon;
  navigateTo: string;
  bulletCount: number;
}

// <DOMAIN_PLACEHOLDER>: extend with one step per major page once the page
// set is stable. Keys must match `tour.steps.<id>` in both i18n bundles.
const STEPS: TourStep[] = [
  {
    id: "commandCenter",
    Icon: Gauge,
    navigateTo: "/",
    bulletCount: 3,
  },
  {
    id: "lines",
    Icon: Layers,
    navigateTo: "/r1",
    bulletCount: 3,
  },
  {
    id: "tickets",
    Icon: Ticket,
    navigateTo: "/collab",
    bulletCount: 3,
  },
];

const STORAGE_KEY = "eo-tactica.tour.dismissed";

export function OnboardingTour() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open onboarding tour"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 rounded-full border border-border bg-background p-3 shadow-md hover:bg-muted"
      >
        <Compass size={16} className="text-brand-700" />
      </button>
    );
  }

  const step = STEPS[stepIdx]!;
  const isLast = stepIdx === STEPS.length - 1;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[360px]">
      <Card className="shadow-lg border-brand-300/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <step.Icon size={16} className="text-brand-700" />
            {t(`tour.steps.${step.id}.title`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-ink-700">{t(`tour.steps.${step.id}.body`)}</p>
          <ul className="list-disc pl-5 space-y-1 text-ink-700">
            {Array.from({ length: step.bulletCount }).map((_, i) => (
              <li key={i}>{t(`tour.steps.${step.id}.bullet${i + 1}`)}</li>
            ))}
          </ul>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={dismiss}>
              {t("tour.skip")}
            </Button>
            <div className="flex gap-2">
              {stepIdx > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                >
                  {t("tour.back")}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (isLast) {
                    dismiss();
                    return;
                  }
                  const next = STEPS[stepIdx + 1]!;
                  navigate(next.navigateTo);
                  setStepIdx(stepIdx + 1);
                }}
              >
                {isLast ? t("tour.done") : t("tour.next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
