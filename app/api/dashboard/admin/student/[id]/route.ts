/**
 * Admin Student by ID: GET one, PATCH update, DELETE.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

/** GET /api/dashboard/admin/student/[id] – get one student with user, class, grade, parent */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      class: { select: { id: true, name: true } },
      grade: { select: { id: true, name: true } },
      parent: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
  return Response.json(student);
}

/** PATCH /api/dashboard/admin/student/[id] – update user (name, email, password?) and/or student (gradeId, classId, parentId?) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  let body: {
    name?: string;
    email?: string;
    password?: string;
    gradeId?: string;
    classId?: string;
    parentId?: string | null;
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

  const studentData: { gradeId?: string; classId?: string; parentId?: string | null } = {};
  if (body.gradeId !== undefined) studentData.gradeId = body.gradeId;
  if (body.classId !== undefined) studentData.classId = body.classId;
  if (body.parentId !== undefined) studentData.parentId = body.parentId === "" ? null : body.parentId;

  if (studentData.gradeId) {
    const grade = await prisma.grade.findUnique({ where: { id: studentData.gradeId } });
    if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });
  }
  if (studentData.classId) {
    const classRecord = await prisma.class.findFirst({
      where: {
        id: studentData.classId,
        gradeId: studentData.gradeId ?? student.gradeId,
      },
    });
    if (!classRecord) return Response.json({ error: "Class not found or does not belong to grade" }, { status: 404 });
  }
  if (studentData.parentId != null && studentData.parentId !== "") {
    const parent = await prisma.parent.findUnique({ where: { id: studentData.parentId } });
    if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: student.userId },
        data: userData,
      });
    }
    if (Object.keys(studentData).length > 0) {
      await tx.student.update({
        where: { id },
        data: studentData,
      });
    }
  });

  const updated = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      parent: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  return Response.json(updated);
}

/** DELETE /api/dashboard/admin/student/[id] – delete student (cascades submissions, examAttempts) then user */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  await prisma.student.delete({ where: { id } });
  await prisma.user.delete({ where: { id: student.userId } });
  return Response.json({ success: true });
}
