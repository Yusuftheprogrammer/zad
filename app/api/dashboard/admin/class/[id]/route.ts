/**
 * Admin Class by ID: GET one, PATCH update, DELETE.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { quickAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const { id } = await params;
  const classRecord = await prisma.class.findUnique({
    where: { id },
  });
  if (!classRecord) return Response.json({ error: "Class not found" }, { status: 404 });
  return Response.json(classRecord);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.class.findUnique({ where: { id } });
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
    const grade = await prisma.grade.findUnique({ where: { id: body.gradeId } });
    if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });
    data.gradeId = body.gradeId;
  }
  if (Object.keys(data).length === 0) {
    return Response.json(existing);
  }

  const updated = await prisma.class.update({
    where: { id },
    data,
  });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Class not found" }, { status: 404 });

  await prisma.class.delete({ where: { id } });
  return Response.json({ success: true, message: "Class deleted successfully" });
}
