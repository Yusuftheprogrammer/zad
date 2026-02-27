/**
 * Teacher Lesson by ID – GET one, PATCH update, DELETE.
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
  const lesson = await prisma.lesson.findFirst({
    where: { id, subject: { teacherId } },
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  return Response.json(lesson);
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
  const existing = await prisma.lesson.findFirst({
    where: { id, subject: { teacherId } },
  });
  if (!existing) return Response.json({ error: "Lesson not found" }, { status: 404 });

  let body: { title?: string; content?: string; orderIndex?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { title?: string; content?: string; orderIndex?: number } = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.content !== undefined) data.content = body.content;
  if (body.orderIndex !== undefined) data.orderIndex = body.orderIndex;

  const lesson = await prisma.lesson.update({
    where: { id },
    data,
  });

  return Response.json(lesson);
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
  const existing = await prisma.lesson.findFirst({
    where: { id, subject: { teacherId } },
  });
  if (!existing) return Response.json({ error: "Lesson not found" }, { status: 404 });

  await prisma.lesson.delete({ where: { id } });
  return Response.json({ success: true });
}
