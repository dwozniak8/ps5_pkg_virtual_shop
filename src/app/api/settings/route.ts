import { NextResponse } from "next/server";
import { loadConfig } from "@/utils/env";

export function GET() {
  const config = loadConfig();
  return NextResponse.json({ shop_title: config.shop_title });
}
