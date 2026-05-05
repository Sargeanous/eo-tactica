import { useQuery } from "@tanstack/react-query";
import type { RequirementLine } from "@eo-tactica/shared";
import { apiJson } from "@/lib/api/client";

interface ListResponse {
  items: RequirementLine[];
}

export function useRequirementLines() {
  return useQuery({
    queryKey: ["requirement-lines", "list"],
    queryFn: () => apiJson<ListResponse>("/api/requirement-lines"),
  });
}

export function useRequirementLine(code: string) {
  return useQuery({
    queryKey: ["requirement-lines", code],
    queryFn: () => apiJson<RequirementLine>(`/api/requirement-lines/${code}`),
    enabled: !!code,
  });
}
