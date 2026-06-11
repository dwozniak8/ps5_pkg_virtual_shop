import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_FOLDER = path.join(process.cwd(), "cached");

export function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return params.then(({ path: segments }) => {
    // Resolve and validate path stays within cache folder
    const filePath = path.resolve(CACHE_FOLDER, ...segments);
    if (
      !filePath.startsWith(CACHE_FOLDER + path.sep) &&
      filePath !== CACHE_FOLDER
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = fs.readFileSync(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  });
}
