export const shopQueryKeys = {
  settings: ["shop-settings"] as const,
  agent: ["shop-agent"] as const,
  scan: ["shop-scan"] as const,
  tasks: ["shop-tasks"] as const,
  items: (page: number) => ["shop-items", page] as const,
  search: (query: string, page: number) =>
    ["shop-search", query, page] as const,
};
