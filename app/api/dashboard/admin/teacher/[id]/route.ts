/**
 * Admin Teacher by ID: GET one, PATCH update, DELETE.
 * id = teacher id (cuid).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

/** GET /api/dashboard/admin/teacher/[id] – get one teacher with user and assignments */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!teacher) return Response.json({ error: "Teacher not found" }, { status: 404 });
  return Response.json(teacher);
}

/** PATCH /api/dashboard/admin/teacher/[id] – update teacher's user (name, email, password?) and/or assignments */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!teacher) return Response.json({ error: "Teacher not found" }, { status: 404 });

  let body: {
    name?: string;
    email?: string;
    password?: string;
    assignments?: { classId: string; subjectId: string }[];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userData: { name?: string; email?: string; password?: string } = {};
  if (body.name !== undefined) userData.name = body.name;
  if (body.email !== undefined) userData.email = body.email;
  if (body.password !== undefined && body.password.length > 0) userData.password = body.password;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: teacher.userId },
        data: userData,
      });
    }

    if (body.assignments !== undefined) {
      await tx.teachingAssignment.deleteMany({ where: { teacherId: id } });
      for (const a of body.assignments) {
        await tx.teachingAssignment.create({
          data: { teacherId: id, classId: a.classId, subjectId: a.subjectId },
        });
      }
    }
  });

  const updated = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return Response.json(updated);
}

/** DELETE /api/dashboard/admin/teacher/[id] – delete teacher and their user */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!teacher) return Response.json({ error: "Teacher not found" }, { status: 404 });

  // Delete teacher first (cascades to assignments, homeworks, exams), then user
  await prisma.teacher.delete({ where: { id } });
  await prisma.user.delete({ where: { id: teacher.userId } });
  return Response.json({ success: true });
}
