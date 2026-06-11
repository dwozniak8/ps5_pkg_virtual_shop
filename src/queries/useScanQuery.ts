import { useQuery } from "@tanstack/react-query";
import { ScanResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useScanQuery() {
  return useQuery({
    queryKey: shopQueryKeys.scan,
    queryFn: () => fetchJson<ScanResponse>("/api/scan"),
  });
}
