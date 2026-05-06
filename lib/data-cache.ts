import { cache } from 'react';
import { prisma } from "@/lib/prisma";

export const getAdminStats = cache(async () => {
  return Promise.all([
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
});