/**
 * Teacher Homework CRUD API
 * GET: list homework for the logged-in teacher.
 * POST: create homework (body: { title, description, dueDate, subjectId }).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

/** GET /api/dashboard/teacher/homework – list teacher's homework */
export async function GET() {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const homework = await prisma.homework.findMany({
    where: { teacherId: teacher.id },
    orderBy: { dueDate: "asc" },
    include: {
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return Response.json(homework);
}

/** POST /api/dashboard/teacher/homework – create homework */
export async function POST(request: NextRequest) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  let body: { title?: string; description?: string; dueDate?: string; subjectId?: string; classId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, dueDate, subjectId, classId } = body;
  if (!title || !subjectId) {
    return Response.json(
      { error: "title and subjectId are required" },
      { status: 400 }
    );
  }

  // Ensure subject belongs to this teacher
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

  const homework = await prisma.homework.create({
    data: {
      title,
      description: description ?? "",
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      subjectId,
      teacherId: teacher.id,
      classId: resolvedClassId,
    },
  });

  return Response.json(homework);
}
