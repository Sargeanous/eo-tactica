import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectOverview() {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold text-brand-900">
          {t("pages.project.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pages.project.subtitle")}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>EO-TACTICA Programme</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          {/* <DOMAIN_PLACEHOLDER>: replace with the operator's authoritative
              programme description (cadence, owner, scope). */}
          <p>
            EO-TACTICA is a 5-line urgent programme spanning imagery delivery,
            platform modules, vendor API integration, intelligence discovery
            and SIGINT data management.
          </p>
          <ul>
            <li>R1 · CV + Imagery Delivery</li>
            <li>R2 · Marketing Place / Training Platform / Archive Data</li>
            <li>R3 · Multi-source Imagery Vendor API Integration</li>
            <li>R4 · Intelligence Discovery / GSA Platform</li>
            <li>R5 · SIGINT Data Management — Voice + Signal Intelligence</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
