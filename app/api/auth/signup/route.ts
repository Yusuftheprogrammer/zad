/**
 * POST /api/auth/signup – create a new user (Student by default).
 * Body: { name?, email, password, role? } where role is STUDENT | TEACHER | ADMIN.
 * For MVP we only create User + corresponding role record (Student or Teacher).
 */
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "STUDENT" } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["STUDENT", "TEACHER"];
    if (!allowedRoles.includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name ?? null,
        email,
        password: hashed,
        role,
      },
    });

    // Create role profile so login and relations work
    if (role === "STUDENT") {
      await prisma.student.create({ data: { userId: user.id } });
    } else if (role === "TEACHER") {
      await prisma.teacher.create({ data: { userId: user.id } });
    } else if (role === "ADMIN") {
      await prisma.admin.create({ data: { userId: user.id } });
    }

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    console.error("Signup error:", e);
    return Response.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
