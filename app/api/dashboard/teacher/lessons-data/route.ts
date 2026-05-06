import { prisma } from "@/lib/prisma";
import { getTeacherAssignmentOptions, requireTeacherContext } from "@/lib/teacher-api";

export async function GET() {
  const context = await requireTeacherContext();
  if (context instanceof Response) return context;

  const assignments = await getTeacherAssignmentOptions(context.teacherId);
  const pairFilters = assignments.map((assignment) => ({
    subjectId: assignment.subjectId,
    classId: assignment.classId,
  }));

  const lessons =
    pairFilters.length === 0
      ? []
      : await prisma.lesson.findMany({
          where: pairFilters.length === 1 ? pairFilters[0] : { OR: pairFilters },
          orderBy: [{ subjectId: "asc" }, { classId: "asc" }, { orderIndex: "asc" }],
          select: {
            id: true,
            title: true,
            content: true,
            orderIndex: true,
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        });

  return Response.json({ lessons, subjects: assignments });
}
