import { NextRequest, NextResponse } from "next/server";
import { AgentStatus } from "@/types";
import { getDownloader } from "@/utils/jdownloader";

function detectDevice(userAgent: string): string {
  if (userAgent.includes("PlayStation 5")) return "PlayStation 5";
  if (userAgent.includes("PlayStation 4")) return "PlayStation 4";
  if (userAgent.includes("Xbox")) return "Xbox";
  if (userAgent.includes("Nintendo")) return "Nintendo";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS"))
    return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  return "Unknown Device";
}

export async function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const isPs5 = ua.includes("PlayStation 5");
  const device = detectDevice(ua);
  const status = isPs5 ? AgentStatus.OK : AgentStatus.STREAM_NOT_AVAILABLE;
  const downloader = await getDownloader();

  const x = await downloader?.checkConnectivity();
  return NextResponse.json({
    current_device: device,
    status,
    device_stream_ok: isPs5,
    downloader_ok: Boolean(x),
  });
}
