import { NextRequest, NextResponse } from "next/server";
import { getAllItems, ITEMS_PER_PAGE } from "@/utils/scanner";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const allItems = getAllItems();
  const total = allItems.length;
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = allItems.slice(start, start + ITEMS_PER_PAGE);

  return NextResponse.json({
    items,
    current_page: page,
    total_pages: totalPages,
  });
}
