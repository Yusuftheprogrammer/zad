/**
 * Student Exams API
 * GET: list exams (for MVP all exams; can later scope by student's subjects).
 * POST: submit/start attempt (body: { examId, answers? }) – creates or updates ExamAttempt.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { quickAuth, requireAuth, requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await quickAuth("STUDENT");
  if (forbidden) return forbidden;

  const exams = await prisma.exam.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  return Response.json(exams);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });
  if (!student) return Response.json({ error: "Student profile not found" }, { status: 403 });

  let body: { examId?: string; answers?: string; score?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { examId, answers } = body;
  if (!examId) {
    return Response.json({ error: "examId is required" }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });
  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });

  const existing = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: { examId, studentId: student.id },
    },
  });

  if (existing) {
    const updated = await prisma.examAttempt.update({
      where: {
        examId_studentId: { examId, studentId: student.id },
      },
      data: {
        answers: answers ?? existing.answers,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
    return Response.json(updated);
  }

  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId: student.id,
      answers: answers ?? null,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  return Response.json(attempt);
}
