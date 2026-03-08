/**
 * Student Lesson by ID – GET one lesson (read-only).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  if (!student) return Response.json({ error: "Student profile not found" }, { status: 403 });

  const { id } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id, classId: student.classId },
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  return Response.json(lesson);
}
