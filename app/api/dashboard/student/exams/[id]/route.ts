/**
 * Student Exam by ID – GET one exam (read-only). Submit attempt via POST /api/dashboard/student/exams.
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

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });
  let myAttempt = null;
  if (student) {
    myAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: { examId: id, studentId: student.id },
      },
    });
  }

  return Response.json({ exam, myAttempt });
}
