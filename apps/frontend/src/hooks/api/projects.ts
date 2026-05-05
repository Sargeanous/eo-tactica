import { useQuery } from "@tanstack/react-query";
import type { ProjectKpi } from "@eo-tactica/shared";
import { apiJson } from "@/lib/api/client";

export function useProjectKpis() {
  return useQuery({
    queryKey: ["projects", "kpis"],
    queryFn: () => apiJson<ProjectKpi>("/api/projects/kpis"),
  });
}
