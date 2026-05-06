import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("ADMIN");
  if (forbidden) return forbidden;

  const [
    grades,
    classes,
    subjects,
    parents,
    students,
    teachers,
    usersByRole,
    gradesCount,
    classesCount,
    subjectsCount,
    teachersCount,
    studentsCount,
    parentsCount,
    lessonsCount,
    homeworksCount,
    examsCount,
    submissionsCount,
  ] = await Promise.all([
    prisma.grade.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, gradeId: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.parent.findMany({
      select: {
        id: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { id: "asc" },
    }),
    prisma.student.findMany({
      select: {
        id: true,
        user: { select: { name: true, email: true } },
        grade: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        parent: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.teacher.findMany({
      select: {
        id: true,
        user: { select: { name: true, email: true } },
        assignments: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.grade.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.lesson.count(),
    prisma.homework.count(),
    prisma.exam.count(),
    prisma.submission.count(),
  ]);

  return Response.json({
    grades,
    classes,
    subjects,
    parents,
    students,
    teachers,
    stats: {
      usersByRole,
      counts: {
        grades: gradesCount,
        classes: classesCount,
        subjects: subjectsCount,
        teachers: teachersCount,
        students: studentsCount,
        parents: parentsCount,
        lessons: lessonsCount,
        homeworks: homeworksCount,
        exams: examsCount,
        submissions: submissionsCount,
      },
    },
  });
}
