import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export type TeacherAssignmentOption = {
  assignmentId: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  label: string;
};

export async function requireTeacherContext(): Promise<{ teacherId: string } | Response> {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  const session = await requireAuth();
  if (!session) return Response.json({ error: "غير مصرح بالدخول" }, { status: 401 });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacher) return Response.json({ error: "لم يتم العثور على ملف المعلم" }, { status: 403 });

  return { teacherId: teacher.id };
}

export async function getTeacherAssignmentOptions(teacherId: string): Promise<TeacherAssignmentOption[]> {
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId },
    orderBy: [{ subject: { name: "asc" } }, { class: { name: "asc" } }],
    select: {
      id: true,
      subjectId: true,
      classId: true,
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
  });

  return assignments.map((assignment) => ({
    assignmentId: assignment.id,
    subjectId: assignment.subjectId,
    subjectName: assignment.subject.name,
    classId: assignment.classId,
    className: assignment.class.name,
    label: `${assignment.subject.name} - ${assignment.class.name}`,
  }));
}
