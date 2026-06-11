import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTaskGroup } from "@/utils/tasks";
import { getDownloader } from "../../../utils/jdownloader";

const createTaskSchema = z
  .object({
    files: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          size_gb: z.number().min(0).optional(),
        }),
      )
      .optional()
      .default([]),
    urls: z.array(z.string().trim().min(1)).optional().default([]),
    passwords: z.array(z.string().trim().min(1)).optional().default([]),
  })
  .refine((data) => data.files.length > 0 || data.urls.length > 0, {
    message: "files or urls is required",
    path: ["files"],
  });

export async function GET() {
  try {
    const jd = await getDownloader();

    if (!jd) return;

    const tasks = await jd.getTasks();
    return NextResponse.json({
      tasks,
      last_updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List tasks error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const task = createTaskGroup({
      files: parsed.data.files,
      urls: parsed.data.urls,
      passwords: parsed.data.passwords,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
