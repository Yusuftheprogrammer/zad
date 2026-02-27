/**
 * Teacher Exams CRUD API
 * GET: list exams for the logged-in teacher.
 * POST: create exam (body: { title, description?, durationMinutes?, dueDate, subjectId }).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const exams = await prisma.exam.findMany({
    where: { teacherId: teacher.id },
    orderBy: { dueDate: "asc" },
    include: {
      subject: { select: { id: true, name: true } },
      _count: { select: { attempts: true } },
    },
  });

  return Response.json(exams);
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

  let body: {
    title?: string;
    description?: string;
    durationMinutes?: number;
    dueDate?: string;
    subjectId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, durationMinutes, dueDate, subjectId } = body;
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

  const exam = await prisma.exam.create({
    data: {
      title,
      description: description ?? null,
      durationMinutes: durationMinutes ?? 60,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      subjectId,
      teacherId: teacher.id,
    },
  });

  return Response.json(exam);
}
