/**
 * Teacher Subjects API – list and create subjects for the logged-in teacher.
 * GET: list. POST: create (body: { name }).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 403 });

  const subjects = await prisma.subject.findMany({
    where: { teacherId: teacher.id },
    orderBy: { name: "asc" },
  });

  return Response.json(subjects);
}