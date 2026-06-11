import { useQuery } from "@tanstack/react-query";
import { AgentInfoResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useAgentInfoQuery() {
  return useQuery({
    queryKey: shopQueryKeys.agent,
    queryFn: () => fetchJson<AgentInfoResponse>("/api/check_agent"),
    staleTime: 60 * 1000,
  });
}
