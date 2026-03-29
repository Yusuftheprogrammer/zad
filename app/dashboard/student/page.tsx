import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolPieChart } from "@/components/SchoolPieChart";

export default async function StudentDashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      class: { select: { id: true, name: true } },
      grade: { select: { id: true, name: true } },
    },
  });

  if (!student) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Student profile was not found.
      </div>
    );
  }

  const [totalHomeworks, submittedHomeworks, totalExams, attemptedExams, lessonsBySubject] =
    await Promise.all([
      prisma.homework.count({ where: { classId: student.classId } }),
      prisma.submission.count({
        where: {
          studentId: student.id,
          homework: { classId: student.classId },
        },
      }),
      prisma.exam.count({ where: { classId: student.classId } }),
      prisma.examAttempt.count({
        where: {
          studentId: student.id,
          exam: { classId: student.classId },
        },
      }),
      prisma.lesson.groupBy({
        by: ["subjectId"],
        where: { classId: student.classId },
        _count: { _all: true },
      }),
    ]);

  const lessonSubjectIds = lessonsBySubject.map((entry) => entry.subjectId);
  const lessonSubjects = lessonSubjectIds.length
    ? await prisma.subject.findMany({
        where: { id: { in: lessonSubjectIds } },
        select: { id: true, name: true },
      })
    : [];
  const subjectNameById = new Map(lessonSubjects.map((subject) => [subject.id, subject.name]));

  const homeworkData = [
    { label: "Submitted", value: submittedHomeworks },
    { label: "Pending", value: Math.max(totalHomeworks - submittedHomeworks, 0) },
  ];

  const examsData = [
    { label: "Attempted", value: attemptedExams },
    { label: "Pending", value: Math.max(totalExams - attemptedExams, 0) },
  ];

  const lessonsData = lessonsBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "Unknown subject",
    value: entry._count._all,
  }));

  const totalLessons = lessonsData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {student.grade.name} - {student.class.name}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Homeworks</p>
          <p className="mt-1 text-2xl font-semibold">{totalHomeworks}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Exams</p>
          <p className="mt-1 text-2xl font-semibold">{totalExams}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Lessons</p>
          <p className="mt-1 text-2xl font-semibold">{totalLessons}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="Homework Status"
          cardDescription="Your submissions in current class"
          valueLabel="Homeworks"
          data={homeworkData}
        />
        <SchoolPieChart
          cardTitle="Exam Status"
          cardDescription="Your attempted exams in current class"
          valueLabel="Exams"
          data={examsData}
        />
        <SchoolPieChart
          cardTitle="Lessons by Subject"
          cardDescription="Lesson distribution in your class"
          valueLabel="Lessons"
          data={lessonsData}
        />
      </section>
    </div>
  );
}
