import { NextResponse } from "next/server";
import { performFullScan } from "@/utils/scanner";

export function GET() {
  try {
    const categories = performFullScan();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
