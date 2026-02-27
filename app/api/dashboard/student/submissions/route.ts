/**
 * Student Submissions API
 * GET: list current user's submissions (optional ?homeworkId= to filter).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });
  if (!student) return Response.json({ error: "Student profile not found" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const homeworkId = searchParams.get("homeworkId");

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: student.id,
      ...(homeworkId ? { homeworkId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      homework: {
        select: { id: true, title: true, dueDate: true },
      },
    },
  });

  return Response.json(submissions);
}
