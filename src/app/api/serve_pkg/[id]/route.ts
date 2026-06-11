import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPkgLookup } from "@/utils/scanner";

export function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) => {
    const lookup = getPkgLookup();
    const pkgPath = lookup[decodeURIComponent(id)];

    if (!pkgPath || !fs.existsSync(pkgPath)) {
      return new NextResponse("PKG not found", { status: 404 });
    }

    const filename = path.basename(pkgPath);
    const stat = fs.statSync(pkgPath);
    const fileSize = stat.size;

    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const nodeStream = fs.createReadStream(pkgPath, { start, end });
      const readable = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          nodeStream.destroy();
        },
      });

      return new NextResponse(readable, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const nodeStream = fs.createReadStream(pkgPath);
    const readable = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
      },
    });
  });
}
