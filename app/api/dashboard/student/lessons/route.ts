/**
 * Student Lessons API
 * GET: list lessons (optional ?subjectId= to filter). For MVP returns all lessons.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");

  const lessons = await prisma.lesson.findMany({
    where: subjectId ? { subjectId } : {},
    orderBy: [{ subjectId: "asc" }, { orderIndex: "asc" }],
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  return Response.json(lessons);
}
