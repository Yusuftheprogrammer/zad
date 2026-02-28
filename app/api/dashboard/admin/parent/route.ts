/**
 * Admin Parents: GET list, POST create (user + parent profile).
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parents = await prisma.parent.findMany({
    orderBy: { id: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return Response.json(parents);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, email, password } = body;
  if (!email || !password) {
    return Response.json({ error: "email and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "Email already exists" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: name ?? null,
      email,
      password,
      role: "PARENT",
      parent: { create: {} },
    },
    include: { parent: true },
  });
  return Response.json({ message: "Parent created successfully", data: user }, { status: 201 });
}
