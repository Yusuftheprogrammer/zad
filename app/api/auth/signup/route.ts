import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: "STUDENT" | "TEACHER" | "ADMIN" | "PARENT";
  gradeId?: string;
  classId?: string;
  parentId?: string | null;
};

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "صيغة JSON غير صحيحة" }, { status: 400 });
  }

  const { name, email, password, role, gradeId, classId, parentId } = body;
  if (!email || !password) {
    return Response.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
  }

  if ((role ?? "STUDENT") !== "STUDENT") {
    return Response.json(
      { error: "التسجيل الذاتي متاح للطلاب فقط" },
      { status: 403 }
    );
  }

  if (!gradeId || !classId) {
    return Response.json({ error: "المرحلة والفصل مطلوبان" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: name || undefined,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          gradeId,
          classId,
          parentId: parentId ?? null,
        },
        select: { id: true },
      });

      return { userId: user.id, studentId: student.id };
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل إنشاء الحساب";
    return Response.json({ error: message }, { status: 400 });
  }
}
