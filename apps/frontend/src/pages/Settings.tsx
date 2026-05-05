import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function Settings() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const clearSession = useAppStore((s) => s.clearSession);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-brand-900">
        {t("pages.settings.title")}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Email: </span>
            {user?.email ?? "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Role: </span>
            {user?.role ?? "-"}
          </div>
          <Button variant="outline" onClick={clearSession}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
