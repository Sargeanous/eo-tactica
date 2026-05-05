import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { AppLayout } from "./AppLayout";

export function ProtectedShell() {
  const token = useAppStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
