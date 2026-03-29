/**
 * Teacher Exam by ID – GET one, PATCH update, DELETE.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

async function getTeacherId(session: { user: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  return teacher?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacherId = await getTeacherId(session);
  if (!teacherId) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const { id } = await params;
  const exam = await prisma.exam.findFirst({
    where: { id, teacherId },
    include: {
      subject: { select: { id: true, name: true } },
      attempts: {
        include: { student: { include: { user: { select: { name: true, email: true } } } } },
      },
    },
  });

  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });
  return Response.json(exam);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacherId = await getTeacherId(session);
  if (!teacherId) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.exam.findFirst({
    where: { id, teacherId },
  });
  if (!existing) return Response.json({ error: "Exam not found" }, { status: 404 });

  let body: {
    title?: string;
    description?: string;
    durationMinutes?: number;
    dueDate?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: {
    title?: string;
    description?: string | null;
    durationMinutes?: number;
    dueDate?: Date;
  } = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.durationMinutes !== undefined) data.durationMinutes = body.durationMinutes;
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);

  const exam = await prisma.exam.update({
    where: { id },
    data,
  });

  return Response.json(exam);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacherId = await getTeacherId(session);
  if (!teacherId) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.exam.findFirst({
    where: { id, teacherId },
  });
  if (!existing) return Response.json({ error: "Exam not found" }, { status: 404 });

  await prisma.exam.delete({ where: { id } });
  return Response.json({ success: true });
}
