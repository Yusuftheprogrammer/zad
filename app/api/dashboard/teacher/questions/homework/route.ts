import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Teacher MCQ homework questions API.
 *
 * Endpoints:
 * GET    - list questions (accepts ?homeworkId=)
 * POST   - create a new question tied to a homework
 * PATCH  - modify an existing question
 * DELETE - remove a question
 */

async function verifyTeacherHomework(teacherId: string, homeworkId: string) {
  const hw = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId },
    select: { id: true },
  });
  return !!hw;
}

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
  const homeworkId = searchParams.get("homeworkId");
  if (!homeworkId) return Response.json([]);

  const ok = await verifyTeacherHomework(teacher.id, homeworkId);
  if (!ok) return Response.json({ error: "Homework not found or not yours" }, { status: 404 });

  const questions = await prisma.mcqQuestion.findMany({
    where: { homeworkQuestions: { some: { homeworkId } } },
    orderBy: { order: "asc" },
    include: {
      options: { orderBy: { id: "asc" }, select: { id: true, title: true, isCorrect: true } },
    },
  });

  return Response.json(questions);
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
    homeworkId?: string;
    title?: string;
    order?: number;
    numberOfOptions?: number;
    options?: Array<{ title: string; isCorrect?: boolean }>;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { homeworkId, title, order, numberOfOptions, options } = body;
  if (!homeworkId || !title || order === undefined) {
    return Response.json({ error: "homeworkId, title and order are required" }, { status: 400 });
  }
  const ok = await verifyTeacherHomework(teacher.id, homeworkId);
  if (!ok) return Response.json({ error: "Homework not found or not yours" }, { status: 404 });

  const question = await prisma.mcqQuestion.create({
    data: {
      title,
      order,
      numberOfOptions: numberOfOptions ?? 4,
      options: options
        ? { create: options.map((o) => ({ title: o.title, isCorrect: o.isCorrect ?? false })) }
        : undefined,
      homeworkQuestions: { create: { homeworkId, order } },
    },
    include: { options: true },
  });

  return Response.json(question);
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  let body: {
    questionId?: string;
    title?: string;
    order?: number;
    numberOfOptions?: number;
    options?: Array<{ title: string; isCorrect?: boolean }>;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { questionId, title, order, numberOfOptions, options } = body;
  if (!questionId) return Response.json({ error: "questionId is required" }, { status: 400 });

  const existing = await prisma.mcqQuestion.findFirst({
    where: {
      id: questionId,
      homeworkQuestions: { some: { homework: { teacherId: teacher.id } } },
    },
  });
  if (!existing) return Response.json({ error: "Question not found or not yours" }, { status: 404 });

  const data: {
    title?: string;
    order?: number;
    numberOfOptions?: number;
    options?: { create: { title: string; isCorrect: boolean }[] };
  } = {};
  if (title !== undefined) data.title = title;
  if (order !== undefined) data.order = order;
  if (numberOfOptions !== undefined) data.numberOfOptions = numberOfOptions;

  if (options) {
    await prisma.options.deleteMany({ where: { questionId } });
    data.options = { create: options.map((o) => ({ title: o.title, isCorrect: o.isCorrect ?? false })) };
  }

  const updated = await prisma.mcqQuestion.update({ where: { id: questionId }, data });
  return Response.json(updated);
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  let body: { questionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { questionId } = body;
  if (!questionId) return Response.json({ error: "questionId is required" }, { status: 400 });

  const existing = await prisma.mcqQuestion.findFirst({
    where: {
      id: questionId,
      homeworkQuestions: { some: { homework: { teacherId: teacher.id } } },
    },
  });
  if (!existing) return Response.json({ error: "Question not found or not yours" }, { status: 404 });

  await prisma.mcqQuestion.delete({ where: { id: questionId } });
  return Response.json({ success: true });
}
