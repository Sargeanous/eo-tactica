import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-brand-900">
        {t("pages.reports.title")}
      </h1>
      {/* <DOMAIN_PLACEHOLDER>: bilingual report templates land here. Mirror
          one Card per template (Executive Brief, Weekly, Monthly, Quarterly). */}
      <div className="grid gap-4 md:grid-cols-2">
        {["Executive Brief", "Weekly", "Monthly", "Quarterly"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming soon — populate from /api/reports/&lt;template&gt;/data.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
