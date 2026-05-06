import { prisma } from "@/lib/prisma";
import { getTeacherAssignmentOptions, requireTeacherContext } from "@/lib/teacher-api";

export async function GET() {
  const context = await requireTeacherContext();
  if (context instanceof Response) return context;

  const [homework, assignments] = await Promise.all([
    prisma.homework.findMany({
      where: { teacherId: context.teacherId },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    }),
    getTeacherAssignmentOptions(context.teacherId),
  ]);

  return Response.json({ homework, subjects: assignments });
}
