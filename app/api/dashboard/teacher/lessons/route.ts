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
  const classId = searchParams.get("classId");

  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      teacherId: teacher.id,
      ...(subjectId ? { subjectId } : {}),
      ...(classId ? { classId } : {}),
    },
    select: { subjectId: true, classId: true },
  });
  if (assignments.length === 0) return Response.json([]);

  const pairFilters = assignments.map((assignment) => ({
    subjectId: assignment.subjectId,
    classId: assignment.classId,
  }));

  const lessons = await prisma.lesson.findMany({
    where: pairFilters.length === 1 ? pairFilters[0] : { OR: pairFilters },
    orderBy: [{ subjectId: "asc" }, { classId: "asc" }, { orderIndex: "asc" }],
    include: {
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
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

  let body: { title?: string; content?: string; subjectId?: string; classId?: string; orderIndex?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, subjectId, classId, orderIndex } = body;
  if (!title || !subjectId) {
    return Response.json(
      { error: "title and subjectId are required" },
      { status: 400 }
    );
  }

  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      teacherId: teacher.id,
      subjectId,
      ...(classId ? { classId } : {}),
    },
    select: { classId: true },
  });
  if (assignments.length === 0) {
    return Response.json({ error: "Subject not found or not yours" }, { status: 404 });
  }
  if (!classId && assignments.length > 1) {
    return Response.json(
      { error: "classId is required when this subject is assigned to multiple classes" },
      { status: 400 }
    );
  }
  const resolvedClassId = assignments[0].classId;

  const lesson = await prisma.lesson.create({
    data: {
      title,
      content: content ?? "",
      subjectId,
      classId: resolvedClassId,
      orderIndex: orderIndex ?? 0,
    },
  });

  return Response.json(lesson);
}
