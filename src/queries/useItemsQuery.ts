import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PagedResultResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useItemsQuery(page: number, enabled: boolean) {
  return useQuery({
    queryKey: shopQueryKeys.items(page),
    queryFn: () => fetchJson<PagedResultResponse>(`/api/items?page=${page}`),
    enabled,
    placeholderData: keepPreviousData,
  });
}
