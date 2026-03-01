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
    const body: {
      name?: string;
      email?: string;
      password?: string;
      role?: "STUDENT" | "TEACHER";
    } = await request.json();
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

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: name ?? null,
          email,
          password: hashed,
          role,
        },
      });

      // Student now requires gradeId + classId in schema.
      if (role === "STUDENT") {
        const firstClass = await tx.class.findFirst({
          orderBy: { name: "asc" },
          select: { id: true, gradeId: true },
        });
        if (!firstClass) {
          throw new Error("NO_CLASSES_CONFIGURED");
        }

        await tx.student.create({
          data: {
            userId: createdUser.id,
            gradeId: firstClass.gradeId,
            classId: firstClass.id,
          },
        });
      } else {
        await tx.teacher.create({ data: { userId: createdUser.id } });
      }

      return createdUser;
    });

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "NO_CLASSES_CONFIGURED") {
      return Response.json(
        { error: "No classes are configured yet. Please contact an admin." },
        { status: 400 }
      );
    }
    console.error("Signup error:", e);
    return Response.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
