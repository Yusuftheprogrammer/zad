/**
 * Admin Parent by ID: GET one, PATCH update (user fields), DELETE.
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
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });
  return Response.json(parent);
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
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const userData: { name?: string; email?: string; password?: string } = {};
  if (body.name !== undefined) userData.name = body.name;
  if (body.email !== undefined) userData.email = body.email;
  if (body.password !== undefined && body.password.length > 0) userData.password = body.password;

  if (Object.keys(userData).length === 0) {
    const current = await prisma.parent.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    return Response.json(current);
  }

  await prisma.user.update({
    where: { id: parent.userId },
    data: userData,
  });

  const updated = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
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
  const parent = await prisma.parent.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });

  await prisma.parent.delete({ where: { id } });
  await prisma.user.delete({ where: { id: parent.userId } });
  return Response.json({ success: true });
}
