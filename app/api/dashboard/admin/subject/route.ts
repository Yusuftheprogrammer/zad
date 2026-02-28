/**
 * Admin Subjects: GET list, POST create.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(subjects);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const subject = await prisma.subject.create({
    data: { name },
  });
  return Response.json(subject, { status: 201 });
}
