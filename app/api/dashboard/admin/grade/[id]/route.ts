/**
 * Admin Grade by ID: GET one, PATCH update, DELETE.
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
  const grade = await (prisma as any).grade.findUnique({
    where: { id },
  });
  if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });
  return Response.json(grade);
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
  const existing = await (prisma as any).grade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Grade not found" }, { status: 404 });

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const grade = await (prisma as any).grade.update({
    where: { id },
    data: { name },
  });
  return Response.json(grade);
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
  const existing = await (prisma as any).grade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Grade not found" }, { status: 404 });

  await (prisma as any).grade.delete({ where: { id } });
  return Response.json({ success: true });
}
