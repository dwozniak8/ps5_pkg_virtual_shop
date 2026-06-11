import { NextRequest, NextResponse } from "next/server";
import { ShopItem } from "@/types";
import { getCategorizedData, ITEMS_PER_PAGE } from "@/utils/scanner";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (!query) {
    return NextResponse.json(
      { error: "search parameter is required" },
      { status: 400 },
    );
  }

  const allItems: ShopItem[] = Object.values(getCategorizedData()).flat();
  const matched = allItems.filter((item) =>
    (item.title ?? "").toLowerCase().includes(query),
  );

  const total = matched.length;
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = matched.slice(start, start + ITEMS_PER_PAGE);

  return NextResponse.json({
    items,
    current_page: page,
    total_pages: totalPages,
  });
}
