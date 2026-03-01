/**
 * Admin Grade by ID: GET one, PATCH update, DELETE.
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
  const grade = await prisma.grade.findUnique({
    where: { id },
  });
  if (!grade) return Response.json({ error: "Grade not found" }, { status: 404 });
  return Response.json(grade);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.grade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Grade not found" }, { status: 404 });

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const grade = await prisma.grade.update({
    where: { id },
    data: { name },
  });
  return Response.json(grade);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.grade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Grade not found" }, { status: 404 });

  await prisma.grade.delete({ where: { id } });
  return Response.json({ success: true });
}
