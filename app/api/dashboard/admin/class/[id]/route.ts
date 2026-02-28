/**
 * Admin Class by ID: GET one, PATCH update, DELETE.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const classRecord = await (prisma as any).class.findUnique({
    where: { id },
  });
  if (!classRecord) return Response.json({ error: "Class not found" }, { status: 404 });
  return Response.json(classRecord);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await (prisma as any).class.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Class not found" }, { status: 404 });

  let body: { name?: string; gradeId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const data: { name?: string; gradeId?: string } = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.gradeId !== undefined) {
    const grade = await (prisma as any).grade.findUnique({ where: { id: body.gradeId } });
    if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });
    data.gradeId = body.gradeId;
  }
  if (Object.keys(data).length === 0) {
    return Response.json(existing);
  }

  const updated = await (prisma as any).class.update({
    where: { id },
    data,
  });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await (prisma as any).class.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Class not found" }, { status: 404 });

  await (prisma as any).class.delete({ where: { id } });
  return Response.json({ success: true });
}
