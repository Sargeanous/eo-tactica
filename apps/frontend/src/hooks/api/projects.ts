import { useQuery } from "@tanstack/react-query";
import type { Project, ProjectKpi } from "@eo-tactica/shared";
import { apiJson } from "@/lib/api/client";

interface ListResponse {
  items: Project[];
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiJson<ListResponse>("/api/projects"),
  });
}

export function useProjectKpis() {
  return useQuery({
    queryKey: ["projects", "kpis"],
    queryFn: () => apiJson<ProjectKpi>("/api/projects/kpis"),
  });
}
