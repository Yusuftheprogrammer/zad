/**
 * Admin Students: GET list, POST create.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

/** GET /api/dashboard/admin/student – list all students with user, class, grade */
export async function GET() {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    orderBy: { id: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      grade: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      parent: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return Response.json(students);
}

/** POST /api/dashboard/admin/student – create user + student (gradeId, classId required; parentId optional) */
export async function POST(request: NextRequest) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    name?: string;
    email: string;
    password: string;
    gradeId: string;
    classId: string;
    parentId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password, gradeId, classId, parentId } = body;
  if (!email || !password || !gradeId || !classId) {
    return Response.json(
      { error: "email, password, gradeId, and classId are required" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return Response.json({ error: "Email already exists" }, { status: 409 });
  }

  const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
  if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });

  const classRecord = await prisma.class.findFirst({
    where: { id: classId, gradeId },
  });
  if (!classRecord) return Response.json({ error: "Class not found or does not belong to grade" }, { status: 404 });

  if (parentId != null && parentId !== "") {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });
  }

  const user = await prisma.user.create({
    data: {
      name: name ?? null,
      email,
      password,
      role: "STUDENT",
      student: {
        create: {
          gradeId,
          classId,
          parentId: parentId && parentId !== "" ? parentId : null,
        },
      },
    },
    include: { student: true },
  });

  return Response.json({ message: "Student created successfully", data: user }, { status: 201 });
}
