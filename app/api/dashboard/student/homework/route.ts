/**
 * Student Homework API
 * GET: list homework for the logged-in student (via their subjects; for MVP we return all homework).
 * POST: create a submission for a homework (body: { homeworkId, content }).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

/** GET /api/dashboard/student/homework – list homework (auth required, student only) */
export async function GET() {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  if (!student) {
    return Response.json({ error: "Student profile not found" }, { status: 403 });
  }

  const homework = await prisma.homework.findMany({
    where: { classId: student.classId },
    orderBy: { dueDate: "asc" },
    include: {
      subject: {
        select: { id: true, name: true },
      },
      teacher: {
        select: {
          id: true,
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  return Response.json(homework);
}

/** POST /api/dashboard/student/homework – submit homework (body: { homeworkId, content }) */
export async function POST(request: NextRequest) {
  const forbidden = await requireRole("STUDENT");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { homeworkId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { homeworkId, content } = body;
  if (!homeworkId || content === undefined) {
    return Response.json(
      { error: "homeworkId and content are required" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true, classId: true },
  });
  if (!student) {
    return Response.json({ error: "Student profile not found" }, { status: 403 });
  }

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, classId: student.classId },
  });
  if (!homework) {
    return Response.json({ error: "Homework not found" }, { status: 404 });
  }

  const existing = await prisma.submission.findFirst({
    where: { homeworkId, studentId: student.id },
  });
  if (existing) {
    return Response.json(
      { error: "You already submitted this homework" },
      { status: 409 }
    );
  }

  let submission;
  try {
    submission = await prisma.submission.create({
      data: {
        homeworkId,
        studentId: student.id,
        content: String(content),
        status: "SUBMITTED",
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "You already submitted this homework" },
        { status: 409 }
      );
    }
    return Response.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }

  return Response.json(submission);
}
