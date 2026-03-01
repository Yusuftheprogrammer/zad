import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const adminSHash = await bcrypt.hash("helloworld", 10);
  console.log(adminSHash)

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ subject: { name: "asc" } }, { class: { name: "asc" } }],
    include: {
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
  });

  const subjects = assignments.map((assignment) => ({
    assignmentId: assignment.id,
    subjectId: assignment.subject.id,
    subjectName: assignment.subject.name,
    classId: assignment.class.id,
    className: assignment.class.name,
    label: `${assignment.subject.name} - ${assignment.class.name}`,
  }));

  return Response.json(subjects);
}
