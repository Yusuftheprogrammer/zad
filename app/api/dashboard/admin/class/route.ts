/**
 * Admin Classes: GET list, POST create. Class belongs to a Grade.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const gradeId = searchParams.get("gradeId");

  const classes = await prisma.class.findMany({
    where: gradeId ? { gradeId } : undefined,
    orderBy: [{ gradeId: "asc" }, { name: "asc" }],
  });
  return Response.json(classes);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; gradeId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, gradeId } = body;
  if (!name?.trim() || !gradeId) {
    return Response.json({ error: "name and gradeId are required" }, { status: 400 });
  }

  const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
  if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });

  const created = await prisma.class.create({
    data: { name: name.trim(), gradeId },
  });
  return Response.json(created, { status: 201 });
}
