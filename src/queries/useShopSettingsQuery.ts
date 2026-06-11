import { useQuery } from "@tanstack/react-query";
import { ShopSettingsResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useShopSettingsQuery() {
  return useQuery({
    queryKey: shopQueryKeys.settings,
    queryFn: () => fetchJson<ShopSettingsResponse>("/api/settings"),
    staleTime: 5 * 60 * 1000,
  });
}
