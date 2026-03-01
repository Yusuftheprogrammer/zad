/**
 * Admin Grades: GET list, POST create.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { quickAuth } from "@/lib/auth";

export async function GET() {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;

  const grades = await prisma.grade.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(grades);
}

export async function POST(request: NextRequest) {
  const forbidden = await quickAuth("ADMIN");
  if (forbidden) return forbidden;


  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const grade = await prisma.grade.create({
    data: { name },
  });
  return Response.json({ grade, message: "Grade added successfully" }, { status: 201 });
}
