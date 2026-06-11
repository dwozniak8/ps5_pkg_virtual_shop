import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PagedResultResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useSearchQuery(query: string, page: number, enabled: boolean) {
  return useQuery({
    queryKey: shopQueryKeys.search(query, page),
    queryFn: () =>
      fetchJson<PagedResultResponse>(
        `/api/search?search=${encodeURIComponent(query)}&page=${page}`,
      ),
    enabled,
    placeholderData: keepPreviousData,
  });
}
