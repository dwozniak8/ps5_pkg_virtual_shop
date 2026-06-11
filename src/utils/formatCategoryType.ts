export function formatCategoryType(type: string | null): string {
  const map: Record<string, string> = {
    gd: "Game",
    gde: "Game",
    gp: "Update",
    ac: "DLC",
    ap: "App",
  };
  return (type && map[type]) || type || "N/A";
}
