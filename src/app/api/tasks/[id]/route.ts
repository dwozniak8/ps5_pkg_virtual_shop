import { NextResponse } from "next/server";
import { deleteTask } from "@/utils/tasks";

export function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) => {
    try {
      const deleted = deleteTask(id);

      if (!deleted) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Delete task error:", error);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  });
}
