/**
 * Teacher Lessons CRUD API
 * GET: list lessons for the logged-in teacher (via their subjects).
 * POST: create lesson (body: { title, content, subjectId, orderIndex? }).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");

  const lessons = await prisma.lesson.findMany({
    where: subjectId
      ? { subjectId, subject: { teacherId: teacher.id } }
      : { subject: { teacherId: teacher.id } },
    orderBy: [{ subjectId: "asc" }, { orderIndex: "asc" }],
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  return Response.json(lessons);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  let body: { title?: string; content?: string; subjectId?: string; orderIndex?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, subjectId, orderIndex } = body;
  if (!title || !subjectId) {
    return Response.json(
      { error: "title and subjectId are required" },
      { status: 400 }
    );
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId: teacher.id },
  });
  if (!subject) {
    return Response.json({ error: "Subject not found or not yours" }, { status: 404 });
  }

  const lesson = await prisma.lesson.create({
    data: {
      title,
      content: content ?? "",
      subjectId,
      orderIndex: orderIndex ?? 0,
    },
  });

  return Response.json(lesson);
}
